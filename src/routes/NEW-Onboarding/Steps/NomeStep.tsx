import { motion } from "framer-motion";
import React, { useEffect } from "react";
import type { StepProps } from "../OnboardingWizard";

const NomeStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  useEffect(() => {
    if (onboardingData.personal.nome === "") {
      setStepvalid(false);
    } else {
      setStepvalid(true);
    }
  }, [onboardingData.personal, setStepvalid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col gap-10"
    >
      <div className="text-center">
        <h1 className=" text-gray-800 text-lg font-semibold mb-1">
          Qual o seu nome?
        </h1>
        <p className="text-gray-500 text-sm text-center">
          Como você quer ser chamado?
        </p>
      </div>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-300"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Digite seu nome"
          autoFocus
          value={onboardingData.personal.nome || ""}
          onChange={(e) => {
            updateOnboardingData({
              personal: { ...onboardingData.personal, nome: e.target.value },
            });
          }}
          className="pl-10 border-b-2 border-gray-300 w-full text-xl font-medium py-2 px-1 text-gray-800 bg-transparent focus:outline-none focus:border-indigo-600 transition-colors duration-300"
        />
      </div>
    </motion.div>
  );
};

export default NomeStep;
