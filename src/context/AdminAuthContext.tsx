import React, { createContext, useContext, useState, useEffect } from "react";

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
        const res = await fetch(
          "https://powerslim.pro/api/admin/check_auth.php",
          {
            credentials: "include", // <--- ADICIONE ISSO PARA ENVIAR O COOKIE
          }
        );
        if (res.ok) {
          const data = await res.json();
          setAdmin(data.admin);
        }
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
    await fetch("https://dealory.io/api/admin/logout.php", {
      credentials: "include", // <--- ADICIONE ISSO PARA ENVIAR O COOKIE
    });
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
