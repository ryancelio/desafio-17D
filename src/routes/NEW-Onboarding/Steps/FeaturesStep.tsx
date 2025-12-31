import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StepProps } from "../OnboardingWizard";
import {
  LuDumbbell,
  LuUtensils,
  LuChartLine,
  LuChevronRight,
  //   LuTimer,
  //   LuFlame,
  LuCheck,
  LuPlay,
  LuCamera,
  LuBeef,
  LuWheat,
  LuDroplet,
} from "react-icons/lu";

// --- INTERFACES & MOCK SCREENS ---

interface ScreenProps {
  className?: string;
}

// 1. TELA DE TREINO
const WorkoutScreen: React.FC<ScreenProps> = ({ className = "" }) => (
  <div
    className={`h-full w-full bg-slate-900 flex flex-col text-white relative font-sans ${className}`}
  >
    <div className="px-5 pt-6 pb-4 bg-slate-900 z-10">
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-xs text-indigo-400 font-bold tracking-wider uppercase mb-1">
            Treino B
          </p>
          <h3 className="text-xl font-bold leading-none">Dorsal & Bíceps</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-mono">24:10</span>
        </div>
      </div>
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="w-[45%] h-full bg-indigo-500 rounded-full"></div>
      </div>
    </div>

    <div className="flex-1 overflow-hidden px-4 pb-4 space-y-4 relative">
      <div className="bg-slate-800 rounded-2xl p-4 border border-indigo-500/30 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <LuDumbbell size={80} />
        </div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h4 className="font-bold text-lg text-white">Puxada Alta</h4>
            <p className="text-xs text-slate-400">Máquina / Cabo</p>
          </div>
          <button className="bg-indigo-600 p-2 rounded-lg text-white shadow-indigo-500/20 shadow-lg">
            <LuPlay size={16} fill="currentColor" />
          </button>
        </div>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>SET</span>
            <span>KG</span>
            <span>REPS</span>
            <span>OK</span>
          </div>
          <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-indigo-500/20 opacity-50">
            <span className="font-bold text-indigo-400 w-6">1</span>
            <span className="font-bold w-8">45</span>
            <span className="font-bold w-8">12</span>
            <div className="bg-indigo-500 text-white rounded p-0.5">
              <LuCheck size={12} />
            </div>
          </div>
          <div className="flex items-center justify-between bg-indigo-900/20 p-2 rounded-lg border border-indigo-500">
            <span className="font-bold text-indigo-400 w-6">2</span>
            <span className="font-bold w-8 text-white">50</span>
            <span className="font-bold w-8 text-white">10</span>
            <div className="w-4 h-4 border-2 border-indigo-500 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between opacity-60">
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold">
            Próximo
          </p>
          <h4 className="font-bold text-white">Remada Curvada</h4>
        </div>
        <LuChevronRight className="text-slate-500" />
      </div>
    </div>
  </div>
);

