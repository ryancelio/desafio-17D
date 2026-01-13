import { Route, Outlet } from "react-router";
import { AdminAuthProvider } from "../../context/AdminAuthContext";
import AdminCreateDietPage from "../admin/AdminCreateDietPage";
import AdminCreateWorkoutPage from "../admin/AdminCreateWorkoutPage";
import AdminDashboard from "../admin/AdminDashboard";
import AdminDietRequestsPage from "../admin/AdminDietRequestPage";
import AdminExerciseEditor from "../admin/AdminExerciseEditor";
import AdminExercisesPage from "../admin/AdminExercisesPage";
import AdminLayout from "../admin/AdminLayout";
import AdminLoginPage from "../admin/AdminLoginPage";
import AdminRecipeEditor from "../admin/AdminRecipeEditor";
import AdminRecipesPage from "../admin/AdminRecipesPage";
import AdminSalesRecoveryPage from "../admin/AdminSalesRecoveryPage";
import AdminWorkoutRequestsPage from "../admin/AdminWorkoutRequestsPage";
import AdminAuthLogsPage from "../admin/AdminAuthLogsPage";

export default function AdminRoutes() {
  return (
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
        <Route path="exercicios/editar/:id" element={<AdminExerciseEditor />} />
        <Route path="treinos/pedidos" element={<AdminWorkoutRequestsPage />} />
        <Route
          path="treinos/pedidos/criar"
          element={<AdminCreateWorkoutPage />}
        />
        <Route path="dietas/pedidos" element={<AdminDietRequestsPage />} />
        <Route path="dietas/pedidos/criar" element={<AdminCreateDietPage />} />
        <Route path="leads" element={<AdminSalesRecoveryPage />} />
        <Route path="logs" element={<AdminAuthLogsPage />} />

        {/* Redireciona /admin para dashboard */}
        <Route index element={<AdminDashboard />} />
      </Route>
    </Route>
  );
}
