/* eslint-disable @typescript-eslint/no-explicit-any */
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import type { IPaymentBrickCustomization } from "@mercadopago/sdk-react/esm/bricks/payment/type";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import type { StepProps } from "../OnboardingWizard";
import { motion } from "framer-motion";
import { LuShieldCheck, LuLock, LuLoader as LuLoader2 } from "react-icons/lu";
import { toast } from "sonner";

// Use sua Public Key correta
const PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY_TEST;

export const Checkout: React.FC<StepProps> = ({ onboardingData }) => {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isBrickReady, setIsBrickReady] = useState(false); // Novo estado de controle
  const brickContainerRef = useRef<HTMLDivElement>(null);

  const selectedPlan = onboardingData.selectedPlan;
  const isMonthly = selectedPlan?.planType === "monthly";

  useEffect(() => {
    initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
  }, []);

  // --- FLUXO MENSAL (REDIRECT) ---
  const handleMonthlyRedirect = async () => {
    setLoading(true);
    try {
      if (!firebaseUser) throw new Error("Usuário não autenticado.");
      const token = await firebaseUser.getIdToken();

      const response = await fetch(
        "https://dealory.io/api/create_subscription_redirect.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan_id: selectedPlan?.plan_id,
            cycle: "monthly",
          }),
        }
      );

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
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
      // Tenta encontrar o botão
      if (brickContainerRef.current) {
        const brickButton = brickContainerRef.current.querySelector(
          'button[type="submit"]'
        ) as HTMLButtonElement;

        if (brickButton) {
          brickButton.click(); // Dispara o submit interno do Brick
        } else {
          // Fallback: Tenta achar qualquer botão dentro do form se o seletor específico falhar
          const genericButton =
            brickContainerRef.current.querySelector("form button");
          if (genericButton instanceof HTMLElement) {
            genericButton.click();
          } else {
            console.error("Botão interno do Brick não encontrado.");
            toast.error(
              "O formulário de pagamento ainda está carregando. Tente novamente em alguns segundos."
            );
          }
        }
      }
    }
  };

  // --- CALLBACK DO BRICK (ANUAL) ---
  const onPaymentBrickSubmit = async ({ formData }: any) => {
    setLoading(true);
    try {
      const token = await firebaseUser?.getIdToken();

      const payload = {
        ...formData,
        db_plan_id: selectedPlan?.plan_id,
        cycle: "annually",
      };

      const response = await fetch(
        "https://dealory.io/api/process_payment.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.status === "approved") {
        navigate("/onboard/sucesso");
      } else {
        toast.error(
          "Pagamento não aprovado: " +
            (result.message || "Verifique os dados do cartão")
        );
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
      setLoading(false);
    }
  };

  if (!selectedPlan)
    return (
      <div className="text-red-500 text-center p-10">
        Erro: Nenhum plano selecionado.
      </div>
    );

  const buttonText = loading
    ? "Processando..."
    : isMonthly
    ? "Ir para Pagamento Seguro"
    : `Pagar ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(selectedPlan.price)}`;

  const paymentInitialization = {
    amount: Number(selectedPlan.price),
    payer: {
      email: firebaseUser?.email || "comprador@teste.com",
    },
  };

  const paymentCustomization: IPaymentBrickCustomization = {
    paymentMethods: {
      creditCard: "all",
      bankTransfer: "all",
      maxInstallments: 12,
    },
    visual: {
      style: { theme: "default" },
      hideFormTitle: true,
      // CORREÇÃO AQUI: Deve ser FALSE para o botão existir no DOM
      hidePaymentButton: false,
    },
  };

  // Verifica se o botão deve estar desabilitado
  // Se for mensal, habilita. Se for anual, depende do Brick estar pronto.
  const isButtonDisabled = loading || (!isMonthly && !isBrickReady);

  return (
    <>
      <div className="w-full max-w-md mx-auto pb-32 px-4">
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
          Resumo do Pedido
        </h2>

        {/* Card Resumo */}
        <div className="bg-white p-5 rounded-2xl mb-6 shadow-sm border border-gray-100 flex justify-between items-center">
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

        {isMonthly ? (
          // Fluxo Mensal
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
          // Fluxo Anual (Brick)
          <div
            ref={brickContainerRef}
            className={`relative transition-opacity duration-300 ${
              loading ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            {/* Spinner enquanto o Brick carrega */}
            {!isBrickReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 h-40">
                <LuLoader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            )}

            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 justify-center">
              <LuShieldCheck className="w-4 h-4 text-green-500" />
              <span>Processado por Mercado Pago</span>
            </div>

            {/* CSS hack para esconder o botão nativo do MP sem removê-lo do DOM */}
            <style>{`
              #payment-brick-container form button[type="submit"] {
                visibility: hidden !important;
                position: absolute !important;
                top: 0;
                left: 0;
                height: 0 !important;
                width: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                border: 0 !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
            `}</style>

            <div id="payment-brick-container">
              <Payment
                initialization={paymentInitialization}
                customization={paymentCustomization}
                onSubmit={onPaymentBrickSubmit}
                onReady={() => setIsBrickReady(true)} // Habilita o botão quando pronto
                onError={(err) => console.error("Erro Brick", err)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Botão Fixo */}
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

          <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
            <LuLock className="w-3 h-3" /> Ambiente criptografado.
          </p>
        </div>
      </div>
    </>
  );
};
