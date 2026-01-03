import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  LuLoaderCircle as LuLoader2,
  LuTriangleAlert as LuAlertTriangle,
  LuTimer,
  LuFlame,
  LuX,
  LuSoup,
  LuCirclePlus as LuPlusCircle,
  LuCircleMinus as LuMinusCircle,
  LuBan,
  LuSearch,
  LuSlidersHorizontal,
  LuPencil,
  LuTrash2,
  LuPlus,
} from "react-icons/lu";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import useDebounce from "../../hooks/debouce";
import type { Recipe, RecipeTaxonomy } from "../../types/models";
import { manageRecipes } from "./shared/AdminApi"; // Sua API de receitas
import { ManageRecipeTaxonomies } from "./shared/AdminApi"; // <--- NOVA IMPORTAÇÃO
import { toast } from "sonner";

// --- Dados de Fallback (Caso a API falhe) ---
const fallbackTags: RecipeTaxonomy[] = [
  { id: 1, label: "Sem Glúten", value: "sem_gluten" },
  { id: 2, label: "Vegano", value: "vegano" },
  { id: 3, label: "Alto em Proteína", value: "alto_proteina" },
  { id: 4, label: "Low Carb", value: "baixo_carboidrato" },
  { id: 5, label: "Rápido", value: "rapido" },
  { id: 6, label: "Almoço", value: "almoco" },
  { id: 7, label: "Vegetariano", value: "vegetariano" },
  { id: 8, label: "Contém Amendoim", value: "contem_amendoim" },
];

type TagState = "off" | "include" | "exclude";

