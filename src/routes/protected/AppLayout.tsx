import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  LayoutDashboard as LuLayoutDashboard,
  Dumbbell as LuDumbbell,
  Soup as LuSoup,
  User as LuUser,
  LogOut as LuLogOut,
  Loader2 as LuLoader2,
  Bell as LuBell,
  X as LuX,
  Utensils as LuUtensils,
  Zap as LuZap,
  Plus as LuPlus,
} from "lucide-react";

import { LuFileText } from "react-icons/lu";
import { FaPersonRunning } from "react-icons/fa6";
import apiClient from "../../api/apiClient";
import { IoReload } from "react-icons/io5";
import type { Notification } from "../../types/models";
import { Toaster } from "sonner";

// ---------------- Navigation Config ----------------

const navigationItems = [
  { name: "Início", href: "/dashboard", icon: LuLayoutDashboard },
  { name: "Minhas Fichas", href: "/treinos", icon: LuFileText },
  { name: "Minhas Dietas", href: "/dietas", icon: LuUtensils },
  { name: "Exercícios", href: "/exercicios", icon: LuDumbbell },
  { name: "Receitas", href: "/receitas", icon: LuSoup },
];

const mobileNavigationItems = [
  { name: "Início", href: "/dashboard", icon: LuLayoutDashboard },
  { name: "Receitas", href: "/receitas", icon: LuSoup },
  { name: "Exercícios", href: "/exercicios", icon: LuDumbbell },
  { name: "Perfil", href: "/perfil", icon: LuUser },
];

const getPageTitle = (pathname: string) => {
  if (pathname.includes("/dashboard")) return "Dashboard";
  if (pathname.includes("/treinos")) return "Meus Treinos";
  if (pathname.includes("/exercicios")) return "Biblioteca";
  if (pathname.includes("/dietas")) return "Plano Alimentar";
  if (pathname.includes("/receitas")) return "Receitas";
  if (pathname.includes("/perfil")) return "Meu Perfil";
  return "PowerSlim";
};

// ---------------- Component ----------------

