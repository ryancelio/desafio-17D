import { useNavigate } from "react-router";
import { X, Lock, Ticket, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BuyMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: "workout" | "diet"; // Define o tema e o redirecionamento
}

const BuyMoreModal = ({
  isOpen,
  onClose,
  type = "workout",
}: BuyMoreModalProps) => {
  const navigate = useNavigate();

  const handleGoToShop = () => {
    onClose(); // Fecha o modal
    // Redireciona passando o parametro type na URL
    navigate(`/loja/creditos?type=${type}`);
  };

  // Configuração de Cores baseada no tipo
  const theme =
    type === "diet"
      ? {
          iconBg: "bg-emerald-100",
          iconColor: "text-emerald-600",
          btnBorder: "border-emerald-100 hover:border-emerald-500",
          btnBg: "bg-emerald-50",
          textTitle: "text-emerald-900",
          textSub: "text-emerald-600",
          badgeIcon: "text-emerald-600",
        }
      : {
          iconBg: "bg-indigo-100",
          iconColor: "text-indigo-600",
          btnBorder: "border-indigo-100 hover:border-indigo-500",
          btnBg: "bg-indigo-50",
          textTitle: "text-indigo-900",
          textSub: "text-indigo-600",
          badgeIcon: "text-indigo-600",
        };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6 overflow-hidden"
          >
            {/* Botão Fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Ícone de Cadeado */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${theme.iconBg} ${theme.iconColor}`}
            >
              <Lock className="w-8 h-8" />
            </div>

            {/* Texto Principal */}
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-xl font-bold text-gray-900">
                Limite Mensal Atingido
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed px-2">
                Você utilizou todas as solicitações incluídas no seu plano este
                mês.
                <br />
                Mas você pode adquirir <strong>fichas avulsas</strong>!
              </p>
            </div>

            {/* Botão de Ação (Card Clicável) */}
            <button
              onClick={handleGoToShop}
              className={`w-full group flex items-center justify-between p-4 rounded-xl border-2 transition-all ${theme.btnBorder} ${theme.btnBg} relative overflow-hidden`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-white p-2.5 rounded-lg shadow-sm">
                  <Ticket className={`w-6 h-6 ${theme.badgeIcon}`} />
                </div>
                <div className="text-left">
                  <p className={`font-bold text-sm ${theme.textTitle}`}>
                    Comprar Créditos
                  </p>
                  <p className={`text-xs ${theme.textSub} font-medium`}>
                    Acesso imediato e vitalício
                  </p>
                </div>
              </div>

              <ArrowRight
                className={`w-5 h-5 relative z-10 opacity-60 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 ${theme.textSub}`}
              />
            </button>

            {/* Botão Cancelar */}
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-xs text-gray-400 hover:text-gray-600 font-medium hover:underline"
              >
                Voltar e aguardar renovação
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BuyMoreModal;
