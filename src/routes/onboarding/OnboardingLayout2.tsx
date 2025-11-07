// src/layouts/OnboardingLayout.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router";
import { useOnboarding } from "../../context/OnboardingContext";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { currentStep, totalSteps } = useOnboarding();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#A8F3DC] to-[#FCC3D2] p-6">
      {/* Cabeçalho */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          Seu Perfil Fitness
        </h1>
        <p className="text-gray-600">
          Etapa {currentStep} de {totalSteps}
        </p>

        {/* Barra de progresso */}
        <div className="w-64 h-2 bg-white/60 rounded-full mt-4 overflow-hidden">
          <motion.div
            className="h-full bg-[#FCC3D2]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </header>

      {/* Conteúdo com transição animada */}
      <div className="relative w-full max-w-md bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
