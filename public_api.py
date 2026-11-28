"""Public preview API; no diary data is stored by this service."""
import asyncio, base64, hmac, json, os, re, time
from collections import defaultdict, deque
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import websockets
import server
import metrics

app=FastAPI(docs_url=None,redoc_url=None,openapi_url=None)
origin=os.environ.get('FRONTEND_ORIGIN','').rstrip('/')
if origin:
    app.add_middleware(CORSMiddleware, allow_origins=[origin], allow_methods=['GET','POST'], allow_headers=['Content-Type','X-Preview-Code','X-Metrics-Admin'])
RATE=defaultdict(deque)
GLOBAL_RATE=deque()
METRICS_RATE=defaultdict(deque)

def permitted(code):
    expected=os.environ.get('PREVIEW_ACCESS_CODE','')
    return len(expected)>=16 and isinstance(code,str) and hmac.compare_digest(code,expected)

def limit(host):
    now=time.monotonic();q=RATE[host]
    while q and now-q[0]>60:q.popleft()
    while GLOBAL_RATE and now-GLOBAL_RATE[0]>3600:GLOBAL_RATE.popleft()
    if len(q)>=10 or len(GLOBAL_RATE)>=60:return False
    q.append(now);GLOBAL_RATE.append(now)
    return True

def metrics_limit(host):
    now=time.monotonic();q=METRICS_RATE[host]
    while q and now-q[0]>60:q.popleft()
    if len(q)>=120:return False
    q.append(now);return True

@app.get('/health')
def health():return {'ok':True}

@app.post('/metrics/event')
async def metrics_event(request:Request):
    if not origin or request.headers.get('origin')!=origin:return JSONResponse({'ok':False},403)
    if not metrics_limit(request.client.host):return JSONResponse({'ok':False},429)
    try:
        chunks=[];size=0
        async for chunk in request.stream():
            size+=len(chunk)
            if size>2048:raise ValueError('too long')
            chunks.append(chunk)
        data=json.loads(b''.join(chunks))
        await asyncio.to_thread(metrics.put,data)
        return {'ok':True}
    except (ValueError,TypeError):return JSONResponse({'ok':False},400)
    except Exception:return JSONResponse({'ok':False},503)

@app.post('/metrics/delete')
async def metrics_delete(request:Request):
    if not origin or request.headers.get('origin')!=origin:return JSONResponse({'ok':False},403)
    if not metrics_limit(request.client.host):return JSONResponse({'ok':False},429)
    try:
        if int(request.headers.get('content-length','0'))>256:return JSONResponse({'ok':False},413)
        chunks=[];size=0
        async for chunk in request.stream():
            size+=len(chunk)
            if size>256:return JSONResponse({'ok':False},413)
            chunks.append(chunk)
        data=json.loads(b''.join(chunks))
        if not isinstance(data,dict) or set(data)!={'visitor_id'}:raise ValueError('invalid')
        await asyncio.to_thread(metrics.delete,data['visitor_id']);return {'ok':True}
    except (ValueError,TypeError):return JSONResponse({'ok':False},400)
    except Exception:return JSONResponse({'ok':False},503)

@app.post('/metrics/summary')
async def metrics_summary(request:Request):
    expected=os.environ.get('METRICS_ADMIN_TOKEN',''); supplied=request.headers.get('x-metrics-admin','')
    if not origin or request.headers.get('origin')!=origin or len(expected)<24 or not hmac.compare_digest(expected,supplied):return JSONResponse({'ok':False},403)
    if not limit(request.client.host):return JSONResponse({'ok':False},429)
    try:return {'ok':True,'data':await asyncio.to_thread(metrics.summary)}
    except Exception:return JSONResponse({'ok':False},503)

