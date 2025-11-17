import { motion } from "framer-motion";
import React, { useMemo } from "react";
import type { StepProps } from "../OnboardingWizard";
import { LuGlassWater, LuLeaf, LuFish } from "react-icons/lu";

const DashboardPreviewStep: React.FC<StepProps> = ({ onboardingData }) => {
  const { measurements, personal } = onboardingData;

  const recommendations = useMemo(() => {
    const peso = Number(measurements.peso_kg) || 70; // Usa 70kg como padrão
    const sexo = personal.genero || "masculino";

    const agua = (peso * 35) / 1000; // 35ml por kg
    const proteina = peso * 1.8; // 1.8g por kg
    const fibra = sexo === "feminino" ? 25 : 38; // Recomendação por sexo

    return [
      {
        name: "Água",
        value: agua.toFixed(1),
        unit: "litros",
        benefit:
          "Essencial para a hidratação, função celular e regulação da temperatura corporal.",
      },
      {
        name: "Proteína",
        value: proteina.toFixed(0),
        unit: "gramas",
        benefit:
          "Fundamental para a construção e reparo de músculos, tecidos e produção de enzimas.",
      },
      {
        name: "Fibras",
        value: fibra.toFixed(0),
        unit: "gramas",
        benefit:
          "Melhora a saúde digestiva, promove a saciedade e ajuda a regular o açúcar no sangue.",
      },
    ];
  }, [measurements, personal]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-6 w-full"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Seu Plano Inicial
        </h1>
        <p className="text-gray-500 text-sm">
          Com base em seus dados, aqui estão suas metas diárias iniciais:
        </p>
      </motion.div>

      <motion.div variants={containerVariants} className="flex flex-col gap-4">
        {/* Card de Água */}
        <motion.div
          variants={itemVariants}
          className="bg-blue-500 text-white p-5 rounded-2xl shadow-lg flex items-center gap-4 relative overflow-hidden"
        >
          <LuGlassWater className="absolute -left-4 -bottom-8 text-blue-400 text-[140px] opacity-50 transform rotate-[-15deg]" />
          <div className="relative z-10">
            <p className="font-semibold text-lg">Água</p>
            <p className="text-4xl font-bold">{recommendations[0].value}</p>
            <p className="text-sm opacity-80">{recommendations[0].unit}</p>
          </div>
        </motion.div>

        {/* Card de Proteína */}
        <motion.div
          variants={itemVariants}
          className="bg-red-500 text-white p-5 rounded-2xl shadow-lg flex items-center justify-between gap-4 relative overflow-hidden"
        >
          <LuFish className="absolute -right-5 -bottom-7 text-red-400 text-[130px] opacity-50 transform rotate-20" />
          <div className="relative z-10 flex flex-col">
            <p className="font-semibold text-lg">Proteína</p>
            <p className="text-sm opacity-80">Meta diária</p>
          </div>
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="10"
                fill="none"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                stroke="#FFF"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="264"
                strokeDashoffset="264"
                transform="rotate(-90 50 50)"
                animate={{ strokeDashoffset: 185 }} // Anima para 30% preenchido
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <p className="text-3xl font-bold">{recommendations[1].value}</p>
              <p className="text-xs opacity-80 -mt-1">
                {recommendations[1].unit}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card de Fibras */}
        <motion.div
          variants={itemVariants}
          className="bg-green-500 text-white p-5 rounded-2xl shadow-lg flex flex-col gap-2 relative overflow-hidden"
        >
          <LuLeaf className="absolute -right-4 -bottom-9 text-green-400 text-[140px] opacity-50 transform rotate-[-15deg]" />
          <div className="flex justify-between items-center w-full">
            <p className="font-semibold text-lg">Fibras</p>
            <LuLeaf className="text-2xl" />
          </div>
          <p className="text-4xl font-bold self-start relative z-10">
            {recommendations[2].value}
            <span className="text-lg opacity-80">
              {" "}
              {recommendations[2].unit}
            </span>
          </p>
          <div className="w-full bg-green-400/50 rounded-full h-2.5 mt-2 relative z-10">
            <motion.div
              className="bg-white h-2.5 rounded-full"
              style={{ width: "0%" }}
              animate={{ width: "30%" }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.7 }}
            />
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col gap-4 mt-2">
        <h2 className="font-semibold text-center text-gray-700">
          Benefícios de Atingir suas Metas
        </h2>
        <ul className="space-y-3">
          {recommendations.map(({ name, benefit }) => (
            <li key={name} className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">{name}:</span> {benefit}
              </p>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPreviewStep;