export default function AppLayout() {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // -------- States --------
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // FAB State (Speed Dial)
  const [fabOpen, setFabOpen] = useState(false);

  // Scroll State
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const pageTitle = getPageTitle(location.pathname);

  // Fecha o FAB ao mudar de rota
  useEffect(() => {
    setFabOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro logout", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const data = await apiClient.getNotifications();
      const mapped = (data || []).map((n: Notification) => ({
        ...n,
        read: n.is_read === 1 || n.is_read === true,
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  };

  const markAsRead = async (id: Notification["id"]) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );

      await apiClient.markNotificationRead(Number(id));
    } catch (err) {
      console.error("Erro mark read", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [drawerOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current) return;
      const currentScrollY = mainRef.current.scrollTop;

      if (Math.abs(currentScrollY - lastScrollY) > 10) {
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setShowNav(false);
          setFabOpen(false); // Fecha o FAB se rolar a tela
        } else {
          setShowNav(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
    }
    return () => mainElement?.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <LuLoader2 className="h-12 w-12 animate-spin text-[#FCC3D2]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* MOBILE TOP BAR (Header Fixo) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/60 flex items-center justify-between px-4 transition-all">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-sm">
            <LuZap className="w-4 h-4 fill-current" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            {pageTitle}
          </h1>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-600"
        >
          <LuBell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>

      {/* DRAWER NOTIFICAÇÕES */}
      <div
        className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-800">Notificações</h3>
            <p className="text-xs text-gray-500 font-medium">
              {unreadCount} novas
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchNotifications}
              className="p-2 hover:bg-gray-200 rounded-full text-gray-500"
            >
              <IoReload
                className={`w-4 h-4 ${notifLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 hover:bg-gray-200 rounded-full text-gray-500"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!notifLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <LuBell className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 border-b border-gray-100 cursor-pointer ${
                !n.is_read ? "bg-indigo-50/40" : "bg-white"
              }`}
              onClick={() => !n.is_read && markAsRead(n.id)}
            >
              <div className="flex gap-3">
                <div
                  className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                    !n.is_read ? "bg-indigo-500 shadow-sm" : "bg-transparent"
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      !n.is_read
                        ? "font-bold text-gray-900"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-gray-200 bg-white p-4 z-20">
        <nav className="flex flex-col gap-2 flex-1">
          <div className="mb-8 pl-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <LuZap className="w-5 h-5 fill-current" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                PowerSlim
              </h2>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-full text-gray-500"
            >
              <LuBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>
          </div>
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-200 hover:text-gray-900 ${
                  isActive ? "bg-[#FCC3D2]/50 text-gray-900 font-medium" : ""
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="hidden md:block">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-gray-100 pt-4 flex items-center gap-2">
          <div
            className="flex grow cursor-pointer hover:bg-gray-50 p-2 rounded-xl items-center transition-colors group"
            onClick={() => navigate("/perfil")}
          >
            <div className="bg-gray-100 p-2 rounded-full text-gray-500 group-hover:bg-white group-hover:shadow-sm">
              <LuUser className="w-5 h-5" />
            </div>
            <div className="px-3 overflow-hidden">
              <p className="text-sm font-bold text-gray-700 truncate">
                {userProfile?.nome || "Usuário"}
              </p>
              <p className="text-xs text-gray-400 truncate">Ver perfil</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500"
          >
            <LuLogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex flex-1 flex-col overflow-hidden relative w-full">
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto scroll-smooth w-full pt-16 pb-24 px-4 md:pt-8 md:pb-8 md:px-8"
        >
          <Toaster
            richColors
            swipeDirections={["left", "right"]}
            position="top-center"
          />
          <Outlet />
        </main>
      </div>

      {/* ================================================================================== */}
      {/* FAB (SPEED DIAL) - MOBILE ONLY */}
      {/* ================================================================================== */}
      <div className="md:hidden">
        {/* Backdrop invisível para fechar ao clicar fora */}
        {fabOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[1px] transition-opacity"
            onClick={() => setFabOpen(false)}
          />
        )}

        <div
          className={`fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 transition-transform duration-300 ${
            showNav ? "translate-y-0" : "translate-y-24"
          }`}
        >
          <AnimatePresence>
            {fabOpen && (
              <>
                {/* Opção: Treinar */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 pr-1"
                >
                  <span className="bg-white text-gray-700 text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm border border-gray-100">
                    Ir para Treino
                  </span>
                  <Link
                    to="/treinos"
                    onClick={() => setFabOpen(false)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 shadow-lg text-white hover:bg-indigo-700 active:scale-95"
                  >
                    <FaPersonRunning className="h-5 w-5" />
                  </Link>
                </motion.div>

                {/* Opção: Dieta */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className="flex items-center gap-3 pr-1"
                >
                  <span className="bg-white text-gray-700 text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm border border-gray-100">
                    Minha Dieta
                  </span>
                  <Link
                    to="/dietas"
                    onClick={() => setFabOpen(false)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 shadow-lg text-white hover:bg-emerald-600 active:scale-95"
                  >
                    <LuUtensils className="h-5 w-5" />
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Botão Principal (Gatilho) */}
          <button
            onClick={() => setFabOpen(!fabOpen)}
            className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl text-white transition-all active:scale-90 z-50 ${
              fabOpen ? "bg-gray-800 rotate-90" : "bg-gray-900"
            }`}
          >
            {fabOpen ? (
              <LuX className="h-6 w-6" />
            ) : (
              <LuPlus className="h-7 w-7" />
            )}
          </button>
        </div>
      </div>

      {/* BOTTOM NAV MOBILE (GRID 4 COLUNAS) */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 items-center bg-white/95 backdrop-blur-lg border-t border-gray-200 py-1 transition-transform duration-300 pb-safe ${
          showNav ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {mobileNavigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full py-2 ${
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-400 hover:text-gray-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-xl transition-all duration-200 ${
                      isActive ? "bg-indigo-50" : "bg-transparent"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${isActive ? "fill-current" : ""}`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <span className="text-[10px] font-medium mt-0.5">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
