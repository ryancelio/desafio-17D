/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-pastel": "#FCC3D2", // Rosa
        "secondary-pastel": "#A8F3DC", // Menta
        "pastel-bg": "#F9F9F9", // Um fundo neutro e suave
        "text-dark": "#333333",
        "text-light": "#555555",
      },
    },
  },
  plugins: [
    // Recomendado para estilização de formulários
    require("@tailwindcss/forms"),
  ],
};
