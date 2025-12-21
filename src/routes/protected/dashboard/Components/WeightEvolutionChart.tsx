import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Label,
} from "recharts";
import { TrendingUp, Plus, ChevronRight } from "lucide-react";
import type { WeightHistoryEntry } from "../../../../types/models";

interface WeightEvolutionChartProps {
  weightHistory: WeightHistoryEntry[];
  pesoAlvo: number | null;
}

export default function WeightEvolutionChart({
  weightHistory,
  pesoAlvo,
}: WeightEvolutionChartProps) {
  const navigate = useNavigate();

  // 1. Formata os dados para o gráfico
  const chartData = useMemo(() => {
    return weightHistory.map((entry) => ({
      measurement_id: entry.measurement_id,
      // Formata data para dia/mês (ex: 12/05)
      data_medicao: new Date(entry.data_medicao).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      peso_kg: entry.peso_kg,
      full_date: new Date(entry.data_medicao).toLocaleDateString("pt-BR", {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));
  }, [weightHistory]);

  // 2. Calcula o domínio Y dinamicamente para o gráfico não ficar "achatado"
  const yAxisDomain = useMemo(() => {
    const allWeights = weightHistory.map((entry) => entry.peso_kg);
    if (pesoAlvo && pesoAlvo > 0) allWeights.push(pesoAlvo);

    if (allWeights.length === 0) return [50, 100]; // Default

    const min = Math.min(...allWeights) - 2;
    const max = Math.max(...allWeights) + 2;

    return [Math.floor(min), Math.ceil(max)];
  }, [weightHistory, pesoAlvo]);

  // 3. Handlers de Navegação
  const handlePointClick = (data: any) => {
    if (data?.payload?.measurement_id) {
      navigate(`/measurements/${data.payload.measurement_id}`);
    }
  };

  const handleTitleClick = () => {
    if (weightHistory.length > 0) {
      // Leva para a medição mais recente como "histórico"
      // Ou você pode mudar para '/measurements/history' se tiver essa rota
      const latestId = weightHistory[weightHistory.length - 1].measurement_id;
      navigate(`/measurements/${latestId}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Header do Card */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={handleTitleClick}
            disabled={weightHistory.length === 0}
            className="group flex items-center gap-2 hover:opacity-80 transition-opacity disabled:cursor-default"
          >
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              Evolução
            </h3>
            {weightHistory.length > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
            )}
          </button>
        </div>

        <button
          onClick={() => navigate("/measurements/add")}
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Medida
        </button>
      </div>

      {/* Área do Gráfico */}
      <div className="flex-1 min-h-[250px] w-full">
        {weightHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />

              <XAxis
                dataKey="data_medicao"
                stroke="#9ca3af"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />

              <YAxis
                domain={yAxisDomain}
                stroke="#9ca3af"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}`}
              />

              <Tooltip
                cursor={{
                  stroke: "#ec4899",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl text-xs">
                        <p className="font-bold text-gray-800 mb-1">
                          {payload[0].payload.full_date}
                        </p>
                        <p className="text-indigo-600 font-bold text-sm">
                          {payload[0].value} kg
                        </p>
                        <p className="text-gray-400 mt-1 italic">
                          Clique para ver detalhes
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="peso_kg"
                stroke="#ec4899"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPeso)"
                activeDot={{
                  r: 6,
                  stroke: "#fff",
                  strokeWidth: 2,
                  fill: "#ec4899",
                  cursor: "pointer",
                  onClick: (_, event) => handlePointClick(event), // Restaura a navegação ao clicar no ponto
                }}
              />

              {pesoAlvo && pesoAlvo > 0 && (
                <ReferenceLine
                  y={pesoAlvo}
                  stroke="#3b82f6"
                  strokeDasharray="3 3"
                >
                  <Label
                    value="Meta"
                    position="insideTopLeft"
                    fill="#3b82f6"
                    fontSize={10}
                    offset={10}
                  />
                </ReferenceLine>
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            <p className="text-sm font-medium">Sem dados de peso ainda.</p>
            <p className="text-xs mt-1">
              Adicione sua primeira medida para ver o gráfico.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
