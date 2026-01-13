import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useEffect, useRef, useState, useCallback } from "react";
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
  Plus as LuPlus,
  MessageSquarePlus as LuMessageSquarePlus,
  Menu as LuMenu,
} from "lucide-react";

import { LuFileText } from "react-icons/lu";
import { FaPersonRunning } from "react-icons/fa6";
import { getNotifications, markNotificationRead } from "../../api/apiClient";
import { IoReload } from "react-icons/io5";
import RenewalBanner from "./components/RenewalBanner";
import FeedbackModal from "../../Components/FeedbackModal"; // Ajuste o caminho se necessário

// ============================================================================
// NAVIGATION CONFIG
// ============================================================================

const navigationItems = [
  { name: "Início", href: "/dashboard", icon: LuLayoutDashboard },
  { name: "Minhas Fichas", href: "/treinos", icon: LuFileText },
  { name: "Minhas Dietas", href: "/dietas", icon: LuUtensils },
  { name: "Exercícios", href: "/exercicios", icon: LuDumbbell },
  { name: "Receitas", href: "/receitas", icon: LuSoup },
];

// Removido mobileNavigationItems pois a barra inferior foi eliminada

const getPageTitle = (pathname: string) => {
  if (pathname.includes("/dashboard")) return "Dashboard";
  if (pathname.includes("/treinos")) return "Meus Treinos";
  if (pathname.includes("/exercicios")) return "Biblioteca";
  if (pathname.includes("/dietas")) return "Plano Alimentar";
  if (pathname.includes("/receitas")) return "Receitas";
  if (pathname.includes("/perfil")) return "Meu Perfil";
  return "PowerSlim";
};

// ============================================================================
// MOBILE MENU DRAWER COMPONENT
// ============================================================================

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userProfile: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  firebaseUser: any;
  avatarError: boolean;
  onAvatarError: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  onFeedback: () => void; // Nova prop para feedback
}

