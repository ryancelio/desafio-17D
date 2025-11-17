import { motion } from "framer-motion";
import React, { useEffect, useState, useCallback } from "react";
import type { StepProps } from "../OnboardingWizard";
import { LuCircleCheck as LuCheckCircle, LuStar } from "react-icons/lu";

type Plano = "padrao" | "padrao_treino" | "padrao_dieta" | "completo";

type Faturamento = "mensal" | "anual";

const planosInfo = {
  completo: {
    nome: "Completo",
    precos: { mensal: "R$ 79,90", anual: "R$ 799,90" },
    features: [
      "Tudo do Padrão",
      "Acompanhamento de Treino",
      "Acompanhamento de Dieta",
    ],
    destaque: true,
  },
  padrao: {
    nome: "Padrão",
    precos: { mensal: "R$ 29,90", anual: "R$ 299,90" },
    features: ["Plano de dieta personalizado", "Plano de treino personalizado"],
    destaque: false,
  },
  padrao_treino: {
    nome: "Padrão + Treino",
    precos: { mensal: "R$ 49,90", anual: "R$ 499,90" },
    features: ["Tudo do Padrão", "Acompanhamento profissional de treino"],
    destaque: false,
  },
  padrao_dieta: {
    nome: "Padrão + Dieta",
    precos: { mensal: "R$ 59,90", anual: "R$ 599,90" },
    features: ["Tudo do Padrão", "Acompanhamento profissional de dieta"],
    destaque: false,
  },
};

export const PlanosStep: React.FC<StepProps> = ({ setStepvalid }) => {
  const [faturamento, setFaturamento] = useState<Faturamento>("anual");
  const [planoSelecionado, setPlanoSelecionado] = useState<Plano>("completo");

  const handleSelectPlano = useCallback((planoId: Plano) => {
    setPlanoSelecionado(planoId);
    // Futuramente, você pode adicionar aqui a lógica para salvar o plano e o faturamento
    // em um estado local ou contexto separado, se necessário para o checkout.
    // Ex: setCheckoutData({ plano: planoId, faturamento });
  }, []);

  useEffect(() => {
    // A etapa é sempre válida, pois um plano já vem pré-selecionado.
    setStepvalid(!!planoSelecionado);
  }, [planoSelecionado, setStepvalid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Escolha seu plano
        </h1>
        <p className="text-gray-500">
          Comece sua jornada para uma vida mais saudável hoje.
        </p>
      </div>

      {/* Seletor Mensal/Anual */}
      <div className="flex justify-center mb-8">
        <div className="relative flex p-1 bg-gray-200 rounded-full">
          <span
            className={`absolute top-1 bottom-1 transition-transform duration-300 ease-in-out bg-white shadow-md rounded-full ${
              faturamento === "mensal" ? "left-1 w-24" : "left-[102px] w-24"
            }`}
          />
          <button
            onClick={() => setFaturamento("mensal")}
            className="relative z-10 px-6 py-2 text-sm font-semibold rounded-full"
          >
            Mensal
          </button>
          <button
            onClick={() => setFaturamento("anual")}
            className="relative z-10 px-6 py-2 text-sm font-semibold rounded-full"
          >
            Anual
          </button>
        </div>
      </div>

      {/* Cards de Planos */}
      <div className="space-y-4">
        {(Object.keys(planosInfo) as Plano[]).map((planoId) => {
          const plano = planosInfo[planoId];
          const isSelected = planoSelecionado === planoId;
          const isDestaque = plano.destaque;

          return (
            <motion.div
              key={planoId}
              initial={{ scale: 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectPlano(planoId)}
              className={`relative p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 bg-white"
              } ${isDestaque && "border-indigo-600"}`}
            >
              {isDestaque && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <LuStar className="w-3 h-3" />
                  MAIS VENDIDO
                </div>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {plano.nome}
                  </h3>
                  <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    {plano.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <LuCheckCircle className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-indigo-600">
                    {plano.precos[faturamento]}
                  </p>
                  <p className="text-xs text-gray-500">/{faturamento}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PlanosStep;
