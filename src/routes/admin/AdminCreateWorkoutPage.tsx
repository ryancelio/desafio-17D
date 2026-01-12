import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  LuPlus,
  LuTrash2,
  LuSave,
  LuSearch,
  LuDumbbell,
  LuArrowLeft,
  LuLoader as LuLoader2,
  LuCalendarDays,
  LuPencilLine,
  LuTag, // Reimportado para uso nas tags
} from "react-icons/lu";
import type { Exercise, ExerciseTaxonomy } from "../../types/models";
import {
  ManageExercises,
  ManageExerciseMetadata,
  type SaveWorkoutPayload,
  saveWorkout,
  completeWorkoutRequest,
} from "./shared/AdminApi";

// Interface Local para controle de estado da lista de construção
interface PlanItem {
  uid: string;
  exercise_id: number;
  nome: string;
  prescription: {
    sets: string;
    reps: string;
    rest: string;
    notes: string;
  };
}

// Dias da semana disponíveis
const DAYS_OPTIONS = [
  { key: "DOM", label: "Dom" },
  { key: "SEG", label: "Seg" },
  { key: "TER", label: "Ter" },
  { key: "QUA", label: "Qua" },
  { key: "QUI", label: "Qui" },
  { key: "SEX", label: "Sex" },
  { key: "SAB", label: "Sáb" },
];

