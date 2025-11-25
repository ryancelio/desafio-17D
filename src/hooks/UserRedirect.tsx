import { Loader2 } from "lucide-react";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import LandingPage from "../routes/landing/LandingPage";

/**
 * Componente que decide para onde redirecionar o usuário na rota raiz.
 */
const RootRedirector = () => {
  const { firebaseUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-[#FCC3D2]" />
      </div>
    );
  }

  // Se não há usuário logado, mostra a Landing Page.
  if (!firebaseUser) {
    return <LandingPage />;
  }

  // Se o usuário está logado, mas não completou o onboarding, redireciona para o onboarding.
  if (userProfile && !userProfile.data_nascimento) {
    return <Navigate to="/onboard" replace />;
  }

  // Se o usuário está logado e já completou o onboarding, redireciona para o dashboard.
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirector;
