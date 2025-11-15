import { Link, NavLink, Outlet, useNavigate } from "react-router";
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
import { LuFileText } from "react-icons/lu";

// Itens da Navegação
const navigationItems = [
  { name: "Minhas Fichas", href: "/treinos", icon: LuFileText }, // <-- ADICIONADO (para Desktop)
  { name: "Dashboard", href: "/dashboard", icon: LuLayoutDashboard },
  { name: "Exercícios", href: "/exercicios", icon: LuDumbbell },
  { name: "Receitas", href: "/receitas", icon: LuSoup },
];
const mobileNavigationItems = [
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
          ${item.href === "/treinos" ? " mb-3" : ""}
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
      <aside className="hidden md:flex md:h-screen sticky top-0 bottom-0 md:w-64 flex-col border-r border-gray-500/50 bg-white p-4">
        <nav className="flex flex-col gap-2 flex-1">
          <div className="mb-4 pl-3">
            <h2 className="text-xl font-bold text-[#FCC3D2]">PowerSlim</h2>
          </div>
          {navigationItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* 6. ATUALIZADO: Seção de Logout com Info do Usuário */}
        <div className="mt-auto border-t pt-4 w-full flex items-center">
          <div
            className="grow flex cursor-pointer hover:bg-gray-200 p-2 rounded-lg rounded-r-none items-center"
            onClick={() => navigate("/perfil")}
          >
            <LuUser className="rounded-full border w-11 h-11 p-1 bg-gray-200 text-gray-500" />
            <div className="px-3 py-2 grow">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile?.nome || "Usuário"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex ml-auto h-full cursor-pointer rounded-l-none px-3 items-center gap-3 rounded-lg py-2 text-gray-600 transition-all hover:bg-red-300 hover:text-gray-900"
          >
            <LuLogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* --- 2. Conteúdo Principal --- */}
      <div className="flex flex-1 flex-col pb-20 md:pb-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <Link
          to="/treinos"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FCC3D2] text-gray-800 shadow-lg transition-all hover:bg-[#db889d] active:scale-95"
        >
          <LuDumbbell className="h-8 w-8" />
        </Link>
      </div>

      {/* --- 3. Navegação (Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 flex items-center justify-around border-t border-gray-500/50 bg-white px-2.5 py-1.5 shadow-md">
        {mobileNavigationItems.map((item) => {
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
