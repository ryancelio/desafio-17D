import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import apiClient, { isApiError } from "../../../api/apiClient";
import {
  LuLoader as LuLoader2,
  LuChevronLeft,
  LuSkipForward,
  LuDumbbell,
  LuInfo,
  LuPlus,
  LuCircleCheck as LuCheckCircle2,
} from "react-icons/lu";
import type { WorkoutPlan } from "../../../types/models";

// --- COMPONENTE: Timer de Descanso (Overlay) ---
const RestTimerOverlay: React.FC<{
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
  onAdd: (seconds: number) => void;
}> = ({ duration, onComplete, onSkip }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const totalTime = useRef(duration);

  useEffect(() => {
    // Reseta se a duração mudar (ex: novo set)
    setTimeLeft(duration);
    totalTime.current = duration;
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  // Cálculo para o círculo SVG
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / totalTime.current;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "tween" }}
      exit={{ opacity: 0, y: "100%" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white"
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-[#A8F3DC]">Descanso</h2>
        <p className="text-gray-400">Respire fundo e recupere-se.</p>
      </div>

      {/* Timer Circular SVG */}
      <div className="relative flex items-center justify-center">
        <svg className="h-80 w-80 -rotate-90 transform">
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-700"
          />
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="#FCC3D2"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-6xl font-bold tabular-nums">{timeLeft}</span>
          <span className="text-sm uppercase tracking-widest text-gray-400">
            segundos
          </span>
        </div>
      </div>

      {/* Controles */}
      <div className="mt-12 flex gap-6">
        <button
          onClick={() => {
            setTimeLeft((p) => p + 30);
            totalTime.current += 30;
          }}
          className="flex flex-col items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-800">
            <LuPlus className="h-6 w-6" />
          </div>
          +30s
        </button>

        <button
          onClick={onSkip}
          className="flex flex-col items-center gap-2 text-sm font-medium text-[#FCC3D2] hover:text-white transition-colors"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FCC3D2] text-gray-900 shadow-lg shadow-[#FCC3D2]/20">
            <LuSkipForward className="h-8 w-8 fill-current" />
          </div>
          Pular
        </button>
      </div>
    </motion.div>
  );
};

// --- COMPONENTE: Player de Vídeo ---
const VideoEmbed: React.FC<{ url: string | null }> = ({ url }) => {
  if (!url) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-gray-200 text-gray-400 rounded-xl">
        <LuDumbbell className="h-12 w-12 opacity-50" />
        <span className="ml-2 text-sm">Sem vídeo</span>
      </div>
    );
  }

  // Extrai ID do Youtube
  let embedUrl = null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com"))
      embedUrl = `https://www.youtube.com/embed/${u.searchParams.get(
        "v"
      )}?controls=0&modestbranding=1&rel=0`;
    else if (u.hostname.includes("youtu.be"))
      embedUrl = `https://www.youtube.com/embed/${u.pathname.slice(
        1
      )}?controls=0&modestbranding=1&rel=0`;
  } catch (e) {
    console.error(e);
  }

  if (!embedUrl) return null;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-sm">
      <iframe
        src={embedUrl}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
