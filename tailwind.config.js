// tailwind.config.js
import forms from "@tailwindcss/forms";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Verifique se este caminho está correto
  ],
  theme: {
    extend: {
      colors: {
        // <-- Precisa estar em 'colors'
        "pastel-pink": "#FCC3D2",
        "pastel-mint": "#A8F3DC",
      },
      ringColor: {
        // <-- 'ringColor' é o correto para 'focus:ring-'
        "pastel-mint": "#A8F3DC",
        "pastel-pink": "#FCC3D2",
      },
      borderColor: {
        // <-- 'borderColor' é o correto para 'focus:border-'
        "pastel-mint": "#A8F3DC",
        "pastel-pink": "#FCC3D2",
      },
    },
  },
  plugins: [forms],
};
