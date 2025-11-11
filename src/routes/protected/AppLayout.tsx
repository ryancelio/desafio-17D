import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth"; // 1. Importar signOut
import { auth } from "../../firebase"; // 2. Importar a instância 'auth'
import {
  LayoutDashboard as LuLayoutDashboard,
  Dumbbell as LuDumbbell,
  Soup as LuSoup,
  User as LuUser,
  LogOut as LuLogOut,
  Loader2 as LuLoader2, // Para o estado de carregamento
} from "lucide-react";

// Itens da Navegação
const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LuLayoutDashboard },
  { name: "Exercícios", href: "/exercicios", icon: LuDumbbell },
  { name: "Receitas", href: "/receitas", icon: LuSoup },
  { name: "Perfil", href: "/perfil", icon: LuUser },
];

export default function AppLayout() {
  // 3. Obter os novos dados do contexto
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();

  // 4. ATUALIZADO: handleLogout agora usa signOut()
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // O onAuthStateChanged no AuthContext cuidará de limpar o estado
      navigate("/login"); // Redireciona o usuário
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Componente de Link reutilizável
  const NavItem = ({ item }: { item: (typeof navigationItems)[0] }) => {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) => `
          flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all
          hover:bg-gray-200 hover:text-gray-900
          ${isActive ? "bg-[#FCC3D2]/50 text-gray-900 font-medium" : ""}
        `}
      >
        <Icon className="h-5 w-5" />
        <span className="md:block hidden">{item.name}</span>
      </NavLink>
    );
  };

  // 5. ADICIONADO: Estado de carregamento
  // Mostra um spinner enquanto o AuthContext carrega o usuário e o perfil
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <LuLoader2 className="h-12 w-12 animate-spin text-[#FCC3D2]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      {/* --- 1. Sidebar (Desktop) --- */}
      <aside className="hidden md:flex md:w-64 flex-col border-r bg-white p-4">
        <nav className="flex flex-col gap-2 flex-1">
          <div className="mb-4 pl-3">
            <h2 className="text-xl font-bold text-[#FCC3D2]">FitApp</h2>
          </div>
          {navigationItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* 6. ATUALIZADO: Seção de Logout com Info do Usuário */}
        <div className="mt-auto border-t pt-4">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userProfile?.nome || "Usuário"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userProfile?.email || ""}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900"
          >
            <LuLogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* --- 2. Conteúdo Principal --- */}
      <div className="flex flex-1 flex-col pb-20 md:pb-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* --- 3. Navegação (Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 flex items-center justify-around border-t bg-white p-2.5 shadow-md">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => `
                flex flex-col items-center rounded-lg p-2 w-16 transition-all
                ${isActive ? "text-[#FCC3D2]" : "text-gray-600"}
              `}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
