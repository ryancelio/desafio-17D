import { WheelPickerWrapper, WheelPicker } from "@ncdai/react-wheel-picker";
import { motion } from "framer-motion";
// import type { NivelAtividade } from "../../../types/onboarding.schema";
import type { StepProps } from "../OnboardingWizard";
import { useEffect } from "react";
import type { NivelAtividade } from "../../../types/models";

export const NivelAtvdStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  const activityLevels = [
    { value: "sedentario", label: "Sedentário" },
    { value: "leve", label: "Leve" },
    { value: "moderado", label: "Moderado" },
    { value: "ativo", label: "Ativo" },
    { value: "muito_ativo", label: "Muito Ativo" },
  ];
  const { personal } = onboardingData;

  useEffect(() => {
    if (!personal.nivel_atividade) {
      setStepvalid(false);
    } else {
      setStepvalid(true);
    }
  }, [personal.nivel_atividade, setStepvalid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col gap-5"
    >
      <div className="text-center">
        <h1 className=" text-gray-800 text-lg font-semibold mb-1">
          Seu Nível de Atividade
        </h1>
        <p className="text-gray-500 text-sm text-center">
          Como você descreveria seu nível de atividade física?
        </p>
      </div>
      <WheelPickerWrapper className="text-2xl">
        <WheelPicker
          options={activityLevels}
          value={personal.nivel_atividade}
          onValueChange={(value) =>
            updateOnboardingData({
              personal: {
                ...personal,
                nivel_atividade: value as NivelAtividade,
              },
            })
          }
          classNames={{
            optionItem: "text-gray-400 text-lg",
            highlightWrapper: "bg-gray-100 rounded-xl text-gray-950 ",
            highlightItem: "text-xl font-semibold",
          }}
        />
      </WheelPickerWrapper>
    </motion.div>
  );
};
