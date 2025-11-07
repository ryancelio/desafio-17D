import { motion } from "framer-motion";
import { useOnboarding } from "../../../context/OnboardingContext";

// --- (Animação) ---
const stepAnimationVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};
const stepTransition = { duration: 0.4, ease: "easeInOut" };

// ⬇️⬇️ DADOS RESTAURADOS AQUI ⬇️⬇️
const objectives = [
  { value: "perder_peso", label: "Perder Peso" },
  { value: "manter_peso", label: "Manter Peso" },
  { value: "ganhar_massa", label: "Ganhar Massa Muscular" },
];

const activityLevels = [
  {
    value: "sedentario",
    label: "Sedentário",
    description: "Pouco ou nenhum exercício, trabalho de escritório.",
  },
  {
    value: "leve",
    label: "Leve",
    description: "Exercício leve 1-3 dias por semana.",
  },
  {
    value: "moderado",
    label: "Moderado",
    description: "Exercício moderado 3-5 dias por semana.",
  },
  {
    value: "ativo",
    label: "Ativo",
    description: "Exercício pesado 6-7 dias por semana.",
  },
  {
    value: "muito_ativo",
    label: "Muito Ativo",
    description: "Exercício muito pesado & trabalho físico.",
  },
];

const days = [
  { value: "DOM", label: "D" },
  { value: "SEG", label: "S" },
  { value: "TER", label: "T" },
  { value: "QUA", label: "Q" },
  { value: "QUI", label: "Q" },
  { value: "SEX", label: "S" },
  { value: "SAB", label: "S" },
];
// ⬆️⬆️ FIM DOS DADOS RESTAURADOS ⬆️⬆️

export default function Step2_Goals() {
  const { formData, setFormData } = useOnboarding();
  const { profile } = formData;

  // --- (Handlers - Lógica inalterada) ---
  const handleSingleSelect = (
    field: "objetivo_atual" | "nivel_atividade",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }));
  };

  const handleDayToggle = (day: string) => {
    const currentDays = profile.dias_treino;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    setFormData((prev) => ({
      ...prev,
      profile: { ...prev.profile, dias_treino: newDays },
    }));
  };

  return (
    <motion.div
      variants={stepAnimationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={stepTransition}
      className="flex flex-col gap-6" // StepWrapper
    >
      <h1 className="text-3xl font-bold text-gray-800 text-center">
        Quais são seus objetivos?
      </h1>

      {/* --- 1. OBJETIVO ATUAL --- */}
      <h2 className="text-lg font-semibold text-gray-800 mt-4 -mb-2">
        Meu objetivo principal é:
      </h2>
      {/* CardGrid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {objectives.map((obj) => (
          <div
            key={obj.value}
            onClick={() => handleSingleSelect("objetivo_atual", obj.value)}
            className={`
              p-5 rounded-2xl border-2 text-center cursor-pointer transition-all duration-200
              ${
                profile.objetivo_atual === obj.value
                  ? "border-pastel-mint bg-pastel-mint/10 ring-2 ring-pastel-mint/50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }
            `}
          >
            <h3 className="text-base font-semibold text-gray-800">
              {obj.label}
            </h3>
          </div>
        ))}
      </div>

      {/* --- 2. NÍVEL DE ATIVIDADE --- */}
      <h2 className="text-lg font-semibold text-gray-800 mt-4 -mb-2">
        Meu nível de atividade:
      </h2>
      {/* CardGrid */}
      <div className="grid grid-cols-1 gap-4">
        {activityLevels.map((level) => (
          <div
            key={level.value}
            onClick={() => handleSingleSelect("nivel_atividade", level.value)}
            className={`
              p-5 rounded-2xl border-2 text-center cursor-pointer transition-all duration-200
              ${
                profile.nivel_atividade === level.value
                  ? "border-pastel-mint bg-pastel-mint/10 ring-2 ring-pastel-mint/50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }
            `}
          >
            <h3 className="text-base font-semibold text-gray-800">
              {level.label}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{level.description}</p>
          </div>
        ))}
      </div>

      {/* --- 3. DIAS DE TREINO --- */}
      <h2 className="text-lg font-semibold text-gray-800 mt-4 -mb-2">
        Quais dias você pretende treinar?
      </h2>
      {/* DaySelectorContainer */}
      <div className="flex justify-between gap-1 sm:gap-2">
        {days.map((day) => (
          <button
            key={day.value}
            type="button" // Previne envio do formulário
            onClick={() => handleDayToggle(day.value)}
            className={`
              h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 font-bold cursor-pointer transition-all duration-200
              ${
                profile.dias_treino.includes(day.value)
                  ? "border-pastel-pink bg-pastel-pink text-white"
                  : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
              }
            `}
          >
            {day.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
