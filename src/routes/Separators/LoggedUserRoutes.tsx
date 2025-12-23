import { Outlet, Route } from "react-router";
import ActiveUserCheckRoute from "../protected/ActiveUserCheckRoute";
import AppLayout from "../protected/AppLayout";
import ConsumptionHistoryPage from "../protected/dashboard/consumo/ConsumptionHistoryPage";
import Dashboard from "../protected/dashboard/Dashboard";
import ExercisesPage from "../protected/execicios/ExerciciosPage";
import AddMeasurementsPage from "../protected/measurements/AddMeasurementsPage";
import MeasurementDetailsPage from "../protected/measurements/MeasurementDetailsPage";
import ChangePlanPage from "../protected/planos/ChangePlanPage";
import CheckoutPage from "../protected/planos/CheckoutPage";
import GerenciarPlanosPage from "../protected/planos/GerenciarPlanosPage";
import EditProfilePage from "../protected/Profile/EditProfilePage";
import ProfilePage from "../protected/Profile/ProfilePage";
import DietPlansPage from "../protected/Recipes/Diets/DietPlansPage";
import DietDetailsPage from "../protected/Recipes/Diets/DietsDetailsPage";
import RequestDietPage from "../protected/Recipes/Diets/RequestDietPage";
import RecipesPage from "../protected/Recipes/RecipesPage";
import CreateWorkoutPlanPage from "../protected/treinos/CreateWorkoutPlanPage";
import RequestWorkoutPage from "../protected/treinos/RequestWorkoutPage";
import WorkoutCompletionPage from "../protected/treinos/WorkoutCompletionPage";
import WorkoutExecutionPage from "../protected/treinos/WorkoutExecutionPage";
import WorkoutPlansPage from "../protected/treinos/WorkoutPlanPage";
import ProtectedRoute from "../ProtectedRoute";
import BuyCreditsPage from "../protected/components/BuyCreditsPage";
import RecipeDetailsPage from "../protected/Recipes/RecipesDetailPage";

export default function LoggedUserRoutes() {
  return (
    // <div>UserRoutes</div>
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
          <Route path="/receitas/:id" element={<RecipeDetailsPage />} />
          <Route path="/treinos" element={<WorkoutPlansPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/editar" element={<EditProfilePage />} />
          <Route path="/measurements/add" element={<AddMeasurementsPage />} />
          <Route path="/assinatura" element={<GerenciarPlanosPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/measurements/:id"
            element={<MeasurementDetailsPage />}
          />
          <Route path="/metas/" element={<ConsumptionHistoryPage />} />
          <Route path="/dietas" element={<DietPlansPage />} />
          <Route path="/dieta/:id" element={<DietDetailsPage />} />
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
      <Route path="/loja/creditos" element={<BuyCreditsPage />} />
    </Route>
  );
}
