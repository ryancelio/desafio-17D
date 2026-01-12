import axios, { type AxiosInstance } from "axios";
import type {
  Exercise,
  WorkoutRequest,
  Recipe,
  ExerciseTaxonomy,
  Prescription,
  DietRequest,
  RecipeTaxonomy,
} from "../../../types/models";
import type {
  ExerciseMetadataResponse,
  ApiResponse,
  SaveDietPayload,
} from "../../../types/api-types";
import type { PendingLead } from "../../../types/admin";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://powerslim.pro/api/admin",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tipo auxiliar para respostas de mutação (create/update/delete) do Admin
type AdminResponse = Partial<ApiResponse> & {
  success: boolean;
  id?: number;
  message?: string;
};

// --- Tipos para Payloads de Criação (Baseados nos PHPs fornecidos) ---

// export interface DietMealItemPayload {
//   recipe_id: number;
//   porcao: string;
//   observacao?: string;
// }

// export interface DietMealPayload {
//   nome: string;
//   horario: string;
//   items: DietMealItemPayload[];
// }

// export interface SaveDietPayload {
//   user_uid: string;
//   nome: string;
//   calorias_meta: number;
//   macros_meta: {
//     prot: number;
//     carb: number;
//     fat: number;
//   };
//   meals: DietMealPayload[];
//   request_id?: number; // Opcional: Para marcar o pedido como concluído
// }

export interface WorkoutExercisePayload {
  exercise_id: number;
  prescription: Prescription; // Objeto com séries, reps, carga, etc.
}

export interface SaveWorkoutPayload {
  plan_id?: number; // Opcional: Se enviado, é edição. Se não, criação.
  user_uid: string;
  nome: string;
  assigned_days: string[]; // Dias da semana atribuídos
  exercises: WorkoutExercisePayload[];
}

// ---------------------------------------------------------------------

const ManageExerciseMetadata = {
  get: async (): Promise<ExerciseMetadataResponse> => {
    const response = await axiosInstance.get<ExerciseMetadataResponse>(
      "/taxonomies_manage.php"
    );
    return response.data;
  },
  post: async (data: Partial<ExerciseTaxonomy>): Promise<AdminResponse> => {
    const response = await axiosInstance.post<AdminResponse>(
      "/taxonomies_manage.php",
      data
    );
    return response.data;
  },
  put: async (data: Partial<ExerciseTaxonomy>): Promise<AdminResponse> => {
    const response = await axiosInstance.put<AdminResponse>(
      "/taxonomies_manage.php",
      data
    );
    return response.data;
  },
  delete: async (id: number): Promise<AdminResponse> => {
    const response = await axiosInstance.delete<AdminResponse>(
      "/taxonomies_manage.php",
      {
        params: { id },
      }
    );
    return response.data;
  },
};

const ManageExercises = {
  get: async (): Promise<Exercise[]> => {
    const response = await axiosInstance.get<Exercise[]>(
      "/exercises_manage.php"
    );
    return response.data;
  },
  getById: async (id: number): Promise<Exercise> => {
    const response = await axiosInstance.get<Exercise>(
      "/exercises_manage.php",
      {
        params: { id },
      }
    );
    return response.data;
  },
  post: async (data: Partial<Exercise>): Promise<AdminResponse> => {
    const response = await axiosInstance.post<AdminResponse>(
      "/exercises_manage.php",
      data
    );
    return response.data;
  },
  put: async (data: Partial<Exercise>): Promise<AdminResponse> => {
    const response = await axiosInstance.put<AdminResponse>(
      "/exercises_manage.php",
      data
    );
    return response.data;
  },
  delete: async (id: number): Promise<AdminResponse> => {
    const response = await axiosInstance.delete<AdminResponse>(
      "/exercises_manage.php",
      {
        params: { id },
      }
    );
    return response.data;
  },
};

const manageRecipes = {
  get: async (): Promise<Recipe[]> => {
    const response = await axiosInstance.get("/recipes_manage.php");
    return response.data;
  },
  getById: async (id: number): Promise<Recipe> => {
    const response = await axiosInstance.get<Recipe>("/recipes_manage.php", {
      params: { id },
    });
    return response.data;
  },
  post: async (data: Partial<Recipe>): Promise<AdminResponse> => {
    const response = await axiosInstance.post<AdminResponse>(
      "/recipes_manage.php",
      data
    );
    return response.data;
  },
  put: async (data: Partial<Recipe>): Promise<AdminResponse> => {
    const response = await axiosInstance.put<AdminResponse>(
      "/recipes_manage.php",
      data
    );
    return response.data;
  },
  delete: async (id: number): Promise<AdminResponse> => {
    const response = await axiosInstance.delete<AdminResponse>(
      "/recipes_manage.php",
      {
        params: { id },
      }
    );
    return response.data;
  },
};

