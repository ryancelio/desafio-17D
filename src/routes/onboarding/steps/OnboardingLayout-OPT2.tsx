import { useLocation, useNavigate, useOutlet } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "../../context/OnboardingContext";
import { cloneElement, useMemo, useState, ReactElement } from "react";
import { useAuth } from "../../context/AuthContext";

type OnboardingStep = {
  path: string;
  step: number;
};

type NavDirection = "prev" | "next";

export default function OnboardingLayout(): JSX.Element {
  const { onboardingData } = useOnboarding();
  const { firebaseUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();

  const ONBOARDING_STEPS: OnboardingStep[] = [
    { path: "/onboarding/profile", step: 0 },
    { path: "/onboarding/goals", step: 1 },
    { path: "/onboarding/measurements", step: 2 },
    { path: "/onboarding/preferences", step: 3 },
    { path: "/onboarding/complete", step: 4 },
  ];

  const LAST_STEP = ONBOARDING_STEPS.length - 1;

  const [animationDirection, setAnimationDirection] = useState<1 | -1>(1);

  const currentStep = useMemo(() => {
    const found = ONBOARDING_STEPS.find((s) => s.path === location.pathname);
    return found ? found.step : 0;
  }, [location.pathname]);

  const prevDisabled = currentStep <= 0;
  const nextDisabled = currentStep >= LAST_STEP;

  const handleNav = (direction: NavDirection) => {
    const targetStep = direction === "prev" ? currentStep - 1 : currentStep + 1;
    const targetRoute = ONBOARDING_STEPS.find((s) => s.step === targetStep);
    if (!targetRoute) return;

    setAnimationDirection(direction === "prev" ? -1 : 1);
    navigate(targetRoute.path);
  };

  const handleSubmit = () => {
    console.log("Submitting Onboarding Data:", onboardingData);
  };

  // --- Animations ---
  const pageVariants = {
    enter: (direction: 1 | -1) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 250, damping: 30 },
    },
    exit: (direction: 1 | -1) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.25 },
    }),
  };

  const buttonSpring = {
    type: "spring",
    stiffness: 500,
    damping: 25,
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center 
                 bg-gradient-to-br from-[#FCE4EC] via-[#E3FCEF] to-[#FFF8E1] 
                 overflow-hidden relative"
    >
      {/* Subtle animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-[#FDCFE8] via-[#CFFFE2] to-[#FCEFCF] opacity-70"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 12,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{ backgroundSize: "200% 200%" }}
      />

      <motion.div
        className="relative w-full max-w-3xl min-h-[65vh]
                   bg-white/70 backdrop-blur-md border border-white/40
                   rounded-3xl shadow-2xl px-8 py-8 flex flex-col"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-700">
            👋 Olá, {firebaseUser?.email || "Usuário"}
          </h1>
          <div className="text-gray-600 text-sm font-medium">
            Etapa {currentStep + 1} / {LAST_STEP + 1}
          </div>
        </div>

        {/* Animated Page Content */}
        <div className="relative flex-grow overflow-hidden">
          <AnimatePresence mode="wait" custom={animationDirection}>
            <motion.div
              key={location.pathname}
              custom={animationDirection}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              {outlet &&
                cloneElement(outlet as ReactElement, {
                  key: location.pathname,
                })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-8">
          <motion.button
            className="px-6 py-3 rounded-full font-medium text-gray-700 
                       bg-white/70 border border-gray-200 shadow-sm
                       hover:bg-gray-100 transition disabled:opacity-40"
            onClick={() => handleNav("prev")}
            disabled={prevDisabled}
            whileHover={!prevDisabled ? { scale: 1.05 } : {}}
            whileTap={!prevDisabled ? { scale: 0.95 } : {}}
            transition={buttonSpring}
          >
            ← Voltar
          </motion.button>

          <motion.button
            className="px-8 py-3 rounded-full font-semibold text-gray-800 
                       shadow-md hover:shadow-lg transition flex items-center justify-center"
            onClick={nextDisabled ? handleSubmit : () => handleNav("next")}
            animate={{
              backgroundColor: nextDisabled ? "#B2F2BB" : "#FEC5E5",
            }}
            whileHover={{ scale: 1.05, filter: "brightness(105%)" }}
            whileTap={{ scale: 0.95 }}
            transition={buttonSpring}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={nextDisabled ? "concluir" : "proximo"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {nextDisabled ? "Concluir" : "Próximo →"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