export default function AdminCreateWorkoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parâmetros da URL
  const userUid = searchParams.get("uid");
  const requestId = searchParams.get("req");
  const defaultName = searchParams.get("name");

  // --- Estados de Dados ---
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  // Metadados vindos da API
  const [muscleList, setMuscleList] = useState<ExerciseTaxonomy[]>([]);
  const [tagList, setTagList] = useState<ExerciseTaxonomy[]>([]);

  // --- Estados do Formulário ---
  const [planName, setPlanName] = useState(
    defaultName ? decodeURIComponent(defaultName) : ""
  );
  // Estado para os dias da semana
  const [assignedDays, setAssignedDays] = useState<string[]>([]);

  const [planItems, setPlanItems] = useState<PlanItem[]>([]);

  // --- Estados de Filtro e UI ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  type CategoriaTypes = "todas" | "academia" | "calistenia";
  const [filterMuscle, setFilterMuscle] = useState("");
  const [filterCategory, setFilterCategory] = useState<CategoriaTypes>("todas");

  // 1. Carregar Dados Iniciais
  useEffect(() => {
    if (!userUid) {
      alert("UID do usuário não fornecido.");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [exercisesData, metaData] = await Promise.all([
          ManageExercises.get(),
          ManageExerciseMetadata.get(),
        ]);

        if (Array.isArray(exercisesData)) {
          setAvailableExercises(exercisesData);
          setFilteredExercises(exercisesData);
        }

        if (metaData) {
          setMuscleList(metaData.musculos || []);
          setTagList(metaData.tags || []);
        }
      } catch (err) {
        console.error("Erro ao carregar dados", err);
        alert("Falha ao carregar banco de dados.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userUid]);

  // 2. Lógica de Filtragem
  useEffect(() => {
    let results = availableExercises;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter((ex) => ex.nome.toLowerCase().includes(term));
    }

    if (filterMuscle) {
      results = results.filter((ex) =>
        ex.musculos_trabalhados?.some(
          (m: string) => m.toLowerCase() === filterMuscle.toLowerCase()
        )
      );
    }

    if (filterCategory !== "todas") {
      results = results.filter((ex) => {
        return ex.categoria === filterCategory || ex.categoria === "ambos";
      });
    }

    setFilteredExercises(results);
  }, [searchTerm, filterMuscle, filterCategory, availableExercises]);

  // 3. Helpers de Manipulação do Treino
  const addToPlan = (ex: Exercise) => {
    const newItem: PlanItem = {
      uid: Date.now().toString() + Math.random(),
      exercise_id: ex.exercise_id!,
      nome: ex.nome,
      prescription: {
        sets: "3",
        reps: "12",
        rest: "60s",
        notes: "",
      },
    };
    setPlanItems([...planItems, newItem]);
  };

  const removeFromPlan = (itemUid: string) => {
    setPlanItems(planItems.filter((item) => item.uid !== itemUid));
  };

  const updateItem = (
    itemUid: string,
    field: keyof PlanItem["prescription"],
    value: string
  ) => {
    setPlanItems(
      planItems.map((item) => {
        if (item.uid === itemUid) {
          return {
            ...item,
            prescription: { ...item.prescription, [field]: value },
          };
        }
        return item;
      })
    );
  };

  // Toggle de Dias
  const toggleDay = (dayKey: string) => {
    setAssignedDays((prev) =>
      prev.includes(dayKey)
        ? prev.filter((d) => d !== dayKey)
        : [...prev, dayKey]
    );
  };

  // 4. Salvar Treino
  const handleSave = async () => {
    if (!planName.trim()) return alert("Dê um nome ao treino (Ex: Treino A)");
    if (planItems.length === 0)
      return alert("Adicione pelo menos um exercício.");

    setSaving(true);
    try {
      const payload: SaveWorkoutPayload = {
        user_uid: userUid!,
        nome: planName,
        assigned_days: assignedDays,
        exercises: planItems.map((item, index) => ({
          exercise_id: item.exercise_id,
          ordem: index,
          prescription: item.prescription,
        })),
      };

      const response = await saveWorkout(payload);

      if (response.success || response.message) {
        if (requestId) {
          const shouldComplete = window.confirm(
            "Treino salvo! Deseja marcar o pedido como concluído agora?"
          );
          if (shouldComplete) {
            await completeWorkoutRequest(Number(requestId));
            alert("Pedido concluído!");
            navigate("/admin/treinos/pedidos");
            return;
          }
        } else {
          alert("Treino salvo com sucesso!");
        }
        setPlanName("");
        setAssignedDays([]);
        setPlanItems([]);
      } else {
        throw new Error("Erro desconhecido ao salvar.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Helper usado na lista lateral
  const getTagLabel = (tagValue: string) => {
    const tag = tagList.find((t) => t.value === tagValue);
    return tag ? tag.label : tagValue;
  };

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-gray-500 gap-2">
        <LuLoader2 className="animate-spin" /> Carregando biblioteca...
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      {/* HEADER */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-20 h-16 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <LuArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">
              Criar Treino
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">
                {userUid?.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 active:bg-indigo-800 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
        >
          {saving ? (
            <LuLoader2 className="animate-spin w-4 h-4" />
          ) : (
            <LuSave className="w-4 h-4" />
          )}
          Salvar Ficha
        </button>
      </header>

      {/* BODY (2 COLUNAS) */}
      <div className="flex flex-1 overflow-hidden">
        {/* ESQUERDA: LISTA DE EXERCÍCIOS */}
        <aside className="w-96 bg-white border-r flex flex-col z-10 shadow-lg">
          {/* Área de Filtros */}
          <div className="p-4 border-b space-y-3 bg-gray-50/80">
            <div className="relative">
              <LuSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar exercício..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex bg-gray-200 rounded-lg p-1">
              {["todas", "academia", "calistenia"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat as CategoriaTypes)}
                  className={`flex-1 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                    filterCategory === cat
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
              <button
                onClick={() => setFilterMuscle("")}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border transition-all ${
                  filterMuscle === ""
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                Todos
              </button>
              {muscleList.map((m) => (
                <button
                  key={m.id}
                  onClick={() =>
                    setFilterMuscle(filterMuscle === m.value ? "" : m.value)
                  }
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border transition-all ${
                    filterMuscle === m.value
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista Scrollável */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
            {filteredExercises.map((ex) => (
              <div
                key={ex.exercise_id}
                className="group flex justify-between items-center p-3 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 transition-all cursor-pointer"
                onClick={() => addToPlan(ex)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800 text-sm leading-tight truncate">
                      {ex.nome}
                    </h4>
                    {ex.categoria !== "ambos" && (
                      <span
                        className={`text-[9px] px-1.5 rounded uppercase font-bold ${
                          ex.categoria === "calistenia"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {ex.categoria.substring(0, 3)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {ex.musculos_trabalhados?.slice(0, 3).map((m, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-gray-500 bg-gray-100 px-1.5 rounded"
                      >
                        {m}
                      </span>
                    ))}
                    {/* USO DA FUNÇÃO getTagLabel AQUI */}
                    {ex.tags?.slice(0, 2).map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-indigo-500 bg-indigo-50 px-1.5 rounded flex items-center gap-0.5"
                      >
                        <LuTag className="w-2 h-2" /> {getTagLabel(t)}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-all bg-white p-1.5 rounded-full shadow-sm hover:scale-110 shrink-0 ml-2">
                  <LuPlus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* DIREITA: EDITOR DE TREINO */}
        <main className="flex-1 bg-gray-100 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* CONFIGURAÇÕES DO PLANO */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <LuPencilLine className="w-5 h-5" />
                <h2 className="font-bold text-lg">Configurações da Ficha</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome do Treino */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Nome da Ficha
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Treino A - Peito e Tríceps"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>

                {/* Seletor de Dias */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    <LuCalendarDays className="w-3 h-3" /> Dias Recomendados
                  </label>
                  <div className="flex gap-1.5">
                    {DAYS_OPTIONS.map((day) => {
                      const isSelected = assignedDays.includes(day.key);
                      return (
                        <button
                          key={day.key}
                          onClick={() => toggleDay(day.key)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                              : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600"
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* LISTA DE EXERCÍCIOS ADICIONADOS */}
            <div>
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <LuDumbbell className="w-4 h-4 text-gray-400" />
                  Exercícios ({planItems.length})
                </h3>
                {planItems.length > 0 && (
                  <button
                    onClick={() => setPlanItems([])}
                    className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
                  >
                    Limpar Tudo
                  </button>
                )}
              </div>

              {planItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                  <div className="bg-gray-100 p-4 rounded-full mb-3">
                    <LuDumbbell className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="font-medium text-gray-600">
                    O treino está vazio
                  </p>
                  <p className="text-sm">
                    Selecione exercícios na lista lateral para começar.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {planItems.map((item, index) => (
                    <div
                      key={item.uid}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4 group hover:shadow-md transition-all items-start"
                    >
                      {/* Número */}
                      <div className="flex flex-col items-center justify-center w-8 pt-1">
                        <span className="text-indigo-600 font-bold text-lg bg-indigo-50 w-8 h-8 flex items-center justify-center rounded-lg">
                          {index + 1}
                        </span>
                      </div>

                      {/* Detalhes */}
                      <div className="flex-1 grid grid-cols-12 gap-x-4 gap-y-3 items-center">
                        {/* Nome */}
                        <div className="col-span-12 md:col-span-4">
                          <h3
                            className="font-bold text-gray-800 text-sm md:text-base truncate"
                            title={item.nome}
                          >
                            {item.nome}
                          </h3>
                        </div>

                        {/* Prescrição */}
                        <div className="col-span-3 md:col-span-2">
                          <label className="block text-[9px] text-gray-400 uppercase font-bold mb-1 text-center">
                            Séries
                          </label>
                          <input
                            type="text"
                            value={item.prescription.sets}
                            onChange={(e) =>
                              updateItem(item.uid, "sets", e.target.value)
                            }
                            className="w-full p-1.5 border border-gray-200 rounded text-center text-sm font-medium bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                          />
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <label className="block text-[9px] text-gray-400 uppercase font-bold mb-1 text-center">
                            Reps
                          </label>
                          <input
                            type="text"
                            value={item.prescription.reps}
                            onChange={(e) =>
                              updateItem(item.uid, "reps", e.target.value)
                            }
                            className="w-full p-1.5 border border-gray-200 rounded text-center text-sm font-medium bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-[9px] text-gray-400 uppercase font-bold mb-1 text-center">
                            Descanso
                          </label>
                          <input
                            type="text"
                            value={item.prescription.rest}
                            onChange={(e) =>
                              updateItem(item.uid, "rest", e.target.value)
                            }
                            className="w-full p-1.5 border border-gray-200 rounded text-center text-sm font-medium bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                          />
                        </div>

                        <div className="col-span-2 md:col-span-2 flex justify-end">
                          <button
                            onClick={() => removeFromPlan(item.uid)}
                            className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <LuTrash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Notas */}
                        <div className="col-span-12 border-t border-gray-50 pt-2 mt-1">
                          <input
                            type="text"
                            placeholder="Observações (ex: Drop-set na última, carga moderada...)"
                            value={item.prescription.notes}
                            onChange={(e) =>
                              updateItem(item.uid, "notes", e.target.value)
                            }
                            className="w-full text-xs text-gray-600 focus:text-gray-900 bg-transparent placeholder-gray-300 outline-none hover:bg-gray-50 p-1 rounded transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
