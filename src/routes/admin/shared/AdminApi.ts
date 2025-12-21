import axios, { type AxiosInstance } from "axios";
import type { Exercise } from "../../../types/models";
import type { ExerciseMetadataResponse } from "../../../types/api-types";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://dealory.io/api/admin",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const ManageExerciseMetadata = {
  get: async (): Promise<ExerciseMetadataResponse> => {
    const response = await axiosInstance.get<ExerciseMetadataResponse>(
      "/taxonomies_manage.php"
    );
    return response.data;
  },
  post: async (data: any): Promise<ExerciseMetadataResponse> => {
    const response = await axiosInstance.post<ExerciseMetadataResponse>(
      "/taxonomies_manage.php",
      data
    );
    return response.data;
  },
  put: async (data: any): Promise<ExerciseMetadataResponse> => {
    const response = await axiosInstance.put<ExerciseMetadataResponse>(
      "/taxonomies_manage.php",
      data
    );
    return response.data;
  },
  delete: async (id: number): Promise<{ success: boolean }> => {
    // Axios delete envia dados via "params" (query string) ou "data" (body).
    // Seu PHP espera $_GET['id'] para delete, então usamos 'params' ou mudamos a URL.
    const response = await axiosInstance.delete("/taxonomies_manage.php", {
      params: { id }, // Isso gera /taxonomies_manage.php?id=123
    });
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
  post: async (data: any): Promise<any> => {
    const response = await axiosInstance.post<any>(
      "/exercises_manage.php",
      data
    );
    return response.data;
  },
  put: async (data: any): Promise<any> => {
    const response = await axiosInstance.put<any>(
      "/exercises_manage.php",
      data
    );
    return response.data;
  },
  delete: async (id: number): Promise<{ success: boolean }> => {
    const response = await axiosInstance.delete("/exercises_manage.php", {
      params: { id },
    });
    return response.data;
  },
};

export { ManageExerciseMetadata, ManageExercises };
