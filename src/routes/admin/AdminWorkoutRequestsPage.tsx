import { useEffect, useState } from "react";
import { useNavigate } from "react-router"; // Use o hook de navegação para redirecionar interno
import {
  LuUser,
  LuClipboardList,
  LuX,
  LuArrowRight,
  LuSquareCheck as LuCheckSquare,
  LuExternalLink,
} from "react-icons/lu";
// Importe as funções da sua API centralizada
import { getWorkoutRequests, completeWorkoutRequest } from "./shared/AdminApi";

// Interface local para tipar o retorno específico desse endpoint (que faz JOINs com users e preferences)
interface AdminWorkoutRequest {
  request_id: number;
  user_uid: string;
  nome: string;
  email: string;
  qtd_fichas: number;
  observacoes: string;
  status: string;
  created_at: string;
  // Dados do perfil (JOIN)
  objetivo_atual: string;
  nivel_atividade: string;
  peso_atual: number | string;
  altura_cm: number;
  genero: string;
  // Preferências (JOIN/Subquery)
  preferencias: { tipo_restricao: string; valor: string }[];
}

export default function AdminRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AdminWorkoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<AdminWorkoutRequest | null>(
    null
  );

  // Carregar Pedidos
  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Chamada via adminApi (Axios já trata credentials e base URL)
      const data = await getWorkoutRequests();

      if (Array.isArray(data)) {
        setRequests(data as unknown as AdminWorkoutRequest[]);
      }
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
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
        "Confirma que as fichas foram criadas e deseja finalizar este pedido?"
      )
    )
      return;

    try {
      await completeWorkoutRequest(reqId);

      // Feedback visual rápido
      alert("Pedido concluído com sucesso!");

      fetchRequests(); // Recarrega lista
      setSelectedReq(null); // Fecha modal
    } catch (err) {
      console.error(err);
      alert("Erro ao concluir pedido. Verifique o console.");
    }
  };

  // Navegação para o criador (Interna é melhor que window.open se for SPA)
  const handleOpenCreator = (req: AdminWorkoutRequest) => {
    // Redireciona para a página de criação passando params na URL
    navigate(
      `/admin/treinos/pedidos/criar?uid=${req.user_uid}&req=${
        req.request_id
      }&name=${encodeURIComponent(req.nome)}`
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2 text-gray-800">
        <LuClipboardList className="text-indigo-600" /> Solicitações de Treino
        <span className="bg-gray-100 text-gray-500 text-sm font-normal px-2 py-1 rounded-full ml-2">
          {requests.length}
        </span>
      </h1>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">
          Carregando solicitações...
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-2xl text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">
            Nenhuma solicitação pendente no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div
              key={req.request_id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col"
            >
              {/* Header Card */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">
                    {req.nome}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Solicitado em{" "}
                    {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-lg font-bold border border-indigo-100">
                  {req.qtd_fichas} Ficha(s)
                </span>
              </div>

              {/* Info Rápida */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <span className="block text-gray-400 font-bold uppercase text-[10px]">
                    Objetivo
                  </span>
                  <span className="font-semibold text-gray-700">
                    {req.objetivo_atual}
                  </span>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <span className="block text-gray-400 font-bold uppercase text-[10px]">
                    Gênero
                  </span>
                  <span className="font-semibold text-gray-700 capitalize">
                    {req.genero}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-6 bg-yellow-50 p-3 rounded-lg border border-yellow-100 italic line-clamp-3 flex-1">
                "{req.observacoes || "Sem observações do aluno."}"
              </div>

              <button
                onClick={() => setSelectedReq(req)}
                className="w-full py-3 bg-white border-2 border-indigo-600 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 mt-auto"
              >
                Analisar & Criar <LuArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE DETALHES */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-0 flex flex-col md:flex-row overflow-hidden">
            {/* Coluna Esquerda: Perfil (Sticky em desktop se usar h-full, mas aqui é modal scrollavel) */}
            <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
              <div className="flex justify-between items-center mb-6 md:hidden">
                <h2 className="font-bold text-gray-900">Detalhes</h2>
                <button
                  onClick={() => setSelectedReq(null)}
                  className="p-2 bg-white rounded-full shadow-sm"
                >
                  <LuX />
                </button>
              </div>

              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3">
                  <LuUser className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedReq.nome}
                </h3>
                <p className="text-sm text-gray-500">{selectedReq.email}</p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                    Físico
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500">Idade:</span>{" "}
                      <strong>--</strong>
                    </div>{" "}
                    {/* Idade geralmente calculada no front ou back */}
                    <div>
                      <span className="text-gray-500">Gênero:</span>{" "}
                      <strong className="capitalize">
                        {selectedReq.genero}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Altura:</span>{" "}
                      <strong>{selectedReq.altura_cm}cm</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Peso:</span>{" "}
                      <strong>{selectedReq.peso_atual}kg</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                    Meta
                  </p>
                  <p className="text-indigo-600 font-bold uppercase">
                    {selectedReq.objetivo_atual}
                  </p>
                  <p className="text-gray-600">{selectedReq.nivel_atividade}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-2">
                    Restrições
                  </p>
                  {selectedReq.preferencias &&
                  selectedReq.preferencias.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedReq.preferencias.map((pref, i) => (
                        <span
                          key={i}
                          className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100"
                        >
                          {pref.tipo_restricao}: {pref.valor}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-xs">
                      Nenhuma restrição informada.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna Direita: Ação */}
            <div className="md:w-2/3 p-6 md:p-8 flex flex-col">
              <div className="hidden md:flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Gerenciar Pedido #{selectedReq.request_id}
                  </h2>
                  <p className="text-gray-500">
                    O aluno solicitou{" "}
                    <strong>{selectedReq.qtd_fichas} fichas</strong> de treino.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReq(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <LuX className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-8">
                <h4 className="font-bold text-yellow-800 text-sm uppercase mb-2">
                  Observações do Aluno
                </h4>
                <p className="text-yellow-900 italic">
                  "{selectedReq.observacoes}"
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <h3 className="font-bold text-gray-800 border-b pb-2">
                  Ações Disponíveis
                </h3>

                <button
                  onClick={() => handleOpenCreator(selectedReq)}
                  className="w-full py-4 px-6 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <span className="bg-white/20 p-2 rounded-lg">
                      <LuExternalLink />
                    </span>
                    Abrir Criador de Treinos
                  </span>
                  <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Ao clicar acima, você será levado para a tela de criação. As
                  fichas salvas lá serão vinculadas automaticamente ao UID do
                  aluno.
                </p>
              </div>

              <div className="mt-auto pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-100">
                  <div>
                    <p className="font-bold text-green-800">Finalizar Pedido</p>
                    <p className="text-xs text-green-600">
                      Marque apenas se já criou todas as fichas.
                    </p>
                  </div>
                  <button
                    onClick={() => handleComplete(selectedReq.request_id)}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <LuCheckSquare className="w-4 h-4" /> Concluir
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
