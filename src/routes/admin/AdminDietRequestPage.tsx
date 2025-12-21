import { useEffect, useState } from "react";
import { useNavigate } from "react-router"; // Use react-router-dom se necessário
import {
  LuChefHat,
  LuUser,
  LuArrowRight,
  LuCircleAlert as LuAlertCircle,
} from "react-icons/lu";

interface DietRequest {
  request_id: number;
  user_uid: string;
  nome: string;
  idade: number | string;
  genero: string;
  altura_cm: number;
  peso_alvo_kg: number;
  nivel_atividade: string;
  objetivo: string;
  restricoes_alimentares: string;
  created_at: string;
  user_prefs: { tipo_restricao: string; valor: string }[];
}

export default function AdminDietRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DietRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(
          "https://dealory.io/api/admin/get_diet_requests.php",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <LuChefHat className="text-green-600" /> Solicitações de Dieta
      </h1>

      {loading ? (
        <p>Carregando...</p>
      ) : requests.length === 0 ? (
        <div className="bg-gray-50 p-10 rounded-xl text-center text-gray-500 border border-dashed">
          Nenhuma solicitação pendente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div
              key={req.request_id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
            >
              {/* Header do Card */}
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{req.nome}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <LuUser className="w-3 h-3" /> {req.idade} anos
                      </span>
                      <span>•</span>
                      <span className="capitalize">{req.genero}</span>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg uppercase">
                    {req.objetivo}
                  </span>
                </div>
              </div>

              {/* Corpo do Card */}
              <div className="p-5 flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                      Altura
                    </p>
                    <p className="font-semibold">{req.altura_cm} cm</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                      Peso Alvo
                    </p>
                    <p className="font-semibold">{req.peso_alvo_kg} kg</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    Restrições & Notas
                  </p>
                  <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100 max-h-32 overflow-y-auto">
                    {req.restricoes_alimentares || "Nenhuma observação."}
                  </div>
                </div>

                {/* Preferências do Perfil */}
                {req.user_prefs.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {req.user_prefs.map((p, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100 flex items-center gap-1"
                      >
                        <LuAlertCircle className="w-3 h-3" /> {p.valor}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Ação */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() =>
                    navigate(
                      `/admin/dietas/pedidos/criar?req=${req.request_id}&uid=${
                        req.user_uid
                      }&name=${encodeURIComponent(req.nome)}`
                    )
                  }
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  Criar Dieta <LuArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
