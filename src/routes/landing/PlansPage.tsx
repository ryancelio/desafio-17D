import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  LuZap,
  LuCheck,
  LuX,
  LuCircleHelp,
  LuArrowRight,
  LuStar,
  LuShieldCheck,
  LuLoaderCircle,
} from "react-icons/lu";
import apiClient from "../../api/apiClient";
import type { Plan } from "../../types/api-types";

// --- COMPONENTES AUXILIARES ---

const FaqItem: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left focus:outline-none group"
      >
        <span className="font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
          {question}
        </span>
        <span
          className={`text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-0" : "rotate-45"
          }`}
        >
          <LuX className="w-5 h-5" />
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-40 opacity-100 pb-4" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-gray-500 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---

export default function PlansPage() {
  const navigate = useNavigate();
  const [activePlans, setActivePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "annual"
  );

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await apiClient.getPlans(true);
        // Ordena por preço para ficar bonito (Gratuito -> Mais caro)
        setActivePlans(data.sort((a, b) => a.price_monthly - b.price_monthly));
      } catch (error) {
        console.error("Erro ao carregar planos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Filtra planos ativos
  //   const activePlans = plans.filter((p) => p.is_active);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <LuZap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Power Slim
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors hidden sm:block"
            >
              Já sou aluno
            </Link>
            <button
              onClick={() => navigate("/onboard")}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* HERO & PRICING */}
      <section className="pt-32 pb-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header Texto */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Invista na sua melhor versão.
            </h1>
            <p className="text-xl text-gray-500 mb-8">
              Planos flexíveis que se adaptam ao seu objetivo. Sem taxas
              escondidas, cancele quando quiser.
            </p>

            {/* Toggle Switch */}
            <div className="flex justify-center items-center gap-3">
              <span
                className={`text-sm font-bold ${
                  billingCycle === "monthly" ? "text-gray-900" : "text-gray-400"
                }`}
              >
                Mensal
              </span>
              <button
                onClick={() =>
                  setBillingCycle(
                    billingCycle === "monthly" ? "annual" : "monthly"
                  )
                }
                className="relative w-16 h-8 bg-indigo-600 rounded-full p-1 transition-colors hover:bg-indigo-700 focus:outline-none"
              >
                <motion.div
                  layout
                  className="w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{
                    x: billingCycle === "monthly" ? 0 : 32,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span
                className={`text-sm font-bold flex items-center gap-2 ${
                  billingCycle === "annual" ? "text-gray-900" : "text-gray-400"
                }`}
              >
                Anual
                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Economize ~17%
                </span>
              </span>
            </div>
          </div>

          {/* Grid de Planos */}
          {loading ? (
            <div className="flex justify-center py-20">
              <LuLoaderCircle className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {activePlans.map((plan, idx) => {
                const isFeatured = plan.is_featured || idx === 1; // Força destaque no meio se não tiver flag

                // Lógica de Preço
                const price =
                  billingCycle === "monthly"
                    ? plan.price_monthly
                    : plan.price_annually / 12; // Divide por 12 para mostrar "equivalente mensal"

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative p-8 rounded-3xl border-2 flex flex-col h-full transition-transform hover:-translate-y-1 duration-300 ${
                      isFeatured
                        ? "bg-white border-indigo-600 shadow-2xl z-10 scale-105 md:scale-110"
                        : "bg-white border-gray-100 shadow-xl"
                    }`}
                  >
                    {isFeatured && billingCycle === "annual" && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                        Mais Escolhido
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-2">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-medium text-gray-500">
                          R$
                        </span>
                        <span className="text-4xl font-extrabold text-gray-900">
                          {price.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-gray-500">/mês</span>
                      </div>

                      {/* Texto de suporte para Anual */}
                      {billingCycle === "annual" && plan.price_annually > 0 && (
                        <p className="text-xs text-gray-400 mt-2 font-medium">
                          Faturado anualmente em R${" "}
                          {plan.price_annually.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      )}

                      {plan.price_monthly === 0 && (
                        <p className="text-xs text-gray-400 mt-2 font-medium">
                          100% Gratuito para sempre
                        </p>
                      )}
                    </div>

                    <div className="flex-1">
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                isFeatured
                                  ? "bg-indigo-100 text-indigo-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              <LuCheck className="w-3 h-3" />
                            </div>
                            <span className="text-sm text-gray-600 leading-tight">
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => navigate("/onboard")}
                      className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        isFeatured
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                          : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {plan.price_monthly === 0
                        ? "Criar Conta Grátis"
                        : "Quero este plano"}
                      {isFeatured && <LuArrowRight className="w-4 h-4" />}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* VANTAGENS / GARANTIA */}
      <section className="py-16 bg-white px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LuShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Pagamento Seguro</h3>
            <p className="text-sm text-gray-500">
              Processado pelo Mercado Pago. Seus dados protegidos com
              criptografia.
            </p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LuStar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Qualidade Premium</h3>
            <p className="text-sm text-gray-500">
              Treinos montados com base científica e adaptação inteligente.
            </p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LuCircleHelp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Suporte Dedicado</h3>
            <p className="text-sm text-gray-500">
              Time disponível no WhatsApp para tirar dúvidas sobre sua
              assinatura.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-gray-500">Tire suas dúvidas antes de começar.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <FaqItem
              question="Posso cancelar a qualquer momento?"
              answer="Sim! No plano mensal, você pode cancelar quando quiser e terá acesso até o fim do ciclo. No plano anual, você garante o desconto e o acesso pelos 12 meses."
            />
            <FaqItem
              question="Como funcionam os treinos personalizados?"
              answer="Após assinar, você preencherá um formulário (anamnese) com seus dados, objetivos e local de treino. Nossa inteligência cria sua ficha baseada nisso."
            />
            <FaqItem
              question="O que acontece se eu não gostar?"
              answer="Confiamos tanto no nosso método que oferecemos acesso gratuito no plano básico para você testar a interface e a metodologia antes de fazer o upgrade."
            />
            <FaqItem
              question="Quais as formas de pagamento?"
              answer="Aceitamos Cartão de Crédito (com parcelamento no plano anual) e PIX com aprovação imediata."
            />
            <FaqItem
              question="Serve para iniciantes?"
              answer="Com certeza. Temos uma vasta biblioteca de exercícios com vídeos explicativos e níveis de intensidade adaptáveis."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-gray-800 p-2 rounded-lg text-white">
              <LuZap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-white">Power Slim</span>
          </div>
          <p className="text-xs opacity-50">
            &copy; {new Date().getFullYear()} Power Slim. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
