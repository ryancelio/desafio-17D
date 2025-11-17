import { motion } from "framer-motion";
import React, { useEffect } from "react";
import type { StepProps } from "../OnboardingWizard";
import {
  optionalNumericString,
  type IMeasurementsData,
} from "../../../types/onboarding.schema";
import z from "zod";

const TodasMedidasStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStep,
  setStepvalid,
}) => {
  const TodasMedidasSchema = z.object({
    cintura_cm: z
      .string()
      .min(1, "Cintura é obrigatório.") // Não pode ser ""
      .pipe(
        z.preprocess(
          (val) =>
            typeof val === "string" && val.trim() === "" ? undefined : val,

          z.coerce
            .number({ error: "Peso deve ser um número." })
            .positive("Peso deve ser maior que 0.")
        )
      ),
    quadril_cm: z
      .string()
      .min(1, "Quadril é obrigatório.") // Não pode ser ""
      .pipe(
        z.preprocess(
          (val) =>
            typeof val === "string" && val.trim() === "" ? undefined : val,

          z.coerce
            .number({ error: "Peso deve ser um número." })
            .positive("Peso deve ser maior que 0.")
        )
      ),
    braco_cm: z
      .string()
      .min(1, "Braço é obrigatório.") // Não pode ser ""
      .pipe(
        z.preprocess(
          (val) =>
            typeof val === "string" && val.trim() === "" ? undefined : val,

          z.coerce
            .number({ error: "Peso deve ser um número." })
            .positive("Peso deve ser maior que 0.")
        )
      ),
    coxa_cm: z
      .string()
      .min(1, "Coxa é obrigatório.") // Não pode ser ""
      .pipe(
        z.preprocess(
          (val) =>
            typeof val === "string" && val.trim() === "" ? undefined : val,

          z.coerce
            .number({ error: "Peso deve ser um número." })
            .positive("Peso deve ser maior que 0.")
        )
      ),
  });

  const medidas: { value: keyof IMeasurementsData; label: string }[] = [
    { value: "cintura_cm", label: "Cintura" },
    { value: "quadril_cm", label: "Quadril" },
    { value: "braco_cm", label: "Braço" },
    { value: "coxa_cm", label: "Coxa" },
  ];

  useEffect(() => {
    const result = TodasMedidasSchema.safeParse(onboardingData.measurements);

    setStepvalid(result.success);
  });

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
              value={onboardingData.measurements[med.value] || ""}
              onChange={(e) => {
                const value = e.target.value;
                updateOnboardingData({
                  measurements: {
                    ...onboardingData.measurements,
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
        <button
          onClick={() => setStep((prev) => prev + 1)}
          className="text-gray-500 text-center underline underline-offset-3"
        >
          Pular
        </button>
      </div>
    </motion.div>
  );
};

export default TodasMedidasStep;
