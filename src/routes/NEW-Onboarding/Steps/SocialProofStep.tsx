import { motion, type Variants } from "framer-motion";
import React, { useEffect } from "react";
import type { StepProps } from "../OnboardingWizard";
import {
  LuStar,
  LuQuote,
  LuTrophy,
  //   LuTrendingUp,
  //   LuCalendar,
} from "react-icons/lu";

// Dados Mockados para Prova Social (Idealmente viriam do backend ou CMS)
const transformations = [
  {
    id: 1,
    name: "Ricardo M.",
    result: "-14kg em 3 meses",
    imgBefore:
      // "https://images.unsplash.com/photo-1571019614248-c5c7c319e578?auto=format&fit=crop&w=300&q=80", // Homem fitness antes (simulado)
      "/public/antes_depois/Antes Masc.png",
    imgAfter:
      // "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=300&q=80", // Homem fitness depois
      "/public/antes_depois/Depois Masc.png",
    tag: "Perda de Peso",
  },
  {
    id: 2,
    name: "Juliana S.",
    result: "Definição muscular",
    imgBefore:
      // "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=300&q=80", // Mulher antes
      "public/antes_depois/Antes Fem.jpg",
    imgAfter:
      // "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=300&q=80", // Mulher depois (simulado)
      "public/antes_depois/Depois Fem.jpg",
    tag: "Hipertrofia",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Carlos Eduardo",
    role: "Assinante há 6 meses",
    text: "Eu nunca consegui manter uma rotina de treinos por mais de 2 semanas. O PowerSlim mudou isso. A praticidade de ter o treino certo pro meu nível fez toda diferença.",
    rating: 5,
  },
  {
    id: 2,
    name: "Fernanda Lima",
    role: "Assinante há 4 meses",
    text: "A dieta flexível é incrível. Não passei fome e perdi 8kg para o meu casamento. Recomendo demais!",
    rating: 5,
  },
  {
    id: 3,
    name: "Pedro Henrique",
    role: "Assinante há 1 ano",
    text: "O dashboard de progresso me viciou em bater minhas metas. Melhor investimento que fiz pra minha saúde.",
    rating: 5,
  },
];

const SocialProofStep: React.FC<StepProps> = ({ setStepvalid }) => {
  // Como é uma tela informativa, validamos o passo imediatamente
  useEffect(() => {
    setStepvalid(true);
  }, [setStepvalid]);

  // Animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 w-full max-w-lg mx-auto pb-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-wide border border-yellow-200">
          <LuStar className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />{" "}
          +15.000 Vidas Transformadas
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
          Resultados Reais.
          <br />
          Pessoas Reais.
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
          Veja o que acontece quando você segue um plano feito sob medida para o
          seu corpo.
        </p>
      </motion.div>

      {/* Transformations Carousel (Horizontal Scroll Mobile) */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {transformations.map((item) => (
            <div
              key={item.id}
              className="snap-center shrink-0 w-[280px] bg-white p-3 rounded-2xl shadow-lg border border-gray-100 flex flex-col gap-3"
            >
              <div className="flex gap-2 h-48">
                <div className="flex-1 relative rounded-lg overflow-hidden group">
                  <img
                    src={item.imgBefore}
                    alt="Antes"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold text-center py-1">
                    ANTES
                  </div>
                </div>
                <div className="flex-1 relative rounded-lg overflow-hidden">
                  <img
                    src={item.imgAfter}
                    alt="Depois"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 text-white text-[10px] font-bold text-center py-1">
                    DEPOIS
                  </div>
                </div>
              </div>

              <div className="px-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-900 text-sm">
                    {item.name}
                  </span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    {item.tag}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                  <LuTrophy className="w-4 h-4" />
                  {item.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center"
      >
        <div>
          <p className="text-xl font-extrabold text-gray-900">92%</p>
          <p className="text-[10px] text-gray-500 uppercase font-medium">
            Atingem a meta
          </p>
        </div>
        <div className="border-l border-gray-200">
          <p className="text-xl font-extrabold text-gray-900">4.9</p>
          <p className="text-[10px] text-gray-500 uppercase font-medium">
            Avaliação Média
          </p>
        </div>
        <div className="border-l border-gray-200">
          <p className="text-xl font-extrabold text-gray-900">24/7</p>
          <p className="text-[10px] text-gray-500 uppercase font-medium">
            Suporte Ativo
          </p>
        </div>
      </motion.div>

      {/* Testimonials List */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">
          O que estão dizendo
        </h3>
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative"
          >
            <LuQuote className="absolute top-4 right-4 text-gray-100 w-8 h-8 rotate-180" />
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <LuStar
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < t.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-3 italic">
              "{t.text}"
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{t.name}</p>
                <p className="text-[10px] text-gray-400">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Trust Badge Footer */}
      <motion.div
        variants={itemVariants}
        className="flex justify-center items-center gap-2 pt-2 opacity-60"
      >
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[8px] text-gray-500 font-bold"
            >
              User
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Junte-se a +15.000 membros ativos
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SocialProofStep;
