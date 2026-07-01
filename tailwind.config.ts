import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#08111F',
        muted: '#6B7280',
        shell: '#F7F8FB',
        navy: '#101E33',
      },
      boxShadow: {
        soft: '0 18px 55px rgba(18, 30, 48, 0.10)',
        card: '0 14px 42px rgba(20, 31, 48, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
