// src/context/AuthContext.tsx (Versão Aprimorada)
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User, signOut } from "firebase/auth";
import { auth } from "./../firebase";
import apiClient, { type UserProfile } from "../api/apiClient"; // 👈 NOVO

interface AuthContextType {
  firebaseUser: User | null;
  userProfile: UserProfile | null; // 👈 DADOS DO MYSQL
  loading: boolean;
  refetchProfile: () => void; // 👈 Para recarregar após o onboarding
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
  refetchProfile: () => {},
});

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      // O interceptor do apiClient só funciona se 'auth.currentUser' existir
      const profile = await apiClient.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Falha ao buscar perfil do MySQL", error);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Usuário logou
        setLoading(true);
        await fetchUserProfile();
        setLoading(false);
      } else {
        // Usuário deslogou
        setUserProfile(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  // Inatividade
  useEffect(() => {
    let inactivityTimer: ReturnType<typeof setTimeout> | null = null;

    const handleSignOut = () => {
      console.log("Usuário deslogado por inatividade.");
      signOut(auth);
    };
    const resetTimer = () => {
      // Limpa o timer anterior
      if (inactivityTimer !== null) {
        clearTimeout(inactivityTimer);
      }
      // Cria um novo timer
      inactivityTimer = setTimeout(handleSignOut, INACTIVITY_TIMEOUT_MS);
    };

    // Lista de eventos que contam como "atividade"
    const activityEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "click",
      "keydown",
      "scroll",
      "touchstart",
    ];

    if (!firebaseUser) {
      if (inactivityTimer !== null) {
        clearTimeout(inactivityTimer); // Limpa qualquer timer pendente
        inactivityTimer = null;
      }
      return;
    }
    resetTimer();

    // Adiciona os event listeners para resetar o timer
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Isso é executado quando o componente desmonta ou o 'firebaseUser' muda
    return () => {
      if (inactivityTimer !== null) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [firebaseUser]);

  const value = {
    firebaseUser,
    userProfile,
    loading,
    refetchProfile: fetchUserProfile, // Expõe a função de recarregar
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
