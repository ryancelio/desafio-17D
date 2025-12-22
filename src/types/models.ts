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
  local_treino?: "academia" | "casa"; // Novo campo
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
  url_imagem: string;
  data_medicao: string;
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
  id: number; // Adicionado (necessário para CRUD)
  label: string;
  value: string;
  tipo: "musculo" | "tag";
  ordem: number; // Adicionado
  is_active: boolean; // Adicionado
}

export type Notification = {
  id: number | string;
  title: string;
  message: string;
  is_read: boolean | 1 | 0;
  created_at: string;
};
// Define os status possíveis exatamente como estão no Banco de Dados (ENUM)
export type WorkoutRequestStatus =
  | "pendente"
  | "em_analise"
  | "concluido"
  | "rejeitado";

// Interface do objeto de pedido individual
export interface WorkoutRequest {
  request_id: number;
  qtd_fichas: number;
  observacoes: string | null; // Pode vir nulo do banco
  status: WorkoutRequestStatus;
  admin_feedback: string | null; // Pode vir nulo se não foi rejeitado/analisado
  created_at: string; // PHP retorna timestamp como string ISO/Date string
  updated_at: string | null;
}

// --- Enumerações e Tipos Auxiliares ---

// Objetivo da dieta (usado no formulário)
export type DietObjective = "emagrecimento" | "hipertrofia" | "manutencao";

// Status do pedido (usado na listagem)
export type DietRequestStatus =
  | "pendente"
  | "em_analise"
  | "concluido"
  | "rejeitado";

// --- Interfaces de Formulário (Request Payload) ---

// O que é enviado no POST para criar o pedido
export interface DietRequestPayload {
  objetivo: DietObjective;
  refeicoes_dia: string; // Ex: "3", "4", "5"
  suplementos: string; // Ex: "Whey, Creatina"
  restricoes: string; // Texto livre (textarea)
}

// --- Interfaces de Resposta (Listagem / GET) ---

// O que vem do banco de dados na listagem de pedidos
export interface DietRequest {
  request_id: number;
  user_uid: string;
  objetivo: string; // Pode vir como string livre do banco ou ENUM dependendo da implementação
  restricoes: string; // Vem da coluna 'restricoes'
  observacoes: string; // Vem da coluna 'observacoes' (onde guardamos refeicoes_dia e suplementos concatenados)
  status: DietRequestStatus;
  admin_feedback: string | null;
  created_at: string; // ISO Date String
  updated_at: string | null;
}
