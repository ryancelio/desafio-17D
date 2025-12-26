import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Utensils,
  Sparkles,
  Lock,
  TriangleAlert,
  // Plus,
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  ChevronRight,
  Salad,
  PlusCircle, // Importado novo ícone
} from "lucide-react";
import { Toaster, toast } from "sonner";

import apiClient, { isApiError } from "../../../../api/apiClient";
import type {
  GetUserDietsResponse,
  DietPlanResponse,
  AllCreditsResponse,
} from "../../../../types/api-types";
import { useAuth } from "../../../../context/AuthContext";
import UpgradeModal from "../../dashboard/Components/UpgradeModal";
import type { DietRequest } from "../../../../types/models";

// --- Componente: Card da Dieta ---
const DietCard: React.FC<{ plan: DietPlanResponse }> = ({ plan }) => {
  return (
    <Link to={`/dieta/${plan.plan_id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-emerald-200 transition-all cursor-pointer"
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
              <Utensils className="h-3 w-3" /> Nutrição
            </span>
            <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">
              {plan.calorias_meta} kcal
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
            {plan.nome}
          </h3>
        </div>

        {/* Resumo de Refeições */}
        <div className="flex-1 px-5 pb-4 space-y-2">
          {plan.meals.slice(0, 3).map((meal) => (
            <div
              key={meal.meal_id}
              className="flex justify-between items-center text-sm text-gray-600"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                <span className="truncate">{meal.nome}</span>
              </div>
              <span className="text-xs text-gray-400 shrink-0 ml-2">
                {meal.horario?.slice(0, 5)}
              </span>
            </div>
          ))}
          {plan.meals.length > 3 && (
            <p className="text-xs text-gray-400 pl-3.5 pt-1">
              + {plan.meals.length - 3} refeições
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

// --- Componente: Card de Pedido ---
const RequestCard: React.FC<{ req: DietRequest }> = ({ req }) => {
  const statusConfig = {
    pendente: {
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: Clock,
      label: "Em Análise",
    },
    em_analise: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Loader2,
      label: "Criando Plano",
    },
    concluido: {
      color: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle2,
      label: "Concluído",
    },
    rejeitado: {
      color: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
      label: "Recusado",
    },
  };

  const config = statusConfig[req.status] || statusConfig.pendente;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-4"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.color} uppercase tracking-wide`}
          >
            <Icon className="w-3 h-3" /> {config.label}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(req.created_at).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-800 truncate">
          Solicitação de Dieta Personalizada
        </p>
        {req.status === "rejeitado" && req.admin_feedback && (
          <p className="text-xs text-red-500 mt-1 line-clamp-1">
            Motivo: {req.admin_feedback}
          </p>
        )}
      </div>
      {req.status === "concluido" && (
        <div className="bg-gray-50 p-2 rounded-full text-gray-400">
          <ChevronRight className="w-5 h-5" />
        </div>
      )}
    </motion.div>
  );
};

// --- Página Principal ---

export default function DietPlansPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"plans" | "requests">("plans");
  const [plans, setPlans] = useState<GetUserDietsResponse>([]);
  const [requests, setRequests] = useState<DietRequest[]>([]);
  const [allCredits, setCredits] = useState<AllCreditsResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  // Acesso aos créditos de dieta
  const credits = allCredits?.diet;

  // Lógica de permissão
  const hasAccess = useMemo(() => {
    const planName = userProfile?.subscription?.plan_name?.toLowerCase() || "";
    return (
      planName.includes("nutri") ||
      planName.includes("completo") ||
      planName.includes("premium") ||
      planName.includes("dieta")
    );
  }, [userProfile]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [plansData, creditsData, requestsData] = await Promise.all([
          apiClient.getUserDiets(),
          apiClient.getAllCredits(),
          apiClient.getDietRequests(),
        ]);

        setPlans(plansData);
        setCredits(creditsData);
        setRequests(requestsData);
      } catch (err) {
        if (isApiError(err)) {
          setError(err.response?.data.error || "Erro");
        } else {
          setError("Falha ao carregar planos alimentares.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRequestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!hasAccess) {
      setShowUpgradeModal(true);
      return;
    }
    if (credits && !credits.can_request) {
      toast.error("Limite mensal atingido", {
        description: `Seus créditos renovam em ${new Date(
          allCredits!.next_reset_date
        ).toLocaleDateString()}.`,
        action: {
          label: "Comprar Crédito",
          onClick: () => navigate("/loja/creditos?type=diet"), // Redireciona para loja
        },
      });
      return;
    }
    navigate("/dieta/solicitar");
  };

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    );

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="bg-red-50 p-4 rounded-full text-red-500">
          <TriangleAlert className="h-8 w-8" />
        </div>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-emerald-600 font-bold hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-center" />

      <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto pb-24">
        {/* HEADER & CRÉDITOS */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Utensils className="h-6 w-6 text-emerald-600" />
                Dieta
              </h1>
              <p className="text-sm text-gray-500">
                Seus cardápios personalizados.
              </p>
            </div>

            {/* Display de Créditos */}
            {credits && hasAccess && (
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    Créditos
                  </span>
                  <span
                    className={`text-sm font-bold flex items-center gap-1 ${
                      credits.details.total_remaining > 0
                        ? "text-emerald-700"
                        : "text-red-500"
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    {credits.details.total_remaining}
                  </span>
                </div>

                {/* BOTÃO NOVO: Comprar Mais */}
                <button
                  onClick={() => navigate("/loja/creditos?type=diet")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center"
                  title="Comprar mais créditos"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="grid grid-cols-2 gap-3">
            {/* <Link
              to="#" // Futuramente: Criar Dieta Manual
              onClick={(e) => {
                e.preventDefault();
                toast.info("Em breve", {
                  description:
                    "Ferramenta de criação manual em desenvolvimento.",
                });
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 py-3 text-sm font-bold text-gray-700 shadow-sm active:bg-gray-50 opacity-60 cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Criar Manual
            </Link> */}

            <button
              onClick={handleRequestClick}
              className={`relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md active:scale-[0.98] overflow-hidden ${
                hasAccess ? "bg-gray-900" : "bg-gray-700 opacity-90"
              }`}
            >
              {hasAccess && (
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent z-0"></div>
              )}
              <div className="relative z-10 flex items-center gap-2">
                {hasAccess ? (
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
                Solicitar Nutri
              </div>
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur py-2">
          <div className="flex p-1 bg-gray-200/50 rounded-xl">
            <button
              onClick={() => setActiveTab("plans")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "plans"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Salad className="w-4 h-4" />
              Planos Ativos
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "requests"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <History className="w-4 h-4" />
              Meus Pedidos
            </button>
          </div>
        </div>

        {/* CONTEÚDO */}
        <AnimatePresence mode="wait">
          {activeTab === "plans" ? (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {plans.length === 0 ? (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                  <Utensils className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>Nenhum plano alimentar ativo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {plans.map((p) => (
                    <DietCard key={p.plan_id} plan={p} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="requests"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {requests.length === 0 ? (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                  <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nenhuma solicitação encontrada.</p>
                  <button
                    onClick={handleRequestClick}
                    className="text-emerald-600 text-sm font-bold mt-2 hover:underline"
                  >
                    Solicitar agora
                  </button>
                </div>
              ) : (
                requests.map((req) => (
                  <RequestCard key={req.request_id} req={req} />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => navigate("/assinatura")}
      />
    </>
  );
}
