/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.jsx', './src/**/*.js', './src/**/*.ts', './src/**/*.tsx', './public/**/*.html'],
  theme: {
    extend: {
      fontFamily: {
        'logo': ['Dela Gothic One', 'system-ui', '-apple-system', 'sans-serif']
      },
    },
  },
  plugins: [],
}

