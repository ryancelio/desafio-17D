import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router"; // Importante: Importar o Link
import type { StepProps } from "../OnboardingWizard";
import { LuLock } from "react-icons/lu";

export const SenhaStep: React.FC<StepProps> = ({
  updateOnboardingData,
  setStepvalid,
  onboardingData,
}) => {
  const [senha, setSenha] = useState("");

  useEffect(() => {
    // Validação simples: mínimo 6 caracteres
    const isValid = senha.length >= 6;
    setStepvalid(isValid);

    updateOnboardingData({
      ...onboardingData,
      password: senha,
    });
  }, [senha, setStepvalid, updateOnboardingData]); // Removido onboardingData das dependências diretas para evitar loop, se necessário ajuste conforme seu linter

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

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <div className="relative">
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className="w-full p-4 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              autoFocus
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <LuLock />
            </div>
          </div>
        </div>

        {/* ÁREA DE CONCORDÂNCIA COM TERMOS */}
        <div className="text-center space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Ao clicar em continuar e criar sua conta, você declara que leu e
            concorda com os nossos{" "}
            <Link
              to="/termos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-bold hover:underline"
            >
              Termos de Uso
            </Link>
            .
          </p>

          <p className="text-[10px] text-gray-400">
            Sua conta será protegida com criptografia de ponta a ponta.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SenhaStep;
