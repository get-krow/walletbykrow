/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        krow: {
          purple: "#5B13EC",
          "purple-hover": "#4C0FD0",
          "purple-light": "#7C3AED",
          "purple-tint": "#F5F0FF",
          dark: "#0F172A",
          muted: "#64748B",
          cardBg: "#FFFFFF",
          bgLight: "#F8FAFC",
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'liquid-glass': '0 20px 40px -15px rgba(91, 19, 236, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.6) inset, 0 10px 25px -5px rgba(0, 0, 0, 0.08)',
        'card-glow': '0 8px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 12px 35px rgba(91, 19, 236, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'scan-modal': '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
