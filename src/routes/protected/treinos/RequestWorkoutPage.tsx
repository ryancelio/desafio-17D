/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useForm } from "react-hook-form";
import {
  Dumbbell,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { LuArrowLeft } from "react-icons/lu";
import { useNavigate } from "react-router";
import BuyMoreModal from "../components/BuyMoreModal";
// import apiClient from "../api/apiClient";

type RequestForm = {
  qtd_fichas: number;
  observacoes: string;
};

export default function RequestWorkoutPage() {
  const { firebaseUser } = useAuth();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestForm>({
    defaultValues: { qtd_fichas: 1 },
  });

  const navigate = useNavigate();

  const onSubmit = async (data: RequestForm) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const token = await firebaseUser?.getIdToken();
      const response = await fetch(
        "https://dealory.io/api/request_workout.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const res = await response.json();
      if (res.status === 403 && res.json.error === "limit_reached") {
        setLimitReached(true); // Abre o modal
      }
      if (!response.ok) throw new Error(res.error || "Erro ao enviar.");

      setStatus("success");
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
          // type="workout"
          isOpen={limitReached}
          // onClose={() => setLimitReached(false)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantas fichas de treino você deseja? (Máx: 6)
              </label>
              <div className="flex gap-4 flex-wrap items-center justify-center">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <label key={num} className="cursor-pointer">
                    <input
                      type="radio"
                      value={num}
                      {...register("qtd_fichas", { required: true })}
                      className="peer sr-only"
                    />
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-gray-200 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 font-bold transition-all hover:bg-gray-50">
                      {num}
                    </div>
                  </label>
                ))}
              </div>
              {errors.qtd_fichas && (
                <span className="text-xs text-red-500">
                  Selecione uma quantidade.
                </span>
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
                placeholder="Ex: Estou com dores no joelho, prefiro treinos curtos de 30min, quero focar em glúteos..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                O especialista terá acesso ao seu peso, altura, objetivo e
                preferências cadastradas no perfil. Use este campo para detalhes
                extras.
              </p>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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
