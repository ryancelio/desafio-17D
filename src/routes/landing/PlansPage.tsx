import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  LuCheck,
  LuX,
  LuCircleHelp,
  LuArrowRight,
  LuStar,
  LuShieldCheck,
  LuLoaderCircle,
  LuCalendarClock,
  LuBanknote,
} from "react-icons/lu";
import LandingLayout from "./LandingLayout";
import type { Plan } from "../../types/api-types";
import { getPlans } from "../../api/apiClient";

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
        <span className="font-semibold text-gray-700 group-hover:text-pasPink transition-colors">
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
  // Estado para armazenar TODOS os planos brutos da API
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "annual"
  );

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlans(true);

        // ORDENAÇÃO: Featured primeiro, depois menor preço
        const sortedData = data.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return a.price_monthly - b.price_monthly;
        });

        // Armazena todos os planos no estado principal
        setAllPlans(sortedData);
      } catch (error) {
        console.error("Erro ao carregar planos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // --- FILTRAGEM DINÂMICA (CORREÇÃO AQUI) ---
  // Filtra os planos a serem exibidos com base no ciclo selecionado
  const displayedPlans = useMemo(() => {
    return allPlans.filter((plan) => {
      // Se o ciclo selecionado for "ANUAL", Oculta planos com preço anual <= 0
      if (billingCycle === "annual") {
        return plan.price_annually > 0.01; // Garante que não seja zero ou muito próximo
      }
      // Se for "MENSAL", mostra todos (já que a promoção é mensal)
      return true;
    });
  }, [allPlans, billingCycle]);

  // --- CÁLCULO DINÂMICO DO MAIOR DESCONTO ---
  const maxDiscount = useMemo(() => {
    if (allPlans.length === 0) return 0;

    let max = 0;
    allPlans.forEach((plan) => {
      if (plan.price_monthly > 0 && plan.price_annually > 0) {
        const totalIfMonthly = plan.price_monthly * 12;
        const totalAnnual = plan.price_annually;
        const savings = totalIfMonthly - totalAnnual;
        const percentage = (savings / totalIfMonthly) * 100;

        if (percentage > max) {
          max = percentage;
        }
      }
    });

    return Math.round(max);
  }, [allPlans]);

  // Handler de navegação com state
  const handleSelectPlan = (plan: Plan) => {
    navigate("/onboard", {
      state: {
        selectedPlan: {
          ...plan,
          planType: billingCycle, // Passa se é monthly ou annually
          price:
            billingCycle === "monthly"
              ? plan.price_monthly
              : plan.price_annually,
        },
      },
    });
  };

  return (
    <LandingLayout>
      {/* HERO & PRICING */}
      <section className="pt-32 pb-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header Texto */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Invista na sua melhor versão.
            </h1>
            <p className="text-xl text-gray-500 mb-8">
              Planos flexíveis que se adaptam ao seu objetivo. Escolha a melhor
              opção para sua jornada.
            </p>

            {/* --- SELETOR MENSAL/ANUAL ANIMADO --- */}
            <div className="inline-flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100 relative">
              {/* Botão Mensal */}
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-colors duration-200 ${
                  billingCycle === "monthly"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Mensal
                {billingCycle === "monthly" && (
                  <motion.div
                    layoutId="billingSelector"
                    className="absolute inset-0 bg-pasPink rounded-full -z-10 shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>

              {/* Botão Anual */}
              <button
                onClick={() => setBillingCycle("annual")}
                className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-colors duration-200 flex items-center gap-2 ${
                  billingCycle === "annual"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Anual
                {maxDiscount > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide border transition-colors ${
                      billingCycle === "annual"
                        ? "bg-white/80 text-gray-900 border-transparent backdrop-blur-sm"
                        : "bg-pasGreen/10 text-pasGreen-700 border-pasGreen/20"
                    }`}
                  >
                    Até {maxDiscount}% OFF
                  </span>
                )}
                {/* Elemento Animado de Fundo (Compartilhado) */}
                {billingCycle === "annual" && (
                  <motion.div
                    layoutId="billingSelector"
                    className="absolute inset-0 bg-pasPink rounded-full -z-10 shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Grid de Planos */}
          {loading ? (
            <div className="flex justify-center py-20">
              <LuLoaderCircle className="w-10 h-10 animate-spin text-pasPink" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {displayedPlans.map((plan, idx) => {
                const isFeatured = plan.is_featured;

                // --- CÁLCULOS FINANCEIROS ---
                const monthlyPrice = plan.price_monthly;
                const annualTotal = plan.price_annually;
                const annualInstallment = annualTotal / 12;

                const displayPrice =
                  billingCycle === "annual" ? annualInstallment : monthlyPrice;

                const yearlySavings = monthlyPrice * 12 - annualTotal;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative p-8 rounded-4xl border-2 flex flex-col h-full transition-all duration-300 ${
                      isFeatured
                        ? "bg-white border-pasPink shadow-2xl z-10 scale-105 md:scale-110 order-first md:order-0"
                        : "bg-white border-gray-100 shadow-xl opacity-90 hover:opacity-100 hover:border-gray-200"
                    }`}
                  >
                    {isFeatured && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pasPink text-gray-900 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 w-max">
                        <LuStar className="w-3 h-3 fill-gray-900" /> Mais
                        Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-4">
                        {plan.name}
                      </h3>

                      <div>
                        {/* Preço Riscado (Ancoragem) - Só aparece no Anual */}
                        {billingCycle === "annual" && (
                          <p className="text-sm text-gray-400 line-through font-medium mb-1">
                            De R$ {monthlyPrice.toFixed(2).replace(".", ",")}
                            /mês
                          </p>
                        )}

                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-medium text-gray-500">
                            R$
                          </span>
                          <span
                            className={`font-extrabold text-gray-900 ${
                              isFeatured ? "text-5xl" : "text-4xl"
                            }`}
                          >
                            {displayPrice.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-gray-500">/mês</span>
                        </div>

                        {/* Detalhes do Pagamento */}
                        <div className="mt-3 min-h-15">
                          {billingCycle === "annual" ? (
                            <div className="bg-pasGreen/10 border border-pasGreen/20 rounded-lg p-2.5">
                              <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                <LuBanknote className="w-3.5 h-3.5" />
                                12x de R${" "}
                                {annualInstallment.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                              {yearlySavings > 0 && (
                                <p className="text-[10px] text-pasGreen-700 mt-1 font-semibold">
                                  Total de R${" "}
                                  {annualTotal.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                  })}{" "}
                                  (Economize R$ {yearlySavings.toFixed(0)})
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                              <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                                <LuCalendarClock className="w-3.5 h-3.5" />
                                Cobrado mensalmente
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                Sem fidelidade. Cancele quando quiser.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="h-px w-full bg-gray-100 mb-6"></div>
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                isFeatured
                                  ? "bg-pasPink/20 text-gray-900"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              <LuCheck className="w-3 h-3" />
                            </div>
                            <span className="text-sm text-gray-600 leading-tight font-medium">
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                        isFeatured
                          ? "bg-pasPink text-gray-900 hover:bg-pasPink/90 shadow-pasPink/30"
                          : "bg-pasGreen text-gray-800 hover:bg-pasGreen/90 shadow-pasGreen/10"
                      }`}
                    >
                      Quero este plano
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
      <section className="py-24 bg-white px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="p-6">
            <div className="w-14 h-14 bg-pasGreen text-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pasGreen/20">
              <LuShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">
              Pagamento Seguro
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Processado pelo Mercado Pago. Seus dados são protegidos com
              criptografia de ponta a ponta.
            </p>
          </div>
          <div className="p-6">
            <div className="w-14 h-14 bg-pasPink text-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pasPink/30">
              <LuStar className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">
              Qualidade Premium
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Fichas montadas com base científica e adaptação inteligente para o
              seu corpo e objetivo.
            </p>
          </div>
          <div className="p-6">
            <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gray-900/20">
              <LuCircleHelp className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">
              Suporte Dedicado
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Time disponível no WhatsApp para tirar dúvidas sobre sua
              assinatura ou uso do app.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gray-50 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-gray-500">Tire suas dúvidas antes de começar.</p>
          </div>

          <div className="bg-white rounded-4xl p-6 md:p-10 shadow-sm border border-gray-100">
            <FaqItem
              question="Posso cancelar a qualquer momento?"
              answer="Sim! No plano mensal, você pode cancelar quando quiser e terá acesso até o fim do ciclo. No plano anual, você garante o desconto e o acesso pelos 12 meses."
            />
            <FaqItem
              question="Como funcionam os treinos personalizados?"
              answer="Após assinar, você preencherá um formulário (anamnese) com seus dados, objetivos e local de treino. Nossa inteligência cria sua ficha baseada nisso."
            />
            <FaqItem
              question="Existe período de teste?"
              answer="Você tem 7 dias de garantia incondicional. Se não gostar, devolvemos seu dinheiro integralmente, sem perguntas."
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
    </LandingLayout>
  );
}
