import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "../../../context/OnboardingContext";
import type { UserProfileData } from "../../../context/OnboardingContext";

// Define as animações da página (slide)
const pageVariants = {
  initial: {
    opacity: 0,
    x: "50vw", // Entra pela direita
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: "-50vw", // Sai pela esquerda
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

// Componente de Input reutilizável
const FormInput = ({ label, ...props }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCC3D2] focus:border-transparent"
      {...props}
    />
  </div>
);

// Componente de botão de seleção (para gênero)
const SelectionButton = ({
  onClick,
  isSelected,
  children,
}: {
  onClick: () => any;
  isSelected: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full px-4 py-3 font-medium border rounded-lg transition-all duration-200
      ${
        isSelected
          ? "bg-[#FCC3D2] text-white border-transparent shadow-md"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
  >
    {children}
  </button>
);

export const ProfileStep = () => {
  const { formData, setFormData, handleNextStep, handlePrevStep } =
    useOnboarding();

  const { nome, data_nascimento, genero } = formData.profile;

  // Validação simples para habilitar o botão de "Próximo"
  const isStepValid = useMemo(() => {
    return nome.trim() !== "" && data_nascimento !== "" && genero !== "";
  }, [nome, data_nascimento, genero]);

  // Handler para atualizar o estado no contexto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [name]: value,
      },
    }));
  };

  // Handler para os botões de gênero
  const handleGenderSelect = (value: UserProfileData["genero"]) => {
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        genero: value,
      },
    }));
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      //   transition={pageTransition}
      className="w-full max-w-md"
    >
      <div className="p-8 bg-white rounded-xl shadow-xl">
        <h2 className="mb-2 text-2xl font-bold text-center text-gray-800">
          Vamos começar!
        </h2>
        <p className="mb-6 text-center text-gray-500">
          Conte-nos um pouco sobre você.
        </p>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <FormInput
            label="Seu nome"
            type="text"
            name="nome"
            placeholder="Ex: Maria Silva"
            value={nome}
            onChange={handleChange}
          />

          <FormInput
            label="Data de Nascimento"
            type="date"
            name="data_nascimento"
            value={data_nascimento}
            onChange={handleChange}
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Gênero
            </label>
            <div className="grid grid-cols-3 gap-3">
              <SelectionButton
                onClick={() => handleGenderSelect("feminino")}
                isSelected={genero === "feminino"}
              >
                Feminino
              </SelectionButton>
              <SelectionButton
                onClick={() => handleGenderSelect("masculino")}
                isSelected={genero === "masculino"}
              >
                Masculino
              </SelectionButton>
              <SelectionButton
                onClick={() => handleGenderSelect("outro")}
                isSelected={genero === "outro"}
              >
                Outro
              </SelectionButton>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-2 font-medium text-gray-600 transition-colors rounded-lg hover:text-gray-900"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!isStepValid}
              className="px-6 py-3 font-semibold text-white bg-[#FCC3D2] rounded-lg shadow-md transition-all hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#FCC3D2] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
