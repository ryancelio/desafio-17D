import axios, { type AxiosInstance, type AxiosError } from "axios";
import { auth } from "../firebase"; // 👈 Importe sua instância 'auth' do Firebase
import type {
  OnboardingState,
  IPreference,
  IMeasurementsData,
} from "../types/onboarding.schema";

// --- 1. DEFINIÇÃO DE TIPOS (Sem 'any') ---

/**
 * A estrutura de dados do usuário, conforme retornado pelo seu banco MySQL.
 * Corresponde ao JSON de 'get_user.php'.
 */
export interface UserProfile {
  // --- Dados de Autenticação (Sempre existem) ---
  uid: string;
  email: string;
  nome: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;

  // --- Dados de Perfil (Podem ser nulos antes do onboarding) ---
  data_nascimento: string | null;
  altura_cm: number | null;
  genero: "masculino" | "feminino" | "outro" | null;

  // --- Dados de Fitness (Têm valor DEFAULT no DB, não são nulos) ---
  objetivo_atual: "perder_peso" | "definir" | "ganhar_massa";
  nivel_atividade: "sedentario" | "leve" | "moderado" | "ativo" | "muito_ativo";

  // --- Dias de Treino (O PHP envia `[]` se for nulo) ---
  dias_treino: ("DOM" | "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB")[];
}

export interface UserPreference extends IPreference {
  preference_id: number;
  user_uid: string;
  tipo_restricao:
    | "alergia"
    | "intolerancia"
    | "preferencia"
    | "limitacao_fisica";
  valor: string;
}

export interface UserMeasurement extends IMeasurementsData {
  measurement_id: number;
  user_uid: string;
  data_medicao: string;
  createdAt: string | undefined;
  // O PHP com JSON_NUMERIC_CHECK envia campos DECIMAIS como números.
  // Campos que podem ser nulos no DB são `number | null`.
  altura_cm: number | null;
  peso_kg: number;
  cintura_cm: number | null;
  quadril_cm: number | null;
  braco_cm: number | null;
  coxa_cm: number | null;
}

/**
 * Define os filtros que podem ser enviados para a API getRecipes.
 * Os arrays serão serializados pelo Axios (ex: &includeTags[]=vegano&includeTags[]=rapido)
 */
export interface RecipeFilters {
  search?: string;
  maxCalories?: number;
  includeTags?: string[];
  excludeTags?: string[];
}

/**
 * Resposta padrão de sucesso para 'sync_user' e 'update_user'.
 */
export interface ApiResponse {
  message: string;
}

export interface WeightHistoryEntry {
  measurement_id: number; // <-- ADICIONADO
  data_medicao: string; // "YYYY-MM-DD"
  peso_kg: number;
}

/**
 * Resposta da API de detalhes da medição.
 */
export interface MeasurementDetailsResponse {
  details: UserMeasurement;
  photos: string[]; // Array de URLs de imagem
  navigation: {
    previous_id: number | null;
    next_id: number | null;
  };
}

/**
 * Representa uma única foto retornada pela API de galeria.
 */
export interface UserPhoto {
  url_imagem: string;
  data_medicao: string; // "YYYY-MM-DD HH:MM:SS"
}

/**
 * Resposta padrão de erro enviada pela função 'send_json' do PHP.
 */
export interface ApiErrorResponse {
  error: string;
}

/**
 * Tipos de entrada para as funções da API.
 */
export interface SyncUserRequest {
  nome?: string; // O 'nome' é opcional no sync, o PHP usa "Novo Usuário"
}

export interface UpdateProfileRequest {
  nome: string; // O 'nome' é obrigatório no update
}

export interface Macros {
  proteinas_g: number;
  carboidratos_g: number;
  gorduras_g: number;
}

export interface Recipe {
  recipe_id: number;
  titulo: string;
  descricao_curta: string | null;
  url_imagem: string | null;
  tempo_preparo_min: number | null;
  calorias_kcal: number | null;
  macros: Macros | null;
  ingredientes: string[] | null;
  preparo: string[] | null;
  tags: string[] | null;
  createdAt: string;
}

