import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@ncdai/react-wheel-picker/style.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";

// --- Rotas Públicas (User) ---

// --- Rotas Protegidas (User) ---
import NotFoundPage from "./routes/NotFoundPage.tsx";

// --- NOVAS ROTAS DE ADMIN ---
import AdminRoutes from "./routes/Separators/AdminRoutes.tsx";
import LoggedUserRoutes from "./routes/Separators/LoggedUserRoutes.tsx";
import PublicRoutes from "./routes/Separators/PublicRoutes.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ========================================================= */}
        {/* ÁREA ADMINISTRATIVA (MySQL Auth)                          */}
        {/* ========================================================= */}
        {AdminRoutes()}

        {/* ========================================================= */}
        {/* ÁREA DO USUÁRIO (Firebase Auth)                           */}
        {/* ========================================================= */}
        <Route
          element={
            <AuthProvider>
              <Outlet />
            </AuthProvider>
          }
        >
          {/* Rotas Públicas */}
          {PublicRoutes()}

          {/* Rotas Protegidas */}
          {LoggedUserRoutes()}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