// 2. TELA DE DIETA
const DietScreen: React.FC<ScreenProps> = ({ className = "" }) => (
  <div
    className={`h-full w-full bg-stone-50 flex flex-col relative font-sans ${className}`}
  >
    <div className="bg-white p-5 pb-6 rounded-b-[2rem] shadow-sm border-b border-stone-100 z-10">
      <div className="flex justify-between items-center mb-4 mt-2">
        <div>
          <h3 className="font-bold text-stone-800 text-lg">Visão Diária</h3>
          <p className="text-xs text-stone-500">Meta: Hipertrofia</p>
        </div>
        <div className="text-right">
          <span className="block font-extrabold text-xl text-emerald-600">
            1.840
          </span>
          <span className="text-[10px] text-stone-400 uppercase font-bold">
            kcal restantes
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-stone-50 p-2 rounded-xl text-center border border-stone-100">
          <div className="flex justify-center text-blue-500 mb-1">
            <LuBeef size={14} />
          </div>
          <div className="h-1 bg-stone-200 rounded-full mb-1 overflow-hidden">
            <div className="w-[70%] h-full bg-blue-500"></div>
          </div>
          <p className="text-[10px] font-bold text-stone-600">Prot</p>
        </div>
        <div className="bg-stone-50 p-2 rounded-xl text-center border border-stone-100">
          <div className="flex justify-center text-amber-500 mb-1">
            <LuWheat size={14} />
          </div>
          <div className="h-1 bg-stone-200 rounded-full mb-1 overflow-hidden">
            <div className="w-[40%] h-full bg-amber-500"></div>
          </div>
          <p className="text-[10px] font-bold text-stone-600">Carb</p>
        </div>
        <div className="bg-stone-50 p-2 rounded-xl text-center border border-stone-100">
          <div className="flex justify-center text-rose-500 mb-1">
            <LuDroplet size={14} />
          </div>
          <div className="h-1 bg-stone-200 rounded-full mb-1 overflow-hidden">
            <div className="w-[20%] h-full bg-rose-500"></div>
          </div>
          <p className="text-[10px] font-bold text-stone-600">Gord</p>
        </div>
      </div>
    </div>
    <div className="p-4 space-y-3 overflow-hidden">
      <p className="text-xs font-bold text-stone-400 uppercase ml-1">
        Refeições
      </p>
      <div className="bg-white p-3 rounded-2xl border border-emerald-100 flex items-center gap-3 shadow-sm opacity-60 grayscale">
        <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
          <LuCheck size={14} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-stone-800 line-through">
            Café da Manhã
          </h4>
          <p className="text-[10px] text-stone-400">Ovos mexidos, torrada...</p>
        </div>
        <span className="text-xs font-bold text-stone-400">420 kcal</span>
      </div>
      <div className="bg-white p-3 rounded-2xl border border-emerald-500 ring-2 ring-emerald-50 flex items-center gap-3 shadow-md relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
        <div className="bg-orange-100 p-2 rounded-full text-orange-500 ml-1">
          <LuUtensils size={14} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-stone-800">Almoço</h4>
          <p className="text-[10px] text-stone-500">
            Frango grelhado, arroz...
          </p>
        </div>
        <div className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
          Logar
        </div>
      </div>
    </div>
  </div>
);

