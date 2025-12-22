import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import {
  LuUtensils,
  LuSend,
  LuLoader as LuLoader2,
  LuArrowLeft,
  LuLeaf,
  LuDumbbell,
  LuActivity,
  LuUser,
  LuRuler,
  LuWeight,
  LuHeart,
  LuCalendar,
  LuCircleAlert,
} from "react-icons/lu";
import { useAuth } from "../../../../context/AuthContext";
import apiClient from "../../../../api/apiClient";
import type { DietRequestPayload } from "../../../../types/models";

// Helper para calcular idade
const calculateAge = (dateString?: string | null) => {
  if (!dateString || dateString === null) return "--";
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper para formatar nível de atividade
const formatActivity = (level?: string) => {
  const map: Record<string, string> = {
    sedentario: "Sedentário",
    leve: "Levemente Ativo",
    moderado: "Moderado",
    ativo: "Ativo",
    muito_ativo: "Muito Ativo",
  };
  return level ? map[level] || level : "Não informado";
};

export default function RequestDietPage() {
  const { firebaseUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  const { register, handleSubmit, setValue } = useForm<DietRequestPayload>({
    defaultValues: {
      objetivo: "emagrecimento",
      refeicoes_dia: "3",
      suplementos: "",
      restricoes: "",
    },
  });

  // --- 1. Sincronizar dados do Perfil (Tabela Users) ---
  useEffect(() => {
    if (userProfile?.profile.objetivo) {
      const mapObj: Record<string, string> = {
        perder_peso: "emagrecimento",
        ganhar_massa: "hipertrofia",
        definir: "manutencao",
      };
      const formValue = mapObj[userProfile.profile.objetivo] || "emagrecimento";
      setValue("objetivo", formValue as DietRequestPayload["objetivo"]);
    }
  }, [userProfile, setValue]);

  // --- 2. Buscar Preferências (Tabela User_Preferences) ---
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!firebaseUser) return;
      try {
        const data = await apiClient.getUserPreferences();

        if (Array.isArray(data) && data.length > 0) {
          const formattedText = data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((p: any) => {
              const tipo =
                p.tipo_restricao.charAt(0).toUpperCase() +
                p.tipo_restricao.slice(1);
              return `${tipo}: ${p.valor}`;
            })
            .join("\n");

          setValue("restricoes", formattedText);
        }
      } catch (err) {
        console.error("Erro ao carregar preferências", err);
      } finally {
        setLoadingPrefs(false);
      }
    };
    fetchPreferences();
  }, [firebaseUser, setValue]);

  const onSubmit = async (data: DietRequestPayload) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await apiClient.requestDietPlan(data);

      if (res.success) {
        // Redireciona para /dietas passando um state para exibir o Toast de sucesso lá
        navigate("/dietas", { state: { newRequest: true } });
      } else {
        throw new Error("Falha ao processar a resposta.");
      }
    } catch (err: unknown) {
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).response?.data?.error ||
        (err instanceof Error ? err.message : "Erro desconhecido.");
      setErrorMsg(message);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
        >
          <LuArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LuUtensils className="text-green-600" /> Solicitar Dieta
          </h1>
          <p className="text-sm text-gray-500">
            Personalize sua alimentação com um especialista.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: Resumo Visual do Perfil */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-green-100 p-6 rounded-3xl shadow-sm sticky top-8">
            <h3 className="font-bold text-green-800 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
              <LuUser className="w-4 h-4" /> Dados do Perfil
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Estes dados já constam no nosso sistema e serão usados para
              calcular suas necessidades calóricas.
            </p>

            <div className="space-y-4">
              {/* Altura */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-green-600">
                    <LuRuler />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Altura
                  </span>
                </div>
                <span className="font-bold text-gray-800">
                  {userProfile?.profile.altura_cm || "--"} cm
                </span>
              </div>

              {/* Peso Alvo */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-green-600">
                    <LuWeight />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Meta Peso
                  </span>
                </div>
                <span className="font-bold text-gray-800">
                  {userProfile?.profile.peso_alvo || "--"} kg
                </span>
              </div>

              {/* Idade (Calculada) */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-green-600">
                    <LuCalendar />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Idade
                  </span>
                </div>
                <span className="font-bold text-gray-800">
                  {calculateAge(userProfile?.profile.data_nascimento)} anos
                </span>
              </div>

              {/* Nível Atividade */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-green-600">
                    <LuActivity />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Atividade
                  </span>
                </div>
                <span className="font-bold text-gray-800 text-xs text-right max-w-20">
                  {formatActivity(userProfile?.profile.nivel_atividade)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 text-center">
                Precisa corrigir algo?{" "}
                <span
                  onClick={() => navigate("/perfil/editar")}
                  className="text-green-600 underline cursor-pointer"
                >
                  Editar Perfil
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Formulário */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
                <LuCircleAlert className="shrink-0" />
                <span className="text-sm font-medium">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Objetivo */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Objetivo para esta dieta
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "emagrecimento", label: "Perder Peso", icon: LuLeaf },
                    {
                      id: "hipertrofia",
                      label: "Ganhar Massa",
                      icon: LuDumbbell,
                    },
                    {
                      id: "manutencao",
                      label: "Saúde / Manter",
                      icon: LuHeart,
                    },
                  ].map((opt) => (
                    <label key={opt.id} className="cursor-pointer relative">
                      <input
                        type="radio"
                        value={opt.id}
                        {...register("objetivo", { required: true })}
                        className="peer sr-only"
                      />
                      <div className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-gray-100 bg-gray-50 hover:bg-white hover:border-green-200 transition-all peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-800 h-full">
                        <opt.icon className="w-6 h-6 mb-2 opacity-50 peer-checked:opacity-100" />
                        <span className="font-semibold text-sm">
                          {opt.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferências */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Refeições por dia
                  </label>
                  <select
                    {...register("refeicoes_dia")}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  >
                    <option value="3">3 (Café, Almoço, Jantar)</option>
                    <option value="4">4 (Inclui lanche)</option>
                    <option value="5">5 (Inclui ceia)</option>
                    <option value="6">6 (Refeições frequentes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Usa suplementos?
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Whey, Creatina..."
                    {...register("suplementos")}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Restrições (Pré-preenchido) */}
              <div>
                <label className="text-sm font-bold text-gray-800 mb-2 flex justify-between items-end">
                  <span>Restrições e Preferências</span>
                  {loadingPrefs && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <LuLoader2 className="animate-spin" /> Carregando do
                      perfil...
                    </span>
                  )}
                </label>
                <textarea
                  {...register("restricoes")}
                  rows={6}
                  placeholder="Carregando suas preferências..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none text-sm leading-relaxed"
                ></textarea>
                <p className="text-xs text-gray-400 mt-2">
                  Trouxemos suas preferências cadastradas. Sinta-se à vontade
                  para adicionar mais detalhes para esta solicitação específica.
                </p>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-gray-200"
              >
                {status === "loading" ? (
                  <LuLoader2 className="animate-spin" />
                ) : (
                  <LuSend />
                )}
                Enviar Solicitação
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