@app.post('/api/{kind}')
async def api(kind:str, request:Request):
    if not origin or request.headers.get('origin')!=origin:return JSONResponse({'ok':False,'error':'请求来源不被允许'},403)
    if not permitted(request.headers.get('x-preview-code')):return JSONResponse({'ok':False,'error':'体验码错误，请刷新页面重试'},403)
    if not limit(request.client.host):return JSONResponse({'ok':False,'error':'请求过于频繁，请稍后再试'},429)
    if kind not in ('ai','review'):return JSONResponse({'ok':False,'error':'此功能暂不可用'},404)
    try:
        if int(request.headers.get('content-length','0'))>100000:raise ValueError('请求过长')
        chunks=[];size=0
        async for chunk in request.stream():
            size+=len(chunk)
            if size>100000:raise ValueError('请求过长')
            chunks.append(chunk)
        raw=b''.join(chunks)
        d=json.loads(raw)
        if not isinstance(d,dict):raise ValueError('请求格式不正确')
        if kind=='review':result=await asyncio.to_thread(server.weekly_review,d.get('entries'))
        else:
            text=d.get('text','')
            if not isinstance(text,str) or not text.strip() or len(text)>30000:raise ValueError('记录为空或过长')
            result=await asyncio.to_thread(server.conversation_reply,text,d.get('turns',[]),d.get('memories')) if d.get('kind')=='chat' else await asyncio.to_thread(server.generate,d.get('kind'),text,str(d.get('question','')),str(d.get('answer','')),d.get('memories') if d.get('kind')=='listen' else None)
        return {'ok':True,'data':result}
    except ValueError as e:return JSONResponse({'ok':False,'error':str(e)},400)
    except Exception:return JSONResponse({'ok':False,'error':'服务连接失败，请稍后重试'},502)

@app.websocket('/realtime')
async def realtime(ws:WebSocket):
    if not origin or ws.headers.get('origin')!=origin or not limit(ws.client.host):
        await ws.close(code=1008);return
    await ws.accept()
    try:
        code=await asyncio.wait_for(ws.receive_text(),timeout=10)
        if not permitted(code):await ws.close(code=1008);return
        workspace=os.environ.get('ALIYUN_WORKSPACE_ID','');api_key=os.environ.get('ALIYUN_API_KEY','')
        if not re.fullmatch(r'[A-Za-z0-9_-]+',workspace) or not api_key:raise ValueError('语音服务未配置')
        url='wss://'+workspace+'.cn-beijing.maas.aliyuncs.com/api-ws/v1/realtime?model=qwen3-asr-flash-realtime'
        async with websockets.connect(url,additional_headers={'Authorization':'Bearer '+api_key,'OpenAI-Beta':'realtime=v1'},open_timeout=15,max_size=1024*1024) as remote:
            await remote.send(json.dumps({'event_id':'setup','type':'session.update','session':{'input_audio_format':'pcm','sample_rate':16000,'turn_detection':{'type':'server_vad','threshold':0.2,'silence_duration_ms':800}}}))
            await ws.send_json({'type':'ready'})
            async def up():
                end=time.monotonic()+135;total=0
                while time.monotonic()<end:
                    msg=await asyncio.wait_for(ws.receive(),timeout=max(1,end-time.monotonic()))
                    if msg['type']=='websocket.disconnect':return
                    if msg.get('bytes') is not None:
                        audio=msg['bytes'];total+=len(audio)
                        if len(audio)>65536 or total>16000*2*125:return
                        await remote.send(json.dumps({'event_id':'audio','type':'input_audio_buffer.append','audio':base64.b64encode(audio).decode('ascii')}))
                    elif msg.get('text')=='finish':
                        await remote.send(json.dumps({'event_id':'end','type':'session.finish'}));return
            async def down():
                async for message in remote:
                    event=json.loads(message); t=event.get('type','')
                    if t in ('conversation.item.input_audio_transcription.text','conversation.item.input_audio_transcription.completed','session.finished','error'):
                        await ws.send_json({k:event.get(k) for k in ('type','item_id','text','stash','transcript') if k in event})
                        if t in ('session.finished','error'):return
            a=asyncio.create_task(up());b=asyncio.create_task(down())
            done,_=await asyncio.wait([a,b],return_when=asyncio.FIRST_COMPLETED)
            if a in done and not b.done():
                try:await asyncio.wait_for(b,timeout=20)
                except Exception:pass
            for task in (a,b):
                if not task.done():task.cancel()
    except (Exception,WebSocketDisconnect):
        try:await ws.send_json({'type':'error'})
        except Exception:pass
    finally:
        try:await ws.close()
        except Exception:pass

