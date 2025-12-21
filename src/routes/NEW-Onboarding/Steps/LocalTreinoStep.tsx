import { motion } from "framer-motion";
import React, { useEffect } from "react";
import type { StepProps } from "../OnboardingWizard";
import {
  LuBuilding2,
  LuHouse as LuHome,
  LuCircleCheck as LuCheckCircle2,
} from "react-icons/lu";

const LocalTreinoStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  const selectedLocal = onboardingData.personal.local_treino;

  // Libera o botão "Continuar" apenas se houver uma seleção
  useEffect(() => {
    setStepvalid(!!selectedLocal);
  }, [selectedLocal, setStepvalid]);

  const handleSelect = (local: "academia" | "casa") => {
    updateOnboardingData({
      personal: {
        ...onboardingData.personal,
        local_treino: local,
      },
    });
  };

  const options = [
    {
      id: "academia",
      label: "Academia",
      description: "Tenho acesso a equipamentos e pesos variados.",
      icon: LuBuilding2,
      color: "indigo",
    },
    {
      id: "casa",
      label: "Em Casa",
      description: "Treino com peso do corpo ou equipamentos leves.",
      icon: LuHome,
      color: "green",
    },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col gap-6 w-full max-w-sm mx-auto"
    >
      <div className="text-center mb-2">
        <h1 className="text-gray-900 text-2xl font-bold mb-2">
          Onde você vai treinar?
        </h1>
        <p className="text-gray-500 text-sm">
          Vamos adaptar seus treinos e recomendações com base no seu ambiente.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {options.map((option) => {
          const isSelected = selectedLocal === option.id;
          const Icon = option.icon;

          // Cores dinâmicas baseadas na seleção
          const borderClass = isSelected
            ? option.color === "indigo"
              ? "border-indigo-600 bg-indigo-50"
              : "border-green-600 bg-green-50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50";

          const iconColorClass = isSelected
            ? option.color === "indigo"
              ? "text-indigo-600 bg-white"
              : "text-green-600 bg-white"
            : "text-gray-500 bg-gray-100";

          return (
            <motion.button
              key={option.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(option.id)}
              className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left w-full ${borderClass}`}
            >
              <div
                className={`p-3 rounded-xl shrink-0 transition-colors ${iconColorClass}`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1">
                <h3
                  className={`font-bold text-lg ${
                    isSelected ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {option.description}
                </p>
              </div>

              {isSelected && (
                <div
                  className={`absolute top-4 right-4 ${
                    option.color === "indigo"
                      ? "text-indigo-600"
                      : "text-green-600"
                  }`}
                >
                  <LuCheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default LocalTreinoStep;
