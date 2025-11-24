import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@ncdai/react-wheel-picker/style.css";
// import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router";

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
import ProfilePage from "./routes/protected/Profile/ProfilePage.tsx";
import RecipesPage from "./routes/protected/Recipes/RecipesPage.tsx";
import ExercisesPage from "./routes/protected/execicios/ExerciciosPage.tsx";
import WorkoutPlansPage from "./routes/protected/treinos/WorkoutPlanPage.tsx";
import LandingPage from "./routes/landing/LandingPage.tsx";
import OnboardingWizard from "./routes/NEW-Onboarding/OnboardingWizard.tsx";
import CreateWorkoutPlanPage from "./routes/protected/treinos/CreateWorkoutPlanPage.tsx";
import WorkoutExecutionPage from "./routes/protected/treinos/WorkoutExecutionPage.tsx";
import WorkoutCompletionPage from "./routes/protected/treinos/WorkoutCompletionPage.tsx";
import MeasurementDetailsPage from "./routes/protected/measurements/MeasurementDetailsPage.tsx";
import AddMeasurementsPage from "./routes/protected/measurements/AddMeasurementsPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* === Rotas Públicas === */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/onboard"
            element={
              <OnboardingProvider>
                <OnboardingWizard />
              </OnboardingProvider>
            }
          />
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
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/exercicios" element={<ExercisesPage />} />
              <Route path="/receitas" element={<RecipesPage />} />
              <Route path="/treinos" element={<WorkoutPlansPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route
                path="/measurements/add"
                element={<AddMeasurementsPage />}
              />
              <Route
                path="/measurements/:id"
                element={<MeasurementDetailsPage />}
              />
            </Route>
            <Route path="/treinos/:id" element={<WorkoutExecutionPage />} />
            <Route
              path="/treinos/concluido/:id"
              element={<WorkoutCompletionPage />}
            />
            <Route path="/treinos/criar" element={<CreateWorkoutPlanPage />} />{" "}
            {/* <-- NOVA ROTA */}
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
