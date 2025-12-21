import { useEffect, useState } from "react";
// import { useAuth } from "../../context/AuthContext";
import {
  LuUser,
  LuClipboardList,
  //   LuCheckSquare,
  LuX,
  LuArrowRight,
} from "react-icons/lu";
import { CheckSquare } from "lucide-react";

interface WorkoutRequest {
  request_id: number;
  user_uid: string;
  nome: string;
  email: string;
  qtd_fichas: number;
  observacoes: string;
  status: string;
  created_at: string;
  // Dados do perfil para ajudar o admin
  objetivo_atual: string;
  nivel_atividade: string;
  peso_atual: any;
  altura_cm: number;
  genero: string;
  preferencias: { tipo_restricao: string; valor: string }[];
}

export default function AdminRequestsPage() {
  // const { firebaseUser } = useAuth();
  const [requests, setRequests] = useState<WorkoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<WorkoutRequest | null>(null);

  // Carregar Pedidos
  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Aqui você usaria o token do firebase, supondo que o usuário logado é ADMIN
      const res = await fetch(
        "https://dealory.io/api/admin/get_workout_requests.php",
        {
          credentials: "include", // Uncomment if you are using sessions and require cookies
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

  useEffect(() => {
    fetchRequests();
  }, []);

  // Marcar como concluído
  const handleComplete = async (reqId: number) => {
    if (
      !window.confirm(
        "Deseja marcar este pedido como concluído? Certifique-se de ter criado as fichas."
      )
    )
      return;
    try {
      await fetch("https://dealory.io/api/admin/complete_request.php", {
        method: "POST",
        body: JSON.stringify({ request_id: reqId, status: "concluido" }),
      });
      fetchRequests(); // Recarrega lista
      setSelectedReq(null); // Fecha modal
    } catch (err) {
      alert("Erro ao concluir.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <LuClipboardList /> Solicitações de Treino
      </h1>

      {loading ? (
        <p>Carregando...</p>
      ) : requests.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-xl text-center text-gray-500">
          Nenhuma solicitação pendente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => (
            <div
              key={req.request_id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{req.nome}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">
                  {req.qtd_fichas} Ficha(s)
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                <span className="font-semibold">Obs:</span>{" "}
                {req.observacoes || "Nenhuma observação."}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {req.objetivo_atual}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {req.genero}
                </span>
              </div>

              <button
                onClick={() => setSelectedReq(req)}
                className="w-full py-2 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
              >
                Analisar & Criar <LuArrowRight />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE DETALHES DO CLIENTE E AÇÃO */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Elaborar Treino: {selectedReq.nome}
              </h2>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <LuX />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Coluna 1: Dados do Cliente */}
              <div className="md:col-span-1 bg-gray-50 p-4 rounded-xl space-y-3 text-sm">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <LuUser /> Perfil do Aluno
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-500">Idade/Gênero:</span>{" "}
                    {selectedReq.genero}
                  </p>
                  <p>
                    <span className="text-gray-500">Altura:</span>{" "}
                    {selectedReq.altura_cm}cm
                  </p>
                  <p>
                    <span className="text-gray-500">Peso Atual:</span>{" "}
                    {selectedReq.peso_atual}kg
                  </p>
                  <p>
                    <span className="text-gray-500">Objetivo:</span>{" "}
                    <span className="uppercase font-bold text-indigo-600">
                      {selectedReq.objetivo_atual}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Nível:</span>{" "}
                    {selectedReq.nivel_atividade}
                  </p>
                </div>

                <hr className="border-gray-200" />

                <h4 className="font-bold text-gray-700">
                  Preferências & Restrições
                </h4>
                {selectedReq.preferencias.length > 0 ? (
                  <ul className="list-disc pl-4 text-gray-600">
                    {selectedReq.preferencias.map((pref, i) => (
                      <li key={i}>
                        {pref.tipo_restricao}: {pref.valor}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">
                    Nenhuma restrição cadastrada.
                  </p>
                )}

                <hr className="border-gray-200" />

                <h4 className="font-bold text-gray-700">Pedido Atual</h4>
                <p>
                  <span className="font-semibold">Qtd:</span>{" "}
                  {selectedReq.qtd_fichas} fichas
                </p>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-yellow-800 mt-2">
                  "{selectedReq.observacoes}"
                </div>
              </div>

              {/* Coluna 2 e 3: Área de Ação */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-blue-900 mb-2">
                    Instruções para o Admin
                  </h3>
                  <ol className="list-decimal pl-5 text-sm text-blue-800 space-y-1">
                    <li>Analise os dados ao lado.</li>
                    <li>
                      Acesse o <strong>Criador de Treinos</strong> (em outra aba
                      ou navegue via menu) para criar as fichas para o UID:{" "}
                      <code className="bg-white px-1 rounded">
                        {selectedReq.user_uid}
                      </code>
                      .
                    </li>
                    <li>
                      Após salvar as fichas no sistema, clique no botão abaixo
                      para finalizar este pedido.
                    </li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      window.open(
                        `/admin/treinos/pedidos/criar?uid=${selectedReq.user_uid}`,
                        "_blank"
                      )
                    }
                    className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                  >
                    Abrir Criador de Treinos
                  </button>
                </div>

                <hr />

                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-2">
                    Já criou as {selectedReq.qtd_fichas} fichas solicitadas?
                  </p>
                  <button
                    onClick={() => handleComplete(selectedReq.request_id)}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 ml-auto"
                  >
                    <CheckSquare /> Concluir Solicitação
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
