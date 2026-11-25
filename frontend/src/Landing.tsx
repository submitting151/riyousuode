import { useState } from 'react'
import type { ReactNode } from 'react'
import { MOODS } from './data'
import { Button, Eyebrow, Icon, Logo } from './ui'

function LoginModal({ onClose, onEnter }: { onClose: () => void; onEnter: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const input = 'w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none placeholder:text-ink-faint focus:border-plum/50'
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-5 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); if (!sent) setSent(true); else onEnter() }}
        className="w-full max-w-sm animate-rise rounded-[32px] bg-paper p-8 shadow-2xl"
      >
        <Logo />
        <h2 className="mt-6 font-serif text-2xl font-semibold">{sent ? '查收验证码' : '用邮箱开始'}</h2>
        <p className="mt-1 text-sm leading-6 text-ink-soft">
          {sent ? `我们给 ${email} 发了一个 6 位验证码。` : '新老用户都一样：输入邮箱，收到验证码就能进入，不用记密码。'}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {sent ? (
            <input inputMode="numeric" maxLength={6} required autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="6 位验证码" className={`${input} text-center text-lg tracking-[0.5em]`} />
          ) : (
            <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={input} />
          )}
        </div>
        <Button className="mt-5 w-full py-3.5">{sent ? '进入日记' : '发送验证码'}</Button>
        {sent ? (
          <button type="button" onClick={() => { setSent(false); setCode('') }} className="mt-3 w-full text-center text-xs text-ink-soft hover:text-plum">换一个邮箱</button>
        ) : (
          <button type="button" onClick={onEnter} className="mt-3 w-full text-center text-xs text-ink-soft hover:text-plum">先随便看看，不登录</button>
        )}
      </form>
    </div>
  )
}

function Section({ id, children, className = '' }: { id?: string; children: ReactNode; className?: string }) {
  return <section id={id} className={`mx-auto max-w-6xl scroll-mt-24 px-6 ${className}`}>{children}</section>
}

function MiniChart() {
  const pts: [number, number][] = [[10, 90], [60, 60], [110, 75], [160, 30], [210, 50], [260, 20], [310, 40]]
  const d = pts.map((p, i) => (i ? `L${p[0]},${p[1]}` : `M${p[0]},${p[1]}`)).join(' ')
  const cols = ['#7fbfd2', '#9fd0a8', '#9fd0a8', '#f4c36e', '#f4c36e', '#f08a9d', '#f4c36e']
  return (
    <svg viewBox="0 0 320 110" className="w-full">
      <defs>
        <linearGradient id="lm" x1="0" x2="1">{cols.map((c, i) => <stop key={i} offset={i / 6} stopColor={c} />)}</linearGradient>
      </defs>
      {[20, 55, 90].map((y) => <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="#f0e3e7" strokeDasharray="3 5" />)}
      <path d={d} fill="none" stroke="url(#lm)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="5" fill={cols[i]} stroke="#fff" strokeWidth="2.5" />)}
    </svg>
  )
}

const steps = [
  { icon: 'mic', title: '说出来', desc: '像和朋友聊天一样，说说今天。语音会实时变成文字，也可以直接打字。', c: '#fde1e5' },
  { icon: 'pen', title: '被问一句', desc: '它会抓住你话里的一个点，轻轻问一句。想答就答，不想答就跳过。', c: '#fcefcf' },
  { icon: 'book', title: '收好今天', desc: '得到一句话和一小段回顾。感受由你来定，随时可以改。', c: '#e4e8f8' },
] as const

function Phone({ children, tint }: { children: ReactNode; tint: string }) {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[56px] opacity-70 blur-xl" style={{ background: tint }} />
      <div className="relative h-[340px] w-[210px] overflow-hidden rounded-[36px] border-[6px] border-white bg-[#fbf3f4] shadow-[0_24px_50px_-20px_rgba(111,86,121,0.55)]">
        <span className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-ink/10" />
        <div className="h-full px-4 pt-8 text-left">{children}</div>
      </div>
    </div>
  )
}

