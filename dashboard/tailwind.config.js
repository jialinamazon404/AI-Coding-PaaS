/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vue: {
          dark: '#0f0f23',
          darker: '#0a0a1a',
          card: '#1e1e3f',
          border: '#2a2a4a',
          primary: '#42b883',
          secondary: '#35495e',
          accent: '#3ac7a9',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        apple: {
          gray: '#F5F5F7',
          white: '#FFFFFF',
          black: '#1D1D1F',
          blue: '#007AFF',
          light: '#F5F5F7',
          subtle: '#86868B',
        }
      },
      borderRadius: {
        'apple': '16px',
        'apple-lg': '20px',
        'apple-sm': '12px',
        'vue': '12px',
      },
      boxShadow: {
        'apple': '0 2px 12px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 4px 24px rgba(0, 0, 0, 0.12)',
        'vue-glow': '0 0 20px rgba(66, 184, 131, 0.3)',
        'vue-card': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'vue-gradient': 'linear-gradient(135deg, #42b883 0%, #35495e 100%)',
        'vue-gradient-light': 'linear-gradient(135deg, rgba(66, 184, 131, 0.1) 0%, rgba(53, 73, 94, 0.1) 100%)',
      }
    },
  },
  plugins: [],
}