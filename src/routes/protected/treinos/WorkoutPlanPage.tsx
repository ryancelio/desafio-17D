import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  TriangleAlert,
  FileText,
  User,
  Crown,
  Dumbbell,
  Plus,
  Sparkles,
  Lock,
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  History,
  type LucideProps,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";

import apiClient, { isApiError } from "../../../api/apiClient";
import { useAuth } from "../../../context/AuthContext";
import UpgradeModal from "../dashboard/Components/UpgradeModal";
import type {
  WorkoutPlan,
  WorkoutRequest,
  WorkoutRequestStatus,
} from "../../../types/models";
import type { AllCreditsResponse } from "../../../types/api-types";

// --- Subcomponente: Card da Ficha (Visualização de Treino) ---
const PlanCard: React.FC<{ plan: WorkoutPlan }> = ({ plan }) => {
  const musculos = useMemo(() => {
    const muscleSet = new Set<string>();
    plan.exercises.forEach((ex) => {
      ex.musculos_trabalhados?.forEach((m) => muscleSet.add(m));
    });
    return Array.from(muscleSet).slice(0, 3);
  }, [plan.exercises]);

  const ultimaExecucao = plan.data_ultima_execucao
    ? new Date(plan.data_ultima_execucao).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
    : "Nunca";

  return (
    <Link to={`/treinos/${plan.plan_id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{
          y: -4,
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-pasPink/50 transition-all relative"
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            {plan.criada_por === "ADMIN" ? (
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-gray-800 bg-pasPink border border-pasPink/50 px-2 py-1 rounded-full">
                <Crown className="h-3 w-3" />
                Pro
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-gray-800 bg-pasGreen border border-pasGreen/50 px-2 py-1 rounded-full">
                <User className="h-3 w-3" />
                Pessoal
              </span>
            )}
            <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">
              {ultimaExecucao}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-pasPink transition-colors">
            {plan.nome}
          </h3>
        </div>

        <div className="flex-1 px-5 pb-4 space-y-2">
          <ul className="space-y-2">
            {plan.exercises.slice(0, 3).map((ex) => (
              <li
                key={ex.plan_exercise_id}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-pasPink shrink-0"></div>
                <span className="truncate">{ex.nome_exercicio}</span>
              </li>
            ))}
            {plan.exercises.length > 3 && (
              <li className="text-xs text-gray-400 font-medium pl-3.5">
                + {plan.exercises.length - 3} exercícios
              </li>
            )}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50/50 p-4">
          {musculos.map((musculo) => (
            <span
              key={musculo}
              className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-gray-500 shadow-sm uppercase tracking-wide"
            >
              {musculo}
            </span>
          ))}
        </div>
      </motion.div>
    </Link>
  );
};

// --- Subcomponente: Card de Pedido (Histórico) ---
const RequestCard: React.FC<{ req: WorkoutRequest }> = ({ req }) => {
  const statusConfig: Record<
    WorkoutRequestStatus,
    {
      color: string;
      icon: React.ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
      >;
      label: string;
    }
  > = {
    pendente: {
      color: "bg-gray-100 text-gray-600 border-gray-200",
      icon: Clock,
      label: "Aguardando",
    },
    em_analise: {
      color: "bg-pasPink/20 text-gray-800 border-pasPink/30",
      icon: Loader2,
      label: "Em Análise",
    },
    concluido: {
      color: "bg-pasGreen text-gray-800 border-pasGreen/50",
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
          Solicitação de Treino Personalizado
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

// --- Componente Principal ---

export default function WorkoutPlansPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"plans" | "requests">("plans");
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [requests, setRequests] = useState<WorkoutRequest[]>([]); // Estado para pedidos

  const [allCredits, setCredits] = useState<AllCreditsResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const credits = allCredits?.workout;

  const hasAccess = useMemo(() => {
    const planName = userProfile?.subscription?.plan_name?.toLowerCase() || "";
    return planName.includes("treino") || planName.includes("completo");
  }, [userProfile]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [plansData, creditsData, requestsData] = await Promise.all([
          apiClient.getUserWorkouts(),
          apiClient.getAllCredits(),
          // Fallback para array vazio se a API não existir ainda
          apiClient.getWorkoutRequests(),
        ]);

        setPlans(plansData);
        setCredits(creditsData);
        setRequests(requestsData);
      } catch (err) {
        if (isApiError(err)) {
          setError(err.response?.data.error || "Erro");
        } else {
          setError("Falha ao carregar dados.");
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
        description: `Renova em ${new Date(
          allCredits.next_reset_date
        ).toLocaleDateString()}.`,
        action: {
          label: "Comprar Crédito",
          onClick: () => setShowUpgradeModal(true),
        },
      });
      return;
    }
    navigate("/treinos/solicitar");
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-pasPink" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <TriangleAlert className="h-10 w-10 text-red-400" />
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-pasPink font-bold hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto pb-24">
        {/* HEADER & CRÉDITOS */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-pasPink" />
                Treinos
              </h1>
              <p className="text-sm text-gray-500">
                Suas fichas e solicitações.
              </p>
            </div>

            {/* Display de Créditos Compacto */}
            {credits && hasAccess && (
              <div className="flex items-center gap-2">
                {/* Bloco de info de créditos */}
                <div className="flex flex-col items-end bg-pasPink/20 px-3 py-1.5 rounded-lg border border-pasPink/30">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Créditos
                  </span>
                  <span
                    className={`text-sm font-bold flex items-center gap-1 ${
                      credits.details.total_remaining > 0
                        ? "text-gray-900"
                        : "text-red-500"
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    {credits.details.total_remaining}
                  </span>
                </div>

                {/* BOTÃO NOVO: Comprar Mais */}
                <button
                  onClick={() => navigate("/loja/creditos?type=workout")}
                  className="bg-pasPink hover:bg-pasPink/90 text-gray-900 p-2.5 rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center"
                  title="Comprar mais créditos"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/treinos/criar"
              className="flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 py-3 text-sm font-bold text-gray-700 shadow-sm active:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Criar Manual
            </Link>

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
                Solicitar Pro
              </div>
            </button>
          </div>
        </div>

        {/* CONTROLE DE ABAS (TABS) */}
        <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur py-2">
          <div className="flex p-1 bg-gray-200/50 rounded-xl">
            <button
              onClick={() => setActiveTab("plans")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "plans"
                  ? "bg-white text-pasPink shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              Fichas Ativas
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "requests"
                  ? "bg-white text-pasPink shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <History className="w-4 h-4" />
              Meus Pedidos
            </button>
          </div>
        </div>

        {/* CONTEÚDO DAS ABAS */}
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
                  <Dumbbell className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma ficha ativa.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {plans.map((plan) => (
                    <PlanCard key={plan.plan_id} plan={plan} />
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
                  <p className="text-sm">
                    Você ainda não solicitou nenhum treino.
                  </p>
                  <button
                    onClick={handleRequestClick}
                    className="text-pasPink text-sm font-bold mt-2 hover:underline"
                  >
                    Fazer primeiro pedido
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
