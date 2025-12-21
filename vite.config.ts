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
  server: {
    proxy: {
      "/api": {
        target: "https://dealory.io", // O domínio base
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
