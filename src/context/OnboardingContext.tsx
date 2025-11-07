import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router";

// --- DEFINIÇÃO DE TIPOS ---
// Baseado nos seus schemas de DB

export type UserProfileData = {
  nome: string;
  data_nascimento: string;
  genero: "masculino" | "feminino" | "outro" | "";
  altura_cm: number | "";
  objetivo_atual: "perder_peso" | "manter_peso" | "ganhar_massa" | "";
  nivel_atividade:
    | "sedentario"
    | "leve"
    | "moderado"
    | "ativo"
    | "muito_ativo"
    | "";
  dias_treino: string[]; // ex: ['SEG', 'TER', 'QUA']
};

type MeasurementData = {
  data_medicao: string;
  peso_kg: number | "";
  cintura_cm: number | "";
  quadril_cm: number | "";
  braco_cm: number | "";
  coxa_cm: number | "";
};

export type Preference = {
  id: string; // Para key do React
  tipo_restricao:
    | "alergia"
    | "intolerancia"
    | "preferencia"
    | "limitacao_fisica";
  valor: string;
};

type OnboardingData = {
  profile: UserProfileData;
  measurements: MeasurementData;
  preferences: Preference[];
};

interface IOnboardingContext {
  formData: OnboardingData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  currentStep: number;
  totalSteps: number;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  isLoading: boolean;
  submitOnboarding: () => Promise<void>;
}

// --- ESTADO INICIAL ---
const initialState: OnboardingData = {
  profile: {
    nome: "",
    data_nascimento: "",
    genero: "",
    altura_cm: "",
    objetivo_atual: "",
    nivel_atividade: "",
    dias_treino: [],
  },
  measurements: {
    data_medicao: new Date().toISOString().split("T")[0], // Auto-preenchido
    peso_kg: "",
    cintura_cm: "",
    quadril_cm: "",
    braco_cm: "",
    coxa_cm: "",
  },
  preferences: [],
};

// --- CRIAÇÃO DO CONTEXTO ---
const OnboardingContext = createContext<IOnboardingContext | undefined>(
  undefined
);

// --- HOOK CUSTOMIZADO ---
// eslint-disable-next-line react-refresh/only-export-components
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error(
      "useOnboarding deve ser usado dentro de um OnboardingProvider"
    );
  }
  return context;
};

// --- PROVIDER ---
const steps = [
  "/onboarding/profile",
  "/onboarding/goals",
  "/onboarding/measurements",
  "/onboarding/preferences",
  "/onboarding/complete",
];

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<OnboardingData>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentStep = steps.indexOf(location.pathname) + 1;
  const totalSteps = steps.length - 1; // Não contamos a tela de "completo"

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      navigate(steps[currentStep]);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      navigate(steps[currentStep - 2]);
    }
  };

  // Função de finalização (Etapa 5)
  const submitOnboarding = async () => {
    setIsLoading(true);
    console.log("Enviando para API:", formData);
    // Simula uma chamada de API
    // await apiClient.post('/onboarding/complete', formData);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    navigate("/dashboard"); // Redireciona para o app principal
  };

  const value = {
    formData,
    setFormData,
    currentStep,
    totalSteps,
    handleNextStep,
    handlePrevStep,
    isLoading,
    submitOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
