/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#a855f7",
          "primary-content": "#fff",
          "base-content": "#222740",
          "success-content": "#fff",
        },
      },
    ],
  },
};