export const ManageRecipeTaxonomies = {
  // GET: Lista todas as tags
  get: async (): Promise<RecipeTaxonomy[]> => {
    const response = await axiosInstance.get<RecipeTaxonomy[]>(
      "/recipe_taxonomies_manage.php"
    );
    return response.data;
  },

  // POST: Cria uma nova tag
  post: async (data: RecipeTaxonomy): Promise<AdminResponse> => {
    const response = await axiosInstance.post<AdminResponse>(
      "/recipe_taxonomies_manage.php",
      data
    );
    return response.data;
  },

  // PUT: Atualiza uma tag existente
  // Nota: Como o PHP usa POST para update (verificando o ID), apontamos para POST ou ajustamos o PHP.
  // Baseado no PHP anterior, ele espera um POST com ID.
  update: async (data: RecipeTaxonomy): Promise<AdminResponse> => {
    const response = await axiosInstance.post<AdminResponse>(
      "/recipe_taxonomies_manage.php",
      data
    );
    return response.data;
  },

  // DELETE: Remove uma tag
  delete: async (id: number): Promise<AdminResponse> => {
    const response = await axiosInstance.delete<AdminResponse>(
      "/recipe_taxonomies_manage.php",
      {
        params: { id },
      }
    );
    return response.data;
  },
};

const getDietRequests = async (): Promise<DietRequest[]> => {
  const response = await axiosInstance.get("/get_diet_requests.php");
  return response.data;
};

// --- Novas Funções Conectadas aos Scripts PHP fornecidos ---

const saveDiet = async (data: SaveDietPayload): Promise<AdminResponse> => {
  const response = await axiosInstance.post<AdminResponse>(
    "/save_diet.php",
    data
  );
  return response.data;
};

const saveWorkout = async (
  data: SaveWorkoutPayload
): Promise<AdminResponse> => {
  const response = await axiosInstance.post<AdminResponse>(
    "/save_workout.php",
    data
  );
  return response.data;
};
const getWorkoutRequests = async (): Promise<WorkoutRequest[]> => {
  const response = await axiosInstance.get("/get_workout_requests.php");
  return response.data;
};

const completeWorkoutRequest = async (
  requestId: number
): Promise<AdminResponse> => {
  const response = await axiosInstance.post<AdminResponse>(
    "/complete_request.php",
    {
      request_id: requestId,
      status: "concluido",
    }
  );
  return response.data;
};

const getPendingLeads = async (): Promise<PendingLead[]> => {
  const response = await axiosInstance.get("/pending_leads.php");
  return response.data;
};

// -----------------------------------------------------------

interface AdminUser {
  name: string;
  role: string;
}

const checkAuth = async (): Promise<{
  authenticated: boolean;
  admin: AdminUser;
  role: string;
}> => {
  const response = await axiosInstance.get<{
    authenticated: boolean;
    admin: AdminUser;
    role: string;
  }>("/check_auth.php");
  return response.data;
};

const adminLogin = async (
  username: string,
  password: string
): Promise<{
  success: boolean;
  admin?: AdminUser;
  error?: string;
}> => {
  // CORREÇÃO AQUI: Alterado 'admin?: string' para 'admin?: AdminUser'
  const response = await axiosInstance.post<{
    success: boolean;
    admin?: AdminUser;
    error?: string;
  }>("/login.php", { username, password });

  return response.data;
};

const adminLogout = async (): Promise<{ success: boolean }> => {
  const response = await axiosInstance.get<{ success: boolean }>("/logout.php");
  return response.data;
};

export {
  ManageExerciseMetadata,
  ManageExercises,
  manageRecipes,
  getDietRequests,
  saveDiet, // Exportado
  saveWorkout, // Exportado
  checkAuth,
  adminLogin,
  adminLogout,
  getWorkoutRequests,
  completeWorkoutRequest,
  getPendingLeads,
};
