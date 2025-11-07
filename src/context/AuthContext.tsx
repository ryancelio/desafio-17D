// src/context/AuthContext.tsx (Versão Aprimorada)
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
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
