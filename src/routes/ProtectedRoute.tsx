// src/routes/ProtectedRoute.tsx (Versão Aprimorada)
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Carregando...</div>; // Ou um spinner de tela cheia
  }

  if (!firebaseUser) {
    // 1. Não está logado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica se um campo obrigatório do onboarding está preenchido
  const hasCompletedOnboarding = userProfile?.altura_cm != null;

  if (!hasCompletedOnboarding && location.pathname !== "/onboarding/complete") {
    // 2. Logado, MAS não completou o onboarding
    // Se não estiver na rota de onboarding, force-o para lá
    if (!location.pathname.startsWith("/onboarding")) {
      return <Navigate to="/onboarding/profile" replace />;
    }
  }

  if (hasCompletedOnboarding && location.pathname.startsWith("/onboarding")) {
    // 3. Logado E completou, mas está tentando acessar o onboarding de novo
    // Mande-o para o dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Logado E completou (ou está no fluxo de onboarding)
  return children;
}
