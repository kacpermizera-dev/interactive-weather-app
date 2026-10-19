import type { ReactNode } from 'react'
import type { WmoCodeInfo } from '../../utils/wmoCode'

interface GlyphFrameProps {
  className?: string
  children: ReactNode
}

function GlyphFrame({ className, children }: GlyphFrameProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

interface WeatherGlyphProps {
  icon: WmoCodeInfo['icon']
  className?: string
}

export function WeatherGlyph({ icon, className }: WeatherGlyphProps) {
  switch (icon) {
    case 'sun':
      return (
        <GlyphFrame className={className}>
          <circle cx="32" cy="32" r="10" />
          <path d="M32 8v8" />
          <path d="M32 48v8" />
          <path d="M8 32h8" />
          <path d="M48 32h8" />
          <path d="M15 15l6 6" />
          <path d="M43 43l6 6" />
          <path d="M49 15l-6 6" />
          <path d="M21 43l-6 6" />
        </GlyphFrame>
      )

    case 'sun-cloud':
      return (
        <GlyphFrame className={className}>
          <circle cx="21" cy="23" r="6" />
          <path d="M21 10v4" />
          <path d="M10 23h4" />
          <path d="M28 23h4" />
          <path d="M14 16l3 3" />
          <path d="M28 16l-3 3" />
          <path d="M22 45h23a7.5 7.5 0 0 0 0-15h-1.5a10 10 0 0 0-18.9-2.7A8.5 8.5 0 0 0 22 45z" />
        </GlyphFrame>
      )

    case 'cloud':
      return (
        <GlyphFrame className={className}>
          <path d="M14 43h35a9.5 9.5 0 0 0 0-19h-1.6a12 12 0 0 0-22.7-3.1A10.2 10.2 0 0 0 14 43z" />
        </GlyphFrame>
      )

    case 'fog':
      return (
        <GlyphFrame className={className}>
          <path d="M16 27h32" />
          <path d="M11 34h42" />
          <path d="M16 41h32" />
          <path d="M20 48h24" />
        </GlyphFrame>
      )

    case 'drizzle':
      return (
        <GlyphFrame className={className}>
          <path d="M14 36h35a9.5 9.5 0 0 0 0-19h-1.6a12 12 0 0 0-22.7-3.1A10.2 10.2 0 0 0 14 36z" />
          <path d="M24 42v5" />
          <path d="M32 42v5" />
          <path d="M40 42v5" />
        </GlyphFrame>
      )

    case 'rain':
      return (
        <GlyphFrame className={className}>
          <path d="M14 34h35a9.5 9.5 0 0 0 0-19h-1.6a12 12 0 0 0-22.7-3.1A10.2 10.2 0 0 0 14 34z" />
          <path d="M23 39l-2 10" />
          <path d="M32 39l-2 12" />
          <path d="M41 39l-2 10" />
        </GlyphFrame>
      )

    case 'snow':
      return (
        <GlyphFrame className={className}>
          <path d="M14 34h35a9.5 9.5 0 0 0 0-19h-1.6a12 12 0 0 0-22.7-3.1A10.2 10.2 0 0 0 14 34z" />
          <path d="M24 44h6" />
          <path d="M27 41v6" />
          <path d="M34 44h6" />
          <path d="M37 41v6" />
        </GlyphFrame>
      )

    case 'storm':
      return (
        <GlyphFrame className={className}>
          <path d="M14 34h35a9.5 9.5 0 0 0 0-19h-1.6a12 12 0 0 0-22.7-3.1A10.2 10.2 0 0 0 14 34z" />
          <path d="M34 38l-8 12h6l-2 8 10-15h-6l2-5z" />
        </GlyphFrame>
      )

    default:
      return (
        <GlyphFrame className={className}>
          <circle cx="32" cy="32" r="20" />
          <path d="M26 25a6 6 0 1 1 9 5.2c-2 1.2-3 2.4-3 4.8" />
          <circle cx="32" cy="44" r="1.4" />
        </GlyphFrame>
      )
  }
}
