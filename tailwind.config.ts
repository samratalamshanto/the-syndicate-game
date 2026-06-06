import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '380px',
      },
      fontFamily: {
        display: ['"Cinzel"', '"Space Grotesk"', 'Inter', 'system-ui', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0e1218',
        paper: '#f5efe1',
        parchment: '#ede1c4',
        brass: '#d6a651',
        brassDeep: '#9a6f2c',
        ember: '#d64b3c',
        jade: '#2b8c7e',
        night: '#080b10',
        felt: '#0e3a2f',
        feltDeep: '#072018',
        feltLight: '#1b6a55',
        smoke: '#1a1f26',
      },
      boxShadow: {
        card: '0 22px 60px rgba(8, 11, 16, 0.45)',
        cardSoft: '0 8px 22px rgba(8, 11, 16, 0.35)',
        gold: '0 0 0 1px rgba(214, 166, 81, 0.6), 0 18px 40px rgba(214, 166, 81, 0.25)',
        spotlight: '0 0 0 4px rgba(214, 166, 81, 0.65), 0 0 32px 8px rgba(214, 166, 81, 0.45)',
        innerGold: 'inset 0 0 0 1px rgba(214, 166, 81, 0.4)',
        chipDanger: '0 8px 20px rgba(214, 75, 60, 0.45)',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(214, 166, 81, 0.55), 0 0 24px 4px rgba(214, 166, 81, 0.35)' },
          '50%': { boxShadow: '0 0 0 8px rgba(214, 166, 81, 0.0), 0 0 36px 10px rgba(214, 166, 81, 0.55)' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(214, 75, 60, 0.55)' },
          '50%': { boxShadow: '0 0 0 10px rgba(214, 75, 60, 0.0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        cardDeal: {
          '0%': { transform: 'translateY(-40px) rotate(-6deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
        },
        flipReveal: {
          '0%': { transform: 'rotateY(180deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        coinPop: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-22px) scale(1.15)', opacity: '0' },
        },
        shimmerGold: {
          '0%': { backgroundPosition: '-150% 0' },
          '100%': { backgroundPosition: '250% 0' },
        },
        spotlightSweep: {
          '0%, 100%': { opacity: '0.75' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        pulseGold: 'pulseGold 1.6s ease-out infinite',
        pulseRed: 'pulseRed 1.2s ease-out infinite',
        floatSlow: 'floatSlow 3.4s ease-in-out infinite',
        cardDeal: 'cardDeal 420ms cubic-bezier(0.2, 0.7, 0.2, 1.1) both',
        flipReveal: 'flipReveal 520ms cubic-bezier(0.4, 0, 0.2, 1) both',
        coinPop: 'coinPop 700ms ease-out both',
        shimmerGold: 'shimmerGold 2.4s linear infinite',
        spotlightSweep: 'spotlightSweep 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
