import { motion } from "framer-motion";
import { useState } from "react";
import { LuX } from "react-icons/lu";

// --- NOVO: Modal para Adicionar Consumo ---
const AddNutritionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    agua: number;
    proteinas: number;
    fibras: number;
    calorias: number;
  }) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [agua, setAgua] = useState("0");
  const [proteinas, setProteinas] = useState("0");
  const [fibras, setFibras] = useState("0");
  const [calorias, setCalorias] = useState("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Envia apenas os valores adicionados. O backend cuidará da soma.
    // A função onSave no Dashboard precisará ser ajustada para esta nova lógica.
    onSave({
      agua: parseFloat(agua.trim()),
      proteinas: parseInt(proteinas.trim(), 10),
      fibras: parseInt(fibras.trim(), 10),
      calorias: parseInt(calorias.trim(), 10),
    });
    onClose(); // Fecha o modal após salvar
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative bg-white rounded-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Adicionar Consumo</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <LuX className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Água (Litros)
            </label>
            <input
              type="number"
              step="0.1"
              value={agua}
              onChange={(e) => setAgua(e.target.value)}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Proteínas (g)
            </label>
            <input
              type="number"
              value={proteinas}
              onChange={(e) => setProteinas(e.target.value)}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Fibras (g)
            </label>
            <input
              type="number"
              value={fibras}
              onChange={(e) => setFibras(e.target.value)}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Calorias (kcal)
            </label>
            <input
              type="number"
              value={calorias}
              onChange={(e) => setCalorias(e.target.value)}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Salvar Consumo
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddNutritionModal;
