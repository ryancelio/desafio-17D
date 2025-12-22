import axios, { type AxiosInstance, type AxiosError } from "axios";
import { auth } from "../firebase";

// Importando Tipos Centralizados
import type {
  UserProfile,
  UserPreference,
  UserMeasurement,
  WeightHistoryEntry,
  UserPhoto,
  Recipe,
  Exercise,
  WorkoutPlan,
  DailyConsumption,
  Notification,
  WorkoutRequest,
  DietRequestPayload,
  DietRequest,
} from "../types/models";

import type {
  ApiResponse,
  ApiErrorResponse,
  SyncUserRequest,
  UpdateProfileRequest,
  RecipeFilters,
  ExerciseFilters,
  CreateWorkoutRequest,
  AddConsumptionRequest,
  MeasurementDetailsResponse,
  GetUserDietsResponse,
  AllCreditsResponse,
  DailyConsumptionResponse,
  ExerciseMetadataResponse,
} from "../types/api-types";

import type { OnboardingState } from "../types/onboarding.schema";

// --- 2. CONFIGURAÇÃO DO AXIOS ---

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "/api",
});

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Usuário não autenticado.");
  }
  return user.getIdToken();
}

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Erro ao obter token:", error);
      return Promise.reject(new Error("Falha ao obter token de autenticação."));
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// --- 3. FUNÇÕES DA API ---

async function syncUser(data: SyncUserRequest): Promise<ApiResponse> {
  const response = await axiosInstance.post<ApiResponse>(
    "/sync_user.php",
    data
  );
  return response.data;
}

async function syncUserPreferences(preferences: UserPreference[]) {
  const res = await axiosInstance.post("/sync_preferences.php", {
    preferences,
  });
  return res.data;
}
async function getPlans() {
  const res = await axiosInstance.get("/get_plans.php");
  return res.data;
}

async function cancelSubscription() {
  const res = await axiosInstance.post("/cancel_subscription.php");
  return res.data;
}

