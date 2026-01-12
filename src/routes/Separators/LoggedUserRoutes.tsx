import { lazy, Suspense } from "react";
import { Outlet, Route } from "react-router";
import { Loader2 } from "lucide-react";

import ActiveUserCheckRoute from "../protected/ActiveUserCheckRoute";
import AppLayout from "../protected/AppLayout";
import ProtectedRoute from "../ProtectedRoute";
import RenewPlanPage from "../protected/planos/RenewalPlanPage";
import LeaderboardPage from "../leaderboard/LeaderboardPage";

// Lazy Loading Components
const Dashboard = lazy(() => import("../protected/dashboard/Dashboard"));
const ConsumptionHistoryPage = lazy(
  () => import("../protected/dashboard/consumo/ConsumptionHistoryPage")
);
const ExercisesPage = lazy(
  () => import("../protected/execicios/ExerciciosPage")
);
const AddMeasurementsPage = lazy(
  () => import("../protected/measurements/AddMeasurementsPage")
);
const MeasurementDetailsPage = lazy(
  () => import("../protected/measurements/MeasurementDetailsPage")
);
const ChangePlanPage = lazy(() => import("../protected/planos/ChangePlanPage"));
const CheckoutPage = lazy(() => import("../protected/planos/CheckoutPage"));
const GerenciarPlanosPage = lazy(
  () => import("../protected/planos/GerenciarPlanosPage")
);
const EditProfilePage = lazy(
  () => import("../protected/Profile/EditProfilePage")
);
const ProfilePage = lazy(() => import("../protected/Profile/ProfilePage"));
const DietPlansPage = lazy(
  () => import("../protected/Recipes/Diets/DietPlansPage")
);
const DietDetailsPage = lazy(
  () => import("../protected/Recipes/Diets/DietsDetailsPage")
);
const RequestDietPage = lazy(
  () => import("../protected/Recipes/Diets/RequestDietPage")
);
const RecipesPage = lazy(() => import("../protected/Recipes/RecipesPage"));
const RecipeDetailsPage = lazy(
  () => import("../protected/Recipes/RecipesDetailPage")
);
const CreateWorkoutPlanPage = lazy(
  () => import("../protected/treinos/CreateWorkoutPlanPage")
);
const RequestWorkoutPage = lazy(
  () => import("../protected/treinos/RequestWorkoutPage")
);
const WorkoutCompletionPage = lazy(
  () => import("../protected/treinos/WorkoutCompletionPage")
);
const WorkoutExecutionPage = lazy(
  () => import("../protected/treinos/WorkoutExecutionPage")
);
const WorkoutPlansPage = lazy(
  () => import("../protected/treinos/WorkoutPlanPage")
);
const BuyCreditsPage = lazy(
  () => import("../protected/components/BuyCreditsPage")
);

const PageLoader = () => (
  <div className="flex h-[80vh] w-full items-center justify-center">
    <Loader2 className="h-10 w-10 animate-spin text-indigo-300" />
  </div>
);

export default function LoggedUserRoutes() {
  return (
    <Route
      element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ProtectedRoute>
      }
    >
      {/* ACTIVE */}
      <Route element={<ActiveUserCheckRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exercicios" element={<ExercisesPage />} />
          <Route path="/receitas" element={<RecipesPage />} />
          <Route path="/receitas/:id" element={<RecipeDetailsPage />} />
          <Route path="/treinos" element={<WorkoutPlansPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/editar" element={<EditProfilePage />} />
          <Route path="/measurements/add" element={<AddMeasurementsPage />} />
          <Route
            path="/measurements/:id"
            element={<MeasurementDetailsPage />}
          />
          <Route path="/metas/" element={<ConsumptionHistoryPage />} />
          <Route path="/dietas" element={<DietPlansPage />} />
          <Route path="/dieta/:id" element={<DietDetailsPage />} />
          <Route path="/dieta/solicitar" element={<RequestDietPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
        </Route>
        <Route path="/treinos/:id" element={<WorkoutExecutionPage />} />
        <Route
          path="/treinos/concluido/:id"
          element={<WorkoutCompletionPage />}
        />
      </Route>
      {/*  ^^^ ACTIVE ^^^ */}

      <Route path="/treinos/criar" element={<CreateWorkoutPlanPage />} />
      <Route path="/treinos/solicitar" element={<RequestWorkoutPage />} />
      <Route path="/upgrade" element={<ChangePlanPage />} />
      <Route path="/assinatura" element={<GerenciarPlanosPage />} />
      <Route path="/assinatura/renovar" element={<RenewPlanPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/loja/creditos" element={<BuyCreditsPage />} />
    </Route>
  );
}
