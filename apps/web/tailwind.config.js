/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#43A047',
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        sidebar: {
          bg: '#1E2720',
          active: '#141A16',
        },
        green: {
          light: '#E8F5E9',
          DEFAULT: '#43A047',
          dark: '#2E7D32',
          badge: '#C8E6C9',
        },
        accent: '#FF8F00',
        gold: '#FAC847',
        yellow: {
          soft: '#FFF8E1',
          bright: '#FFF176',
        },
        container: '#E8F5E9',
        card: {
          green: '#E8F5E9',
          yellow: '#FFF8C8',
          light: '#F1F8E9',
        },
        appbg: '#F8FBF0',
      },
      fontFamily: {
        urbanist: ['Urbanist', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
