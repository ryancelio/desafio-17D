import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState } from "react";
import { LuX, LuPlus, LuPencil } from "react-icons/lu";
import type { DailyConsumption } from "../../../../types/models";
import type { AddConsumptionRequest } from "../../../../types/api-types";

interface AddNutritionModalProps {
  onClose: () => void;
  // Certifique-se que sua interface DailyConsumption já tenha carboidratos_g e gorduras_g
  currentValues: DailyConsumption;
  onSave: (data: AddConsumptionRequest, mode: "add" | "set") => void;
}

const AddNutritionModal: React.FC<AddNutritionModalProps> = ({
  onClose,
  currentValues,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<"add" | "edit">("add");

  // Estado para aba ADICIONAR (começa zerado)
  const [addForm, setAddForm] = useState({
    agua_l: "",
    carboidratos_g: "",
    proteinas_g: "",
    gorduras_g: "",
    fibras_g: "",
    calorias_kcal: "",
  });

  // Estado para aba EDITAR (começa com os valores atuais)
  // Usamos '|| 0' para garantir que não quebre se o campo for undefined no BD antigo
  const [editForm, setEditForm] = useState({
    agua_l: currentValues.agua_l.toString(),
    carboidratos_g: (currentValues.carboidratos_g || 0).toString(),
    proteinas_g: currentValues.proteinas_g.toString(),
    gorduras_g: (currentValues.gorduras_g || 0).toString(),
    fibras_g: currentValues.fibras_g.toString(),
    calorias_kcal: currentValues.calorias_kcal.toString(),
  });

  const handleInputChange = (
    field: keyof typeof addForm,
    value: string,
    mode: "add" | "edit"
  ) => {
    if (mode === "add") {
      setAddForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setEditForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sourceForm = activeTab === "add" ? addForm : editForm;

    // Prepara o objeto payload
    const payload = {
      agua_l: parseFloat(sourceForm.agua_l.replace(",", ".") || "0"),
      carboidratos_g: parseFloat(sourceForm.carboidratos_g || "0"),
      proteinas_g: parseFloat(sourceForm.proteinas_g || "0"),
      gorduras_g: parseFloat(sourceForm.gorduras_g || "0"),
      fibras_g: parseFloat(sourceForm.fibras_g || "0"),
      calorias_kcal: parseFloat(sourceForm.calorias_kcal || "0"),
    };

    onSave(payload, activeTab === "add" ? "add" : "set");
    onClose();
  };

  // Variantes de Animação
  const modalAnimation = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  };

  const tabContentVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center h-full justify-center"
      onClick={onClose}
    >
      <motion.div
        variants={modalAnimation}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative bg-gray-50 rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Mobile */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full sm:hidden z-10" />

        <div className="p-6 pt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Gerenciar Consumo
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <LuX className="w-6 h-6" />
            </button>
          </div>

          {/* Abas */}
          <div className="flex p-1 bg-gray-200 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab("add")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "add"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LuPlus className="w-4 h-4" /> Adicionar
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "edit"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LuPencil className="w-4 h-4" /> Editar Total
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                {/* Água */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Hidratação
                  </label>
                  <div className="mt-1">
                    <label className="text-sm font-medium text-gray-700">
                      Água (Litros)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder={activeTab === "add" ? "Ex: 0.5" : ""}
                      value={
                        activeTab === "add" ? addForm.agua_l : editForm.agua_l
                      }
                      onChange={(e) =>
                        handleInputChange("agua_l", e.target.value, activeTab)
                      }
                      className="mt-1 w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-pasPink focus:ring-1 focus:ring-pasPink outline-none transition"
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Macros (Grid de 3) */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Macronutrientes
                  </label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {/* Carboidratos */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Carboidratos
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder={activeTab === "add" ? "Ex: 150" : ""}
                          value={
                            activeTab === "add"
                              ? addForm.carboidratos_g
                              : editForm.carboidratos_g
                          }
                          onChange={(e) =>
                            handleInputChange(
                              "carboidratos_g",
                              e.target.value,
                              activeTab
                            )
                          }
                          className="mt-1 w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                        />
                        <span className="absolute right-3 top-4 text-xs text-gray-400">
                          g
                        </span>
                      </div>
                    </div>

                    {/* Proteínas */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Proteínas
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder={activeTab === "add" ? "Ex: 20" : ""}
                          value={
                            activeTab === "add"
                              ? addForm.proteinas_g
                              : editForm.proteinas_g
                          }
                          onChange={(e) =>
                            handleInputChange(
                              "proteinas_g",
                              e.target.value,
                              activeTab
                            )
                          }
                          className="mt-1 w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
                        />
                        <span className="absolute right-3 top-4 text-xs text-gray-400">
                          g
                        </span>
                      </div>
                    </div>

                    {/* Gorduras */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Gorduras
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder={activeTab === "add" ? "Ex: 10" : ""}
                          value={
                            activeTab === "add"
                              ? addForm.gorduras_g
                              : editForm.gorduras_g
                          }
                          onChange={(e) =>
                            handleInputChange(
                              "gorduras_g",
                              e.target.value,
                              activeTab
                            )
                          }
                          className="mt-1 w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                        />
                        <span className="absolute right-3 top-4 text-xs text-gray-400">
                          g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outros (Grid de 2) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Fibras
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={activeTab === "add" ? "Ex: 5" : ""}
                        value={
                          activeTab === "add"
                            ? addForm.fibras_g
                            : editForm.fibras_g
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "fibras_g",
                            e.target.value,
                            activeTab
                          )
                        }
                        className="mt-1 w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
                      />
                      <span className="absolute right-3 top-4 text-xs text-gray-400">
                        g
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Calorias
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={activeTab === "add" ? "Ex: 300" : ""}
                        value={
                          activeTab === "add"
                            ? addForm.calorias_kcal
                            : editForm.calorias_kcal
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "calorias_kcal",
                            e.target.value,
                            activeTab
                          )
                        }
                        className="mt-1 w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
                      />
                      <span className="absolute right-3 top-4 text-xs text-gray-400">
                        kcal
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full font-bold py-4 rounded-xl text-white transition-all shadow-lg active:scale-95 ${
                  activeTab === "add"
                    ? "bg-gray-900 hover:bg-black"
                    : "bg-pasPink text-gray-900 hover:bg-pasPink/90"
                }`}
              >
                {activeTab === "add" ? "Adicionar ao Dia" : "Salvar Alterações"}
              </button>

              <p className="text-xs text-center text-gray-400 mt-3">
                {activeTab === "add"
                  ? "Os valores serão somados ao seu total diário."
                  : "Isso substituirá o total diário pelos valores acima."}
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddNutritionModal;
