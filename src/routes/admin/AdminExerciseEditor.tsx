/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import type { ExerciseTaxonomy } from "../../types/models";
import {
  LuArrowLeft,
  LuSave,
  LuLoaderCircle,
  LuYoutube,
  LuDumbbell,
  LuAlignLeft,
  LuScan,
  LuTag,
  LuCheck,
  LuImage,
  LuHouse as LuHome,
  LuBuilding2,
  LuLayers,
  LuSettings, // Ícone para abrir gerenciador
  LuPlus,
  LuTrash2,
  LuPencil,
  LuX,
} from "react-icons/lu";
import { ManageExerciseMetadata, ManageExercises } from "./shared/AdminApi";
import { AnimatePresence } from "framer-motion";

const initialFormState = {
  nome: "",
  descricao: "",
  link_video: "",
  thumb_url: "",
  musculos_trabalhados: [] as string[],
  tags: [] as string[],
  categoria: "ambos" as "academia" | "calistenia" | "ambos",
};

// --- HELPER: Slugify (Gera value a partir do label) ---
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w-]+/g, "")
    .replace(/__+/g, "_")
    .replace(/^_+/, "")
    .replace(/_+$/, "");
};

// --- SUBCOMPONENTE: MODAL DE GERENCIAMENTO DE TAXONOMIA ---
const TaxonomyManagerModal = ({
  isOpen,
  onClose,
  type,
  items,
  onRefresh,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "musculo" | "tag";
  items: ExerciseTaxonomy[];
  onRefresh: () => void;
}) => {
  const [localItems, setLocalItems] = useState<ExerciseTaxonomy[]>(items);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ label: "", value: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza quando abre ou quando a lista pai muda
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ label: "", value: "" });
    setError(null);
  };

  const handleLabelChange = (val: string) => {
    // Se não estiver editando um item existente (ou se quiser auto-slug), gera o value
    // Aqui geramos o value automaticamente apenas na criação para facilitar
    if (!editingId) {
      setFormData({ label: val, value: slugify(val) });
    } else {
      setFormData((prev) => ({ ...prev, label: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: Partial<ExerciseTaxonomy> = {
        id: editingId ?? undefined, // Se tiver ID é update, senão insert
        tipo: type,
        label: formData.label,
        value: formData.value,
        ordem: 0,
        is_active: true,
      };

      const data = editingId
        ? await ManageExerciseMetadata.put(payload)
        : await ManageExerciseMetadata.post(payload);

      if (!data.success) throw new Error(data.message || "Erro ao salvar");

      await onRefresh(); // Recarrega dados no pai
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza? Isso pode afetar exercícios existentes."))
      return;
    setLoading(true);
    try {
      const data = await ManageExerciseMetadata.delete(id);
      if (!data.success) throw new Error("Erro ao deletar");
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir item.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: ExerciseTaxonomy) => {
    setEditingId(item.id);
    setFormData({ label: item.label, value: item.value });
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 capitalize">
            {type === "musculo" ? <LuScan /> : <LuTag />}
            Gerenciar {type === "musculo" ? "Músculos" : "Tags"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-500"
          >
            <LuX />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50">
          {localItems.length === 0 && (
            <p className="text-center text-gray-400 text-sm">
              Nenhum item cadastrado.
            </p>
          )}

          {localItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 bg-white rounded-xl border shadow-sm transition-all ${
                editingId === item.id
                  ? "ring-2 ring-indigo-500 border-transparent"
                  : "border-gray-200"
              }`}
            >
              <div>
                <p className="font-bold text-sm text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 font-mono">{item.value}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Editar"
                >
                  <LuPencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Excluir"
                >
                  <LuTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Formulário */}
        <div className="p-4 border-t bg-white rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nome (Label)
                </label>
                <input
                  value={formData.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Peitoral Superior"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Valor (ID único)
                </label>
                <input
                  value={formData.value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, value: e.target.value }))
                  }
                  className="w-full p-2 border rounded-lg text-sm bg-gray-50 font-mono text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: peitoral_sup"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <LuLoaderCircle className="animate-spin w-4 h-4" />
                ) : editingId ? (
                  <LuSave className="w-4 h-4" />
                ) : (
                  <LuPlus className="w-4 h-4" />
                )}
                {editingId ? "Salvar Alteração" : "Adicionar Novo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

const getEmbedUrl = (url: string) => {
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

export default function AdminExerciseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [form, setForm] = useState(initialFormState);
  const [availableMuscles, setAvailableMuscles] = useState<ExerciseTaxonomy[]>(
    []
  );
  const [availableTags, setAvailableTags] = useState<ExerciseTaxonomy[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado do Modal de Gerenciamento
  const [taxonomyModal, setTaxonomyModal] = useState<{
    isOpen: boolean;
    type: "musculo" | "tag";
  }>({
    isOpen: false,
    type: "musculo",
  });

  // Função para recarregar metadados (usada pelo modal e init)
  const fetchMetadata = async () => {
    try {
      const metadata = await ManageExerciseMetadata.get();
      setAvailableMuscles(metadata.musculos);
      setAvailableTags(metadata.tags);
    } catch (err) {
      console.error("Erro ao carregar metadados:", err);
    }
  };

  // --- CARREGAR DADOS ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchMetadata(); // Carrega metadados

        if (isEditMode) {
          const exercise = await ManageExercises.getById(Number(id));
          if (exercise) {
            setForm({
              nome: exercise.nome,
              descricao: exercise.descricao || "",
              link_video: exercise.link_video || "",
              thumb_url: exercise.thumb_url || "",
              musculos_trabalhados: Array.isArray(exercise.musculos_trabalhados)
                ? exercise.musculos_trabalhados
                : [],
              tags: Array.isArray(exercise.tags) ? exercise.tags : [],
              categoria: exercise.categoria || "ambos",
            });
          } else {
            setError("Exercício não encontrado.");
          }
        }
      } catch (err: any) {
        console.error(err);
        setError("Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [id, isEditMode]);

  // --- HANDLERS ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSelection = (
    field: "musculos_trabalhados" | "tags",
    itemValue: string
  ) => {
    setForm((prev) => {
      const list = prev[field];
      const newList = list.includes(itemValue)
        ? list.filter((i) => i !== itemValue)
        : [...list, itemValue];
      return { ...prev, [field]: newList };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      ...form,
      ...(isEditMode && { exercise_id: Number(id) }),
    };

    try {
      const data = isEditMode
        ? await ManageExercises.put(payload)
        : await ManageExercises.post(payload);

      // Check for success and if there's an error message in the response
      if (!data.success || (data as any).error)
        throw new Error((data as any).error || "Erro ao salvar.");

      navigate("/admin/exercicios");
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

  const embedUrl = getEmbedUrl(form.link_video);

  const categorias = [
    { id: "academia", label: "Academia", icon: LuBuilding2 },
    { id: "calistenia", label: "Calistenia/Casa", icon: LuHome },
    { id: "ambos", label: "Híbrido (Ambos)", icon: LuLayers },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* MODAL DE GERENCIAMENTO */}
      <AnimatePresence>
        {taxonomyModal.isOpen && (
          <TaxonomyManagerModal
            isOpen={taxonomyModal.isOpen}
            type={taxonomyModal.type}
            items={
              taxonomyModal.type === "musculo"
                ? availableMuscles
                : availableTags
            }
            onClose={() =>
              setTaxonomyModal((prev) => ({ ...prev, isOpen: false }))
            }
            onRefresh={fetchMetadata}
          />
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
            <LuArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 hidden sm:block">
              <LuDumbbell className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">
              {isEditMode ? "Editar Exercício" : "Novo Exercício"}
            </h1>
          </div>
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
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                <LuAlignLeft className="text-gray-400" /> Informações
              </h2>

              {/* SELETOR DE CATEGORIA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria Principal
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {categorias.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = form.categoria === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, categoria: cat.id }))
                        }
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mb-1 ${
                            isSelected ? "stroke-[2.5px]" : ""
                          }`}
                        />
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? "text-indigo-900" : ""
                          }`}
                        >
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Exercício *
                </label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  placeholder="Ex: Supino Reto"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição / Instruções
                </label>
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Explique como executar o movimento corretamente..."
                />
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                <LuImage className="text-gray-400" /> Mídia
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex gap-2 items-center">
                    <LuYoutube className="text-red-500" /> Link do YouTube
                  </label>
                  <input
                    name="link_video"
                    value={form.link_video}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="https://youtube.com..."
                  />
                  <div className="mt-3 rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center border border-gray-200">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                        title="Preview"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">Sem vídeo</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex gap-2 items-center">
                    <LuImage className="text-blue-500" /> URL da Thumbnail
                  </label>
                  <input
                    name="thumb_url"
                    value={form.thumb_url}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="https://imagem.com/thumb.jpg"
                  />
                  <div className="mt-3 rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center border border-gray-200 relative">
                    {form.thumb_url ? (
                      <img
                        src={form.thumb_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : (
                      <span className="text-xs text-gray-400">Sem imagem</span>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA */}
          <div className="space-y-6">
            {/* Músculos */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="border-b pb-3 mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <LuScan className="text-gray-400" /> Músculos Alvo
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setTaxonomyModal({ isOpen: true, type: "musculo" })
                  }
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Gerenciar Músculos"
                >
                  <LuSettings className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableMuscles.map((musculo) => {
                  const isSelected = form.musculos_trabalhados.includes(
                    musculo.value
                  );
                  return (
                    <button
                      key={musculo.value}
                      type="button"
                      onClick={() =>
                        toggleSelection("musculos_trabalhados", musculo.value)
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 capitalize ${
                        isSelected
                          ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {isSelected && <LuCheck className="w-3 h-3" />}{" "}
                      {musculo.label}
                    </button>
                  );
                })}
                {availableMuscles.length === 0 && (
                  <p className="text-xs text-gray-400 w-full text-center">
                    Nenhum músculo cadastrado.
                  </p>
                )}
              </div>
            </section>

            {/* Tags */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="border-b pb-3 mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <LuTag className="text-gray-400" /> Tags
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setTaxonomyModal({ isOpen: true, type: "tag" })
                  }
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Gerenciar Tags"
                >
                  <LuSettings className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = form.tags.includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => toggleSelection("tags", tag.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-teal-100 text-teal-700 border-teal-200"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {isSelected && <LuCheck className="w-3 h-3" />}{" "}
                      {tag.label}
                    </button>
                  );
                })}
                {availableTags.length === 0 && (
                  <p className="text-xs text-gray-400 w-full text-center">
                    Nenhuma tag cadastrada.
                  </p>
                )}
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
