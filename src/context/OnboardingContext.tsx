import { createContext, useState, type ReactNode } from "react";
import type { OnboardingState } from "../types/onboarding";

const OnboardingContext = createContext<OnboardingState>({
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
});

export default function OnboardingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [personalInfo, setPersonalInfo] = useState();
}
