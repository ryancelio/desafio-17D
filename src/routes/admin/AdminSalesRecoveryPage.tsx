import { useState, useEffect } from "react";
import {
  Loader2,
  Mail,
  MessageCircle,
  Calendar,
  UserX,
  Copy,
  //   ExternalLink
} from "lucide-react";
import { toast, Toaster } from "sonner";
import type { PendingLead } from "../../types/admin";

export default function SalesRecoveryPage() {
  const [leads, setLeads] = useState<PendingLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getDateDifference = (dateString: string) => {
    const createdDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    return { days: diffDays, hours: diffHours };
  };

  // Função para calcular "tempo atrás" (ex: há 2 horas)
  const timeAgo = (dateString: string) => {
    // const diff = new Date().getTime() - new Date(dateString).getTime();
    // const diff = getDateDifferenceInDays(dateString);
    const { days, hours } = getDateDifference(dateString);

    if (days > 0) return `${days} dia${days > 1 ? "s" : ""} atrás`;
    if (hours > 0) return `${hours} horas atrás`;
    return "Recém criado";
  };

  const getStatusColor = (dateString: string) => {
    const { days, hours } = getDateDifference(dateString);

    if (hours < 3) return "text-green-600";
    if (days < 7) return "text-blue-600";
    if (days > 30) return "text-red-600";
    return "text-yellow-600";
  };

  useEffect(() => {
    // Simulação da chamada API (Implemente no apiClient: getPendingLeads)
    const fetchLeads = async () => {
      try {
        // const data = await apiClient.getPendingLeads();
        // setLeads(data);

        const response = await fetch(
          "https://dealory.io/api/admin/pending_leads.php",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();
        setLeads(data);
      } catch (error) {
        toast.error("Erro ao carregar leads");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const handleWhatsApp = (lead: PendingLead) => {
    if (!lead.telefone) {
      toast.error("Usuário sem telefone cadastrado");
      return;
    }
    // Remove caracteres não numéricos
    const phone = lead.telefone.replace(/\D/g, "");
    const message = `Olá ${lead.nome}, vi que você criou sua conta na PowerSlim mas não finalizou sua assinatura. Ficou com alguma dúvida?`;
    window.open(
      `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copiado!");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <Toaster richColors position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Recuperação de Vendas
        </h1>
        <p className="text-gray-500">
          Usuários que criaram conta mas{" "}
          <span className="text-red-500 font-bold">não assinaram</span> (Leads
          Quentes).
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Registro</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr
                  key={lead.uid}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{lead.nome}</div>
                    <div className="text-xs text-gray-400 font-mono">
                      {lead.uid.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:text-indigo-600"
                      onClick={() => handleCopyEmail(lead.email)}
                    >
                      <Mail className="w-3 h-3" />
                      {lead.email}
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </div>
                    {lead.telefone ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <MessageCircle className="w-3 h-3" />
                        {lead.telefone}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Sem telefone
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {new Date(lead.criado_em).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={
                        "text-xs font-medium " + getStatusColor(lead.criado_em)
                      }
                    >
                      {timeAgo(lead.criado_em)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {/* Lógica simples de status baseada no tempo */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        new Date(lead.criado_em).getTime() >
                        new Date().getTime() - 86400000
                          ? "bg-green-100 text-green-700" // < 24h
                          : "bg-yellow-100 text-yellow-700" // > 24h
                      }`}
                    >
                      {new Date(lead.criado_em).getTime() >
                      new Date().getTime() - 86400000
                        ? "🔥 Lead Quente"
                        : "⚠️ Pendente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`mailto:${lead.email}?subject=Bem-vindo ao PowerSlim&body=Olá ${lead.nome}, vi que você não finalizou seu cadastro...`}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                        title="Enviar Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>

                      {lead.telefone && (
                        <button
                          onClick={() => handleWhatsApp(lead)}
                          className="p-2 bg-green-100 hover:bg-green-200 rounded-lg text-green-700 transition-colors"
                          title="Chamar no WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <UserX className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    Nenhum lead pendente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
