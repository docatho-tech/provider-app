/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./src/components/**/*.{js,jsx,ts,tsx}", "./src/app/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: {
          primary: '#064CBD',
          primaryText: '#313131',
          // If you want to keep the shade variations, you can also add:
          'primary-extralight': '',
          'primary-light': '',
          'primary-dark': '',
          'primary-darker': '',
          'primary-darkest': ''
        },
        borderRadius: {
          'default': '8px'
        }
      },
    },
    plugins: [],
  }