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
  AlertCircle,
  Clock,
  Trophy,
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
  WeightHistoryEntry,
} from "../../../types/models";
import { useAuth } from "../../../context/AuthContext";
import type {
  AddConsumptionRequest,
  DailyConsumptionResponse,
  GetUserStreaksResponse,
  StreakData,
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
  nutrition: StreakData;
  workout: StreakData;
}> = ({ nutrition, workout }) => {
  // Helper para definir cores e ícones baseados no status
  const getStatusConfig = (status: StreakData["status"]) => {
    switch (status) {
      case "completed_today":
        return {
          color: "text-orange-500",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-100",
          icon: Flame,
          label: "Em chamas!",
          desc: "Meta de hoje batida",
        };
      case "pending_today":
        return {
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100",
          icon: Clock,
          label: "Mantenha o foco",
          desc: "Complete hoje para continuar",
        };
      case "broken":
      default:
        return {
          color: "text-gray-400",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-100",
          icon: AlertCircle,
          label: "Recomeçar",
          desc: "A sequência foi interrompida",
        };
    }
  };

  const renderItem = (title: string, data: StreakData) => {
    const config = getStatusConfig(data.status);
    const Icon = config.icon;

    return (
      <div
        className={`flex-1 flex flex-col justify-between p-4 rounded-xl border ${config.bgColor} ${config.borderColor} transition-all`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-bold text-gray-700">{title}</span>
          <div
            className={`p-1.5 rounded-full bg-white shadow-sm ${config.color}`}
          >
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-end gap-1.5">
            <span className={`text-3xl font-bold leading-none ${config.color}`}>
              {data.current}
            </span>
            <span className="text-xs font-medium text-gray-500 mb-1">dias</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1 font-medium">
            {config.desc}
          </p>
        </div>

        {/* Recorde */}
        <div className="mt-3 pt-3 border-t border-black/5 flex items-center gap-1.5 text-xs text-gray-500">
          <Trophy className="w-3 h-3" />
          <span>
            Recorde: <strong>{data.max}</strong>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
        Ofensiva (Streaks)
      </h3>
      <div className="flex gap-4">
        {renderItem("Dieta", nutrition)}
        {renderItem("Treino", workout)}
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
  const [streaks, setStreaks] = useState<GetUserStreaksResponse>({
    nutrition: { current: 0, max: 0, last_date: null, status: "inactive" },
    workout: { current: 0, max: 0, last_date: null, status: "inactive" },
  });

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
        const [historyData, nutritionResponse, streaksData] = await Promise.all(
          [
            apiClient.getWeightHistory(),
            apiClient.getDailyConsumption(),
            apiClient.getUserStreaks().catch(() => ({
              // Fallback caso a API falhe ou ainda não exista
              nutrition: {
                current: 0,
                max: 0,
                last_date: null,
                status: "inactive" as const,
              },
              workout: {
                current: 0,
                max: 0,
                last_date: null,
                status: "inactive" as const,
              },
            })),
          ]
        );

        setWeightHistory(historyData);
        setNutritionData(nutritionResponse); // Salva o objeto completo (consumed + targets)
        setStreaks(streaksData);
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

  const currentConsumption = useMemo(() => {
    return (
      nutritionData?.consumed || {
        agua_l: 0,
        proteinas_g: 0,
        fibras_g: 0,
        calorias_kcal: 0,
        carboidratos_g: 0,
        gorduras_g: 0,
      }
    );
  }, [nutritionData]);

  const currentTargets: DailyConsumptionResponse["targets"] =
    nutritionData?.targets || {
      agua_l: 2.5,
      proteinas_g: 140,
      fibras_g: 30,
      calorias_kcal: 2000, // Fallback seguro
      carboidratos_g: 30,
      gorduras_g: 30,
    };
  const mappedTargets = useMemo(() => {
    // Valores padrão de fallback caso a API não retorne
    const targets = nutritionData?.targets || {
      agua_l: 2.5,
      proteinas_g: 140,
      fibras_g: 30,
      calorias_kcal: 2000,
      carboidratos_g: 150, // Fallback
      gorduras_g: 60, // Fallback
    };

    return {
      aguaRecomendadaL: targets.agua_l,
      metaProteinas: targets.proteinas_g,
      metaFibras: targets.fibras_g,
      metaCalorias: targets.calorias_kcal,
      metaCarboidratos: targets.carboidratos_g,
      metaGorduras: targets.gorduras_g,
    };
  }, [nutritionData]);

  const allGoalsMet = useMemo(() => {
    if (!nutritionData) return false;

    // Regra:
    // Nutrientes positivos (Água, Proteína, Fibra) -> TEM que bater (>=)
    // Nutrientes de controle (Calorias, Carbs, Gordura) -> NÃO pode estourar (<=)
    return (
      currentConsumption.agua_l >= mappedTargets.aguaRecomendadaL &&
      currentConsumption.proteinas_g >= mappedTargets.metaProteinas &&
      currentConsumption.fibras_g >= mappedTargets.metaFibras &&
      // Limites máximos
      currentConsumption.calorias_kcal <= mappedTargets.metaCalorias &&
      currentConsumption.carboidratos_g <= mappedTargets.metaCarboidratos &&
      currentConsumption.gorduras_g <= mappedTargets.metaGorduras
    );
  }, [nutritionData, currentConsumption, mappedTargets]);

  const handleSaveNutrition = async (
    data: AddConsumptionRequest,
    mode: "add" | "set"
  ) => {
    try {
      let newTotals: DailyConsumption;

      // 1. Salva os dados de nutrição
      if (mode === "add") newTotals = await apiClient.addDailyConsumption(data);
      else newTotals = await apiClient.setDailyConsumption(data);

      // 2. Atualiza o estado visual da nutrição (Gráfico/Card de Monitoramento)
      setNutritionData({
        consumed: newTotals,
        targets: currentTargets, // Mantém os targets atuais
      });

      try {
        const updatedStreaks = await apiClient.getUserStreaks();
        setStreaks(updatedStreaks);
      } catch (streakErr) {
        console.error("Erro ao atualizar streak visual:", streakErr);
      }

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
            nutrition={streaks.nutrition}
            workout={streaks.workout}
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
