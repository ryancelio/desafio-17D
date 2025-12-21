import { Outlet, useNavigate, Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Loader2, LockKeyhole } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function ActiveUserCheckRoute() {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // 1. Loading State
  if (loading || !userProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-[#FCC3D2]" />
      </div>
    );
  }

  // 2. Checagem de Onboarding (Defensiva)
  // Verifica se o user tem os dados vitais. Se não, joga pro Onboard.
  // Nota: userProfile.profile pode ser undefined se algo falhou, o '?' previne crash.
  const hasOnboardingData =
    userProfile.profile?.data_nascimento && userProfile.profile?.altura_cm;

  if (!hasOnboardingData && location.pathname !== "/onboard") {
    return <Navigate to="/onboard" replace />;
  }

  // 3. Lógica de Acesso (Superior)
  const checkAccess = () => {
    // A. Prioridade: O Backend diz que tem acesso?
    if (userProfile.subscription.has_access) {
      return true;
    }

    // B. Fallback (O que você pediu): Checagem manual de data no cliente.
    // Útil se o usuário cancelou (status=cancelled), mas a data ainda não venceu,
    // e por algum motivo o backend não setou has_access como true.
    const expiresAtString = userProfile.subscription.expires_at;

    if (expiresAtString) {
      const expirationDate = new Date(expiresAtString);
      const now = new Date();

      // Se a data de expiração for maior que "agora", libera o acesso.
      if (expirationDate > now) {
        return true;
      }
    }

    // Se nenhuma das anteriores for verdade, acesso negado.
    return false;
  };

  const hasAccess = checkAccess();

  if (!hasAccess) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-4">
          <LockKeyhole className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Acesso Expirado</h1>
        <p className="mt-2 max-w-md text-gray-600">
          Sua assinatura não está ativa ou expirou em{" "}
          {userProfile.subscription.expires_at
            ? new Date(userProfile.subscription.expires_at).toLocaleDateString()
            : "data desconhecida"}
          .
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate("/upgrade")} // Exemplo de link
            className="rounded-lg bg-[#FCC3D2] px-6 py-2 font-semibold text-white hover:bg-[#faacc1] transition-colors"
          >
            Renovar Assinatura
          </button>
          <button
            className="text-sm text-gray-500 hover:text-gray-900 underline"
            onClick={handleLogout}
          >
            Sair da conta
          </button>
        </div>
      </div>
    );
  }

  // 4. Acesso Permitido
  return <Outlet />;
}
