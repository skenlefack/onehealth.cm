import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs du Cameroun
        'cameroon-green': '#007A33',
        'cameroon-red': '#CE1126',
        'cameroon-yellow': '#FCD116',
        // Couleurs One Health
        'oh-blue': '#2196F3',
        'oh-green': '#4CAF50',
        'oh-orange': '#FF9800',
        'oh-teal': '#009688',
        'oh-purple': '#9B59B6',
        'oh-ohwr': '#8B9A2D',
        // Couleurs UI
        'oh-background': '#F5F7FA',
        'oh-dark': '#263238',
        'oh-dark-gray': '#37474F',
        'oh-gray': '#607D8B',
        'oh-light-blue': '#E3F2FD',
        'oh-light-green': '#E8F5E9',
        'oh-light-orange': '#FFF3E0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'shine': 'shine 4s ease-in-out infinite',
        'banner-shine': 'bannerShine 5s ease-in-out infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        },
        bannerShine: {
          '0%': { left: '-50%' },
          '100%': { left: '150%' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #2196F3 0%, #00BCD4 40%, #4CAF50 100%)',
        'cameroon-gradient': 'linear-gradient(90deg, #007A33 0%, #007A33 28%, #CE1126 33%, #CE1126 67%, #FCD116 72%, #FCD116 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
