import { WheelPicker, WheelPickerWrapper } from "@ncdai/react-wheel-picker";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { StepProps } from "../OnboardingWizard";

export const DataNascStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  const { personal } = onboardingData;
  const dataNasc = personal.data_nascimento
    ? new Date(personal.data_nascimento)
    : new Date();

  const [dia, setDia] = useState(() => dataNasc.getDate());
  const [mes, setMes] = useState(() => dataNasc.getMonth());
  const [ano, setAno] = useState(() => dataNasc.getFullYear());

  // Gera uma lista de anos (ex: últimos 100 anos)
  const getAnos = () => {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let i = anoAtual; i >= anoAtual - 100; i--) {
      anos.push({ value: i.toString(), label: i.toString() });
    }
    return anos;
  };

  const getMeses = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i.toString(),
      label: new Date(0, i).toLocaleString("default", { month: "long" }),
    }));
  };

  const getDias = () => {
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    return Array.from({ length: diasNoMes }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString(),
    }));
  };

  useEffect(() => {
    const novaData = new Date(ano, mes, dia);
    updateOnboardingData({
      personal: { ...personal, data_nascimento: novaData.toISOString() },
    });
    setStepvalid(true); // Assumindo que uma data é sempre válida aqui
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dia, mes, ano]);

  const wheelClass = {
    optionItem: "text-gray-400 ",
    highlightWrapper: "bg-gray-100 rounded-md text-gray-950 ",
    highlightItem: "",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="text-center mb-6 flex flex-col">
        <label className=" text-gray-800 text-xl font-semibold mb-2">
          Qual a sua data de nascimento?
        </label>
        <p className="text-gray-500 text-sm">
          Cada fase da vida tem necessidades diferentes
        </p>
      </div>
      <div className="flex justify-center items-start gap-4">
        <div className="flex flex-col items-center flex-1">
          <label className="text-gray-500 text-sm mb-2">Dia</label>
          <WheelPickerWrapper className="w-full">
            <WheelPicker
              options={getDias()}
              value={dia.toString()}
              onValueChange={(v) => setDia(Number(v))}
              classNames={wheelClass}
            />
          </WheelPickerWrapper>
        </div>
        <div className="flex flex-col items-center flex-2">
          <label className="text-gray-500 text-sm mb-2">Mês</label>
          <WheelPickerWrapper className="w-full">
            <WheelPicker
              options={getMeses()}
              value={mes.toString()}
              onValueChange={(v) => setMes(Number(v))}
              classNames={wheelClass}
            />
          </WheelPickerWrapper>
        </div>
        <div className="flex flex-col items-center flex-1">
          <label className="text-gray-500 text-sm mb-2">Ano</label>
          <WheelPickerWrapper className="w-full">
            <WheelPicker
              options={getAnos()}
              value={ano.toString()}
              onValueChange={(v) => setAno(Number(v))}
              classNames={wheelClass}
            />
          </WheelPickerWrapper>
        </div>
      </div>
    </motion.div>
  );
};
