import { useLocation, useNavigate, useOutlet } from "react-router";
import {
  motion,
  AnimatePresence,
  useAnimation,
  type Transition,
} from "framer-motion";
import { useOnboarding } from "../../context/OnboardingContext";
import { cloneElement, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { LuTriangleAlert } from "react-icons/lu";

export default function OnboardingLayout() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onboardingData, isStepValid } = useOnboarding();
  const { firebaseUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();

  const ONBOARDING_STEPS = useMemo(
    () => [
      { path: "/onboarding/profile", step: 0 },
      { path: "/onboarding/goals", step: 1 },
      { path: "/onboarding/measurements", step: 2 },
      { path: "/onboarding/preferences", step: 3 },
      { path: "/onboarding/complete", step: 4 },
    ],
    []
  );

  const currentStep = useMemo(() => {
    const found = ONBOARDING_STEPS.find((s) => s.path === location.pathname);
    return found ? found.step : 0;
  }, [ONBOARDING_STEPS, location.pathname]);

  const LAST_STEP = ONBOARDING_STEPS.length - 1;

  const prevDisabled = currentStep <= 0;
  const nextDisabled = currentStep >= LAST_STEP;

  const [animationDirection, setAnimationDirection] = useState(1); // 1 = next, -1 = prev

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [location.pathname]);

  const buttonControls = useAnimation();

  useEffect(() => {
    buttonControls.start({
      backgroundColor: nextDisabled ? "#A8F3DC" : "#FCC3D2",
    });
  }, [nextDisabled, buttonControls]);

  const handleNav = (direction: "prev" | "next") => {
    // Voltar
    if (direction === "prev") {
      const targetStep = currentStep - 1;
      const targetRoute = ONBOARDING_STEPS.find((s) => s.step === targetStep);

      if (!targetRoute) return;

      setAnimationDirection(-1);
      navigate(targetRoute.path);

      return;
    }

    // Continuar
    if (!isStepValid) {
      setError("Preencha os campos obrigatórios.");

      buttonControls.start({
        x: [0, -8, 8, -8, 0], // Animação de "shake"
        transition: { duration: 0.4, ease: "easeInOut" },
      });

      return;
    }

    setError(null);
    const targetStep = currentStep + 1;
    const targetRoute = ONBOARDING_STEPS.find((s) => s.step === targetStep);
    if (!targetRoute) return;
    setAnimationDirection(1);
    navigate(targetRoute.path);
  };

  const variants = {
    enter: {
      opacity: 0,
      y: 15, // Começa 15px abaixo
    },
    center: {
      opacity: 1,
      y: 0, // Posição final
    },
    exit: {
      opacity: 0,
      y: -15, // Sai 15px acima
    },
  };

  const buttonSpring: Transition = {
    type: "spring",
    stiffness: 500,
    damping: 30,
  };

  const handleSubmit = () => {
    // TODO SUBMIT
    console.log(onboardingData);
  };
  const progressPercentage = ((currentStep + 1) / (LAST_STEP + 1)) * 100;

  return (
    <div className="min-w-screen min-h-screen bg-linear-120 overflow-hidden from-[#FCC3D2] to-[#A8F3DC] grid place-items-center">
      <div className="border-2 border-[#FCC3D2] relative max-w-[35%]max-h-[75%] min-w-[35%] min-h-fit  bg-gray-100 shadow-xl pb-4 pt-6 px-6 rounded-2xl">
        <div className="w-[99.6%] bg-gray-200 rounded-lg h-2.5 absolute top-0 left-0 right-0">
          <motion.div
            className="h-2.5 rounded-lg" // Remove 'rounded-full'
            style={{
              // Use o gradiente do seu tema
              backgroundImage: "linear-gradient(to right, #FCC3D2, #A8F3DC)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 30,
            }}
          />
        </div>

        <div className="flex flex-col w-full h-full">
          <div className="flex gap-2">
            <h1>User: {firebaseUser?.email}</h1>
          </div>
          <AnimatePresence mode="wait" custom={animationDirection}>
            <motion.div
              className="grow"
              key={location.pathname}
              variants={variants}
              custom={animationDirection}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30,
              }}
            >
              {outlet && cloneElement(outlet, { key: location.pathname })}
            </motion.div>
          </AnimatePresence>

          <div className="h-10 text-center mt-1">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: "105%" }}
                  animate={{ opacity: 1, scale: "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring" }}
                  className="flex items-center justify-center gap-2 
                             bg-red-100 border border-red-300 text-red-700 
                             px-3 py-2 mt-4 rounded-lg text-sm font-medium"
                >
                  <LuTriangleAlert className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigator */}
          <div className="flex justify-between w-full px-8 py-4 h-28 items-end self-end">
            {/* --- Botão VOLTAR (motion.button) --- */}
            <motion.button
              className="font-semibold h-14 px-6 rounded-4xl 
                         cursor-pointer 
                         hover:bg-gray-200 
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors duration-200" // Transição de cor/opacidade
              onClick={() => handleNav("prev")}
              disabled={prevDisabled}
              // Animações de interação
              whileHover={!prevDisabled ? { scale: 1.05 } : {}}
              whileTap={!prevDisabled ? { scale: 0.95 } : {}}
              transition={buttonSpring}
            >
              Voltar
            </motion.button>

            {/* --- Botão PROXIMO / CONCLUIR (motion.button) --- */}
            <motion.button
              className="font-semibold rounded-4xl h-14 w-36 // (Largura fixa p/ estabilidade)
                         cursor-pointer text-gray-800 
                         flex justify-center items-center overflow-hidden" // Para animar o texto
              onClick={nextDisabled ? handleSubmit : () => handleNav("next")}
              // Animações de interação
              whileHover={{ scale: 1.05, filter: "brightness(105%)" }}
              whileTap={{ scale: 0.95, filter: "brightness(95%)" }}
              // 3. Anima a cor de fundo!
              animate={{
                backgroundColor: nextDisabled ? "#A8F3DC" : "#FCC3D2", // Verde (Concluir) ou Rosa (Proximo)
                ...buttonControls,
              }}
              transition={buttonSpring}
            >
              {/* 4. Anima a mudança do TEXTO */}
              <AnimatePresence mode="wait">
                <motion.span
                  // A key garante que o Framer veja a mudança
                  key={nextDisabled ? "concluir" : "proximo"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {nextDisabled ? "Concluir" : "Proximo"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
          <div className="absolute -bottom-5 -right-5 place-self-end px-6 py-4 font-semibold text-lg rounded-full bg-[#FCC3D2] text-center items-center">
            {currentStep}
          </div>
        </div>
      </div>
    </div>
  );
}
