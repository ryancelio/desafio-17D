import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState } from "react";
import {
  LuX,
  LuPlus,
  LuPencil,
  LuArrowUpFromLine,
  LuArrowDownToLine,
} from "react-icons/lu";
import type { DailyConsumption } from "../../../../types/models";
import type { AddConsumptionRequest } from "../../../../types/api-types";

interface AddNutritionModalProps {
  onClose: () => void;
  currentValues: DailyConsumption;
  onSave: (data: AddConsumptionRequest, mode: "add" | "set") => void;
}

// --- CSS para esconder os spinners (setinhas) do input number ---
const noSpinnerStyle = `
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
  input[type=number] {
    -moz-appearance: textfield;
  }
`;

// --- 1. MOVIDO PARA FORA DO COMPONENTE PRINCIPAL ---
// Agora ele aceita 'value' e 'onChange' diretamente, tornando-o um componente "burro" (controlado)
interface NutrientInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unit: string;
  placeholder: string;
  colorClass: string;
  targetType: "min" | "max" | "neutral";
}

const NutrientInput: React.FC<NutrientInputProps> = ({
  label,
  value,
  onChange,
  unit,
  placeholder,
  colorClass,
  targetType,
}) => {
  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>

        {/* Indicador de Tipo de Meta */}
        {targetType !== "neutral" && (
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide">
            {targetType === "min" ? (
              <span className="text-green-600 flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded">
                <LuArrowUpFromLine className="w-3 h-3" /> Mínimo
              </span>
            ) : (
              <span className="text-orange-600 flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded">
                <LuArrowDownToLine className="w-3 h-3" /> Limite
              </span>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full p-3 pr-10 bg-white border border-gray-200 rounded-xl outline-none transition shadow-sm ${colorClass} focus:ring-1`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const AddNutritionModal: React.FC<AddNutritionModalProps> = ({
  onClose,
  currentValues,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<"add" | "edit">("add");

  const [addForm, setAddForm] = useState({
    agua_l: "",
    carboidratos_g: "",
    proteinas_g: "",
    gorduras_g: "",
    fibras_g: "",
    calorias_kcal: "",
  });

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
    // Permite apenas números e um único ponto decimal
    const sanitized = value.replace(/[^0-9.]/g, "");

    if (mode === "add") {
      setAddForm((prev) => ({ ...prev, [field]: sanitized }));
    } else {
      setEditForm((prev) => ({ ...prev, [field]: sanitized }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceForm = activeTab === "add" ? addForm : editForm;

    const payload = {
      agua_l: parseFloat(sourceForm.agua_l || "0"),
      carboidratos_g: parseFloat(sourceForm.carboidratos_g || "0"),
      proteinas_g: parseFloat(sourceForm.proteinas_g || "0"),
      gorduras_g: parseFloat(sourceForm.gorduras_g || "0"),
      fibras_g: parseFloat(sourceForm.fibras_g || "0"),
      calorias_kcal: parseFloat(sourceForm.calorias_kcal || "0"),
    };

    onSave(payload, activeTab === "add" ? "add" : "set");
    onClose();
  };

  // Variantes Framer Motion
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

  // Helper para simplificar a passagem de props no render (agora que o componente está fora)
  const getValue = (field: keyof typeof addForm) =>
    activeTab === "add" ? addForm[field] : editForm[field];

  const getHandler =
    (field: keyof typeof addForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      handleInputChange(field, e.target.value, activeTab);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center h-full justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <style>{noSpinnerStyle}</style>

      <motion.div
        variants={modalAnimation}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative bg-gray-50 rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Mobile */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full sm:hidden z-10" />

        <div className="p-6 pt-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Gerenciar Consumo
              </h2>
              <p className="text-sm text-gray-500">Registre sua alimentação</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <LuX className="w-6 h-6" />
            </button>
          </div>

          {/* Abas */}
          <div className="flex p-1 bg-gray-200/80 rounded-xl mb-6">
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
              <LuPencil className="w-4 h-4" /> Definir Total
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Água */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Hidratação
                  </h4>
                  <NutrientInput
                    label="Água"
                    value={getValue("agua_l")}
                    onChange={getHandler("agua_l")}
                    unit="L"
                    placeholder={activeTab === "add" ? "Ex: 0.5" : ""}
                    colorClass="focus:border-blue-400 focus:ring-blue-400"
                    targetType="min"
                  />
                </div>

                <div className="h-px bg-gray-200/70" />

                {/* Macros */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Macronutrientes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <NutrientInput
                      label="Carboidratos"
                      value={getValue("carboidratos_g")}
                      onChange={getHandler("carboidratos_g")}
                      unit="g"
                      placeholder={activeTab === "add" ? "Ex: 150" : ""}
                      colorClass="focus:border-yellow-500 focus:ring-yellow-500"
                      targetType="max"
                    />
                    <NutrientInput
                      label="Proteínas"
                      value={getValue("proteinas_g")}
                      onChange={getHandler("proteinas_g")}
                      unit="g"
                      placeholder={activeTab === "add" ? "Ex: 30" : ""}
                      colorClass="focus:border-red-500 focus:ring-red-500"
                      targetType="min"
                    />
                    <NutrientInput
                      label="Gorduras"
                      value={getValue("gorduras_g")}
                      onChange={getHandler("gorduras_g")}
                      unit="g"
                      placeholder={activeTab === "add" ? "Ex: 15" : ""}
                      colorClass="focus:border-purple-500 focus:ring-purple-500"
                      targetType="max"
                    />
                  </div>
                </div>

                {/* Outros */}
                <div className="grid grid-cols-2 gap-4">
                  <NutrientInput
                    label="Fibras"
                    value={getValue("fibras_g")}
                    onChange={getHandler("fibras_g")}
                    unit="g"
                    placeholder={activeTab === "add" ? "Ex: 5" : ""}
                    colorClass="focus:border-green-500 focus:ring-green-500"
                    targetType="min"
                  />
                  <NutrientInput
                    label="Calorias"
                    value={getValue("calorias_kcal")}
                    onChange={getHandler("calorias_kcal")}
                    unit="kcal"
                    placeholder={activeTab === "add" ? "Ex: 400" : ""}
                    colorClass="focus:border-orange-500 focus:ring-orange-500"
                    targetType="max"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="pt-4 pb-2">
              <button
                type="submit"
                className={`w-full font-bold py-4 rounded-xl text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                  activeTab === "add"
                    ? "bg-gray-900 hover:bg-black shadow-gray-900/20"
                    : "bg-pasPink text-gray-900 hover:bg-pasPink/90 shadow-pasPink/30"
                }`}
              >
                {activeTab === "add" ? <LuPlus /> : <LuPencil />}
                {activeTab === "add" ? "Adicionar ao Dia" : "Salvar Alterações"}
              </button>

              <p className="text-xs text-center text-gray-400 mt-3">
                {activeTab === "add"
                  ? "Valores serão somados. Use para registrar refeições."
                  : "Valores irão substituir o total. Use para correções."}
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddNutritionModal;
