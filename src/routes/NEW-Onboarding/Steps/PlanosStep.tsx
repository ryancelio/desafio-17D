import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useMemo } from "react";
import type { StepProps } from "../OnboardingWizard";
import {
  LuCheck,
  LuLoaderCircle as LuLoader2,
  LuSparkles,
  LuTriangleAlert,
  LuTimer,
  LuShieldCheck,
  LuTrophy,
  LuUsers,
} from "react-icons/lu";
import type { Plan } from "../../../types/api-types";
import { getPlans } from "../../../api/apiClient";

type Faturamento = "monthly" | "annual";

export const PlanosStep: React.FC<StepProps> = ({
  setStepvalid,
  updateOnboardingData,
}) => {
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [faturamento, setFaturamento] = useState<Faturamento>("monthly");
  const [planoSelecionadoId, setPlanoSelecionadoId] = useState<number | null>(
    null
  );

  const [timeLeft, setTimeLeft] = useState({ m: 60, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { m: prev.m - 1, s: 59 };
        return { m: 15, s: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Carregar Planos ---
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPlans(true);

        if (Array.isArray(data)) {
          // --- LÓGICA DE ORDENAÇÃO CORRIGIDA ---
          const sortedData = data.sort((a, b) => {
            // Converte para String para garantir a comparação com o JSON ("5")
            const idA = String(a.id);
            const idB = String(b.id);

            // 1. Prioridade Absoluta: ID 5 (Completo Promocional)
            if (idA === "5") return -1;
            if (idB === "5") return 1;

            // 2. Prioridade Secundária: Planos Featured (Ex: Completo ID 1)
            const isAFeatured = a.is_featured;
            const isBFeatured = b.is_featured;

            if (isAFeatured && !isBFeatured) return -1;
            if (!isAFeatured && isBFeatured) return 1;

            // 3. Desempate por preço (maior preço primeiro)
            return b.price_monthly - a.price_monthly;
          });

          setAllPlans(sortedData);
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

  // --- Filtragem Dinâmica ---
  const displayedPlans = useMemo(() => {
    return allPlans.filter((plan) => {
      if (faturamento === "annual") {
        // Garante que converte para número antes de comparar
        return Number(plan.price_annually) > 0.01;
      }
      return true;
    });
  }, [allPlans, faturamento]);

  // --- Seleção ---
  const handleSelectPlano = (plan: Plan, tipoFaturamento: Faturamento) => {
    setPlanoSelecionadoId(Number(plan.id)); // Garante number no state
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

  // Mantém seleção válida
  useEffect(() => {
    if (planoSelecionadoId) {
      const plan = displayedPlans.find(
        (p) => Number(p.id) === planoSelecionadoId
      );
      if (plan) {
        handleSelectPlano(plan, faturamento);
      } else {
        setPlanoSelecionadoId(null);
        setStepvalid(false);
      }
    } else if (displayedPlans.length > 0) {
      // Auto-selecionar: Tenta o ID 5, senão o primeiro featured
      const promoPlan = displayedPlans.find((p) => String(p.id) === "5");
      const featured = displayedPlans.find((p) => p.is_featured);

      if (promoPlan) {
        handleSelectPlano(promoPlan, faturamento);
      } else if (featured) {
        handleSelectPlano(featured, faturamento);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faturamento, displayedPlans]);

  useEffect(() => {
    setStepvalid(!!planoSelecionadoId);
  }, [planoSelecionadoId, setStepvalid]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LuLoader2 className="animate-spin w-10 h-10 text-indigo-600" />
        <p className="text-gray-500 text-sm font-medium">
          Carregando ofertas...
        </p>
      </div>
    );

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
          Escolha seu Plano
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          Desbloqueie todo o seu potencial hoje mesmo.
        </p>
      </div>

      {/* Toggle */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md py-4 mb-2 flex justify-center shadow-xs">
        <div className="relative bg-gray-100 p-1.5 rounded-2xl flex items-center shadow-inner w-72">
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
          </button>
        </div>
      </div>

      {/* Lista de Planos */}
      <div className="space-y-5 px-1 mt-6">
        <AnimatePresence mode="wait">
          {displayedPlans.map((plan) => {
            // Normaliza IDs para comparação segura
            const planIdString = String(plan.id);
            const isSelected = planoSelecionadoId === Number(plan.id);

            // É o promocional SE for ID "5" OU se estiver marcado como featured
            // Mas o ID "5" ganha tratamento especial de texto
            const isPromoID = planIdString === "5";
            const isFeatured = plan.is_featured || isPromoID;

            // Lógica de Escassez (Vagas)
            const hasLimit =
              plan.max_limit !== null &&
              plan.max_limit !== undefined &&
              Number(plan.max_limit) > 0;
            const isScarcityPlan =
              hasLimit ||
              plan.name.toLowerCase().includes("promocional") ||
              isPromoID;

            const maxLimit = Number(plan.max_limit) || 10;
            const currentUsage = Number(plan.current_usage) || 0;
            const spotsLeft = Math.max(0, maxLimit - currentUsage);

            const monthlyPrice = Number(plan.price_monthly);
            const annualPriceTotal = Number(plan.price_annually);
            const annualPricePerMonth = annualPriceTotal / 12;
            const displayPrice =
              faturamento === "monthly" ? monthlyPrice : annualPricePerMonth;
            const originalPrice = displayPrice * 1.8;
            const economyPct =
              monthlyPrice > 0 && annualPriceTotal > 0
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
                animate={{ opacity: 1, scale: isSelected ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectPlano(plan, faturamento)}
                className={`
                  relative overflow-hidden rounded-3xl transition-all duration-300 cursor-pointer group
                  ${
                    isSelected
                      ? `border-2 ${
                          isFeatured
                            ? "border-indigo-600 bg-indigo-50/30"
                            : "border-gray-900 bg-gray-50"
                        } shadow-xl ring-2 ${
                          isFeatured ? "ring-indigo-600/20" : "ring-gray-200"
                        }`
                      : isFeatured
                      ? "border-2 border-indigo-200 bg-linear-to-br from-white to-indigo-50/50 shadow-lg hover:border-indigo-400 hover:shadow-indigo-100"
                      : "border border-gray-200 bg-white hover:border-gray-300 shadow-sm hover:shadow-md opacity-90"
                  }
                `}
              >
                {/* BADGE SUPERIOR DIREITO */}
                {isFeatured && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-indigo-600 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl shadow-md flex items-center gap-1.5">
                      <LuSparkles className="w-3 h-3" />{" "}
                      {isPromoID ? "OFERTA EXCLUSIVA" : "MAIS ESCOLHIDO"}
                    </div>
                  </div>
                )}

                {/* --- HEADER DIFERENCIADO: TIMER ou VAGAS --- */}
                {isFeatured && (
                  <>
                    {isScarcityPlan ? (
                      // 1. BARRA DE VAGAS RESTANTES
                      <div className="bg-linear-to-r from-red-600 to-orange-600 py-2 px-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                          <LuUsers className="w-4 h-4 text-white" />
                          <span className="text-[11px] font-bold tracking-wide uppercase">
                            VAGAS LIMITADAS
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold backdrop-blur-sm border border-white/20">
                          Restam apenas {spotsLeft}
                        </div>
                      </div>
                    ) : (
                      // 2. BARRA DE TIMER
                      <div className="bg-linear-to-r from-indigo-600 to-violet-600 py-2 px-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                          <LuTrophy className="w-4 h-4 text-yellow-300" />
                          <span className="text-[11px] font-bold tracking-wide uppercase">
                            Oferta Premium
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold backdrop-blur-sm">
                          <LuTimer className="w-3 h-3" />
                          {String(timeLeft.m).padStart(2, "0")}:
                          {String(timeLeft.s).padStart(2, "0")}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div
                  className={`p-5 flex flex-col sm:flex-row gap-5 ${
                    isFeatured ? "pt-6" : ""
                  }`}
                >
                  {/* Informações do Plano */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`text-xl font-extrabold ${
                          isSelected || isFeatured
                            ? "text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {plan.name}
                      </h3>
                      {/* Badge de Economia no Anual */}
                      {faturamento === "annual" &&
                        economyPct > 0 &&
                        !isFeatured && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            -{economyPct}%
                          </span>
                        )}
                    </div>

                    <p className="text-xs text-gray-500 mb-4 font-medium">
                      {isPromoID
                        ? "Aproveite 30 dias grátis na assinatura mensal!"
                        : isFeatured
                        ? "Acesso completo a todas as ferramentas."
                        : "Para quem está começando."}
                    </p>

                    <ul className="space-y-2.5">
                      {plan.features?.slice(0, 4).map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm text-gray-600"
                        >
                          <div
                            className={`mt-0.5 p-0.5 rounded-full ${
                              isSelected || isFeatured
                                ? "bg-indigo-100 text-indigo-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <LuCheck className="w-3 h-3 stroke-[3px]" />
                          </div>
                          <span className="leading-snug font-medium">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Preço */}
                  <div className="flex flex-col justify-center items-start sm:items-end border-t sm:border-t-0 sm:border-l border-gray-100/50 pt-4 sm:pt-0 sm:pl-5 mt-2 sm:mt-0 min-w-25">
                    <span className="text-xs text-gray-400 line-through font-semibold mb-0.5">
                      De {formatCurrency(originalPrice)}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-gray-500">
                        R$
                      </span>
                      <span
                        className={`text-4xl font-extrabold tracking-tight ${
                          isFeatured ? "text-indigo-600" : "text-gray-900"
                        }`}
                      >
                        {Math.floor(displayPrice)}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ,{(displayPrice % 1).toFixed(2).substring(2)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium mb-2">
                      /mês
                    </span>

                    {faturamento === "annual" ? (
                      <div className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md font-bold whitespace-nowrap border border-indigo-100">
                        12x de {formatCurrency(annualPricePerMonth)}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 font-medium">
                        Cobrado mensalmente
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkbox Visual de Seleção */}
                <div
                  className={`absolute top-4 right-4 transition-all duration-300 ${
                    isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
                >
                  <div className="bg-indigo-600 text-white rounded-full p-1.5 shadow-lg">
                    <LuCheck className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Garantia */}
      <div className="mx-4 mt-8 bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex items-center gap-4 relative overflow-hidden">
        <div className="bg-green-50 text-green-600 p-3 rounded-full shrink-0">
          <LuShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">
            Garantia Incondicional
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Teste por 7 dias. Não gostou? Devolvemos 100% do valor.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PlanosStep;
