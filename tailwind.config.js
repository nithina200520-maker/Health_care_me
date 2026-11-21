/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          bg: '#07111F',
          secondary: '#0B1728',
          card: '#101F33',
          elevated: '#142842',
          border: 'rgba(0, 212, 255, 0.12)',
          'border-subtle': 'rgba(255, 255, 255, 0.08)',
        },
        accent: {
          cyan: '#00D4FF',
          blue: '#3478F6',
          'cyan-glow': 'rgba(0, 212, 255, 0.25)',
          'blue-glow': 'rgba(52, 120, 246, 0.25)',
        },
        health: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#A9BCD0',
          muted: '#71849A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Kannada', 'Nirmala UI', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 212, 255, 0.3)',
        'glow-cyan-sm': '0 0 12px -2px rgba(0, 212, 255, 0.25)',
        'glow-blue': '0 0 20px -3px rgba(52, 120, 246, 0.3)',
        'card': '0 10px 30px -10px rgba(3, 8, 16, 0.6)',
        'card-elevated': '0 15px 35px -5px rgba(2, 6, 12, 0.8), 0 0 1px 1px rgba(0, 212, 255, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle at 50% 30%, rgba(0, 212, 255, 0.08) 0%, rgba(52, 120, 246, 0.05) 40%, transparent 70%)',
        'card-gradient': 'linear-gradient(180deg, rgba(20, 40, 66, 0.6) 0%, rgba(16, 31, 51, 0.9) 100%)',
        'cyan-blue-gradient': 'linear-gradient(135deg, #00D4FF 0%, #3478F6 100%)',
      },
      animation: {
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
