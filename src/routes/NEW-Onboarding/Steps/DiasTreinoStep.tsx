import { motion } from "framer-motion";
import React, { useEffect } from "react";
import type { DiaSemana } from "../../../types/onboarding.schema";
import type { StepProps } from "../OnboardingWizard";

const diasSemana: { label: string; value: DiaSemana }[] = [
  { label: "Dom", value: "DOM" },
  { label: "Seg", value: "SEG" },
  { label: "Ter", value: "TER" },
  { label: "Qua", value: "QUA" },
  { label: "Qui", value: "QUI" },
  { label: "Sex", value: "SEX" },
  { label: "Sáb", value: "SAB" },
];
const DiasTreinoStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  const { goals } = onboardingData;

  const toggleDia = (dia: DiaSemana) => {
    const { dias_treino } = goals;
    const newList = dias_treino.includes(dia)
      ? dias_treino.filter((d) => d !== dia)
      : [...dias_treino, dia];

    updateOnboardingData({
      goals: { ...goals, dias_treino: newList },
    });
    // if (!touched.dias_treino) {
    //   handleBlur("dias_treino");
    // }
  };

  useEffect(() => {
    if (goals.dias_treino.length === 0) {
      setStepvalid(false);
    } else {
      setStepvalid(true);
    }
  }, [goals.dias_treino, setStepvalid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="block text-center mb-6">
        <label className=" text-gray-800 text-lg font-semibold mb-1">
          Quais dias você está disposto a treinar?
        </label>
        <p className="text-gray-500 text-sm text-center">
          Procure dedicar um tempo de 4 a 6 dias de sua semana para treinar.
        </p>
      </div>
      <div>
        {/* Dias de Treino */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 justify-center">
            {diasSemana.map((dia) => {
              const ativo = onboardingData.goals.dias_treino.includes(
                dia.value
              );
              return (
                <motion.button
                  type="button"
                  key={dia.value}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleDia(dia.value)}
                  className={`py-3 rounded-full border text-base font-medium transition-all duration-200 ${
                    ativo
                      ? "bg-indigo-600 text-white border-transparent shadow-md"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-indigo-50"
                  }`}
                >
                  {dia.label}
                </motion.button>
              );
            })}
          </div>
          {/* {renderError("dias_treino")} */}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DiasTreinoStep;
