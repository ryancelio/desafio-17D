import { AnimatePresence, motion } from "framer-motion";
import { LuTrash2, LuPlus, LuCircleAlert } from "react-icons/lu";
import { useOnboarding } from "../../../context/OnboardingContext";
import {
  step4PreferencesValidationSchema,
  type TipoRestricao,
} from "../../../types/onboarding.schema";
import { useEffect, useState } from "react";

const preferenciaOptions: { value: TipoRestricao; label: string }[] = [
  { value: "alergia", label: "Alergia" },
  { value: "intolerancia", label: "Intolerancia" },
  { value: "preferencia", label: "Preferencia" },
  { value: "limitacao_fisica", label: "Limitação Fisica" },
];

// Variantes para a animação da lista
const listItemVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, x: -50, scale: 0.9 },
};
type PreferenceField = "valor" | "tipo_restricao";

export default function Step4_Preferences() {
  const { onboardingData, updateOnboardingData, setStepValid } =
    useOnboarding();

  const { preferences } = onboardingData;

  // 2. Estados de Erro e Touched (usam ID do item como chave)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 3. Validação com Zod
  useEffect(() => {
    const result = step4PreferencesValidationSchema.safeParse(preferences);
    setStepValid(result.success);

    if (!result.success) {
      const newErrors: Record<string, string | undefined> = {};
      // Mapeia os erros para { id: "mensagem de erro" }
      for (const issue of result.error.issues) {
        const [index, field] = issue.path; // Ex: [0, "valor"]
        const itemId = preferences[index as number]?.id; // Pega o ID
        if (itemId && field === "valor") {
          newErrors[itemId] = issue.message;
        }
      }
      setErrors(newErrors);
    } else {
      setErrors({});
    }
  }, [preferences, setStepValid]);

  const handleBlur = (id: string, field: PreferenceField) => {
    // Usa "id.field" como chave, ex: "uuid-123.valor"
    const touchKey = `${id}.${field}`;
    setTouched((prev) => ({ ...prev, [touchKey]: true }));
  };

  const handleAddPreferencia = () => {
    updateOnboardingData({
      preferences: [
        ...onboardingData.preferences,
        { tipo_restricao: "alergia", valor: "", id: crypto.randomUUID() },
      ],
    });
  };

  // Atualiza o TIPO (select) de um item específico
  const handleTypeChange = (
    id: string,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newValue = e.target.value as TipoRestricao;
    const newPrefs = preferences.map((item) =>
      item.id === id ? { ...item, tipo_restricao: newValue } : item
    );
    updateOnboardingData({ preferences: newPrefs });
    handleBlur(id, "tipo_restricao");
  };

  // Atualiza o VALOR (input) de um item específico
  const handleValueChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    const newPrefs = preferences.map((item) =>
      item.id === id ? { ...item, valor: newValue } : item
    );
    updateOnboardingData({ preferences: newPrefs });
  };

  // Remove um item específico
  const handleRemovePreference = (idToRemove: string) => {
    const newPrefs = preferences.filter((item) => item.id !== idToRemove);
    updateOnboardingData({ preferences: newPrefs });
    // (Opcional) Limpa o erro e o touched desse item
    setErrors((prev) => {
      const newState = { ...prev };
      delete newState[idToRemove];
      return newState;
    });
    setTouched((prev) => {
      const newState = { ...prev };
      delete newState[`${idToRemove}.valor`];
      delete newState[`${idToRemove}.tipo_restricao`];
      return newState;
    });
  };

  function handleInputPlaceholder(tipo_restricao: TipoRestricao): string {
    switch (tipo_restricao) {
      case "alergia":
        return "Ex: Amendoim, Glúten";
      case "intolerancia":
        return "Ex: Lactose";
      case "preferencia":
        return "Ex: Vegetariano, Vegano";
      case "limitacao_fisica":
        return "Ex: Problema no ombro, no joelho";
    }
  }

  // 5. Função de renderizar erro (verifica por ID)
  const renderError = (id: string) => {
    const touchKey = `${id}.valor`;
    const error = errors[id];
    if (!touched[touchKey] || !error) return null;

    return (
      <AnimatePresence>
        <motion.p
          className="flex items-center gap-1 text-sm text-red-600 mt-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <LuCircleAlert className="w-4 h-4" />
          {error}
        </motion.p>
      </AnimatePresence>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col h-full"
    >
      <h1 className="text-xl font-semibold text-gray-800">
        Restrições ou Preferências
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Nos informe sobre alergias, intolerâncias ou limitações para
        personalizarmos sua experiência.
      </p>

      {/* --- 2. Lista Animada --- */}
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-2">
        <AnimatePresence>
          {/* 3. Mensagem de Estado Vazio */}
          {onboardingData.preferences.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-400 italic mt-6"
            >
              <p>Nenhuma preferência adicionada.</p>
            </motion.div>
          )}

          {onboardingData.preferences.map((preferencia) => (
            <motion.div
              key={preferencia.id}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex flex-wrap items-center gap-2"
            >
              {/* --- Select (Corrigido) --- */}
              <select
                value={preferencia.tipo_restricao}
                onChange={(e) => handleTypeChange(preferencia.id, e)}
                onBlur={() => handleBlur(preferencia.id, "tipo_restricao")}
                className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A8F3DC] focus:outline-none text-sm"
              >
                {preferenciaOptions.map((preferenciaOpt) => (
                  <option
                    key={preferenciaOpt.value}
                    value={preferenciaOpt.value}
                  >
                    {preferenciaOpt.label}
                  </option>
                ))}
              </select>

              {/* --- Input (Corrigido) --- */}
              <input
                type="text"
                placeholder={handleInputPlaceholder(preferencia.tipo_restricao)}
                value={preferencia.valor}
                onChange={(e) => handleValueChange(preferencia.id, e)}
                onBlur={() => handleBlur(preferencia.id, "valor")}
                className={`flex-1 w-full p-2 rounded-lg border focus:outline-none text-sm ${
                  touched[`${preferencia.id}.valor`] && errors[preferencia.id]
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300 focus:ring-2 focus:ring-[#A8F3DC]"
                }`}
              />

              {/* --- 4. Botão de Remover --- */}
              <motion.button
                type="button"
                onClick={() => handleRemovePreference(preferencia.id)}
                className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                whileTap={{ scale: 0.9 }}
                title="Remover"
              >
                <LuTrash2 className="w-5 h-5" />
              </motion.button>

              {/* 7. Renderiza o erro (fora do wrapper do input) */}
              <div className="w-full pl-36">
                {" "}
                {/* Alinha o erro com o input */}
                {renderError(preferencia.id)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- 5. Botão de Adicionar (Estilizado) --- */}
      <div className="flex w-full justify-end mt-4 pt-2 border-t border-gray-200">
        <motion.button
          className="flex items-center gap-2 font-medium text-gray-800 border border-black/30 hover:bg-[#A8F3DC]/60 active:brightness-110 px-4 py-2 bg-[#FCC3D2] rounded-4xl"
          type="button"
          onClick={handleAddPreferencia}
          whileTap={{ scale: 0.95 }}
        >
          <LuPlus className="w-5 h-5" />
          Adicionar
        </motion.button>
      </div>
    </motion.div>
  );
}
