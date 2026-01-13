import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuX,
  LuMessageSquare,
  LuBug,
  LuLightbulb,
  LuHeart,
  LuSend,
  LuLoaderCircle as LuLoader2,
  LuMail, // Novo ícone
  LuCircleHelp as LuHelpCircle, // Novo ícone
} from "react-icons/lu";
import { toast } from "sonner";
import { sendFeedback } from "../api/apiClient";
import { useLocation } from "react-router";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = "bug" | "feature" | "praise" | "other";

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [category, setCategory] = useState<Category>("feature");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Por favor, escreva uma mensagem.");
      return;
    }

    setLoading(true);
    try {
      await sendFeedback({
        category,
        message,
        page_context: location.pathname,
      });
      toast.success("Recebemos sua mensagem! Obrigado.");
      setMessage("");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar. Tente novamente ou use o e-mail.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      id: "feature",
      label: "Sugestão",
      icon: LuLightbulb,
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    },
    {
      id: "bug",
      label: "Problema",
      icon: LuBug,
      color: "text-red-600 bg-red-50 border-red-200",
    },
    {
      id: "praise",
      label: "Elogio",
      icon: LuHeart,
      color: "text-pasPink bg-pink-50 border-pink-200",
    },
    {
      id: "other",
      label: "Outro",
      icon: LuMessageSquare,
      color: "text-gray-600 bg-gray-50 border-gray-200",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[70] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900">
                Enviar Feedback
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Seleção de Categoria */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                    Do que se trata?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id as Category)}
                          className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                            isSelected
                              ? `${cat.color} ring-1 ring-current shadow-sm`
                              : "border-gray-100 text-gray-600 hover:bg-gray-50 bg-white"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              isSelected ? "" : "text-gray-400"
                            }`}
                          />
                          <span className="text-sm font-semibold">
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Area */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva sua ideia, reporte um erro ou mande um elogio..."
                    className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none min-h-[100px] text-sm resize-none transition-all placeholder-gray-400"
                  />
                </div>

                {/* Botão de Envio */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <LuLoader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LuSend className="w-4 h-4" />
                    )}
                    Enviar Feedback
                  </button>
                </div>
              </form>

              {/* SEÇÃO DE SUPORTE / DÚVIDAS */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-4 flex gap-4 items-start">
                  <div className="bg-white p-2 rounded-full text-indigo-600 shadow-sm shrink-0 mt-0.5">
                    <LuHelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Precisa de ajuda ou tem dúvidas?
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Para assuntos relacionados a pagamentos, cancelamentos ou
                      suporte técnico direto, entre em contato via e-mail:
                    </p>
                    <a
                      href="mailto:suporte@powerslim.pro"
                      className="inline-flex items-center gap-2 mt-2 text-indigo-700 font-bold text-sm hover:underline"
                    >
                      <LuMail className="w-3.5 h-3.5" />
                      suporte@powerslim.pro
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
