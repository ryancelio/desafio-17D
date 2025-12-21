/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext"; // Ajuste o caminho
import { useNavigate } from "react-router";
import apiClient from "../../../api/apiClient"; // Ajuste o caminho
import {
  CalendarClock as LuCalendarClock,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ArrowUpRight,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Tipos
interface Plan {
  id: number;
  name: string;
  price_monthly: number;
  price_annually: number;
  features: string[];
  is_featured: number;
}

export default function SubscriptionPage() {
  const { userProfile, refetchProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "annual"
  );

  // Carregar Planos Disponíveis
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Endpoint que retorna SELECT * FROM plans
        const data = await apiClient.getPlans();
        setPlans(data);
      } catch (error) {
        console.error("Erro ao buscar planos", error);
      } finally {
        setIsLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  // Dados da Assinatura Atual
  const sub = userProfile?.subscription;
  const hasActivePlan = sub?.status === "active";
  const isCancelled = sub?.status === "cancelled";
  const planName = sub?.plan_name || "Gratuito";

  // Data de expiração/renovação formatada
  const dateLabel = hasActivePlan
    ? sub?.payment_method === "annual_prepaid"
      ? "Expira em"
      : "Renova em"
    : isCancelled
    ? "Acesso até"
    : "";

  const formattedDate = sub?.expires_at
    ? new Date(sub.expires_at).toLocaleDateString("pt-BR")
    : null;

  // Handler de Cancelamento
  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      await apiClient.cancelSubscription(); // Chama api/cancel_subscription.php
      await refetchProfile(); // Atualiza o contexto global
      setShowCancelModal(false);
      alert("Assinatura cancelada com sucesso.");
    } catch (error: any) {
      console.error(error);
      alert(
        "Erro ao cancelar: " +
          (error.response?.data?.error || "Tente novamente.")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler de Troca de Plano
  const handleSelectPlan = (plan: Plan) => {
    // Redireciona para o Checkout passando o plano selecionado
    // Você pode usar state do location ou query params
    navigate("/checkout", {
      state: {
        selectedPlan: {
          plan_id: plan.id,
          title: plan.name,
          price:
            billingCycle === "monthly"
              ? plan.price_monthly
              : plan.price_annually,
          planType: billingCycle,
        },
      },
    });
  };

  if (authLoading || isLoadingPlans) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-200 sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-gray-900">Assinatura</h1>
        <p className="text-gray-500 text-sm">Gerencie seu plano e cobranças.</p>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* --- CARD DO PLANO ATUAL --- */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
            Meu Plano
          </h2>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 p-6 md:p-8 shadow-xl text-white">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">{planName}</h3>
                      {isCancelled && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-bold uppercase rounded border border-red-500/30">
                          Cancelado
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">
                      {hasActivePlan
                        ? "Sua assinatura está ativa"
                        : isCancelled
                        ? "Assinatura encerrada"
                        : "Plano Gratuito"}
                    </p>
                  </div>
                </div>

                {hasActivePlan && (
                  <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ativo
                  </div>
                )}
              </div>

              {formattedDate && (
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-sm text-slate-300">
                  <LuCalendarClock className="w-4 h-4 text-indigo-400" />
                  <span>
                    {dateLabel}:{" "}
                    <strong className="text-white">{formattedDate}</strong>
                  </span>
                </div>
              )}

              {/* Botão de Cancelar (Apenas se ativo) */}
              {hasActivePlan && (
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancelar assinatura
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* --- SELETOR DE OUTROS PLANOS (UPGRADE) --- */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Mudar de Plano
              </h2>
              <p className="text-sm text-gray-500">
                Escolha um novo plano para fazer upgrade.
              </p>
            </div>

            {/* Toggle Mensal/Anual */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${
                  billingCycle === "annual"
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Anual{" "}
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    billingCycle === "annual"
                      ? "bg-white/20 text-white"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  -17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              // Pula o plano atual se estiver ativo (opcional)
              // if (plan.name === planName && hasActivePlan) return null;

              const price =
                billingCycle === "monthly"
                  ? plan.price_monthly
                  : plan.price_annually / 12;
              const isCurrent = plan.name === planName && hasActivePlan;

              return (
                <div
                  key={plan.id}
                  className={`
                        relative flex flex-col p-5 rounded-2xl border-2 transition-all bg-white
                        ${
                          isCurrent
                            ? "border-indigo-600 ring-1 ring-indigo-600/20"
                            : "border-transparent shadow-sm hover:border-gray-200"
                        }
                    `}
                >
                  {plan.is_featured === 1 && billingCycle === "annual" && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                      RECOMENDADO
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-sm font-medium text-gray-400">
                        R$
                      </span>
                      <span className="text-3xl font-extrabold text-gray-900">
                        {price.toLocaleString("pt-BR", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-xs text-gray-400">/mês</span>
                    </div>
                    {billingCycle === "annual" && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        Cobrado anualmente R${" "}
                        {Number(plan.price_annually).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.slice(0, 4).map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent}
                    className={`
                            w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                            ${
                              isCurrent
                                ? "bg-gray-100 text-gray-400 cursor-default"
                                : "bg-gray-900 text-white hover:bg-black active:scale-[0.98] shadow-lg shadow-gray-200"
                            }
                        `}
                  >
                    {isCurrent ? (
                      "Plano Atual"
                    ) : (
                      <>
                        Assinar Agora <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* MODAL DE CANCELAMENTO */}
      <AnimatePresence>
        {showCancelModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => !isProcessing && setShowCancelModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-6 rounded-3xl shadow-2xl w-[90%] max-w-sm text-center"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cancelar assinatura?
              </h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Você perderá acesso aos recursos Premium ao final do ciclo atual
                ({formattedDate}). Esta ação não pode ser desfeita.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCancelSubscription}
                  disabled={isProcessing}
                  className="w-full bg-red-50 text-red-600 py-3.5 rounded-xl font-bold border border-red-100 hover:bg-red-100 transition-colors flex justify-center items-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Sim, confirmar cancelamento"
                  )}
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={isProcessing}
                  className="w-full bg-white text-gray-700 py-3.5 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Manter meu plano
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
