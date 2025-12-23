import React, { createContext, useContext, useState, useEffect } from "react";
import { adminLogout, checkAuth } from "../routes/admin/shared/AdminApi";
import { toast } from "sonner";

interface AdminUser {
  name: string;
  role: string;
}

interface AdminContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (user: AdminUser) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminContextType | null>(null);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica sessão ao carregar a página
  useEffect(() => {
    const checkSession = async () => {
      try {
        // const res = await fetch(
        //   "https://powerslim.pro/api/admin/check_auth.php",
        //   {
        //     credentials: "include", // <--- ADICIONE ISSO PARA ENVIAR O COOKIE
        //   }
        // );
        const data = await checkAuth();

        if (!data.authenticated) {
          toast.error("Sessão expirada. Faça login novamente.");
          return;
        }
        setAdmin(data.admin);
      } catch (err) {
        console.error("Erro ao verificar sessão admin", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = (user: AdminUser) => setAdmin(user);

  const logout = async () => {
    const res = await adminLogout();
    if (!res.success) {
      toast.error("Erro ao fazer logout. Tente novamente.");
      return;
    }
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
};
