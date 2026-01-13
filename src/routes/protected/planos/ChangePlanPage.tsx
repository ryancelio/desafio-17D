import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import {
  LuArrowLeft,
  LuShieldCheck,
  LuCircleAlert as LuAlertCircle,
} from "react-icons/lu";

// Reutilizando seus componentes existentes
import { PlanosStep } from "../../NEW-Onboarding/Steps/PlanosStep";
import { Checkout } from "../../NEW-Onboarding/Steps/Checkout";

// Tipagem parcial para compatibilidade
import type { OnboardingState } from "../../../types/onboarding.schema";
import type { SubscriptionDetails } from "../../../types/models";
import { getUserProfile } from "../../../api/apiClient";

export default function ChangePlanPage() {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();

  // Controle de Etapas: 'selection' -> 'checkout'
  const [stage, setStage] = useState<"selection" | "checkout">("selection");
  const [currentPlan, setCurrentPlan] = useState<SubscriptionDetails | null>(
    null
  );
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  // Estado "Mock" para alimentar os componentes do Onboarding
  const [onboardingData, setOnboardingData] = useState<
    Partial<OnboardingState>
  >({
    selectedPlan: null,
  });

  const [isStepValid, setStepValid] = useState(false);

  // 1. Carregar Plano Atual
  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const data = await getUserProfile();
        setCurrentPlan(data.subscription);
      } catch (err) {
        console.error("Erro ao carregar plano atual", err);
      } finally {
        setLoadingCurrent(false);
      }
    };
    fetchCurrent();
  }, [firebaseUser]);

  // Função Mock para atualizar dados (passada para PlanosStep)
  const updateOnboardingData = (data: Partial<OnboardingState>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  // Handler para avançar
  const handleNext = () => {
    if (stage === "selection" && onboardingData.selectedPlan) {
      setStage("checkout");
    }
  };

  // --- Lógica de Comparação ---
  // Verifica se o plano selecionado é EXATAMENTE o mesmo que o usuário já tem
  const isSamePlan =
    currentPlan?.has_access &&
    // Mesmos IDs
    onboardingData.selectedPlan?.plan_id === currentPlan.plan_id?.toString() &&
    // Mesmos Ciclos (Mapeando front 'monthly'/'annual' para back 'monthly_subscription'/'annual_prepaid')
    ((onboardingData.selectedPlan?.planType === "monthly" &&
      currentPlan.payment_method === "monthly_subscription") ||
      (onboardingData.selectedPlan?.planType === "annual" &&
        currentPlan.payment_method === "annual_prepaid"));

  // Helper para exibir o nome do ciclo atual na UI
  const getCycleLabel = () => {
    if (currentPlan?.payment_method === "annual_prepaid") return "Anual";
    if (currentPlan?.payment_method === "monthly_subscription") return "Mensal";
    return "";
  };

  if (loadingCurrent)
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Carregando informações da assinatura...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Simples */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
        <button
          onClick={() =>
            stage === "checkout" ? setStage("selection") : navigate(-1)
          }
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <LuArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">
          {stage === "selection" ? "Gerenciar Assinatura" : "Finalizar Troca"}
        </h1>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 pb-32">
        {/* Aviso de Plano Atual */}
        {stage === "selection" && currentPlan?.has_access ? (
          <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-1">
                Seu plano atual
              </p>
              <p className="font-bold text-gray-800 text-lg">
                {currentPlan.plan_name} ({getCycleLabel()})
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Expira em:{" "}
                {currentPlan.expires_at
                  ? new Date(currentPlan.expires_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-full text-xs font-bold text-green-600 border border-green-100 flex items-center gap-1.5 shadow-sm">
              <LuShieldCheck className="w-4 h-4" /> Ativo
            </div>
          </div>
        ) : (
          /* Caso usuário não tenha plano ativo (ex: cancelado ou expirado) */
          stage === "selection" && (
            <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3 text-orange-800">
              <LuAlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">
                Você não possui um plano ativo no momento.
              </p>
            </div>
          )
        )}

        <AnimatePresence mode="wait">
          {stage === "selection" ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PlanosStep
                onboardingData={onboardingData as OnboardingState}
                updateOnboardingData={updateOnboardingData}
                setStepvalid={setStepValid}
                setStep={() => {}} // No-op
                onboardLoading={false}
                setOnboardLoading={() => {}} // No-op
              />
            </motion.div>
          ) : (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Checkout
                onboardingData={onboardingData as OnboardingState}
                updateOnboardingData={updateOnboardingData}
                setStepvalid={setStepValid}
                setStep={() => {}}
                onboardLoading={false}
                setOnboardLoading={() => {}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer de Ação (Apenas na seleção) */}
      {stage === "selection" && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleNext}
              disabled={!isStepValid || !!isSamePlan}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-[0.98] ${
                !isStepValid || isSamePlan
                  ? "bg-gray-300 cursor-not-allowed shadow-none text-gray-500"
                  : "bg-gray-900 hover:bg-black shadow-indigo-500/20"
              }`}
            >
              {isSamePlan
                ? "Este é seu plano atual"
                : "Continuar para Pagamento"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
