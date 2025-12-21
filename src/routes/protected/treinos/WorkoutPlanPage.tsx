import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
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
} from "lucide-react";
// Recomendação UX: Biblioteca de Toast para feedback elegante
import { Toaster, toast } from "sonner";

import apiClient, { isApiError } from "../../../api/apiClient";
import { useAuth } from "../../../context/AuthContext";
import UpgradeModal from "../dashboard/Components/UpgradeModal";
import type { WorkoutPlan } from "../../../types/models";
import type { AllCreditsResponse } from "../../../types/api-types";

// --- Subcomponente: Card da Ficha ---
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
        whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-indigo-100 transition-all"
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            {plan.criada_por === "ADMIN" ? (
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
                <Crown className="h-3 w-3" />
                Especialista
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full">
                <User className="h-3 w-3" />
                Pessoal
              </span>
            )}
            <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">
              {ultimaExecucao}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {plan.nome}
          </h3>
        </div>

        {/* Lista breve de exercícios */}
        <div className="flex-1 px-5 pb-4 space-y-2">
          <ul className="space-y-2">
            {plan.exercises.slice(0, 3).map((ex) => (
              <li
                key={ex.plan_exercise_id}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
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

        {/* Footer (Músculos) */}
        <div className="flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50/50 p-4">
          {musculos.map((musculo) => (
            <span
              key={musculo}
              className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-600 shadow-sm"
            >
              {musculo}
            </span>
          ))}
        </div>
      </motion.div>
    </Link>
  );
};

// --- Componente Principal da Página ---

export default function WorkoutPlansPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para controlar o modal de upgrade
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [allCredits, setCredits] = useState<AllCreditsResponse | null>(null);

  const credits = allCredits?.workout;
  // Lógica de Permissão
  const hasAccess = useMemo(() => {
    const planName = userProfile?.subscription?.plan_name?.toLowerCase() || "";
    return planName.includes("treino") || planName.includes("completo");
  }, [userProfile]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Promise.all para carregar ambos em paralelo
        const [plansData, creditsData] = await Promise.all([
          apiClient.getUserWorkouts(),
          apiClient.getAllCredits(),
        ]);

        setPlans(plansData);
        setCredits(creditsData);
      } catch (err) {
        if (isApiError(err)) {
          setError(err.response?.data.error || "Erro");
        } else {
          setError("Falha ao carregar as fichas de treino.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- LÓGICA DE UX MELHORADA ---
  const handleRequestClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Previne qualquer comportamento padrão

    if (!hasAccess) {
      // ... mostra toast de bloqueio de plano
      setShowUpgradeModal(true);
      return;
    }

    // Depois checa se tem créditos (baseado na API)
    if (credits && !credits.can_request) {
      toast.error("Limite mensal atingido", {
        description: `Seus créditos renovam em ${new Date(
          allCredits.next_reset_date
        ).toLocaleDateString()}. Compre avulso para pedir agora.`,
        action: {
          label: "Comprar Crédito",
          onClick: () => setShowUpgradeModal(true), // Ou modal específico de compra avulsa
        },
      });
      // Aqui você abriria o modal de compra avulsa
      return;
    }

    navigate("/treinos/solicitar");
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-300" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="bg-red-50 p-4 rounded-full text-red-500">
          <TriangleAlert className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Ops, algo deu errado
          </h3>
          <p className="text-gray-500 mt-1">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-indigo-600 font-semibold hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Componente Toaster necessário para renderizar os toasts */}
      <Toaster richColors position="top-center" />

      <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header da Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Minhas Fichas
              </h1>
              <p className="text-sm text-gray-500">
                Gerencie seus treinos e evolua.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão Padrão: Criar (Self-Service) */}
            <Link
              to="/treinos/criar"
              className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Criar Manualmente</span>
              <span className="sm:hidden">Criar</span>
            </Link>

            {credits && hasAccess && (
              <div
                className={`hidden md:flex flex-col items-end mr-2 text-xs ${
                  credits.details.total_remaining > 0
                    ? "text-gray-500"
                    : "text-red-500"
                }`}
              >
                <span className="font-bold flex items-center gap-1">
                  <Ticket className="w-3 h-3" />
                  {credits.details.total_remaining} disponíveis
                </span>
                <span className="text-[10px] opacity-70">
                  {credits.details.plan.remaining} Plano +{" "}
                  {credits.details.extra_slots} Extras
                </span>
              </div>
            )}

            {/* Botão Chamativo: Solicitar (Premium) */}
            <button
              onClick={handleRequestClick}
              className={`group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 overflow-hidden ${
                hasAccess
                  ? "bg-gray-900 hover:bg-black shadow-indigo-500/20"
                  : "bg-gray-800 hover:bg-gray-900 shadow-gray-500/20 opacity-90"
              }`}
            >
              {/* Efeito de brilho apenas se tiver acesso, para incentivar clique */}
              {hasAccess && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent z-0"></div>
              )}

              <div className="relative z-10 flex items-center gap-2">
                {hasAccess ? (
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
                <span className="hidden sm:inline">
                  Solicitar ao Especialista
                </span>
                <span className="sm:hidden">Solicitar</span>
              </div>
            </button>
          </div>
        </div>

        {/* Grid de Fichas */}
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-20 text-center">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <Dumbbell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Nenhum treino encontrado
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2 mb-6">
              Você ainda não tem nenhuma ficha de treino ativa. Comece agora
              mesmo!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/treinos/criar")}
                className="text-indigo-600 font-semibold text-sm hover:underline"
              >
                Criar meu próprio treino
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={handleRequestClick}
                className="text-indigo-600 font-semibold text-sm hover:underline"
              >
                Pedir para especialista
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.plan_id} plan={plan} />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Upgrade */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          // Redireciona para a página de seleção de planos
          navigate("/assinatura/mudar");
        }}
      />
    </>
  );
}
