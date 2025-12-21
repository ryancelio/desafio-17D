import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "../OnboardingWizard";

export const SenhaStep: React.FC<StepProps> = ({
  updateOnboardingData,
  setStepvalid,
  onboardingData,
}) => {
  // Inicializa com valor existente ou vazio
  const [senha, setSenha] = useState("");

  useEffect(() => {
    // Validação simples: mínimo 6 caracteres
    const isValid = senha.length >= 6;
    setStepvalid(isValid);

    // Atualiza o estado global (assumindo que você adicionará 'password' ao seu schema ou usará um campo temporário)
    // Se o typescript reclamar, você precisará adicionar 'password' ao seu tipo OnboardingState
    updateOnboardingData({
      ...onboardingData,
      password: senha,
    });
  }, [senha, setStepvalid, updateOnboardingData]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crie uma senha segura
        </h1>
        <p className="text-gray-500">
          Você usará esta senha para acessar seu plano e acompanhar seu
          progresso.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo de 6 caracteres"
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            autoFocus
          />
        </div>

        <p className="text-xs text-gray-400 text-center">
          Sua conta será protegida com criptografia de ponta a ponta.
        </p>
      </div>
    </motion.div>
  );
};

export default SenhaStep;
