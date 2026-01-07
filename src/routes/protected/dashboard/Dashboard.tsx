import { useEffect, useState, useMemo } from "react";
import apiClient, { isApiError } from "../../../api/apiClient";
import {
  Loader2,
  Calendar,
  Dumbbell,
  ArrowRight,
  Droplets,
  Utensils,
  Plus,
  Target,
  Flame,
} from "lucide-react";
import AddNutritionModal from "./Components/NutritionModal";
import { useNavigate } from "react-router";
import { LuPencil } from "react-icons/lu";
import { AnimatePresence, motion } from "framer-motion";
import PesoAlvoModal from "./Components/PesoAlvoModal";
import DailyMonitoringCard from "./Components/DailyMonitoringCard";
import WeightEvolutionChart from "./Components/WeightEvolutionChart"; // <--- Importado
import type {
  DailyConsumption,
  // UserProfile,
  WeightHistoryEntry,
  WorkoutPlan,
} from "../../../types/models";
import { useAuth } from "../../../context/AuthContext";
import type {
  AddConsumptionRequest,
  DailyConsumptionResponse,
} from "../../../types/api-types";

// --- Helpers ---

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const formatDate = () => {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

// --- Subcomponentes ---
const cardColorVariants: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-pasPink", text: "text-gray-800" },
  green: { bg: "bg-pasGreen", text: "text-gray-800" },
  pink: { bg: "bg-pasPink", text: "text-gray-800" },
  purple: { bg: "bg-pasGreen", text: "text-gray-800" },
};

