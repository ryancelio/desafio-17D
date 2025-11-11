import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";

// --- Rotas Públicas ---
import UserCreationRoute from "./routes/UserCreationRoute.tsx";
import LoginPage2 from "./routes/LoginPage2.tsx";
import SignUpPage from "./routes/SignUpPage.tsx";

// --- Rotas Protegidas ---
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import Dashboard from "./routes/protected/dashboard/Dashboard.tsx";
import OnboardingLayout from "./routes/onboarding/OnboardingLayout.tsx";
import OnboardingProvider from "./context/OnboardingContext.tsx";
import Step1_Profile from "./routes/onboarding/steps/Step1_Profile.tsx";
import Step2_Goals from "./routes/onboarding/steps/Step2_Goals.tsx";
import Step3_Measurements from "./routes/onboarding/steps/Step3_Measurements.tsx";
import Step4_Preferences from "./routes/onboarding/steps/Step4_Preferences.tsx";
import Step5_Complete from "./routes/onboarding/steps/Step5_Complete.tsx";
import AppLayout from "./routes/protected/AppLayout.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* === Rotas Públicas === */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <UserCreationRoute>
                <LoginPage2 />
              </UserCreationRoute>
            }
          />
          <Route
            path="/register"
            element={
              <UserCreationRoute>
                <SignUpPage />
              </UserCreationRoute>
            }
          />

          {/* === Rota Protegida Principal (App) === */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exercicios" element={<div>Exercicios</div>} />
            <Route path="/receitas" element={<div>Receitas</div>} />
            <Route path="/perfil" element={<div>Perfil</div>} />
          </Route>

          {/* === Rota Protegida (Onboarding) === */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingProvider>
                  <OnboardingLayout />
                </OnboardingProvider>
              </ProtectedRoute>
            }
          >
            {/* Redireciona /onboarding para a primeira etapa */}
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Step1_Profile />} />
            <Route path="goals" element={<Step2_Goals />} />
            <Route path="measurements" element={<Step3_Measurements />} />
            <Route path="preferences" element={<Step4_Preferences />} />
            <Route path="complete" element={<Step5_Complete />} />
          </Route>
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
