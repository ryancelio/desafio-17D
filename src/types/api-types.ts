// src/types/api-types.ts
import type {
  DailyConsumption,
  DiaSemana,
  ExerciseTaxonomy,
  Genero,
  Macros,
  NivelAtividade,
  NutritionTargets,
  Objetivo,
  UserMeasurement,
  WorkoutRequest,
} from "./models";

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  debug?: string;
}

// --- PAYLOADS DE REQUEST ---

export interface SyncUserRequest {
  nome?: string;
}

export interface UpdateProfileRequest {
  nome?: string;
  data_nascimento?: string | null;
  altura_cm?: number | null;
  genero?: Genero | null;
  objetivo_atual?: Objetivo;
  peso_alvo_kg?: number | null;
  nivel_atividade?: NivelAtividade;
  dias_treino?: DiaSemana[];
}

export interface CreateWorkoutExerciseInput {
  exercise_id: number;
  prescription: {
    tipo: "normal" | "tempo";
    series?: number;
    reps?: string;
    carga_kg?: number;
    rest_seg?: number;
    duracao_min?: number;
    observacoes?: string;
  };
}

export interface CreateWorkoutRequest {
  nome: string;
  exercises: CreateWorkoutExerciseInput[];
}

export type GetWorkoutRequestsResponse = WorkoutRequest[];

export interface AddConsumptionRequest {
  agua_l?: number;
  proteinas_g?: number;
  fibras_g?: number;
  calorias_kcal?: number;
}
export interface DailyConsumptionResponse {
  consumed: DailyConsumption;
  targets: NutritionTargets;
}

export interface CreditCategoryDetail {
  can_request: boolean;
  details: {
    plan: {
      limit: number;
      used: number;
      remaining: number;
    };
    extra_slots: number;
    total_remaining: number;
  };
  source_next_debit: "plan" | "extra";
}

export interface AllCreditsResponse {
  workout: CreditCategoryDetail;
  diet: CreditCategoryDetail;
  next_reset_date: string;
}

// --- FILTROS ---

export interface RecipeFilters {
  id?: number;
  search?: string;
  maxCalories?: number;
  includeTags?: string[];
  excludeTags?: string[];
}

export interface ExerciseFilters {
  search?: string;
  musculos?: string[];
  categoria?: "academia" | "calistenia";
  tags?: string[];
}

// --- RESPONSES ESPECÍFICOS ---

export interface MeasurementDetailsResponse {
  details: UserMeasurement;
  photos: string[];
  navigation: {
    previous_id: number | null;
    next_id: number | null;
  };
}

// --- DIETA ---

export interface DietItemResponse {
  item_id: number;
  recipe_id: number;
  titulo: string;
  imagem: string | null;
  porcao: string | null;
  obs: string | null;
  calorias: number;
  macros: Macros | null;
  tempo: number | null;
}

export interface DietMealResponse {
  meal_id: number;
  nome: string;
  horario: string | null;
  items: DietItemResponse[];
}

export interface DietPlanResponse {
  plan_id: number;
  nome: string;
  calorias_meta: number;
  macros_meta: Macros | null;
  is_active: boolean;
  meals: DietMealResponse[];
}

export type GetUserDietsResponse = DietPlanResponse[];

export interface ExerciseMetadataResponse {
  musculos: ExerciseTaxonomy[];
  tags: ExerciseTaxonomy[];
}

export interface Plan {
  id: number;
  name: string;
  price_monthly: number;
  price_annually: number;
  features: string[];
  is_featured?: boolean;
  monthly_workout_limit: number;
  monthly_diet_limit: number;
  is_sold_out: boolean;
  max_limit: number | null;
  current_usage?: number | null;
}

// --- LOJA ---
export type GetCreditPackagesResponse = CreditPackage[];

export interface UploadProgressPhotosResponse {
  urls: string[];
}

export interface UploadProfilePhotoResponse {
  success: boolean;
  file: string;
}

export interface RequestWorkoutResponse {
  message?: string;
  error?: string;
  success?: boolean;
}

export interface CreateSubscriptionRedirectResponse {
  success: boolean;
  redirect_url?: string;
  init_point?: string;
  error?: string;
}

export interface ProcessPaymentResponse {
  pix_data: PixData;
  error?: string;
  status?: string;
  id?: string | number;
  message?: string;
}

export interface CreditPackage {
  package_id: number;
  name: string;
  credits: number;
  price: number;
  best_value: boolean;
  type: "workout" | "diet";
}

export interface PixData {
  qr_code: string;
  qr_code_base64: string;
}

export interface CheckPaymentStatusResponse {
  status: string;
  detail?: string;
}

// --- ADMIN PAYLOADS (Para AdminApi.ts) ---

export interface DietMealItemPayload {
  recipe_id: number;
  porcao: string;
  observacao?: string;
}

export interface DietMealPayload {
  nome: string;
  horario: string;
  items: DietMealItemPayload[];
}

export interface SaveDietPayload {
  user_uid: string;
  nome: string;
  calorias_meta: number;
  macros_meta: {
    prot: number;
    carb: number;
    fat: number;
  };
  meals: DietMealPayload[];
  request_id?: string | number | null; // Aceita string vinda da URL
}

export interface RequestForm {
  qtd_fichas: number;
  observacoes: string;
}

/**
 * Status visual da streak calculado pelo backend.
 * - 'completed_today': Meta batida hoje (Fogo Laranja).
 * - 'pending_today': Meta batida ontem, precisa bater hoje (Fogo Cinza/Azul).
 * - 'broken': Não bateu ontem nem hoje (Fogo Apagado/Cinza).
 * - 'inactive': Nunca começou (Sem dados).
 */
export type StreakStatus =
  | "completed_today"
  | "pending_today"
  | "broken"
  | "inactive";

export interface StreakData {
  current: number; // O valor visual (pode ser 0 se estiver broken)
  max: number; // Recorde histórico
  last_date: string | null; // Formato YYYY-MM-DD vindo do banco
  status: StreakStatus; // O status derivado da comparação de datas
}

export interface GetUserStreaksResponse {
  nutrition: StreakData;
  workout: StreakData;
}

export interface LeaderboardResponse {
  list: {
    rank: number;
    uid: string;
    nome: string;
    photo: string | null;
    streak: number;
    is_me: boolean;
  }[];
  user_rank: {
    rank: number;
    uid: string;
    nome: string;
    photo: string | null;
    streak: number;
    is_me: boolean;
  } | null;
}
