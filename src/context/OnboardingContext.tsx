import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type OnboardingState } from "../types/onboarding.schema";

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
    genero: "",
    data_nascimento: "",
    email: "",
  },
  goals: {
    dias_treino: [],
    nivel_atividade: "moderado",
    objetivo_atual: "",
    peso_alvo: 60,
  },
  measurements: {
    braco_cm: "",
    cintura_cm: "",
    coxa_cm: "",
    peso_kg: "70",
    quadril_cm: "",
  },
  preferences: [],
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
