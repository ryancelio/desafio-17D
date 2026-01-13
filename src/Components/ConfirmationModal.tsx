import { motion, AnimatePresence } from "framer-motion";
import {
  type LucideIcon,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import type { IconType } from "react-icons/lib";

export type ModalVariant = "danger" | "warning" | "success" | "neutral";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  icon?: IconType | LucideIcon;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

// Configuração de Estilos por Variante
const VARIANT_STYLES = {
  danger: {
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    buttonBg: "bg-red-500 hover:bg-red-600",
    buttonText: "text-white",
    defaultIcon: X,
  },
  warning: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    buttonBg: "bg-amber-500 hover:bg-amber-600",
    buttonText: "text-white",
    defaultIcon: AlertTriangle,
  },
  success: {
    iconBg: "bg-green-50", // ou bg-pasGreen/20
    iconColor: "text-green-600",
    buttonBg: "bg-green-600 hover:bg-green-700", // ou pasGreen mais escuro
    buttonText: "text-white",
    defaultIcon: CheckCircle2,
  },
  neutral: {
    iconBg: "bg-pasPink/10",
    iconColor: "text-pasPink",
    buttonBg: "bg-gray-900 hover:bg-black",
    buttonText: "text-white",
    defaultIcon: Info,
  },
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  icon,
  variant = "neutral",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
}: ConfirmationModalProps) {
  const styles = VARIANT_STYLES[variant];
  const IconComponent = icon || styles.defaultIcon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Escuro e com Blur) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="fixed inset-0 z-99 bg-black/60 backdrop-blur-[2px]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              <div className="p-6 text-center">
                {/* Ícone Animado */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5 ${styles.iconBg}`}
                >
                  <IconComponent className={`w-8 h-8 ${styles.iconColor}`} />
                </motion.div>

                {/* Textos */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    {description}
                  </p>
                )}

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors active:scale-95 disabled:opacity-50"
                  >
                    {cancelText}
                  </button>

                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${styles.buttonBg} ${styles.buttonText}`}
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processando...
                      </>
                    ) : (
                      confirmText
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
