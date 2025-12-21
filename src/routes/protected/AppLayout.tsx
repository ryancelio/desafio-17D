import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useEffect, useRef, useState } from "react";

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
} from "lucide-react";

import { LuFileText } from "react-icons/lu";
import { FaPersonRunning } from "react-icons/fa6";
import apiClient from "../../api/apiClient";
import { IoReload } from "react-icons/io5";
import type { Notification } from "../../types/models";

// ---------------- Navigation ----------------

const navigationItems = [
  { name: "Minhas Fichas", href: "/treinos", icon: LuFileText },
  { name: "Minha Dieta", href: "/dietas", icon: LuUtensils },
  { name: "Dashboard", href: "/dashboard", icon: LuLayoutDashboard },
  { name: "Exercícios", href: "/exercicios", icon: LuDumbbell },
  { name: "Receitas", href: "/receitas", icon: LuSoup },
];

const mobileNavigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LuLayoutDashboard },
  { name: "Dieta", href: "/dietas", icon: LuUtensils },
  { name: "Receitas", href: "/receitas", icon: LuSoup },
  { name: "Exercícios", href: "/exercicios", icon: LuDumbbell },
  { name: "Perfil", href: "/perfil", icon: LuUser },
];

// ---------------- Component ----------------

export default function AppLayout() {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();

  // -------- Notifications State --------
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // -------- Scroll State --------
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
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
      await fetch("/api/mark_notification_read.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notification_id: id }),
      });
    } catch (err) {
      console.error("Erro ao marcar notificação como lida", err);
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
    return () => {
      if (mainElement) {
        mainElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [lastScrollY]);

  const NavItem = ({ item }: { item: (typeof navigationItems)[0] }) => {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-200 hover:text-gray-900 ${
            item.href === "/treinos" || item.href === "/dieta" ? "mb-1" : ""
          } ${isActive ? "bg-[#FCC3D2]/50 text-gray-900 font-medium" : ""}`
        }
      >
        <Icon className="h-5 w-5" />
        <span className="hidden md:block">{item.name}</span>
      </NavLink>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <LuLoader2 className="h-12 w-12 animate-spin text-[#FCC3D2]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* ================= DRAWER NOTIFICAÇÕES ================= */}
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
            <p className="text-xs text-gray-500">{unreadCount} não lidas</p>
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
              className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50 relative ${
                !n.is_read ? "bg-[#FCC3D2]/10" : "bg-white"
              }`}
              onClick={() => !n.is_read && markAsRead(n.id)}
            >
              <div className="flex gap-3">
                <div
                  className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                    !n.is_read ? "bg-red-500" : "bg-transparent"
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
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= BOTÃO SINO MOBILE ================= */}
      <button
        onClick={() => setDrawerOpen(true)}
        className={`md:hidden fixed top-4 right-4 z-40 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-md border border-gray-100 text-gray-700 transition-all active:scale-95 ${
          !showNav ? "opacity-50 hover:opacity-100" : "opacity-100"
        }`}
      >
        <LuBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* ================= SIDEBAR DESKTOP ================= */}
      <aside className="hidden md:flex md:w-64 flex-col border-r bg-white p-4">
        <nav className="flex flex-col gap-2 flex-1">
          <div className="mb-6 pl-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#FCC3D2]">PowerSlim</h2>
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
            >
              <LuBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
          {navigationItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        <div className="mt-auto border-t pt-4 flex items-center gap-2">
          <div
            className="flex grow cursor-pointer hover:bg-gray-200 p-2 rounded-lg items-center"
            onClick={() => navigate("/perfil")}
          >
            <LuUser className="w-10 h-10 p-1 bg-gray-200 rounded-full" />
            <div className="px-3 overflow-hidden">
              <p className="text-sm font-medium truncate">
                {userProfile?.nome || "Usuário"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-600 hover:bg-red-300"
          >
            <LuLogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* ================= CONTEÚDO PRINCIPAL ================= */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto md:p-8 pb-24 md:pb-8 md:pt-8"
        >
          <Outlet />
        </main>
      </div>

      {/* ================= FAB (TREINO) MOBILE ================= */}
      {/* MUDANÇA: left-1/2 -> right-4 (Canto direito para não cobrir o menu) */}
      <div
        className={`md:hidden fixed bottom-20 right-4 z-40 transition-transform duration-300 ${
          showNav ? "translate-y-0" : "translate-y-24"
        }`}
      >
        <Link
          to="/treinos"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FCC3D2] shadow-lg text-gray-800 hover:bg-[#faa6b9] active:scale-95 transition-colors"
        >
          <FaPersonRunning className="h-8 w-8" />
        </Link>
      </div>

      {/* ================= BOTTOM NAV MOBILE ================= */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t bg-white py-1.5 transition-transform duration-300 pb-safe ${
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
                `flex flex-col items-center p-2 min-w-[60px] ${
                  isActive ? "text-[#FCC3D2]" : "text-gray-600"
                }`
              }
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] mt-1">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
