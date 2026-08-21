import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem' },
      screens: { '2xl': '1200px' },
    },
    extend: {
      colors: {
        // Paleta da marca, as quatro cores fechadas com o cliente.
        porcelana: '#FFFFFF',
        areia: '#DDCCC2',
        cacau: {
          DEFAULT: '#775642',
          // Estado pressionado do botao principal, so um degrau abaixo do cacau.
          escuro: '#5C4133',
        },
        caramelo: {
          DEFAULT: '#966B54',
          // Versao legivel do caramelo sobre fundo escuro. O tom cheio some ali.
          claro: '#E0B48C',
        },
        // Derivados na matiz do cacau, porque a paleta nao traz tom de texto.
        tinta: { DEFAULT: '#2E211A', suave: '#4A362B' },
        neutro: '#78685E',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 6vw, 5.25rem)', { lineHeight: '0.98', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.5rem, 2.5vw, 2.25rem)', { lineHeight: '1.12', letterSpacing: '-0.01em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.18em' }],
      },
      borderRadius: { lg: '0.75rem', md: '0.5rem', sm: '0.375rem' },
      // Mesma curva do fade-up. Sai rapido e desacelera longo, que e o que da a
      // sensacao de peso nos botoes.
      transitionTimingFunction: { suave: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.24s ease-out',
        'accordion-up': 'accordion-up 0.24s ease-out',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
