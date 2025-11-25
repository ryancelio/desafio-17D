import { useEffect, useState, useMemo } from "react";
import apiClient, {
  isApiError,
  // type ApiResponse,
  type DailyConsumption,
  type UserProfile,
  type WeightHistoryEntry, // (Será adicionado no apiClient)
} from "../../../api/apiClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Label,
} from "recharts";
import {
  Target as LuTarget,
  Loader2 as LuLoader2,
  AlertTriangle as LuAlertTriangle,
  GlassWater as LuGlassWater,
  Plus as LuPlus,
  Star as LuStar,
  Flame as LuFlame,
} from "lucide-react";
import AddNutritionModal from "./Components/NutritionModal";
import { useNavigate } from "react-router";
import { LuGoal, LuLeaf, LuWeight } from "react-icons/lu";
import { AnimatePresence, motion } from "framer-motion";
import { Objetivo } from "../../../types/onboarding.schema";

// Função para formatar o nome do objetivo
const formatObjective = (objective: UserProfile["objetivo_atual"]): string => {
  switch (objective) {
    case "perder_peso":
      return "Perder Peso";
    case "definir":
      return "Definição Muscular";
    case "ganhar_massa":
      return "Ganhar Massa";
    default:
      return "Não definido";
  }
};

// --- 1. NOVO: Componente de Barra de Progresso Nutricional ---
const NutritionProgress: React.FC<{
  icon: React.ElementType;
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}> = ({ icon: Icon, label, current, target, unit, color }) => {
  const percentage = target > 0 ? (current / target) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-gray-500" />
          <span className="font-semibold text-gray-700">{label}</span>
        </div>
        <p className="text-sm font-medium text-gray-600">
          <span className="font-bold text-gray-800">{current.toFixed(1)}</span>/
          {target.toFixed(1)} {unit}
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className="h-2.5 rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 1.5,
          }}
        />
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals] = useState<Objetivo | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightHistoryEntry[]>([]);
  const [dailyConsumption, setDailyConsumption] =
    useState<DailyConsumption | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNutritionModalOpen, setNutritionModalOpen] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Busca os dados do perfil e o histórico de peso em paralelo
        const [profileData, historyData, consumptionData, objetivoData] =
          await Promise.all([
            apiClient.getUserProfile(),
            apiClient.getWeightHistory(),
            apiClient.getDailyConsumption(),
            apiClient.get,
          ]);

        setProfile(profileData);
        setWeightHistory(historyData);
        setDailyConsumption(consumptionData);
      } catch (err) {
        if (isApiError(err)) {
          setError(err.response?.data.error || "Erro");
        } else {
          setError("Falha ao carregar o dashboard.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Formata os dados do gráfico (ex: datas)
  const chartData = useMemo(() => {
    return weightHistory.map((entry) => ({
      measurement_id: entry.measurement_id, // <-- PASSAR O ID PARA O GRÁFICO
      // Formata a data 'YYYY-MM-DD' para 'DD/MM'
      data_medicao: new Date(entry.data_medicao).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      peso_kg: entry.peso_kg,
    }));
  }, [weightHistory]);

  const firstName = profile?.nome.split(" ")[0] || "Usuário";

  const { pesoAtual, pesoAlvo, diferenca } = useMemo(() => {
    // Busca o peso alvo do perfil do usuário
    const pesoAlvo = profile?.peso_alvo || 0;

    const pesoAtual =
      weightHistory.length > 0
        ? weightHistory[weightHistory.length - 1].peso_kg
        : null;

    const diferenca = pesoAtual && pesoAlvo ? pesoAtual - pesoAlvo : null;

    return { pesoAtual, pesoAlvo, diferenca };
  }, [weightHistory, profile?.peso_alvo]);

  const nutritionTargets = useMemo(() => {
    const aguaRecomendadaL = pesoAtual ? (pesoAtual * 35) / 1000 : 2.5;
    const metaProteinas = 140; // MOCK
    const metaFibras = 30; // MOCK
    const metaCalorias = 2000; // MOCK
    return { aguaRecomendadaL, metaProteinas, metaFibras, metaCalorias };
  }, [pesoAtual]);

  // Verifica se todas as metas diárias foram atingidas
  const allGoalsMet = useMemo(() => {
    if (!dailyConsumption) return false;

    const waterGoalMet =
      dailyConsumption.agua_l >= nutritionTargets.aguaRecomendadaL;
    const proteinGoalMet =
      dailyConsumption.proteinas_g >= nutritionTargets.metaProteinas;
    const fiberGoalMet =
      dailyConsumption.fibras_g >= nutritionTargets.metaFibras;
    const caloriesWithinLimit =
      dailyConsumption.calorias_kcal <= nutritionTargets.metaCalorias;

    return (
      waterGoalMet && proteinGoalMet && fiberGoalMet && caloriesWithinLimit
    );
  }, [dailyConsumption, nutritionTargets]);

  const handleSaveNutrition = async (data: {
    agua: number;
    proteinas: number;
    fibras: number;
  }) => {
    try {
      // Envia os deltas (o que adicionar) para a API
      const newTotals = await apiClient.addDailyConsumption(data);
      // Atualiza o estado local com os *novos totais* retornados pela API
      setDailyConsumption(newTotals);
    } catch (err) {
      console.error("Falha ao salvar consumo:", err);
      // (Opcional: mostrar um 'toast' de erro)
    }
  };

  // --- 2. NOVO: CALCULAR DOMÍNIO DO EIXO Y ---
  const yAxisDomain = useMemo(() => {
    // Coleta todos os valores de peso
    const allWeights = weightHistory.map((entry) => entry.peso_kg);
    if (pesoAlvo > 0) {
      allWeights.push(pesoAlvo);
    }

    // Se não houver dados, retorna um padrão
    if (allWeights.length === 0) {
      return [60, 90]; // Um fallback razoável
    }

    const min = Math.min(...allWeights);
    const max = Math.max(...allWeights);

    // Adiciona um "padding" de 2kg acima e abaixo
    const padding = 2;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [weightHistory, pesoAlvo]);

  // --- Estados de UI ---

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LuLoader2 className="h-12 w-12 animate-spin text-[#FCC3D2]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg text-center bg-red-100 p-4 text-red-700">
        <LuAlertTriangle className="h-8 w-8" />
        <h3 className="font-semibold">Erro ao carregar o dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!profile || !dailyConsumption) {
    return <div>Não foi possível carregar os dados do dashboard.</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Olá, {firstName}!</h1>
        <div className="flex items-center gap-2 text-gray-500 mt-1">
          <LuTarget className="h-4 w-4" />
          <span className="font-medium">
            {formatObjective(profile.objetivo_atual)}
          </span>
        </div>
      </div>

      {/* --- Grid de Cards --- */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card de Acompanhamento Diário */}
        <div className="relative col-span-2 space-y-5 overflow-hidden rounded-2xl bg-white p-6 shadow-md">
          {/* Ribbon de Conquista */}
          <AnimatePresence>
            {allGoalsMet && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="absolute top-3 -left-11 flex h-8 w-32 transform items-center justify-center bg-yellow-400 shadow-lg -rotate-45"
                style={{ transform: "rotate(-45deg)" }}
              >
                <LuStar
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  style={{ transform: "rotate(45deg)" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between gap-1 items-center mb-3">
            <h3 className="text-xl font-semibold text-gray-800">
              Acompanhamento Diário
            </h3>
            <button
              onClick={() => setNutritionModalOpen(true)}
              className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LuPlus className="w-4 h-4" />
              <span className="hidden md:block">Adicionar</span>
            </button>
          </div>
          <NutritionProgress
            icon={LuGlassWater}
            label="Água"
            current={dailyConsumption.agua_l}
            target={nutritionTargets.aguaRecomendadaL}
            unit="L"
            color="linear-gradient(to right, #60a5fa, #3b82f6)" // Azul
          />
          <NutritionProgress
            icon={LuWeight} // Ícone placeholder
            label="Proteínas"
            current={dailyConsumption.proteinas_g}
            target={nutritionTargets.metaProteinas}
            unit="g"
            color="linear-gradient(to right, #fca5a5, #ef4444)" // Vermelho
          />
          <NutritionProgress
            icon={LuLeaf} // Ícone placeholder
            label="Fibras"
            current={dailyConsumption.fibras_g}
            target={nutritionTargets.metaFibras}
            unit="g"
            color="linear-gradient(to right, #86efac, #22c55e)" // Verde
          />
          <NutritionProgress
            icon={LuFlame}
            label="Calorias"
            current={dailyConsumption.calorias_kcal}
            target={nutritionTargets.metaCalorias}
            unit="kcal"
            color="linear-gradient(to right, #fdbb74, #f97316)" // Laranja
          />
        </div>
        {/* Card de Peso Atual */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-md">
          <h3 className="text-md font-semibold text-gray-600">Peso Atual</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {pesoAtual ? `${pesoAtual.toFixed(1)} kg` : "N/A"}
          </p>
          <LuWeight className="absolute -right-4 -bottom-4 h-24 w-24 text-gray-200/40" />
        </div>

        {/* Card de Meta */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-md">
          <h3 className="text-md font-semibold text-gray-600">Meta de Peso</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {pesoAlvo.toFixed(1)} kg
          </p>
          {/* Sub-texto com a diferença */}
          {diferenca !== null && (
            <p
              className={`mt-1 text-xs font-medium ${
                diferenca > 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              {diferenca === 0
                ? "Meta atingida!"
                : `${diferenca > 0 ? "+" : ""}${diferenca.toFixed(
                    1
                  )}kg da meta`}
            </p>
          )}
          <LuGoal className="absolute -right-4 -bottom-4 h-24 w-24 text-gray-200/40" />
        </div>
      </div>

      {/* --- Renderização do Modal --- */}
      <AnimatePresence>
        {isNutritionModalOpen && (
          <AddNutritionModal
            onClose={() => setNutritionModalOpen(false)}
            onSave={handleSaveNutrition}
          />
        )}
      </AnimatePresence>

      {/* --- Card do Gráfico --- */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Histórico de Peso (kg)
          </h3>
          <button
            onClick={() => navigate("/measurements/add")}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LuPlus className="w-4 h-4" /> Adicionar Medida
          </button>
        </div>
        {chartData.length > 0 ? ( // Alterado para > 0
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="data_medicao" stroke="#6b7280" />
                <YAxis
                  stroke="#6b7280"
                  // Define o domínio manualmente para incluir a meta
                  domain={yAxisDomain}
                  // Garante que a linha de referência seja exibida
                  allowDataOverflow={true}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "0.5rem",
                    borderColor: "#ddd",
                  }}
                  labelStyle={{ color: "#333", fontWeight: "bold" }}
                />
                {/* Linha de Peso Atual (Rosa) */}
                <Line
                  type="monotone"
                  dataKey="peso_kg"
                  stroke="#FCC3D2"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#FCC3D2" }}
                  activeDot={{
                    r: 8,
                    fill: "#db889d",
                    stroke: "#fff",
                    strokeWidth: 2,
                    cursor: "pointer",
                    // O primeiro argumento é o evento, o segundo é o payload com os dados.
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick: (_event: any, data: any) => {
                      if (data?.payload?.measurement_id) {
                        navigate(
                          `/measurements/${data.payload.measurement_id}`
                        );
                      }
                    },
                  }}
                />

                {/* Linha de Referência da Meta (Azul Pontilhada) */}
                {pesoAlvo > 0 && (
                  <ReferenceLine
                    y={pesoAlvo}
                    stroke="#3b82f6" // Azul
                    strokeWidth={2}
                    strokeDasharray="4 4" // Pontilhado
                  >
                    <Label
                      value={`Meta: ${pesoAlvo} kg`}
                      position="insideTopLeft"
                      fill="#3b82f6"
                      fontSize={12}
                      offset={10} // Deslocamento para não ficar na borda
                    />
                  </ReferenceLine>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-80 items-center justify-center text-center text-gray-500">
            <p>
              Nenhuma medição encontrada.
              <br />
              Adicione seu peso na página "Perfil" para começar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