const MobileMenuDrawer = ({
  isOpen,
  onClose,
  userProfile,
  firebaseUser,
  avatarError,
  onAvatarError,
  onLogout,
  onNavigate,
  onFeedback,
}: MobileMenuDrawerProps) => {
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        // Adicionado drag para fechar deslizando para a direita
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.5 }}
        onDragEnd={(_e, { offset, velocity }) => {
          if (offset.x > 100 || velocity.x > 200) {
            onClose();
          }
        }}
        className="fixed right-0 top-0 h-screen w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            aria-label="Fechar menu"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-linear-to-r from-pasPink/20 to-pasPink/10 text-gray-900 font-semibold border-l-4 border-pasPink"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`w-5 h-5 ${isActive ? "text-pasPink" : ""}`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Divider */}
          <div className="h-px bg-gray-100 my-4" />

          {/* Additional Actions */}
          <div className="p-4 space-y-1">
            <button
              onClick={() => {
                onClose();
                onFeedback();
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-all"
            >
              <LuMessageSquarePlus className="w-5 h-5" />
              <span>Enviar Feedback</span>
            </button>
          </div>
        </div>

        {/* User Section Footer */}
        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
          {/* User Profile Card */}
          <div
            onClick={() => {
              onNavigate("/perfil");
              onClose();
            }}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors group"
          >
            <div className="h-12 w-12 rounded-full overflow-hidden bg-white shrink-0 border border-gray-200 group-hover:border-gray-300 flex items-center justify-center">
              {firebaseUser && !avatarError ? (
                <img
                  src={`/api/get_avatar.php?uid=${firebaseUser.uid}`}
                  alt={userProfile?.nome}
                  className="h-full w-full object-cover"
                  onError={onAvatarError}
                />
              ) : (
                <LuUser className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userProfile?.nome || "Usuário"}
              </p>
              <p className="text-xs text-gray-500 truncate">Ver perfil</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium bg-white border border-gray-100 shadow-sm"
          >
            <LuLogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

// ============================================================================
// NOTIFICATIONS DRAWER COMPONENT
// ============================================================================

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  onRefresh: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMarkAsRead: (id: any) => void;
}

const NotificationsDrawer = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  isLoading,
  onRefresh,
  onMarkAsRead,
}: NotificationsDrawerProps) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="fixed right-0 top-0 h-screen w-80 max-w-[90vw] bg-white z-50 shadow-2xl flex flex-col"
      >
        <div className="p-4 border-b border-gray-100 bg-linear-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900">Notificações</h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white rounded-lg transition-colors"
              aria-label="Fechar notificações"
            >
              <LuX className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-xs font-medium text-gray-600">
            {unreadCount} novas{unreadCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!isLoading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <LuBell className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Nenhuma notificação</p>
              <p className="text-xs text-gray-400 mt-1">Tudo em dia!</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-40">
              <LuLoader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div>
              {notifications.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    if (!notif.is_read) onMarkAsRead(notif.id);
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    !notif.is_read
                      ? "bg-blue-50/50 hover:bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex gap-3">
                    {!notif.is_read && (
                      <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-linear-to-r from-pasPink to-indigo-500 shrink-0 shadow-sm" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-tight ${
                          !notif.is_read
                            ? "font-bold text-gray-900"
                            : "font-medium text-gray-700"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2">
                        {new Date(notif.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-3 flex gap-2 bg-gray-50">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 text-gray-700 font-medium text-sm"
          >
            <IoReload
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Atualizar
          </button>
        </div>
      </motion.div>
    </>
  );
};

// ============================================================================
// MAIN APP LAYOUT COMPONENT
// ============================================================================

export default function AppLayout() {
  const { userProfile, loading, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // -------- States --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mainRef = useRef<HTMLDivElement | null>(null);

  // Estados para Swipe Detection
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const pageTitle = getPageTitle(location.pathname);

  // -------- Effects --------

  // Close FAB when route changes
  useEffect(() => {
    setFabOpen(false);
  }, [location.pathname]);

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [firebaseUser]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen || notificationsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen, notificationsOpen]);

  // -------- Functions --------

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro logout", error);
    }
  }, [navigate]);

  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const data = await getNotifications();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = (data || []).map((n: any) => ({
        ...n,
        read: n.is_read === 1 || n.is_read === true,
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markAsRead = useCallback(async (id: any) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      await markNotificationRead(Number(id));
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err);
    }
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle scroll to hide/show FAB (Navbar removida)
  useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current) return;
      const currentScrollY = mainRef.current.scrollTop;

      if (Math.abs(currentScrollY - lastScrollY) > 10) {
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setShowNav(false);
          setFabOpen(false);
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

  // -------- Swipe Logic --------
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    // const isRightSwipe = distance < -minSwipeDistance;

    // Detectar swipe da direita para a esquerda vindo da borda
    // window.innerWidth pega a largura da tela.
    // touchStart > window.innerWidth - 50 detecta se o toque começou nos últimos 50px da direita
    const isEdgeSwipe = touchStart > window.innerWidth - 50;

    if (isLeftSwipe && isEdgeSwipe) {
      setMobileMenuOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-3">
          <LuLoader2 className="h-12 w-12 animate-spin text-pasPink" />
          <p className="text-sm font-medium text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-full bg-gray-50 overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ================================================================ */}
      {/* DESKTOP SIDEBAR */}
      {/* ================================================================ */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-gray-200 bg-white h-full overflow-hidden">
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-linear-to-br from-pasPink to-pasPink/70 rounded-lg">
              <img src="/icon_big.png" alt="PowerSlim" className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold bg-linear-to-r from-pasPink to-indigo-600 bg-clip-text text-transparent">
              PowerSlim
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-linear-to-r from-pasPink/20 to-pasPink/5 text-gray-900 font-semibold shadow-sm border-l-2 border-pasPink"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-pasPink" : ""
                    }`}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="border-t border-gray-100 p-3 space-y-2">
          {/* Feedback Button */}
          <button
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-sm font-medium"
          >
            <LuMessageSquarePlus className="w-5 h-5" />
            <span>Feedback</span>
          </button>

          {/* User Profile */}
          <div
            onClick={() => navigate("/perfil")}
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group"
          >
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200 group-hover:border-gray-300 flex items-center justify-center">
              {firebaseUser && !avatarError ? (
                <img
                  src={`/api/get_avatar.php?uid=${firebaseUser.uid}`}
                  alt={userProfile?.nome}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <LuUser className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userProfile?.nome || "Usuário"}
              </p>
              <p className="text-xs text-gray-500 truncate">Ver perfil</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <LuLogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* MAIN CONTENT */}
      {/* ================================================================ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img src="/icon_small.png" alt="PowerSlim" className="w-8 h-8" />
            <h1 className="text-base font-bold text-gray-900 truncate">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 active:bg-gray-200"
              aria-label="Notificações"
            >
              <LuBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-linear-to-r from-pasPink to-red-500 rounded-full ring-2 ring-white shadow-sm" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 active:bg-gray-200"
              aria-label="Abrir menu"
            >
              <LuMenu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto scroll-smooth w-full md:pb-8"
        >
          <RenewalBanner />
          <Outlet />
        </main>
      </div>

      {/* ================================================================ */}
      {/* MOBILE FAB (SPEED DIAL) */}
      {/* ================================================================ */}
      <div className="md:hidden">
        {/* FAB Backdrop */}
        {fabOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20"
            onClick={() => setFabOpen(false)}
          />
        )}

        {/* FAB Container */}
        <div
          className={`fixed bottom-6 right-4 z-40 flex flex-col items-end gap-2 transition-transform duration-300 ${
            showNav ? "translate-y-0" : "translate-y-24"
          }`}
        >
          <AnimatePresence>
            {fabOpen && (
              <>
                {/* Treinar Option */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-3"
                >
                  <span className="bg-white text-gray-700 text-xs font-semibold py-1.5 px-3 rounded-lg shadow-sm border border-gray-200 whitespace-nowrap">
                    Ir para Treino
                  </span>
                  <Link
                    to="/treinos"
                    onClick={() => setFabOpen(false)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-pasPink to-pasPink/80 shadow-lg text-white hover:shadow-xl active:scale-95 transition-all"
                  >
                    <FaPersonRunning className="h-5 w-5" />
                  </Link>
                </motion.div>

                {/* Dieta Option */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ duration: 0.15, delay: 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="bg-white text-gray-700 text-xs font-semibold py-1.5 px-3 rounded-lg shadow-sm border border-gray-200 whitespace-nowrap">
                    Minha Dieta
                  </span>
                  <Link
                    to="/dietas"
                    onClick={() => setFabOpen(false)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-pasGreen to-pasGreen/80 shadow-lg text-white hover:shadow-xl active:scale-95 transition-all"
                  >
                    <LuUtensils className="h-5 w-5" />
                  </Link>
                </motion.div>

                {/* Feedback Option */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ duration: 0.15, delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="bg-white text-gray-700 text-xs font-semibold py-1.5 px-3 rounded-lg shadow-sm border border-gray-200 whitespace-nowrap">
                    Reportar
                  </span>
                  <button
                    onClick={() => {
                      setFabOpen(false);
                      setFeedbackOpen(true);
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg text-indigo-600 hover:shadow-xl active:scale-95 transition-all border border-indigo-100"
                  >
                    <LuMessageSquarePlus className="h-5 w-5" />
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main FAB Button */}
          <motion.button
            onClick={() => setFabOpen(!fabOpen)}
            className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg text-white transition-all active:scale-90 ${
              fabOpen
                ? "bg-gray-900 shadow-xl"
                : "bg-linear-to-br from-pasPink to-pasPink/80 shadow-xl hover:shadow-2xl"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: fabOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {fabOpen ? (
                <LuX className="h-6 w-6" />
              ) : (
                <LuPlus className="h-6 w-6" />
              )}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* DRAWERS */}
      {/* ================================================================ */}

      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userProfile={userProfile}
        firebaseUser={firebaseUser}
        avatarError={avatarError}
        onAvatarError={() => setAvatarError(true)}
        onLogout={handleLogout}
        onNavigate={navigate}
        onFeedback={() => setFeedbackOpen(true)}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={notifLoading}
        onRefresh={fetchNotifications}
        onMarkAsRead={markAsRead}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
}
