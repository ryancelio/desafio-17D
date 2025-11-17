import React, { useState } from "react";
import { type OnboardingState } from "../../types/onboarding.schema";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useOnboarding } from "../../context/OnboardingContext";
import { LuChevronLeft, LuTriangleAlert } from "react-icons/lu";

import { DataNascStep } from "./Steps/DataNascStep";
import { ObjetivoStep } from "./Steps/ObjetivoStep";
import { NivelAtvdStep } from "./Steps/NivelAtvdStep";
import { GeneroStep } from "./Steps/GeneroStep";
import MedidasStep from "./Steps/MedidasStep";
import PesoAlvoStep from "./Steps/PesoAlvoStep";
import NomeStep from "./Steps/NomeStep";
import EmailStep from "./Steps/EmailStep";
import TodasMedidasStep from "./Steps/TodasMedidasStep";
import DiasTreinoStep from "./Steps/DiasTreinoStep";
import PlanosStep from "./Steps/PlanosStep";
import GerandoPlanoStep from "./Steps/GerandoPlanoStep";
import DashboardPreviewStep from "./Steps/DashboardPreviewStep";

// Define the props for each individual step component
export interface StepProps {
  onboardingData: OnboardingState;
  updateOnboardingData: (data: Partial<OnboardingState>) => void;
  setStepvalid: (isvalid: boolean) => void;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  onboardLoading: boolean;
  setOnboardLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// --- The Main Onboarding Component ---

const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const buttonControls = useAnimation();
  const { onboardingData, updateOnboardingData, isStepValid, setStepValid } =
    useOnboarding();

  const [error, setError] = useState<string | null>(null);

  const [onboardLoading, setOnboardLoading] = useState(false);

  // const buttonSpring: Transition = {
  //   type: "spring",
  //   stiffness: 500,
  //   damping: 30,
  // };
  const stepComponents = [
    ObjetivoStep,
    NivelAtvdStep,
    GeneroStep,
    DataNascStep,
    MedidasStep,
    PesoAlvoStep,
    TodasMedidasStep,
    DiasTreinoStep,
    NomeStep,
    EmailStep,
    GerandoPlanoStep,
    DashboardPreviewStep,
    PlanosStep,
  ];

  // StepComponents + LastStep, so +1
  const LAST_STEP = stepComponents.length;

  const CurrentStepComponent = stepComponents[step];

  const prevDisabled = step <= 0;
  const nextDisabled = step >= LAST_STEP;

  const submitOnboarding = () => {
    console.log("Final onboarding data:", onboardingData);
    // API call to submit the data
  };

  const handleNav = (direction: "prev" | "next") => {
    // Voltar
    if (direction === "prev") {
      if (prevDisabled) return;

      // setAnimationDirection(-1);
      setStep(step - 1);

      return;
    }

    // Continuar
    if (!isStepValid) {
      setError("Preencha os campos obrigatórios.");

      buttonControls.start({
        x: [0, -8, 8, -8, 0], // Animação de "shake"
        transition: { duration: 0.4, ease: "easeInOut" },
      });

      return;
    }

    setError(null);

    if (nextDisabled) return;

    // setAnimationDirection(1);
    setStep(step + 1);
  };

  const buttonContent = (): string => {
    if (onboardLoading) {
      return "Carregando";
    } else if (step === LAST_STEP) {
      return "Enviar";
    } else {
      return "Continuar";
    }
  };

  const buttonOnClick = () => {
    if (step === LAST_STEP - 1) {
      handleNav("next");
    } else if (step === LAST_STEP) {
      // Se for o último passo (DashboardPreviewStep), finalize o onboarding
      submitOnboarding();
    } else {
      // Para todos os outros passos, apenas navegue
      handleNav("next");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white">
      {/* Header */}
      <div className="relative w-full px-4 py-4 text-2xl flex gap-4 items-center z-10 bg-white/80 backdrop-blur-sm">
        <button
          onClick={() => handleNav("prev")}
          className="w-8 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          disabled={prevDisabled}
        >
          <LuChevronLeft />
        </button>
        {/* Progress Indicator */}
        <div className="grow w-full h-2 bg-gray-200 rounded-full">
          <motion.div
            className="h-2 bg-gray-800 rounded-full"
            animate={{
              width: `${(step / stepComponents.length) * 100}%`,
            }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
          />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <main className="grow grid place-items-center w-full overflow-y-auto px-10 pt-8 pb-40">
        {CurrentStepComponent ? (
          <CurrentStepComponent
            onboardingData={onboardingData}
            updateOnboardingData={updateOnboardingData}
            setStepvalid={setStepValid}
            setStep={setStep}
            setOnboardLoading={setOnboardLoading}
            onboardLoading={onboardLoading}
          />
        ) : (
          <div>
            <h2>Thank you, {onboardingData.personal.nome}!</h2>
            <p>Onboarding complete.</p>
            {/* <button onClick={submitOnboarding}>Finish</button> */}
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-transparent">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: "105%" }}
              animate={{ opacity: 1, scale: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring" }}
              className="mb-3 flex items-center justify-center gap-2 
                             bg-red-100 border border-red-300 text-red-700 
                             px-3 py-2 mt-4 rounded-lg text-sm font-medium"
            >
              <LuTriangleAlert className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          className={
            "grow w-full bg-black text-white font-bold text-xl rounded-xl py-4 " +
            `${onboardLoading ? "cursor-not-allowed bg-gray-700" : " bg-black"}`
          }
          onClick={buttonOnClick}
          disabled={onboardLoading}
          animate={buttonControls}
        >
          {`${buttonContent()}`}
        </motion.button>
      </div>
    </div>
  );
};

export default OnboardingWizard;
