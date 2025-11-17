import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect } from "react";
import type { StepProps } from "../OnboardingWizard";

const GerandoPlanoStep: React.FC<StepProps> = ({
  onboardingData,
  setStepvalid,
  setOnboardLoading,
  onboardLoading,
}) => {
  useEffect(() => {
    // Em um cenário real, aqui você faria a chamada de API
    // para gerar o plano do usuário usando `onboardingData`.
    setStepvalid(false);
    setOnboardLoading(true);
    const timer = setTimeout(() => {
      setOnboardLoading(false);
      setStepvalid(true);
    }, 4000); // Simula um tempo de carregamento de 4 segundos

    return () => clearTimeout(timer);
  }, [onboardingData, setOnboardLoading, setStepvalid]);

  return (
    <div className="flex flex-col items-center justify-center text-center gap-8 pt-10">
      <AnimatePresence mode="wait">
        {onboardLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center gap-6"
          >
            {/* Você pode substituir este SVG por um GIF ou uma animação Lottie */}
            <svg
              className="animate-spin h-12 w-12 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold text-gray-800">
                Aguarde um momento...
              </h1>
              <p className="text-gray-500 text-sm">
                Estamos criando seu plano personalizado com base nos seus dados.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.7 }}
            className="flex flex-col items-center justify-center text-center gap-4"
          >
            <div className="bg-green-100 rounded-full p-4">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Plano gerado com sucesso!
            </h1>
            <p className="text-gray-500 text-sm">
              Tudo pronto para você começar sua jornada.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GerandoPlanoStep;
