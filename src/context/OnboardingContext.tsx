import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { type OnboardingState } from "../types/onboarding";

type OnboardingcontextType = {
  onboardingData: OnboardingState;
  updateOnboardingData: (data: Partial<OnboardingState>) => void;
};

const initialState: OnboardingState = {
  personal: { altura_cm: 0, nome: "", genero: "", data_nascimento: "" },
  goals: { dias_treino: [], nivel_atividade: "", objetivo_atual: "" },
  measurements: {
    braco_cm: "",
    cintura_cm: "",
    coxa_cm: "",
    peso_kg: "",
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

  const handleUpdateData = useCallback((data: Partial<OnboardingState>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  }, []);

  const contextValue: OnboardingcontextType = {
    onboardingData,
    updateOnboardingData: handleUpdateData,
  };

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
