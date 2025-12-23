import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import type { StepProps } from "../OnboardingWizard";
import {
  LuCheck,
  LuLoaderCircle as LuLoader2,
  LuSparkles,
  LuTriangleAlert,
} from "react-icons/lu";
import apiClient from "../../../api/apiClient"; // Ajuste o caminho conforme sua estrutura
import type { Plan } from "../../../types/api-types";

// Tipo para controle de faturamento
type Faturamento = "monthly" | "annual";

export const PlanosStep: React.FC<StepProps> = ({
  setStepvalid,
  updateOnboardingData,
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [faturamento, setFaturamento] = useState<Faturamento>("annual");
  const [planoSelecionadoId, setPlanoSelecionadoId] = useState<number | null>(
    null
  );

  // --- Carregar Planos via API Client ---
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getPlans();

        if (Array.isArray(data)) {
          setPlans(data);
        } else {
          throw new Error("Formato de dados inválido.");
        }
      } catch (err) {
        console.error("Erro ao buscar planos:", err);
        setError("Não foi possível carregar as ofertas no momento.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // --- Lógica de Seleção ---
  const handleSelectPlano = (plan: Plan, tipoFaturamento: Faturamento) => {
    setPlanoSelecionadoId(plan.id);
    const finalPrice =
      tipoFaturamento === "monthly" ? plan.price_monthly : plan.price_annually;

    updateOnboardingData({
      selectedPlan: {
        plan_id: plan.id.toString(),
        title: plan.name,
        price: finalPrice,
        planType: tipoFaturamento,
      },
    });
  };

  // Atualiza a seleção se mudar o faturamento (mantendo o mesmo plano selecionado)
  useEffect(() => {
    if (planoSelecionadoId) {
      const plan = plans.find((p) => p.id === planoSelecionadoId);
      if (plan) handleSelectPlano(plan, faturamento);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faturamento]);

  // Validação do Step
  useEffect(() => {
    setStepvalid(!!planoSelecionadoId);
  }, [planoSelecionadoId, setStepvalid]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  // --- Renderização de Loading ---
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LuLoader2 className="animate-spin w-10 h-10 text-indigo-600" />
        <p className="text-gray-500 text-sm font-medium">
          Carregando ofertas exclusivas...
        </p>
      </div>
    );

  // --- Renderização de Erro ---
  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
        <div className="bg-red-50 p-4 rounded-full">
          <LuTriangleAlert className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-gray-600 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-indigo-600 font-bold hover:underline text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto pb-4"
    >
      <div className="text-center mb-8 px-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Invista em você
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          Escolha o plano ideal para atingir seus objetivos com acompanhamento
          profissional.
        </p>
      </div>

      {/* Toggle Profissional (Mensal/Anual) */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md py-4 mb-4 flex justify-center">
        <div className="relative bg-gray-100 p-1.5 rounded-2xl flex items-center shadow-inner w-72">
          {/* Fundo Animado */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-sm border border-gray-200"
            initial={false}
            animate={{
              x: faturamento === "monthly" ? 0 : "100%",
              width: "50%",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />

          <button
            onClick={() => setFaturamento("monthly")}
            className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors rounded-xl text-center ${
              faturamento === "monthly"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mensal
          </button>

          <button
            onClick={() => setFaturamento("annual")}
            className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors rounded-xl text-center flex items-center justify-center ${
              faturamento === "annual"
                ? "text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Anual
            {faturamento !== "annual" && (
              <span className="absolute -top-3 -right-2 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200 shadow-sm z-20 whitespace-nowrap">
                -73% OFF
              </span>
            )}
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 shadow-sm z-20 whitespace-nowrap">
              até 12x
            </span>
          </button>
        </div>
      </div>

      {/* Lista de Planos */}
      <div className="space-y-4 px-1 mt-8">
        <AnimatePresence mode="wait">
          {plans.map((plan) => {
            const isSelected = planoSelecionadoId === plan.id;

            const monthlyPrice = Number(plan.price_monthly);
            const annualPriceTotal = Number(plan.price_annually);
            const annualPricePerMonth = annualPriceTotal / 12;

            const displayPrice =
              faturamento === "monthly" ? monthlyPrice : annualPricePerMonth;

            // Evita divisão por zero
            const economyPct =
              monthlyPrice > 0
                ? Math.round(
                    ((monthlyPrice * 12 - annualPriceTotal) /
                      (monthlyPrice * 12)) *
                      100
                  )
                : 0;

            return (
              <motion.div
                key={plan.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectPlano(plan, faturamento)}
                className={`
                  relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer group
                  ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100 ring-1 ring-indigo-600/20"
                      : "border-gray-100 bg-white hover:border-indigo-200 shadow-sm hover:shadow-md"
                  }
                `}
              >
                {/* Badge de Recomendado (Lógica baseada no nome ou flag is_featured) */}
                {(plan.name === "Completo" || plan.is_featured) && (
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-indigo-600 to-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                    <div className="flex items-center gap-1">
                      <LuSparkles className="w-3 h-3" /> RECOMENDADO
                    </div>
                  </div>
                )}

                <div className="p-5 flex flex-col sm:flex-row gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3
                        className={`text-lg font-bold ${
                          isSelected ? "text-indigo-900" : "text-gray-800"
                        }`}
                      >
                        {plan.name}
                      </h3>
                      {faturamento === "annual" && economyPct > 0 && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-md border border-green-200">
                          Economize {economyPct}%
                        </span>
                      )}
                    </div>

                    <ul className="space-y-2 mt-3">
                      {plan.features?.slice(0, 4).map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm text-gray-600"
                        >
                          <div
                            className={`mt-0.5 p-0.5 rounded-full ${
                              isSelected
                                ? "bg-indigo-100 text-indigo-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <LuCheck className="w-3 h-3 stroke-[3px]" />
                          </div>
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col justify-center items-start sm:items-end border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-5 mt-2 sm:mt-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-gray-400">
                        R$
                      </span>
                      <span
                        className={`text-3xl font-extrabold tracking-tight ${
                          isSelected ? "text-indigo-600" : "text-gray-900"
                        }`}
                      >
                        {displayPrice.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium mb-1">
                      /mês
                    </span>

                    {faturamento === "annual" ? (
                      <div className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-md mt-1 font-medium whitespace-nowrap border border-gray-100">
                        Cobrado anualmente {formatCurrency(annualPriceTotal)}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 mt-1 font-medium">
                        Cobrado mensalmente
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`absolute top-4 right-4 transition-all duration-300 ${
                    isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
                >
                  <div className="bg-indigo-600 text-white rounded-full p-1 shadow-md">
                    <LuCheck className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-8 text-center px-6">
        <p className="text-xs text-gray-400 leading-relaxed">
          A renovação é automática. Você pode cancelar a qualquer momento nas
          configurações da sua conta para evitar cobranças futuras.
        </p>
      </div>
    </motion.div>
  );
};

export default PlanosStep;
