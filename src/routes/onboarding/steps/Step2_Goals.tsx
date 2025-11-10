import { motion } from "framer-motion";
import { useOnboarding } from "../../../context/OnboardingContext";
import type {
  DiaSemana,
  NivelAtividade,
  Objetivo,
} from "../../../types/onboarding";
import { LuMoon } from "react-icons/lu";
import { GrRun } from "react-icons/gr";

const diasSemana: { label: string; value: DiaSemana }[] = [
  { label: "Dom", value: "DOM" },
  { label: "Seg", value: "SEG" },
  { label: "Ter", value: "TER" },
  { label: "Qua", value: "QUA" },
  { label: "Qui", value: "QUI" },
  { label: "Sex", value: "SEX" },
  { label: "Sáb", value: "SAB" },
];

const activityLevels = [
  { value: "sedentario", label: "Sedentário", num: 1 },
  { value: "leve", label: "Leve", num: 2 },
  { value: "moderado", label: "Moderado", num: 3 },
  { value: "ativo", label: "Ativo", num: 4 },
  { value: "muito_ativo", label: "Muito Ativo", num: 5 },
];
const objetivos = [
  { value: "perder_peso", label: "Perder Peso" },
  { value: "manter_peso", label: "Definir" },
  { value: "ganhar_massa", label: "Ganhar Massa" },
];

export default function Step2_Goals() {
  const { onboardingData, updateOnboardingData } = useOnboarding();

  const handleObjetivoClick = (value: Objetivo) => {
    updateOnboardingData({
      goals: {
        ...onboardingData.goals,
        objetivo_atual: value,
      },
    });
  };

  const currentLevel = activityLevels.find(
    (lvl) => lvl.value === onboardingData.goals.nivel_atividade
  );
  const currentSliderValue = currentLevel ? currentLevel.num : 3;
  const currentLabel = currentLevel ? currentLevel.label : "Moderado";
  const toggleDia = (dia: DiaSemana) => {
    const { dias_treino } = onboardingData.goals;
    const alreadySelected = dias_treino.includes(dia);
    const newList = alreadySelected
      ? dias_treino.filter((d) => d !== dia)
      : [...dias_treino, dia];

    updateOnboardingData({
      goals: {
        ...onboardingData.goals, // Mantém os outros valores
        dias_treino: newList, // Atualiza os dias
      },
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSliderValue = e.target.valueAsNumber;
    const newLevel = activityLevels.find((lvl) => lvl.num === newSliderValue);

    if (newLevel) {
      updateOnboardingData({
        goals: {
          ...onboardingData.goals,
          // Armazena a *string* (ex: "moderado") no contexto
          nivel_atividade: newLevel.value as NivelAtividade,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Objetivo Atual */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-gray-700 font-medium mb-2">
          Qual é o seu objetivo atual?
        </label>

        {/* Substituímos o 'select' por este 'div' */}
        <div className="grid grid-cols-3 gap-2">
          {objetivos.map((obj) => {
            const ativo = onboardingData.goals.objetivo_atual === obj.value;
            return (
              <motion.button
                key={obj.value}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => handleObjetivoClick(obj.value as Objetivo)}
                className={`py-3 rounded-xl border text-sm transition-all duration-200 ${
                  ativo
                    ? "bg-[#FCC3D2] text-gray-800 border-transparent shadow-sm"
                    : "bg-white/70 border-gray-300 text-gray-600 hover:bg-[#A8F3DC]/50"
                }`}
              >
                {obj.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Nível de Atividade */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full my-10" // Garante que o container ocupe o espaço
      >
        <label className="block text-gray-700 font-medium mb-2">
          Como você descreveria seu nível de atividade física?
        </label>

        {/* 5. Container com Ícones + Slider */}
        <div className="flex items-center gap-3">
          <LuMoon className="w-6 h-6 text-gray-500" title="Sedentário" />
          <input
            type="range"
            min={1} // Mínimo 1
            max={5} // Máximo 5 (baseado no nosso array)
            step={1} // Mover 1 por 1
            name="nivel_atividade"
            value={currentSliderValue}
            onChange={handleSliderChange}
            // 6. Estilização do Slider com Tailwind
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                       accent-[#FCC3D2] dark:accent-[#A8F3DC] 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCC3D2]"
          />
          <GrRun className="w-7 h-7 text-gray-600" title="Muito Ativo" />
        </div>

        {/* 7. Rótulo Animado */}
        <div className="text-center mt-3 h-8">
          <motion.span
            // A key é o texto, que faz a animação disparar na mudança
            key={currentLabel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="font-medium text-lg text-gray-800"
          >
            {currentLabel}
          </motion.span>
        </div>
      </motion.div>

      {/* Dias de Treino */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-gray-700 font-medium mb-2">
          Quais dias você pretende treinar?
        </label>

        <div className="grid grid-cols-4 gap-2">
          {diasSemana.map((dia) => {
            const ativo = onboardingData.goals.dias_treino.includes(dia.value);
            return (
              <motion.button
                key={dia.value}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleDia(dia.value)}
                className={`py-2 rounded-xl border text-sm transition-all duration-200 ${
                  ativo
                    ? "bg-[#FCC3D2] text-gray-800 border-transparent shadow-sm"
                    : "bg-white/70 border-gray-300 text-gray-600 hover:bg-[#A8F3DC]/50"
                }`}
              >
                {dia.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
