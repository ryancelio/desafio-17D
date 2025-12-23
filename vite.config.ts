import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate", // Atualiza o app automaticamente quando há nova versão
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "PowerSlim",
        short_name: "PowerSlim",
        description: "Acompanhamento de treinos e dietas.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone", // Remove a barra de URL do navegador
        icons: [
          {
            src: "icon_small.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon_big.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separa o React e ReactDOM
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom")
          ) {
            return "react-vendor";
          }
          // Separa o Firebase (costuma ser pesado)
          if (id.includes("node_modules/firebase")) {
            return "firebase-vendor";
          }
          // Separa o Framer Motion
          if (id.includes("node_modules/framer-motion")) {
            return "framer-motion-vendor";
          }
          // Separa bibliotecas de ícones e UI
          if (
            id.includes("node_modules/lucide-react") ||
            id.includes("node_modules/react-icons")
          ) {
            return "icons-vendor";
          }
          // Separa o Mercado Pago
          if (id.includes("node_modules/@mercadopago")) {
            return "mercadopago-vendor";
          }
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://powerslim.pro", // O domínio base
        changeOrigin: true,
        secure: false, // Às vezes necessário se o SSL local for auto-assinado
        // A regra abaixo diz: "Se chegar /api/teste, mande para https://dealory.io/api/teste"
        // Se a pasta no servidor for diferente (ex: 'php_api'), mude o replacement.
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
    allowedHosts: true,
  },
});
