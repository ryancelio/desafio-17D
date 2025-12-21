import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@ncdai/react-wheel-picker/style.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";

// --- Rotas Públicas (User) ---
import UserCreationRoute from "./routes/UserCreationRoute.tsx";
import LoginPage2 from "./routes/LoginPage2.tsx";
import SignUpPage from "./routes/SignUpPage.tsx";

// --- Rotas Protegidas (User) ---
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import Dashboard from "./routes/protected/dashboard/Dashboard.tsx";
import OnboardingProvider from "./context/OnboardingContext.tsx";
import AppLayout from "./routes/protected/AppLayout.tsx";
import ProfilePage from "./routes/protected/Profile/ProfilePage.tsx";
import RecipesPage from "./routes/protected/Recipes/RecipesPage.tsx";
import ExercisesPage from "./routes/protected/execicios/ExerciciosPage.tsx";
import WorkoutPlansPage from "./routes/protected/treinos/WorkoutPlanPage.tsx";
import OnboardingWizard from "./routes/NEW-Onboarding/OnboardingWizard.tsx";
import CreateWorkoutPlanPage from "./routes/protected/treinos/CreateWorkoutPlanPage.tsx";
import WorkoutExecutionPage from "./routes/protected/treinos/WorkoutExecutionPage.tsx";
import WorkoutCompletionPage from "./routes/protected/treinos/WorkoutCompletionPage.tsx";
import MeasurementDetailsPage from "./routes/protected/measurements/MeasurementDetailsPage.tsx";
import AddMeasurementsPage from "./routes/protected/measurements/AddMeasurementsPage.tsx";
import ActiveUserCheckRoute from "./routes/protected/ActiveUserCheckRoute.tsx";
import RootRedirector from "./hooks/UserRedirect.tsx";
import NotFoundPage from "./routes/NotFoundPage.tsx";
import { Sucesso } from "./routes/NEW-Onboarding/Steps/Sucesso.tsx";

// --- NOVAS ROTAS DE ADMIN ---
import { AdminAuthProvider } from "./context/AdminAuthContext.tsx";
import AdminLayout from "./routes/admin/AdminLayout.tsx";
import AdminLoginPage from "./routes/admin/AdminLoginPage.tsx";
import AdminDashboard from "./routes/admin/AdminDashboard.tsx";
import AdminRecipesPage from "./routes/admin/AdminRecipesPage.tsx";
import AdminRecipeEditor from "./routes/admin/AdminRecipeEditor.tsx";
import AdminExercisesPage from "./routes/admin/AdminExercisesPage.tsx";
import AdminExerciseEditor from "./routes/admin/AdminExerciseEditor.tsx";
import EditProfilePage from "./routes/protected/Profile/EditProfilePage.tsx";
import AdminWorkoutRequestsPage from "./routes/admin/AdminWorkoutRequestsPage.tsx";
import RequestWorkoutPage from "./routes/protected/treinos/RequestWorkoutPage.tsx";
import AdminCreateWorkoutPage from "./routes/admin/AdminCreateWorkoutPage.tsx";
import ConsumptionHistoryPage from "./routes/protected/dashboard/consumo/ConsumptionHistoryPage.tsx";
import DietPlansPage from "./routes/protected/Recipes/Diets/DietPlansPage.tsx";
import DietDetailsPage from "./routes/protected/Recipes/Diets/DietsDetailsPage.tsx";
import RequestDietPage from "./routes/protected/Recipes/Diets/RequestDietPage.tsx";
import AdminDietRequestsPage from "./routes/admin/AdminDietRequestPage.tsx";
import AdminCreateDietPage from "./routes/admin/AdminCreateDietPage.tsx";
import ChangePlanPage from "./routes/protected/planos/ChangePlanPage.tsx";
import AdminSalesRecoveryPage from "./routes/admin/AdminSalesRecoveryPage.tsx";
import GerenciarPlanosPage from "./routes/protected/planos/GerenciarPlanosPage.tsx";
import CheckoutPage from "./routes/protected/planos/CheckoutPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ========================================================= */}
        {/* ÁREA ADMINISTRATIVA (MySQL Auth)                          */}
        {/* ========================================================= */}
        <Route
          path="/admin"
          element={
            <AdminAuthProvider>
              <Outlet />
            </AdminAuthProvider>
          }
        >
          <Route path="login" element={<AdminLoginPage />} />

          {/* Rotas Protegidas do Admin */}
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="receitas" element={<AdminRecipesPage />} />
            <Route path="receitas/nova" element={<AdminRecipeEditor />} />
            <Route path="receitas/editar/:id" element={<AdminRecipeEditor />} />
            <Route path="exercicios" element={<AdminExercisesPage />} />
            <Route path="exercicios/novo" element={<AdminExerciseEditor />} />
            <Route
              path="exercicios/editar/:id"
              element={<AdminExerciseEditor />}
            />
            <Route
              path="treinos/pedidos"
              element={<AdminWorkoutRequestsPage />}
            />
            <Route
              path="treinos/pedidos/criar"
              element={<AdminCreateWorkoutPage />}
            />
            <Route path="dietas/pedidos" element={<AdminDietRequestsPage />} />
            <Route
              path="dietas/pedidos/criar"
              element={<AdminCreateDietPage />}
            />
            <Route path="leads" element={<AdminSalesRecoveryPage />} />

            {/* Redireciona /admin para dashboard */}
            <Route index element={<AdminDashboard />} />
          </Route>
        </Route>

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
          <Route path="/" element={<RootRedirector />} />
          <Route path="/onboard/sucesso" element={<Sucesso />} />

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

          {/* Rotas Protegidas */}
          <Route
            element={
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route element={<ActiveUserCheckRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/exercicios" element={<ExercisesPage />} />
                <Route path="/receitas" element={<RecipesPage />} />
                <Route path="/treinos" element={<WorkoutPlansPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/perfil/editar" element={<EditProfilePage />} />
                <Route
                  path="/measurements/add"
                  element={<AddMeasurementsPage />}
                />
                <Route path="/assinatura" element={<GerenciarPlanosPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route
                  path="/measurements/:id"
                  element={<MeasurementDetailsPage />}
                />
                <Route path="/metas/" element={<ConsumptionHistoryPage />} />
                <Route path="/dietas" element={<DietPlansPage />} />
                <Route path="/dietas/:id" element={<DietDetailsPage />} />
                <Route path="/dieta/solicitar" element={<RequestDietPage />} />
              </Route>
              <Route path="/treinos/:id" element={<WorkoutExecutionPage />} />
            </Route>
            <Route
              path="/treinos/concluido/:id"
              element={<WorkoutCompletionPage />}
            />
            <Route path="/treinos/criar" element={<CreateWorkoutPlanPage />} />
            <Route path="/treinos/solicitar" element={<RequestWorkoutPage />} />
            <Route path="/upgrade" element={<ChangePlanPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