function Screen({ n }: { n: number }) {
  if (n === 0)
    return (
      <>
        <p className="font-serif text-sm font-semibold leading-5">我在听，<br />从最想说的开始。</p>
        <div className="mt-4 flex h-10 items-center justify-center gap-1">
          {Array.from({ length: 17 }).map((_, i) => (
            <span key={i} className="h-full w-1 origin-center animate-wave rounded-full bg-linear-to-b from-[#f08a9d] to-plum" style={{ animationDelay: `${(i % 7) * 0.12}s` }} />
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-white p-3 text-[11px] leading-5 text-ink-soft">今天上午一直在改方案，客户临时又加了需求，有点烦。中午和同事吃了一碗很好吃的面……</div>
        <div className="mt-5 flex justify-center gap-2">
          <span className="rounded-full bg-plum-soft px-3 py-1.5 text-[10px] text-plum">暂停</span>
          <span className="rounded-full bg-plum px-3 py-1.5 text-[10px] text-white">说完了</span>
        </div>
      </>
    )
  if (n === 1)
    return (
      <>
        <p className="text-[9px] tracking-widest text-[#b0667c]">想再问你一句</p>
        <p className="mt-2 font-serif text-sm font-semibold leading-6">你说晚上去河边走了二十分钟，脑子里在想什么吗？</p>
        <p className="mt-2 text-[10px] text-ink-soft">可以不回答，也可以只说一点点。</p>
        <div className="mt-5 flex flex-col gap-2">
          <span className="rounded-full bg-plum-soft px-3 py-2.5 text-center text-[11px] text-plum">再说一点</span>
          <span className="rounded-full bg-plum px-3 py-2.5 text-center text-[11px] text-white">跳过，帮我收好今天</span>
        </div>
      </>
    )
  return (
    <>
      <p className="text-[9px] tracking-widest text-[#b0667c]">今日一页</p>
      <div className="relative mt-2 overflow-hidden rounded-2xl bg-white p-3">
        <span className="absolute -right-6 -top-6 size-20 rounded-full bg-[#f4c36e] opacity-60 blur-2xl" />
        <p className="relative font-serif text-[13px] font-semibold leading-5">被需求追着跑的一天，靠一碗面和一段河边路缓了过来。</p>
        <div className="relative mt-2 flex gap-1">
          {['加班', '同事', '散步'].map((t) => <span key={t} className="rounded-full bg-plum-soft px-2 py-0.5 text-[9px] text-plum">#{t}</span>)}
        </div>
      </div>
      <p className="mt-3 text-[10px] text-ink-soft">这一天，你的感觉更接近？</p>
      <div className="mt-2 grid grid-cols-5 gap-1">
        {MOODS.map((m) => <span key={m.score} className={`mx-auto size-6 rounded-full ${m.score === 4 ? 'ring-2 ring-plum ring-offset-2' : ''}`} style={{ background: m.color }} />)}
      </div>
    </>
  )
}

export function Landing({ onEnter }: { onEnter: () => void }) {


  return (
    <div className="overflow-x-hidden">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden gap-8 text-sm text-ink-soft md:flex" aria-label="页面导航">
            <a href="#how" className="hover:text-plum">怎么用</a>
            <a href="#ask" className="hover:text-plum">追问</a>
            <a href="#review" className="hover:text-plum">回顾</a>
            <a href="#safe" className="hover:text-plum">安全</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onEnter}>登录</Button>
            <Button onClick={onEnter}>开始记录</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <Section className="grid items-center gap-12 pb-20 pt-16 md:grid-cols-2 md:pt-24">
        <div className="animate-rise">
          <Eyebrow>一个安静的日记空间</Eyebrow>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.2] md:text-6xl">
            把今天，<br />说给自己听。
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-ink-soft">
            用语音倾诉这一天，剩下的交给日有所得：轻轻追问、收成一句话，再在时间里陪你看见自己的变化。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button className="px-7 py-3.5 text-base" onClick={onEnter}><Icon name="mic" className="size-4" />说说今天</Button>
            <a href="#how" className="px-4 py-3 text-sm text-ink-soft hover:text-plum">看看怎么用</a>
          </div>
          <p className="mt-6 text-xs text-ink-faint">不催促记录，感受由你自己确认。</p>
        </div>

        <div className="relative mx-auto grid h-[420px] w-full max-w-md place-items-center">
          <div className="absolute inset-4 rounded-[48px] bg-linear-to-br from-[#fdeef0] via-[#fff6f1] to-[#ece8fa]" />
          <div className="absolute -right-4 top-6 size-40 rounded-full bg-[#f6c9a8]/50 blur-3xl" />
          <div className="absolute -left-4 bottom-6 size-40 rounded-full bg-[#c3d6ee]/60 blur-3xl" />
          <div className="relative grid size-40 place-items-center">
            <span className="absolute inset-0 animate-breathe rounded-full bg-[#f08a9d]/50" />
            <span className="absolute inset-6 animate-breathe rounded-full bg-[#f4c36e]/50 [animation-delay:1.2s]" />
            <span className="relative grid size-24 place-items-center rounded-full bg-linear-to-br from-[#8a6a93] to-plum-deep text-white shadow-[0_14px_30px_-8px_rgba(85,64,95,0.7)]">
              <Icon name="mic" className="size-10" />
            </span>
          </div>
          <div className="absolute left-0 top-10 max-w-48 animate-rise rounded-3xl rounded-bl-md bg-white p-4 text-xs leading-6 shadow-[0_12px_30px_-14px_rgba(111,86,121,0.5)]">
            今天一直在改方案，晚上去河边走了二十分钟……
          </div>
          <div className="absolute bottom-8 right-0 max-w-52 animate-rise rounded-3xl bg-white p-4 shadow-[0_12px_30px_-14px_rgba(111,86,121,0.5)] [animation-delay:.2s]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4c36e]/30 px-2 py-0.5 text-[11px]"><i className="size-1.5 rounded-full bg-[#f4c36e]" />轻松</span>
            <p className="mt-2 font-serif text-sm font-semibold leading-6">靠一碗面和一段河边路，缓了过来。</p>
          </div>
        </div>
      </Section>

      {/* Moments strip */}
      <Section className="pb-20 text-center">
        <p className="text-sm text-ink-soft">适合这些时刻</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {['下班路上', '睡前十分钟', '周末午后', '心里很满的时候', '什么都不想写的晚上'].map((t, i) => (
            <span key={t} className="rounded-full bg-white/80 px-5 py-2.5 text-sm shadow-sm" style={{ borderBottom: `3px solid ${MOODS[i].color}` }}>{t}</span>
          ))}
        </div>
      </Section>

      {/* How */}
      <Section id="how" className="pb-24">
        <div className="text-center">
          <Eyebrow>怎么用</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">三步，收好一天</h2>
        </div>
        <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="relative flex flex-col items-center text-center">
              {i < 2 && <span className="absolute left-[calc(50%+9rem)] top-48 hidden w-[calc(100%-18rem+1.5rem)] border-t-2 border-dashed border-plum/25 md:block" />}
              <Phone tint={s.c}><Screen n={i} /></Phone>
              <p className="mt-8 text-xs tracking-widest text-[#b0667c]">STEP 0{i + 1}</p>
              <h3 className="mt-1 font-serif text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 max-w-64 text-sm leading-7 text-ink-soft">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Ask */}
      <Section id="ask" className="grid items-center gap-12 pb-24 md:grid-cols-2">
        <div className="rounded-[40px] bg-linear-to-br from-[#fdeef0] to-[#efe6f6] p-8">
          <div className="max-w-xs rounded-3xl rounded-bl-md bg-white p-5 text-sm leading-7 shadow-sm">你说晚上去河边走了二十分钟，那段时间，脑子里在想什么吗？</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-plum px-4 py-2 text-xs text-white">再说一点</span>
            <span className="rounded-full bg-white/80 px-4 py-2 text-xs text-plum">跳过，帮我收好</span>
          </div>
        </div>
        <div>
          <Eyebrow>会追问的倾听者</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-snug">不急着下结论，<br />先问一句真正相关的。</h2>
          <p className="mt-4 text-sm leading-8 text-ink-soft">它只会针对你说过的某个细节发问，每次最多一个问题，随时可以跳过。想倾诉时多聊一点，累了就直接收好今天。</p>
        </div>
      </Section>

      {/* Review */}
      <Section id="review" className="grid items-center gap-12 pb-24 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <Eyebrow>时间里的你</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-snug">一周、一个月，<br />心情是有颜色的。</h2>
          <p className="mt-4 text-sm leading-8 text-ink-soft">只使用你自己确认的感受。没记录的日子保持空白，不补虚假的连续趋势。也可以整理自己关注的生活主题，回到原文慢慢查看。</p>
        </div>
        <div className="order-1 rounded-[40px] border border-white/80 bg-white/80 p-7 shadow-[0_20px_50px_-24px_rgba(111,86,121,0.4)] md:order-2">
          <p className="mb-3 font-serif text-lg font-semibold">心情的起伏</p>
          <MiniChart />
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
            {MOODS.map((m) => <span key={m.score} className="flex items-center gap-1.5 text-xs text-ink-soft"><i className="size-2.5 rounded-full" style={{ background: m.color }} />{m.label}</span>)}
          </div>
        </div>
      </Section>

      {/* Numbers */}
      <Section className="pb-24">
        <div className="grid gap-px overflow-hidden rounded-[36px] bg-white/60 text-center md:grid-cols-3">
          {[['1 分钟', '说完一天'], ['1 个问题', '最多一次追问'], ['1 句话', '收成今天的样子']].map(([a, b], i) => (
            <div key={a} className="px-6 py-10" style={{ background: ['#fde8ea', '#fcf0d2', '#e6e9f8'][i] }}>
              <p className="font-serif text-3xl font-semibold text-plum-deep">{a}</p>
              <p className="mt-2 text-sm text-ink-soft">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Safe */}
      <Section id="safe" className="pb-24">
        <div className="grid items-center gap-10 rounded-[40px] bg-plum-deep p-10 text-white md:grid-cols-[1fr_auto] md:p-14">
          <div>
            <p className="text-xs tracking-[0.18em] text-white/60">隐私与数据</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-snug">你的记录，由你决定。</h2>
            <p className="mt-4 max-w-md text-sm leading-8 text-white/75">记录存放在本机，可在设置中导出或删除。语音转写和 AI 整理会由相应服务处理。</p>
          </div>
          <div className="flex items-center gap-4 rounded-full bg-white/10 px-8 py-5">
            {[0, 1, 2, 3].map((i) => <span key={i} className={`size-4 rounded-full border-2 border-white/80 ${i < 3 ? 'bg-white' : ''}`} />)}
            <Icon name="lock" className="ml-2 size-5 text-white/80" />
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="pb-24 text-center">
        <h2 className="font-serif text-4xl font-semibold leading-snug">今天，想从哪里说起？</h2>
        <p className="mt-4 text-sm text-ink-soft">哪怕只是一句“今天有点累”，也值得被留下。</p>
        <Button className="mt-8 px-8 py-4 text-base" onClick={onEnter}>开始第一页</Button>
      </Section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-ink-faint">
          <Logo />
          <span>把今天，留给自己。</span>
        </div>
      </footer>

      
    </div>
  )
}
