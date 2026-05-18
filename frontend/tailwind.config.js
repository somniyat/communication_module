/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  // Avoid Tailwind's preflight clashing with PrimeReact's own resets.
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