/**
 * Corresponde a um item da tabela `exercises`.
 */
export interface Exercise {
  exercise_id: number;
  nome: string;
  descricao: string | null;
  link_video: string | null;
  musculos_trabalhados: string[] | null;
  tags: string[] | null;
  createdAt: string;
}

/**
 * Define os filtros para a API getExercises.
 */
export interface ExerciseFilters {
  search?: string;
  musculos?: string[];
  tags?: string[];
}

/**
 * A prescrição JSON para um exercício (ex: séries, reps, tempo).
 */
export interface Prescription {
  series?: number;
  reps?: string;
  carga_kg?: number;
  rest_seg?: number;
  tipo?: "tempo" | "normal";
  duracao_min?: number;
  duracao_seg?: number;
  observacoes?: string;
}

/**
 * Um exercício aninhado dentro de uma ficha (workout_plan_exercises + exercises)
 */
export interface WorkoutPlanExercise {
  plan_exercise_id: number;
  exercise_id: number;
  ordem: number;
  prescription: Prescription | null;
  // Detalhes do exercício (da tabela 'exercises')
  nome_exercicio: string | null;
  link_video: string | null;
  descricao: string | null;
  musculos_trabalhados: string[] | null;
  tags: string[] | null;
}

/**
 * A ficha de treino completa (workout_plans)
 */
export interface WorkoutPlan {
  plan_id: number;
  user_uid: string;
  nome: string;
  criada_por: "ADMIN" | "USER";
  data_criacao: string;
  data_vencimento: string | null;
  data_ultima_execucao: string | null;
  is_active: boolean;
  exercises: WorkoutPlanExercise[]; // Array de exercícios aninhados
}

/**
 * Prescrição para exercícios baseados em repetições (musculação).
 */
export interface NormalPrescriptionInput {
  tipo: "normal";
  series: number;
  reps: string;
  carga_kg: number;
  rest_seg: number;
  observacoes?: string;
}

/**
 * Prescrição para exercícios baseados em tempo (cardio, pranchas).
 */
export interface TimePrescriptionInput {
  tipo: "tempo";
  duracao_min: number;
  rest_seg: number; // Descanso pode ser útil entre rounds de cardio
  observacoes?: string;
}

/**
 * União dos tipos de prescrição que podem ser enviados à API.
 * O campo 'tipo' discrimina qual é qual.
 */
export type WorkoutPrescriptionInput =
  | NormalPrescriptionInput
  | TimePrescriptionInput;

export interface CreateWorkoutExerciseInput {
  exercise_id: number;
  prescription: WorkoutPrescriptionInput;
}
export interface CreateWorkoutRequest {
  nome: string;
  exercises: CreateWorkoutExerciseInput[];
}

/**
 * Representa os totais de consumo para um dia.
 * (Corresponde à tabela 'daily_consumption')
 */
export interface DailyConsumption {
  agua_l: number;
  proteinas_g: number;
  fibras_g: number;
  calorias_kcal: number;
}

/**
 * Os dados (deltas) enviados ao adicionar consumo.
 */
export interface AddConsumptionRequest {
  agua?: number;
  proteinas?: number;
  fibras?: number;
  calorias?: number;
}

// --- 2. CONFIGURAÇÃO DO AXIOS ---

/**
 * Instância principal do Axios.
 * Todas as requisições usarão esta instância.
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "/api",
});

/**
 * Função auxiliar para obter o token de autenticação do Firebase.
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    // Isso não deve acontecer se a API for chamada por um usuário logado
    throw new Error("Usuário não autenticado.");
  }

  return user.getIdToken();
}

// --- 3. INTERCEPTOR DE AUTENTICAÇÃO ---

/**
 * Intercepta *todas* as requisições feitas por esta instância
 * para adicionar o token de autenticação do Firebase.
 */
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Erro ao obter token:", error);
      // Cancela a requisição se não for possível obter o token
      return Promise.reject(new Error("Falha ao obter token de autenticação."));
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// --- 4. FUNÇÕES DA API ---

