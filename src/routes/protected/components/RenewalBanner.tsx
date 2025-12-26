import { useMemo } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { useAuth } from "../../../context/AuthContext";

export default function RenewalBanner() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const status = useMemo(() => {
    if (!userProfile?.subscription?.expires_at) return null;

    // Se for mensal recorrente, não precisa avisar (o MP cobra sozinho)
    if (userProfile.subscription.payment_method === "monthly_subscription")
      return null;

    const expiresAt = parseISO(userProfile.subscription.expires_at);
    const today = new Date();
    const daysLeft = differenceInDays(expiresAt, today);

    // Lógica de exibição
    if (daysLeft < 0) return "expired";
    if (daysLeft <= 7) return "warning"; // Avisa faltando 7 dias
    if (daysLeft <= 30) return "info"; // Avisa faltando 1 mês (opcional)

    return null;
  }, [userProfile]);

  if (!status) return null;

  return (
    <div
      onClick={() => navigate("/assinatura/renovar")} // Leva para a página de planos
      className={`
        relative overflow-hidden cursor-pointer px-4 py-3 flex items-center justify-between
        ${status === "expired" ? "bg-red-600 text-white" : ""}
        ${status === "warning" ? "bg-amber-500 text-white" : ""}
        ${status === "info" ? "bg-blue-600 text-white" : ""}
      `}
    >
      <div className="flex items-center gap-3 z-10">
        <AlertTriangle className="w-5 h-5 shrink-0 animate-pulse" />
        <div>
          <p className="text-sm font-bold">
            {status === "expired"
              ? "Sua assinatura expirou!"
              : "Renovação Necessária"}
          </p>
          <p className="text-xs opacity-90">
            {status === "expired"
              ? "Toque para renovar e recuperar o acesso."
              : `Seu plano anual vence em breve. Garanta mais 1 ano.`}
          </p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 opacity-80 z-10" />

      {/* Efeito de fundo */}
      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-10 rounded-full blur-xl"></div>
    </div>
  );
}
