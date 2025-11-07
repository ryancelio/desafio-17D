import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";

// --- Rotas Públicas ---
import LoginPage2 from "./routes/LoginPage2.tsx";
import SignUpPage from "./routes/SignUpPage.tsx";

// --- Rotas Protegidas ---
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import Dashboard from "./routes/protected/dashboard/Dashboard.tsx";
// import Step5_Complete from "./routes/onboarding/steps/Step5_Complete.tsx";
// import Step4_Preferences from "./routes/onboarding/steps/Step4_Preferences.tsx";
// import Step1_Profile from "./routes/onboarding/steps/Step1_Profile.tsx";
import OnboardingLayout from "./routes/onboarding/OnboardingLayout.tsx";

const needsOnboarding = true;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* === Rotas Públicas === */}
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage2 />} />
          <Route path="/register" element={<SignUpPage />} />

          {/* === Rota Protegida Principal (App) === */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* === Rota Protegida (Onboarding) === */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                {needsOnboarding ? (
                  <OnboardingLayout />
                ) : (
                  <Navigate to="/dashboard" />
                )}
              </ProtectedRoute>
            }
          >
            {/* Redireciona /onboarding para a primeira etapa */}
            <Route index element={<Navigate to="profile" replace />} />
            {/* <Route path="profile" element={<Step1_Profile />} /> */}
            {/* <Route path="goals" element={<Step2_Goals />} /> */}
            {/* <Route path="measurements" element={<Step3_Measurements />} /> */}
            {/* <Route path="preferences" element={<Step4_Preferences />} /> */}
            {/* <Route path="complete" element={<Step5_Complete />} /> */}
          </Route>
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
