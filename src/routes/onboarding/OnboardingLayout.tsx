import { Link, Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "../../context/OnboardingContext";
import { useState } from "react";

export default function OnboardingLayout() {
  const { onboardingData } = useOnboarding();

  const location = useLocation();

  const [step, setStep] = useState(0);

  const LAST_STEP = 4;

  const prevDisabled = step <= 0;
  const nextDisabled = step >= LAST_STEP;

  const handleNavPrev = () => {
    if (prevDisabled) {
      return;
    }
    setStep((prev) => prev - 1);
  };

  const handleNavigate = (value: number) => {
    switch (value) {
      case 0:
        return "./profile";
      case 1:
        return "./goals";
    }
  };

  const handleNavNext = () => {
    if (nextDisabled) {
      // TODO - SUBMIT
      return;
    }
    setStep((prev) => prev + 1);
  };

  return (
    <div className="min-w-screen min-h-screen bg-linear-120 overflow-hidden from-[#FCC3D2] to-[#A8F3DC] grid place-items-center">
      <div className="relative w-[35%] h-[70%] min-h-fit bg-gray-100 shadow-lg p-4 rounded-2xl">
        <div className="flex flex-col w-full h-full">
          {/* <div className="flex gap-2">
            <h1>Genero: {onboardingData.personal.genero}</h1>
            </div> */}
          <AnimatePresence mode="wait">
            <motion.div
              className="grow"
              key={location.pathname}
              initial={{ opacity: 0, x: "40vw" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-40vw" }}
              transition={{ type: "tween", ease: "circOut", duration: 0.5 }}
              // variants={}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>

          {/* Navigator */}
          <div className="flex justify-between w-full px-8 py-4 h-28 items-end self-end">
            <Link
              to={`${prevDisabled ? "" : handleNavigate(step - 1)}`}
              className={`${prevDisabled ? "pointer-events-none" : ""}`}
            >
              <button
                className="font-semibold h-14 px-6 rounded-4xl disabled:cursor-default cursor-pointer not-disabled:hover:bg-gray-200"
                onClick={handleNavPrev}
                disabled={step <= 0}
              >
                Prev
              </button>
            </Link>
            <Link to={`${nextDisabled ? "./" : handleNavigate(step + 1)}`}>
              <button
                className="font-semibold border-[1.5px] rounded-4xl h-14 px-7 cursor-pointer hover:opacity-90 bg-[#FCC3D2] text-gray-800"
                onClick={handleNavNext}
                disabled={step === LAST_STEP}
              >
                Next
              </button>
            </Link>
          </div>
          <div className="absolute -bottom-5 -right-5 place-self-end px-6 py-4 font-semibold text-lg rounded-full bg-[#FCC3D2] text-center items-center">
            {step}
          </div>
        </div>
      </div>
    </div>
  );
}
