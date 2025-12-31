import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StepProps } from "../OnboardingWizard";
import {
  LuUtensils,
  LuActivity,
  LuPlus,
  LuX,
  LuSearch,
  LuCircleAlert,
  LuCheck,
} from "react-icons/lu";

// Mapeamento de opções comuns para facilitar o clique (UX)
const COMMON_OPTIONS = {
  diet: [
    { label: "Sem Glúten", value: "Glúten", type: "intolerancia" },
    { label: "Sem Lactose", value: "Lactose", type: "intolerancia" },
    { label: "Vegano", value: "Vegano", type: "preferencia" },
    { label: "Vegetariano", value: "Vegetariano", type: "preferencia" },
    { label: "Alergia a Ovo", value: "Ovo", type: "alergia" },
    { label: "Alergia a Amendoim", value: "Amendoim", type: "alergia" },
    {
      label: "Alergia a Frutos do Mar",
      value: "Frutos do Mar",
      type: "alergia",
    },
    { label: "Low Carb", value: "Low Carb", type: "preferencia" },
  ],
  physical: [
    {
      label: "Dor no Joelho",
      value: "Lesão no Joelho",
      type: "limitacao_fisica",
    },
    { label: "Dor na Lombar", value: "Dor Lombar", type: "limitacao_fisica" },
    { label: "Ombro", value: "Lesão no Ombro", type: "limitacao_fisica" },
    {
      label: "Hernia de Disco",
      value: "Hernia de Disco",
      type: "limitacao_fisica",
    },
    { label: "Asma", value: "Asma", type: "limitacao_fisica" },
    { label: "Gravidez", value: "Gestante", type: "limitacao_fisica" },
  ],
} as const;

export const PreferenciasStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  const [activeTab, setActiveTab] = useState<"diet" | "physical">("diet");
  const [customInput, setCustomInput] = useState("");

  // Estado local para o tipo de input manual (quando o usuário digita)
  const [customType, setCustomType] = useState<string>("preferencia");

  // A etapa é válida mesmo vazia (usuário pode não ter restrições)
  useEffect(() => {
    setStepvalid(true);
  }, [setStepvalid]);

  const currentPrefs = onboardingData.preferences || [];

  // Adicionar preferência
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addPreference = (value: string, type: any) => {
    // Evita duplicatas
    if (
      currentPrefs.some((p) => p.valor === value && p.tipo_restricao === type)
    )
      return;

    const newPref = {
      id: crypto.randomUUID(), // ID temporário para o front
      tipo_restricao: type,
      valor: value,
    };

    updateOnboardingData({
      preferences: [...currentPrefs, newPref],
    });
  };

  // Remover preferência
  const removePreference = (id: string | number) => {
    updateOnboardingData({
      preferences: currentPrefs.filter((p) => p.id !== id),
    });
  };

  // Handler para input manual
  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    // Se estiver na aba físico, força o tipo
    const typeToUse =
      activeTab === "physical" ? "limitacao_fisica" : customType;

    addPreference(customInput, typeToUse);
    setCustomInput("");
  };

  // Verifica se uma opção comum já está selecionada
  const isSelected = (value: string) => {
    return currentPrefs.some((p) => p.valor === value);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="text-center px-4 mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
          Alguma restrição ou <br /> preferência?
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Isso ajuda nossa IA a montar treinos seguros e dietas que você
          realmente goste.
        </p>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex bg-gray-100 p-1 rounded-xl mx-4 mb-6 relative">
        <div className="grid grid-cols-2 w-full relative z-10">
          <button
            onClick={() => setActiveTab("diet")}
            className={`py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === "diet"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LuUtensils className="w-4 h-4" /> Nutrição
          </button>
          <button
            onClick={() => setActiveTab("physical")}
            className={`py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === "physical"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LuActivity className="w-4 h-4" /> Físico
          </button>
        </div>

        {/* Background Animado da Tab */}
        <motion.div
          className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm"
          initial={false}
          animate={{
            left: activeTab === "diet" ? "4px" : "50%",
            width: "calc(50% - 4px)",
            x: activeTab === "diet" ? 0 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Área de Conteúdo Scrollável */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 scrollbar-hide">
        {/* Lista de Opções Comuns (Tags) */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            {activeTab === "diet" ? "Mais Comuns" : "Lesões & Limitações"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {COMMON_OPTIONS[activeTab].map((option) => {
              const active = isSelected(option.value);
              return (
                <motion.button
                  key={option.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    active
                      ? removePreference(
                          currentPrefs.find((p) => p.valor === option.value)
                            ?.id || ""
                        )
                      : addPreference(option.value, option.type)
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
                    active
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
                  }`}
                >
                  {option.label}
                  {active ? (
                    <LuCheck className="w-3 h-3" />
                  ) : (
                    <LuPlus className="w-3 h-3" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Input Manual */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Adicionar Outro
          </h3>

          <form onSubmit={handleCustomAdd} className="flex flex-col gap-3">
            <div className="relative">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={
                  activeTab === "diet"
                    ? "Ex: Alergia a Kiwi, Não gosto de Peixe..."
                    : "Ex: Cirurgia no joelho, Tendinite..."
                }
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
              />
            </div>

            <div className="flex gap-2">
              {/* Seletor de Tipo (Apenas na aba Diet) */}
              {activeTab === "diet" && (
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white text-gray-600 focus:outline-none focus:border-indigo-500"
                >
                  <option value="preferencia">Preferência</option>
                  <option value="alergia">Alergia</option>
                  <option value="intolerancia">Intolerância</option>
                </select>
              )}

              <button
                type="submit"
                disabled={!customInput.trim()}
                className="flex-1 bg-gray-900 text-white rounded-lg text-xs font-bold py-2 disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Selecionados (Resumo) */}
        <AnimatePresence>
          {currentPrefs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-gray-100 pt-4"
            >
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                Selecionados{" "}
                <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[10px]">
                  {currentPrefs.length}
                </span>
              </h3>
              <div className="space-y-2">
                {currentPrefs.map((pref) => (
                  <motion.div
                    key={pref.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          pref.tipo_restricao === "limitacao_fisica"
                            ? "bg-rose-50 text-rose-500"
                            : pref.tipo_restricao === "alergia"
                            ? "bg-orange-50 text-orange-500"
                            : "bg-emerald-50 text-emerald-500"
                        }`}
                      >
                        {pref.tipo_restricao === "limitacao_fisica" ? (
                          <LuActivity size={16} />
                        ) : pref.tipo_restricao === "alergia" ? (
                          <LuCircleAlert size={16} />
                        ) : (
                          <LuUtensils size={16} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {pref.valor}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                          {pref.tipo_restricao.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removePreference(pref.id)}
                      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <LuX size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PreferenciasStep;
