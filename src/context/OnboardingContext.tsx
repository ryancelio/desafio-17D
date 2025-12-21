import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { type OnboardingState } from "../types/onboarding.schema";
import { useAuth } from "./AuthContext";

type OnboardingcontextType = {
  onboardingData: OnboardingState;
  updateOnboardingData: (data: Partial<OnboardingState>) => void;
  isStepValid: boolean;
  setStepValid: (isvalid: boolean) => void;
};

const initialState: OnboardingState = {
  personal: {
    altura_cm: 0,
    nome: "",
    genero: null,
    data_nascimento: "",
    email: "",
    dias_treino: [],
    nivel_atividade: "moderado",
    objetivo_atual: "definir",
    peso_alvo_kg: null,
    telefone: null,
    local_treino: "academia",
  },
  measurements: {
    braco_cm: undefined,
    cintura_cm: undefined,
    coxa_cm: undefined,
    peso_kg: 70,
    quadril_cm: undefined,
  },
  preferences: [],
  selectedPlan: null,
  fotosProgresso: [],
  password: "",
};

const OnboardingContext = createContext<OnboardingcontextType | undefined>(
  undefined
);

export default function OnboardingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [onboardingData, setOnboardingData] =
    useState<OnboardingState>(initialState);
  const [isStepValid, setStepValid] = useState(false);

  const handleUpdateData = useCallback((data: Partial<OnboardingState>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  }, []);

  const contextValue = useMemo(
    () => ({
      onboardingData,
      updateOnboardingData: handleUpdateData,
      isStepValid,
      setStepValid,
    }),
    [onboardingData, handleUpdateData, isStepValid]
  );

  const { firebaseUser, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se o usuário está logado e já completou o onboarding (verificando um campo chave),
    // redireciona para o dashboard.
    // eslint-disable-next-line no-constant-condition
    if (firebaseUser && userProfile?.profile.data_nascimento && false) {
      navigate("/dashboard", { replace: true });
    }
  }, [firebaseUser, userProfile, navigate]);

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (context === undefined) {
    throw new Error(
      "useOnboarding deve ser usado dentro de um OnboardingProvider"
    );
  }

  return context;
}
