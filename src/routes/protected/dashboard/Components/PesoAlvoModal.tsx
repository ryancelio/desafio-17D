import { motion, type Variants } from "framer-motion";
import { useState } from "react";
import { LuX } from "react-icons/lu";
import { useAuth } from "../../../../context/AuthContext";

const PesoAlvoModal: React.FC<{
  onClose: () => void;
  onSave: (novoPesoAlvo: number) => void;
}> = ({ onClose, onSave }) => {
  const { userProfile } = useAuth();
  const [novoPesoAlvo, setNovoPesoAlvo] = useState(
    (userProfile?.profile.peso_alvo || "0").toString()
  );

  const modalAnimation = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  };
  const formVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave(Number(novoPesoAlvo));
    setNovoPesoAlvo("0");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center h-full justify-center"
      onClick={onClose}
    >
      <motion.div
        variants={modalAnimation}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative bg-gray-50 rounded-t-2xl sm:rounded-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full sm:hidden" />

        <div className="p-6 pt-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Nova meta de Peso
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
            >
              <LuX className="w-6 h-6" />
            </button>
          </div>
          <motion.form
            variants={formVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <motion.div variants={itemVariants}>
              <label className="text-sm font-medium text-gray-600">
                Meta de peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={novoPesoAlvo}
                onChange={(e) => setNovoPesoAlvo(e.target.value)}
                className="mt-1 w-full p-3 bg-gray-100 rounded-lg border-2 border-transparent focus:border-pasPink focus:bg-white focus:ring-0 transition"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                className="w-full bg-pasPink text-gray-900 font-bold py-3.5 rounded-lg hover:bg-pasPink/90 focus:outline-none focus:ring-4 focus:ring-pasPink/30 transition-all duration-300"
              >
                Salvar Meta
              </button>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PesoAlvoModal;
