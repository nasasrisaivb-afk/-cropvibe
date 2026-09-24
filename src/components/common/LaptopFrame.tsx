import type { ReactNode } from 'react'

/** Desktop-only MacBook chrome so the product reads as an Apple laptop mockup. */
export function LaptopFrame({ children }: { children: ReactNode }) {
  return (
    <div className="cv-studio">
      <div className="cv-laptop">
        <div className="cv-laptop-lid">
          <span className="cv-laptop-camera" aria-hidden />
          <div className="cv-laptop-screen">{children}</div>
        </div>
        <div className="cv-laptop-base" aria-hidden>
          <span className="cv-laptop-hinge" />
        </div>
      </div>
    </div>
  )
}
