import { useState, useEffect, useMemo } from "react";
import apiClient, {
  isApiError,
  type WorkoutPlan,
} from "../../../api/apiClient";
import {
  LuLoader as LuLoader2,
  LuTriangleAlert as LuAlertTriangle,
  LuFileText,
  LuUser,
  LuCrown,
  LuDumbbell,
  LuPlus,
} from "react-icons/lu";
import { Link } from "react-router";
import { motion } from "framer-motion";

// --- Subcomponente: Card da Ficha ---
const PlanCard: React.FC<{ plan: WorkoutPlan }> = ({ plan }) => {
  // Coleta os 3 primeiros músculos únicos de todos os exercícios da ficha
  const musculos = useMemo(() => {
    const muscleSet = new Set<string>();
    plan.exercises.forEach((ex) => {
      ex.musculos_trabalhados?.forEach((m) => muscleSet.add(m));
    });
    return Array.from(muscleSet).slice(0, 3);
  }, [plan.exercises]);

  // Formata a data
  const ultimaExecucao = plan.data_ultima_execucao
    ? new Date(plan.data_ultima_execucao).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
      })
    : "Nenhuma";

  return (
    <Link to={`/treinos/${plan.plan_id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-md h-full"
      >
        <div className="p-5">
          {/* Header do Card (Admin/User) */}
          <div className="flex justify-between items-center mb-2">
            {plan.criada_por === "ADMIN" ? (
              <span className="flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                <LuCrown className="h-3 w-3" />
                Admin
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                <LuUser className="h-3 w-3" />
                Pessoal
              </span>
            )}
            <span className="text-xs text-gray-500">
              Último Treino: {ultimaExecucao}
            </span>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 truncate">
            {plan.nome}
          </h3>
        </div>

        {/* Lista breve de exercícios */}
        <div className="flex-1 px-5 py-3 space-y-2 bg-gray-50">
          <h4 className="text-xs font-semibold uppercase text-gray-500">
            Exercícios
          </h4>
          <ul className="space-y-1">
            {plan.exercises.slice(0, 3).map(
              (
                ex // Mostra os 3 primeiros
              ) => (
                <li
                  key={ex.plan_exercise_id}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <LuDumbbell className="h-4 w-4 text-[#A8F3DC]" />
                  <span className="truncate">{ex.nome_exercicio}</span>
                </li>
              )
            )}
            {plan.exercises.length > 3 && (
              <li className="text-sm text-gray-500 italic">
                + {plan.exercises.length - 3} outros...
              </li>
            )}
          </ul>
        </div>

        {/* Footer (Músculos) */}
        <div className="flex flex-wrap gap-2 border-t border-gray-100 p-4">
          {musculos.map((musculo) => (
            <span
              key={musculo}
              className="px-2 py-0.5 rounded-full bg-[#FCC3D2]/30 text-xs font-medium text-[#db889d]"
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
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient.getUserWorkouts();
        setPlans(data);
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
    fetchPlans();
  }, []);

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
        <h3 className="font-semibold">Erro ao carregar fichas</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <LuFileText className="h-8 w-8 text-gray-800" />
          <h1 className="text-3xl font-bold text-gray-900">Minhas Fichas</h1>
        </div>
        <Link
          to="/treinos/criar"
          className="flex items-center gap-2 rounded-full bg-[#A8F3DC] px-2.5 py-2.5 md:px-4 md:py-2 text-sm font-medium text-gray-800 shadow-md hover:bg-[#8de6c8]"
        >
          <LuPlus className="h-4 w-4" />
          <span className="hidden md:visible">Criar Ficha</span>
        </Link>
      </div>

      {/* Grid de Fichas */}
      {plans.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white shadow-sm text-center text-gray-500">
          <LuFileText className="h-12 w-12" />
          <p className="mt-2 font-medium">Nenhuma ficha de treino encontrada</p>
          <p className="text-sm">Crie uma nova ficha para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.plan_id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
