import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import type { IPaymentBrickCustomization } from "@mercadopago/sdk-react/esm/bricks/payment/type";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../../context/AuthContext"; // Ajuste o caminho
import { motion } from "framer-motion";
import {
  LuShieldCheck,
  LuLock,
  LuLoader as LuLoader2,
  LuArrowLeft,
} from "react-icons/lu";
import { toast } from "sonner";

// Use sua Public Key correta (mesma do onboarding)
const PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY_TEST;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { firebaseUser, refetchProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isBrickReady, setIsBrickReady] = useState(false);
  const brickContainerRef = useRef<HTMLDivElement>(null);

  // Recupera o plano selecionado vindo do state da navegação
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedPlan = (location.state as any)?.selectedPlan;

  // Validar se existe plano selecionado
  useEffect(() => {
    if (!selectedPlan) {
      navigate("/assinatura"); // Volta se tentar acessar direto
    }
  }, [selectedPlan, navigate]);

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

      // Usa o mesmo endpoint de criação, pois a lógica backend deve lidar com update ou create
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
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        toast.error("Erro ao conectar: " + error.message);
      } else {
        toast.error("Erro ao conectar: Falha na requisição");
      }
      setLoading(false);
    }
  };

  // --- AÇÃO DO BOTÃO PERSONALIZADO ---
  const handleCustomSubmit = async () => {
    if (isMonthly) {
      await handleMonthlyRedirect();
    } else {
      // Dispara o botão oculto do Brick
      if (brickContainerRef.current) {
        const brickButton = brickContainerRef.current.querySelector(
          'button[type="submit"]'
        ) as HTMLButtonElement;

        if (brickButton) {
          brickButton.click();
        } else {
          // Fallback
          const genericButton =
            brickContainerRef.current.querySelector("form button");
          if (genericButton instanceof HTMLElement) {
            genericButton.click();
          } else {
            console.error("Botão interno do Brick não encontrado.");
            toast.error("Aguarde o carregamento completo do formulário.");
          }
        }
      }
    }
  };

  // --- CALLBACK DO BRICK (ANUAL) ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        await refetchProfile(); // Atualiza status global
        toast.error("Pagamento aprovado! Seu plano foi atualizado.");
        navigate("/assinatura"); // Volta para gestão
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

  if (!selectedPlan) return null; // Ou loading

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
      hidePaymentButton: false, // Importante: mantemos no DOM mas escondemos via CSS
    },
  };

  const isButtonDisabled = loading || (!isMonthly && !isBrickReady);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Simples */}
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
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
          Resumo do Pedido
        </h2>

        {/* Card Resumo */}
        <div className="bg-white p-5 rounded-2xl mb-6 shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
              Novo Plano
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
                Pago para autorizar a assinatura.
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
            {/* Spinner Overlay */}
            {!isBrickReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 h-40 rounded-xl">
                <LuLoader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            )}

            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 justify-center">
              <LuShieldCheck className="w-4 h-4 text-green-500" />
              <span>Processado por Mercado Pago</span>
            </div>

            {/* CSS Hack para esconder botão nativo */}
            <style>{`
              #payment-brick-container form button[type="submit"] {
                visibility: hidden !important;
                position: absolute !important;
                top: 0; left: 0; height: 0 !important; width: 0 !important;
                opacity: 0 !important; pointer-events: none !important;
              }
            `}</style>

            <div id="payment-brick-container">
              <Payment
                initialization={paymentInitialization}
                customization={paymentCustomization}
                onSubmit={onPaymentBrickSubmit}
                onReady={() => setIsBrickReady(true)}
                onError={(err) => console.error("Erro Brick", err)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Botão Fixo de Ação */}
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
    </div>
  );
}
