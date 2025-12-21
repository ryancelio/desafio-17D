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

// Estrutura da Resposta Completa
export interface AllCreditsResponse {
  workout: CreditCategoryDetail;
  diet: CreditCategoryDetail;
  next_reset_date: string;
}

// --- FILTROS DE BUSCA ---

export interface RecipeFilters {
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

// --- RESPOSTA DE DIETA (GET /get_user_diets.php) ---

export interface DietItemResponse {
  item_id: number;
  recipe_id: number;
  titulo: string;
  imagem: string | null; // url_imagem pode ser null
  porcao: string | null; // porcao_sugerida
  obs: string | null; // observacao
  calorias: number; // calorias_kcal
  macros: Macros | null; // JSON decodificado da receita
  tempo: number | null; // tempo_preparo_min
}

export interface DietMealResponse {
  meal_id: number;
  nome: string; // ex: "Café da Manhã"
  horario: string | null; // ex: "08:00:00"
  items: DietItemResponse[];
}

export interface DietPlanResponse {
  plan_id: number;
  nome: string; // ex: "Dieta Hipertrofia"
  calorias_meta: number;
  macros_meta: Macros | null; // JSON decodificado das metas do plano
  is_active: boolean;
  meals: DietMealResponse[];
}

export type GetUserDietsResponse = DietPlanResponse[];

export interface ExerciseMetadataResponse {
  musculos: ExerciseTaxonomy[];
  tags: ExerciseTaxonomy[];
}
