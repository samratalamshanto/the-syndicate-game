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
        display: ['"Cinzel"', 'Inter', 'system-ui', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#faf6ec',
        surface: '#ffffff',
        ink: '#1a2332',
        muted: '#5a6473',
        brass: '#b8821e',
        alert: '#c93838',
        success: '#2a7f5a',
        border: '#e6deca',
        paper: '#faf6ec',
        night: '#1a2332',
        parchment: '#faf6ec',
        ember: '#c93838',
        jade: '#2a7f5a',
        felt: '#e6deca',
        feltDeep: '#d6c8a0',
        feltLight: '#f0e6d0',
        brassDeep: '#8c6315',
        smoke: '#5a6473',
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
          '0%, 100%': { opacity: '0.65', transform: 'translateX(0) scale(1)' },
          '50%': { opacity: '1', transform: 'translateX(2%) scale(1.03)' },
        },
      },
      animation: {
        pulseGold: 'pulseGold 1.6s ease-out infinite',
        pulseRed: 'pulseRed 1.2s ease-out infinite',
        floatSlow: 'floatSlow 3.4s ease-in-out infinite',
        cardDeal: 'cardDeal 420ms cubic-bezier(0.2, 0.7, 0.2, 1.1) both',
        flipReveal: 'flipReveal 520ms cubic-bezier(0.4, 0, 0.2, 1) both',
        coinPop: 'coinPop 700ms ease-out both',
        shimmerGold: 'shimmerGold 4s linear infinite',
        spotlightSweep: 'spotlightSweep 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
