import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Exercise, ExerciseTaxonomy } from "../../types/models";
import {
  LuLoaderCircle as LuLoader2,
  LuX,
  LuSearch,
  LuDumbbell,
  LuYoutube,
  LuScan,
  LuPencil,
  LuTrash2,
  LuPlus,
  LuHouse as LuHome,
  LuBuilding2,
  // LuLayers,
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import useDebounce from "../../hooks/debouce";
import { ManageExerciseMetadata, ManageExercises } from "./shared/AdminApi";
import { toast } from "sonner";

// --- CARD ADMINISTRATIVO ---
const AdminExerciseCard: React.FC<{
  exercise: Exercise;
  onClick: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ exercise, onClick, onEdit, onDelete }) => (
  <motion.div
    layoutId={`exercise-card-${exercise.exercise_id}`}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ y: -4 }}
    className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100 group relative"
  >
    {/* Área clicável */}
    <div className="cursor-pointer" onClick={onClick}>
      <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
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

        {/* Badges Flutuantes */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold shadow-sm border border-gray-100">
            #{exercise.exercise_id}
          </div>
          {exercise.categoria === "calistenia" && (
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
              <LuHome className="w-3 h-3" /> Casa
            </span>
          )}
          {exercise.categoria === "academia" && (
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
              <LuBuilding2 className="w-3 h-3" /> Gym
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
          {exercise.nome}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1">
          {exercise.musculos_trabalhados?.slice(0, 3).map((musculo) => (
            <span
              key={musculo}
              className="px-2 py-0.5 rounded-full bg-indigo-50 text-xs font-medium text-indigo-600 border border-indigo-100 capitalize"
            >
              {musculo}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* BARRA DE AÇÕES */}
    <div className="flex border-t border-gray-200 divide-x divide-gray-200 bg-gray-50 mt-auto">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(exercise.exercise_id);
        }}
        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
      >
        <LuPencil className="h-4 w-4" /> Editar
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(exercise.exercise_id);
        }}
        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
      >
        <LuTrash2 className="h-4 w-4" /> Excluir
      </button>
    </div>
  </motion.div>
);

