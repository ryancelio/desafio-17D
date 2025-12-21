import { motion, type Variants } from "framer-motion";
import React, { useMemo } from "react";
import type { StepProps } from "../OnboardingWizard";
import {
  LuGlassWater,
  LuUtensils,
  LuFlame,
  LuActivity,
  LuTriangleAlert as LuAlertTriangle,
  LuTrendingUp,
  LuClock,
  LuTarget,
} from "react-icons/lu";

const DashboardPreviewStep: React.FC<StepProps> = ({ onboardingData }) => {
  const { measurements, personal } = onboardingData;

  // Cálculos baseados nos dados reais
  const { recommendations, imcData, projections } = useMemo(() => {
    // Dados com Fallback Inteligente
    const peso = Number(measurements.peso_kg) || 75;
    const alturaCm = personal.altura_cm ? Number(personal.altura_cm) : 170;
    const alturaM = alturaCm / 100;
    const idade = personal.data_nascimento
      ? new Date().getFullYear() -
        new Date(personal.data_nascimento).getFullYear()
      : 30;
    const genero = personal.genero || "masculino";
    const objetivo = personal.objetivo_atual || "perder_peso";

    // IMC
    const imc = peso / (alturaM * alturaM);
    let statusImc = "Normal";
    let riskLevel = "Baixo";
    let riskColor = "bg-green-100 text-green-700";

    if (imc >= 25 && imc < 30) {
      statusImc = "Sobrepeso";
      riskLevel = "Moderado";
      riskColor = "bg-yellow-100 text-yellow-700";
    } else if (imc >= 30) {
      statusImc = "Obesidade";
      riskLevel = "Elevado";
      riskColor = "bg-red-100 text-red-700";
    }

    // TMB (Taxa Metabólica Basal - Fórmula simplificada Mifflin-St Jeor)
    let tmb = 10 * peso + 6.25 * alturaCm - 5 * idade;
    tmb = genero === "masculino" ? tmb + 5 : tmb - 161;

    // Gasto Energético Total (Estimado com fator atividade moderado 1.55)
    const get = Math.round(tmb * 1.55);

    // Recomendações
    const agua = (peso * 0.035).toFixed(1); // 35ml/kg
    const proteina = Math.round(
      peso * (objetivo === "ganhar_massa" ? 2.0 : 1.6)
    );

    // Projeção de resultado em 12 semanas (Estimativa conservadora)
    const perdaPesoSemanal = 0.5; // kg
    const pesoProjetado =
      objetivo === "perder_peso"
        ? (peso - perdaPesoSemanal * 12).toFixed(1)
        : (peso + 0.2 * 12).toFixed(1); // Ganho leve

    return {
      imcData: {
        value: imc.toFixed(1),
        status: statusImc,
        riskLevel,
        riskColor,
      },
      recommendations: {
        agua,
        proteina,
        calorias: objetivo === "perder_peso" ? get - 500 : get + 300,
        treinoSemanal: 4, // Dias
      },
      projections: {
        pesoAtual: peso,
        pesoMeta: pesoProjetado,
        semanas: 12,
      },
    };
  }, [measurements, personal]);

  // Variantes de Animação
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50 },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col gap-6 pb-6"
    >
      {/* Header Impactante */}
      <motion.div variants={item} className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wide border border-red-100">
          <LuAlertTriangle className="w-3.5 h-3.5" /> Ação Imediata Necessária
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
          Sua Análise Corporal
        </h1>
        <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-xs mx-auto">
          Cruzamos seus dados. Para atingir o ápice da sua saúde, precisamos
          ajustar sua rotina <strong>hoje</strong>.
        </p>
      </motion.div>

      {/* Card de Risco/Status - Destaque Urgente */}
      <motion.div
        variants={item}
        className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between relative overflow-hidden"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-red-500 to-orange-500"></div>
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
            Status Atual
          </p>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            IMC {imcData.value} <span className="text-gray-300">|</span>{" "}
            {imcData.status}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Risco metabólico estimado:{" "}
            <span
              className={`font-bold px-1.5 rounded-md ${
                imcData.riskLevel === "Baixo"
                  ? "text-green-600 bg-green-50"
                  : "text-red-600 bg-red-50"
              }`}
            >
              {imcData.riskLevel}
            </span>
          </p>
        </div>
        <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 shadow-inner">
          <LuActivity className="w-6 h-6" />
        </div>
      </motion.div>

      {/* Grid de Metas Diárias - Visual Moderno */}
      <div className="grid grid-cols-2 gap-4">
        {/* Água */}
        <motion.div
          variants={item}
          className="bg-blue-500 text-white p-5 rounded-2xl shadow-md relative overflow-hidden group"
        >
          <LuGlassWater className="absolute -right-4 -bottom-4 text-blue-400/50 w-24 h-24 transform group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <LuGlassWater className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase opacity-80">
                Hidratação
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {recommendations.agua}
              <span className="text-lg opacity-80 font-medium">L</span>
            </p>
            <p className="text-[10px] mt-1 opacity-90 leading-tight">
              Essencial para acelerar seu metabolismo basal.
            </p>
          </div>
        </motion.div>

        {/* Calorias/Dieta */}
        <motion.div
          variants={item}
          className="bg-gray-900 text-white p-5 rounded-2xl shadow-md relative overflow-hidden group"
        >
          <LuFlame className="absolute -right-4 -bottom-4 text-gray-700/50 w-24 h-24 transform group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <LuUtensils className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase opacity-80">
                Calorias
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {recommendations.calorias}
            </p>
            <p className="text-[10px] mt-1 opacity-90 leading-tight">
              Déficit calculado para queima de gordura otimizada.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Projeção de Resultado - Gráfico Simplificado */}
      <motion.div
        variants={item}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <LuTrendingUp className="text-indigo-600" /> Projeção 12 Semanas
          </h3>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
            Plano Premium
          </span>
        </div>

        <div className="flex items-end justify-between relative h-32 w-full px-2">
          {/* Linha pontilhada conectando */}
          <div className="absolute top-4 left-8 right-8 h-0.5 border-t-2 border-dashed border-gray-200 -z-0"></div>

          {/* Ponto A (Hoje) */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-md mb-1">
              Hoje
            </div>
            <div className="w-4 h-4 bg-gray-300 rounded-full border-4 border-white shadow-md"></div>
            <div className="h-16 w-12 bg-gray-200 rounded-t-lg mx-auto"></div>
            <p className="font-bold text-gray-700">{projections.pesoAtual}kg</p>
          </div>

          {/* Seta de Progresso */}
          <div className="mb-12 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <LuClock className="w-3 h-3" /> 3 Meses
          </div>

          {/* Ponto B (Meta) */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-1 rounded-md mb-1 shadow-sm transform -translate-y-1">
              Meta
            </div>
            <div className="w-5 h-5 bg-indigo-600 rounded-full border-4 border-white shadow-md ring-2 ring-indigo-100"></div>
            <div className="h-24 w-12 bg-linear-to-t from-indigo-600 to-indigo-400 rounded-t-lg mx-auto shadow-lg shadow-indigo-200"></div>
            <p className="font-bold text-indigo-700 text-lg">
              {projections.pesoMeta}kg
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          *Projeção estimada seguindo o plano 100%. Resultados podem variar.
        </p>
      </motion.div>

      {/* Call to Action Emocional */}
      <motion.div
        variants={item}
        className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3"
      >
        <div className="p-2 bg-white rounded-full shadow-sm text-indigo-600 shrink-0">
          <LuTarget className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">
            Não desperdice seu potencial
          </h4>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Seu corpo já mostrou os sinais. A dieta e o treino corretos são as
            únicas chaves para mudar essa estatística. Vamos começar?
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPreviewStep;