const QuickActionCard: React.FC<{
  icon: React.ElementType;
  label: string;
  color: "blue" | "green" | "pink" | "purple"; // Tipagem restrita para segurança
  onClick: () => void;
}> = ({ icon: Icon, label, color, onClick }) => {
  // Pega as classes do mapa ou usa azul como fallback
  const theme = cardColorVariants[color] || cardColorVariants.blue;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all gap-2"
    >
      <div className={`p-3 rounded-full ${theme.bg} ${theme.text}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-semibold text-gray-600">{label}</span>
    </motion.button>
  );
};

const NextWorkoutCard: React.FC<{
  onClick: () => void;
  isLoading: boolean;
}> = ({ onClick, isLoading }) => (
  <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Dumbbell className="w-24 h-24 rotate-12" />
    </div>

    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2 text-pasGreen">
        <Dumbbell className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Próximo Treino
        </span>
      </div>

      <h3 className="text-xl font-bold mb-1">Continuar Evoluindo</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-[80%]">
        Não perca o ritmo! Acesse suas fichas e registre seu progresso de hoje.
      </p>

      <button
        onClick={onClick}
        disabled={isLoading}
        className="flex items-center gap-2 bg-pasPink hover:bg-pasPink/90 text-gray-900 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-pasPink/20 shadow-lg"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Ver Meus Treinos"
        )}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const StreaksCard: React.FC<{
  nutritionMet: boolean;
  workoutStatus: { status: string; label: string };
}> = ({ nutritionMet, workoutStatus }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
        Ofensiva Diária
      </h3>
      <div className="space-y-4">
        {/* Nutrition Item */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                nutritionMet
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">Dieta</p>
              <p className="text-xs text-gray-500">
                {nutritionMet ? "Meta batida!" : "Em andamento"}
              </p>
            </div>
          </div>
          <span
            className={`text-sm font-bold ${
              nutritionMet ? "text-orange-500" : "text-gray-400"
            }`}
          >
            {nutritionMet ? "🔥" : "—"}
          </span>
        </div>

        {/* Workout Item */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                workoutStatus.status === "completed"
                  ? "bg-green-100 text-green-600"
                  : workoutStatus.status === "rest"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">Treino</p>
              <p className="text-xs text-gray-500">{workoutStatus.label}</p>
            </div>
          </div>
          <span
            className={`text-sm font-bold ${
              workoutStatus.status === "completed"
                ? "text-orange-500"
                : "text-gray-400"
            }`}
          >
            {workoutStatus.status === "completed"
              ? "🔥"
              : workoutStatus.status === "rest"
              ? "💤"
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal ---

export default function Dashboard() {
  const { userProfile: profile, refetchProfile } = useAuth();

  // Estados de Dados
  const [weightHistory, setWeightHistory] = useState<WeightHistoryEntry[]>([]);
  const [nutritionData, setNutritionData] =
    useState<DailyConsumptionResponse | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [isNutritionModalOpen, setNutritionModalOpen] = useState(false);
  const [isEditPesoAlvoModalOpen, setEditPesoAlvoModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [historyData, nutritionResponse, workoutsData] =
          await Promise.all([
            apiClient.getWeightHistory(),
            apiClient.getDailyConsumption(),
            apiClient.getUserWorkouts().catch(() => []),
          ]);

        setWeightHistory(historyData);
        // setDailyConsumption(consumptionData);
        setNutritionData(nutritionResponse); // Salva o objeto completo (consumed + targets)
        setWorkouts(workoutsData);
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

  const firstName = profile?.nome.split(" ")[0] || "Usuário";

  const { pesoAtual, pesoAlvo, diferenca } = useMemo(() => {
    const pesoAlvo = Number(profile?.profile.peso_alvo) || null;
    const pesoAtual =
      weightHistory.length > 0
        ? weightHistory[weightHistory.length - 1].peso_kg
        : null;
    const diferenca = pesoAtual && pesoAlvo ? pesoAtual - pesoAlvo : null;
    return { pesoAtual, pesoAlvo, diferenca };
  }, [profile?.profile.peso_alvo, weightHistory]);

  // const nutritionTargets = useMemo(() => {
  //   const aguaRecomendadaL = pesoAtual ? (pesoAtual * 35) / 1000 : 2.5;
  //   return {
  //     aguaRecomendadaL,
  //     metaProteinas: 140,
  //     metaFibras: 30,
  //     metaCalorias: 2000,
  //   };
  // }, [pesoAtual]);

  const currentConsumption = nutritionData?.consumed || {
    agua_l: 0,
    proteinas_g: 0,
    fibras_g: 0,
    calorias_kcal: 0,
    carboidratos_g: 0,
    gorduras_g: 0,
  };

  const currentTargets: DailyConsumptionResponse["targets"] =
    nutritionData?.targets || {
      agua_l: 2.5,
      proteinas_g: 140,
      fibras_g: 30,
      calorias_kcal: 2000, // Fallback seguro
      carboidratos_g: 30,
      gorduras_g: 30,
    };
  const mappedTargets = {
    aguaRecomendadaL: currentTargets.agua_l,
    metaProteinas: currentTargets.proteinas_g,
    metaFibras: currentTargets.fibras_g,
    metaCalorias: currentTargets.calorias_kcal,
  };

  const allGoalsMet = useMemo(() => {
    if (!nutritionData) return false;
    return (
      currentConsumption.agua_l >= mappedTargets.aguaRecomendadaL &&
      currentConsumption.proteinas_g >= mappedTargets.metaProteinas &&
      currentConsumption.fibras_g >= mappedTargets.metaFibras &&
      currentConsumption.calorias_kcal <= mappedTargets.metaCalorias // Calorias é <=
    );
  }, [
    nutritionData,
    currentConsumption.agua_l,
    currentConsumption.proteinas_g,
    currentConsumption.fibras_g,
    currentConsumption.calorias_kcal,
    mappedTargets.aguaRecomendadaL,
    mappedTargets.metaProteinas,
    mappedTargets.metaFibras,
    mappedTargets.metaCalorias,
  ]);

  const workoutStreakStatus = useMemo(() => {
    if (!profile?.profile.dias_treino)
      return { status: "unknown", label: "N/A" };

    const dayMap: Record<number, string> = {
      0: "DOM",
      1: "SEG",
      2: "TER",
      3: "QUA",
      4: "QUI",
      5: "SEX",
      6: "SAB",
    };
    const today = new Date();
    const todayKey = dayMap[today.getDay()];
    const isTrainingDay = profile.profile.dias_treino.includes(todayKey as any);

    const todayStr = today.toLocaleDateString("pt-BR");
    const hasTrained = workouts.some((p) => {
      if (!p.data_ultima_execucao) return false;
      return (
        new Date(p.data_ultima_execucao).toLocaleDateString("pt-BR") ===
        todayStr
      );
    });

    if (!isTrainingDay) return { status: "rest", label: "Descanso" };
    if (hasTrained) return { status: "completed", label: "Concluído" };
    return { status: "pending", label: "Pendente" };
  }, [profile, workouts]);

  const handleSaveNutrition = async (
    data: AddConsumptionRequest,
    mode: "add" | "set"
  ) => {
    try {
      let newTotals: DailyConsumption;
      if (mode === "add") newTotals = await apiClient.addDailyConsumption(data);
      else newTotals = await apiClient.setDailyConsumption(data);

      setNutritionData({
        consumed: newTotals,
        targets: currentTargets,
      });
      setNutritionModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePesoAlvo = async (novoPesoAlvo: number) => {
    try {
      await apiClient.updateUserProfile({ peso_alvo_kg: novoPesoAlvo });
      if (profile) await refetchProfile();
      setEditPesoAlvoModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-pasPink" />
      </div>
    );
  }

  if (!profile)
    return (
      <div className="p-8 text-center text-gray-500">
        Erro ao carregar perfil.
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-sm font-medium text-gray-400 flex items-center gap-2 uppercase tracking-wide">
            <Calendar className="w-4 h-4" /> {formatDate()}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            {getGreeting()}, <span className="text-pasPink">{firstName}</span>.
          </h1>
          <p className="text-gray-500 mt-1">
            Vamos focar no objetivo:{" "}
            <strong className="text-gray-700 capitalize">
              {profile.profile.objetivo.replace("_", " ")}
            </strong>
          </p>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- COLUNA ESQUERDA --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monitoramento Diário */}
          <DailyMonitoringCard
            dailyConsumption={currentConsumption}
            nutritionTargets={mappedTargets}
            allGoalsMet={allGoalsMet}
            onOpenModal={() => setNutritionModalOpen(true)}
          />

          {/* Componente de Gráfico Separado */}
          <div className="h-96 w-full">
            <WeightEvolutionChart
              weightHistory={weightHistory}
              pesoAlvo={pesoAlvo}
            />
          </div>
        </div>

        {/* --- COLUNA DIREITA --- */}
        <div className="space-y-6">
          {/* CTA Treino */}
          <NextWorkoutCard
            onClick={() => navigate("/treinos")}
            isLoading={false}
          />

          {/* Streaks */}
          <StreaksCard
            nutritionMet={allGoalsMet}
            workoutStatus={workoutStreakStatus}
          />

          {/* Ações Rápidas */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
              Acesso Rápido
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionCard
                icon={Droplets}
                label="Água"
                color="blue"
                onClick={() => setNutritionModalOpen(true)}
              />
              <QuickActionCard
                icon={Utensils}
                label="Dieta"
                color="green"
                onClick={() => navigate("/receitas")}
              />
              <QuickActionCard
                icon={Plus}
                label="Medida"
                color="pink"
                onClick={() => navigate("/measurements/add")}
              />
              <QuickActionCard
                icon={Target}
                label="Meta"
                color="purple"
                onClick={() => setEditPesoAlvoModalOpen(true)}
              />
            </div>
          </div>

          {/* Resumo de Peso */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Balança</h3>
              <button
                onClick={() => setEditPesoAlvoModalOpen(true)}
                className="text-gray-400 hover:text-pasPink"
              >
                <LuPencil className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Atual</span>
              <span className="text-xl font-bold text-gray-900">
                {pesoAtual?.toFixed(1)}{" "}
                <span className="text-xs font-normal text-gray-400">kg</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Meta</span>
              <span className="text-xl font-bold text-pasPink">
                {pesoAlvo?.toFixed(1)}{" "}
                <span className="text-xs font-normal text-gray-400">kg</span>
              </span>
            </div>

            <div className="pt-3">
              {diferenca !== null && (
                <div
                  className={`p-2 rounded-lg text-center text-sm font-medium ${
                    diferenca === 0
                      ? "bg-green-100 text-green-700"
                      : diferenca > 0
                      ? "bg-orange-50 text-orange-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {diferenca === 0
                    ? "🎉 Meta Atingida!"
                    : diferenca > 0
                    ? `Faltam ${diferenca.toFixed(1)} kg`
                    : `Passou ${Math.abs(diferenca).toFixed(1)} kg`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {isEditPesoAlvoModalOpen && (
          <PesoAlvoModal
            onClose={() => setEditPesoAlvoModalOpen(false)}
            onSave={handleSavePesoAlvo}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNutritionModalOpen && currentConsumption && (
          <AddNutritionModal
            onClose={() => setNutritionModalOpen(false)}
            onSave={handleSaveNutrition}
            currentValues={{
              agua_l: currentConsumption.agua_l,
              proteinas_g: currentConsumption.proteinas_g,
              fibras_g: currentConsumption.fibras_g,
              calorias_kcal: currentConsumption.calorias_kcal,
              carboidratos_g: currentConsumption.carboidratos_g,
              gorduras_g: currentConsumption.gorduras_g,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
