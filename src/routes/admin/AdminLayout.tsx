import { useState } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { IoCashOutline } from "react-icons/io5";

export default function AdminLayout() {
  const { admin, isLoading, logout } = useAdminAuth();
  const [isPedidosOpen, setIsPedidosOpen] = useState(true); // Começa aberto ou fechado, conforme preferir
  const location = useLocation();

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        Carregando Painel...
      </div>
    );
  if (!admin) return <Navigate to="/admin/login" replace />;

  // Helper para estilizar links ativos
  const getLinkClass = (path: string) => {
    const isActive = location.pathname.includes(path);
    return `flex items-center gap-3 p-2 rounded transition-colors ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col shadow-xl">
        <h2 className="text-2xl font-bold mb-8 text-indigo-400 flex items-center gap-2">
          PowerSlim Admin
        </h2>

        <nav className="flex-1 space-y-2">
          <Link
            to="/admin/dashboard"
            className={getLinkClass("/admin/dashboard")}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>

          <Link
            to="/admin/receitas"
            className={getLinkClass("/admin/receitas")}
          >
            <Utensils className="w-5 h-5" />
            Gerenciar Receitas
          </Link>

          <Link
            to="/admin/exercicios"
            className={getLinkClass("/admin/exercicios")}
          >
            <Dumbbell className="w-5 h-5" />
            Gerenciar Treinos
          </Link>

          {/* --- Dropdown de Pedidos --- */}
          <div className="pt-2">
            <button
              onClick={() => setIsPedidosOpen(!isPedidosOpen)}
              className="w-full flex items-center justify-between p-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5" />
                <span>Pedidos</span>
              </div>
              {isPedidosOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Sub-menu com Animação simples de condicional */}
            {isPedidosOpen && (
              <div className="mt-1 ml-4 border-l border-gray-700 pl-4 space-y-1">
                <Link
                  to="/admin/treinos/pedidos"
                  className={`block py-2 text-sm transition-colors ${
                    location.pathname.includes("/admin/treinos/pedidos")
                      ? "text-indigo-400 font-medium"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Solicitações de Treino
                </Link>
                <Link
                  to="/admin/dietas/pedidos"
                  className={`block py-2 text-sm transition-colors ${
                    location.pathname.includes("/admin/dietas/pedidos")
                      ? "text-indigo-400 font-medium"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Solicitações de Dieta
                </Link>
              </div>
            )}
          </div>
          <Link to="/admin/leads" className={getLinkClass("/admin/leads")}>
            <IoCashOutline className="w-5 h-5" />
            Leads
          </Link>
          <Link to="/admin/logs" className={getLinkClass("/admin/logs")}>
            <ShieldCheck className="w-5 h-5" />
            Logs de Acesso
          </Link>
        </nav>

        <div className="border-t border-gray-700 pt-4 mt-4">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">
            Usuário
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300 truncate max-w-30">
              {admin.name}
            </span>
            <button
              onClick={logout}
              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
