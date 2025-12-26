/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dumbbell,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
} from "lucide-react";
import { LuArrowLeft } from "react-icons/lu";
import { useNavigate } from "react-router";
import BuyMoreModal from "../components/BuyMoreModal";
import apiClient from "../../../api/apiClient";

export type RequestForm = {
  qtd_fichas: number;
  observacoes: string;
};

export default function RequestWorkoutPage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  // Novo estado para controlar o máximo permitido
  const [maxAllowed, setMaxAllowed] = useState<number>(0);
  const [loadingCredits, setLoadingCredits] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestForm>({
    defaultValues: { qtd_fichas: 1 },
  });

  const navigate = useNavigate();

  // 1. Carregar Créditos ao iniciar
  useEffect(() => {
    const loadCredits = async () => {
      try {
        const data = await apiClient.getAllCredits();
        // Pega o total restante (Plano + Extra)
        const total = data.workout?.details?.total_remaining || 0;
        setMaxAllowed(total);

        // Se o usuário não tem crédito nenhum, já prepara o modal ou bloqueia
        if (total === 0) {
          // Opcional: setLimitReached(true);
        }
      } catch (err) {
        console.error("Erro ao carregar créditos", err);
      } finally {
        setLoadingCredits(false);
      }
    };
    loadCredits();
  }, []);

  const onSubmit = async (data: RequestForm) => {
    // Validação extra no front antes de enviar
    if (data.qtd_fichas > maxAllowed) {
      setLimitReached(true);
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await apiClient.requestWorkoutPlan(data);

      if (res.error === "limit_reached") {
        setLimitReached(true);
      } else if (!res.message?.includes("success")) {
        throw new Error(res.error || "Erro ao enviar.");
      } else {
        setStatus("success");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-full">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">
          Solicitação Enviada!
        </h2>
        <p className="text-gray-600 mt-2">
          Nossos especialistas irão analisar seu perfil e montar seu treino em
          breve.
        </p>
        <button
          onClick={() => (window.location.href = "/treinos")}
          className="mt-6 btn-primary"
        >
          Voltar para Treinos
        </button>
      </div>
    );
  }

  return (
    <>
      {limitReached && (
        <BuyMoreModal
          isOpen={limitReached}
          onClose={() => setLimitReached(false)}
          type="workout" // Define que é crédito de treino
        />
      )}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <LuArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nova Ficha</h1>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Solicitar Ficha Personalizada
              </h1>
              <p className="text-sm text-gray-500">
                Peça um novo treino focado nos seus objetivos atuais.
              </p>
            </div>
          </div>

          {status === "error" && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Quantidade */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Quantas fichas de treino você deseja?
                </label>
                {!loadingCredits && (
                  <span
                    className={`text-xs font-bold ${
                      maxAllowed === 0 ? "text-red-500" : "text-indigo-600"
                    }`}
                  >
                    Disponíveis: {maxAllowed}
                  </span>
                )}
              </div>

              {loadingCredits ? (
                <div className="py-4 text-center text-gray-400 text-sm">
                  <Loader2 className="inline animate-spin mr-2" /> Carregando
                  créditos...
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap items-center justify-start">
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const isDisabled = num > maxAllowed;
                    return (
                      <label
                        key={num}
                        className={`relative cursor-pointer ${
                          isDisabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={(e) => {
                          if (isDisabled) {
                            e.preventDefault();
                            setLimitReached(true); // Abre modal se clicar no bloqueado
                          }
                        }}
                      >
                        <input
                          type="radio"
                          value={num}
                          disabled={isDisabled}
                          {...register("qtd_fichas", { required: true })}
                          className="peer sr-only"
                        />
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-gray-200 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 font-bold transition-all hover:bg-gray-50">
                          {num}
                        </div>
                        {isDisabled && (
                          <div className="absolute -top-1 -right-1 bg-gray-200 rounded-full p-0.5 text-gray-500">
                            <Lock className="w-3 h-3" />
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
              {errors.qtd_fichas && (
                <span className="text-xs text-red-500">
                  Selecione uma quantidade.
                </span>
              )}
              {maxAllowed === 0 && !loadingCredits && (
                <p className="text-xs text-red-500 mt-2 font-medium">
                  Você não possui créditos suficientes. Adicione mais créditos
                  para solicitar.
                </p>
              )}
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações Adicionais
              </label>
              <textarea
                {...register("observacoes")}
                rows={4}
                placeholder="Ex: Estou com dores no joelho, prefiro treinos curtos de 30min..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === "loading" || maxAllowed === 0}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send />
              )}
              Enviar Solicitação
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
