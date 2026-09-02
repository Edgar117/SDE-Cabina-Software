/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.js'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        surface: '#fbf9f4',
        tertiary: '#68594a',
        'on-primary': '#ffffff',
        'outline-variant': '#d0c5b4',
        secondary: '#665d52',
        'on-surface': '#1b1c19',
        'surface-container-highest': '#e4e2dd',
        outline: '#7e7667',
        'on-surface-variant': '#4d4639',
        'primary-container': '#8c712d',
        primary: '#715915',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f5f3ee',
        'surface-container-high': '#eae8e3',
        background: '#fbf9f4',
      },
      spacing: {
        gutter: '16px',
        'margin-mobile': '12px',
        'container-padding': '24px',
        'max-width': '1200px',
      },
      fontFamily: {
        'label-md': ['Manrope', 'sans-serif'],
        'body-md': ['Manrope', 'sans-serif'],
        'headline-lg': ['Playfair Display', 'serif'],
        'label-sm': ['Manrope', 'sans-serif'],
        'headline-xl': ['Playfair Display', 'serif'],
        'headline-lg-mobile': ['Playfair Display', 'serif'],
      },
      fontSize: {
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'headline-xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
