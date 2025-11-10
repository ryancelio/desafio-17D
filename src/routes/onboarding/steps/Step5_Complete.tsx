import { motion, type Variants } from "framer-motion";
import { useOnboarding } from "../../../context/OnboardingContext";

// --- 2. Variantes para Animação em Cascata ---
// O container vai orquestrar, e cada 'item' vai animar com base nisso.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2, // Começa a animar os filhos após 0.2s
      staggerChildren: 0.3, // Anima cada filho com 0.3s de diferença
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

// --- 3. O Componente da Página ---
export default function Step5_Complete() {
  const { onboardingData } = useOnboarding();

  // --- 1. Componente de SVG Animado ---
  // Um checkmark que se desenha sozinho, usando as cores do seu tema.
  const AnimatedCheckmark = () => {
    return (
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* O Círculo de fundo (verde-água) */}
        <motion.circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="#A8F3DC" // Cor do seu tema
          strokeWidth="6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {/* O "Check" (rosa) que se desenha */}
        <motion.path
          d="M 30 52 L 44 66 L 70 40"
          fill="none"
          stroke="#FCC3D2" // Cor do seu tema
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: {
              delay: 0.3,
              duration: 0.7,
              type: "spring",
              stiffness: 100,
            },
            opacity: { delay: 0.3, duration: 0.01 },
          }}
        />
      </svg>
    );
  };

  // Pega o primeiro nome do usuário para personalizar
  const firstName = onboardingData.personal.nome.split(" ")[0] || "você";

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full text-center p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* O SVG Animado */}
      <motion.div variants={itemVariants}>
        <AnimatedCheckmark />
      </motion.div>

      {/* Título */}
      <motion.h1
        className="text-2xl font-bold text-gray-800 mt-5"
        variants={itemVariants}
      >
        Tudo pronto, {firstName}!
      </motion.h1>

      {/* Agradecimento */}
      <motion.p className="text-lg text-gray-600 mt-2" variants={itemVariants}>
        Obrigado por completar o seu perfil.
      </motion.p>

      {/* Explicação Final */}
      <motion.p
        className="text-md text-gray-500 mt-8 max-w-md" // max-w-md para melhor leitura
        variants={itemVariants}
      >
        Usaremos todas as informações que você forneceu para criar um plano de
        treino e nutrição 100% personalizado para seus objetivos.
      </motion.p>
    </motion.div>
  );
}
