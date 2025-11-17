import { WheelPicker, WheelPickerWrapper } from "@ncdai/react-wheel-picker";
import { motion } from "framer-motion";
import type { StepProps } from "../OnboardingWizard";
import { useEffect, useState } from "react";

const MedidasStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  const getPeso: { value: string | number; label: string }[] = [];
  for (let i = 50; i <= 200; i++) {
    const weight = i;
    getPeso.push({ value: weight, label: `${weight} kg` });
  }

  const getAltura: { value: string | number; label: string }[] = [];
  for (let i = 100; i <= 250; i++) {
    getAltura.push({ value: i, label: `${i} cm` });
  }

  const wheelClass = {
    optionItem: "text-gray-400 ",
    highlightWrapper: "bg-gray-100 rounded-md text-gray-950 ",
    highlightItem: "",
  };

  const { personal, measurements } = onboardingData;

  const [peso, setPeso] = useState(Number(measurements.peso_kg) || 70);
  const [altura, setAltura] = useState(personal.altura_cm || 170);

  useEffect(() => {
    updateOnboardingData({
      personal: { ...personal, altura_cm: Number(altura) },
      measurements: { ...measurements, peso_kg: String(peso) },
    });

    setStepvalid(true); // Assumindo que é sempre válida aqui
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peso, altura]);

  return (
    //
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="text-center mb-6 flex flex-col">
        <label className=" text-gray-800 text-xl font-semibold mb-2">
          Quais são as suas medidas?
        </label>
        <p className="text-gray-500 text-sm align-text-top">
          Sua altura e peso nos ajuda a calular o seu IMC e personalziar sua
          nutrição e metas diárias
        </p>
      </div>
      <div className="flex justify-center items-start gap-4">
        <div className="flex flex-col items-center flex-1">
          <label className="text-gray-500 text-sm mb-2">Peso</label>
          <WheelPickerWrapper className="w-full">
            <WheelPicker
              options={getPeso}
              classNames={wheelClass}
              value={peso}
              onValueChange={(v) => setPeso(Number(v))}
            />
          </WheelPickerWrapper>
        </div>
        <div className="flex flex-col items-center flex-1">
          <label className="text-gray-500 text-sm mb-2">Altura</label>
          <WheelPickerWrapper className="w-full">
            <WheelPicker
              options={getAltura}
              classNames={wheelClass}
              value={altura}
              onValueChange={(v) => setAltura(Number(v))}
            />
          </WheelPickerWrapper>
        </div>
      </div>
    </motion.div>
  );
};

export default MedidasStep;
