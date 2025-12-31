import { useState, useEffect, useRef } from "react";
import apiClient, { isApiError } from "../../../api/apiClient";
import {
  LuLoaderCircle as LuLoader2,
  LuTriangleAlert as LuAlertTriangle,
  LuTimer,
  LuFlame,
  LuX,
  LuBeef,
  LuLeafyGreen,
  LuDroplet,
  LuSoup,
  LuCirclePlus as LuPlusCircle,
  LuCircleMinus as LuMinusCircle,
  LuBan,
  LuSearch,
  LuSlidersHorizontal,
} from "react-icons/lu";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import useDebounce from "../../../hooks/debouce";
import type { Recipe } from "../../../types/models";
import type { RecipeFilters } from "../../../types/api-types";

// --- Definição da Interface para as Tags ---
interface RecipeTag {
  id: number;
  label: string;
  value: string;
}

// --- Dados de Fallback (Caso a API falhe) ---
const fallbackTags: RecipeTag[] = [
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

// --- Componente do Botão de Tag Atualizado ---
const TagButton: React.FC<{
  label: string; // Texto visível (ex: "Sem Glúten")
  state: TagState;
  onClick: () => void;
}> = ({ label, state, onClick }) => {
  const stateConfig = {
    off: {
      Icon: LuBan,
      configLabel: "Ignorar",
      className: "bg-gray-200 text-gray-600 hover:bg-gray-300",
    },
    include: {
      Icon: LuPlusCircle,
      configLabel: "Incluir",
      className: "bg-green-100 text-green-700 hover:bg-green-200",
    },
    exclude: {
      Icon: LuMinusCircle,
      configLabel: "Excluir",
      className: "bg-red-100 text-red-700 hover:bg-red-200",
    },
  };
  const config = stateConfig[state];

  return (
    <button
      onClick={onClick}
      title={`${config.configLabel} ${label}`}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all ${config.className}`}
    >
      <config.Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};

// --- 1. Subcomponente: Card da Receita ---

const RecipeCard: React.FC<{ recipe: Recipe; onClick: () => void }> = ({
  recipe,
  onClick,
}) => (
  <motion.div
    layoutId={`recipe-card-${recipe.recipe_id}`}
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    onClick={onClick}
    className="flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-md"
  >
    <img
      src={
        recipe.url_imagem ||
        "https://placehold.co/600x400/FCC3D2/333?text=Receita"
      }
      alt={recipe.titulo}
      className="aspect-video w-full object-cover"
      onError={(e) => {
        e.currentTarget.src =
          "https://placehold.co/600x400/FCC3D2/333?text=Receita";
      }}
    />
    <div className="flex-1 p-4">
      <h3 className="text-lg font-semibold text-gray-900">{recipe.titulo}</h3>
      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
        {recipe.descricao_curta}
      </p>
    </div>
    <div className="flex items-center justify-between border-t border-gray-100 p-4">
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <LuTimer className="h-4 w-4" />
        {recipe.tempo_preparo_min || "N/A"} min
      </div>
      <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
        <LuFlame className="h-4 w-4 text-red-500" />
        {recipe.calorias_kcal || "N/A"} kcal
      </div>
    </div>
  </motion.div>
);

// --- 2. Subcomponente: Modal de Detalhes da Receita ---

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
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        layoutId={`recipe-card-${recipe.recipe_id}`}
        initial={{ scale: 0.9, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-black/30 p-1.5 text-white transition-all hover:bg-black/50"
        >
          <LuX className="h-5 w-5" />
        </button>

        <motion.div style={{ height: imageHeight }} className="w-full shrink-0">
          <img
            src={
              recipe.url_imagem ||
              "https://placehold.co/600x400/FCC3D2/333?text=Receita"
            }
            alt={recipe.titulo}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/600x400/FCC3D2/333?text=Receita";
            }}
          />
        </motion.div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900">{recipe.titulo}</h1>
          <p className="mt-2 text-gray-600">{recipe.descricao_curta}</p>

          <div className="my-6 flex items-center gap-6 border-y border-gray-200 py-4">
            <div className="flex items-center gap-2 text-gray-700">
              <LuTimer className="h-5 w-5 text-[#A8F3DC]" />
              <span className="font-medium">
                {recipe.tempo_preparo_min || "N/A"} min
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <LuFlame className="h-5 w-5 text-[#FCC3D2]" />
              <span className="font-medium">
                {recipe.calorias_kcal || "N/A"} kcal
              </span>
            </div>
          </div>

          {recipe.macros && (
            <div className="mb-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-blue-100 p-3">
                <LuBeef className="mx-auto h-6 w-6 text-blue-600" />
                <p className="mt-1 text-xs text-blue-800">Proteína</p>
                <p className="text-lg font-bold text-blue-900">
                  {recipe.macros.proteinas_g}g
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <LuLeafyGreen className="mx-auto h-6 w-6 text-green-600" />
                <p className="mt-1 text-xs text-green-800">Carboidratos</p>
                <p className="text-lg font-bold text-green-900">
                  {recipe.macros.carboidratos_g}g
                </p>
              </div>
              <div className="rounded-lg bg-yellow-100 p-3">
                <LuDroplet className="mx-auto h-6 w-6 text-yellow-600" />
                <p className="mt-1 text-xs text-yellow-800">Gordura</p>
                <p className="text-lg font-bold text-yellow-900">
                  {recipe.macros.gorduras_g}g
                </p>
              </div>
            </div>
          )}

          {recipe.ingredientes && recipe.ingredientes.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Ingredientes
              </h2>
              <ul className="list-inside list-disc space-y-1 text-gray-700">
                {recipe.ingredientes.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {recipe.preparo && recipe.preparo.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Modo de Preparo
              </h2>
              <ol className="list-inside list-decimal space-y-2 text-gray-700">
                {recipe.preparo.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- 3. Componente Principal da Página ---

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Estado alterado para armazenar objetos RecipeTag completos
  const [availableTags, setAvailableTags] = useState<RecipeTag[]>([]);

  // --- 4a. Estados de Filtro ---
  const [searchText, setSearchText] = useState("");
  const [maxCalories, setMaxCalories] = useState(1000);
  const [tagFilters, setTagFilters] = useState<Record<string, TagState>>({});

  const [areFiltersVisible, setAreFiltersVisible] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 500);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Efeito de busca de receitas
  useEffect(() => {
    const filters: RecipeFilters = {
      includeTags: [],
      excludeTags: [],
    };

    if (debouncedSearchText.trim()) {
      filters.search = debouncedSearchText.trim();
    }
    if (maxCalories < 1000) {
      filters.maxCalories = maxCalories;
    }
    // Mapeia o objeto tagFilters para arrays de include/exclude baseados na CHAVE (value)
    for (const tagValue in tagFilters) {
      if (tagFilters[tagValue] === "include") {
        filters.includeTags?.push(tagValue);
      } else if (tagFilters[tagValue] === "exclude") {
        filters.excludeTags?.push(tagValue);
      }
    }

    const fetchRecipes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const recipesData = await apiClient.getRecipes(filters);
        setRecipes(recipesData);
      } catch (err) {
        if (isApiError(err)) {
          setError(err.response?.data.error || "Erro");
        } else {
          setError("Falha ao carregar as receitas.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchRecipes();
  }, [debouncedSearchText, maxCalories, tagFilters]);

  // Efeito de busca de tags (Executa apenas uma vez)
  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Substitua 'YOUR_API_URL' pela URL base real da sua API
        const response = await fetch(
          "http://localhost:8000/api/get_recipe_taxonomies.php"
        );
        if (!response.ok) throw new Error("Falha ao buscar tags");

        const data: RecipeTag[] = await response.json();

        // Verifica se os dados vieram no formato esperado
        if (Array.isArray(data)) {
          setAvailableTags(data);
        } else {
          throw new Error("Formato de tags inválido");
        }
      } catch (error) {
        console.error("Erro ao buscar tags, usando fallback:", error);
        setAvailableTags(fallbackTags);
      }
    };

    fetchTags();
  }, []);

  // Handler para o clique nas tags
  // Recebe o VALUE da tag (ex: 'sem_gluten')
  const handleTagClick = (tagValue: string) => {
    setTagFilters((prev) => {
      const currentState = prev[tagValue] || "off";
      let nextState: TagState;
      if (currentState === "off") nextState = "include";
      else if (currentState === "include") nextState = "exclude";
      else nextState = "off";
      return { ...prev, [tagValue]: nextState };
    });
  };

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
        <h3 className="font-semibold">Erro ao carregar receitas</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header Sticky */}
      <div
        className="sticky -top-4 md:-top-8 z-10 
                   bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200/60 
                   -mt-4 md:-mt-8 -mx-4 md:-mx-8"
      >
        <div className="pt-4 md:pt-8 px-4 md:px-8 pb-4">
          <div className="flex items-center mb-4 mt-3 gap-3">
            <LuSoup className="h-8 w-8 text-gray-800" />
            <h1 className="text-3xl font-bold text-gray-900">Receitas</h1>
          </div>

          <div className="flex flex-col gap-4">
            {/* Barra de Busca e Botão de Filtro */}
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  type="search"
                  placeholder="Buscar por nome ou descrição..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#FCC3D2]"
                />
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={() => setAreFiltersVisible(!areFiltersVisible)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  areFiltersVisible
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <LuSlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {areFiltersVisible ? "Ocultar Filtros" : "Filtros"}
                </span>
              </button>
            </div>

            {/* Painel de Filtros Avançados */}
            <AnimatePresence>
              {areFiltersVisible && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 pt-2">
                    {/* Filtro de Calorias */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <label
                          htmlFor="calories"
                          className="font-medium text-gray-700"
                        >
                          Calorias Máximas
                        </label>
                        <span className="font-bold text-gray-800">
                          {maxCalories} kcal
                        </span>
                      </div>
                      <input
                        id="calories"
                        type="range"
                        min={100}
                        max={1000}
                        step={50}
                        value={maxCalories}
                        onChange={(e) => setMaxCalories(e.target.valueAsNumber)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FCC3D2]"
                      />
                    </div>

                    {/* Filtro de Tags (Labels Amigáveis) */}
                    <div className="space-y-2">
                      <label className="font-medium text-gray-700 text-sm">
                        Filtros (Incluir / Excluir)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => (
                          <TagButton
                            key={tag.id}
                            label={tag.label} // Usa o Label bonito (ex: Sem Glúten)
                            state={tagFilters[tag.value] || "off"} // Estado baseado no Value (ex: sem_gluten)
                            onClick={() => handleTagClick(tag.value)} // Clica enviando o Value
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="pt-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LuLoader2 className="h-12 w-12 animate-spin text-[#FCC3D2]" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center text-gray-500">
            <LuSoup className="h-12 w-12" />
            <p className="mt-2 font-medium">Nenhuma receita encontrada</p>
            <p className="text-sm">Tente ajustar seus filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.recipe_id}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
              />
            ))}
          </div>
        )}
      </div>

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
