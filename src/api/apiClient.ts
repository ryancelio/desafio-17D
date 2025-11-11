import axios, { type AxiosInstance, type AxiosError } from "axios";
import { auth } from "../firebase"; // 👈 Importe sua instância 'auth' do Firebase
import type { OnboardingState } from "../types/onboarding.schema";

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

export interface userPreferences {
  preference_id: number;
  user_uid: string;
  tipo_restricao:
    | "alergia"
    | "intolerancia"
    | "preferencia"
    | "limitacao_fisica";
  valor: string;
}

export interface userMeasurements {
  measurement_id: number;
  user_uid: string;
  data_medicao: string;
  peso_kg: number;
  cintura_cm: number | null;
  quadril_cm: number | null;
  braco_cm: number | null;
  coxa_cm: number | null;
  createdAt: string | null;
}

/**
 * Resposta padrão de sucesso para 'sync_user' e 'update_user'.
 */
export interface ApiResponse {
  message: string;
}

export interface WeightHistoryEntry {
  data_medicao: string; // "YYYY-MM-DD"
  peso_kg: number;
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

// --- 2. CONFIGURAÇÃO DO AXIOS ---

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("VITE_API_URL não está definida. Verifique seu arquivo .env");
}

/**
 * Instância principal do Axios.
 * Todas as requisições usarão esta instância.
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
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
  // Força a atualização do token se ele estiver expirado
  return user.getIdToken(true);
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
};

export default apiClient;