// 3. TELA DE PROGRESSO
const ProgressScreen: React.FC<ScreenProps> = ({ className = "" }) => (
  <div
    className={`h-full w-full bg-white flex flex-col relative font-sans ${className}`}
  >
    <div className="bg-blue-600 h-1/3 w-full absolute top-0 rounded-b-[3rem] z-0"></div>
    <div className="relative z-10 px-5 pt-8 flex flex-col h-full">
      <div className="text-center text-white mb-6">
        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">
          Peso Atual
        </p>
        <h2 className="text-5xl font-extrabold tracking-tighter">
          78.5<span className="text-2xl font-medium text-blue-200">kg</span>
        </h2>
        <div className="inline-flex items-center gap-1 bg-blue-500/50 px-3 py-1 rounded-full mt-2 text-xs border border-blue-400/30">
          <LuChartLine size={12} /> <span>-1.2kg essa semana</span>
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-4 mb-4 flex-1 max-h-[160px] flex flex-col justify-center items-center text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2 relative z-10">
          <LuCamera size={24} />
        </div>
        <h4 className="font-bold text-slate-800 text-sm relative z-10">
          Fotos Comparativas
        </h4>
        <p className="text-xs text-slate-400 mb-3 relative z-10">
          Compare seu antes e depois
        </p>
        <button className="bg-slate-900 text-white text-xs px-4 py-2 rounded-full font-bold relative z-10">
          Ver Galeria
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-bold">
            Cintura
          </p>
          <div className="flex items-end gap-1">
            <span className="text-lg font-bold text-slate-800">82cm</span>
            <span className="text-[10px] text-emerald-500 font-bold mb-1">
              ↓ 2cm
            </span>
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-bold">
            Braço
          </p>
          <div className="flex items-end gap-1">
            <span className="text-lg font-bold text-slate-800">38cm</span>
            <span className="text-[10px] text-emerald-500 font-bold mb-1">
              ↑ 0.5cm
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- DADOS DAS FEATURES ---

const features = [
  {
    id: "workout",
    title: "Seu Treino Inteligente",
    description: "Controle séries, cargas e descanso em tempo real.",
    Component: WorkoutScreen,
    rotation: { rotateY: -15, rotateX: 5, rotateZ: -2 },
    // Definindo cores explícitas para evitar erros de string replace
    bgClass: "bg-indigo-500",
    textClass: "text-indigo-500",
    icon: LuDumbbell,
  },
  {
    id: "diet",
    title: "Nutrição Flexível",
    description: "Veja macros e substitua alimentos da sua dieta.",
    Component: DietScreen,
    rotation: { rotateY: 15, rotateX: 5, rotateZ: 2 },
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-500",
    icon: LuUtensils,
  },
  {
    id: "progress",
    title: "Evolução Visível",
    description: "Compare fotos e gráficos de medidas corporais.",
    Component: ProgressScreen,
    rotation: { rotateY: 0, rotateX: -10, rotateZ: 0 },
    bgClass: "bg-blue-500",
    textClass: "text-blue-500",
    icon: LuChartLine,
  },
];

// --- COMPONENTE PRINCIPAL ---

export const FeaturesStep: React.FC<StepProps> = ({ setStepvalid }) => {
  const [index, setIndex] = useState(0);
  const current = features[index];

  useEffect(() => setStepvalid(true), [setStepvalid]);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % features.length);
  };

  return (
    // Layout corrigido: flex-col, centralizado, sem sobreposição
    <div className="w-full h-full flex flex-col justify-start items-center py-4 relative overflow-hidden">
      {/* 1. Título e Ícone (Topo) */}
      <div className="w-full px-6 z-20 text-center h-auto min-h-[120px] flex-shrink-0 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Ícone com cores explícitas */}
            <div
              className={`inline-flex p-3 rounded-2xl mb-3 shadow-sm ${current.bgClass} bg-opacity-10`}
            >
              <current.icon className={`w-6 h-6 ${current.textClass}`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
              {current.title}
            </h2>
            <p className="text-sm text-gray-500 px-4 max-w-xs mx-auto">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. Área 3D do Celular (Centro - Flexível) */}
      <div className="flex-1 w-full flex items-center justify-center relative perspective-container py-2">
        {/* Fundo Decorativo */}
        <motion.div
          animate={{ backgroundColor: current.textClass.replace("text-", "") }} // Hack simples para cor, ou use um mapa de cores
          className="absolute w-64 h-64 rounded-full blur-[80px] opacity-10 pointer-events-none transition-colors duration-500"
        />

        {/* Celular com altura dinâmica para caber na tela */}
        <motion.div
          className="relative w-[240px] h-[440px] md:w-[260px] md:h-[500px]" // Ajustei altura mobile para 440px
          animate={current.rotation}
          transition={{ type: "spring", stiffness: 60, damping: 12, mass: 1.2 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* LADO/ESPESSURA */}
          <div className="absolute inset-0 bg-gray-800 rounded-[3rem] translate-z-[-10px] scale-[1.02]" />

          {/* CARCAÇA */}
          <div className="absolute inset-0 bg-gray-900 rounded-[3rem] shadow-2xl overflow-hidden p-3 flex flex-col">
            {/* TELA DE VIDRO */}
            <div className="relative w-full h-full bg-white rounded-[2.2rem] overflow-hidden z-10">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none z-30" />

              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={current.id}
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "-20%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <current.Component />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* NOTCH */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
              <div className="w-20 h-6 bg-black rounded-full flex items-center justify-center gap-2 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-800/60"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-900/30"></div>
              </div>
            </div>

            {/* BARRA HOME */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-black/80 rounded-full z-20"></div>
          </div>
        </motion.div>
      </div>

      {/* 3. Botão (Base) */}
      <div className="w-full px-6 py-2 flex justify-center z-20 flex-shrink-0">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 px-5 py-2.5 rounded-full shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          Ver outra função <LuChevronRight className="w-4 h-4" />
        </button>
      </div>

      <style>{`
        .perspective-container {
          perspective: 1200px;
        }
      `}</style>
    </div>
  );
};

export default FeaturesStep;
