/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff0000',
          hover: '#e60000',
          active: '#cc0000',
          light: '#ff3333',
          dark: '#b30000',
        },
        secondary: {
          DEFAULT: '#4a4a4a',
          light: '#6a6a6a',
          dark: '#2a2a2a',
          lighter: '#8a8a8a',
        },
        background: {
          DEFAULT: '#0a0a0a',
          light: '#151515',
          lighter: '#1c1c1c',
          dark: '#000000',
        },
        text: {
          DEFAULT: '#ffffff',
          secondary: '#e5e5e5',
          muted: '#888888',
          light: '#aaaaaa',
        },
        accent: {
          DEFAULT: '#ff0000',
          hover: '#e60000',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'open-sans': ['Open Sans', 'helvetica neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      spacing: {
        '1': '0.06rem',
        '2': '0.13rem',
        '4': '0.25rem',
        '8': '0.50rem',
      },
      borderRadius: {
        'sm': '3px',
        'DEFAULT': '4px',
        'md': '6px',
      },
    },
  },
  plugins: [],
}

