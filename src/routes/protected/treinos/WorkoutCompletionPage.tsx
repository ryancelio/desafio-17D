import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import {
  LuArrowLeft,
  LuAward,
  LuChartBar as LuBarChart,
  LuDumbbell,
  LuLoader as LuLoader2,
  LuShieldCheck,
  LuTriangleAlert,
} from "react-icons/lu";
import apiClient, { type WorkoutPlan } from "../../../api/apiClient";

const MuscleChip: React.FC<{ muscle: string; index: number }> = ({
  muscle,
  index,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 100 }}
    className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm"
  >
    <LuDumbbell className="h-4 w-4 text-[#A8F3DC]" />
    <span className="text-sm font-medium capitalize text-gray-700">
      {muscle.replace(/_/g, " ")}
    </span>
  </motion.div>
);

export default function WorkoutCompletionPage() {
  const { id } = useParams();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) {
        setError("ID do treino não encontrado.");
        setIsLoading(false);
        return;
      }
      try {
        const data = await apiClient.getWorkoutDetails(parseInt(id, 10));
        setPlan(data);
      } catch (e) {
        setError("Não foi possível carregar os detalhes do treino.", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();

    // Para a animação de confetes após alguns segundos
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, [id]);

  const workedMuscles = useMemo(() => {
    if (!plan) return [];
    const muscleSet = new Set<string>();
    plan.exercises.forEach((ex) => {
      ex.musculos_trabalhados?.forEach((m) => muscleSet.add(m));
    });
    return Array.from(muscleSet);
  }, [plan]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <LuLoader2 className="h-12 w-12 animate-spin text-[#FCC3D2]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-red-50 p-4 text-center text-red-700">
        <LuTriangleAlert className="h-12 w-12" />
        <h3 className="text-xl font-semibold">Ocorreu um Erro</h3>
        <p>{error}</p>
        <Link
          to="/treinos"
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
        >
          Voltar para Fichas
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-900 p-6 text-white">
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={400}
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        className="z-10 text-center"
      >
        <LuAward className="mx-auto h-24 w-24 text-yellow-400" />
        <h1 className="mt-4 text-4xl font-bold">Parabéns!</h1>
        <p className="mt-2 text-lg text-gray-300">
          Você completou o treino{" "}
          <span className="font-bold text-[#FCC3D2]">{plan?.nome}</span>.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="z-10 mt-12 w-full max-w-md rounded-2xl bg-white/10 p-6 backdrop-blur-lg"
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-300">
          <LuShieldCheck />
          Músculos Trabalhados
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {workedMuscles.map((muscle, i) => (
            <MuscleChip key={muscle} muscle={muscle} index={i} />
          ))}
        </div>
      </motion.div>

      <Link
        to="/treinos"
        className="z-10 mt-12 flex items-center gap-2 rounded-full bg-[#A8F3DC] px-6 py-3 font-bold text-gray-900 shadow-lg transition-transform hover:scale-105"
      >
        <LuArrowLeft /> Voltar para Fichas
      </Link>
    </div>
  );
}
