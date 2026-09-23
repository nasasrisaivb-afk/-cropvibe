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
          lime: '#5B5CE2',
          limeSoft: '#8B8EF0',
          limeAlt: '#4A4FD4',
        },
        bg: {
          base: '#0F172A',
          surface: '#1E293B',
          surfaceAlt: '#334155',
          surfaceHover: '#334155',
          disabled: '#0F172A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#9CA3AF',
          muted: '#6B7280',
          inverse: '#5B5CE2',
        },
        border: {
          DEFAULT: 'rgba(156,163,175,0.22)',
          default: 'rgba(156,163,175,0.22)',
          light: 'rgba(156,163,175,0.14)',
          focus: '#5B5CE2',
        },
        status: {
          success: '#4ADE80',
          warning: '#FBBF24',
          error: '#F87171',
          info: '#38BDF8',
          pending: '#FBBF24',
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
