import axios, { type AxiosInstance, type AxiosError } from "axios";
import { auth } from "../firebase"; // 👈 Importe sua instância 'auth' do Firebase

// --- 1. DEFINIÇÃO DE TIPOS (Sem 'any') ---

/**
 * A estrutura de dados do usuário, conforme retornado pelo seu banco MySQL.
 * Corresponde ao JSON de 'get_user.php'.
 */
export interface UserProfile {
  uid: string;
  email: string;
  nome: string;
  isActive: boolean; // O PHP converte para (bool)
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Resposta padrão de sucesso para 'sync_user' e 'update_user'.
 */
export interface ApiResponse {
  message: string;
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
};

export default apiClient;
