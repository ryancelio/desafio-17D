import React, { useEffect } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "../OnboardingWizard";
import {
  LuDumbbell,
  LuUtensils,
  LuChartLine,
  LuCircleCheckBig,
  LuUsers,
  LuActivity,
} from "react-icons/lu";

// --- COMPONENTE DE CARD ---
const FeatureCard = ({ feature, index }: { feature: any; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl p-5 mb-4 border ${feature.borderColor} bg-white shadow-sm`}
    >
      {/* Fundo Decorativo Suave */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${feature.colorClass}`}
      />

      <div className="flex items-start gap-4 relative z-10">
        {/* Ícone */}
        <div
          className={`p-3 rounded-xl ${feature.bgLight} ${feature.textClass} shrink-0`}
        >
          <feature.icon size={24} />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight">
            {feature.title}
          </h3>
          <p className="text-sm text-gray-500 mb-3 leading-relaxed">
            {feature.description}
          </p>

          {/* Lista de Benefícios (O "Como ajuda") */}
          <div className="space-y-2">
            {feature.benefits.map((benefit: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <LuCircleCheckBig
                  className={`w-4 h-4 mt-0.5 ${feature.textClass}`}
                />
                <span className="text-xs font-medium text-gray-700">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- DADOS DAS FEATURES ATUALIZADOS ---
const featuresList = [
  {
    title: "Treinos & Execução Pro",
    description:
      "Sua ficha interativa. Execute treinos com vídeos demonstrativos e controle total de carga e descanso.",
    icon: LuDumbbell,
    colorClass: "bg-indigo-600",
    bgLight: "bg-indigo-50",
    textClass: "text-indigo-600",
    borderColor: "border-indigo-100",
    benefits: [
      "Vídeos de execução passo a passo",
      "Timer de descanso e progressão de carga",
      "Biblioteca de exercícios por músculo e objetivo",
    ],
  },
  {
    title: "Dieta & Receitas",
    description:
      "Cardápios adaptados ao seu paladar e restrições. Acesse centenas de receitas fit práticas com macros calculados.",
    icon: LuUtensils,
    colorClass: "bg-emerald-600",
    bgLight: "bg-emerald-50",
    textClass: "text-emerald-600",
    borderColor: "border-emerald-100",
    benefits: [
      "Otimizada para suas preferências e limitações",
      "Listagem de refeições variadas",
      "Receitas detalhadas com tabela nutricional",
    ],
  },
  {
    title: "Diário Alimentar Completo",
    description:
      "Controle absoluto da sua nutrição. Registre e acompanhe seu consumo diário detalhado.",
    icon: LuActivity,
    colorClass: "bg-orange-500",
    bgLight: "bg-orange-50",
    textClass: "text-orange-500",
    borderColor: "border-orange-100",
    benefits: [
      "Rastreamento de água, calorias e fibras",
      "Divisão exata de Proteínas, Carbos e Gorduras",
      "Histórico de consumo e médias semanais",
    ],
  },
  {
    title: "Evolução Corporal",
    description:
      "Visualize seus resultados reais. Mantenha um histórico atualizado do seu corpo.",
    icon: LuChartLine,
    colorClass: "bg-LuCircleCheckBig-600",
    bgLight: "bg-blue-50",
    textClass: "text-blue-600",
    borderColor: "border-blue-100",
    benefits: [
      "Histórico de peso e medidas corporais",
      "Gráficos de progressão temporal",
      "Acompanhamento visual da mudança",
    ],
  },
  {
    title: "Criado por Especialistas",
    description:
      "Tenha treinos e dietas montados por profissionais reais, não robôs. Evolução constante garantida.",
    icon: LuUsers,
    colorClass: "bg-rose-600",
    bgLight: "bg-rose-50",
    textClass: "text-rose-600",
    borderColor: "border-rose-100",
    benefits: [
      "1 Solicitação mensal inclusa no plano*",
      "Fichas 100% personalizadas por humanos",
      "Opção de comprar solicitações extras",
    ],
  },
];

// --- COMPONENTE PRINCIPAL ---
export const FeaturesDetailedStep: React.FC<StepProps> = ({ setStepvalid }) => {
  useEffect(() => {
    // Passo informativo, validado automaticamente
    setStepvalid(true);
  }, [setStepvalid]);

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Cabeçalho Fixo */}
      <div className="text-center px-4 mb-2 shrink-0 pt-2">
        <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-3">
          <LuActivity className="w-3 h-3" /> Metodologia Completa
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
          Tudo o que você precisa <br /> em um só lugar
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
          Ferramentas profissionais para garantir que você atinja seus objetivos
          sem adivinhação.
        </p>
      </div>

      {/* Lista com Scroll */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4 scrollbar-hide">
        {featuresList.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}

        {/* Nota de Rodapé sobre o plano */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-2 mb-4 px-4"
        >
          <p className="text-[10px] text-gray-400">
            * A solicitação mensal inclusa depende da categoria do plano
            selecionado na próxima etapa.
          </p>
        </motion.div>
      </div>

      {/* Degradê inferior para suavizar o scroll */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-white to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default FeaturesDetailedStep;
