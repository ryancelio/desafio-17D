import React, { useState, useMemo } from "react";
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
  Wheat as LuWheat,
  Droplet as LuDroplet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router";

// --- TIPAGEM ---
interface DailyConsumption {
  agua_l: number;
  proteinas_g: number;
  fibras_g: number;
  calorias_kcal: number;
  carboidratos_g?: number;
  gorduras_g?: number;
}

interface NutritionTargets {
  aguaRecomendadaL: number;
  metaProteinas: number;
  metaFibras: number;
  metaCalorias: number;
  metaCarboidratos?: number;
  metaGorduras?: number;
}

interface DailyMonitoringCardProps {
  dailyConsumption: DailyConsumption;
  nutritionTargets: NutritionTargets;
  allGoalsMet: boolean;
  onOpenModal: () => void;
}

// --- CONFIGURAÇÃO CENTRALIZADA (Mantenabilidade) ---
type NutrientType = "min" | "max"; // Min = deve bater (>=), Max = limite (<=)

interface NutrientConfigItem {
  label: string;
  unit: string;
  icon: React.ElementType;
  type: NutrientType;
  colorBase: string; // Cor normal
  colorSuccess?: string; // Cor quando bate a meta (para min)
  colorDanger?: string; // Cor quando estoura (para max)
}

const NUTRIENT_CONFIG: Record<string, NutrientConfigItem> = {
  agua: {
    label: "Água",
    unit: "L",
    icon: LuGlassWater,
    type: "min",
    colorBase: "#3b82f6", // Blue
    colorSuccess: "#3b82f6",
  },
  proteinas: {
    label: "Proteínas",
    unit: "g",
    icon: LuWeight,
    type: "min",
    colorBase: "#6366f1", // Indigo
    colorSuccess: "#22c55e", // Green
  },
  fibras: {
    label: "Fibras",
    unit: "g",
    icon: LuLeaf,
    type: "min",
    colorBase: "#10b981", // Emerald
    colorSuccess: "#15803d",
  },
  calorias: {
    label: "Calorias",
    unit: "kcal",
    icon: LuFlame,
    type: "max",
    colorBase: "#f97316", // Orange
    colorDanger: "#ef4444", // Red
  },
  carbs: {
    label: "Carboidratos",
    unit: "g",
    icon: LuWheat,
    type: "max",
    colorBase: "#eab308", // Yellow
    colorDanger: "#ef4444",
  },
  gorduras: {
    label: "Gorduras",
    unit: "g",
    icon: LuDroplet,
    type: "max",
    colorBase: "#a855f7", // Purple
    colorDanger: "#ef4444",
  },
};

// --- HELPER DE CORES ---
const getProgressColor = (
  config: NutrientConfigItem,
  current: number,
  target: number
) => {
  const pct = target > 0 ? (current / target) * 100 : 0;

  if (config.type === "min") {
    // Se bateu a meta (>= 100%), fica verde/sucesso. Se não, cor base.
    return pct >= 100 ? config.colorSuccess! : config.colorBase;
  } else {
    // Se estourou (>= 100%), fica vermelho. Se não, cor base.
    return pct > 100 ? config.colorDanger! : config.colorBase;
  }
};

// --- SUBCOMPONENTES OTIMIZADOS (React.memo) ---

const CircularProgress = React.memo(
  ({
    configKey,
    value,
    max,
  }: {
    configKey: string;
    value: number;
    max: number;
  }) => {
    const config = NUTRIENT_CONFIG[configKey];
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const color = getProgressColor(config, value, max);

    // Ícone de alerta se estourou (apenas para MAX)
    const isOverLimit = config.type === "max" && value > max;
    // Ícone de check se completou (apenas para MIN)
    const isCompleted = config.type === "min" && value >= max;

    return (
      <div className="flex flex-col items-center justify-center p-2">
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
            {isOverLimit ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <config.icon className="w-5 h-5" style={{ color }} />
            )}
          </div>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">
            {config.label}
          </p>
          <p className="text-xs font-semibold text-gray-700">
            {value.toFixed(0)}
            <span className="text-[10px] font-normal text-gray-400">
              /{max.toFixed(0)}
            </span>
          </p>
        </div>
      </div>
    );
  }
);

