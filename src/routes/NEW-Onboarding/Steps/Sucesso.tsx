import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router"; // Ou 'react-router' dependendo da versão
import { useAuth } from "../../../context/AuthContext";
import {
  LuCircleCheck as LuCheckCircle,
  LuCircleAlert,
  LuLoader,
} from "react-icons/lu";
import { motion } from "framer-motion";
import apiClient from "../../../api/apiClient";

export const Sucesso: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Validando seu pagamento...");

  useEffect(() => {
    const validatePayment = async () => {
      // 1. Extrai IDs da URL
      const preapprovalId = searchParams.get("preapproval_id");
      const paymentId =
        searchParams.get("payment_id") || searchParams.get("collection_id"); // MP usa collection_id as vezes

      // Se não tiver ID nenhum, talvez o usuário chegou aqui por navegação direta
      // if ((!preapprovalId || preapprovalId === "") && (!paymentId && preapprovalId === "")) {
      //   setStatus("success"); // Assume sucesso se chegou aqui (fallback) ou redireciona
      //   setMessage("Bem-vindo a bordo!");
      //   return;
      // }

      if (!preapprovalId || preapprovalId === "") {
        setStatus("error");
        setMessage(
          "ID de pré-aprovação ausente. Não foi possível validar o pagamento."
        );
        return;
      }

      if (!paymentId || paymentId === "") {
        setStatus("error");
        setMessage(
          "ID de pagamento ausente. Não foi possível validar o pagamento."
        );
        return;
      }

      if (!firebaseUser) return;

      try {
        const data = await apiClient.confirmStatus(preapprovalId, paymentId);

        if (data.status === "active" || data.status === "approved") {
          setStatus("success");
          setMessage("Sua assinatura foi confirmada!");
        } else {
          // Pode ser pendente (boleto, processamento)
          setStatus("success"); // Mostramos sucesso mas avisamos que pode demorar
          setMessage(
            "Pagamento recebido! A liberação pode levar alguns minutos."
          );
        }
      } catch (error) {
        console.error("Erro ao validar:", error);
        setStatus("error");
        setMessage(
          "Houve um erro ao confirmar, mas não se preocupe. Se o pagamento saiu, sua conta será ativada em breve."
        );
      }
    };

    if (firebaseUser) {
      validatePayment();
    }
  }, [firebaseUser, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
      >
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin text-blue-600 mb-4">
              <LuLoader size={64} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Processando...</h2>
            <p className="text-gray-500 mt-2">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="text-green-500 mb-4"
            >
              <LuCheckCircle size={80} />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Parabéns!</h2>
            <p className="text-gray-600 mb-8">{message}</p>

            <button
              onClick={() => navigate("/dashboard")} // Redireciona para o app principal
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Acessar meu Painel
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <div className="text-orange-500 mb-4">
              <LuCircleAlert size={64} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Atenção</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 font-semibold hover:underline"
            >
              Tentar validar novamente
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
