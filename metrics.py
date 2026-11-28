"""Privacy-minimised event storage for the preview; no diary content."""
import os, uuid
EVENTS={'active','record_started','record_saved','transcribe_started','transcribe_succeeded','transcribe_failed','feedback'}
FEEDBACK={'smooth','average','difficulty'}
def uid(value):
    if not isinstance(value,str):raise ValueError('invalid identifier')
    try:return str(uuid.UUID(value,version=4))
    except (ValueError,AttributeError):raise ValueError('invalid identifier')
def validate(data):
    if not isinstance(data,dict) or set(data)-{'event_id','visitor_id','attempt_id','event','feedback'}:raise ValueError('invalid fields')
    out={k:uid(data.get(k)) for k in ('event_id','visitor_id','attempt_id')}
    event=data.get('event');rating=data.get('feedback')
    if event not in EVENTS or (event=='feedback' and rating not in FEEDBACK) or (event!='feedback' and rating is not None):raise ValueError('invalid event')
    out.update(event=event,feedback=rating);return out

def connect():
    import psycopg
    url=os.environ.get('METRICS_DATABASE_URL','')
    if not url:raise RuntimeError('metrics unavailable')
    return psycopg.connect(url,connect_timeout=5)

def initialize(conn):
    conn.execute('CREATE TABLE IF NOT EXISTS preview_events (event_id UUID PRIMARY KEY, visitor_id UUID NOT NULL, attempt_id UUID NOT NULL, event TEXT NOT NULL, feedback TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())')
    conn.execute('CREATE INDEX IF NOT EXISTS preview_events_visitor ON preview_events(visitor_id)')
    conn.execute('CREATE TABLE IF NOT EXISTS preview_deletions (visitor_id UUID PRIMARY KEY, deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW())')

def put(data):
    v=validate(data)
    with connect() as conn:
        initialize(conn)
        conn.execute('SELECT pg_advisory_xact_lock(hashtextextended(%s,0))',(v['visitor_id'],))
        conn.execute("DELETE FROM preview_events WHERE created_at < NOW() - INTERVAL '30 days'")
        conn.execute("DELETE FROM preview_deletions WHERE deleted_at < NOW() - INTERVAL '30 days'")
        if conn.execute('SELECT 1 FROM preview_deletions WHERE visitor_id=%s',(v['visitor_id'],)).fetchone():return
        conn.execute('INSERT INTO preview_events (event_id,visitor_id,attempt_id,event,feedback) VALUES (%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING',(v['event_id'],v['visitor_id'],v['attempt_id'],v['event'],v['feedback']))

def delete(visitor_id):
    visitor_id=uid(visitor_id)
    with connect() as conn:
        initialize(conn)
        conn.execute('SELECT pg_advisory_xact_lock(hashtextextended(%s,0))',(visitor_id,))
        conn.execute('DELETE FROM preview_events WHERE visitor_id=%s',(visitor_id,))
        conn.execute('INSERT INTO preview_deletions(visitor_id) VALUES (%s) ON CONFLICT(visitor_id) DO UPDATE SET deleted_at=NOW()',(visitor_id,))

def summary():
    with connect() as conn:
        initialize(conn)
        first=conn.execute("WITH a AS (SELECT DISTINCT ON (visitor_id) visitor_id,attempt_id FROM preview_events WHERE event='record_started' AND created_at >= NOW()-INTERVAL '30 days' ORDER BY visitor_id,created_at) SELECT COUNT(*),COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM preview_events e WHERE e.visitor_id=a.visitor_id AND e.attempt_id=a.attempt_id AND e.event='record_saved' AND e.created_at >= NOW()-INTERVAL '30 days')) FROM a").fetchone()
        rows=conn.execute("SELECT event,COALESCE(feedback,''),COUNT(*) FROM preview_events WHERE created_at >= NOW()-INTERVAL '30 days' GROUP BY event,feedback").fetchall()
        counts={};feedback={}
        for event,rating,count in rows:
            if event=='feedback':feedback[rating]=count
            else:counts[event]=count
        cohort=conn.execute("WITH days AS (SELECT DISTINCT visitor_id,(created_at AT TIME ZONE 'Asia/Shanghai')::date AS day FROM preview_events WHERE event='active' AND created_at >= NOW()-INTERVAL '30 days'), firsts AS (SELECT visitor_id,MIN(day) AS first_day FROM days GROUP BY visitor_id), eligible AS (SELECT * FROM firsts WHERE first_day <= (NOW() AT TIME ZONE 'Asia/Shanghai')::date - 7) SELECT (SELECT COUNT(DISTINCT visitor_id) FROM days WHERE day=(NOW() AT TIME ZONE 'Asia/Shanghai')::date),COUNT(*),COUNT(*) FILTER (WHERE EXISTS(SELECT 1 FROM days d WHERE d.visitor_id=e.visitor_id AND d.day BETWEEN e.first_day+1 AND e.first_day+7)) FROM eligible e").fetchone()
        return {'first_started':first[0],'first_saved':first[1], 'transcribe_started':counts.get('transcribe_started',0),'transcribe_succeeded':counts.get('transcribe_succeeded',0),'transcribe_failed':counts.get('transcribe_failed',0),'feedback':feedback,'daily_active_devices':cohort[0],'return_eligible':cohort[1],'returned_7d':cohort[2]}