// --- MODAL DETALHES (MANTIDO IGUAL AO DO USUÁRIO) ---
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        layoutId={`exercise-card-${exercise.exercise_id}`}
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
        >
          <LuX className="h-5 w-5" />
        </button>
        {embedUrl ? (
          <div className="aspect-video w-full bg-black">
            <iframe
              src={embedUrl}
              title={exercise.nome}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="aspect-video w-full bg-gray-100 flex items-center justify-center relative">
            {exercise.thumb_url ? (
              <img
                src={exercise.thumb_url}
                className="w-full h-full object-cover opacity-50"
                alt=""
              />
            ) : (
              <LuYoutube className="h-16 w-16 text-gray-300 absolute" />
            )}
            {!exercise.thumb_url && (
              <span className="absolute mt-20 text-xs text-gray-400">
                Sem vídeo
              </span>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">{exercise.nome}</h1>
          <div className="flex gap-2">
            <span
              className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                exercise.categoria === "calistenia"
                  ? "bg-green-100 text-green-700"
                  : exercise.categoria === "academia"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {exercise.categoria === "ambos" ? "Híbrido" : exercise.categoria}
            </span>
          </div>
          {exercise.musculos_trabalhados && (
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                <LuScan /> Músculos
              </h2>
              <div className="flex flex-wrap gap-2">
                {exercise.musculos_trabalhados.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700 capitalize"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
          {exercise.descricao && (
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase mb-2">
                Instruções
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {exercise.descricao}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- PÁGINA PRINCIPAL ---

export default function AdminExercisesPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [availableMuscles, setAvailableMuscles] = useState<ExerciseTaxonomy[]>(
    []
  );
  const [availableTags, setAvailableTags] = useState<ExerciseTaxonomy[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  // Filtros
  const [searchText, setSearchText] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // NOVO: Estado para Categoria
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "academia" | "calistenia"
  >("all");

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const debouncedSearchText = useDebounce(searchText, 500);

  // 1. Carregar Metadados
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const metadata = await ManageExerciseMetadata.get();
        setAvailableMuscles(metadata.musculos);
        setAvailableTags(metadata.tags);
      } catch (err) {
        console.error("Erro ao carregar metadados:", err);
      }
    };
    fetchMetadata();
  }, []);

  // 2. Carregar Exercícios
  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allExercises = await ManageExercises.get();

        // Filtragem Client-Side (Admin carrega tudo de uma vez normalmente)
        const filteredData = allExercises.filter((exercise) => {
          // Filtro Texto
          if (debouncedSearchText.trim()) {
            const term = debouncedSearchText.toLowerCase();
            const nameMatch = exercise.nome.toLowerCase().includes(term);
            if (!nameMatch) return false;
          }
          // Filtro Categoria
          if (selectedCategory !== "all") {
            // Se filtrar por 'academia', mostra 'academia' ou 'ambos'
            if (
              exercise.categoria !== selectedCategory &&
              exercise.categoria !== "ambos"
            ) {
              return false;
            }
          }
          // Filtro Músculos
          if (selectedMuscles.length > 0) {
            const exerciseMuscles = exercise.musculos_trabalhados || [];
            const hasMatch = exerciseMuscles.some((m) =>
              selectedMuscles.includes(m)
            );
            if (!hasMatch) return false;
          }
          // Filtro Tags
          if (selectedTags.length > 0) {
            const exerciseTags = exercise.tags || [];
            const hasMatch = exerciseTags.some((t) => selectedTags.includes(t));
            if (!hasMatch) return false;
          }
          return true;
        });

        setExercises(filteredData);
      } catch (err) {
        console.error(err);
        setError("Falha ao carregar exercícios.");
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchExercises();
  }, [debouncedSearchText, selectedMuscles, selectedTags, selectedCategory]);

  // Actions
  const handleCreate = () => navigate("/admin/exercicios/novo");
  const handleEdit = (id: number) => navigate(`/admin/exercicios/editar/${id}`);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Excluir este exercício permanentemente?")) return;
    const prev = [...exercises];
    setExercises(prev.filter((e) => e.exercise_id !== id));
    try {
      const data = await ManageExercises.delete(id);
      if (!data.success) throw new Error(data.message);
      toast.success("Exercício excluído com sucesso.");
      setSelectedExercise(null);
    } catch {
      toast.error("Erro ao excluir.");
      setExercises(prev);
    }
  };

  const handleMuscleToggle = (mValue: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(mValue)
        ? prev.filter((x) => x !== mValue)
        : [...prev, mValue]
    );
  };
  const handleTagToggle = (tValue: string) => {
    setSelectedTags((prev) =>
      prev.includes(tValue)
        ? prev.filter((x) => x !== tValue)
        : [...prev, tValue]
    );
  };

  if (isInitialLoad && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LuLoader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
            <LuDumbbell className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciar Exercícios
            </h1>
            <p className="text-sm text-gray-500">{exercises.length} exibidos</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95"
        >
          <LuPlus className="h-5 w-5" /> Novo Exercício
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR FILTROS */}
        <aside className="lg:w-1/4 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
            {/* Filtro de Texto */}
            <div className="relative mb-5">
              <input
                type="search"
                placeholder="Buscar por nome..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* Filtro de Categoria (Segmented Control) */}
            <div className="bg-gray-100 p-1 rounded-xl flex mb-6">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedCategory === "all"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedCategory("academia")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedCategory === "academia"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Gym
              </button>
              <button
                onClick={() => setSelectedCategory("calistenia")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedCategory === "calistenia"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Casa
              </button>
            </div>

            <div className="space-y-5">
              {/* Músculos */}
              {availableMuscles.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-400 mb-2 text-[10px] uppercase tracking-wider">
                    Músculos
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {availableMuscles.map((item) => (
                      <button
                        key={item.id || item.value}
                        onClick={() => handleMuscleToggle(item.value)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors border ${
                          selectedMuscles.includes(item.value)
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {availableTags.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-bold text-gray-400 mb-2 text-[10px] uppercase tracking-wider">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((item) => (
                      <button
                        key={item.id || item.value}
                        onClick={() => handleTagToggle(item.value)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors border ${
                          selectedTags.includes(item.value)
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* GRID */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LuLoader2 className="h-10 w-10 animate-spin text-gray-400" />
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
              <p>Nenhum exercício encontrado com estes filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {exercises.map((ex) => (
                  <AdminExerciseCard
                    key={ex.exercise_id}
                    exercise={ex}
                    onClick={() => setSelectedExercise(ex)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
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
