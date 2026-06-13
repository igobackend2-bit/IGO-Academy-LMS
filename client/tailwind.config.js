/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── IGo Academy "Greenhouse" palette ────────────────
        // Legacy token names kept; values remapped to the new theme.
        'igo-green': {
          DEFAULT: '#4FA02E',
          light: '#EDF6E4',
          600: '#7CBF34',
          700: '#3F8A24',
          800: '#2F6B1F',
        },
        // "gold" → leaf/mint accent
        'igo-gold': {
          DEFAULT: '#8DC63F',
          light: '#F3F9E9',
          400: '#B5DB7A',
          600: '#8DC63F',
          700: '#3F8A24',
        },
        // "navy" → forest ink (green-black)
        'igo-navy': {
          DEFAULT: '#16402B',
          light: '#EEF6E7',
          600: '#235C39',
          700: '#16402B',
          800: '#0C2014',
        },
        'igo-error': '#DC2626',
        'igo-success': '#4FA02E',
        'igo-warning': '#D97706',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Manrope', 'sans-serif'],
      },
      boxShadow: {
        'igo-card': '0 2px 10px rgba(13, 38, 25, 0.06)',
        'igo-card-hover': '0 8px 24px rgba(13, 38, 25, 0.12)',
      },
    },
  },
  plugins: [],
};
