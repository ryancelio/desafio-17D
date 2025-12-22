import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  LuChefHat,
  LuUser,
  LuArrowRight,
  LuCircleAlert as LuAlertCircle,
  LuFileText,
  LuInfo,
  LuCalendar,
} from "react-icons/lu";
import { getDietRequests } from "./shared/AdminApi"; // Ajuste o caminho conforme sua estrutura

// Interface estendida para o Admin (pois o PHP faz join com a tabela users)
interface AdminDietRequest {
  request_id: number;
  user_uid: string;
  // Dados do Usuário
  nome: string;
  idade: number | string;
  genero: string;
  altura_cm: number;
  peso_alvo_kg: number;
  nivel_atividade: string;
  // Dados do Pedido
  objetivo: string;
  restricoes: string; // Nova coluna
  observacoes: string; // Nova coluna (suplementos, refeições/dia)
  created_at: string;
  // Dados Calculados/Joins
  user_prefs: { tipo_restricao: string; valor: string }[];
}

export default function AdminDietRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AdminDietRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Agora usamos a função centralizada da adminApi
        // O retorno precisa ser compatível com a interface AdminDietRequest
        // (Assumindo que o PHP do admin retorna o join completo)
        const data = await getDietRequests();

        // Cast forçado se a tipagem do adminApi for a genérica,
        // ou ajuste o adminApi para retornar AdminDietRequest[]
        if (Array.isArray(data)) {
          setRequests(data as unknown as AdminDietRequest[]);
        }
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <LuChefHat className="text-green-600 w-8 h-8" />
          Solicitações de Dieta
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
            {requests.length} pendentes
          </span>
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">
          Carregando solicitações...
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-2xl text-center border-2 border-dashed border-gray-200">
          <LuFileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            Nenhuma solicitação pendente no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div
              key={req.request_id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              {/* Header do Card */}
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {req.nome}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                        <LuUser className="w-3 h-3" /> {req.idade} anos
                      </span>
                      <span className="capitalize">{req.genero}</span>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-green-200">
                    {req.objetivo}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                  <LuCalendar className="w-3 h-3" />
                  Solicitado em{" "}
                  {new Date(req.created_at).toLocaleDateString("pt-BR")}
                </div>
              </div>

              {/* Corpo do Card */}
              <div className="p-5 flex-1 space-y-4">
                {/* Métricas */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                      Altura
                    </p>
                    <p className="font-bold text-gray-700">
                      {req.altura_cm} cm
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                      Peso Alvo
                    </p>
                    <p className="font-bold text-gray-700">
                      {req.peso_alvo_kg} kg
                    </p>
                  </div>
                </div>

                {/* Restrições (Destaque) */}
                {req.restricoes && (
                  <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                    <p className="text-[10px] font-bold text-red-400 uppercase mb-1 flex items-center gap-1">
                      <LuAlertCircle className="w-3 h-3" /> Restrições
                      Alimentares
                    </p>
                    <p className="text-sm text-red-800 leading-snug whitespace-pre-wrap">
                      {req.restricoes}
                    </p>
                  </div>
                )}

                {/* Observações / Suplementos */}
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-400 uppercase mb-1 flex items-center gap-1">
                    <LuInfo className="w-3 h-3" /> Detalhes & Suplementos
                  </p>
                  <p className="text-sm text-blue-800 leading-snug whitespace-pre-wrap">
                    {req.observacoes || "Sem observações adicionais."}
                  </p>
                </div>

                {/* Preferências do Perfil (Tags) */}
                {req.user_prefs && req.user_prefs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                    {req.user_prefs.map((p, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200 font-medium"
                      >
                        {p.tipo_restricao}: {p.valor}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Ação */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                <button
                  onClick={() =>
                    navigate(
                      `/admin/dietas/pedidos/criar?req=${req.request_id}&uid=${
                        req.user_uid
                      }&name=${encodeURIComponent(req.nome)}`
                    )
                  }
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                >
                  Criar Plano Alimentar <LuArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
