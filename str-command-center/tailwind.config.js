/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warmer, friendlier background palette
        'bg-dark': '#1a1625',
        'bg-surface': '#2a2435',
        'card-dark': '#2a2435',
        'card-hover': '#3d3548',
        'border-dark': '#453d52',
        'border-light': '#5a5167',
        
        // Extended friendly color palette
        'warm': {
          50: '#fef8f0',
          100: '#fdefd9',
          200: '#fbddb3',
          300: '#f8c77d',
          400: '#f5a945',
          500: '#f28c1e',
          600: '#e37214',
          700: '#bd5712',
          800: '#964517',
          900: '#793a16',
        },
        'accent': {
          50: '#f0f4fe',
          100: '#dde6fc',
          200: '#c2d4fa',
          300: '#98b9f6',
          400: '#6794f0',
          500: '#4670ea',
          600: '#3151de',
          700: '#2841cd',
          800: '#2637a6',
          900: '#253383',
        },
        'success': {
          50: '#f0fdf5',
          100: '#dcfce8',
          200: '#bbf7d1',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.005em' }],
        'base': ['1rem', { lineHeight: '1.7', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.65', letterSpacing: '-0.015em' }],
        '2xl': ['1.5rem', { lineHeight: '1.5', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '1.4', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.035em' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
        'glow-warm': '0 0 24px rgba(245, 169, 69, 0.25), 0 0 8px rgba(245, 169, 69, 0.15)',
        'glow-accent': '0 0 24px rgba(70, 112, 234, 0.25), 0 0 8px rgba(70, 112, 234, 0.15)',
        'glow-success': '0 0 24px rgba(34, 197, 94, 0.25), 0 0 8px rgba(34, 197, 94, 0.15)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
