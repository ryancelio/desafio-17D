import { motion } from "framer-motion";
import React, { useEffect } from "react";
import type { StepProps } from "../OnboardingWizard";
import z from "zod";
import { FaPhone } from "react-icons/fa6";

// Função auxiliar para máscara de telefone (BR)
const formatPhone = (value: string) => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, "");

  // Limita a 11 dígitos
  const truncated = numbers.slice(0, 11);

  // Aplica a máscara (XX) XXXXX-XXXX
  if (truncated.length > 10) {
    return truncated.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (truncated.length > 5) {
    return truncated.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (truncated.length > 2) {
    return truncated.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
  } else {
    return truncated.replace(/^(\d*)/, "$1");
  }
};

const TelefoneStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  useEffect(() => {
    // Schema corrigido: Remove caracteres não numéricos antes de validar
    const telefoneSchema = z
      .string()
      .min(1, "Obrigatório")
      .transform((val) => val.replace(/\D/g, "")) // Remove (), -, espaços
      .refine(
        (val) => val.length >= 10,
        "Telefone inválido (mínimo 10 dígitos)"
      );

    const telephoneToValidate = onboardingData.personal.telefone || "";

    // safeParse vai rodar o transform e depois o refine
    const result = telefoneSchema.safeParse(telephoneToValidate);

    setStepvalid(result.success);
  }, [onboardingData.personal.telefone, setStepvalid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Aplica a máscara visualmente antes de salvar no estado
    const rawValue = e.target.value;
    const formattedValue = formatPhone(rawValue);

    updateOnboardingData({
      personal: {
        ...onboardingData.personal,
        telefone: formattedValue,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col gap-10"
    >
      <div className="text-center">
        <h1 className=" text-gray-800 text-lg font-semibold mb-1">
          Qual o seu número de contato?
        </h1>
        <p className="text-gray-500 text-sm text-center">
          Usaremos para comunicações importantes.
        </p>
      </div>

      <div className="relative group max-w-xs mx-auto w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaPhone className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-300" />
        </div>
        <input
          type="tel"
          placeholder="(11) 99999-9999"
          autoFocus
          value={onboardingData.personal.telefone || ""}
          onChange={handleChange}
          maxLength={15} // (11) 99999-9999 tem 15 caracteres
          className={`
            border-gray-300 focus:border-indigo-600 pl-10 border-b-2 
            w-full text-xl font-medium py-2 px-1 text-gray-800 
            bg-transparent focus:outline-none transition-colors duration-300
            placeholder:text-gray-300
          `}
        />
      </div>
    </motion.div>
  );
};

export default TelefoneStep;
