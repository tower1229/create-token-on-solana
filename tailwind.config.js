/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#2176ff",
          "primary-content": "#fff",
          "base-content": "#222740",
          "success-content": "#fff",
        },
        night: {
          ...require("daisyui/src/theming/themes")["night"],
          primary: "rgba(33, 69, 161,1)",
        },
      },
    ],
  },
  theme: {
    extend: {
      // ... other extensions ...
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(100px)", zIndex: "0" },
          "100%": { opacity: "1", transform: "translateY(0)", zIndex: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1", transform: "translateY(0)", zIndex: "1" },
          "100%": { opacity: "0", transform: "translateY(100px)", zIndex: "0" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        fadeOut: "fadeOut 0.3s ease-out",
      },
    },
  },
};
