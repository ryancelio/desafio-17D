import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LuArrowLeft,
  LuPlus,
  LuTrash2,
  LuSave,
  LuDumbbell,
  LuSearch,
  LuLoader as LuLoader2,
  LuClock,
  LuRepeat,
  LuWeight,
  LuStickyNote,
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import apiClient, {
  isApiError,
  type Exercise,
  type CreateWorkoutExerciseInput,
} from "../../../api/apiClient"; // A interface WorkoutPrescriptionInput é usada implicitamente

// --- COMPONENTE: Modal de Seleção de Exercício ---
const ExerciseSelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ex: Exercise) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Busca exercícios quando o modal abre ou a busca muda
  useEffect(() => {
    if (!isOpen) return;
    const fetchEx = async () => {
      setIsLoading(true);
      try {
        // Reutiliza sua API de exercícios com filtro
        const data = await apiClient.getExercises({ search: searchTerm });
        setExercises(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    // Debounce simples
    const timer = setTimeout(fetchEx, 500);
    return () => clearTimeout(timer);
  }, [isOpen, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="border-b p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Adicionar Exercício
          </h3>
          <div className="relative">
            <LuSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar exercício..."
              className="w-full rounded-lg border border-gray-300 p-2 pl-10 focus:border-[#A8F3DC] focus:ring-2 focus:ring-[#A8F3DC] focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <LuLoader2 className="h-8 w-8 animate-spin text-[#FCC3D2]" />
            </div>
          ) : exercises.length === 0 ? (
            <p className="text-center text-gray-500 p-8">
              Nenhum exercício encontrado.
            </p>
          ) : (
            exercises.map((ex) => (
              <button
                key={ex.exercise_id}
                onClick={() => onSelect(ex)}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#A8F3DC]/30 text-[#2da484]">
                  <LuDumbbell className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{ex.nome}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {ex.musculos_trabalhados?.join(", ")}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- COMPONENTE: Item de Exercício Editável ---
const EditableExerciseItem: React.FC<{
  item: CreateWorkoutExerciseInput & { name: string }; // O nome é necessário para a UI
  index: number;
  onChange: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
}> = ({ item, index, onChange, onRemove }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
            {index + 1}
          </span>
          <h4 className="font-bold text-gray-800">{item.name}</h4>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-600 transition-colors p-1"
          title="Remover exercício"
        >
          <LuTrash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {item.prescription.tipo === "tempo" ? (
          <>
            {/* Duração (min) */}
            <div className="col-span-2">
              <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                <LuClock className="h-3 w-3" /> Duração (min)
              </label>
              <input
                type="number"
                min="1"
                step="30"
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#FCC3D2] focus:ring-2 focus:ring-[#FCC3D2] focus:outline-none"
                value={item.prescription.duracao_min}
                onChange={(e) =>
                  onChange(index, "duracao_min", parseInt(e.target.value) || 0)
                }
              />
            </div>
          </>
        ) : (
          <>
            {/* Séries */}
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                <LuRepeat className="h-3 w-3" /> Séries
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#FCC3D2] focus:ring-2 focus:ring-[#FCC3D2] focus:outline-none"
                value={item.prescription.series}
                onChange={(e) =>
                  onChange(index, "series", parseInt(e.target.value) || 0)
                }
              />
            </div>

            {/* Repetições */}
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                <LuRepeat className="h-3 w-3" /> Reps
              </label>
              <input
                type="text"
                placeholder="ex: 10-12"
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#FCC3D2] focus:ring-2 focus:ring-[#FCC3D2] focus:outline-none"
                value={item.prescription.reps}
                onChange={(e) => onChange(index, "reps", e.target.value)}
              />
            </div>

            {/* Carga (kg) */}
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                <LuWeight className="h-3 w-3" /> Carga (kg)
              </label>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#FCC3D2] focus:ring-2 focus:ring-[#FCC3D2] focus:outline-none"
                value={item.prescription.carga_kg}
                onChange={(e) =>
                  onChange(index, "carga_kg", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </>
        )}
        {/* Descanso (s) */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
            <LuClock className="h-3 w-3" /> Descanso (s)
          </label>
          <input
            type="number"
            step="10"
            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#FCC3D2] focus:ring-2 focus:ring-[#FCC3D2] focus:outline-none"
            value={item.prescription.rest_seg}
            onChange={(e) =>
              onChange(index, "rest_seg", parseInt(e.target.value) || 0)
            }
          />
        </div>
      </div>

      {/* Observações */}
      <div className="mt-3">
        <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
          <LuStickyNote className="h-3 w-3" /> Observações (Opcional)
        </label>
        <input
          type="text"
          placeholder="Ex: Drop-set na última, foco na excêntrica..."
          className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#FCC3D2] focus:ring-2 focus:ring-[#FCC3D2] focus:outline-none"
          value={item.prescription.observacoes || ""}
          onChange={(e) => onChange(index, "observacoes", e.target.value)}
        />
      </div>
    </motion.div>
  );
};

// --- PÁGINA PRINCIPAL ---
export default function CreateWorkoutPlanPage() {
  const navigate = useNavigate();
  const [planName, setPlanName] = useState("");
  // Armazenamos o nome do exercício junto para exibição na UI
  const [exercises, setExercises] = useState<
    (CreateWorkoutExerciseInput & { name: string })[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddExercise = (ex: Exercise) => {
    // Verifica se o exercício é baseado em tempo (ex: cardio)
    const isTimeBased =
      ex.tags?.includes("cardio") || ex.tags?.includes("tempo");

    const newExercise: CreateWorkoutExerciseInput & { name: string } = {
      exercise_id: ex.exercise_id,
      name: ex.nome,
      prescription: isTimeBased
        ? {
            // TimePrescriptionInput
            tipo: "tempo",
            duracao_min: 30,
            rest_seg: 0,
            observacoes: "",
          }
        : {
            // NormalPrescriptionInput
            tipo: "normal",
            series: 3,
            reps: "10-12",
            carga_kg: 0,
            rest_seg: 60,
            observacoes: "",
          },
    };

    setExercises((prev) => [...prev, newExercise]);
    setIsModalOpen(false);
  };

  const handleRemoveExercise = (indexToRemove: number) => {
    setExercises((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handlePrescriptionChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setExercises((prev) =>
      prev.map((ex, idx) =>
        idx === index
          ? { ...ex, prescription: { ...ex.prescription, [field]: value } }
          : ex
      )
    );
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      setError("Dê um nome para a sua ficha.");
      return;
    }
    if (exercises.length === 0) {
      setError("Adicione pelo menos um exercício.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.createWorkoutPlan({
        nome: planName,
        // Remove a propriedade 'name' que só existe na UI antes de enviar para a API
        exercises: exercises.map(({ name, ...rest }) => rest),
      });
      navigate("/treinos");
    } catch (err) {
      if (isApiError(err)) {
        setError(err.response?.data.error || "Erro ao criar ficha.");
      } else {
        setError("Falha ao conectar ao servidor.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-2 hover:bg-gray-100 transition-colors"
        >
          <LuArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nova Ficha</h1>
      </div>

      {/* Formulário */}
      <div className="space-y-6">
        {/* Nome da Ficha */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Ficha
          </label>
          <input
            type="text"
            placeholder="Ex: Treino A - Superiores"
            className="w-full rounded-xl border border-gray-300 p-3 text-lg font-semibold focus:border-[#FCC3D2] focus:ring-2 focus:ring-[#FCC3D2] focus:outline-none"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
          />
        </div>

        {/* Lista de Exercícios */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-gray-800">
              Exercícios ({exercises.length})
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-[#db889d] hover:text-[#c06c83] transition-colors"
            >
              <LuPlus className="h-4 w-4" /> Adicionar
            </button>
          </div>

          <AnimatePresence>
            {exercises.map((item, index) => (
              <EditableExerciseItem
                key={index} // Usar index é ok aqui pois a ordem importa e ids podem repetir se o usuário adicionar o mesmo exercício 2x (drop-set, etc)
                index={index}
                item={item}
                onChange={handlePrescriptionChange}
                onRemove={handleRemoveExercise}
              />
            ))}
          </AnimatePresence>

          {exercises.length === 0 && (
            <div
              onClick={() => setIsModalOpen(true)}
              className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition-all hover:border-[#A8F3DC] hover:bg-[#A8F3DC]/10"
            >
              <LuDumbbell className="mb-2 h-8 w-8 opacity-50" />
              <p>Toque para adicionar exercícios</p>
            </div>
          )}
        </div>

        {/* Erro */}
        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Botão Salvar */}
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FCC3D2] py-4 text-lg font-bold text-gray-900 shadow-md transition-all hover:bg-[#db889d] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <LuLoader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <LuSave className="h-5 w-5" /> Salvar Ficha
            </>
          )}
        </button>
      </div>

      {/* Modal de Seleção */}
      <ExerciseSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAddExercise}
      />
    </div>
  );
}
