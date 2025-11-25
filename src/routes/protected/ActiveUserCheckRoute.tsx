import { Outlet, useNavigate, Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

/**
 * Rota que verifica se o usuário autenticado está com o status "ativo".
 * Se estiver ativo, renderiza o conteúdo protegido (Outlet).
 * Se não, exibe uma tela de acesso negado.
 */
export default function ActiveUserCheckRoute() {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redireciona o usuário
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // 1. Enquanto o perfil do usuário está carregando, exibe um spinner.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-[#FCC3D2]" />
      </div>
    );
  }

  // 2. Se o perfil existe, fazemos as checagens.
  if (userProfile) {
    // 2a. Se o onboarding não foi completo, redireciona para /onboard.
    // A exceção é se ele já estiver tentando acessar /onboard.
    if (!userProfile.data_nascimento && location.pathname !== "/onboard") {
      return <Navigate to="/onboard" replace />;
    }

    // 2b. Se o usuário não estiver ativo, exibe a tela de acesso negado.
    if (!userProfile.isActive) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="mt-2 text-gray-700">
            Sua assinatura não está ativa. Por favor, renove sua assinatura para
            continuar.
          </p>
          <button className="pt-3 hover:text-gray-900" onClick={handleLogout}>
            Deslogar
          </button>
        </div>
      );
    }
  }

  // 3. Se passou por todas as checagens (ou o perfil ainda não carregou,
  // o que é improvável aqui), renderiza as rotas filhas.
  return <Outlet />;
}