// --- Subcomponente de Botão de Tag ---
const TagButton: React.FC<{
  label: string;
  state: TagState;
  onClick: () => void;
}> = ({ label, state, onClick }) => {
  const stateConfig = {
    off: {
      Icon: LuBan,
      className: "bg-gray-200 text-gray-600 hover:bg-gray-300",
    },
    include: {
      Icon: LuPlusCircle,
      className: "bg-green-100 text-green-700 hover:bg-green-200",
    },
    exclude: {
      Icon: LuMinusCircle,
      className: "bg-red-100 text-red-700 hover:bg-red-200",
    },
  };
  const config = stateConfig[state];

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all ${config.className}`}
    >
      <config.Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};

// --- CARD ADMINISTRATIVO ---
const AdminRecipeCard: React.FC<{
  recipe: Recipe;
  onClick: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ recipe, onClick, onEdit, onDelete }) => (
  <motion.div
    layoutId={`recipe-card-${recipe.recipe_id}`}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ y: -4 }}
    className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100 group"
  >
    <div className="cursor-pointer" onClick={onClick}>
      <div className="relative">
        <img
          src={
            recipe.url_imagem ||
            "https://placehold.co/600x400/e2e8f0/1e293b?text=Sem+Imagem"
          }
          alt={recipe.titulo}
          className="aspect-video w-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/600x400/e2e8f0/1e293b?text=Erro+Imagem";
          }}
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm">
          #{recipe.recipe_id}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
          {recipe.titulo}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2 min-h-[2.5em]">
          {recipe.descricao_curta}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 bg-gray-50/50">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <LuTimer className="h-4 w-4" />
          {recipe.tempo_preparo_min || "-"} min
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
          <LuFlame className="h-4 w-4 text-orange-500" />
          {recipe.calorias_kcal || "-"} kcal
        </div>
      </div>
    </div>

    <div className="flex border-t border-gray-200 divide-x divide-gray-200">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(recipe.recipe_id);
        }}
        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <LuPencil className="h-4 w-4" /> Editar
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(recipe.recipe_id);
        }}
        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
      >
        <LuTrash2 className="h-4 w-4" /> Excluir
      </button>
    </div>
  </motion.div>
);

// --- MODAL (Visualização Rápida) ---
function RecipeModal({
  recipe,
  onClose,
}: {
  recipe: Recipe;
  onClose: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const imageHeight = useTransform(
    scrollY,
    [0, 200],
    ["min(300px, 40vh)", "100px"],
    { clamp: true }
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        layoutId={`recipe-card-${recipe.recipe_id}`}
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
        >
          <LuX className="h-5 w-5" />
        </button>
        <motion.div
          style={{ height: imageHeight }}
          className="w-full shrink-0 bg-gray-100"
        >
          <img
            src={recipe.url_imagem || ""}
            className="h-full w-full object-cover"
            alt=""
          />
        </motion.div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900">{recipe.titulo}</h1>
          <div className="flex gap-4 mt-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <LuTimer /> {recipe.tempo_preparo_min} min
            </span>
            <span className="flex items-center gap-1">
              <LuFlame /> {recipe.calorias_kcal} kcal
            </span>
          </div>
          <h3 className="font-bold mt-6 mb-2">Ingredientes</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {recipe.ingredientes?.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
          <h3 className="font-bold mt-6 mb-2">Preparo</h3>
          <ol className="list-decimal pl-5 text-gray-700 space-y-2">
            {recipe.preparo?.map((passo, i) => (
              <li key={i}>{passo}</li>
            ))}
          </ol>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- PÁGINA PRINCIPAL ADMIN ---

export default function AdminRecipesPage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Estados de Filtro e Tags
  const [searchText, setSearchText] = useState("");
  const [maxCalories, setMaxCalories] = useState(2000);
  const [tagFilters, setTagFilters] = useState<Record<string, TagState>>({});
  const [areFiltersVisible, setAreFiltersVisible] = useState(false);

  // Tipagem vinda da nova API
  const [availableTags, setAvailableTags] = useState<RecipeTaxonomy[]>([]);

  const debouncedSearchText = useDebounce(searchText, 500);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // --- CARREGAR DADOS ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Buscar Receitas (API existente)
        const recipesData = await manageRecipes.get();
        setRecipes(recipesData);

        // 2. Buscar Tags Disponíveis (NOVA API)
        try {
          const tagsData = await ManageRecipeTaxonomies.get();
          if (Array.isArray(tagsData)) {
            setAvailableTags(tagsData);
          } else {
            throw new Error("Formato inválido de tags");
          }
        } catch (tagErr) {
          console.warn(
            "Falha ao carregar tags via API Admin, usando fallback",
            tagErr
          );
          setAvailableTags(fallbackTags);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || "Falha ao carregar dados.");
        console.error(err);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    loadData();
  }, []);

  // --- FILTRAGEM NO CLIENTE ---
  const filteredRecipes = recipes.filter((recipe) => {
    // A. Texto
    if (debouncedSearchText.trim()) {
      const term = debouncedSearchText.toLowerCase();
      const matchTitle = recipe.titulo.toLowerCase().includes(term);
      const matchDesc = recipe.descricao_curta?.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc) return false;
    }

    // B. Calorias
    if (recipe.calorias_kcal && recipe.calorias_kcal > maxCalories) {
      return false;
    }

    // C. Tags
    const recipeTags = recipe.tags || [];
    for (const tagValue in tagFilters) {
      const state = tagFilters[tagValue];
      if (state === "include" && !recipeTags.includes(tagValue)) return false;
      if (state === "exclude" && recipeTags.includes(tagValue)) return false;
    }

    return true;
  });

  // --- AÇÕES ---

  const handleEdit = (id: number) => {
    navigate(`/admin/receitas/editar/${id}`);
  };

  const handleCreate = () => {
    navigate(`/admin/receitas/nova`);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta receita?")) return;

    const previousRecipes = [...recipes];
    setRecipes((prev) => prev.filter((r) => r.recipe_id !== id));

    try {
      const res = await manageRecipes.delete(id);
      if (!res.success) throw new Error("Erro ao deletar");
      toast.success("Receita excluída.");
    } catch {
      toast.error("Erro ao excluir. Tente novamente.");
      setRecipes(previousRecipes);
    }
  };

  const handleTagClick = (tagValue: string) => {
    setTagFilters((prev) => {
      const currentState = prev[tagValue] || "off";
      const nextState: TagState =
        currentState === "off"
          ? "include"
          : currentState === "include"
          ? "exclude"
          : "off";
      return { ...prev, [tagValue]: nextState };
    });
  };

  if (isInitialLoad && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LuLoader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER + FILTROS */}
      <div className="sticky top-0 z-20 bg-gray-100/90 backdrop-blur-md pb-4 -mx-6 px-6 pt-4 border-b border-gray-200/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <LuSoup className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciar Receitas
              </h1>
              <p className="text-sm text-gray-500">
                {filteredRecipes.length} receitas encontradas
              </p>
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-all active:scale-95"
          >
            <LuPlus className="h-5 w-5" />
            Nova Receita
          </button>
        </div>

        {/* Barra de Busca e Toggle Filtros */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Buscar receita..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
            />
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => setAreFiltersVisible(!areFiltersVisible)}
            className={`px-4 py-2 rounded-lg border font-medium flex items-center gap-2 transition-colors ${
              areFiltersVisible
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-white border-gray-300 text-gray-700"
            }`}
          >
            <LuSlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>

        {/* Filtros Expansíveis */}
        <AnimatePresence>
          {areFiltersVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white p-4 rounded-lg border border-gray-200 mt-3 shadow-sm space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">
                      Calorias Máximas
                    </span>
                    <span className="font-bold text-indigo-600">
                      {maxCalories} kcal
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={2000}
                    step={50}
                    value={maxCalories}
                    onChange={(e) => setMaxCalories(e.target.valueAsNumber)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Carregadas do Banco)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {/* Renderização das tags carregadas da API */}
                    {availableTags.map((tag) => (
                      <TagButton
                        key={tag.id}
                        label={tag.label}
                        state={tagFilters[tag.value] || "off"}
                        onClick={() => handleTagClick(tag.value)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LISTAGEM */}
      <div className="mt-6">
        {error ? (
          <div className="text-center p-8 bg-red-50 text-red-600 rounded-xl border border-red-100">
            <LuAlertTriangle className="mx-auto h-8 w-8 mb-2" />
            {error}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <LuSoup className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <p>Nenhuma receita encontrada com estes filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredRecipes.map((recipe) => (
                <AdminRecipeCard
                  key={recipe.recipe_id}
                  recipe={recipe}
                  onClick={() => setSelectedRecipe(recipe)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal Detalhes */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
