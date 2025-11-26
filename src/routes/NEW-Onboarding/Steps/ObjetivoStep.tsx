import { motion } from "framer-motion";
import { LuWeight } from "react-icons/lu";
import type { Objetivo } from "../../../types/onboarding.schema";
import type { StepProps } from "../OnboardingWizard";
import { useEffect } from "react";

export const ObjetivoStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  const objetivos = [
    { value: "perder_peso", label: "Perder Peso", icon: LuWeight },
    { value: "definir", label: "Definir", icon: LuWeight },
    { value: "ganhar_massa", label: "Ganhar Massa", icon: LuWeight },
  ];

  const { personal } = onboardingData;

  useEffect(() => {
    if (!personal.objetivo_atual) {
      setStepvalid(false);
    } else {
      setStepvalid(true);
    }
  }, [personal.objetivo_atual, setStepvalid]);

  const handleObjetivoClick = (value: Objetivo) => {
    updateOnboardingData({
      personal: { ...personal, objetivo_atual: value },
    });
    // if (!touched.objetivo_atual) {
    //   handleBlur("objetivo_atual");
    // }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="block text-center mb-6">
          <label className=" text-gray-800 text-lg font-semibold mb-1">
            Qual é o seu objetivo atual?
          </label>
          <p className="text-gray-500 text-sm text-center">
            Conte-nos o que você quer alcançar ao realizar seus treinos e dieta
          </p>
        </div>

        {/* Substituímos o 'select' por este 'div' */}
        <div className="flex flex-col gap-2 px-8">
          {objetivos.map((obj) => {
            const ativo = onboardingData.personal.objetivo_atual === obj.value;
            return (
              <motion.button
                key={obj.value}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => handleObjetivoClick(obj.value as Objetivo)} // The text will be centered automatically
                className={`relative py-4 rounded-xl border text-md transition-all duration-200 flex items-center justify-center px-8 ${
                  ativo
                    ? "bg-[#FCC3D2] text-gray-800 border-transparent shadow-sm"
                    : "bg-white/70 border-gray-300 text-gray-600 hover:bg-[#A8F3DC]/50"
                }`}
              >
                <obj.icon className="absolute left-8" /> {obj.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
