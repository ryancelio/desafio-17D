import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  User,
  Crown,
  Plus,
  Sparkles,
  Lock,
  Ticket,
  CheckCircle2,
  Archive,
  CalendarDays,
  PlusCircle,
  Dumbbell,
  PlayCircle, // Novo ícone para indicar ação
} from "lucide-react";
import apiClient from "../../../api/apiClient";
import { useAuth } from "../../../context/AuthContext";
import UpgradeModal from "../dashboard/Components/UpgradeModal";
import type { DiaSemana, WorkoutPlan } from "../../../types/models";
import type { AllCreditsResponse } from "../../../types/api-types";

// --- Mapeamento de Dias ---
const DAYS_MAP = [
  { key: "DOM", label: "Dom", full: "Domingo" },
  { key: "SEG", label: "Seg", full: "Segunda-feira" },
  { key: "TER", label: "Ter", full: "Terça-feira" },
  { key: "QUA", label: "Qua", full: "Quarta-feira" },
  { key: "QUI", label: "Qui", full: "Quinta-feira" },
  { key: "SEX", label: "Sex", full: "Sexta-feira" },
  { key: "SAB", label: "Sáb", full: "Sábado" },
];

// --- Helper para verificar se é hoje ---
const isSameDay = (dateString?: string | null) => {
  if (!dateString) return false;
  const d = new Date(dateString);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

// --- Subcomponente: Card da Ficha ---
const PlanCard: React.FC<{
  plan: WorkoutPlan;
  isTodayPending: boolean; // Indica se é o treino de hoje pendente
  isTodayDone: boolean; // Indica se é o treino de hoje concluído
}> = ({ plan, isTodayPending, isTodayDone }) => {
  // Gera resumo de músculos
  const musculos = useMemo(() => {
    const muscleSet = new Set<string>();
    plan.exercises?.forEach((ex) => {
      ex.musculos_trabalhados?.forEach((m: string) => muscleSet.add(m));
    });
    return Array.from(muscleSet).slice(0, 3);
  }, [plan.exercises]);

  const ultimaExecucao = plan.data_ultima_execucao
    ? new Date(plan.data_ultima_execucao).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
    : "Nunca";

  // Define estilos baseados no status do dia
  let containerClasses = "border-gray-100 hover:border-pasPink/30";
  if (isTodayPending) {
    containerClasses = "border-pasPink ring-4 ring-pasPink/10 z-10 shadow-lg"; // Destaque Rosa
  } else if (isTodayDone) {
    containerClasses = "border-green-200 bg-green-50/30"; // Destaque Verde (Concluído)
  }

  return (
    <Link to={`/treinos/${plan.plan_id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all border relative ${containerClasses}`}
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-2">
              {plan.criada_por === "ADMIN" ? (
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-gray-800 bg-pasPink border border-pasPink/50 px-2 py-1 rounded-full">
                  <Crown className="h-3 w-3" /> Pro
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-gray-800 bg-pasGreen border border-pasGreen/50 px-2 py-1 rounded-full">
                  <User className="h-3 w-3" /> Pessoal
                </span>
              )}
            </div>

            {/* Badges de Status do Dia */}
            {isTodayPending && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-pasPink bg-pasPink/10 px-2 py-1 rounded-full animate-pulse">
                <PlayCircle className="h-3 w-3" /> Para Hoje
              </span>
            )}
            {isTodayDone && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> Feito Hoje
              </span>
            )}
            {!isTodayPending && !isTodayDone && plan.data_ultima_execucao && (
              <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                Último: {ultimaExecucao}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-pasPink transition-colors">
            {plan.nome}
          </h3>
        </div>

        <div className="flex-1 px-5 pb-4 space-y-2">
          {plan.exercises?.length > 0 ? (
            <ul className="space-y-2">
              {plan.exercises.slice(0, 3).map((ex) => (
                <li
                  key={ex.plan_exercise_id}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      isTodayPending ? "bg-pasPink" : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="truncate">
                    {ex.nome_exercicio || ex.exercise?.nome}
                  </span>
                </li>
              ))}
              {plan.exercises.length > 3 && (
                <li className="text-xs text-gray-400 font-medium pl-3.5">
                  + {plan.exercises.length - 3} exercícios
                </li>
              )}
            </ul>
          ) : (
            <div className="text-sm text-gray-400 italic">
              Sem exercícios cadastrados
            </div>
          )}
        </div>

        {/* Rodapé com Músculos e Dias */}
        <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50/50 p-4">
          <div className="flex flex-wrap gap-1">
            {musculos.map((m) => (
              <span
                key={m}
                className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-gray-500 uppercase"
              >
                {m}
              </span>
            ))}
          </div>

          {plan.assigned_days && plan.assigned_days.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {plan.assigned_days.map((d) => (
                <span
                  key={d}
                  className="text-[10px] font-bold text-pasPink bg-pasPink/10 px-1.5 py-0.5 rounded-md"
                >
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default function WorkoutPlansPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Dia da semana atual (para lógica de "Próximo Treino")
  const todayKey = DAYS_MAP[new Date().getDay()].key;

  // Estado para controlar a visualização (inicia com Weekly)
  const [selectedDay, setSelectedDay] = useState<string>(todayKey);
  const [viewMode, setViewMode] = useState<"weekly" | "all" | "archived">(
    "weekly"
  );

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [allCredits, setCredits] = useState<AllCreditsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        const [plansData, creditsData] = await Promise.all([
          apiClient.getUserWorkouts(),
          apiClient.getAllCredits(),
        ]);
        setPlans(plansData);
        setCredits(creditsData);
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- FILTRAGEM DOS TREINOS ---
  const activePlans = plans.filter((p) => p.is_active);
  const archivedPlans = plans.filter((p) => p.is_active === false);

  const filteredPlans = useMemo(() => {
    if (viewMode === "archived") return archivedPlans;
    if (viewMode === "all") return activePlans;

    // Weekly: Filtra pelo dia selecionado na aba
    return activePlans.filter((p) => {
      if (p.assigned_days && p.assigned_days.length > 0) {
        const days = Array.isArray(p.assigned_days)
          ? p.assigned_days
          : (p.assigned_days as string).split(",");
        return days.includes(selectedDay);
      }
      return true; // Mostra treinos sem dia definido sempre
    });
  }, [viewMode, activePlans, archivedPlans, selectedDay]);

  const handleRequestClick = () => {
    if (!hasAccess) {
      setShowUpgradeModal(true);
      return;
    }
    navigate("/treinos/solicitar");
  };

  if (isLoading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-pasPink w-10 h-10" />
      </div>
    );

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-pasPink" />
            Agenda de Treinos
          </h1>
          <p className="text-sm text-gray-500">Organize sua rotina semanal.</p>
        </div>

        {credits && hasAccess && (
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end bg-pasPink/20 px-3 py-1.5 rounded-lg border border-pasPink/30">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Créditos
              </span>
              <span className="text-sm font-bold flex items-center gap-1 text-gray-900">
                <Ticket className="w-3.5 h-3.5" />{" "}
                {credits.details.total_remaining}
              </span>
            </div>
            <button
              onClick={() => navigate("/loja/creditos?type=workout")}
              className="bg-pasPink hover:bg-pasPink/90 text-gray-900 p-2.5 rounded-lg transition-all active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* BOTÕES DE AÇÃO RÁPIDA */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/treinos/criar"
          className="flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 py-3 text-sm font-bold text-gray-700 shadow-sm active:bg-gray-50"
        >
          <Plus className="h-4 w-4" /> Criar Manual
        </Link>
        <button
          onClick={handleRequestClick}
          className={`relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md overflow-hidden ${
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

      {/* MENU DE VISUALIZAÇÃO */}
      <div className="flex gap-4 border-b border-gray-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setViewMode("weekly")}
          className={`pb-2 px-1 text-sm font-bold transition-colors whitespace-nowrap ${
            viewMode === "weekly"
              ? "text-pasPink border-b-2 border-pasPink"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Semana
        </button>
        <button
          onClick={() => setViewMode("all")}
          className={`pb-2 px-1 text-sm font-bold transition-colors whitespace-nowrap ${
            viewMode === "all"
              ? "text-pasPink border-b-2 border-pasPink"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Todas as Fichas ({activePlans.length})
        </button>
        <button
          onClick={() => setViewMode("archived")}
          className={`pb-2 px-1 text-sm font-bold transition-colors whitespace-nowrap ${
            viewMode === "archived"
              ? "text-pasPink border-b-2 border-pasPink"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Arquivadas ({archivedPlans.length})
        </button>
      </div>

      {/* SELETOR DE DIAS */}
      <AnimatePresence mode="wait">
        {viewMode === "weekly" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide"
          >
            {DAYS_MAP.map((day) => {
              const isSelected = selectedDay === day.key;
              const isToday = day.key === todayKey;

              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`flex flex-col items-center justify-center min-w-[3.5rem] py-3 rounded-2xl transition-all duration-300 ${
                    isSelected
                      ? "bg-pasPink text-gray-900 shadow-md scale-105"
                      : "bg-white text-gray-400 border border-gray-100 hover:border-pasPink/30"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {day.label}
                  </span>
                  {isToday && (
                    <span className="text-[8px] mt-0.5 font-semibold opacity-70">
                      Hoje
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LISTA DE TREINOS */}
      <div className="space-y-4">
        {viewMode === "weekly" && (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              {DAYS_MAP.find((d) => d.key === selectedDay)?.full}
            </h2>
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
              {filteredPlans.length} treino(s)
            </span>
          </div>
        )}

        {filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              {viewMode === "archived" ? (
                <Archive className="w-8 h-8 text-gray-300" />
              ) : (
                <Dumbbell className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-1">
              Nenhum treino encontrado
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              {viewMode === "weekly"
                ? `Você não tem treinos agendados para ${DAYS_MAP.find(
                    (d) => d.key === selectedDay
                  )?.full.toLowerCase()}.`
                : "Não há fichas nesta categoria."}
            </p>
            {viewMode === "weekly" && (
              <Link
                to="/treinos/criar"
                className="mt-4 text-pasPink font-bold text-sm hover:underline"
              >
                + Adicionar treino para hoje
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlans.map((plan) => {
              // LÓGICA DO DESTAQUE:
              // 1. O treino está agendado para o dia da semana ATUAL? (todayKey)
              const isAssignedToday = plan.assigned_days?.includes(
                todayKey as DiaSemana
              );
              // 2. Ele já foi executado na data de HOJE?
              const isExecutedToday = isSameDay(plan.data_ultima_execucao);

              // 3. Status Final
              const isTodayPending = !!isAssignedToday && !isExecutedToday;
              const isTodayDone = !!isExecutedToday;

              return (
                <PlanCard
                  key={plan.plan_id}
                  plan={plan}
                  isTodayPending={isTodayPending}
                  isTodayDone={isTodayDone}
                />
              );
            })}
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => navigate("/assinatura")}
      />
    </div>
  );
}