/**
 * Sincroniza o usuário (pós-login/cadastro) com o backend.
 * Chama 'sync_user.php'.
 */
async function syncUser(data: SyncUserRequest): Promise<ApiResponse> {
  // O interceptor já cuida do token
  const response = await axiosInstance.post<ApiResponse>(
    "/sync_user.php",
    data
  );
  return response.data;
}

/**
 * Busca os dados do usuário logado no banco MySQL.
 * Chama 'get_user.php'.
 */
async function getUserProfile(): Promise<UserProfile> {
  const response = await axiosInstance.get<UserProfile>("/get_user.php");
  return response.data;
}

/**
 * Atualiza o nome do usuário no banco MySQL.
 * Chama 'update_user.php'.
 */
async function updateUserProfile(
  data: UpdateProfileRequest
): Promise<ApiResponse> {
  const response = await axiosInstance.post<ApiResponse>(
    "/update_user.php",
    data
  );
  return response.data;
}
/**
 * Envia os dados completos do onboarding para o backend.
 * Chama 'submit_onboarding.php'.
 * @param data O objeto OnboardingState completo do formulário.
 */
async function submitOnboarding(data: OnboardingState): Promise<ApiResponse> {
  // O interceptor já cuida do token
  const response = await axiosInstance.post<ApiResponse>(
    "/submit_onboarding.php",
    data
  );
  return response.data;
}

async function getWeightHistory(): Promise<WeightHistoryEntry[]> {
  const response = await axiosInstance.get<WeightHistoryEntry[]>(
    "/get_weight_history.php"
  );
  return response.data;
}

/**
 * Busca a *última* medição do usuário.
 * Chama 'get_latest_measurements.php'.
 */
async function getLatestMeasurements(): Promise<UserMeasurement | null> {
  const response = await axiosInstance.get<UserMeasurement | null>(
    "/get_latest_measurements.php"
  );
  // Retorna o objeto de medição ou null se não houver nenhum
  return response.data;
}

/**
 * Busca todas as preferências/restrições do usuário.
 * Chama 'get_user_preferences.php'.
 */
async function getUserPreferences(): Promise<UserPreference[]> {
  const response = await axiosInstance.get<UserPreference[]>(
    "/get_user_preferences.php"
  );
  return response.data;
}

/**
 * Busca a lista de receitas, aplicando filtros do lado do servidor.
 * O usuário deve ter 'isActive' = 1 (verificado no PHP).
 * Chama 'get_recipes.php'.
 */
async function getRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
  const response = await axiosInstance.get<Recipe[]>("/get_recipes.php", {
    params: filters, // Axios serializa o objeto 'filters' em parâmetros de URL
  });
  return response.data;
}

/**
 * Busca a lista de todos os exercícios, aplicando filtros.
 * O usuário deve ter 'isActive' = 1 (verificado no PHP).
 * Chama 'get_exercises.php'.
 */
async function getExercises(
  filters: ExerciseFilters = {}
): Promise<Exercise[]> {
  const response = await axiosInstance.get<Exercise[]>("/get_exercises.php", {
    params: filters, // Axios serializa o objeto 'filters' em parâmetros de URL
  });
  return response.data;
}

/**
 * Busca todas as fichas de treino (e seus exercícios) do usuário.
 * O usuário deve ter 'isActive' = 1 (verificado no PHP).
 * Chama 'get_user_workouts.php'.
 */
async function getUserWorkouts(): Promise<WorkoutPlan[]> {
  const response = await axiosInstance.get<WorkoutPlan[]>(
    "/get_user_workouts.php"
  );
  return response.data;
}
/**
 * Cria uma nova ficha de treino personalizada.
 */
