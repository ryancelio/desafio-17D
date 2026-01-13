import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  ShieldCheck,
  Check,
  Crown,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { differenceInDays, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useAuth } from "../../../context/AuthContext";
import type { IPaymentBrickCustomization } from "@mercadopago/sdk-react/esm/bricks/payment/type";
import type { Plan } from "../../../types/api-types";
import { getPlans, processPayment } from "../../../api/apiClient";

// Chave Pública
const PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY_TEST || "";

export default function RenewPlanPage() {
  const navigate = useNavigate();
  const { userProfile, firebaseUser } = useAuth();

  const [loadingPlan, setLoadingPlan] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [targetPlan, setTargetPlan] = useState<Plan | null>(null);

  // Inicializa MP
  useEffect(() => {
    initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
  }, []);

  // Busca detalhes do plano atual
  useEffect(() => {
    const fetchCurrentPlanDetails = async () => {
      // Se o usuário não tem plano vinculado, redireciona para escolha de planos
      const currentPlanId = userProfile?.subscription?.plan_id;

      if (!currentPlanId) {
        toast.error("Nenhum plano anterior encontrado. Escolha um novo plano.");
        navigate("/assinatura/");
        return;
      }

      try {
        // Buscamos a lista de planos para pegar o preço ATUALIZADO e nome
        // (Idealmente poderia ter um endpoint getPlan(id), mas filtrar a lista funciona)
        const plans = await getPlans(); // Assumindo que você tem esse método
        const found = plans.find((p) => p.id === currentPlanId);

        if (found) {
          setTargetPlan(found);
        } else {
          toast.error("O seu plano antigo não está mais disponível.");
          navigate("/assinatura/");
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar detalhes do plano.");
      } finally {
        setLoadingPlan(false);
      }
    };

    if (userProfile) {
      fetchCurrentPlanDetails();
    }
  }, [userProfile, navigate]);

  // --- LÓGICA DE DATAS ---
  const expirationInfo = (() => {
    if (!userProfile?.subscription?.expires_at) return null;
    const expiresAt = parseISO(userProfile.subscription.expires_at);
    const today = new Date();
    const daysLeft = differenceInDays(expiresAt, today);
    return { daysLeft, date: expiresAt };
  })();

  // --- SUBMIT DO BRICK ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPaymentBrickSubmit = async ({ formData }: any) => {
    if (!targetPlan) return;
    setProcessing(true);

    try {
      // Payload compatível com process_payment.php

      // Usa a função existente que chama /api/process_payment.php
      const result = await processPayment(
        formData,
        targetPlan.id.toString(),
        "annually"
      );

      if (result.status === "approved") {
        toast.success("Renovação realizada com sucesso! +1 Ano garantido.");
        // Pequeno delay para usuário ver o sucesso
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast.error(
          "Pagamento não aprovado: " + (result.message || "Tente outro cartão.")
        );
        setProcessing(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar renovação.");
      setProcessing(false);
    }
  };

  // Configuração do Brick
  const paymentInitialization = {
    amount: targetPlan ? Number(targetPlan.price_annually) : 0,
    payer: {
      email: firebaseUser?.email || "email@user.com",
    },
  };

  const paymentCustomization: IPaymentBrickCustomization = {
    paymentMethods: {
      creditCard: "all",
      bankTransfer: "all", // Pix
      maxInstallments: 12, // Permite parcelar o anual
    },
    visual: {
      style: { theme: "default" },
      hideFormTitle: false,
    },
  };

  if (loadingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!targetPlan) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Renovar Assinatura{" "}
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </h1>
            <p className="text-sm text-gray-500">
              Garanta mais 1 ano de acesso ao seu plano.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Coluna Esquerda: Resumo do Plano */}
          <div className="space-y-6">
            {/* Aviso de Expiração (se houver) */}
            {expirationInfo && (
              <div
                className={`p-4 rounded-xl border ${
                  expirationInfo.daysLeft < 0
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}
              >
                <p className="font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {expirationInfo.daysLeft < 0
                    ? "Sua assinatura expirou."
                    : `Vence em ${expirationInfo.daysLeft} dias.`}
                </p>
                <p className="text-sm mt-1 opacity-90">
                  Renovando agora, seu acesso será estendido até{" "}
                  <strong>
                    {format(
                      new Date(
                        expirationInfo.date.getTime() +
                          365 * 24 * 60 * 60 * 1000
                      ),
                      "dd 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </strong>
                  .
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-900 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                      Você está renovando:
                    </p>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      {targetPlan.name}{" "}
                      <Crown className="w-5 h-5 text-yellow-400" />
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      R${" "}
                      {Number(targetPlan.price_annually)
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>
                    <p className="text-xs text-gray-400">/ ano</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="w-3 h-3 text-green-700" />
                    </div>
                    Pagamento único, sem renovação surpresa.
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="w-3 h-3 text-green-700" />
                    </div>
                    Acesso ininterrupto por 12 meses.
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="w-3 h-3 text-green-700" />
                    </div>
                    Todos os dados e histórico mantidos.
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                <ShieldCheck className="w-5 h-5" /> Ambiente Seguro
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Seus dados de pagamento são processados diretamente pelo Mercado
                Pago com criptografia de ponta a ponta.
              </p>
            </div>
          </div>

          {/* Coluna Direita: Checkout */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 overflow-hidden relative"
            >
              {/* Overlay de Loading */}
              {processing && (
                <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-2" />
                  <p className="text-indigo-900 font-medium animate-pulse">
                    Processando renovação...
                  </p>
                </div>
              )}

              <div className="mb-6 border-b border-gray-100 pb-4">
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Resumo do Pagamento
                </p>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-lg font-bold text-gray-900">
                    Total a pagar
                  </span>
                  <span className="text-2xl font-bold text-indigo-600">
                    R${" "}
                    {Number(targetPlan.price_annually)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                </div>
              </div>

              {/* Garante re-render se o preço mudar */}
              <div key={targetPlan.id}>
                <Payment
                  initialization={paymentInitialization}
                  customization={paymentCustomization}
                  onSubmit={onPaymentBrickSubmit}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
