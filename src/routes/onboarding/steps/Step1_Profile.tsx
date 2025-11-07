import { motion } from "framer-motion";
import { useOnboarding } from "../../../context/OnboardingContext";

// ... (constantes de animação - permanecem as mesmas)
const stepAnimationVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};
const stepTransition = { duration: 0.4, ease: "easeInOut" };

export default function Step1_Profile() {
  const { formData, setFormData } = useOnboarding();
  const { profile } = formData;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    // ... (lógica do handleChange - permanece a mesma)
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [name]:
          name === "altura_cm" ? (value === "" ? "" : parseInt(value)) : value,
      },
    }));
  };

  // ⬇️⬇️ VARIÁVEL REMOVIDA DAQUI ⬇️⬇️
  // const inputBaseClass = `...`;

  return (
    <motion.div
      variants={stepAnimationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={stepTransition}
      className="flex flex-col gap-6" // StepWrapper
    >
      <h1 className="text-3xl font-bold text-gray-800 text-center">
        Vamos começar. Quem é você?
      </h1>

      {/* FieldGroup */}
      <div className="flex flex-col w-full">
        <label
          htmlFor="nome"
          className="text-sm font-semibold text-gray-800 mb-2"
        >
          Nome Completo
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={profile.nome}
          onChange={handleChange}
          // ⬇️⬇️ CLASSES APLICADAS DIRETAMENTE ⬇️⬇️
          className="
            w-full py-3 px-4 text-base border border-gray-300 rounded-xl bg-white text-gray-800 
            transition-all duration-200 
            focus:outline-none focus:border-pastel-mint focus:ring-2 focus:ring-pastel-mint/50
          "
        />
      </div>

      {/* FieldGroup */}
      <div className="flex flex-col w-full">
        <label
          htmlFor="data_nascimento"
          className="text-sm font-semibold text-gray-800 mb-2"
        >
          Data de Nascimento
        </label>
        <input
          type="date"
          id="data_nascimento"
          name="data_nascimento"
          value={profile.data_nascimento}
          onChange={handleChange}
          // ⬇️⬇️ CLASSES APLICADAS DIRETAMENTE ⬇️⬇️
          className="
            w-full py-3 px-4 text-base border border-gray-300 rounded-xl bg-white text-gray-800 
            transition-all duration-200 
            focus:outline-none focus:border-pastel-mint focus:ring-2 focus:ring-pastel-mint/50
          "
        />
      </div>

      {/* FieldGroup */}
      <div className="flex flex-col w-full">
        <label
          htmlFor="genero"
          className="text-sm font-semibold text-gray-800 mb-2"
        >
          Gênero
        </label>
        <select
          id="genero"
          name="genero"
          value={profile.genero}
          onChange={handleChange}
          // ⬇️⬇️ CLASSES APLICADAS DIRETAMENTE ⬇️⬇️
          className={`
            w-full py-3 px-4 text-base border border-gray-300 rounded-xl bg-white text-gray-800 
            transition-all duration-200 
            focus:outline-none focus:border-pastel-mint focus:ring-2 focus:ring-pastel-mint/50
            appearance-none 
            bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%23718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 10 13 14 9"%3e%3c/polyline%3e%3c/svg%3e')] 
            bg-no-repeat bg-right-2.5 bg-center pr-10
          `}
        >
          <option value="" disabled>
            Selecione...
          </option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      {/* FieldGroup */}
      <div className="flex flex-col w-full">
        <label
          htmlFor="altura_cm"
          className="text-sm font-semibold text-gray-800 mb-2"
        >
          Altura (cm)
        </label>
        <input
          type="number"
          id="altura_cm"
          name="altura_cm"
          value={profile.altura_cm}
          onChange={handleChange}
          placeholder="Ex: 175"
          // ⬇️⬇️ CLASSES APLICADAS DIRETAMENTE ⬇️⬇️
          className="
            w-full py-3 px-4 text-base border border-gray-300 rounded-xl bg-white text-gray-800 
            transition-all duration-200 
            focus:outline-none focus:border-pastel-mint focus:ring-2 focus:ring-pastel-mint/50
          "
        />
      </div>
    </motion.div>
  );
}
