import { useState, useEffect } from "react";
import {
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { getAuthLogs } from "./shared/AdminApi";

// Interfaces baseadas na resposta da API
interface AuthLog {
  log_id: number;
  email: string;
  ip_address: string;
  user_agent: string;
  status: "success" | "failed_attempt" | "blocked";
  failure_reason: string | null;
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_records: number;
  total_pages: number;
}

export default function AuthLogsPage() {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Filtro e Paginação
  const [page, setPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" | success | failed_attempt | blocked
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // Debounce para busca de email (opcional, aqui faremos busca ao dar Enter ou Blur)
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await getAuthLogs(page, 50, emailFilter, statusFilter);

      // CORREÇÃO: Garante que seja um array, mesmo se vier null/undefined
      setLogs(response.data || []);
      setMeta(response.pagination || null);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar logs.");
      setLogs([]); // Em caso de erro, limpa a lista para evitar quebra
    } finally {
      setLoading(false);
    }
  };

  // Recarrega sempre que a página ou filtros mudarem
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);
  // Nota: emailFilter não está na dependência para evitar request a cada tecla.
  // O usuário deve apertar Enter ou clicar em buscar.

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reseta para primeira página ao buscar
    fetchLogs();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <ShieldCheck className="w-3 h-3" /> Sucesso
          </span>
        );
      case "failed_attempt":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <ShieldAlert className="w-3 h-3" /> Falha
          </span>
        );
      case "blocked":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <Ban className="w-3 h-3" /> Bloqueado
          </span>
        );
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  // Formata User Agent para algo mais legível (Simples)
  const formatUserAgent = (ua: string) => {
    if (!ua) return "Desconhecido";
    if (ua.includes("iPhone")) return "iPhone";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("Windows")) return "Windows PC";
    if (ua.includes("Macintosh")) return "Mac";
    if (ua.includes("Linux")) return "Linux";
    return "Outro Dispositivo";
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Logs de Autenticação
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Histórico de acessos e tentativas de login no sistema.
          </p>
        </div>
        <button
          onClick={() => fetchLogs()}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors self-start md:self-auto"
          title="Atualizar"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end md:items-center">
        <form
          onSubmit={handleSearch}
          className="flex-1 w-full md:w-auto relative"
        >
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por email..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // Reseta paginação ao filtrar
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white appearance-none cursor-pointer"
            >
              <option value="">Todos os Status</option>
              <option value="success">Sucesso</option>
              <option value="failed_attempt">Falhas</option>
              <option value="blocked">Bloqueados</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Usuário / Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Detalhes (IP/Device)</th>
                <th className="px-6 py-4">Data e Hora</th>
                <th className="px-6 py-4">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin" /> Carregando...
                    </div>
                  </td>
                </tr>
              ) : !logs || logs.length === 0 ? ( // CORREÇÃO AQUI: "!logs ||"
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <ShieldAlert className="w-8 h-8 mb-2 opacity-20" />
                      <p>Nenhum registro encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.log_id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* ... (conteúdo das linhas mantido igual) ... */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {log.email}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit mb-1">
                          {log.ip_address || "IP Oculto"}
                        </span>
                        <span
                          className="text-xs text-gray-400"
                          title={log.user_agent}
                        >
                          {formatUserAgent(log.user_agent)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td
                      className="px-6 py-4 max-w-xs truncate text-gray-500 text-xs"
                      title={log.failure_reason || ""}
                    >
                      {log.failure_reason || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {meta && meta.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Página {meta.current_page} de {meta.total_pages} (
              {meta.total_records} registros)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(meta.total_pages, p + 1))
                }
                disabled={page === meta.total_pages || loading}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
