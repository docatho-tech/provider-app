/** @type {import('tailwindcss').Config} */

// Kept in step with `src/constants/Colors.ts` by hand — NativeWind reads this
// file at build time and cannot import from TypeScript. Anything added there
// must be added here or the class silently resolves to nothing.
module.exports = {
  content: ["./src/components/**/*.{js,jsx,ts,tsx}", "./src/app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#204BB6',
        primaryText: '#313131',
        primaryTextColor: '#313131',
        secondaryTextColor: '#444444',
        muted: '#989898',
        page: '#F3F3F3',
        cardHeader: '#F7F7F7',
        iconPill: '#E7EDF7',
        surfaceAlt: '#F3F5F9',
        successBg: '#D5EAD8',
        successText: '#3A633B',
        successAction: '#52A831',
        warnBg: '#EDE8DC',
        warnBorder: '#D4B879',
        warnText: '#BB892E',
        danger: '#EA3323',
        alert: '#A5352F',
        tabTrack: '#E9E9E9',
        star: '#F3B13E',
        noticeBg: '#FEFCEC',
        noticeBorder: '#DCD1B7',
        noticeText: '#7A4F21',
        chartBlue: '#204BB6',
        chartGreen: '#509E2D',
        chartOrange: '#E36940',
      },
      borderRadius: {
        'default': '8px',
        'card': '16px',
      },
    },
  },
  plugins: [],
}
