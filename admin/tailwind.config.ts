import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          lime: '#CCFF00',
          limeSoft: '#E8FF4D',
          limeAlt: '#B8E600',
        },
        bg: {
          base: '#1A1A1A',
          surface: '#242424',
          surfaceAlt: '#2E2E2E',
          surfaceHover: '#2E2E2E',
          disabled: '#1A1A1A',
        },
        text: {
          primary: '#F5F5F3',
          secondary: '#A0A0A0',
          muted: '#6B6B6B',
          inverse: '#1A1A1A',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          default: 'rgba(255,255,255,0.08)',
          light: 'rgba(255,255,255,0.06)',
          focus: '#CCFF00',
        },
        status: {
          success: '#4ADE80',
          warning: '#FBBF24',
          error: '#F87171',
          info: '#3B82F6',
          pending: '#A78BFA',
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
