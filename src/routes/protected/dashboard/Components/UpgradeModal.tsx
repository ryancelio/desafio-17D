import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Sparkles, X, Lock } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Card do Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header com Gradiente */}
            <div className="bg-linear-to-r from-pasPink to-pasGreen p-6 text-center text-gray-900">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/30 shadow-inner backdrop-blur-md">
                <Lock className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold">Funcionalidade Premium</h3>
              <p className="text-gray-800/80 text-sm mt-1">
                Disponível nos planos com acesso a IA
              </p>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              <p className="text-center text-gray-600 mb-6">
                Solicitar uma ficha personalizada para um especialista é uma
                vantagem exclusiva. Faça o upgrade para desbloquear:
              </p>

              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="h-5 w-5 text-pasGreen shrink-0" />
                  <span>Treinos montados por especialistas reais</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="h-5 w-5 text-pasGreen shrink-0" />
                  <span>Ajustes baseados no seu objetivo</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="h-5 w-5 text-pasGreen shrink-0" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onUpgrade}
                  className="w-full rounded-xl bg-pasPink py-3.5 font-bold text-gray-900 shadow-lg transition-transform hover:bg-pasPink/90 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Sparkles /> Fazer Upgrade Agora
                </button>
                <button
                  onClick={onClose}
                  className="w-full rounded-xl py-3 font-semibold text-gray-500 hover:bg-gray-50"
                >
                  Talvez depois
                </button>
              </div>
            </div>

            {/* Botão Fechar X */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-800/70 hover:text-gray-900 bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
