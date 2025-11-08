import { Outlet } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "../../context/OnboardingContext";

export default function OnboardingLayout() {
  const { onboardingData } = useOnboarding();

  return (
    <div className="min-w-screen min-h-screen bg-linear-120 from-[#FCC3D2] to-[#A8F3DC] grid place-items-center">
      <AnimatePresence mode="wait">
        <div className="w-[35%] h-[60%] bg-gray-100 rounded-2xl">
          <div className="flex gap-2">
            <h1>Nome: {onboardingData.personal.nome}</h1>
          </div>
          <motion.div
            className=""
            key={location.href}
            initial={{ opacity: 0, x: "100vw" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100vw" }}
            transition={{ type: "tween", ease: "anticipate", duration: 0.5 }}
            // variants={}
          >
            <Outlet />
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  );
}
