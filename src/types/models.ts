// src/types/models.ts

// --- ENUMS & Tipos Básicos ---
export type Genero = "masculino" | "feminino" | "outro";
export type Objetivo = "perder_peso" | "definir" | "ganhar_massa";
export type NivelAtividade =
  | "sedentario"
  | "leve"
  | "moderado"
  | "ativo"
  | "muito_ativo";
export type DiaSemana = "DOM" | "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB";
export type TipoRestricao =
  | "alergia"
  | "intolerancia"
  | "preferencia"
  | "limitacao_fisica";
export type SubscriptionStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "pending"
  | "none";
export type PaymentMethod = "monthly_subscription" | "annual_prepaid";

// --- PERFIL DO USUÁRIO ---

export interface ProfileDetails {
  data_nascimento: string | null; // "YYYY-MM-DD"
  altura_cm: number | null;
  genero: Genero | null;
  objetivo: Objetivo;
  peso_alvo: number | null;
  nivel_atividade: NivelAtividade;
  local_treino?: "academia" | "casa";
  dias_treino: DiaSemana[];
}

export interface SubscriptionDetails {
  has_access: boolean;
  plan_id: number | null;
  plan_name: string;
  plan_key: string | null;
  extra_workout_slots: number;
  extra_diet_slots: number;
  status: SubscriptionStatus;
  payment_method: PaymentMethod | null;
  price_paid: number | null;
  expires_at: string | null;
  monthly_workout_limit: number;
  monthly_diet_limit: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  profile_photo: string | null;
  telefone?: string | null;
  nome: string;
  profile: ProfileDetails;
  subscription: SubscriptionDetails;
}

export interface UserPreference {
  preference_id: number;
  user_uid: string;
  tipo_restricao: TipoRestricao;
  valor: string;
}

// --- MEDIDAS ---

export interface UserMeasurement {
  measurement_id: number;
  user_uid: string;
  data_medicao: string;
  peso_kg: number;
  cintura_cm?: number;
  quadril_cm?: number;
  braco_cm?: number;
  coxa_cm?: number;
  createdAt?: string;
}

export interface WeightHistoryEntry {
  measurement_id: number;
  data_medicao: string;
  peso_kg: number;
}

export interface UserPhoto {
  photo_id: number;
  measurement_id: number;
  url_imagem: string;
  data_criacao: string;
}

// --- NUTRIÇÃO (DIETA E RECEITAS) ---

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

export interface DailyConsumption {
  agua_l: number;
  proteinas_g: number;
  fibras_g: number;
  carboidratos_g: number;
  gorduras_g: number;
  calorias_kcal: number;
}
export interface NutritionTargets {
  calorias_kcal: number;
  proteinas_g: number;
  carboidratos_g: number;
  gorduras_g: number;
  fibras_g: number;
  agua_l: number;
}

// --- TREINOS ---

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

export interface Exercise {
  exercise_id: number;
  nome: string;
  descricao: string | null;
  link_video: string | null;
  thumb_url: string | null;
  categoria: "academia" | "calistenia" | "ambos";
  musculos_trabalhados: string[] | null;
  tags: string[] | null;
  createdAt: string;
}

export interface WorkoutPlanExercise {
  plan_exercise_id: number;
  exercise_id: number;
  ordem: number;
  prescription: Prescription | null;
  nome_exercicio: string | null;
  link_video: string | null;
  thumb_url: string | null;
  descricao: string | null;
  musculos_trabalhados: string[] | null;
  tags: string[] | null;
}

export interface WorkoutPlan {
  plan_id: number;
  user_uid: string;
  nome: string;
  criada_por: "ADMIN" | "USER";
  data_criacao: string;
  data_vencimento: string | null;
  data_ultima_execucao: string | null;
  is_active: boolean;
  exercises: WorkoutPlanExercise[];
}

export interface ExerciseTaxonomy {
  id: number;
  label: string;
  value: string;
  tipo: "musculo" | "tag";
  ordem: number;
  is_active: boolean;
}
export interface RecipeTaxonomy {
  id?: number;
  label: string;
  value: string;
  ordem?: number;
  is_active?: boolean;
}

export type Notification = {
  id: number | string;
  title: string;
  message: string;
  is_read: boolean | 1 | 0;
  created_at: string;
};

// --- PEDIDOS & ADMIN ---

export type WorkoutRequestStatus =
  | "pendente"
  | "em_analise"
  | "concluido"
  | "rejeitado";

export interface WorkoutRequest {
  request_id: number;
  user_uid: string;
  qtd_fichas: number;
  observacoes: string | null;
  status: WorkoutRequestStatus;
  admin_feedback: string | null;
  created_at: string;
  updated_at: string | null;
}

export type DietObjective = "emagrecimento" | "hipertrofia" | "manutencao";

export type DietRequestStatus =
  | "pendente"
  | "em_analise"
  | "concluido"
  | "rejeitado";

export interface DietRequestPayload {
  objetivo: DietObjective;
  refeicoes_dia: string;
  suplementos: string;
  restricoes: string;
}

export interface DietRequest {
  request_id: number;
  user_uid: string;
  objetivo: string;
  restricoes: string;
  observacoes: string;
  status: DietRequestStatus;
  admin_feedback: string | null;
  created_at: string;
  updated_at: string | null;
}

// --- E-COMMERCE / CRÉDITOS (NOVO) ---

export interface CreditPackage {
  package_id: number;
  name: string;
  description: string | null;
  price: number;
  credits: number;
  type: "workout" | "diet";
  is_active: boolean;
  best_value: boolean;
  created_at: string;
}