export default function WorkoutExecutionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados de Dados
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Execução
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>(
    {}
  ); // Chave: "exIndex-setIndex"
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (!id) throw new Error("ID inválido");
        const data = await apiClient.getWorkoutDetails(parseInt(id));
        setPlan(data);
      } catch (err) {
        setError(
          isApiError(err)
            ? err.response?.data.error || "Erro"
            : "Erro desconhecido"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Helpers
  const currentExercise = plan?.exercises[currentExerciseIndex];

  const prescription = currentExercise?.prescription;
  const totalSets = prescription?.series || 3;

  const toggleSet = (setIndex: number) => {
    const key = `${currentExerciseIndex}-${setIndex}`;
    const isCompleted = !completedSets[key];

    setCompletedSets((prev) => ({ ...prev, [key]: isCompleted }));
    // Se marcou como completo, inicia o descanso.
    if (isCompleted) {
      const restTime = prescription?.rest_seg || 60;
      setRestDuration(restTime);
      setIsResting(true);
    }
  };

  const handleNextExercise = () => {
    if (!plan) return;
    if (currentExerciseIndex < plan.exercises.length - 1) {
      setCurrentExerciseIndex((p) => p + 1);
      window.scrollTo(0, 0);
      return;
    }

    // --- Fim do treino! ---
    // Marca o treino como completo na API
    apiClient.completeWorkout(plan.plan_id).catch((err) => {
      // Mesmo que a API falhe, o usuário deve prosseguir.
      // O erro pode ser logado para análise.
      console.error("Falha ao marcar treino como completo:", err);
    });
    navigate(`/treinos/concluido/${plan.plan_id}`);
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((p) => p - 1);
      window.scrollTo(0, 0);
    }
  };

  // --- UI DE CARREGAMENTO/ERRO ---
  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <LuLoader2 className="h-12 w-12 animate-spin text-[#FCC3D2]" />
      </div>
    );
  if (error || !plan || !currentExercise)
    return (
      <div className="p-8 text-center text-red-500">
        {error || "Exercício não encontrado"}
      </div>
    );

  // Calcula progresso dos sets do exercício atual
  const setsDoneCount = Array.from({ length: totalSets }).filter(
    (_, i) => completedSets[`${currentExerciseIndex}-${i}`]
  ).length;
  const isExerciseFinished = setsDoneCount === totalSets;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-safe">
      {/* Header Fixo */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <button
          onClick={() => {
            if (
              window.confirm(
                "Deseja mesmo sair? O Progresso do treino atual será perdido!"
              )
            ) {
              navigate("/treinos");
            }
          }}
          className="rounded-full p-2 hover:bg-gray-100"
        >
          <LuChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-medium text-gray-500">
            Exercício {currentExerciseIndex + 1} de {plan.exercises.length}
          </h2>
          <p className="text-base font-bold text-gray-900 truncate w-48">
            {currentExercise.nome_exercicio}
          </p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`rounded-full p-2 transition-colors ${
            showInfo
              ? "bg-[#A8F3DC] text-teal-800"
              : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <LuInfo className="h-6 w-6" />
        </button>
      </div>

      {/* Conteúdo com Scroll */}
      <div className="flex-1 space-y-6 p-4 pb-32">
        {/* Vídeo */}
        <VideoEmbed url={currentExercise.link_video} />

        {/* Info Expansível (Descrição) */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden rounded-xl bg-blue-50 px-4 text-sm text-blue-800"
            >
              <div className="py-3">
                <h4 className="font-bold mb-1">Como Executar:</h4>
                <p className="leading-relaxed">
                  {currentExercise.descricao || "Sem descrição disponível."}
                </p>
                {prescription?.observacoes && (
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <span className="font-bold">Nota: </span>{" "}
                    {prescription.observacoes}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card de Prescrição */}
        <div className="flex justify-around rounded-xl bg-white p-4 shadow-sm text-center">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Carga</p>
            <p className="text-xl font-bold text-gray-900">
              {prescription?.carga_kg || 0}{" "}
              <span className="text-sm font-normal text-gray-500">kg</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Reps</p>
            <p className="text-xl font-bold text-gray-900">
              {prescription?.reps || "Falha"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">
              Descanso
            </p>
            <p className="text-xl font-bold text-gray-900">
              {prescription?.rest_seg || 60}{" "}
              <span className="text-sm font-normal text-gray-500">s</span>
            </p>
          </div>
        </div>

        {/* Lista de Sets Interativa */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide ml-1">
            Sets
          </h3>
          {Array.from({ length: totalSets }).map((_, idx) => {
            const isDone = completedSets[`${currentExerciseIndex}-${idx}`];
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSet(idx)}
                className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all ${
                  isDone
                    ? "border-[#A8F3DC] bg-[#F0FDFA]"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      isDone
                        ? "bg-[#A8F3DC] text-teal-800"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="text-left">
                    <p
                      className={`font-medium ${
                        isDone ? "text-gray-800" : "text-gray-600"
                      }`}
                    >
                      {prescription?.reps} repetições
                    </p>
                    <p className="text-xs text-gray-400">
                      {prescription?.carga_kg
                        ? `${prescription.carga_kg}kg`
                        : "Peso do corpo"}
                    </p>
                  </div>
                </div>
                <div
                  className={`rounded-full p-1 ${
                    isDone ? "text-[#A8F3DC]" : "text-gray-300"
                  }`}
                >
                  <LuCheckCircle2
                    className={`h-6 w-6 ${isDone ? "fill-current" : ""}`}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar Flutuante */}
      <div className="fixed bottom-0 left-0 right-0 grid grid-cols-3 items-center gap-4 border-t border-gray-100 bg-white p-4 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Botão Voltar Exercício */}
        <button
          onClick={handlePreviousExercise}
          disabled={currentExerciseIndex === 0}
          className="flex items-center justify-center rounded-xl border-2 border-gray-200 p-4 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LuChevronLeft className="h-6 w-6" />
        </button>

        {/* Botão Principal (Próximo/Finalizar) */}
        <button
          onClick={handleNextExercise}
          disabled={!isExerciseFinished}
          className={`col-span-2 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold transition-all shadow-lg ${
            isExerciseFinished
              ? "bg-[#FCC3D2] text-gray-900 hover:bg-[#db889d] shadow-[#FCC3D2]/30"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentExerciseIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center justify-center gap-2"
            >
              {currentExerciseIndex < plan.exercises.length - 1
                ? "Próximo Exercício"
                : "Finalizar Treino"}
              <LuSkipForward className="h-5 w-5" />
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      {/* Overlay de Descanso */}
      <AnimatePresence>
        {isResting && (
          <RestTimerOverlay
            duration={restDuration}
            onComplete={() => setIsResting(false)}
            onSkip={() => setIsResting(false)}
            onAdd={(s) => setRestDuration((prev) => prev + s)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
