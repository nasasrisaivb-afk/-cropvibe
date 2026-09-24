import type { ReactNode } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
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

export function AuthShell({ headline, description, steps, activeStep, children }: AuthShellProps) {
  return (
    <div className="grid min-h-[100dvh] h-full w-full grid-cols-1 bg-[var(--cv-chrome)] md:grid-cols-[46%_54%] lg:min-h-0">
      <aside className="relative hidden flex-col overflow-hidden bg-white p-10 text-[#1a1d2e] md:flex lg:p-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 82% 92%, rgba(91,92,226,0.16), transparent 52%), radial-gradient(ellipse at 8% 8%, rgba(91,92,226,0.10), transparent 40%)',
          }}
        />

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-[12px] text-white shadow-[0_6px_16px_rgba(91,92,226,0.28)]"
              style={{ background: 'linear-gradient(135deg, #7c5cff 0%, #5b5ce2 55%, #a855f7 100%)' }}
            >
              <SparklesIcon className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <p className="cv-logo text-2xl tracking-tight text-[#1a1d2e]">CROPVIBE</p>
              <p className="text-xs font-medium text-[#8b90a7]">Your Field, Your Fortune</p>
            </div>
          </div>
          <h1 className="mt-10 text-4xl font-bold leading-tight tracking-tight text-[#1a1d2e] lg:text-[2.75rem]">
            {headline}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#8b90a7]">{description}</p>
        </div>

        <ol className="relative z-10 mt-auto flex max-w-md flex-col gap-3 pt-16">
          {steps.map((step, index) => {
            const n = index + 1
            const active = n === activeStep
            const done = n < activeStep
            return (
              <li
                key={step.label}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition ${
                  active
                    ? 'bg-[#eef0fe] text-[#5b5ce2]'
                    : 'border border-[rgba(91,92,226,0.1)] bg-[#f4f6fb] text-[#8b90a7]'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    active || done
                      ? 'bg-[#5b5ce2] text-white'
                      : 'bg-white text-[#8b90a7]'
                  }`}
                >
                  {n}
                </span>
                <span className={`text-sm ${active ? 'font-semibold text-[#1a1d2e]' : 'font-medium'}`}>
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>
      </aside>

      <main className="relative flex min-h-[100dvh] items-center justify-center bg-[var(--cv-bg)] px-6 py-10 lg:min-h-0 lg:h-full">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>

        <div className="cv-dashboard-panel w-full max-w-[420px] p-6 sm:p-8">
          <div className="mb-6 md:hidden">
            <p className="cv-logo text-xl">
              Crop<span className="cv-logo-accent">Vibe</span>
            </p>
            <p className="mt-0.5 text-[11px] tracking-[0.08em] text-[var(--cv-muted)]">
              Your field, your fortune
            </p>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
