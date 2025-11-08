import { useOnboarding } from "../../../context/OnboardingContext";
import type { Genero } from "../../../types/onboarding";
import GeneroButton from "../components/GeneroButton";
import { motion } from "framer-motion";

export default function Step1_Profile() {
  const { onboardingData, updateOnboardingData } = useOnboarding();

  const handleSetGenero = (value: Genero) => {
    updateOnboardingData({
      personal: { ...onboardingData.personal, genero: value },
    });
  };

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{
          type: "tween",
          ease: "circOut",
          duration: 1.2,
          delay: 0.2,
        }}
        viewport={{ once: true }}
        className="mb-4 text-2xl font-semibold"
      >
        Bem-Vind
        <span>
          {onboardingData.personal.genero === "masculino"
            ? "o"
            : onboardingData.personal.genero === "feminino"
            ? "a"
            : "o(a)"}
        </span>
        <span> {onboardingData.personal.nome} </span>
        !
        <br />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{
            type: "tween",
            ease: "circOut",
            duration: 1.6,
            delay: 0.2,
          }}
          viewport={{ once: true }}
        >
          Conte-nos mais sobre você
        </motion.p>
      </motion.h1>
      {/* Info container */}
      <div className="flex flex-col gap-4">
        {/* Nome */}
        <motion.div
          initial={{ opacity: 0, x: "50vw" }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{
            type: "tween",
            ease: "circOut",
            duration: 2,
            delay: 0.2,
          }}
          viewport={{ once: true }}
        >
          <label htmlFor="nome">Qual o seu nome?</label>
          <input
            type="text"
            name="nome"
            id="nome"
            placeholder="Anabelle Mathias"
            className="w-full mt-1 p-2 rounded-lg border border-[#a8f3dc] focus:ring-2 focus:ring-[#8de6c8] focus:outline-none text-gray-800"
            onChange={(e) =>
              updateOnboardingData({
                personal: {
                  ...onboardingData.personal,
                  nome: e.target.value,
                },
              })
            }
            value={onboardingData.personal.nome}
          />
        </motion.div>
        {/* Data de Nascimento */}
        <motion.div
          initial={{ opacity: 0, x: "50vw" }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{
            type: "tween",
            ease: "circOut",
            duration: 2,
            delay: 0.5,
          }}
          viewport={{ once: true }}
        >
          <label htmlFor="nasc">Qual sua data de nascimento?</label>
          <input
            type="date"
            name="nasc"
            id="nasc"
            className="w-full mt-1 p-2 rounded-lg border border-[#a8f3dc] focus:ring-2 focus:ring-[#8de6c8] focus:outline-none text-gray-800"
          />
        </motion.div>
        <motion.div
          className="w-full flex flex-col gap-4"
          initial={{ opacity: 0, x: "50vw" }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{
            type: "tween",
            ease: "circOut",
            duration: 2,
            delay: 0.75,
          }}
          viewport={{ once: true }}
        >
          <label htmlFor="genero">Qual o seu genero?</label>
          <div className="grid grid-cols-3 gap-4">
            <GeneroButton
              variant="masc"
              onClick={() => handleSetGenero("masculino")}
            >
              Masculino
            </GeneroButton>
            <GeneroButton
              variant="fem"
              onClick={() => handleSetGenero("feminino")}
            >
              Feminino
            </GeneroButton>
            <GeneroButton
              variant="neutral"
              onClick={() => handleSetGenero("outro")}
            >
              Outro
            </GeneroButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
