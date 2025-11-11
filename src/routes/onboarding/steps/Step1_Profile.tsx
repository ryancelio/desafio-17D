import { useEffect, useState } from "react";
import { useOnboarding } from "../../../context/OnboardingContext";
import {
  step1PersonalValidationSchema,
  type Genero,
} from "../../../types/onboarding.schema";
import GeneroButton from "../components/GeneroButton";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert } from "react-icons/lu";

export default function Step1_Profile() {
  const { onboardingData, updateOnboardingData, setStepValid } =
    useOnboarding();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const { personal } = onboardingData;

  const currentGenero = personal.genero;

  const handleSetGenero = (value: Genero) => {
    updateOnboardingData({
      personal: { ...personal, genero: value },
    });
    if (!touched.genero) {
      handleBlur("genero");
    }
  };

  // 3. useEffect ATUALIZADO com Zod
  useEffect(() => {
    // Tenta validar os dados pessoais
    const result = step1PersonalValidationSchema.safeParse(personal);

    // 4. Atualiza o contexto (Layout) sobre a validade
    setStepValid(result.success);

    // 5. Atualiza o estado de erros local
    if (!result.success) {
      // Formata os erros do Zod para um objeto { campo: "mensagem" }
      const fieldErrors = result.error.flatten().fieldErrors;
      const formattedErrors: Record<string, string> = {};

      // Pega apenas a primeira mensagem de erro de cada campo
      for (const key in fieldErrors) {
        if (fieldErrors[key as keyof typeof fieldErrors]) {
          formattedErrors[key] =
            fieldErrors[key as keyof typeof fieldErrors]![0];
        }
      }
      setErrors(formattedErrors);
    } else {
      setErrors({}); // Limpa os erros se for válido
    }
  }, [personal, setStepValid]);

  // 5. Função de Renderização (Agora verifica 'touched' E 'errors')
  const renderError = (field: string) => {
    // SÓ MOSTRA o erro se o campo foi "tocado" E se ele tem um erro
    if (!touched[field] || !errors[field]) return null;

    return (
      <AnimatePresence>
        <motion.p
          className="flex items-center gap-1 text-sm text-red-600 mt-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <LuCircleAlert className="w-4 h-4" />
          {errors[field]}
        </motion.p>
      </AnimatePresence>
    );
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
          <label className="text-gray-800" htmlFor="nome">
            Qual o seu nome? <span className="text-red-500"> *</span>
          </label>
          <input
            type="text"
            name="nome"
            id="nome"
            onBlur={() => handleBlur("nome")}
            placeholder="Anabelle Mathias"
            className={`w-full mt-1 p-2 rounded-lg border focus:outline-none text-gray-800 ${
              touched.nome && errors.nome
                ? "border-red-500 ring-2 ring-red-200"
                : "border-[#a8f3dc] focus:ring-2 focus:ring-[#8de6c8]"
            }`}
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
          {renderError("nome")}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: "50vw" }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{
            type: "tween",
            ease: "circOut",
            duration: 2,
            delay: 0.35, // Delay ajustado
          }}
          viewport={{ once: true }}
        >
          <label className="text-gray-800" htmlFor="altura_cm">
            Qual a sua altura (cm)? <span className="text-red-500"> *</span>
          </label>
          <input
            type="number" // Usa 'number' pois o estado é 'number'
            inputMode="numeric" // Teclado numérico no mobile
            name="altura_cm"
            id="altura_cm"
            onBlur={() => handleBlur("altura_cm")}
            placeholder="170"
            className={`w-full mt-1 p-2 rounded-lg border focus:outline-none text-gray-800 ${
              touched.altura_cm && errors.altura_cm
                ? "border-red-500 ring-2 ring-red-200"
                : "border-[#a8f3dc] focus:ring-2 focus:ring-[#8de6c8]"
            }`}
            onChange={(e) =>
              updateOnboardingData({
                personal: {
                  ...personal,
                  // Converte para número, usa 0 se vazio (que falha na validação .positive())
                  altura_cm: isNaN(e.target.valueAsNumber)
                    ? 0
                    : e.target.valueAsNumber,
                },
              })
            }
            // Não mostra o '0' inicial, mostra string vazia
            value={personal.altura_cm === 0 ? "" : personal.altura_cm}
          />
          {renderError("altura_cm")}
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
            Qual sua data de nascimento?{" "}
            <span className="text-red-500"> *</span>
          </label>
          <input
            type="date"
            name="nasc"
            id="nasc"
            onBlur={() => handleBlur("data_nascimento")}
            value={onboardingData.personal.data_nascimento}
            onChange={(e) =>
              updateOnboardingData({
                personal: {
                  ...onboardingData.personal,
                  data_nascimento: e.target.value,
                },
              })
            }
            className={`w-full mt-1 p-2 rounded-lg border focus:outline-none text-gray-800 ${
              touched.data_nascimento && errors.data_nascimento
                ? "border-red-500 ring-2 ring-red-200"
                : "border-[#a8f3dc] focus:ring-2 focus:ring-[#8de6c8]"
            }`}
          />
          {renderError("data_nascimento")}
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
            Qual o seu genero? <span className="text-red-500"> *</span>
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
          {renderError("genero")}
        </motion.div>
      </div>
    </div>
  );
}
