import { initMercadoPago, Payment, StatusScreen } from "@mercadopago/sdk-react";
import type { IStatusScreenBrickCustomization } from "@mercadopago/sdk-react/esm/bricks/statusScreen/types";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import { motion } from "framer-motion";
import {
  LuShieldCheck,
  LuLock,
  LuLoader as LuLoader2,
  LuArrowLeft,
  LuUser,
  LuCreditCard,
  LuBadgeCheck,
  LuHeadset,
} from "react-icons/lu";
import { toast } from "sonner";
import {
  createSubscriptionRedirect,
  processPayment,
  processPixPayment,
  isApiError,
} from "../../../api/apiClient";

// Função auxiliar de máscara
const cpfMask = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY_TEST;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { firebaseUser, refetchProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isBrickReady, setIsBrickReady] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [cpf, setCpf] = useState("");

  const brickContainerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedPlan = (location.state as any)?.selectedPlan;

  useEffect(() => {
    if (!selectedPlan) {
      navigate("/assinatura");
    }
    initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
  }, [selectedPlan, navigate]);

  const isMonthly = selectedPlan?.planType === "monthly";

  // --- TRATAMENTO DE ERROS DE PROMOÇÃO ---
  const handleCheckoutError = (error: unknown) => {
    console.error(error);
    let msg = "Erro ao processar.";
    let status = 0;

    if (isApiError(error)) {
      msg = error.response?.data?.error || error.message;
      status = error.response?.status || 0;
    } else if (error instanceof Error) {
      msg = error.message;
    }

    // Se o erro for de escassez (409 Conflict vindo do PHP)
    if (status === 409 || msg.includes("esgotada")) {
      toast.error("Promoção Esgotada!", {
        description: "Infelizmente as vagas para este plano acabaram agora.",
        duration: 5000,
      });
      // Opcional: Redirecionar após um tempo
      setTimeout(() => navigate("/assinatura"), 3000);
    } else {
      toast.error(msg);
    }
    setLoading(false);
  };

  // --- FLUXO MENSAL (REDIRECT) ---
  const handleMonthlyRedirect = async () => {
    setLoading(true);
    try {
      const data = await createSubscriptionRedirect(
        selectedPlan?.plan_id,
        "monthly"
      );
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || "Erro ao gerar link de pagamento.");
      }
    } catch (error: unknown) {
      handleCheckoutError(error);
    }
  };

  // --- AÇÃO DO BOTÃO FIXO ---
  const handleCustomSubmit = async () => {
    if (paymentId) {
      await refetchProfile();
      navigate("/assinatura");
      return;
    }

    if (isMonthly) {
      await handleMonthlyRedirect();
    } else {
      if (cpf.length < 14) {
        toast.error("Por favor, preencha seu CPF corretamente.");
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
          if (genericButton instanceof HTMLElement) genericButton.click();
        }
      }
    }
  };

  // --- CALLBACK DO BRICK ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPaymentBrickSubmit = async (param: any) => {
    const { selectedPaymentMethod, formData } = param;

    setLoading(true);

    try {
      let result;
      const cpfFromBrick = formData.payer?.identification?.number;
      const finalCpf = cpfFromBrick || cpf.replace(/\D/g, "");

      const methodId = formData.payment_method_id || formData.paymentMethodId;
      const isPix =
        selectedPaymentMethod === "bank_transfer" ||
        selectedPaymentMethod === "pix" ||
        methodId === "pix";

      if (isPix) {
        if (!finalCpf) {
          toast.error("CPF é obrigatório para Pix.");
          setLoading(false);
          return;
        }

        result = await processPixPayment({
          db_plan_id: selectedPlan?.plan_id,
          doc_number: finalCpf,
          payment_method_id: "pix",
          email: formData.payer.email || firebaseUser?.email,
        });
      } else {
        if (!formData.payer.identification && finalCpf) {
          formData.payer.identification = { type: "CPF", number: finalCpf };
        }

        result = await processPayment(
          formData,
          selectedPlan?.plan_id,
          "annually"
        );
      }

      if (result.id) {
        setPaymentId(String(result.id));
        toast.success(isPix ? "QR Code gerado!" : "Pagamento processado!");
      } else {
        throw new Error("Resposta inválida do servidor.");
      }
    } catch (error: unknown) {
      handleCheckoutError(error);
    }
  };

  const statusScreenCustomization: IStatusScreenBrickCustomization = {
    visual: {
      style: { theme: "default" },
      hideTransactionDate: false,
      hideStatusDetails: false,
    },
    backUrls: {
      error: window.location.href,
      return: window.location.origin + "/assinatura",
    },
  };

  if (!selectedPlan) return null;

  let buttonText = "";
  if (loading) buttonText = "Processando...";
  else if (paymentId) buttonText = "Voltar para Assinatura";
  else if (isMonthly) buttonText = "Ir para Pagamento Seguro";
  else
    buttonText = `Pagar ${new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(selectedPlan.price)}`;

  const isButtonDisabled =
    loading || (!isMonthly && (!isBrickReady || cpf.length < 14) && !paymentId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white p-4 border-b border-gray-200 sticky top-0 z-20 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
        >
          <LuArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Finalizar Compra</h1>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto p-6 pb-32">
        {!paymentId && (
          <>
            <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
              Resumo do Pedido
            </h2>
            <div className="bg-white p-5 rounded-2xl mb-6 shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
              {/* Badge de Escassez (Opcional, apenas visual) */}
              {selectedPlan?.max_limit && (
                <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                  VAGAS LIMITADAS
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
                  {isMonthly ? "Cobrança mensal" : "Anual (Cartão ou Pix)"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-indigo-600 font-bold text-xl">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(selectedPlan.price)}
                </p>
                <p className="text-xs text-gray-400">
                  {isMonthly ? "/mês" : "/ano"}
                </p>
              </div>
            </div>
          </>
        )}

        {paymentId ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <StatusScreen
              initialization={{ paymentId: paymentId }}
              customization={statusScreenCustomization}
              onReady={() => setLoading(false)}
              onError={(error) => console.error(error)}
            />
          </div>
        ) : isMonthly ? (
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
          <div
            ref={brickContainerRef}
            className={`relative transition-opacity duration-300 space-y-4 ${
              loading ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <LuUser className="text-gray-400" /> CPF do Titular
              </label>
              <input
                type="tel"
                value={cpf}
                onChange={(e) => setCpf(cpfMask(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 font-mono"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Necessário para emissão do Pix ou Nota Fiscal.
              </p>
            </div>

            {!isBrickReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 h-40 rounded-xl">
                <LuLoader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            )}

            <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 justify-center">
              <LuShieldCheck className="w-4 h-4 text-green-500" />
              <span>Processado por Mercado Pago</span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600">
                <LuCreditCard className="w-4 h-4" />
              </div>
              <p className="text-xs text-gray-600 leading-tight">
                Para parcelar em <strong>12x</strong>, selecione Cartão de
                Crédito.
              </p>
            </div>

            <style>{`
              #payment-brick-container form button[type="submit"] {
                display: none !important;
              }
            `}</style>

            <div id="payment-brick-container">
              <Payment
                initialization={{
                  amount: Number(selectedPlan.price),
                  payer: {
                    email: firebaseUser?.email || "comprador@teste.com",
                    identification: {
                      type: "CPF",
                      number: cpf.replace(/\D/g, ""),
                    },
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

        {/* RODAPÉ DE CONFIANÇA */}
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
      </main>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
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
            <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
              <LuLock className="w-3 h-3" /> Ambiente criptografado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
