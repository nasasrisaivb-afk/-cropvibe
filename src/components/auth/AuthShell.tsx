import type { CSSProperties, ReactNode } from 'react'
import { ThemeToggle } from '../common/ThemeToggle'

export interface AuthStep {
  label: string
}

interface AuthShellProps {
  /** Left-panel headline */
  headline: string
  /** Left-panel supporting line */
  description: string
  steps: AuthStep[]
  /** 1-based active step index */
  activeStep: number
  children: ReactNode
}

/** Auth always uses CropVibe dark + lime brand tokens */
const panelVars = {
  '--cv-bg': 'var(--cv-nav-active-bg)',
  '--cv-surface': '#111111',
  '--cv-elevated': '#1a1a1a',
  '--cv-text': '#ffffff',
  '--cv-muted': '#9ca3af',
  '--cv-border': 'rgba(255,255,255,0.12)',
  '--cv-btn-bg': '#ffffff',
  '--cv-btn-text': 'var(--cv-nav-active-bg)',
  '--cv-primary': 'var(--cv-nav-active-fg)',
  '--cv-primary-soft': 'color-mix(in srgb, var(--cv-nav-active-fg) 14%, transparent)',
  '--cv-primary-strong': '#b8e600',
  '--color-accent': '#ffffff',
  '--color-accent-muted': 'rgba(255,255,255,0.12)',
  '--color-on-accent': 'var(--cv-nav-active-bg)',
} as CSSProperties

export function AuthShell({ headline, description, steps, activeStep, children }: AuthShellProps) {
  return (
    <div className="grid min-h-[100dvh] w-full grid-cols-1 md:grid-cols-[46%_54%]">
      <aside className="relative hidden flex-col overflow-hidden bg-[var(--cv-nav-active-bg)] p-10 text-white md:flex lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 78% 88%, color-mix(in srgb, var(--cv-nav-active-fg) 22%, transparent), transparent 55%), radial-gradient(ellipse at 15% 10%, color-mix(in srgb, var(--cv-nav-active-fg) 8%, transparent), transparent 42%)',
          }}
        />

        <div className="relative z-10 max-w-md">
          <p className="cv-logo text-2xl tracking-tight text-[var(--cv-nav-active-fg)]">CROPVIBE</p>
          <p className="mt-1 text-xs font-medium tracking-[0.08em] text-white/80">
            Your Field, Your Fortune
          </p>
          <h1 className="mt-10 text-4xl font-semibold leading-tight tracking-tight text-white lg:text-[2.75rem]">
            {headline}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/70">{description}</p>
        </div>

        <ol className="relative z-10 mt-auto flex max-w-md flex-col gap-3 pt-16">
          {steps.map((step, index) => {
            const n = index + 1
            const active = n === activeStep
            return (
              <li
                key={step.label}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition ${
                  active
                    ? 'bg-[var(--cv-nav-active-fg)] text-[var(--cv-nav-active-bg)] shadow-[0_0_24px_color-mix(in_srgb,var(--cv-nav-active-fg)_18%,transparent)]'
                    : 'border border-white/10 bg-white/[0.04] text-white/80 backdrop-blur-sm'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    active
                      ? 'bg-[var(--cv-nav-active-bg)] text-[var(--cv-nav-active-fg)]'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {n}
                </span>
                <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{step.label}</span>
              </li>
            )
          })}
        </ol>
      </aside>

      <main
        className="relative flex min-h-[100dvh] items-center justify-center bg-[var(--cv-nav-active-bg)] px-6 py-10"
        style={panelVars}
      >
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[420px]">
          <div className="mb-8 md:hidden">
            <p className="cv-logo text-xl text-[var(--cv-nav-active-fg)]">CROPVIBE</p>
            <p className="mt-0.5 text-[11px] tracking-[0.08em] text-white/75">Your Field, Your Fortune</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
