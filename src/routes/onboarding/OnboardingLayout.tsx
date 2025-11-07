import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  OnboardingProvider,
  useOnboarding,
} from "../../context/OnboardingContext";

// Componente "casca" que será renderizado pelo Router
const OnboardingLayoutContent = () => {
  const { currentStep, totalSteps, handleNextStep, handlePrevStep, isLoading } =
    useOnboarding();
  const location = useLocation();
  const isCompletionStep = currentStep > totalSteps;

  return (
    // LayoutWrapper
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-pastel-pink to-pastel-mint">
      {/* FormContainer */}
      <div className="w-full max-w-2xl p-6 sm:p-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 overflow-hidden">
        {!isCompletionStep && (
          // ProgressBar
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-pastel-pink to-pastel-mint"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        )}

        {/* Animação de transição (lógica inalterada) */}
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>

        {/* Botões de Navegação */}
        {!isCompletionStep && (
          // NavContainer
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {/* PrevButton */}
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1 || isLoading}
              className="py-3 px-6 rounded-xl text-base font-semibold text-gray-500 bg-transparent 
                         transition-all duration-200 ease-in-out
                         hover:enabled:bg-gray-100
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Voltar
            </button>
            {/* NextButton */}
            <button
              onClick={handleNextStep}
              disabled={isLoading}
              className="py-3 px-6 rounded-xl text-base font-semibold text-gray-800 shadow-md 
                         bg-gradient-to-r from-pastel-pink to-pastel-mint
                         transition-all duration-200 ease-in-out
                         hover:enabled:translate-y-[-2px] hover:enabled:shadow-lg
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === totalSteps ? "Finalizar" : "Próximo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal que exportamos (com o Provider)
export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <OnboardingLayoutContent />
    </OnboardingProvider>
  );
}
