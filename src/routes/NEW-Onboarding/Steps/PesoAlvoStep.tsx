import React, { useEffect, useState } from "react";
import type { StepProps } from "../OnboardingWizard";
import { motion } from "framer-motion";

const PesoAlvoStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  //   const [targetWeight, setTargetWeight] = useState(70);

  const { personal, measurements } = onboardingData;
  const [pesoPerder, setPesoPerder] = useState(0);

  // Ao carregar, se o peso alvo não estiver definido, inicializa com o peso atual
  useEffect(() => {
    if (!personal.peso_alvo_kg) {
      const currentWeight = Number(measurements.peso_kg);
      if (currentWeight > 0) {
        updateOnboardingData({
          personal: { ...personal, peso_alvo_kg: currentWeight },
        });
      }
    }
    setStepvalid(true); // Este passo é sempre válido
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez na montagem

  useEffect(() => {
    if (personal.peso_alvo_kg) {
      setPesoPerder(personal.peso_alvo_kg - Number(measurements.peso_kg));
    }
  }, [personal.peso_alvo_kg, measurements.peso_kg]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col gap-10"
    >
      <div className="text-center">
        <h1 className=" text-gray-800 text-lg font-semibold mb-1">
          Qual o seu objetivo de peso?
        </h1>
        <p className="text-gray-500 text-sm text-center">
          Qual peso você deseja alcançar ao usar o app?
        </p>
      </div>
      <div className="flex flex-col items-center gap-8">
        <motion.div
          key={personal.peso_alvo_kg}
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="relative flex items-baseline justify-center"
        >
          <span className="text-6xl font-bold text-gray-800">
            {personal.peso_alvo_kg}
          </span>
          <span className="text-xl font-medium text-gray-500">kg</span>
        </motion.div>
        <input
          type="range"
          min="40"
          max="150"
          step="1"
          value={personal.peso_alvo_kg || ""}
          onChange={(e) =>
            updateOnboardingData({
              personal: { ...personal, peso_alvo_kg: Number(e.target.value) },
            })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
      </div>
      <div className="flex flex-col w-full text-center">
        <motion.p
          key={pesoPerder}
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={
            "text-4xl font-semibold " +
            (pesoPerder < 0 ? "text-red-500" : "text-green-500")
          }
        >
          {`${pesoPerder} kg`}
        </motion.p>
        <p className="text-md text-gray-500">{`para ${
          pesoPerder < 0 ? "perder" : "ganhar"
        }`}</p>
      </div>
    </motion.div>
  );
};

export default PesoAlvoStep;
