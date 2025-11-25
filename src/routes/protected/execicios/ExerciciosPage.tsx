import { useState, useEffect } from "react";
import apiClient, {
  isApiError,
  type Exercise,
  type ExerciseFilters,
} from "../../../api/apiClient";
import {
  LuLoader as LuLoader2,
  LuTriangleAlert as LuAlertTriangle,
  LuX,
  LuSearch,
  LuDumbbell,
  LuYoutube,
  LuScan,
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import useDebounce from "../../../hooks/debouce";

// --- 2. Filtros Disponíveis (Mock) ---
const allMuscles = [
  "peito",
  "costas",
  "ombro",
  "biceps",
  "triceps",
  "quadriceps",
  "gluteos",
  "lombar",
  "cardio",
];
const allTags = [
  "upper_body",
  "lower_body",
  "push",
  "pull",
  "legs",
  "iniciante",
];

// --- 3. Subcomponente: Card do Exercício (ATUALIZADO) ---
const ExerciseCard: React.FC<{ exercise: Exercise; onClick: () => void }> = ({
  exercise,
  onClick,
}) => (
  <motion.div
    layoutId={`exercise-card-${exercise.exercise_id}`}
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    onClick={onClick}
    className="flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-md"
  >
    {/* Imagem de placeholder (você pode trocar por 'url_imagem' se tiver) */}
    <img
      src={`https://placehold.co/600x400/A8F3DC/333?text=${encodeURIComponent(
        exercise.nome
      )}`}
      alt={exercise.nome}
      className="aspect-video w-full object-cover"
      // Fallback para o ícone se o placeholder falhar
      onError={(e) => {
        e.currentTarget.style.display = "none"; // Esconde a imagem quebrada
        // (O ícone de fallback abaixo será exibido)
      }}
    />
    {/* Fallback do Ícone (mostrado se a imagem acima falhar) */}
    {/* <div className="aspect-video w-full bg-gray-200 flex items-center justify-center">
      <LuDumbbell className="h-16 w-16 text-gray-400" />
    </div> */}

    <div className="flex-1 p-4">
      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
        {exercise.nome}
      </h3>
      <div className="mt-2 flex flex-wrap gap-1">
        {exercise.musculos_trabalhados?.slice(0, 3).map((musculo) => (
          <span
            key={musculo}
            className="px-2 py-0.5 rounded-full bg-[#FCC3D2]/30 text-xs font-medium text-[#db889d]"
          >
            {musculo}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

// --- 4. Subcomponente: Modal de Detalhes do Exercício ---
// (Este componente permanece o mesmo)
const getEmbedUrl = (url: string | null): string | null => {
  // ... (lógica getEmbedUrl)
  if (!url) return null;
  try {
    const videoUrl = new URL(url);
    if (videoUrl.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${videoUrl.pathname.slice(1)}`;
    }
    if (
      videoUrl.hostname.includes("youtube.com") &&
      videoUrl.searchParams.has("v")
    ) {
      return `https://www.youtube.com/embed/${videoUrl.searchParams.get("v")}`;
    }
  } catch {
    console.error("URL de vídeo inválida:", url);
  }
  return null;
};

function ExerciseModal({
  exercise,
  onClose,
}: {
  exercise: Exercise;
  onClose: () => void;
}) {
  const embedUrl = getEmbedUrl(exercise.link_video);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        layoutId={`exercise-card-${exercise.exercise_id}`}
        initial={{ scale: 0.9, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 rounded-full bg-black/30 p-1.5 text-white transition-all hover:bg-black/50"
        >
          <LuX className="h-5 w-5" />
        </button>
        {embedUrl ? (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={exercise.nome}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        ) : (
          <div className="aspect-video w-full bg-gray-200 flex items-center justify-center">
            <LuYoutube className="h-16 w-16 text-gray-400" />
            <span className="absolute text-gray-500 text-sm">
              Vídeo indisponível
            </span>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{exercise.nome}</h1>
          {exercise.musculos_trabalhados && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <LuScan className="text-[#A8F3DC]" /> Músculos Trabalhados
              </h2>
              <div className="flex flex-wrap gap-2">
                {exercise.musculos_trabalhados.map((musculo) => (
                  <span
                    key={musculo}
                    className="px-3 py-1 rounded-full bg-[#FCC3D2]/30 text-sm font-medium text-[#db889d]"
                  >
                    {musculo}
                  </span>
                ))}
              </div>
            </div>
          )}
          {exercise.descricao && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Como Executar
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {exercise.descricao}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
// --- FIM DOS SUBCOMPONENTES ---

// --- 5. Componente Principal da Página (Layout ATUALIZADO) ---
export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  // Estados de Filtro
  const [searchText, setSearchText] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const debouncedSearchText = useDebounce(searchText, 500);

  // (useEffect de Busca - permanece o mesmo)
  useEffect(() => {
    const filters: ExerciseFilters = {};

    if (debouncedSearchText.trim()) {
      filters.search = debouncedSearchText.trim();
    }
    if (selectedMuscles.length > 0) {
      filters.musculos = selectedMuscles;
    }
    if (selectedTags.length > 0) {
      filters.tags = selectedTags;
    }

    const fetchExercises = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient.getExercises(filters);
        setExercises(data);
      } catch (err) {
        if (isApiError(err)) {
          setError(err.response?.data.error || "Erro");
        } else {
          setError("Falha ao carregar os exercícios.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchExercises();
  }, [debouncedSearchText, selectedMuscles, selectedTags]);

  // (Handlers de Filtro - permanecem os mesmos)
  const handleMuscleToggle = (muscle: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    );
  };
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // --- Estados de UI ---
  if (isInitialLoad && isLoading) {
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
        <h3 className="font-semibold">Erro ao carregar exercícios</h3>
        <p>{error}</p>
      </div>
    );
  }

  // --- NOVO LAYOUT DE 2 COLUNAS ---
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3">
        <LuDumbbell className="h-8 w-8 text-gray-800" />
        <h1 className="text-3xl font-bold text-gray-900">Exercícios</h1>
      </div>

      <div className="flex flex-col md:flex-row md:gap-8">
        {/* --- Coluna de Filtros (Sidebar) --- */}
        <aside className="md:w-1/3 lg:w-1/4 md:sticky md:top-8 md:self-start">
          <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
            {/* Filtro de Texto */}
            <div className="relative">
              <input
                type="search"
                placeholder="Buscar por nome..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#FCC3D2]"
              />
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Filtros de Músculos */}
            <div className="space-y-2 pt-2">
              <label className="font-medium text-gray-700 text-sm">
                Músculo
              </label>
              <div className="flex flex-wrap gap-2">
                {allMuscles.map((muscle) => {
                  const isActive = selectedMuscles.includes(muscle);
                  return (
                    <button
                      key={muscle}
                      onClick={() => handleMuscleToggle(muscle)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#FCC3D2] text-gray-800"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      {muscle}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtros de Tags */}
            <div className="space-y-2 pt-2">
              <label className="font-medium text-gray-700 text-sm">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#A8F3DC]/70 text-gray-800"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* --- Coluna de Conteúdo (Grid de Exercícios) --- */}
        <div className="flex-1 md:w-2/3 lg:w-3/4 mt-6 md:mt-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <LuLoader2 className="h-12 w-12 animate-spin text-[#FCC3D2]" />
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white shadow-sm text-center text-gray-500">
              <LuDumbbell className="h-12 w-12" />
              <p className="mt-2 font-medium">Nenhum exercício encontrado</p>
              <p className="text-sm">Tente ajustar seus filtros.</p>
            </div>
          ) : (
            // Grid com 2 colunas, para diferenciar das 3 colunas de Receitas
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.exercise_id}
                  exercise={exercise}
                  onClick={() => setSelectedExercise(exercise)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <ExerciseModal
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
