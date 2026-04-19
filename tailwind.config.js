/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zibara: {
          black:    '#030303',
          deep:     '#0a0806',
          crimson:  '#4E0000',
          blood:    '#640017',
          olive:    '#5A5E27',
          espresso: '#2F1B1A',
          cream:    '#EFEFC9',
          white:    '#F5F5F0',
          gold:     '#C9A96E',
        },
      },
      fontFamily: {
        display:  ['var(--font-cormorant)', 'serif'],
        serif:    ['var(--font-cormorant)', 'serif'],
        mono:     ['var(--font-space-mono)', 'monospace'],
        sans:     ['var(--font-space-mono)', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.3em',
        widest3: '0.5em',
      },
    },
  },
  plugins: [],
}
