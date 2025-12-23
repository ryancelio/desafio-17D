import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  LuSearch,
  LuPlus,
  LuTrash2,
  LuSave,
  LuLoader,
  LuArrowLeft,
  LuClock,
} from "react-icons/lu";
import { manageRecipes, saveDiet } from "./shared/AdminApi";
import type { Recipe } from "../../types/models";
import type { SaveDietPayload } from "../../types/api-types";
import { toast } from "sonner";

// Tipos locais para o estado do formulário (antes de salvar)
interface DietItemState {
  temp_id: string; // ID temporário para key do React
  recipe_id: number;
  titulo: string;
  calorias: number;
  porcao: string;
  observacao: string;
}

interface DietMealState {
  temp_id: string;
  nome: string;
  horario: string;
  items: DietItemState[];
}

export default function AdminCreateDietPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reqId = searchParams.get("req");
  const userUid = searchParams.get("uid");
  const userName = searchParams.get("name");

  // Dados da Biblioteca
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  // Estado do Formulário
  const [planName, setPlanName] = useState("Plano Alimentar Personalizado");
  const [targetCals, setTargetCals] = useState(2000);
  const [meals, setMeals] = useState<DietMealState[]>([
    { temp_id: "1", nome: "Café da Manhã", horario: "08:00", items: [] },
    { temp_id: "2", nome: "Almoço", horario: "12:00", items: [] },
    { temp_id: "3", nome: "Lanche", horario: "16:00", items: [] },
    { temp_id: "4", nome: "Jantar", horario: "20:00", items: [] },
  ]);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(
    meals[0].temp_id
  );

  // 1. Carregar Receitas
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await manageRecipes.get();
        if (Array.isArray(data)) {
          setRecipes(data);
          setFilteredRecipes(data);
        }
      } catch (err) {
        console.error("Erro ao carregar receitas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // Filtro
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredRecipes(
      recipes.filter((r) => r.titulo.toLowerCase().includes(term))
    );
  }, [searchTerm, recipes]);

  // Actions
  const addRecipeToMeal = (recipe: Recipe) => {
    if (!selectedMealId)
      return toast.info("Selecione uma refeição à direita primeiro.");

    const newItem: DietItemState = {
      temp_id: Date.now().toString() + Math.random(),
      recipe_id: recipe.recipe_id,
      titulo: recipe.titulo,
      calorias: recipe.calorias_kcal || 0,
      porcao: "1 porção",
      observacao: "",
    };

    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.temp_id === selectedMealId) {
          return { ...meal, items: [...meal.items, newItem] };
        }
        return meal;
      })
    );
  };

  const removeRecipe = (mealId: string, itemTempId: string) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.temp_id === mealId) {
          return {
            ...meal,
            items: meal.items.filter((i) => i.temp_id !== itemTempId),
          };
        }
        return meal;
      })
    );
  };

  const updateItem = (
    mealId: string,
    itemId: string,
    field: keyof DietItemState,
    value: string
  ) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.temp_id === mealId) {
          const newItems = meal.items.map((item) =>
            item.temp_id === itemId ? { ...item, [field]: value } : item
          );
          return { ...meal, items: newItems };
        }
        return meal;
      })
    );
  };

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        temp_id: Date.now().toString(),
        nome: "Nova Refeição",
        horario: "00:00",
        items: [],
      },
    ]);
  };

  const removeMeal = (id: string) => {
    if (window.confirm("Remover refeição?"))
      setMeals(meals.filter((m) => m.temp_id !== id));
  };

  // Calcular total atual
  const currentTotalCals = meals.reduce(
    (acc, meal) =>
      acc + meal.items.reduce((mAcc, item) => mAcc + item.calorias, 0),
    0
  );

  const handleSave = async () => {
    if (!userUid) return toast.error("Erro: UID do usuário faltando.");
    setSaving(true);
    try {
      const payload: SaveDietPayload = {
        request_id: reqId,
        user_uid: userUid,
        nome: planName,
        calorias_meta: targetCals,
        // Macros opcionais, pode-se calcular ou deixar zerado
        macros_meta: { prot: 0, carb: 0, fat: 0 },
        meals: meals.map((m) => ({
          nome: m.nome,
          horario: m.horario,
          items: m.items.map((i) => ({
            recipe_id: i.recipe_id,
            porcao: i.porcao,
            observacao: i.observacao,
          })),
        })),
      };

      const res = await saveDiet(payload);

      if (res.success) {
        toast.success("Dieta salva e enviada!");
        navigate("/admin/dietas/pedidos");
      } else {
        throw new Error(res.message || "Erro desconhecido ao salvar.");
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        toast.error("Erro: " + (err.message || "Falha na requisição"));
      } else {
        toast.error("Erro: Falha na requisição");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* HEADER */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <LuArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">
              Criador de Dieta
            </h1>
            <p className="text-xs text-gray-500">
              Aluno:{" "}
              <span className="font-semibold text-indigo-600">
                {userName || userUid}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right mr-2 hidden sm:block">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Calorias Totais
            </p>
            <p
              className={`text-lg font-bold leading-none ${
                currentTotalCals > targetCals
                  ? "text-red-500"
                  : "text-green-600"
              }`}
            >
              {currentTotalCals}{" "}
              <span className="text-gray-300 text-sm font-medium">
                / {targetCals}
              </span>
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-black disabled:opacity-70 flex items-center gap-2 text-sm shadow-md transition-all active:scale-95"
          >
            {saving ? (
              <LuLoader className="animate-spin w-4 h-4" />
            ) : (
              <LuSave className="w-4 h-4" />
            )}
            Salvar
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* COLUNA ESQUERDA: Biblioteca de Receitas */}
        <aside className="w-1/3 min-w-75 max-w-sm bg-white border-r flex flex-col z-0">
          <div className="p-4 border-b bg-gray-50/50">
            <div className="relative">
              <LuSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar receitas..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
            {loading ? (
              <div className="flex justify-center items-center h-40 text-gray-400 gap-2">
                <LuLoader className="animate-spin" /> Carregando...
              </div>
            ) : filteredRecipes.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">
                Nenhuma receita encontrada.
              </p>
            ) : (
              filteredRecipes.map((recipe) => (
                <div
                  key={recipe.recipe_id}
                  className="flex gap-3 p-3 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 group transition-all cursor-default"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                    {recipe.url_imagem ? (
                      <img
                        src={recipe.url_imagem}
                        alt={recipe.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-800 truncate leading-tight">
                      {recipe.titulo}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {recipe.calorias_kcal} kcal
                    </p>
                  </div>
                  <button
                    onClick={() => addRecipeToMeal(recipe)}
                    className="self-center bg-white border border-gray-200 text-indigo-600 p-2 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                    title="Adicionar à refeição selecionada"
                  >
                    <LuPlus className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* COLUNA DIREITA: Montagem da Dieta */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Configurações do Plano */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                  Nome do Plano
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                  Meta Calórica (Diária)
                </label>
                <input
                  type="number"
                  value={targetCals}
                  onChange={(e) => setTargetCals(Number(e.target.value))}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Refeições */}
            <div className="space-y-4">
              {meals.map((meal) => {
                const isSelected = selectedMealId === meal.temp_id;
                const mealTotal = meal.items.reduce(
                  (acc, i) => acc + i.calorias,
                  0
                );

                return (
                  <div
                    key={meal.temp_id}
                    onClick={() => setSelectedMealId(meal.temp_id)}
                    className={`bg-white rounded-2xl shadow-sm border-2 transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? "border-indigo-500 ring-4 ring-indigo-50/50 z-10 relative"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    {/* Header da Refeição */}
                    <div
                      className={`p-4 flex flex-wrap gap-3 justify-between items-center border-b ${
                        isSelected ? "bg-indigo-50/30" : "bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="text"
                          value={meal.nome}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMeals((m) =>
                              m.map((x) =>
                                x.temp_id === meal.temp_id
                                  ? { ...x, nome: val }
                                  : x
                              )
                            );
                          }}
                          className="font-bold bg-transparent focus:bg-white border border-transparent focus:border-indigo-200 rounded px-1 py-0.5 text-gray-800 focus:ring-2 focus:ring-indigo-100 outline-none transition-all w-40 sm:w-auto"
                        />
                        <div className="flex items-center gap-1.5 text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                          <LuClock className="w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="time"
                            value={meal.horario}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMeals((m) =>
                                m.map((x) =>
                                  x.temp_id === meal.temp_id
                                    ? { ...x, horario: val }
                                    : x
                                )
                              );
                            }}
                            className="text-xs border-none focus:ring-0 p-0 font-medium text-gray-600 bg-transparent w-16"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-100">
                          {mealTotal} kcal
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMeal(meal.temp_id);
                          }}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          title="Excluir Refeição"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Itens da Refeição */}
                    <div className="p-4 space-y-2 min-h-15">
                      {meal.items.length === 0 && (
                        <div className="text-center py-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30">
                          <p className="text-xs text-gray-400 font-medium">
                            {isSelected
                              ? "← Selecione receitas na lista para adicionar"
                              : "Clique para editar esta refeição"}
                          </p>
                        </div>
                      )}

                      {meal.items.map((item) => (
                        <div
                          key={item.temp_id}
                          className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors shadow-sm"
                        >
                          <div className="flex-1 font-semibold text-sm text-gray-800">
                            {item.titulo}
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              placeholder="Porção (Ex: 100g)"
                              value={item.porcao}
                              onChange={(e) =>
                                updateItem(
                                  meal.temp_id,
                                  item.temp_id,
                                  "porcao",
                                  e.target.value
                                )
                              }
                              className="flex-1 sm:w-28 text-xs p-2 border border-gray-200 rounded-lg focus:border-indigo-500 outline-none bg-gray-50 focus:bg-white transition-all"
                            />
                            <input
                              type="text"
                              placeholder="Obs (Ex: grelhado)"
                              value={item.observacao}
                              onChange={(e) =>
                                updateItem(
                                  meal.temp_id,
                                  item.temp_id,
                                  "observacao",
                                  e.target.value
                                )
                              }
                              className="flex-1 sm:w-32 text-xs p-2 border border-gray-200 rounded-lg focus:border-indigo-500 outline-none bg-gray-50 focus:bg-white transition-all"
                            />
                          </div>

                          <div className="flex items-center justify-between w-full sm:w-auto gap-3 pl-1">
                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                              {item.calorias} kcal
                            </span>
                            <button
                              onClick={() =>
                                removeRecipe(meal.temp_id, item.temp_id)
                              }
                              className="text-gray-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <LuTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={addMeal}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 hover:bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all font-bold flex items-center justify-center gap-2 group"
              >
                <div className="bg-gray-100 group-hover:bg-indigo-100 p-1.5 rounded-full transition-colors">
                  <LuPlus className="w-4 h-4" />
                </div>
                Adicionar Nova Refeição
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
