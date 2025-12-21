/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  LuArrowLeft,
  LuSave,
  LuLoaderCircle,
  LuPlus,
  LuTrash2,
  LuImage,
  LuClock,
  LuFlame,
  LuCheck,
} from "react-icons/lu";
// import { motion } from "framer-motion";

// Tags disponíveis (mesmas da listagem para consistência)
const AVAILABLE_TAGS = [
  "sem_gluten",
  "vegano",
  "alto_proteina",
  "baixo_carboidrato",
  "rapido",
  "almoco",
  "vegetariano",
  "contem_amendoim",
];

// Estado inicial do formulário
const initialFormState = {
  titulo: "",
  descricao_curta: "",
  url_imagem: "",
  tempo_preparo_min: 0,
  calorias_kcal: 0,
  macros: {
    proteinas_g: 0,
    carboidratos_g: 0,
    gorduras_g: 0,
  },
  ingredientes: [""], // Começa com um campo vazio
  preparo: [""], // Começa com um campo vazio
  tags: [] as string[],
};

export default function AdminRecipeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [form, setForm] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- CARREGAR DADOS (SE FOR EDIÇÃO) ---
  useEffect(() => {
    if (isEditMode) {
      const loadRecipe = async () => {
        setIsLoading(true);
        try {
          const recipe = await fetch(
            `https://dealory.io/api/admin/recipes_manage.php?id=${id}`,
            { method: "GET", credentials: "include" }
          ).then((res) => res.json());
          if (recipe) {
            setForm({
              titulo: recipe.titulo,
              descricao_curta: recipe.descricao_curta || "",
              url_imagem: recipe.url_imagem || "",
              tempo_preparo_min: recipe.tempo_preparo_min || 0,
              calorias_kcal: recipe.calorias_kcal || 0,
              macros: recipe.macros || {
                proteinas_g: 0,
                carboidratos_g: 0,
                gorduras_g: 0,
              },
              ingredientes:
                recipe.ingredientes && recipe.ingredientes.length > 0
                  ? recipe.ingredientes
                  : [""],
              preparo:
                recipe.preparo && recipe.preparo.length > 0
                  ? recipe.preparo
                  : [""],
              tags: recipe.tags || [],
            });
          } else {
            setError("Receita não encontrada.");
          }
        } catch (err) {
          console.error(err);
          setError("Erro ao carregar dados da receita.");
        } finally {
          setIsLoading(false);
        }
      };
      loadRecipe();
    }
  }, [id, isEditMode]);

  // --- HANDLERS GENÉRICOS ---

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  // --- HANDLERS DE MACROS ---
  const handleMacroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // nome ex: "proteinas_g"
    setForm((prev) => ({
      ...prev,
      macros: {
        ...prev.macros,
        [name]: parseFloat(value) || 0,
      },
    }));
  };

  // --- HANDLERS DE LISTAS DINÂMICAS (Ingredientes/Preparo) ---
  const handleListChange = (
    field: "ingredientes" | "preparo",
    index: number,
    value: string
  ) => {
    const newList = [...form[field]];
    newList[index] = value;
    setForm((prev) => ({ ...prev, [field]: newList }));
  };

  const addListItem = (field: "ingredientes" | "preparo") => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeListItem = (field: "ingredientes" | "preparo", index: number) => {
    const newList = [...form[field]];
    if (newList.length > 1) {
      newList.splice(index, 1);
      setForm((prev) => ({ ...prev, [field]: newList }));
    }
  };

  // --- HANDLER DE TAGS ---
  const toggleTag = (tag: string) => {
    setForm((prev) => {
      const tags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags };
    });
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Limpeza básica: remove itens vazios das listas
    const payload = {
      ...form,
      ingredientes: form.ingredientes.filter((i) => i.trim() !== ""),
      preparo: form.preparo.filter((i) => i.trim() !== ""),
      // Se for edição, anexa o ID
      ...(isEditMode && { recipe_id: id }),
    };

    try {
      const response = await fetch(
        "https://dealory.io/api/admin/recipes_manage.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Descomente se estiver usando sessão PHP em domínios diferentes
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar receita.");
      }

      alert("Receita salva com sucesso!");
      navigate("/admin/receitas"); // Volta para listagem
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LuLoaderCircle className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
            <LuArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {isEditMode ? "Editar Receita" : "Nova Receita"}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isSaving ? (
            <LuLoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <LuSave className="h-5 w-5" />
          )}
          Salvar
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* COLUNA ESQUERDA: Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bloco 1: Básico */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Informações Básicas
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título da Receita *
                </label>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Frango Grelhado"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Curta
                </label>
                <textarea
                  name="descricao_curta"
                  value={form.descricao_curta}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Uma breve descrição do prato..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Imagem
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LuImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      name="url_imagem"
                      value={form.url_imagem}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                {form.url_imagem && (
                  <div className="mt-2 h-40 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={form.url_imagem}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Bloco 2: Ingredientes */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-4 mb-4">
                Ingredientes
              </h2>
              <div className="space-y-3">
                {form.ingredientes.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="py-3 text-gray-400 font-mono text-sm w-6">
                      {idx + 1}.
                    </span>
                    <input
                      value={item}
                      onChange={(e) =>
                        handleListChange("ingredientes", idx, e.target.value)
                      }
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Ex: 200g de Frango"
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem("ingredientes", idx)}
                      className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      tabIndex={-1}
                    >
                      <LuTrash2 />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem("ingredientes")}
                  className="mt-2 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1"
                >
                  <LuPlus /> Adicionar Ingrediente
                </button>
              </div>
            </section>

            {/* Bloco 3: Modo de Preparo */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-4 mb-4">
                Modo de Preparo
              </h2>
              <div className="space-y-3">
                {form.preparo.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <span className="py-3 text-gray-400 font-mono text-sm w-6">
                      {idx + 1}.
                    </span>
                    <textarea
                      value={item}
                      onChange={(e) =>
                        handleListChange("preparo", idx, e.target.value)
                      }
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      placeholder="Descreva o passo..."
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem("preparo", idx)}
                      className="text-red-400 hover:text-red-600 p-2 mt-1 hover:bg-red-50 rounded-lg transition-colors"
                      tabIndex={-1}
                    >
                      <LuTrash2 />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem("preparo")}
                  className="mt-2 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1"
                >
                  <LuPlus /> Adicionar Passo
                </button>
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA: Detalhes, Macros e Tags */}
          <div className="space-y-6">
            {/* Stats */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Detalhes
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <LuClock className="text-gray-400" /> Tempo (min)
                  </label>
                  <input
                    type="number"
                    name="tempo_preparo_min"
                    value={form.tempo_preparo_min}
                    onChange={handleNumberChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <LuFlame className="text-orange-500" /> Calorias
                  </label>
                  <input
                    type="number"
                    name="calorias_kcal"
                    value={form.calorias_kcal}
                    onChange={handleNumberChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </section>

            {/* Macros */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Macronutrientes
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-blue-700">
                    Proteínas (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="proteinas_g"
                    value={form.macros.proteinas_g}
                    onChange={handleMacroChange}
                    className="w-24 p-1 border border-gray-300 rounded text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-green-700">
                    Carboidratos (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="carboidratos_g"
                    value={form.macros.carboidratos_g}
                    onChange={handleMacroChange}
                    className="w-24 p-1 border border-gray-300 rounded text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-yellow-700">
                    Gorduras (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="gorduras_g"
                    value={form.macros.gorduras_g}
                    onChange={handleMacroChange}
                    className="w-24 p-1 border border-gray-300 rounded text-right"
                  />
                </div>
              </div>
            </section>

            {/* Tags */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-4 mb-4">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = form.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {isSelected && <LuCheck className="w-3 h-3" />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
