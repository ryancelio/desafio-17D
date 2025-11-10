import { useEffect } from "react";
import { useOnboarding } from "../../../context/OnboardingContext";
import type { Genero } from "../../../types/onboarding";
import GeneroButton from "../components/GeneroButton";
import { motion } from "framer-motion";

export default function Step1_Profile() {
  const { onboardingData, updateOnboardingData, setStepValid } =
    useOnboarding();

  const currentGenero = onboardingData.personal.genero;

  const handleSetGenero = (value: Genero) => {
    updateOnboardingData({
      personal: { ...onboardingData.personal, genero: value },
    });
  };

  useEffect(() => {
    const nomeValido = onboardingData.personal.nome.trim().length > 2;
    const generoValido = onboardingData.personal.genero !== "";
    const dataValida = onboardingData.personal.data_nascimento != ""; // (Exemplo)

    console.log(nomeValido);
    console.log(generoValido);
    console.log(dataValida);

    setStepValid(nomeValido && generoValido && dataValida);
  }, [onboardingData.personal, setStepValid]);

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
          <label className="text-gray-800" htmlFor="nome">
            Qual o seu nome?
          </label>
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
          <label className="text-gray-800" htmlFor="nasc">
            Qual sua data de nascimento?
          </label>
          <input
            type="date"
            name="nasc"
            id="nasc"
            value={onboardingData.personal.data_nascimento}
            onChange={(e) =>
              updateOnboardingData({
                personal: {
                  ...onboardingData.personal,
                  data_nascimento: e.target.value,
                },
              })
            }
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
          <label className="text-gray-800" htmlFor="genero">
            Qual o seu genero?
          </label>
          <div className="grid grid-cols-3 gap-4">
            <GeneroButton
              variant="masc"
              onClick={() => handleSetGenero("masculino")}
              isSelected={currentGenero === "masculino"}
            >
              Masculino
            </GeneroButton>
            <GeneroButton
              variant="fem"
              onClick={() => handleSetGenero("feminino")}
              isSelected={currentGenero === "feminino"}
            >
              Feminino
            </GeneroButton>
            <GeneroButton
              variant="neutral"
              onClick={() => handleSetGenero("outro")}
              isSelected={currentGenero === "outro"}
            >
              Outro
            </GeneroButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
