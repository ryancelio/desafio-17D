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
  //   LuFilter,
} from "react-icons/lu";

// Tipos
interface Exercise {
  exercise_id: number;
  nome: string;
  musculos_trabalhados: string[]; // Vem como array do PHP
}

interface PlanItem {
  uid: string; // ID único para o frontend (para permitir mesmo exercício 2x)
  exercise_id: number;
  nome: string;
  prescription: {
    sets: string;
    reps: string;
    rest: string;
    notes: string;
  };
}

export default function AdminCreateWorkoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userUid = searchParams.get("uid");

  // Estados de Dados
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  // Estado do Formulário
  const [planName, setPlanName] = useState("");
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("");

  // 1. Carregar Exercícios ao Iniciar
  useEffect(() => {
    if (!userUid) {
      alert("UID do usuário não fornecido.");
      return;
    }

    const fetchExercises = async () => {
      try {
        const res = await fetch(
          "https://dealory.io/api/admin/exercises_manage.php",
          {
            method: "GET",
            credentials: "include", // Cookie de Admin
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setAvailableExercises(data);
          setFilteredExercises(data);
        }
      } catch (err) {
        console.error("Erro ao carregar exercícios", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [userUid]);

  // 2. Filtro de Exercícios
  useEffect(() => {
    let results = availableExercises;

    if (searchTerm) {
      results = results.filter((ex) =>
        ex.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterMuscle) {
      results = results.filter((ex) =>
        // Verifica se o array de musculos contém o filtro (case insensitive)
        ex.musculos_trabalhados.some((m: string) =>
          m.toLowerCase().includes(filterMuscle.toLowerCase())
        )
      );
    }

    setFilteredExercises(results);
  }, [searchTerm, filterMuscle, availableExercises]);

  // 3. Adicionar Exercício ao Treino
  const addToPlan = (ex: Exercise) => {
    const newItem: PlanItem = {
      uid: Date.now().toString() + Math.random(),
      exercise_id: ex.exercise_id,
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

  // 4. Remover Exercício do Treino
  const removeFromPlan = (itemUid: string) => {
    setPlanItems(planItems.filter((item) => item.uid !== itemUid));
  };

  // 5. Atualizar Detalhes (Series, Reps)
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

  // 6. Salvar Treino
  const handleSave = async () => {
    if (!planName.trim()) return alert("Dê um nome ao treino (Ex: Treino A)");
    if (planItems.length === 0)
      return alert("Adicione pelo menos um exercício.");

    setSaving(true);
    try {
      const payload = {
        user_uid: userUid,
        nome: planName,
        exercises: planItems.map((item) => ({
          exercise_id: item.exercise_id,
          prescription: item.prescription,
        })),
      };

      const res = await fetch("https://dealory.io/api/admin/save_workout.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      alert("Treino salvo com sucesso!");
      // Opcional: Limpar formulário ou voltar para lista de pedidos
      // setPlanName("");
      // setPlanItems([]);
      // window.close(); // Se abriu em nova aba
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center flex items-center justify-center">
        <LuLoader2 className="animate-spin mr-2" /> Carregando sistema...
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* HEADER */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/pedidos")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <LuArrowLeft />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Criador de Treinos
            </h1>
            <p className="text-xs text-gray-500">
              Editando para UID:{" "}
              <span className="font-mono bg-gray-100 px-1 rounded">
                {userUid}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Input do Nome do Treino no Header para economizar espaço */}
          <input
            type="text"
            placeholder="Nome da Ficha (ex: Treino A - Superiores)"
            className="border border-gray-300 rounded-lg px-4 py-2 w-80 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <LuLoader2 className="animate-spin" /> : <LuSave />}
            Salvar Treino
          </button>
        </div>
      </header>

      {/* BODY (2 COLUNAS) */}
      <div className="flex flex-1 overflow-hidden">
        {/* COLUNA ESQUERDA: LISTA DE EXERCÍCIOS */}
        <aside className="w-1/3 min-w-75 bg-white border-r flex flex-col">
          <div className="p-4 border-b space-y-3 bg-gray-50">
            <div className="relative">
              <LuSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar exercício..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                "Peito",
                "Costas",
                "Pernas",
                "Ombros",
                "Bíceps",
                "Tríceps",
                "Abdômen",
              ].map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMuscle(filterMuscle === m ? "" : m)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border transition-colors ${
                    filterMuscle === m
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredExercises.map((ex) => (
              <div
                key={ex.exercise_id}
                className="group flex justify-between items-center p-3 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 transition-all cursor-pointer"
                onClick={() => addToPlan(ex)}
              >
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    {ex.nome}
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    {ex.musculos_trabalhados.join(", ")}
                  </p>
                </div>
                <button className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-full shadow-sm">
                  <LuPlus />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* COLUNA DIREITA: FICHA DE TREINO (EDITOR) */}
        <main className="flex-1 bg-gray-100 overflow-y-auto p-8">
          {planItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
              <LuDumbbell className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Seu treino está vazio</p>
              <p className="text-sm">
                Selecione exercícios na lista ao lado para começar.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {planItems.map((item, index) => (
                <div
                  key={item.uid}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4 group"
                >
                  {/* Número da Ordem */}
                  <div className="flex flex-col items-center justify-center w-8 text-gray-400 font-bold text-lg">
                    {index + 1}
                  </div>

                  {/* Detalhes */}
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    {/* Nome */}
                    <div className="col-span-4">
                      <h3 className="font-bold text-gray-800">{item.nome}</h3>
                    </div>

                    {/* Inputs de Prescrição */}
                    <div className="col-span-2">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">
                        Séries
                      </label>
                      <input
                        type="text"
                        value={item.prescription.sets}
                        onChange={(e) =>
                          updateItem(item.uid, "sets", e.target.value)
                        }
                        className="w-full p-1 border rounded text-center font-medium bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">
                        Reps
                      </label>
                      <input
                        type="text"
                        value={item.prescription.reps}
                        onChange={(e) =>
                          updateItem(item.uid, "reps", e.target.value)
                        }
                        className="w-full p-1 border rounded text-center font-medium bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">
                        Descanso
                      </label>
                      <input
                        type="text"
                        value={item.prescription.rest}
                        onChange={(e) =>
                          updateItem(item.uid, "rest", e.target.value)
                        }
                        className="w-full p-1 border rounded text-center font-medium bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Botão Remover */}
                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => removeFromPlan(item.uid)}
                        className="text-gray-400 hover:text-red-500 p-2"
                      >
                        <LuTrash2 />
                      </button>
                    </div>

                    {/* Notas (Linha de baixo) */}
                    <div className="col-span-12">
                      <input
                        type="text"
                        placeholder="Observações (ex: Drop-set na última, carga moderada...)"
                        value={item.prescription.notes}
                        onChange={(e) =>
                          updateItem(item.uid, "notes", e.target.value)
                        }
                        className="w-full text-xs text-gray-600 border-b border-dashed border-gray-300 focus:border-indigo-500 outline-none bg-transparent placeholder-gray-400 py-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
