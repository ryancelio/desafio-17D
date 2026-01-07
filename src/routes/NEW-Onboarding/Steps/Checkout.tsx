/* eslint-disable @typescript-eslint/no-explicit-any */
import { initMercadoPago, Payment, StatusScreen } from "@mercadopago/sdk-react"; // <--- Importe StatusScreen
// import type { IPaymentBrickCustomization } from "@mercadopago/sdk-react/esm/bricks/payment/type";
// import type { IStat } from "@mercadopago/sdk-react/esm/bricks/payment/type"; // Tipagem
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import type { StepProps } from "../OnboardingWizard";
import { motion } from "framer-motion";
import {
  LuShieldCheck,
  LuLock,
  LuLoader as LuLoader2,
  LuCreditCard,
  LuHeadset,
  LuBadgeCheck,
} from "react-icons/lu";
import { toast } from "sonner";
import apiClient from "../../../api/apiClient";
import type { IStatusScreenBrickCustomization } from "@mercadopago/sdk-react/esm/bricks/statusScreen/types";

// 1. ADICIONE A TIPAGEM GLOBAL DO FACEBOOK PIXEL
declare global {
  interface Window {
    fbq: any;
  }
}

const PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY_TEST;

export const Checkout: React.FC<StepProps> = ({ onboardingData }) => {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isBrickReady, setIsBrickReady] = useState(false);

  // Novo estado para controlar qual Brick exibir
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const brickContainerRef = useRef<HTMLDivElement>(null);

  const selectedPlan = onboardingData.selectedPlan;
  const isMonthly = selectedPlan?.planType === "monthly";

  useEffect(() => {
    initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
  }, []);

  const formatMoney = (val: number | string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(val));
  };

  // 2. FUNÇÃO AUXILIAR PARA DISPARAR O PIXEL
  const trackPurchaseEvent = (transactionId?: string) => {
    if (typeof window.fbq !== "undefined" && selectedPlan) {
      window.fbq("track", "Purchase", {
        value: Number(selectedPlan.price), // Valor do plano
        currency: "BRL",
        content_name: selectedPlan.title, // Nome do plano
        content_ids: [String(selectedPlan.plan_id)], // ID do produto
        content_type: "product",
        order_id: transactionId || "", // ID da transação (opcional mas recomendado)
      });
      console.log("Pixel Purchase Disparado!");
    }
  };

  // --- FLUXO MENSAL (REDIRECT) ---
  const handleMonthlyRedirect = async () => {
    setLoading(true);
    try {
      const data = await apiClient.createSubscriptionRedirect(
        String(selectedPlan?.plan_id),
        "monthly"
      );
      if (data.init_point) {
        window.location.href = data.init_point;
        window.fbq("track", "InitiateCheckout"); // Recomendado para redirect
      } else {
        throw new Error(data.error || "Erro ao gerar link de pagamento.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao conectar: " + error.message);
      setLoading(false);
    }
  };

  // --- AÇÃO DO BOTÃO PERSONALIZADO ---
  const handleCustomSubmit = async () => {
    if (isMonthly) {
      await handleMonthlyRedirect();
    } else {
      // Se já temos um paymentId, o botão serve para resetar ou avançar
      if (paymentId) {
        navigate("/dashboard"); // Ou onde desejar enviar após ver o status
        return;
      }

      if (brickContainerRef.current) {
        const brickButton = brickContainerRef.current.querySelector(
          'button[type="submit"]'
        ) as HTMLButtonElement;

        if (brickButton) {
          brickButton.click();
        } else {
          const genericButton =
            brickContainerRef.current.querySelector("form button");
          if (genericButton instanceof HTMLElement) {
            genericButton.click();
          } else {
            console.error("Botão interno do Brick não encontrado.");
            toast.error("Aguarde o carregamento do formulário.");
          }
        }
      }
    }
  };

  // --- CALLBACK DO PAYMENT BRICK (ANUAL) ---
  const onPaymentBrickSubmit = async ({ formData }: any) => {
    setLoading(true);
    try {
      // Processa no backend
      const result = await apiClient.processPayment(
        formData,
        String(selectedPlan?.plan_id),
        "annually"
      );

      // Independente se aprovou ou falhou, se temos um ID, mostramos a Status Screen
      // O backend DEVE retornar o ID do pagamento (result.id)
      if (result.id) {
        trackPurchaseEvent(String(result.id));
        setPaymentId(String(result.id));
      } else {
        // Erro genérico sem ID do MP
        toast.error("Erro ao processar. Verifique os dados.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro técnico ao processar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  // --- CONFIGURAÇÃO STATUS SCREEN ---
  const statusScreenCustomization: IStatusScreenBrickCustomization = {
    visual: {
      style: {
        theme: "default", // ou 'dark' / 'bootstrap'
      },
      hideTransactionDate: false,
      hideStatusDetails: false,
    },
    backUrls: {
      error: window.location.href, // Volta para tentar de novo
      return: window.location.origin + "/dashboard", // Botão "Ir para o site"
    },
  };

  if (!selectedPlan)
    return (
      <div className="text-red-500 p-10">Erro: Nenhum plano selecionado.</div>
    );

  // Lógica do Texto do Botão Fixo
  let buttonText = "";
  if (loading) buttonText = "Processando...";
  else if (paymentId) buttonText = "Continuar"; // Quando está na tela de status
  else if (isMonthly) buttonText = "Ir para Pagamento Seguro";
  else buttonText = `Pagar ${formatMoney(selectedPlan.price)}`;

  const isButtonDisabled =
    loading || (!isMonthly && !isBrickReady && !paymentId);

  return (
    <>
      <div className="w-full max-w-md mx-auto pb-40 px-4">
        {/* Se tiver paymentId, escondemos o resumo para dar foco ao status, ou mantemos. 
            Geralmente a Status Screen é alta, então esconder o resumo fica mais limpo. */}
        {!paymentId && (
          <>
            <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
              Resumo do Pedido
            </h2>
            <div className="bg-white p-5 rounded-2xl mb-6 shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
              {!isMonthly && (
                <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                  12x SEM JUROS
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Plano Selecionado
                </p>
                <p className="text-lg font-bold text-gray-900 leading-tight">
                  {selectedPlan.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {isMonthly ? "Cobrança mensal" : "Pagamento único anual"}
                </p>
              </div>
              <div className="text-right">
                {isMonthly ? (
                  <>
                    <p className="text-indigo-600 font-bold text-xl">
                      {formatMoney(selectedPlan.price)}
                    </p>
                    <p className="text-xs text-gray-400">/mês</p>
                  </>
                ) : (
                  <div className="flex flex-col items-end">
                    <p className="text-indigo-600 font-bold text-xl flex items-center gap-1">
                      <span className="text-sm font-medium text-indigo-400">
                        12x
                      </span>
                      {formatMoney(Number(selectedPlan.price) / 12)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ou {formatMoney(selectedPlan.price)} à vista
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* LÓGICA DE EXIBIÇÃO DOS BRICKS */}
        {paymentId ? (
          // --- STATUS SCREEN BRICK ---
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <StatusScreen
              initialization={{ paymentId: paymentId }}
              customization={statusScreenCustomization}
              onReady={() => setLoading(false)}
              onError={(error) => console.error(error)}
            />
          </div>
        ) : isMonthly ? (
          // --- MENSAL (REDIRECT) ---
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <LuLock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Checkout Seguro</h3>
              <p className="text-sm text-blue-700 mt-2">
                Você será redirecionado para o ambiente protegido do Mercado
                Pago.
              </p>
            </div>
          </div>
        ) : (
          // --- PAYMENT BRICK ---
          <div
            ref={brickContainerRef}
            className={`relative transition-opacity duration-300 ${
              loading ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            {!isBrickReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 h-40">
                <LuLoader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            )}

            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 justify-center">
              <LuShieldCheck className="w-4 h-4 text-green-500" />
              <span>Processado por Mercado Pago</span>
            </div>

            <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600">
                <LuCreditCard className="w-4 h-4" />
              </div>
              <p className="text-xs text-gray-600 leading-tight">
                Selecione <strong>Cartão de Crédito</strong> abaixo para
                habilitar o parcelamento em até 12x.
              </p>
            </div>

            {/* CSS para esconder botão nativo do brick */}
            <style>{`
              #payment-brick-container form button[type="submit"] {
                visibility: hidden !important;
                position: absolute !important;
                top: 0; left: 0; height: 0 !important; width: 0 !important;
                padding: 0 !important; margin: 0 !important; border: 0 !important;
                opacity: 0 !important; pointer-events: none !important;
              }
            `}</style>

            <div id="payment-brick-container">
              <Payment
                initialization={{
                  amount: Number(selectedPlan.price),
                  payer: {
                    email: firebaseUser?.email || "comprador@teste.com",
                  },
                }}
                customization={{
                  paymentMethods: {
                    creditCard: "all",
                    bankTransfer: "all",
                    maxInstallments: 12,
                  },
                  visual: {
                    style: { theme: "default" },
                    hideFormTitle: true,
                    hidePaymentButton: false,
                  },
                }}
                onSubmit={onPaymentBrickSubmit}
                onReady={() => setIsBrickReady(true)}
                onError={(err) => console.error("Erro Brick", err)}
              />
            </div>
          </div>
        )}

        {/* GRID DE CONFIANÇA (TRUST BADGES) */}
        {!paymentId && (
          <div className="mt-8 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center text-center gap-1">
              <div className="text-green-600 bg-green-50 p-2 rounded-full">
                <LuLock className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-gray-600">
                Dados
                <br />
                Criptografados
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <div className="text-indigo-600 bg-indigo-50 p-2 rounded-full">
                <LuBadgeCheck className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-gray-600">
                Garantia
                <br />
                Comprovada
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <div className="text-blue-600 bg-blue-50 p-2 rounded-full">
                <LuHeadset className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-gray-600">
                Suporte
                <br />
                Humanizado
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botão Fixo com Aviso de Termos */}
      {/* Se quiser esconder esse botão quando o Status Screen aparecer, adicione condição !paymentId */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto">
          <motion.button
            className={`w-full bg-gray-900 text-white font-bold text-lg rounded-xl py-4 shadow-lg flex items-center justify-center gap-2 transition-all ${
              isButtonDisabled
                ? "opacity-75 cursor-not-allowed bg-gray-600"
                : "hover:bg-black active:scale-[0.98]"
            }`}
            onClick={handleCustomSubmit}
            disabled={isButtonDisabled}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {loading && <LuLoader2 className="w-5 h-5 animate-spin" />}
            {buttonText}
          </motion.button>

          {!paymentId && (
            <p className="text-center text-xs text-gray-500 mt-3 mb-1 leading-tight">
              Ao realizar a compra, você concorda com nossos{" "}
              <Link
                to="/termos"
                target="_blank"
                className="text-indigo-600 underline hover:text-indigo-800 font-medium"
              >
                Termos de Uso
              </Link>
              .
            </p>
          )}

          <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1 mt-1">
            <LuLock className="w-3 h-3" /> Ambiente criptografado.
          </p>
        </div>
      </div>
    </>
  );
};
