import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GlassWater as LuGlassWater,
  Weight as LuWeight,
  Leaf as LuLeaf,
  Flame as LuFlame,
  ChevronDown as LuChevronDown,
  ChevronUp as LuChevronUp,
  Plus as LuPlus,
  Star as LuStar,
  ChevronRight,
  Wheat as LuWheat, // Ícone para Carboidratos
  Droplet as LuDroplet, // Ícone para Gorduras
} from "lucide-react";
import { Link } from "react-router";

// --- Atualização dos Tipos para incluir Macros Completos ---
interface DailyConsumption {
  agua_l: number;
  proteinas_g: number;
  fibras_g: number;
  calorias_kcal: number;
  // Novos campos (opcionais para não quebrar se a API não mandar 0)
  carboidratos_g?: number;
  gorduras_g?: number;
}

interface NutritionTargets {
  aguaRecomendadaL: number;
  metaProteinas: number;
  metaFibras: number;
  metaCalorias: number;
  // Novos campos
  metaCarboidratos?: number;
  metaGorduras?: number;
}

interface DailyMonitoringCardProps {
  dailyConsumption: DailyConsumption;
  nutritionTargets: NutritionTargets;
  allGoalsMet: boolean;
  onOpenModal: () => void;
}

// --- Subcomponente: Progresso Circular ---
const CircularProgress: React.FC<{
  icon: React.ElementType;
  value: number;
  max: number;
  unit: string;
  color: string;
  label: string;
}> = ({ icon: Icon, value, max, unit, color, label }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="#f3f4f6"
            strokeWidth="5"
            fill="transparent"
          />
          <motion.circle
            cx="28"
            cy="28"
            r={radius}
            stroke={color}
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-gray-500">
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">
          {label}
        </p>
        <p className="text-xs font-semibold text-gray-700">
          {value.toFixed(0)}
          <span className="text-[10px] font-normal text-gray-400">
            /{max.toFixed(0)}
            {unit}
          </span>
        </p>
      </div>
    </div>
  );
};

// --- Subcomponente: Progresso Linear ---
const LinearProgress: React.FC<{
  icon: React.ElementType;
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  delay?: number; // Para animação em cascata
}> = ({ icon: Icon, label, current, target, unit, color, delay = 0 }) => {
  const percentage = target > 0 ? (current / target) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="mb-4 last:mb-0"
    >
      <div className="flex justify-between items-end mb-1.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gray-50">
            <Icon className="h-4 w-4 text-gray-500" />
          </div>
          <span className="font-semibold text-sm text-gray-700">{label}</span>
        </div>
        <p className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">
          <span className="font-bold text-gray-900">{current.toFixed(1)}</span>
          <span className="text-gray-400">
            {" "}
            / {target.toFixed(1)} {unit}
          </span>
        </p>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
        <motion.div
          className="h-2.5 rounded-full relative"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 15,
            duration: 1,
            delay,
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function DailyMonitoringCard({
  dailyConsumption,
  nutritionTargets,
  allGoalsMet,
  onOpenModal,
}: DailyMonitoringCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Valores padrão seguros caso não venham da API
  const carbs = dailyConsumption.carboidratos_g || 0;
  const fats = dailyConsumption.gorduras_g || 0;
  // Meta padrão estimada se não vier da API (para não dividir por zero)
  const metaCarbs = nutritionTargets.metaCarboidratos || 250;
  const metaFats = nutritionTargets.metaGorduras || 70;

  return (
    <motion.div
      layout
      transition={{
        layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
      }}
      className="relative col-span-2 overflow-hidden rounded-2xl bg-white p-5 shadow-md border border-gray-100"
      style={{ borderRadius: "1rem" }}
    >
      {/* Selo de Meta Atingida */}
      <AnimatePresence>
        {allGoalsMet && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="absolute top-3 -left-11 flex h-8 w-32 transform items-center justify-center bg-yellow-400 shadow-lg -rotate-45 z-10"
          >
            <LuStar
              className="h-4 w-4 text-white"
              fill="currentColor"
              style={{ transform: "rotate(45deg)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        layout="position"
        className="flex justify-between items-center mb-6"
      >
        <Link
          to={"/metas/"}
          className="group hover:opacity-80 transition-opacity flex gap-2 items-center"
        >
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Acompanhamento
          </h3>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
        </Link>
        <div className="flex gap-2">
          <button
            onClick={onOpenModal}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors active:scale-95"
          >
            <LuPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Registrar</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
            title={isExpanded ? "Recolher" : "Expandir"}
          >
            {isExpanded ? (
              <LuChevronUp className="w-5 h-5" />
            ) : (
              <LuChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Conteúdo Dinâmico */}
      <AnimatePresence mode="popLayout" initial={false}>
        {!isExpanded ? (
          // --- MODO COMPACTO (Apenas os 4 Principais) ---
          <motion.div
            key="collapsed"
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-4 gap-2 py-1"
          >
            <CircularProgress
              icon={LuGlassWater}
              label="Água"
              value={dailyConsumption.agua_l}
              max={nutritionTargets.aguaRecomendadaL}
              unit="L"
              color="#3b82f6"
            />
            <CircularProgress
              icon={LuWeight}
              label="Prot"
              value={dailyConsumption.proteinas_g}
              max={nutritionTargets.metaProteinas}
              unit="g"
              color="#ef4444"
            />
            <CircularProgress
              icon={LuLeaf}
              label="Fibras"
              value={dailyConsumption.fibras_g}
              max={nutritionTargets.metaFibras}
              unit="g"
              color="#22c55e"
            />
            <CircularProgress
              icon={LuFlame}
              label="Kcal"
              value={dailyConsumption.calorias_kcal}
              max={nutritionTargets.metaCalorias}
              unit=""
              color="#f97316"
            />
          </motion.div>
        ) : (
          // --- MODO EXPANDIDO (Lista Completa com Carbo e Gordura) ---
          <motion.div
            key="expanded"
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-1"
          >
            {/* Principais */}
            <LinearProgress
              icon={LuGlassWater}
              label="Água Consumida"
              current={dailyConsumption.agua_l}
              target={nutritionTargets.aguaRecomendadaL}
              unit="L"
              color="linear-gradient(to right, #60a5fa, #3b82f6)"
            />
            <LinearProgress
              icon={LuFlame}
              label="Calorias Totais"
              current={dailyConsumption.calorias_kcal}
              target={nutritionTargets.metaCalorias}
              unit="kcal"
              color="linear-gradient(to right, #fdbb74, #f97316)"
            />

            {/* Macros */}
            <LinearProgress
              icon={LuWeight}
              label="Proteínas"
              current={dailyConsumption.proteinas_g}
              target={nutritionTargets.metaProteinas}
              unit="g"
              color="linear-gradient(to right, #fca5a5, #ef4444)"
            />

            {/* Novos Dados (Carbo e Gordura) */}
            <LinearProgress
              icon={LuWheat}
              label="Carboidratos"
              current={carbs}
              target={metaCarbs}
              unit="g"
              color="linear-gradient(to right, #fde047, #eab308)"
              delay={0.1}
            />
            <LinearProgress
              icon={LuDroplet}
              label="Gorduras"
              current={fats}
              target={metaFats}
              unit="g"
              color="linear-gradient(to right, #d8b4fe, #a855f7)"
              delay={0.2}
            />

            {/* Fibras */}
            <LinearProgress
              icon={LuLeaf}
              label="Fibras"
              current={dailyConsumption.fibras_g}
              target={nutritionTargets.metaFibras}
              unit="g"
              color="linear-gradient(to right, #86efac, #22c55e)"
              delay={0.3}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
