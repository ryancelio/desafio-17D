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
  LuX,
} from "react-icons/lu";
import { manageRecipes } from "./shared/AdminApi";
import { ManageRecipeTaxonomies } from "./shared/AdminApi"; // Ajuste o caminho se necessário
import { toast } from "sonner";
import type { RecipeTaxonomy } from "../../types/models";

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
  ingredientes: [""],
  preparo: [""],
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

  // Estados para gerenciamento de Tags
  const [availableTags, setAvailableTags] = useState<RecipeTaxonomy[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // --- CARREGAR DADOS ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 1. Carregar Tags do Banco
        try {
          const tagsData = await ManageRecipeTaxonomies.get();
          setAvailableTags(tagsData);
        } catch (tagErr) {
          console.error("Erro ao carregar tags", tagErr);
          toast.error("Não foi possível carregar as tags disponíveis.");
        }

        // 2. Carregar Receita (se for edição)
        if (isEditMode) {
          const recipe = await manageRecipes.getById(Number(id));
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
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
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

  const handleMacroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      macros: {
        ...prev.macros,
        [name]: parseFloat(value) || 0,
      },
    }));
  };

  // --- HANDLERS DE LISTAS ---
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

  // --- GERENCIAMENTO DE TAGS ---

  // Alternar tag na receita atual
  const toggleTag = (tagValue: string) => {
    setForm((prev) => {
      const tags = prev.tags.includes(tagValue)
        ? prev.tags.filter((t) => t !== tagValue)
        : [...prev.tags, tagValue];
      return { ...prev, tags };
    });
  };

  // Criar nova tag no banco de dados
  const handleCreateTag = async (
    e: React.FormEvent | React.MouseEvent | React.KeyboardEvent
  ) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;

    setIsCreatingTag(true);
    try {
      // Gera um value "slugified" (ex: "Sem Glúten" -> "sem_gluten")
      const label = newTagInput.trim();
      const value = label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-z0-9]/g, "_"); // Troca especiais por _

      const res = await ManageRecipeTaxonomies.post({ label, value });

      if (res.success && res.id) {
        const newTag: RecipeTaxonomy = { id: res.id, label, value };
        setAvailableTags((prev) => [...prev, newTag]);
        setNewTagInput("");
        // Já seleciona a tag criada para a receita
        toggleTag(value);
        toast.success("Tag criada e adicionada!");
      } else {
        throw new Error(res.message || "Erro ao criar");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar tag.");
    } finally {
      setIsCreatingTag(false);
    }
  };

  // Excluir tag do banco de dados
  const handleDeleteTagGlobal = async (id: number, label: string) => {
    if (
      !window.confirm(
        `ATENÇÃO: Isso excluirá a tag "${label}" de TODAS as receitas do sistema. Deseja continuar?`
      )
    ) {
      return;
    }

    try {
      const res = await ManageRecipeTaxonomies.delete(id);
      if (res.success) {
        setAvailableTags((prev) => prev.filter((t) => t.id !== id));
        // Remove da receita atual se estiver selecionada
        const deletedTagValue = availableTags.find((t) => t.id === id)?.value;
        if (deletedTagValue) {
          setForm((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== deletedTagValue),
          }));
        }
        toast.success("Tag excluída do sistema.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir tag.");
    }
  };

  // --- SUBMIT RECEITA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      ...form,
      ingredientes: form.ingredientes.filter((i) => i.trim() !== ""),
      preparo: form.preparo.filter((i) => i.trim() !== ""),
      ...(isEditMode && { recipe_id: Number(id) }),
    };

    try {
      const data = isEditMode
        ? await manageRecipes.put(payload)
        : await manageRecipes.post(payload);

      if (!data.success) {
        throw new Error((data as any).error || "Erro ao salvar receita.");
      }

      toast.success(`Receita ${isEditMode ? "atualizada" : "criada"}!`);
      navigate("/admin/receitas");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      window.scrollTo(0, 0);
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
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/receitas")}
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
          {/* COLUNA ESQUERDA */}
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

          {/* COLUNA DIREITA */}
          <div className="space-y-6">
            {/* Detalhes */}
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

            {/* Tags (Gerenciador Completo) */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-4 mb-4">
                Tags
              </h2>

              {/* Lista de Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {availableTags.map((tag) => {
                  const isSelected = form.tags.includes(tag.value);
                  return (
                    <div
                      key={tag.id}
                      className={`group relative flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTag(tag.value)}
                        className="flex items-center gap-1"
                      >
                        {isSelected && <LuCheck className="w-3 h-3" />}
                        {tag.label}
                      </button>

                      {/* Botão de Excluir Tag (Global) - Aparece no Hover */}
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteTagGlobal(tag.id!, tag.label)
                        }
                        className="ml-2 p-0.5 rounded-full hover:bg-red-200 text-red-400 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Excluir tag do sistema"
                      >
                        <LuX className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Criar Nova Tag */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateTag(e);
                    }
                  }}
                  placeholder="Nova tag (ex: Low Carb)"
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={isCreatingTag || !newTagInput.trim()}
                  className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50"
                >
                  {isCreatingTag ? (
                    <LuLoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    <LuPlus className="w-4 h-4" />
                  )}
                </button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
