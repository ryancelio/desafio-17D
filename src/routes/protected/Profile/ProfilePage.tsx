import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import apiClient, { isApiError } from "../../../api/apiClient";
import {
  LuCircleUser,
  LuCake,
  LuRuler,
  LuWeight,
  LuCalculator,
  LuTarget,
  LuHeartPulse,
  LuScaling,
  LuListChecks,
  LuShieldAlert,
  LuSettings,
  LuLoaderCircle as LuLoader,
  LuUser as LuUserIcon,
  LuLogOut,
  LuPencil,
  LuCreditCard,
  LuCalendarClock,
  LuCircleCheck,
  LuCircleAlert as LuAlertCircle,
  LuCircleX as LuXCircle,
  LuClock,
  LuCamera,
  // LuChevronRight,
  LuSparkles,
  LuDumbbell,
  LuX,
  LuPhone, // Novo
  LuBuilding2, // Novo
  LuHouse as LuHome, // Novo
  LuFlag, // Novo (Meta)
  LuMapPin, // Novo
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { auth } from "../../../firebase";
import type {
  DiaSemana,
  SubscriptionStatus,
  UserMeasurement,
  UserPreference,
} from "../../../types/models";

// --- Funções Auxiliares ---
const formatGender = (gender: string | null | undefined) => {
  if (gender === "masculino") return "Masculino";
  if (gender === "feminino") return "Feminino";
  if (gender === "outro") return "Outro";
  return "N/A";
};

const formatObjective = (objective: string | null | undefined) => {
  const map: Record<string, string> = {
    perder_peso: "Perder Peso",
    definir: "Definição Muscular",
    ganhar_massa: "Ganhar Massa",
  };
  return objective ? map[objective] || "N/A" : "N/A";
};

const formatActivity = (activity: string | null | undefined) => {
  const map: Record<string, string> = {
    sedentario: "Sedentário",
    leve: "Leve",
    moderado: "Moderado",
    ativo: "Ativo",
    muito_ativo: "Muito Ativo",
  };
  return activity ? map[activity] || "N/A" : "N/A";
};

// Novo Helper para Local
const formatLocalTreino = (local: string | null | undefined) => {
  if (local === "academia") return { label: "Academia", icon: LuBuilding2 };
  if (local === "casa") return { label: "Em Casa", icon: LuHome };
  return { label: "Não definido", icon: LuMapPin };
};

const formatPreference = (type: string) => {
  const map: Record<string, string> = {
    alergia: "Alergia",
    intolerancia: "Intolerância",
    preferencia: "Preferência",
    limitacao_fisica: "Limitação Física",
  };
  return type ? map[type] || "N/A" : "N/A";
};

const getPlanStyles = (status: SubscriptionStatus | undefined) => {
  if (status === "active")
    return {
      badgeBg: "bg-emerald-500/20",
      badgeText: "text-emerald-300",
      badgeBorder: "border-emerald-500/30",
      icon: LuCircleCheck,
      label: "Ativo",
    };
  if (status === "pending" || status === "expired")
    return {
      badgeBg: "bg-amber-500/20",
      badgeText: "text-amber-300",
      badgeBorder: "border-amber-500/30",
      icon: LuAlertCircle,
      label: "Atenção",
    };
  if (status === "cancelled" || status === "none")
    return {
      badgeBg: "bg-red-500/20",
      badgeText: "text-red-300",
      badgeBorder: "border-red-500/30",
      icon: LuXCircle,
      label: "Inativo",
    };
  return {
    badgeBg: "bg-gray-500/20",
    badgeText: "text-gray-300",
    badgeBorder: "border-gray-500/30",
    icon: LuClock,
    label: "Desconhecido",
  };
};

const formatPlanName = (plan: string | undefined) => {
  if (!plan) return "Plano Gratuito";
  return plan.charAt(0).toUpperCase() + plan.slice(1);
};

// --- COMPONENTES UI ---

const InfoCard: React.FC<{
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}> = ({ title, icon: Icon, iconColor, children, className = "", action }) => {
  return (
    <div
      className={`
        relative flex flex-col justify-between 
        rounded-2xl md:rounded-3xl bg-white p-5 md:p-6 
        shadow-sm border border-gray-100
        active:scale-[0.99] transition-transform duration-200 
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 md:gap-4">
          <div
            className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl ${iconColor} ring-2 ring-white shadow-sm`}
          >
            <Icon className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-gray-800 tracking-tight leading-none">
              {title}
            </h3>
            <div className="mt-1 h-0.5 w-6 rounded-full bg-gray-100" />
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 flex flex-col gap-1">{children}</div>
    </div>
  );
};

const InfoItem: React.FC<{
  label: string;
  value: string | number | null | undefined;
  icon: React.ElementType;
  valueClassName?: string;
  subValue?: string;
}> = ({
  label,
  value,
  icon: Icon,
  valueClassName = "text-gray-900",
  subValue,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-gray-50 text-gray-400">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-sm font-medium text-gray-500">{label}</span>
    </div>
    <div className="text-right flex flex-col items-end sm:flex-row sm:items-center">
      <span className={`text-sm font-bold ${valueClassName}`}>
        {value || "—"}
      </span>
      {subValue && (
        <span className="text-[10px] sm:text-xs text-gray-400 font-medium sm:ml-1 leading-none sm:leading-normal">
          {subValue}
        </span>
      )}
    </div>
  </div>
);

const getBmiStatus = (imc: number | null) => {
  const minBmi = 15;
  const maxBmi = 40;
  const totalRange = maxBmi - minBmi;
  if (!imc || imc <= 0)
    return { label: "N/A", colorClass: "text-gray-400", percentage: 0 };
  const clampedImc = Math.max(minBmi, Math.min(imc, maxBmi));
  const percentage = ((clampedImc - minBmi) / totalRange) * 100;
  if (imc < 18.5)
    return { label: "Abaixo do peso", colorClass: "text-blue-500", percentage };
  if (imc < 25)
    return { label: "Peso ideal", colorClass: "text-emerald-500", percentage };
  if (imc < 30)
    return { label: "Sobrepeso", colorClass: "text-amber-500", percentage };
  return { label: "Obesidade", colorClass: "text-red-500", percentage };
};

const BmiGauge: React.FC<{ percentage: number }> = ({ percentage }) => {
  const getLabelPosition = (value: number) => {
    const minBmi = 15;
    const maxBmi = 40;
    const totalRange = maxBmi - minBmi;
    const clampedValue = Math.max(minBmi, Math.min(value, maxBmi));
    return ((clampedValue - minBmi) / totalRange) * 100;
  };
  const labels = [
    { value: 18.5, pos: getLabelPosition(18.5) },
    { value: 25, pos: getLabelPosition(25) },
    { value: 30, pos: getLabelPosition(30) },
  ];

  return (
    <div className="pt-6 pb-2 px-1">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="bg-linear-to-r from-blue-400 via-emerald-400 via-40% to-amber-400 to-70%"
          style={{ width: "80%" }}
        />
        <div className="flex-1 bg-red-400" />
      </div>
      <div className="relative w-full h-3">
        <motion.div
          className="absolute -top-1.5 z-10"
          initial={{ left: "0%" }}
          animate={{ left: `${percentage}%` }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.3,
          }}
          style={{ transform: "translateX(-50%)" }}
        >
          <div className="h-3 w-3 rounded-full bg-gray-800 border-2 border-white shadow-md" />
        </motion.div>
      </div>
      <div className="relative w-full h-4">
        {labels.map((label) => (
          <span
            key={label.value}
            className="absolute text-[9px] text-gray-400 font-medium"
            style={{ left: `${label.pos}%`, transform: "translateX(-50%)" }}
          >
            {label.value}
          </span>
        ))}
      </div>
    </div>
  );
};

const allDays: { long: string; short: string; value: DiaSemana }[] = [
  { long: "Domingo", short: "D", value: "DOM" },
  { long: "Segunda", short: "S", value: "SEG" },
  { long: "Terça", short: "T", value: "TER" },
  { long: "Quarta", short: "Q", value: "QUA" },
  { long: "Quinta", short: "Q", value: "QUI" },
  { long: "Sexta", short: "S", value: "SEX" },
  { long: "Sábado", short: "S", value: "SAB" },
];

const TrainingDaysDisplay: React.FC<{
  activeDays: DiaSemana[];
  today: DiaSemana;
}> = ({ activeDays, today }) => {
  return (
    <div className="flex justify-between items-center gap-1 pt-2">
      {allDays.map((day) => {
        const isActive = activeDays.includes(day.value);
        const isToday = day.value === today;
        return (
          <div
            key={day.value}
            className={`
              flex h-8 w-8 items-center justify-center rounded-full 
              text-[10px] font-bold transition-all duration-300
              ${
                isToday
                  ? "bg-indigo-600 text-white shadow-md"
                  : isActive
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                  : "bg-gray-50 text-gray-300 border border-transparent"
              }
            `}
          >
            {day.short}
          </div>
        );
      })}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function ProfilePage() {
  const { userProfile, refetchProfile, firebaseUser } = useAuth();
  const [measurements, setMeasurements] = useState<UserMeasurement | null>(
    null
  );
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Estados Foto
  const [isUploading, setIsUploading] = useState(false);
  const [profileImageKey, setProfileImageKey] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userProfile) return;
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [measureData, prefsData] = await Promise.all([
          apiClient.getLatestMeasurements(),
          apiClient.getUserPreferences(),
        ]);
        setMeasurements(measureData);
        setPreferences(prefsData);
      } catch (err) {
        if (isApiError(err))
          setError(err.response?.data.error || "Erro ao buscar dados.");
        else setError("Falha ao carregar o perfil.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [userProfile]);

  const handleLogout = async () => {
    if (window.confirm("Deseja realmente sair?")) {
      try {
        await signOut(auth);
        navigate("/login");
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB.");
        return;
      }
      setIsUploading(true);
      try {
        await apiClient.uploadProfilePhoto(file);
        setProfileImageKey(Date.now());
        await refetchProfile();
      } catch (err) {
        console.error("Erro no upload:", err);
        alert("Erro ao enviar imagem.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const { imc, bmiStatus, bmiColor, bmiPercentage } = useMemo(() => {
    const alturaM = (userProfile?.profile?.altura_cm || 0) / 100;
    const pesoKg = measurements?.peso_kg || 0;
    let imcValue: number | null = null;
    if (alturaM > 0 && Number(pesoKg) > 0) {
      imcValue = parseFloat((Number(pesoKg) / (alturaM * alturaM)).toFixed(1));
    }
    const { label, colorClass, percentage } = getBmiStatus(imcValue);
    return {
      imc: imcValue,
      bmiStatus: label,
      bmiColor: colorClass,
      bmiPercentage: percentage,
    };
  }, [userProfile, measurements]);

  const today = useMemo(() => {
    const dayMap: DiaSemana[] = [
      "DOM",
      "SEG",
      "TER",
      "QUA",
      "QUI",
      "SEX",
      "SAB",
    ];
    return dayMap[new Date().getDay()];
  }, []);

  const avatarUrl =
    userProfile && firebaseUser
      ? `/api/get_avatar.php?uid=${firebaseUser.uid}&t=${profileImageKey}`
      : null;

  if (isLoading || !userProfile)
    return (
      <div className="flex h-full items-center justify-center">
        <LuLoader className="h-12 w-12 animate-spin text-indigo-200" />
      </div>
    );
  if (error)
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        {error}
      </div>
    );

  const planData = {
    nome: userProfile.subscription.plan_name || "Nao Ativo",
    status: userProfile.subscription.status || "ativo",
    renovacao: userProfile.subscription.expires_at,
  };
  const planStyles = getPlanStyles(planData.status);
  const StatusIcon = planStyles.icon;
  const localTreinoInfo = formatLocalTreino(userProfile.profile.local_treino);

  return (
    <div className="min-h-dvh pb-24 pt-2 md:pt-0 px-3 space-y-5">
      {/* HEADER DE PERFIL */}
      <div className="relative rounded-3xl bg-white p-6 shadow-sm border border-gray-100 overflow-visible">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-full p-1 bg-white shadow-lg ring-1 ring-gray-100">
              <div className="h-full w-full rounded-full bg-gray-50 overflow-hidden relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userProfile.nome}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      document
                        .getElementById("default-avatar")
                        ?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  id="default-avatar"
                  className={`absolute inset-0 flex items-center justify-center bg-indigo-50 text-indigo-200 ${
                    avatarUrl ? "hidden" : ""
                  }`}
                >
                  <LuCircleUser className="h-14 w-14 md:h-16 md:w-16" />
                </div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2.5 bg-gray-900 text-white rounded-full shadow-lg active:scale-95 disabled:opacity-70 z-10 hover:bg-black transition-transform"
              >
                {isUploading ? (
                  <LuLoader className="h-4 w-4 animate-spin" />
                ) : (
                  <LuCamera className="h-4 w-4" />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
            </div>
          </div>

          <div className="text-center md:text-left flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-1 truncate">
              {userProfile.nome}
            </h1>
            <p className="text-gray-500 font-medium text-sm md:text-base mb-3 truncate">
              {userProfile.email}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-wide">
                <LuUserIcon className="w-3 h-3" /> Membro
              </span>
              {planData.nome.toLowerCase() !== "gratuito" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[10px] md:text-xs font-bold text-amber-700 uppercase tracking-wide border border-amber-100">
                  <LuSparkles className="w-3 h-3" /> Premium
                </span>
              )}
            </div>
          </div>

          {/* Botão Settings */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6">
            <button
              onClick={() => setSettingsMenuOpen(true)}
              className="p-2.5 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <LuSettings className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET */}
      <AnimatePresence>
        {isSettingsMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsMenuOpen(false)}
              className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-70 bg-white rounded-t-4xl p-6 shadow-2xl md:absolute md:bottom-auto md:left-auto md:right-4 md:top-20 md:w-64 md:rounded-2xl md:p-2"
            >
              <div className="md:hidden flex justify-center mb-6">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>

              <div className="flex justify-between items-center md:hidden mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Configurações
                </h3>
                <button
                  onClick={() => setSettingsMenuOpen(false)}
                  className="p-2 bg-gray-100 rounded-full text-gray-500"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  className="flex items-center gap-4 w-full p-4 md:p-2.5 text-left font-medium text-gray-700 bg-gray-50 md:bg-white hover:bg-gray-100 rounded-xl transition-colors active:scale-[0.98]"
                  onClick={() => navigate("/perfil/editar")}
                >
                  <div className="p-2 bg-white md:bg-gray-100 rounded-lg text-gray-600 shadow-sm md:shadow-none">
                    <LuPencil className="w-5 h-5 md:w-4 md:h-4" />
                  </div>
                  <span className="text-base md:text-sm">Editar Dados</span>
                </button>

                <button
                  className="flex items-center gap-4 w-full p-4 md:p-2.5 text-left font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors active:scale-[0.98]"
                  onClick={handleLogout}
                >
                  <div className="p-2 bg-white rounded-lg text-red-500 shadow-sm md:shadow-none">
                    <LuLogOut className="w-5 h-5 md:w-4 md:h-4" />
                  </div>
                  <span className="text-base md:text-sm">Sair da Conta</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {/* 1. ASSINATURA */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-gray-900 p-6 md:p-7 shadow-xl text-white group transition-all duration-300 active:scale-[0.99]">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col h-full justify-between gap-5 md:gap-6">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                <LuCreditCard className="h-5 w-5 md:h-6 md:w-6 text-indigo-200" />
              </div>
              <div
                className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold border backdrop-blur-md flex items-center gap-1.5 shadow-sm ${planStyles.badgeBg} ${planStyles.badgeText} ${planStyles.badgeBorder}`}
              >
                <StatusIcon className="w-3 h-3" />
                {planStyles.label.toUpperCase()}
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">
                Seu Plano
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {formatPlanName(planData.nome)}
              </h3>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-300 bg-black/20 p-2.5 rounded-lg border border-white/5">
                <LuCalendarClock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">
                  {planData.renovacao
                    ? `Vence em: ${new Date(
                        planData.renovacao
                      ).toLocaleDateString("pt-BR")}`
                    : "Acesso vitalício ou indefinido"}
                </span>
              </div>

              {/* Botões de Ação Atualizados */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/assinatura")}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 py-3 rounded-xl text-xs font-bold transition-colors"
                >
                  Gerenciar
                </button>
                <button
                  onClick={() => navigate("/assinatura/renovar")}
                  className="flex items-center justify-center gap-2 bg-white text-slate-900 py-3 rounded-xl text-xs font-bold active:bg-gray-100 transition-colors shadow-lg hover:bg-gray-50"
                >
                  <LuSparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  Renovar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MÉTRICAS */}
        <InfoCard
          title="Métricas"
          icon={LuCalculator}
          iconColor="text-blue-600 bg-blue-50"
        >
          <div className="flex items-center justify-between text-sm px-1">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <span>IMC</span>
            </div>
            <span className={`font-bold ${bmiColor}`}>
              {imc ? `${imc} • ${bmiStatus}` : "N/A"}
            </span>
          </div>
          {imc && <BmiGauge percentage={bmiPercentage} />}
          <div className="mt-2 space-y-1">
            <InfoItem
              label="Peso Atual"
              value={measurements?.peso_kg ? `${measurements.peso_kg}` : null}
              subValue="kg"
              icon={LuWeight}
            />
            {userProfile.profile.peso_alvo && (
              <InfoItem
                label="Peso Alvo"
                value={userProfile.profile.peso_alvo}
                subValue="kg"
                icon={LuFlag}
                valueClassName="text-indigo-600"
              />
            )}
            <InfoItem
              label="Altura"
              value={userProfile.profile?.altura_cm}
              subValue="cm"
              icon={LuRuler}
            />
          </div>
        </InfoCard>

        {/* 3. OBJETIVOS E FOCO */}
        <InfoCard
          title="Foco"
          icon={LuTarget}
          iconColor="text-pink-600 bg-pink-50"
        >
          <InfoItem
            label="Objetivo"
            value={formatObjective(userProfile.profile.objetivo)}
            icon={LuTarget}
          />
          <InfoItem
            label="Ambiente"
            value={localTreinoInfo.label}
            icon={localTreinoInfo.icon}
          />
          <InfoItem
            label="Nível Atividade"
            value={formatActivity(userProfile.profile.nivel_atividade)}
            icon={LuHeartPulse}
          />
          <div className="mt-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
              <LuDumbbell className="w-3 h-3" /> Frequência Semanal
            </div>
            <TrainingDaysDisplay
              activeDays={userProfile.profile.dias_treino}
              today={today}
            />
          </div>
        </InfoCard>

        {/* 4. PESSOAL */}
        <InfoCard
          title="Dados Pessoais"
          icon={LuCircleUser}
          iconColor="text-indigo-600 bg-indigo-50"
        >
          <InfoItem
            label="Nascimento"
            value={
              userProfile.profile.data_nascimento
                ? new Date(
                    userProfile.profile.data_nascimento
                  ).toLocaleDateString("pt-BR")
                : "N/A"
            }
            icon={LuCake}
          />
          <InfoItem
            label="Gênero"
            value={formatGender(userProfile.profile.genero)}
            icon={LuUserIcon}
          />
          <InfoItem
            label="Telefone"
            value={userProfile.telefone}
            icon={LuPhone}
          />
          <InfoItem
            label="Membro desde"
            value={new Date().getFullYear().toString()}
            icon={LuClock}
          />
        </InfoCard>
      </div>

      {/* GRID INFERIOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <InfoCard
          title="Últimas Medidas"
          icon={LuScaling}
          iconColor="text-emerald-600 bg-emerald-50"
        >
          {measurements ? (
            <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-1">
              <InfoItem
                label="Cintura"
                value={measurements.cintura_cm}
                subValue="cm"
                icon={LuScaling}
              />
              <InfoItem
                label="Quadril"
                value={measurements.quadril_cm}
                subValue="cm"
                icon={LuScaling}
              />
              <InfoItem
                label="Braço"
                value={measurements.braco_cm}
                subValue="cm"
                icon={LuScaling}
              />
              <InfoItem
                label="Coxa"
                value={measurements.coxa_cm}
                subValue="cm"
                icon={LuScaling}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <LuScaling className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">Nenhuma medida registrada</p>
            </div>
          )}
        </InfoCard>

        <InfoCard
          title="Preferências & Restrições"
          icon={LuListChecks}
          iconColor="text-amber-600 bg-amber-50"
        >
          {preferences.length > 0 ? (
            <div className="space-y-1 max-h-45 overflow-y-auto pr-1 custom-scrollbar">
              {preferences.map((pref) => (
                <InfoItem
                  key={pref.preference_id}
                  label={formatPreference(pref.tipo_restricao)}
                  value={pref.valor}
                  icon={LuShieldAlert}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <LuListChecks className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">
                Nenhuma preferência registrada
              </p>
            </div>
          )}
        </InfoCard>
      </div>
    </div>
  );
}
