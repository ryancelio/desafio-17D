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

// --- Tipos ---
interface Recipe {
  recipe_id: number;
  titulo: string;
  calorias_kcal: number;
  url_imagem: string;
}

interface DietItem {
  temp_id: string; // ID local para manipulação no front
  recipe_id: number;
  titulo: string;
  calorias: number;
  porcao: string;
  observacao: string;
}

interface DietMeal {
  temp_id: string;
  nome: string;
  horario: string;
  items: DietItem[];
}

export default function AdminCreateDietPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reqId = searchParams.get("req");
  const userUid = searchParams.get("uid");
  const userName = searchParams.get("name");

  // Dados
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  // Estado do Formulário
  const [planName, setPlanName] = useState("Plano Alimentar Personalizado");
  const [targetCals, setTargetCals] = useState(2000);
  const [meals, setMeals] = useState<DietMeal[]>([
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

  // 1. Carregar Receitas (Biblioteca)
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Usamos o endpoint público ou um admin específico se tiver
        const res = await fetch(
          "https://dealory.io/api/admin/recipes_manage.php",
          {
            method: "GET",
            credentials: "include", // Cookie de Admin
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setRecipes(data);
          setFilteredRecipes(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // Filtro
  useEffect(() => {
    setFilteredRecipes(
      recipes.filter((r) =>
        r.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, recipes]);

  // Actions
  const addRecipeToMeal = (recipe: Recipe) => {
    if (!selectedMealId)
      return alert("Selecione uma refeição à direita primeiro.");

    const newItem: DietItem = {
      temp_id: Date.now().toString() + Math.random(),
      recipe_id: recipe.recipe_id,
      titulo: recipe.titulo,
      calorias: recipe.calorias_kcal,
      porcao: "1 porção", // Padrão
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
    field: string,
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
    if (confirm("Remover refeição?"))
      setMeals(meals.filter((m) => m.temp_id !== id));
  };

  // Calcular total atual
  const currentTotalCals = meals.reduce(
    (acc, meal) =>
      acc + meal.items.reduce((mAcc, item) => mAcc + item.calorias, 0),
    0
  );

  const handleSave = async () => {
    if (!userUid) return alert("Erro: UID do usuário faltando.");
    setSaving(true);
    try {
      const payload = {
        request_id: reqId,
        user_uid: userUid,
        nome: planName,
        calorias_meta: targetCals,
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

      const res = await fetch("https://dealory.io/api/admin/save_diet.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Session Admin
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      alert("Dieta salva e enviada!");
      navigate("/admin/dietas"); // Volta para listagem
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* HEADER */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <LuArrowLeft />
          </button>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">
              Criador de Dieta
            </h1>
            <p className="text-xs text-gray-500">
              Aluno:{" "}
              <span className="font-bold text-gray-700">
                {userName || userUid}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <p className="text-xs text-gray-500 font-bold uppercase">
              Calorias Totais
            </p>
            <p
              className={`text-xl font-bold ${
                currentTotalCals > targetCals
                  ? "text-red-500"
                  : "text-green-600"
              }`}
            >
              {currentTotalCals}{" "}
              <span className="text-gray-400 text-sm">/ {targetCals}</span>
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
          >
            {saving ? <LuLoader className="animate-spin" /> : <LuSave />}
            Salvar Dieta
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* COLUNA ESQUERDA: Biblioteca de Receitas */}
        <aside className="w-1/3 min-w-[320px] bg-white border-r flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <div className="relative">
              <LuSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar receitas..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <p className="p-4 text-center">Carregando...</p>
            ) : (
              filteredRecipes.map((recipe) => (
                <div
                  key={recipe.recipe_id}
                  className="flex gap-3 p-3 rounded-lg border border-transparent hover:border-green-200 hover:bg-green-50 group"
                >
                  <img
                    src={recipe.url_imagem}
                    className="w-12 h-12 rounded object-cover bg-gray-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-gray-800">
                      {recipe.titulo}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {recipe.calorias_kcal} kcal
                    </p>
                  </div>
                  <button
                    onClick={() => addRecipeToMeal(recipe)}
                    className="self-center bg-white border border-gray-200 text-green-600 p-2 rounded-full hover:bg-green-600 hover:text-white transition-colors"
                    title="Adicionar à refeição selecionada"
                  >
                    <LuPlus />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* COLUNA DIREITA: Montagem da Dieta */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-100">
          {/* Configurações do Plano */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Nome do Plano
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full p-2 border rounded mt-1 font-bold text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Meta Calórica
              </label>
              <input
                type="number"
                value={targetCals}
                onChange={(e) => setTargetCals(Number(e.target.value))}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
          </div>

          {/* Refeições */}
          <div className="space-y-6">
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
                  className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                    isSelected
                      ? "border-green-500 ring-4 ring-green-50"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <div className="p-4 flex justify-between items-center border-b bg-gray-50 rounded-t-xl">
                    <div className="flex gap-3">
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
                        className="font-bold bg-transparent focus:bg-white focus:ring-1 border-none focus:px-2 rounded"
                      />
                      <div className="flex items-center gap-1 text-gray-500 bg-white px-2 rounded border">
                        <LuClock className="w-3 h-3" />
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
                          className="text-xs border-none focus:ring-0 p-0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-600">
                        {mealTotal} kcal
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMeal(meal.temp_id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <LuTrash2 />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {meal.items.length === 0 && (
                      <p className="text-center text-sm text-gray-400 italic py-2">
                        {isSelected
                          ? "Selecione receitas na esquerda para adicionar aqui."
                          : "Clique nesta refeição para selecioná-la."}
                      </p>
                    )}

                    {meal.items.map((item) => (
                      <div
                        key={item.temp_id}
                        className="flex gap-3 items-start bg-gray-50 p-2 rounded-lg border border-gray-100"
                      >
                        <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5 font-medium text-sm text-gray-800">
                            {item.titulo}
                          </div>
                          <div className="col-span-3">
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
                              className="w-full text-xs p-1 border rounded"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              placeholder="Obs (Ex: s/ sal)"
                              value={item.observacao}
                              onChange={(e) =>
                                updateItem(
                                  meal.temp_id,
                                  item.temp_id,
                                  "observacao",
                                  e.target.value
                                )
                              }
                              className="w-full text-xs p-1 border rounded"
                            />
                          </div>
                          <div className="col-span-1 text-xs text-gray-500 text-right">
                            {item.calorias}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            removeRecipe(meal.temp_id, item.temp_id)
                          }
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <button
              onClick={addMeal}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:bg-white hover:border-green-400 hover:text-green-600 transition-all font-bold flex items-center justify-center gap-2"
            >
              <LuPlus /> Adicionar Nova Refeição
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
