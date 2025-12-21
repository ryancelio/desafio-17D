import { motion } from "framer-motion";
import React, { useEffect } from "react";
import type { StepProps } from "../OnboardingWizard";
import z from "zod";

const TodasMedidasStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStep,
  setStepvalid,
}) => {
  // CORREÇÃO: O Schema agora espera números (z.coerce.number)
  // pois você salva como Number no onChange.
  const TodasMedidasSchema = z.object({
    cintura_cm: z.coerce
      .number()
      .min(1, "Cintura é obrigatória.")
      .optional()
      .or(z.literal(0)), // Aceita 0 ou undefined se for opcional mesmo
    quadril_cm: z.coerce
      .number()
      .min(1, "Quadril é obrigatório.")
      .optional()
      .or(z.literal(0)),
    braco_cm: z.coerce
      .number()
      .min(1, "Braço é obrigatório.")
      .optional()
      .or(z.literal(0)),
    coxa_cm: z.coerce
      .number()
      .min(1, "Coxa é obrigatório.")
      .optional()
      .or(z.literal(0)),
  });

  // Se você quiser que seja OBRIGATÓRIO (não opcional), use este schema simplificado:
  /*
  const TodasMedidasSchema = z.object({
    cintura_cm: z.coerce.number().min(1),
    quadril_cm: z.coerce.number().min(1),
    braco_cm: z.coerce.number().min(1),
    coxa_cm: z.coerce.number().min(1),
  });
  */

  const medidas: {
    value: keyof typeof onboardingData.measurements;
    label: string;
  }[] = [
    { value: "cintura_cm", label: "Cintura" },
    { value: "quadril_cm", label: "Quadril" },
    { value: "braco_cm", label: "Braço" },
    { value: "coxa_cm", label: "Coxa" },
  ];

  useEffect(() => {
    // Valida os dados atuais
    const result = TodasMedidasSchema.safeParse(onboardingData.measurements);

    // Se o resultado for sucesso, libera o botão.
    // Se quiser permitir passar em branco (pois é opcional),
    // você pode forçar true se os campos forem undefined.
    // Mas com o Schema ajustado acima, ele vai passar.
    setStepvalid(result.success);
  }, [onboardingData.measurements, setStepvalid]); // Adicionada dependência para atualizar sempre que digitar

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col gap-10"
    >
      <div className="text-center">
        <h1 className=" text-gray-800 text-lg font-semibold mb-1">
          Quais as suas medidas?
        </h1>
        <p className="text-gray-500 text-sm align-text-top flex-col flex">
          Usaremos elas para acompanhar seu progresso, e para recomendar treinos
          especificos para você.
          <span className="text-gray-400">(Opcional)</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8">
        {medidas.map((med) => (
          <div key={med.value} className="relative">
            <label
              htmlFor={med.value}
              className="absolute -top-3 left-2 inline-block bg-white px-1 text-sm font-medium text-gray-600"
            >
              {med.label}
            </label>
            <input
              type="number"
              id={med.value}
              name={med.value}
              min={0}
              placeholder="0"
              // Garante que o valor não seja undefined no input (evita warning do React)
              value={onboardingData.measurements?.[med.value] ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                updateOnboardingData({
                  measurements: {
                    ...onboardingData.measurements,
                    // Se estiver vazio, salva como undefined, senão converte pra Number
                    [med.value]: value === "" ? undefined : Number(value),
                  },
                });
              }}
              className="block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            />
          </div>
        ))}
      </div>
      <div className="w-full text-center">
        {/* O botão pular força a validação para true antes de mudar o step manualmente se necessário, 
            mas aqui ele apenas avança o step localmente */}
        <button
          onClick={() => {
            setStepvalid(true); // Garante que não bloqueie se clicar em pular
            setStep((prev) => prev + 1);
          }}
          className="text-gray-500 text-center underline underline-offset-3"
        >
          Pular
        </button>
      </div>
    </motion.div>
  );
};

export default TodasMedidasStep;
