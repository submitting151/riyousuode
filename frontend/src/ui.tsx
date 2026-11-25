import type { ReactNode } from 'react'
import { moodOf } from './data'

type IconName =
  | 'mic' | 'sun' | 'book' | 'chart' | 'spark' | 'sliders' | 'left' | 'right'
  | 'x' | 'pen' | 'check' | 'lock' | 'pause' | 'play' | 'plus' | 'bell' | 'shield' | 'download'

const paths: Record<IconName, ReactNode> = {
  mic: (<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>),
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>),
  book: (<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4zM5 17a3 3 0 0 1 3-3h11" />),
  chart: (<path d="M4 19V5M4 19h16M8 15l4-5 3 3 4-6" />),
  spark: (<path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18" />),
  sliders: (<><path d="M4 7h9M19 7h1M4 17h1M11 17h9" /><circle cx="16" cy="7" r="2.2" /><circle cx="8" cy="17" r="2.2" /></>),
  left: <path d="m14 6-6 6 6 6" />,
  right: <path d="m10 6 6 6-6 6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  pen: <path d="m4 20 4-1 11-11-3-3L5 16l-1 4zM14 7l3 3" />,
  check: <path d="m5 12 5 5 9-10" />,
  lock: (<><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
  pause: <path d="M9 6v12M15 6v12" />,
  play: <path d="M8 5.5v13l10-6.5z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  bell: <path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4" />,
  shield: <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />,
  download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
}

export function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {paths[name]}
    </svg>
  )
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative size-6 overflow-hidden rounded-full bg-linear-to-br from-[#f4c36e] via-[#f08a9d] to-plum">
        <span className="absolute inset-x-0 top-0 h-1/2 bg-paper/55" />
      </span>
      <span className="font-serif text-xl font-semibold tracking-wide text-plum-deep">日有所得</span>
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-[0_10px_40px_-18px_rgba(111,86,121,0.3)] backdrop-blur ${className}`}>
      {children}
    </section>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-medium tracking-[0.18em] text-[#b0667c]">{children}</p>
}

export function PageTitle({ eyebrow, title, hint }: { eyebrow: string; title: string; hint?: string }) {
  return (
    <header className="mb-6 animate-rise">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">{title}</h1>
      {hint && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{hint}</p>}
    </header>
  )
}

export function MoodChip({ score }: { score: number | null }) {
  const m = moodOf(score)
  if (!m) return null
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-ink" style={{ background: m.color + '40' }}>
      <span className="size-2 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-plum-soft/70 px-2.5 py-1 text-xs text-plum">#{children}</span>
}

export function Button({
  children, onClick, variant = 'primary', className = '', disabled,
}: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'soft' | 'ghost' | 'danger'; className?: string; disabled?: boolean }) {
  const styles = {
    primary: 'bg-plum text-white shadow-[0_8px_20px_-8px_rgba(111,86,121,0.7)] hover:bg-plum-deep',
    soft: 'bg-plum-soft text-plum hover:bg-[#e8d8e8]',
    ghost: 'text-ink-soft hover:bg-white/70',
    danger: 'bg-[#fbe9e6] text-[#a4483c] hover:bg-[#f7dcd7]',
  }[variant]
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-40 ${styles} ${className}`}>
      {children}
    </button>
  )
}
