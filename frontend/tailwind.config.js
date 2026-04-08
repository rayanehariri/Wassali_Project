module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0b1929',
          800: '#0e2035',
          700: '#0f2236',
          600: '#162a40',
        },
        blue: {
          450: '#60a5fa',  // your --blue-light
        }
      },
      fontFamily: {
        dm: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        modalIn:  { from: { opacity: 0, transform: 'scale(0.94) translateY(16px)' }, to: { opacity: 1, transform: 'scale(1) translateY(0)' } },
        dotPulse: { '0%,100%': { transform: 'scale(1)', opacity: 1 }, '50%': { transform: 'scale(1.4)', opacity: 0.6 } },
        spin:     { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-in':  'fadeIn .3s ease both',
        'slide-up': 'slideUp .4s ease both',
        'modal-in': 'modalIn .25s ease',
        'dot-pulse':'dotPulse 2s infinite',
        'spin':     'spin .7s linear infinite',
      },
    },
  },
  plugins: [],
};