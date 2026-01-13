import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Crown,
  Plus,
  Sparkles,
  CheckCircle2,
  Archive,
  Dumbbell,
  Play,
  Clock,
  ChevronRight,
  Trophy,
  LayoutGrid,
  Calendar,
  PlusCircle,
  Ticket,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import UpgradeModal from "../dashboard/Components/UpgradeModal";
import type { DiaSemana, WorkoutPlan } from "../../../types/models";
import type { AllCreditsResponse } from "../../../types/api-types";
import { getAllCredits, getUserWorkouts } from "../../../api/apiClient";

// --- Configuração de Dias ---
const DAYS_MAP = [
  { key: "DOM", label: "Dom", full: "Domingo" },
  { key: "SEG", label: "Seg", full: "Segunda" },
  { key: "TER", label: "Ter", full: "Terça" },
  { key: "QUA", label: "Qua", full: "Quarta" },
  { key: "QUI", label: "Qui", full: "Quinta" },
  { key: "SEX", label: "Sex", full: "Sexta" },
  { key: "SAB", label: "Sáb", full: "Sábado" },
];

// --- Helper Date ---
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

// --- Componente: Card de Treino ---
const PlanCard: React.FC<{
  plan: WorkoutPlan;
  isTodayPending: boolean;
  isTodayDone: boolean;
}> = ({ plan, isTodayPending, isTodayDone }) => {
  const muscleSummary = useMemo(() => {
    const muscles = new Set<string>();
    plan.exercises?.forEach((ex) =>
      ex.musculos_trabalhados?.forEach((m) => muscles.add(m))
    );
    return Array.from(muscles).slice(0, 3).join(", ");
  }, [plan.exercises]);

  const exerciseCount = plan.exercises?.length || 0;

  // 1. HERO CARD (Para hoje, pendente)
  if (isTodayPending) {
    return (
      <Link to={`/treinos/${plan.plan_id}`} className="block w-full mb-4">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden rounded-4xl bg-gray-900 text-white shadow-xl shadow-pasPink/20 border border-gray-800 group"
        >
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-pasPink/20 blur-[80px] rounded-full -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-70" />

          <div className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pasPink text-gray-900 text-xs font-extrabold tracking-wide shadow-lg shadow-pasPink/20">
                <Play className="w-3 h-3 fill-current" /> TREINO DE HOJE
              </span>
              {plan.criada_por === "ADMIN" && (
                <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                  <Crown className="w-4 h-4 text-pasPink" />
                </div>
              )}
            </div>

            <h3 className="text-3xl font-extrabold mb-1 leading-tight text-white tracking-tight">
              {plan.nome}
            </h3>
            <p className="text-gray-400 text-sm mb-8 font-medium">
              Foco:{" "}
              <span className="text-gray-200">
                {muscleSummary || "Corpo todo"}
              </span>
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <span className="flex items-center gap-1.5 bg-gray-800/80 px-3 py-1.5 rounded-xl border border-white/5 text-xs font-semibold text-gray-300">
                  <Dumbbell className="w-3.5 h-3.5 text-pasPink" />{" "}
                  {exerciseCount} ex.
                </span>
                <span className="flex items-center gap-1.5 bg-gray-800/80 px-3 py-1.5 rounded-xl border border-white/5 text-xs font-semibold text-gray-300">
                  <Clock className="w-3.5 h-3.5 text-pasPink" /> ~60m
                </span>
              </div>

              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-xl shadow-white/10 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // 2. STANDARD CARD
  return (
    <Link to={`/treinos/${plan.plan_id}`} className="block h-full">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`group relative flex flex-col h-full bg-white rounded-3xl border transition-all duration-300 ${
          isTodayDone
            ? "border-pasGreen/30 bg-pasGreen/5"
            : "border-gray-100 hover:border-pasPink/30 hover:shadow-lg hover:shadow-gray-100/50"
        }`}
      >
        <div className="p-5 flex flex-col h-full">
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-2">
              {isTodayDone ? (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-800 bg-pasGreen px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="h-3 w-3" /> Feito
                </span>
              ) : (
                <span
                  className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border ${
                    plan.criada_por === "ADMIN"
                      ? "bg-gray-50 text-gray-600 border-gray-200"
                      : "bg-white text-gray-500 border-gray-200"
                  }`}
                >
                  {plan.criada_por === "ADMIN" ? "Pro" : "Pessoal"}
                </span>
              )}
            </div>

            {plan.assigned_days && plan.assigned_days.length > 0 && (
              <div className="flex -space-x-1.5">
                {plan.assigned_days.slice(0, 3).map((d, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gray-50 border border-white flex items-center justify-center text-[9px] font-bold text-gray-400"
                  >
                    {d.charAt(0)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h4
              className={`font-bold text-lg mb-1 line-clamp-1 ${
                isTodayDone
                  ? "text-gray-800"
                  : "text-gray-900 group-hover:text-pasPink transition-colors"
              }`}
            >
              {plan.nome}
            </h4>
            <p className="text-xs text-gray-500 line-clamp-2">
              {muscleSummary || "Sem foco definido"}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" /> {exerciseCount} exercícios
            </span>
            <ChevronRight className="w-4 h-4 text-pasPink opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default function WorkoutPlansPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const dateStripRef = useRef<HTMLDivElement>(null);

  const todayKey = DAYS_MAP[new Date().getDay()].key;

  const [selectedDay, setSelectedDay] = useState<string>(todayKey);
  const [viewMode, setViewMode] = useState<"weekly" | "all">("weekly");
  const [activeTab, setActiveTab] = useState(0);

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
          getUserWorkouts(),
          getAllCredits(),
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

  const activePlans = plans.filter((p) => p.is_active);

  const filteredPlans = useMemo(() => {
    if (viewMode === "all") return activePlans;

    return activePlans.filter((p) => {
      if (p.assigned_days && p.assigned_days.length > 0) {
        const days = Array.isArray(p.assigned_days)
          ? p.assigned_days
          : (p.assigned_days as string).split(",");
        return days.includes(selectedDay);
      }
      return false;
    });
  }, [viewMode, activePlans, selectedDay]);

  const handleRequestClick = () => {
    if (!hasAccess) {
      setShowUpgradeModal(true);
      return;
    }
    navigate("/treinos/solicitar");
  };

  if (isLoading)
    return (
      <div className="flex h-[80vh] items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-pasPink w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* --- HEADER FIXO --- */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30 pt-safe-top">
        <div className="px-5 pt-4 pb-0">
          {/* Top Row: Título + Créditos */}
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">
                Treinos
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Gerencie sua rotina semanal
              </p>
            </div>

            {credits && hasAccess && (
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end bg-pasPink/10 px-3 py-1.5 rounded-lg border border-pasPink/20">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                    Créditos
                  </span>
                  <span
                    className={`text-sm font-bold flex items-center gap-1 ${
                      credits.details.total_remaining > 0
                        ? "text-gray-900"
                        : "text-red-500"
                    }`}
                  >
                    <Ticket
                      className={`w-3.5 h-3.5 ${
                        credits.details.total_remaining > 0
                          ? "text-pasPink"
                          : "text-current"
                      }`}
                    />
                    {credits.details.total_remaining}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/loja/creditos?type=diet")}
                  className="bg-pasPink hover:bg-pasPink/90 text-gray-700 p-2.5 rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center"
                  title="Comprar mais créditos"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* View Mode Switcher (Abas Principais) */}
          <div className="flex gap-6 mb-2 border-b border-gray-100 relative">
            <button
              onClick={() => {
                setViewMode("weekly");
                setActiveTab(0);
              }}
              className={`pb-3 text-sm font-bold relative transition-colors ${
                activeTab === 0
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Agenda
              </span>
              {activeTab === 0 && (
                <motion.div
                  layoutId="mainTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full"
                />
              )}
            </button>

            <button
              onClick={() => {
                setViewMode("all");
                setActiveTab(1);
              }}
              className={`pb-3 text-sm font-bold relative transition-colors ${
                activeTab === 1
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" /> Biblioteca
              </span>
              {activeTab === 1 && (
                <motion.div
                  layoutId="mainTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full"
                />
              )}
            </button>
          </div>
        </div>

        {/* --- ABAS INTERNAS DE DATAS (Magic Motion Tabs) --- */}
        <AnimatePresence>
          {viewMode === "weekly" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-3 overflow-hidden"
            >
              {/* Container de Abas */}
              <div
                ref={dateStripRef}
                className="flex items-center gap-1 overflow-x-auto scrollbar-hide bg-gray-100/50 p-1 rounded-2xl border border-gray-100"
              >
                {DAYS_MAP.map((day) => {
                  const isSelected = selectedDay === day.key;
                  const isToday = day.key === todayKey;

                  return (
                    <button
                      key={day.key}
                      onClick={() => setSelectedDay(day.key)}
                      className={`relative flex-1 min-w-12 h-[3.2rem] flex flex-col items-center justify-center rounded-xl transition-all outline-none ${
                        isSelected
                          ? "text-gray-900"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {/* Background Deslizante (O segredo das abas) */}
                      {isSelected && (
                        <motion.div
                          layoutId="dayTabBackground"
                          className="absolute inset-0 bg-white shadow-sm border border-gray-200/50 rounded-xl"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}

                      {/* Conteúdo da Aba */}
                      <div className="relative z-10 flex flex-col items-center">
                        <span className="text-[9px] font-bold uppercase tracking-wide opacity-80">
                          {day.label}
                        </span>

                        {/* Indicador de Hoje ou Dot */}
                        {isToday ? (
                          <span
                            className={`text-[8px] font-extrabold mt-0.5 ${
                              isSelected ? "text-pasPink" : "text-pasPink/80"
                            }`}
                          >
                            HOJE
                          </span>
                        ) : (
                          // Bolinha apenas visual para manter alinhamento vertical
                          <div
                            className={`w-1 h-1 rounded-full mt-1.5 ${
                              isSelected ? "bg-gray-300" : "bg-transparent"
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- CONTENT AREA --- */}
      <main className="px-5 pt-6">
        {/* Actions Row (Criar / Solicitar) */}
        <div className="flex gap-3 mb-8">
          <Link
            to="/treinos/criar"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-sm font-bold text-gray-700 active:scale-95 transition-transform"
          >
            <div className="bg-gray-100 p-1.5 rounded-lg">
              <Plus className="w-3.5 h-3.5 text-gray-600" />
            </div>
            Criar Manual
          </Link>
          <button
            onClick={handleRequestClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl shadow-md text-sm font-bold text-white active:scale-95 transition-transform relative overflow-hidden ${
              hasAccess ? "bg-gray-900" : "bg-gray-600 opacity-90"
            }`}
          >
            {hasAccess && (
              <div className="absolute inset-0 bg-white/10 skew-x-12 -translate-x-full animate-[shimmer_2.5s_infinite]"></div>
            )}
            <Sparkles className="w-4 h-4 text-pasPink" />
            {hasAccess ? "Pedir ao Personal" : "Desbloquear Pro"}
          </button>
        </div>

        {/* Lista de Cards com Animação Lateral */}
        <div className="space-y-4 min-h-75">
          <AnimatePresence mode="wait">
            {filteredPlans.length > 0 ? (
              <motion.div
                key={viewMode + selectedDay}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={
                  viewMode === "all"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : "space-y-4"
                }
              >
                {filteredPlans.map((plan) => {
                  const isAssignedToday = plan.assigned_days?.includes(
                    todayKey as DiaSemana
                  );
                  const isExecutedToday = isSameDay(plan.data_ultima_execucao);

                  // Lógica para Hero Card apenas na visualização semanal do dia de hoje
                  const isTodaySelected = selectedDay === todayKey;
                  const isTodayPending =
                    !!isAssignedToday &&
                    !isExecutedToday &&
                    viewMode === "weekly" &&
                    isTodaySelected;
                  const isTodayDone =
                    !!isExecutedToday &&
                    viewMode === "weekly" &&
                    isTodaySelected;

                  return (
                    <PlanCard
                      key={plan.plan_id}
                      plan={plan}
                      isTodayPending={isTodayPending}
                      isTodayDone={isTodayDone}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 relative border border-gray-100">
                  {viewMode === "weekly" ? (
                    <Trophy className="w-10 h-10 text-gray-300" />
                  ) : (
                    <Archive className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">
                  {viewMode === "weekly"
                    ? "Descanso merecido"
                    : "Nenhum treino"}
                </h3>
                <p className="text-gray-500 text-sm max-w-60 leading-relaxed mx-auto">
                  {viewMode === "weekly"
                    ? `Nenhum treino agendado para ${DAYS_MAP.find(
                        (d) => d.key === selectedDay
                      )?.full.toLowerCase()}.`
                    : "Você ainda não possui fichas criadas."}
                </p>
                {viewMode === "weekly" && (
                  <button
                    onClick={() => {
                      setViewMode("all");
                      setActiveTab(1);
                    }}
                    className="mt-6 text-gray-900 font-bold text-sm bg-white border border-gray-200 px-6 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    Ver biblioteca completa
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => navigate("/assinatura")}
      />
    </div>
  );
}
