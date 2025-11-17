import { motion } from "framer-motion";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import { IoMaleFemaleOutline } from "react-icons/io5";
import type { StepProps } from "../OnboardingWizard";
import { useEffect } from "react";

export const GeneroStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  const generos = [
    {
      value: "masculino",
      label: "Masculino",
      icon: BsGenderMale,
      activeClass: "bg-blue-200",
    },
    {
      value: "feminino",
      label: "Feminino",
      icon: BsGenderFemale,
      activeClass: "bg-[#FCC3D2]",
    },
    {
      value: "outro",
      label: "Outro",
      icon: IoMaleFemaleOutline,
      activeClass: "bg-gradient-to-r from-blue-200 to-[#FCC3D2]",
    },
  ];
  const { personal } = onboardingData;

  const handleGeneroClick = (value: "masculino" | "feminino" | "outro") => {
    updateOnboardingData({
      personal: { ...personal, genero: value },
    });
  };

  useEffect(() => {
    if (personal.genero === "") {
      setStepvalid(false);
    } else {
      setStepvalid(true);
    }
  }, [personal.genero, setStepvalid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="text-center mb-6 flex flex-col">
        <label className=" text-gray-800 text-xl font-semibold mb-2">
          A qual gênero você se identifica?
        </label>
        <p className="text-gray-500 text-sm align-text-top">
          {/* Conte-nos o que você quer alcançar ao realizar seus treinos e dieta */}
          Usamos alguns detalhes simples para melhorar seu acompanhamento
          nutricional, atividade fisica e plano de atividades. Tudo baseado em
          como seu corpo funciona
        </p>
      </div>

      {/* Substituímos o 'select' por este 'div' */}
      <div className="flex flex-col gap-2 px-8">
        {generos.map((gnr) => {
          const ativo = onboardingData.personal.genero === gnr.value;
          return (
            <motion.button
              key={gnr.value}
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                handleGeneroClick(
                  gnr.value as "masculino" | "feminino" | "outro"
                )
              } // The text will be centered automatically
              className={`relative py-4 rounded-xl border text-md transition-colors duration-200 flex items-center justify-center px-8 ${
                ativo
                  ? `${gnr.activeClass} text-gray-800 border-transparent shadow-sm`
                  : "bg-white/70 border-gray-300 text-gray-600 hover:bg-[#A8F3DC]/50"
              }`}
            >
              <gnr.icon className="absolute left-8" /> {gnr.label}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