async function completeOnboarding(payload: {
  personal: {
    email: string | null | undefined;
    nome: string | null | undefined;
    data_nascimento: string | null;
    genero: "masculino" | "feminino" | "outro" | null;
    altura_cm: number | null;
    telefone: string | null;
    peso_alvo_kg: number | null;
    dias_treino: ("DOM" | "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB")[];
    objetivo_atual: "perder_peso" | "definir" | "ganhar_massa";
    nivel_atividade:
      | "sedentario"
      | "leve"
      | "moderado"
      | "ativo"
      | "muito_ativo";
  };
  measurements: {
    peso_kg: number;
    cintura_cm?: number | undefined;
    quadril_cm?: number | undefined;
    braco_cm?: number | undefined;
    coxa_cm?: number | undefined;
  };
  preferences: {
    id: string | number;
    tipo_restricao:
      | "alergia"
      | "intolerancia"
      | "preferencia"
      | "limitacao_fisica";
    valor: string;
  }[];
}): Promise<ApiResponse> {
  const response = await axiosInstance.post<ApiResponse>(
    "/complete_onboarding.php",
    JSON.stringify(payload),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
}

async function getUserProfile(): Promise<UserProfile> {
  const response = await axiosInstance.get<UserProfile>("/users/get_user.php");
  return response.data;
}

async function getAllCredits(): Promise<AllCreditsResponse> {
  // Nota: Atualize a URL para o novo nome do arquivo se você renomeou
  const response = await axiosInstance.get<AllCreditsResponse>(
    "/check_credits.php"
  );
  return response.data;
}

async function updateUserProfile(
  data: UpdateProfileRequest
): Promise<ApiResponse> {
  const response = await axiosInstance.post<ApiResponse>(
    "/users/update.php",
    data
  );
  return response.data;
}

async function submitOnboarding(data: OnboardingState): Promise<ApiResponse> {
  if (!data.fotosProgresso || data.fotosProgresso.length === 0) {
    const response = await axiosInstance.post<ApiResponse>(
      "/submit_onboarding.php",
      data
    );
    return response.data;
  }

  const formData = new FormData();
  formData.append("onboardingData", JSON.stringify(data));
  data.fotosProgresso.forEach((file, index) => {
    formData.append(`foto_${index}`, file, file.name);
  });

  const response = await axiosInstance.post<ApiResponse>(
    "/submit_onboarding.php",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

async function getWeightHistory(): Promise<WeightHistoryEntry[]> {
  const response = await axiosInstance.get<WeightHistoryEntry[]>(
    "/get_weight_history.php"
  );
  return response.data;
}

async function getLatestMeasurements(): Promise<UserMeasurement | null> {
  const response = await axiosInstance.get<UserMeasurement | null>(
    "/get_latest_measurements.php"
  );
  return response.data;
}

async function getUserPreferences(): Promise<UserPreference[]> {
  const response = await axiosInstance.get<UserPreference[]>(
    "/get_user_preferences.php"
  );
  return response.data;
}

async function getUserDiets(): Promise<GetUserDietsResponse> {
  const response = await axiosInstance.get<GetUserDietsResponse>(
    "/get_user_diets.php"
  );
  return response.data;
}

async function getNotifications(): Promise<Notification[]> {
  const res = await axiosInstance.get("/get_notifications.php");
  return res.data;
}

async function getRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
  const response = await axiosInstance.get<Recipe[]>("/get_recipes.php", {
    params: filters,
  });
  return response.data;
}

async function getExercises(
  filters: ExerciseFilters = {}
): Promise<Exercise[]> {
  const response = await axiosInstance.get<Exercise[]>("/get_exercises.php", {
    params: filters,
  });
  return response.data;
}

async function getUserWorkouts(): Promise<WorkoutPlan[]> {
  const response = await axiosInstance.get<WorkoutPlan[]>(
    "/get_user_workouts.php"
  );
  return response.data;
}
async function getWorkoutRequests(): Promise<WorkoutRequest[]> {
  const response = await axiosInstance.get<WorkoutRequest[]>(
    "/get_workout_requests.php"
  );
  return response.data;
}

async function getDietRequests(): Promise<DietRequest[]> {
  const response = await axiosInstance.get<DietRequest[]>(
    "/get_diet_requests.php"
  );
  return response.data;
}

async function requestDietPlan(
  request: DietRequestPayload
): Promise<ApiResponse> {
  const response = await axiosInstance.post<ApiResponse>(
    "/request_diet.php",
    request
  );
  return response.data;
}

async function getExerciseMetadata(): Promise<ExerciseMetadataResponse> {
  const response = await axiosInstance.get<ExerciseMetadataResponse>(
    "/get_exercise_taxonomies.php"
  );
  return response.data;
}

async function createWorkoutPlan(
  data: CreateWorkoutRequest
): Promise<ApiResponse> {
  const response = await axiosInstance.post<ApiResponse>(
    "/create_workout_plan.php",
    data
  );
  return response.data;
}

async function getWorkoutDetails(planId: number): Promise<WorkoutPlan> {
  const response = await axiosInstance.get<WorkoutPlan>(
    "/get_workout_details.php",
    {
      params: { plan_id: planId },
    }
  );
  return response.data;
}

async function completeWorkout(planId: number): Promise<ApiResponse> {
  const response = await axiosInstance.post<ApiResponse>(
    "/complete_workout.php",
    { plan_id: planId }
  );
  return response.data;
}

async function getDailyConsumption(): Promise<DailyConsumptionResponse> {
  const response = await axiosInstance.get<DailyConsumptionResponse>(
    "/get_daily_consumption.php"
  );
  return response.data;
}

async function addDailyConsumption(
  data: AddConsumptionRequest
): Promise<DailyConsumption> {
  const response = await axiosInstance.post<DailyConsumption>(
    "/upsert_nutrition.php",
    data
  );
  return response.data;
}

async function setDailyConsumption(
  data: AddConsumptionRequest
): Promise<DailyConsumption> {
  const response = await axiosInstance.post<DailyConsumption>(
    "/set_nutrition.php",
    data
  );
  return response.data;
}

async function addMeasurement(data: FormData): Promise<ApiResponse> {
  const response = await axiosInstance.post<ApiResponse>(
    "/add_measurement.php",
    data,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
}

async function getMeasurementDetails(
  measurementId: number
): Promise<MeasurementDetailsResponse> {
  const response = await axiosInstance.get<MeasurementDetailsResponse>(
    "/get_measurement_details.php",
    {
      params: { id: measurementId },
    }
  );
  return response.data;
}

// async function getUserPhotos(): Promise<UserPhoto[]> {
//   const response = await axiosInstance.get<UserPhoto[]>("/get_user_photos.php");
//   return response.data;
// }

async function getUserPhotos(src: string): Promise<UserPhoto[]> {
  const response = await axiosInstance.get<UserPhoto[]>("/get_image.php", {
    params: { path: src },
    responseType: "blob",
  });
  return response.data;
}

async function uploadProgressPhotos(files: File[]): Promise<string[]> {
  const formData = new FormData();

  // Anexa cada arquivo ao campo 'photos[]' (o [] é importante para o PHP entender como array)
  files.forEach((file) => {
    formData.append("photos[]", file);
  });

  // O Axios detecta FormData e define o header 'multipart/form-data' automaticamente
  const response = await axiosInstance.post<{ urls: string[] }>(
    "/upload_progress_photos.php",
    formData
  );

  return response.data.urls;
}

export async function uploadProfilePhoto(
  file: File
): Promise<{ success: boolean; file: string }> {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await axiosInstance.post(
    "/upload_profile_photo.php",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
}

// --- 4. TYPE GUARD ---

export function isApiError(
  error: unknown
): error is AxiosError<ApiErrorResponse> {
  if (!axios.isAxiosError(error) || !error.response) {
    return false;
  }
  return (error.response.data as ApiErrorResponse).error !== undefined;
}

// --- 5. EXPORT DEFAULT ---

const apiClient = {
  syncUser,
  getUserProfile,
  updateUserProfile,
  submitOnboarding,
  getWeightHistory,
  getLatestMeasurements,
  getUserPreferences,
  getRecipes,
  getExercises,
  getUserWorkouts,
  getDailyConsumption,
  addDailyConsumption,
  setDailyConsumption,
  createWorkoutPlan,
  getWorkoutDetails,
  completeWorkout,
  addMeasurement,
  uploadProgressPhotos,
  getMeasurementDetails,
  syncUserPreferences,
  getUserDiets,
  getNotifications,
  completeOnboarding,
  getAllCredits,
  getExerciseMetadata,
  getUserPhotos,
  uploadProfilePhoto,
  getPlans,
  cancelSubscription,
  getWorkoutRequests,
  getDietRequests,
  requestDietPlan,
};

export default apiClient;