const LinearProgress = React.memo(
  ({
    configKey,
    current,
    target,
    delay = 0,
  }: {
    configKey: string;
    current: number;
    target: number;
    delay?: number;
  }) => {
    const config = NUTRIENT_CONFIG[configKey];
    // Permitimos passar de 100% visualmente se for MAX, para chocar o usuário
    const percentage = target > 0 ? (current / target) * 100 : 0;
    const visualWidth = Math.min(percentage, 100);
    const color = getProgressColor(config, current, target);
    const Icon = config.icon;

    const isOverLimit = config.type === "max" && current > target;
    const isMet = config.type === "min" && current >= target;

    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="mb-4 last:mb-0 group"
      >
        <div className="flex justify-between items-end mb-1.5">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-md transition-colors ${
                isOverLimit
                  ? "bg-red-50 text-red-500"
                  : isMet
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-50 text-gray-500"
              }`}
            >
              {isOverLimit ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-700 block leading-none">
                {config.label}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {config.type === "min" ? "Meta mínima" : "Limite máximo"}
              </span>
            </div>
          </div>
          <p className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            <span
              className={`font-bold ${
                isOverLimit
                  ? "text-red-600"
                  : isMet
                  ? "text-green-600"
                  : "text-gray-900"
              }`}
            >
              {current.toFixed(0)}
            </span>
            <span className="text-gray-400">
              {" "}
              / {target.toFixed(0)} {config.unit}
            </span>
          </p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner relative">
          <motion.div
            className="h-2.5 rounded-full relative"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${visualWidth}%` }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 15,
              duration: 1,
              delay,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

// --- COMPONENTE PRINCIPAL ---

export default function DailyMonitoringCard({
  dailyConsumption,
  nutritionTargets,
  allGoalsMet,
  onOpenModal,
}: DailyMonitoringCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoização dos valores para evitar recálculos
  const data = useMemo(() => {
    return {
      agua: {
        curr: dailyConsumption.agua_l,
        tgt: nutritionTargets.aguaRecomendadaL,
      },
      prot: {
        curr: dailyConsumption.proteinas_g,
        tgt: nutritionTargets.metaProteinas,
      },
      fibras: {
        curr: dailyConsumption.fibras_g,
        tgt: nutritionTargets.metaFibras,
      },
      kcal: {
        curr: dailyConsumption.calorias_kcal,
        tgt: nutritionTargets.metaCalorias,
      },
      carbs: {
        curr: dailyConsumption.carboidratos_g || 0,
        tgt: nutritionTargets.metaCarboidratos || 250,
      },
      gord: {
        curr: dailyConsumption.gorduras_g || 0,
        tgt: nutritionTargets.metaGorduras || 70,
      },
    };
  }, [dailyConsumption, nutritionTargets]);

  return (
    <motion.div
      layout
      transition={{
        layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
      }}
      className="relative col-span-2 overflow-hidden bg-white p-5 shadow-sm border border-gray-100 rounded-2xl"
    >
      {/* Selo de Meta Atingida */}
      <AnimatePresence>
        {allGoalsMet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: -45 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-4 -left-10 bg-yellow-400 text-white text-[10px] font-bold py-1 px-10 shadow-md z-10 flex justify-center uppercase tracking-widest"
          >
            <LuStar className="w-3 h-3 mr-1 fill-white" /> Completo
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
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-colors active:scale-95"
          >
            <LuPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Registrar</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors active:scale-95 border border-transparent hover:border-gray-200"
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
          // --- MODO COMPACTO ---
          <motion.div
            key="collapsed"
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-4 gap-2 py-1"
          >
            <CircularProgress
              configKey="agua"
              value={data.agua.curr}
              max={data.agua.tgt}
            />
            <CircularProgress
              configKey="proteinas"
              value={data.prot.curr}
              max={data.prot.tgt}
            />
            <CircularProgress
              configKey="fibras"
              value={data.fibras.curr}
              max={data.fibras.tgt}
            />
            <CircularProgress
              configKey="calorias"
              value={data.kcal.curr}
              max={data.kcal.tgt}
            />
          </motion.div>
        ) : (
          // --- MODO EXPANDIDO ---
          <motion.div
            key="expanded"
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* Bloco 1: Principais */}
            <div className="space-y-4">
              <LinearProgress
                configKey="agua"
                current={data.agua.curr}
                target={data.agua.tgt}
              />
              <LinearProgress
                configKey="calorias"
                current={data.kcal.curr}
                target={data.kcal.tgt}
              />
            </div>

            <div className="h-px bg-gray-100" />

            {/* Bloco 2: Macros */}
            <div className="space-y-4">
              <LinearProgress
                configKey="proteinas"
                current={data.prot.curr}
                target={data.prot.tgt}
              />
              <LinearProgress
                configKey="carbs"
                current={data.carbs.curr}
                target={data.carbs.tgt}
                delay={0.1}
              />
              <LinearProgress
                configKey="gorduras"
                current={data.gord.curr}
                target={data.gord.tgt}
                delay={0.15}
              />
              <LinearProgress
                configKey="fibras"
                current={data.fibras.curr}
                target={data.fibras.tgt}
                delay={0.2}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
