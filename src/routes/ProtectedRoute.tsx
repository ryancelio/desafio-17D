// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { LuLoaderCircle } from "react-icons/lu";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseUser, userProfile, loading } = useAuth();
  const location = useLocation();

  // 1. Loading do Auth Context (Firebase)
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
        <LuLoaderCircle className="h-12 w-12 animate-spin text-[#FCC3D2]" />
      </div>
    );
  }

  // 2. Não logado -> Login
  if (!firebaseUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Logado no Firebase, mas o perfil do Backend ainda não chegou.
  // IMPORTANTE: Isso previne que o código abaixo rode com userProfile null.
  if (!userProfile) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
        <LuLoaderCircle className="h-12 w-12 animate-spin text-[#FCC3D2]" />
        <span className="ml-3 text-sm text-gray-500">
          Sincronizando perfil...
        </span>
      </div>
    );
  }

  // --- DEBUG NO CONSOLE (Remova após corrigir) ---
  // Verifica se estamos recebendo a estrutura nova (aninhada) ou velha (plana)
  const altura = userProfile.profile?.altura_cm;

  // console.log("--- PROTECTED ROUTE DEBUG ---");
  // console.log("Estrutura completa:", userProfile);
  // console.log("Altura detectada:", altura);
  // ----------------------------------------------

  // Verificação robusta: Aceita se não for nulo e for maior que 0
  const hasCompletedOnboarding = altura != null && Number(altura) > 0;

  // 4. Lógica de Redirecionamento
  if (!hasCompletedOnboarding) {
    // Se o usuário NÃO tem altura definida:
    // Permite ficar se já estiver no /onboard, senão manda para lá.
    if (!location.pathname.startsWith("/onboard")) {
      return <Navigate to="/onboard" replace />;
    }
    // IMPORTANTE: Se estiver no /onboard, renderiza o children (o Wizard)
    return children;
  }

  if (hasCompletedOnboarding && location.pathname.startsWith("/onboard")) {
    // Se o usuário JÁ tem altura mas tenta acessar /onboard:
    // Manda para o dashboard (evita refazer o onboarding)
    return <Navigate to="/dashboard" replace />;
  }

  // 5. Tudo certo (Logado + Onboarding Feito + Rota Protegida)
  return children;
}