async function createWorkoutPlan(
  data: CreateWorkoutRequest
): Promise<ApiResponse> {
  const response = await axiosInstance.post<ApiResponse>(
    "/create_workout_plan.php",
    data
  );
  return response.data;
}

/**
 * Busca os detalhes de uma ficha específica para execução.
 */
async function getWorkoutDetails(planId: number): Promise<WorkoutPlan> {
  const response = await axiosInstance.get<WorkoutPlan>(
    "/get_workout_details.php",
    {
      params: { plan_id: planId },
    }
  );
  return response.data;
}

/**
 * Marca uma ficha de treino como concluída, atualizando sua data de execução.
 */
async function completeWorkout(planId: number): Promise<ApiResponse> {
  const response = await axiosInstance.post<ApiResponse>(
    "/complete_workout.php",
    {
      plan_id: planId,
    }
  );
  return response.data;
}

/**
 * Busca o consumo total (água, proteína, etc.) do dia ATUAL.
 * Chama 'get_daily_consumption.php'.
 */
async function getDailyConsumption(): Promise<DailyConsumption> {
  const response = await axiosInstance.get<DailyConsumption>(
    "/get_daily_consumption.php"
  );
  return response.data;
}

/**
 * Adiciona (soma) valores ao consumo do dia atual.
 * Chama 'upsert_nutrition.php'.
 * @param data Os valores a serem ADICIONADOS (deltas).
 * @returns Os NOVOS totais do dia.
 */
async function addDailyConsumption(
  data: AddConsumptionRequest
): Promise<DailyConsumption> {
  const response = await axiosInstance.post<DailyConsumption>(
    "/upsert_nutrition.php",
    data
  );
  return response.data;
}

/**
 * Adiciona uma nova medição (com fotos) para o usuário.
 * Chama 'add_measurement.php'.
 * @param data O FormData contendo os dados da medição e os arquivos de foto.
 */
async function addMeasurement(data: FormData): Promise<ApiResponse> {
  const response = await axiosInstance.post<ApiResponse>(
    "/add_measurement.php",
    data,
    {
      headers: {
        // Importante para upload de arquivos
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

/**
 * Busca os detalhes completos de uma medição específica.
 * Chama 'get_measurement_details.php'.
 */
async function getMeasurementDetails(
  measurementId: number
): Promise<MeasurementDetailsResponse> {
  const response = await axiosInstance.get<MeasurementDetailsResponse>(
    "/get_measurement_details.php",
    { params: { id: measurementId } }
  );
  return response.data;
}

/**
 * Busca todas as fotos de medição do usuário logado.
 * Chama 'get_user_photos.php'.
 */
async function getUserPhotos(): Promise<UserPhoto[]> {
  const response = await axiosInstance.get<UserPhoto[]>("/get_user_photos.php");
  return response.data;
}
// --- 5. FUNÇÃO AUXILIAR DE ERRO (Opcional, mas recomendado) ---

/**
 * Um "Type Guard" para verificar se um erro é um erro da nossa API PHP.
 * Isso permite tratar erros de forma tipada no seu front-end.
 *
 * Exemplo de uso no seu componente:
 * } catch (err) {
 * if (isApiError(err)) {
 * setError(err.response.data.error); // 'err' agora é do tipo AxiosError<ApiErrorResponse>
 * }
 * }
 */
export function isApiError(
  error: unknown
): error is AxiosError<ApiErrorResponse> {
  if (!axios.isAxiosError(error) || !error.response) {
    return false;
  }
  // Verifica se a propriedade 'error' existe no JSON de resposta
  return (error.response.data as ApiErrorResponse).error !== undefined;
}

// --- 6. EXPORTAÇÃO ---

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
  createWorkoutPlan,
  getWorkoutDetails,
  completeWorkout,
  addMeasurement,
  getUserPhotos,
  getMeasurementDetails,
};

export default apiClient;
