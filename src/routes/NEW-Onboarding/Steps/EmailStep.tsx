import { motion } from "framer-motion";
import React, { useEffect } from "react";
import type { StepProps } from "../OnboardingWizard";
import z from "zod";

const EmailStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  useEffect(() => {
    const emailSchema = z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address");

    const emailToValidate = onboardingData.personal.email || "";
    const result = emailSchema.safeParse(emailToValidate);

    setStepvalid(result.success);
  }, [onboardingData.personal.email, setStepvalid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col gap-10"
    >
      <div className="text-center">
        <h1 className=" text-gray-800 text-lg font-semibold mb-1">
          Qual o seu email?
        </h1>
        <p className="text-gray-500 text-sm text-center">
          Usaremos para enviar lembretes e novidades.
        </p>
      </div>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-300"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
            <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
          </svg>
        </div>
        <input
          type="email"
          placeholder="seuemail@email.com"
          autoFocus
          value={onboardingData.personal.email || ""}
          onChange={(e) => {
            updateOnboardingData({
              personal: { ...onboardingData.personal, email: e.target.value },
            });
          }}
          className={`border-gray-300 focus:border-indigo-600 pl-10 border-b-2 w-full text-xl font-medium py-2 px-1 text-gray-800 bg-transparent focus:outline-none transition-colors duration-300`}
        />
      </div>
    </motion.div>
  );
};

export default EmailStep;
