import { useEffect, useState, useMemo } from "react";
import apiClient, {
  isApiError,
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
} from "lucide-react";
import { LuGoal, LuWeight } from "react-icons/lu";

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

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Busca os dados do perfil e o histórico de peso em paralelo
        const [profileData, historyData] = await Promise.all([
          apiClient.getUserProfile(),
          apiClient.getWeightHistory(),
        ]);

        setProfile(profileData);
        setWeightHistory(historyData);
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
    // TODO: Substitua este 'placeholder' pelo dado real vindo do perfil
    // Ex: const pesoAlvo = profile?.peso_alvo || 0;
    const pesoAlvo = 75.0; // << MOCKUP (Peso Alvo: 75kg)

    const pesoAtual =
      weightHistory.length > 0
        ? weightHistory[weightHistory.length - 1].peso_kg
        : null;

    const diferenca = pesoAtual && pesoAlvo ? pesoAtual - pesoAlvo : null;

    return { pesoAtual, pesoAlvo, diferenca };
  }, [weightHistory]);

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
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg bg-red-100 p-4 text-red-700">
        <LuAlertTriangle className="h-8 w-8" />
        <h3 className="font-semibold">Erro ao carregar</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!profile) {
    return <div>Perfil não encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Olá, {firstName}!</h1>

      {/* --- Grid de Cards --- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card de Objetivo */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#FCC3D2]/30 p-2">
              <LuTarget className="h-6 w-6 text-[#db889d]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Seu Objetivo
            </h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">
            {formatObjective(profile.objetivo_atual)}
          </p>
        </div>

        {/* (Você pode adicionar mais cards aqui, ex: Peso Atual) */}

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#A8F3DC]/60 p-2">
              <LuWeight className="h-6 w-6 text-[#2da484]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Peso Atual</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">
            {pesoAtual ? `${pesoAtual.toFixed(1)} kg` : "N/A"}
          </p>
        </div>

        {/* Card de Meta */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <LuGoal className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Meta de Peso
            </h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">
            {pesoAlvo.toFixed(1)} kg
          </p>
          {/* Sub-texto com a diferença */}
          {diferenca !== null && (
            <p
              className={`mt-1 text-sm font-medium ${
                diferenca > 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              {diferenca === 0
                ? "Meta atingida!"
                : `${Math.abs(diferenca).toFixed(1)} kg ${
                    diferenca > 0 ? "acima" : "abaixo"
                  } da meta`}
            </p>
          )}
        </div>
      </div>

      {/* --- Card do Gráfico --- */}
      {/* --- 4. ATUALIZADO: Card do Gráfico --- */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Histórico de Peso (kg)
        </h3>
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
                  activeDot={{ r: 8, fill: "#db889d" }}
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
