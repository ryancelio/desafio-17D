import { useState, useEffect } from "react";
import apiClient, { isApiError } from "../../../api/apiClient";
import {
  // LuLoaderCircle as LuLoader2,
  LuTriangleAlert as LuAlertTriangle,
  LuX,
  LuSearch,
  LuDumbbell,
  LuScan,
  LuFilter,
  LuHouse as LuHome,
  LuBuilding2,
  LuLayers,
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import useDebounce from "../../../hooks/debouce";
import type { Exercise, ExerciseTaxonomy } from "../../../types/models";
import type { ExerciseFilters } from "../../../types/api-types";
import { useAuth } from "../../../context/AuthContext";

// --- Skeleton Card Component ---
const SkeletonCard = () => (
  <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 animate-pulse h-full">
    {/* Imagem Skeleton */}
    <div className="aspect-video w-full bg-gray-200 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"
        style={{ backgroundSize: "200% 100%" }}
      ></div>
    </div>

    {/* Conteúdo Skeleton */}
    <div className="flex-1 p-4 space-y-3">
      {/* Título */}
      <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>

      {/* Tags */}
      <div className="flex gap-2 pt-1">
        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

// --- Subcomponente: Card do Exercício (MANTIDO) ---
const ExerciseCard: React.FC<{ exercise: Exercise; onClick: () => void }> = ({
  exercise,
  onClick,
}) => (
  <motion.div
    layoutId={`exercise-card-${exercise.exercise_id}`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    onClick={onClick}
    className="flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 group hover:shadow-md transition-shadow h-full"
  >
    <div className="aspect-video w-full bg-gray-50 overflow-hidden relative">
      <img
        src={
          exercise.thumb_url ||
          `https://placehold.co/600x400/A8F3DC/333?text=${encodeURIComponent(
            exercise.nome
          )}`
        }
        alt={exercise.nome}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
        }}
      />
      {/* Badge de Categoria */}
      <div className="absolute top-2 right-2">
        {exercise.categoria === "calistenia" && (
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200 shadow-sm flex items-center gap-1">
            <LuHome className="w-3 h-3" /> Casa
          </span>
        )}
        {exercise.categoria === "academia" && (
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full border border-indigo-200 shadow-sm flex items-center gap-1">
            <LuBuilding2 className="w-3 h-3" /> Gym
          </span>
        )}
      </div>

      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <LuDumbbell className="h-16 w-16 text-gray-200" />
      </div>
    </div>

    <div className="flex-1 p-4 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-gray-800 line-clamp-1 leading-tight">
          {exercise.nome}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1">
          {exercise.musculos_trabalhados?.slice(0, 3).map((musculo) => (
            <span
              key={musculo}
              className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-semibold text-gray-500 uppercase tracking-wide"
            >
              {musculo}
            </span>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Helper Embed (MANTIDO) ---
const getEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;
  try {
    const videoUrl = new URL(url);
    if (videoUrl.hostname === "youtu.be")
      return `https://www.youtube.com/embed/${videoUrl.pathname.slice(1)}`;
    if (
      videoUrl.hostname.includes("youtube.com") &&
      videoUrl.searchParams.has("v")
    )
      return `https://www.youtube.com/embed/${videoUrl.searchParams.get("v")}`;
  } catch {
    return null;
  }
  return null;
};

// --- Modal (MANTIDO) ---
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        layoutId={`exercise-card-${exercise.exercise_id}`}
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
        >
          <LuX className="h-5 w-5" />
        </button>
        <div className="aspect-video w-full bg-black flex items-center justify-center relative overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full absolute inset-0"
              allowFullScreen
              title={exercise.nome}
            ></iframe>
          ) : (
            <img
              src={exercise.thumb_url || ""}
              className="w-full h-full object-cover opacity-80"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border ${
                  exercise.categoria === "calistenia"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : exercise.categoria === "academia"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {exercise.categoria === "ambos"
                  ? "Academia & Casa"
                  : exercise.categoria}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              {exercise.nome}
            </h1>
          </div>

          {exercise.musculos_trabalhados && (
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <LuScan className="w-4 h-4" /> Músculos Ativados
              </h2>
              <div className="flex flex-wrap gap-2">
                {exercise.musculos_trabalhados.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-semibold text-gray-700 capitalize"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exercise.descricao && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-2">
                Instruções
              </h3>
              <p className="text-gray-600 whitespace-pre-line text-sm leading-relaxed">
                {exercise.descricao}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Componente Principal ---
export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [availableMuscles, setAvailableMuscles] = useState<ExerciseTaxonomy[]>(
    []
  );
  const [availableTags, setAvailableTags] = useState<ExerciseTaxonomy[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  // Estados de Filtro
  const [searchText, setSearchText] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { userProfile } = useAuth();

  // Inicializar o estado com base no perfil
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "academia" | "calistenia"
  >("all");

  const [showFilters, setShowFilters] = useState(false);
  const [, setIsInitialLoad] = useState(true);
  const debouncedSearchText = useDebounce(searchText, 500);

  // Atualiza categoria baseada no perfil
  useEffect(() => {
    if (userProfile?.profile.local_treino) {
      if (userProfile.profile.local_treino === "casa") {
        setSelectedCategory("calistenia");
      } else if (userProfile.profile.local_treino === "academia") {
        setSelectedCategory("academia");
      }
    }
  }, [userProfile]);

  // Carregar Metadados
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const metadata = await apiClient.getExerciseMetadata();
        setAvailableMuscles(metadata.musculos);
        setAvailableTags(metadata.tags);
      } catch (err) {
        console.error("Erro ao carregar filtros:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Carregar Exercícios
  useEffect(() => {
    const filters: ExerciseFilters = {};

    if (debouncedSearchText.trim()) filters.search = debouncedSearchText.trim();
    if (selectedMuscles.length > 0) filters.musculos = selectedMuscles;
    if (selectedTags.length > 0) filters.tags = selectedTags;
    if (selectedCategory !== "all") filters.categoria = selectedCategory;

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
  }, [debouncedSearchText, selectedMuscles, selectedTags, selectedCategory]);

  const handleMuscleToggle = (muscleValue: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscleValue)
        ? prev.filter((m) => m !== muscleValue)
        : [...prev, muscleValue]
    );
  };
  const handleTagToggle = (tagValue: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagValue)
        ? prev.filter((t) => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  const hasActiveFilters =
    selectedMuscles.length > 0 || selectedTags.length > 0;

  // Configuração dos Botões de Categoria
  const categories = [
    { id: "all", label: "Todos", icon: LuLayers },
    { id: "academia", label: "Academia", icon: LuBuilding2 },
    { id: "calistenia", label: "Em Casa", icon: LuHome },
  ] as const;

  return (
    <div className="space-y-6 px-4 md:px-6 w-full">
      <div className="flex flex-col md:flex-row md:gap-8 items-start">
        {/* --- Sidebar / Filtros --- */}
        <aside className="w-full md:w-1/3 lg:w-1/4 md:sticky md:top-6 z-10 shrink-0">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-200">
                <LuDumbbell className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Biblioteca
              </h1>
            </div>

            {/* SELETOR DE CATEGORIA */}
            <div className="bg-gray-100 p-1 rounded-xl grid grid-cols-3 gap-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`relative flex flex-col items-center justify-center py-2 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? "text-indigo-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategory"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex flex-col items-center gap-1">
                      <Icon className="w-4 h-4" />
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* BUSCA E FILTROS */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Buscar exercício..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between ${
                  showFilters || hasActiveFilters
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <LuFilter className="w-4 h-4" />
                  <span className="font-semibold text-sm">
                    Filtros Avançados
                  </span>
                </div>
                {hasActiveFilters && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {selectedMuscles.length + selectedTags.length}
                  </span>
                )}
              </button>
            </div>

            {/* ÁREA DE FILTROS DINÂMICOS */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-5 pt-2 pb-2">
                    {/* Filtro Músculos */}
                    {availableMuscles.length > 0 ? (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                          Músculo Alvo
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableMuscles.map((item) => {
                            const isActive = selectedMuscles.includes(
                              item.value
                            );
                            return (
                              <button
                                key={item.id || item.value}
                                onClick={() => handleMuscleToggle(item.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize border ${
                                  isActive
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      // Skeleton para filtros enquanto carregam metadados
                      <div className="animate-pulse space-y-2">
                        <div className="h-3 w-20 bg-gray-200 rounded"></div>
                        <div className="flex gap-2">
                          <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
                          <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                          <div className="h-8 w-14 bg-gray-200 rounded-lg"></div>
                        </div>
                      </div>
                    )}

                    {/* Filtro Tags */}
                    {availableTags.length > 0 && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                          Estilo & Tipo
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableTags.map((item) => {
                            const isActive = selectedTags.includes(item.value);
                            return (
                              <button
                                key={item.id || item.value}
                                onClick={() => handleTagToggle(item.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize border ${
                                  isActive
                                    ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* --- Grid de Exercícios --- */}
        <div className="flex-1 w-full min-w-0">
          {error ? (
            <div className="rounded-2xl bg-red-50 p-6 text-center text-red-600 border border-red-100">
              <LuAlertTriangle className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>{error}</p>
            </div>
          ) : isLoading ? (
            // ESTADO DE CARREGAMENTO: Skeletons
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 pb-10">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : exercises.length === 0 ? (
            // ESTADO VAZIO
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white text-center text-gray-400 border border-dashed border-gray-200 p-8">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <LuDumbbell className="h-8 w-8 opacity-30" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Nada encontrado
              </h3>
              <p className="text-sm">
                Tente ajustar seus filtros ou mudar a categoria.
              </p>
              <button
                onClick={() => {
                  setSearchText("");
                  setSelectedMuscles([]);
                  setSelectedTags([]);
                  setSelectedCategory("all");
                }}
                className="mt-4 text-sm font-bold text-indigo-600 hover:underline"
              >
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            // LISTA DE RESULTADOS
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">
                  Mostrando <strong>{exercises.length}</strong> exercícios
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 pb-10">
                {exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.exercise_id}
                    exercise={exercise}
                    onClick={() => setSelectedExercise(exercise)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

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
