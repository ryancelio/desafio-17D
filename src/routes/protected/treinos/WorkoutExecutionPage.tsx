import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuLoader as LuLoader2,
  LuChevronLeft,
  LuSkipForward,
  LuDumbbell,
  LuInfo,
  LuPlus,
  LuCircleCheck as LuCheckCircle2,
  LuLogOut,
} from "react-icons/lu";
import type { WorkoutPlan } from "../../../types/models";
import ConfirmationModal from "../../../Components/ConfirmationModal"; // Importe o modal
import {
  completeWorkout,
  getWorkoutDetails,
  isApiError,
} from "../../../api/apiClient";

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
      className="fixed inset-0 z-100 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm md:bg-black/80"
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
              <LuPlus className="h-6 w-6" />
            </div>
            +30s
          </button>

          <button
            onClick={onSkip}
            className="flex flex-col items-center gap-2 text-sm font-medium text-[#FCC3D2] hover:text-white transition-colors"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FCC3D2] text-gray-900 shadow-lg shadow-[#FCC3D2]/20 hover:scale-105 transition-transform">
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
      <div className="flex aspect-video w-full items-center justify-center bg-gray-100 text-gray-400 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="flex flex-col items-center gap-2">
          <LuDumbbell className="h-10 w-10 opacity-30" />
          <span className="text-sm font-medium">Sem vídeo disponível</span>
        </div>
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
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-black/5">
      <iframe
        src={embedUrl}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

// --- COMPONENTE AUXILIAR: Botões de Navegação ---
const NavControls: React.FC<{
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  isLast: boolean;
  currentExerciseIndex: number;
}> = ({ onPrev, onNext, canPrev, canNext, isLast, currentExerciseIndex }) => (
  <div className="flex items-center gap-3 w-full">
    <button
      onClick={onPrev}
      disabled={!canPrev}
      className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-gray-100 bg-white text-gray-400 transition-all hover:border-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
    >
      <LuChevronLeft className="h-6 w-6" />
    </button>

    <button
      onClick={onNext}
      disabled={!canNext}
      className={`flex flex-1 h-14 items-center justify-center gap-3 rounded-2xl text-lg font-bold transition-all active:scale-95 shadow-lg ${
        canNext
          ? "bg-[#FCC3D2] text-gray-900 hover:bg-[#ffb3c6] shadow-[#FCC3D2]/25"
          : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
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
          {isLast ? "Finalizar Treino" : "Próximo"}
          <LuSkipForward className="h-5 w-5 fill-current opacity-80" />
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

  // Estado do Modal
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (!id) throw new Error("ID inválido");
        const data = await getWorkoutDetails(parseInt(id));
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

    completeWorkout(plan.plan_id).catch((err) => {
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

  const handleExitConfirm = () => {
    navigate("/treinos");
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <LuLoader2 className="h-12 w-12 animate-spin text-[#FCC3D2]" />
      </div>
    );
  if (error || !plan || !currentExercise)
    return (
      <div className="flex h-screen items-center justify-center p-8 text-center text-gray-500">
        <div className="bg-white p-8 rounded-3xl shadow-sm">
          <p>{error || "Exercício não encontrado"}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-[#FCC3D2] font-bold hover:underline"
          >
            Voltar
          </button>
        </div>
      </div>
    );

  const setsDoneCount = Array.from({ length: totalSets }).filter(
    (_, i) => completedSets[`${currentExerciseIndex}-${i}`]
  ).length;
  const isExerciseFinished = setsDoneCount === totalSets;
  const isLastExercise = currentExerciseIndex >= plan.exercises.length - 1;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-safe md:pb-0 md:h-screen md:overflow-hidden font-sans">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 md:static md:bg-transparent md:border-none md:pt-6 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-0">
          <button
            onClick={() => setShowExitModal(true)} // Aciona o modal customizado
            className="rounded-xl p-2.5 hover:bg-gray-100 md:bg-white md:shadow-sm md:border md:border-gray-100 md:hover:bg-white text-gray-600 transition-all active:scale-95"
          >
            <LuChevronLeft className="h-6 w-6" />
          </button>

          {/* Header Mobile */}
          <div className="text-center md:hidden">
            <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-0.5">
              Exercício {currentExerciseIndex + 1} / {plan.exercises.length}
            </h2>
            <p className="text-sm font-extrabold text-gray-900 truncate w-48">
              {currentExercise.nome_exercicio}
            </p>
          </div>

          {/* Header Desktop */}
          <div className="hidden md:block md:text-left md:flex-1 md:ml-6">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {plan.nome}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <span className="bg-gray-200 h-1.5 w-1.5 rounded-full" />
              Exercício {currentExerciseIndex + 1} de {plan.exercises.length}
            </div>
          </div>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`rounded-xl p-2.5 transition-all md:hidden active:scale-95 ${
              showInfo
                ? "bg-[#A8F3DC] text-teal-900 shadow-inner"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <LuInfo className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* CONTEÚDO: Grid Desktop / Lista Mobile */}
      <div className="flex-1 w-full max-w-7xl mx-auto md:grid md:grid-cols-12 md:gap-8 md:px-8 md:pb-8 md:h-[calc(100vh-100px)]">
        {/* COLUNA ESQUERDA (Media & Info) */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col md:overflow-y-auto hide-scrollbar">
          <div className="p-4 space-y-6 md:p-0">
            {/* Título Desktop */}
            <h2 className="hidden md:block text-4xl font-black text-gray-900 mb-2 tracking-tight">
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
                    className="overflow-hidden rounded-2xl bg-white border border-blue-100 shadow-sm p-5 text-sm text-gray-700"
                  >
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <LuInfo className="w-4 h-4 text-blue-500" /> Como Executar
                    </h4>
                    <p className="leading-relaxed text-gray-600">
                      {currentExercise.descricao || "Sem descrição disponível."}
                    </p>
                    {prescription?.observacoes && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <span className="font-bold text-yellow-600 block mb-1">
                          Nota do Treinador:
                        </span>
                        {prescription.observacoes}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Info Desktop (Fixo) */}
            <div className="hidden md:block bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <LuInfo className="h-5 w-5 text-[#FCC3D2]" /> Instruções
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {currentExercise.descricao ||
                  "Siga as instruções do vídeo para executar corretamente. Mantenha a postura e respiração controlada."}
              </p>
              {prescription?.observacoes && (
                <div className="mt-6 p-5 bg-yellow-50/80 text-yellow-800 rounded-2xl border border-yellow-100/50">
                  <span className="font-bold flex items-center gap-2 mb-1">
                    ⚠️ Observação Importante
                  </span>
                  {prescription.observacoes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (Controles e Sets) */}
        <div className="p-4 space-y-6 md:p-0 md:col-span-5 lg:col-span-4 md:flex md:flex-col md:h-full">
          <div className="md:flex-1 md:bg-white md:rounded-4xl md:shadow-xl md:shadow-gray-200/50 md:border md:border-gray-100 md:flex md:flex-col md:overflow-hidden relative">
            {/* Header Card Desktop */}
            <div className="hidden md:block p-8 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-[#FCC3D2]" />
                <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs">
                  Meta do Exercício
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <span className="block text-2xl font-black text-gray-900 tracking-tight">
                    {prescription?.carga_kg || 0}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    kg
                  </span>
                </div>
                <div className="text-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <span className="block text-2xl font-black text-gray-900 tracking-tight">
                    {prescription?.reps || "F"}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Reps
                  </span>
                </div>
                <div className="text-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <span className="block text-2xl font-black text-gray-900 tracking-tight">
                    {prescription?.rest_seg || 60}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Seg
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Card Mobile */}
            <div className="grid grid-cols-3 gap-3 md:hidden mb-2">
              <div className="bg-white p-3 rounded-2xl border border-gray-100 text-center shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                  Carga
                </p>
                <p className="text-lg font-black text-gray-900 leading-none">
                  {prescription?.carga_kg || 0}
                  <span className="text-xs font-medium text-gray-400 ml-0.5">
                    kg
                  </span>
                </p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-gray-100 text-center shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                  Reps
                </p>
                <p className="text-lg font-black text-gray-900 leading-none">
                  {prescription?.reps || "F"}
                </p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-gray-100 text-center shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                  Descanso
                </p>
                <p className="text-lg font-black text-gray-900 leading-none">
                  {prescription?.rest_seg || 60}
                  <span className="text-xs font-medium text-gray-400 ml-0.5">
                    s
                  </span>
                </p>
              </div>
            </div>

            {/* Lista de Sets Interativa */}
            <div className="space-y-3 pb-32 md:pb-0 md:flex-1 md:overflow-y-auto md:p-6 custom-scrollbar relative">
              <div className="flex items-center justify-between mb-2 px-1 md:hidden">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Séries ({totalSets})
                </h3>
                <span className="text-xs text-gray-400">
                  {setsDoneCount} concluídas
                </span>
              </div>

              {Array.from({ length: totalSets }).map((_, idx) => {
                const isDone = completedSets[`${currentExerciseIndex}-${idx}`];
                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleSet(idx)}
                    className={`group flex w-full items-center justify-between rounded-2xl border-2 p-4 transition-all duration-300 ${
                      isDone
                        ? "border-[#A8F3DC] bg-[#F0FDFA] shadow-sm"
                        : "border-transparent bg-white shadow-sm hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                          isDone
                            ? "bg-[#A8F3DC] text-teal-800"
                            : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="text-left">
                        <p
                          className={`font-bold text-base ${
                            isDone ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {prescription?.reps} repetições
                        </p>
                        <p className="text-xs font-medium text-gray-400">
                          {prescription?.carga_kg
                            ? `${prescription.carga_kg}kg`
                            : "Peso do corpo"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`rounded-full p-2 transition-all ${
                        isDone
                          ? "text-[#A8F3DC] bg-teal-50"
                          : "text-gray-300 bg-gray-50 group-hover:bg-gray-100"
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

            {/* Footer Desktop */}
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

      {/* Bottom Bar Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white/90 backdrop-blur-lg pb-safe pt-4 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-10">
        <div className="mx-auto grid max-w-3xl items-center px-4 pb-4">
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

      {/* OVERLAY: Timer */}
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

      {/* MODAL: Confirmação de Saída */}
      <ConfirmationModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitConfirm}
        variant="danger"
        title="Sair do Treino?"
        description="Se você sair agora, todo o progresso não salvo deste exercício será perdido. Tem certeza?"
        confirmText="Sim, sair"
        cancelText="Continuar treinando"
        icon={LuLogOut}
      />
    </div>
  );
}
