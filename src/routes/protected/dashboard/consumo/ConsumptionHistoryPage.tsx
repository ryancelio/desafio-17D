import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router"; // Importante: useNavigate do react-router
import { useAuth } from "../../../../context/AuthContext";
import {
  Calendar,
  Droplets,
  Flame,
  Leaf,
  Utensils,
  Trophy,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { motion } from "framer-motion";

// --- Tipos ---
interface ConsumptionRecord {
  date: string; // YYYY-MM-DD
  agua: number;
  proteinas: number;
  fibras: number;
  calorias: number;
}

type ViewMode = "day" | "week" | "month";

// --- Helpers de Data ---
const getWeekNumber = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export default function ConsumptionHistoryPage() {
  const navigate = useNavigate();
  const { userProfile, firebaseUser } = useAuth();
  const [history, setHistory] = useState<ConsumptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("day");

  // --- Metas Calculadas ---
  const goals = useMemo(() => {
    const weight = 70; // fallback
    return {
      agua: weight * 0.035,
      proteinas: weight * 2.0,
      fibras: 30,
      calorias: 2000,
    };
  }, [userProfile]);

  // --- Busca Dados ---
  useEffect(() => {
    const fetchData = async () => {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch("/api/get_consumption_history.php", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setHistory(data);
      } catch (error) {
        console.error("Erro ao buscar histórico", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [firebaseUser]);

  // --- Lógica de Agrupamento ---
  const groupedData = useMemo(() => {
    if (viewMode === "day") return history;

    const groups: Record<string, ConsumptionRecord & { count: number }> = {};

    history.forEach((item) => {
      const dateObj = new Date(item.date);
      let key = "";

      if (viewMode === "week") {
        const week = getWeekNumber(dateObj);
        const year = dateObj.getFullYear();
        key = `${year}-W${week}`;
      } else {
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        key = `${year}-${month.toString().padStart(2, "0")}`;
      }

      if (!groups[key]) {
        groups[key] = {
          date: key,
          agua: 0,
          proteinas: 0,
          fibras: 0,
          calorias: 0,
          count: 0,
        };
      }

      groups[key].agua += item.agua;
      groups[key].proteinas += item.proteinas;
      groups[key].fibras += item.fibras;
      groups[key].calorias += item.calorias;
      groups[key].count += 1;
    });

    return Object.values(groups)
      .map((g) => ({
        ...g,
        agua: g.agua / g.count,
        proteinas: g.proteinas / g.count,
        fibras: g.fibras / g.count,
        calorias: g.calorias / g.count,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [history, viewMode]);

  // --- Checks ---
  const checkStatus = (type: keyof typeof goals, value: number) => {
    const goal = goals[type];
    if (type === "calorias") return value <= goal;
    return value >= goal;
  };

  const getStatusColor = (isSuccess: boolean) =>
    isSuccess
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-red-50 text-red-600 border-red-100";

  // --- Loading ---
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#FCC3D2]" />
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 min-h-screen">
      {/* --- HEADER MELHORADO --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm transition-all active:scale-95"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-[#FCC3D2] w-7 h-7" /> Histórico
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Acompanhe sua evolução nutricional
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 flex w-full md:w-auto">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                viewMode === mode
                  ? "bg-gray-900 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {mode === "day"
                ? "Diário"
                : mode === "week"
                ? "Semanal"
                : "Mensal"}
            </button>
          ))}
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid gap-4 pb-20">
        {groupedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              Nenhum registro encontrado.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Comece a registrar sua alimentação hoje!
            </p>
          </div>
        ) : (
          groupedData.map((item, index) => {
            // Label Formatter
            let label = "";
            if (viewMode === "day") {
              label = new Date(item.date + "T12:00:00").toLocaleDateString(
                "pt-BR",
                { weekday: "short", day: "2-digit", month: "long" }
              );
            } else if (viewMode === "week") {
              const [y, w] = item.date.split("-W");
              label = `Semana ${w} de ${y}`;
            } else {
              const [y, m] = item.date.split("-");
              label = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString(
                "pt-BR",
                { month: "long", year: "numeric" }
              );
            }

            const proteinOk = checkStatus("proteinas", item.proteinas);
            const fiberOk = checkStatus("fibras", item.fibras);
            const waterOk = checkStatus("agua", item.agua);
            const calOk = checkStatus("calorias", item.calorias);
            const isPerfect = proteinOk && fiberOk && waterOk && calOk;

            return (
              <motion.div
                key={item.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${
                  isPerfect
                    ? "border-[#A8F3DC] ring-1 ring-[#A8F3DC]/50"
                    : "border-gray-100"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isPerfect
                          ? "bg-[#A8F3DC] text-teal-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {isPerfect ? (
                        <Trophy className="w-5 h-5" />
                      ) : (
                        <Calendar className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 capitalize text-lg">
                        {label}
                      </h3>
                      {isPerfect && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full mt-1">
                          Meta Batida! 🎯
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div
                    className={`p-3 rounded-xl border ${getStatusColor(calOk)}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Flame className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Calorias
                      </span>
                    </div>
                    <p className="text-xl font-bold leading-none mb-1">
                      {Math.round(item.calorias)}
                    </p>
                    <p className="text-[10px] opacity-70">
                      Meta: ≤ {goals.calorias}
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${getStatusColor(
                      proteinOk
                    )}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Utensils className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Proteínas
                      </span>
                    </div>
                    <p className="text-xl font-bold leading-none mb-1">
                      {Math.round(item.proteinas)}g
                    </p>
                    <p className="text-[10px] opacity-70">
                      Meta: ≥ {Math.round(goals.proteinas)}g
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${getStatusColor(
                      fiberOk
                    )}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Leaf className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Fibras
                      </span>
                    </div>
                    <p className="text-xl font-bold leading-none mb-1">
                      {Math.round(item.fibras)}g
                    </p>
                    <p className="text-[10px] opacity-70">
                      Meta: ≥ {goals.fibras}g
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${getStatusColor(
                      waterOk
                    )}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Droplets className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Água
                      </span>
                    </div>
                    <p className="text-xl font-bold leading-none mb-1">
                      {item.agua.toFixed(1)}L
                    </p>
                    <p className="text-[10px] opacity-70">
                      Meta: ≥ {goals.agua.toFixed(1)}L
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
