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

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / totalTime.current;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm md:bg-black/80"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="flex w-full max-w-md flex-col items-center justify-center p-6 text-white md:rounded-3xl md:bg-gray-900 md:p-12 md:shadow-2xl md:border md:border-gray-800"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[#A8F3DC]">Descanso</h2>
          <p className="text-gray-400">Respire fundo e recupere-se.</p>
        </div>

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
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-sm md:rounded-2xl md:shadow-md">
      <iframe
        src={embedUrl}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

// --- COMPONENTE AUXILIAR: Botões de Navegação (Reutilizável) ---
const NavControls: React.FC<{
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  isLast: boolean;
  currentExerciseIndex: number;
}> = ({ onPrev, onNext, canPrev, canNext, isLast, currentExerciseIndex }) => (
  <div className="flex items-center gap-4 w-full">
    <button
      onClick={onPrev}
      disabled={!canPrev}
      className="flex items-center justify-center rounded-xl border-2 border-gray-200 p-4 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <LuChevronLeft className="h-6 w-6" />
    </button>

    <button
      onClick={onNext}
      disabled={!canNext}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold transition-all shadow-lg ${
        canNext
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
          {isLast ? "Finalizar Treino" : "Próximo Exercício"}
          <LuSkipForward className="h-5 w-5" />
        </motion.span>
      </AnimatePresence>
    </button>
  </div>
);

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
  );
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

    apiClient.completeWorkout(plan.plan_id).catch((err) => {
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

  const setsDoneCount = Array.from({ length: totalSets }).filter(
    (_, i) => completedSets[`${currentExerciseIndex}-${i}`]
  ).length;
  const isExerciseFinished = setsDoneCount === totalSets;
  const isLastExercise = currentExerciseIndex >= plan.exercises.length - 1;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-safe md:pb-0 md:h-screen md:overflow-hidden">
      {/* HEADER: Compartilhado, mas ajustado para desktop */}
      <div className="sticky top-0 z-10 bg-white shadow-sm md:static md:bg-transparent md:shadow-none md:pt-6 md:px-8">
        <div className="mx-auto flex max-w-3xl md:max-w-7xl items-center justify-between px-4 py-3 md:px-0">
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
            className="rounded-full p-2 hover:bg-gray-100 md:bg-white md:shadow-sm md:border md:border-gray-200"
          >
            <LuChevronLeft className="h-6 w-6 text-gray-700" />
          </button>

          {/* Header Mobile: Título centralizado */}
          <div className="text-center md:hidden">
            <h2 className="text-sm font-medium text-gray-500">
              Exercício {currentExerciseIndex + 1} de {plan.exercises.length}
            </h2>
            <p className="text-base font-bold text-gray-900 truncate w-48">
              {currentExercise.nome_exercicio}
            </p>
          </div>

          {/* Header Desktop: Texto mais detalhado e alinhado */}
          <div className="hidden md:block md:text-left md:flex-1 md:ml-6">
            <h1 className="text-2xl font-bold text-gray-900">{plan.nome}</h1>
            <p className="text-sm text-gray-500">
              Executando exercício {currentExerciseIndex + 1} de{" "}
              {plan.exercises.length}
            </p>
          </div>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`rounded-full p-2 transition-colors md:hidden ${
              showInfo
                ? "bg-[#A8F3DC] text-teal-800"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <LuInfo className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* CONTEÚDO: Grid no Desktop, Lista no Mobile */}
      <div className="flex-1 w-full max-w-3xl md:max-w-7xl mx-auto md:grid md:grid-cols-12 md:gap-8 md:px-8 md:pb-8 md:h-[calc(100vh-100px)]">
        {/* COLUNA ESQUERDA (Vídeo + Info) */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col md:overflow-y-auto hide-scrollbar">
          <div className="p-4 space-y-6 md:p-0">
            {/* Título do Exercício (Só desktop) */}
            <h2 className="hidden md:block text-3xl font-bold text-gray-900 mb-2">
              {currentExercise.nome_exercicio}
            </h2>

            <VideoEmbed url={currentExercise.link_video} />

            {/* Info Mobile (Expansível) */}
            <div className="md:hidden">
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
                        {currentExercise.descricao ||
                          "Sem descrição disponível."}
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
            </div>

            {/* Info Desktop (Sempre visível e estilizada) */}
            <div className="hidden md:block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                <LuInfo className="h-5 w-5 text-[#FCC3D2]" /> Instruções
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {currentExercise.descricao ||
                  "Siga as instruções do vídeo para executar corretamente."}
              </p>
              {prescription?.observacoes && (
                <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-100">
                  <span className="font-bold">⚠️ Observação: </span>
                  {prescription.observacoes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (Painel de Controle / Stats / Sets) */}
        {/* No mobile, isso é apenas parte do fluxo normal. No desktop, é um card fixo lateral. */}
        <div className="p-4 space-y-6 md:p-0 md:col-span-5 lg:col-span-4 md:flex md:flex-col md:h-full">
          <div className="md:flex-1 md:bg-white md:rounded-3xl md:shadow-xl md:border md:border-gray-100 md:flex md:flex-col md:overflow-hidden">
            {/* Cabeçalho do Card Desktop */}
            <div className="hidden md:block p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs">
                Prescrição
              </h3>
              <div className="flex justify-between items-end mt-2">
                <div className="text-center">
                  <span className="block text-2xl font-black text-gray-900">
                    {prescription?.carga_kg || 0}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">kg</span>
                </div>
                <div className="text-center border-l border-gray-200 pl-4">
                  <span className="block text-2xl font-black text-gray-900">
                    {prescription?.reps || "F"}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Reps
                  </span>
                </div>
                <div className="text-center border-l border-gray-200 pl-4">
                  <span className="block text-2xl font-black text-gray-900">
                    {prescription?.rest_seg || 60}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Descanso (s)
                  </span>
                </div>
              </div>
            </div>

            {/* Card de Prescrição (Versão Mobile) */}
            <div className="flex md:hidden justify-around rounded-xl bg-white p-4 shadow-sm text-center">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Carga
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {prescription?.carga_kg || 0}{" "}
                  <span className="text-sm font-normal text-gray-500">kg</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Reps
                </p>
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

            {/* Lista de Sets */}
            <div className="space-y-3 pb-32 md:pb-0 md:flex-1 md:overflow-y-auto md:p-6 custom-scrollbar">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide ml-1 md:hidden">
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

            {/* Footer do Card Desktop (Navegação Interna) */}
            <div className="hidden md:block p-6 border-t border-gray-100 bg-white">
              <NavControls
                onPrev={handlePreviousExercise}
                onNext={handleNextExercise}
                canPrev={currentExerciseIndex > 0}
                canNext={isExerciseFinished}
                isLast={isLastExercise}
                currentExerciseIndex={currentExerciseIndex}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar Flutuante (Apenas Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white pb-6 pt-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="mx-auto grid max-w-3xl items-center px-4">
          <NavControls
            onPrev={handlePreviousExercise}
            onNext={handleNextExercise}
            canPrev={currentExerciseIndex > 0}
            canNext={isExerciseFinished}
            isLast={isLastExercise}
            currentExerciseIndex={currentExerciseIndex}
          />
        </div>
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
