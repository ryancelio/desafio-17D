import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { LuX, LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface FullscreenImageViewerProps {
  photos: string[];
  startIndex: number;
  onClose: () => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const imageVariants = {
  hidden: (direction: number) => ({
    x: direction > 0 ? "50%" : "-50%",
    opacity: 0,
  }),
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 250, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "50%" : "-50%",
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

export default function FullscreenImageViewer({
  photos,
  startIndex,
  onClose,
}: FullscreenImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Permite fechar com a tecla 'Escape'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm"
      onClick={onClose} // Fecha ao clicar no fundo
    >
      {/* Botão de Fechar */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute top-4 right-4 z-50 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
        onClick={onClose}
        aria-label="Fechar imagem"
      >
        <LuX className="h-6 w-6" />
      </motion.button>

      {/* Navegação Anterior */}
      {photos.length > 1 && (
        <button
          className="absolute left-2 md:left-4 z-50 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Foto anterior"
        >
          <LuChevronLeft className="h-8 w-8" />
        </button>
      )}

      {/* Imagem Principal */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={currentIndex}
          src={`/api/${photos[currentIndex]}`}
          custom={direction}
          variants={imageVariants as Variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()} // Impede que o clique na imagem feche o modal
        />
      </AnimatePresence>

      {/* Navegação Próxima */}
      {photos.length > 1 && (
        <button
          className="absolute right-2 md:right-4 z-50 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Próxima foto"
        >
          <LuChevronRight className="h-8 w-8" />
        </button>
      )}
    </motion.div>
  );
}
