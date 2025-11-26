import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import apiClient, {
  isApiError,
  type UserMeasurement,
  type UserPreference,
} from "../../../api/apiClient";
import {
  LuTriangleAlert,
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
  LuKey,
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import type { DiaSemana } from "../../../types/onboarding.schema";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { auth } from "../../../firebase";

// --- Funções Auxiliares de Formatação ---

const formatGender = (gender: string | null | undefined): string => {
  if (gender === "masculino") return "Masculino";
  if (gender === "feminino") return "Feminino";
  if (gender === "outro") return "Outro";
  return "N/A";
};

const formatObjective = (objective: string | null | undefined): string => {
  if (objective === "perder_peso") return "Perder Peso";
  if (objective === "definir") return "Definição Muscular";
  if (objective === "ganhar_massa") return "Ganhar Massa";
  return "N/A";
};

const formatActivity = (activity: string | null | undefined): string => {
  const map: Record<string, string> = {
    sedentario: "Sedentário",
    leve: "Leve",
    moderado: "Moderado",
    ativo: "Ativo",
    muito_ativo: "Muito Ativo",
  };
  return activity ? map[activity] || "N/A" : "N/A";
};

const formatPreference = (type: string): string => {
  const map: Record<string, string> = {
    alergia: "Alergia",
    intolerancia: "Intolerância",
    preferencia: "Preferência",
    limitacao_fisica: "Limitação Física",
  };
  return type ? map[type] || "N/A" : "N/A";
};

// --- Componente de Card Reutilizável ---
const InfoCard: React.FC<{
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
}> = ({ title, icon: Icon, iconColor, children }) => (
  <div className="rounded-2xl bg-white p-6 shadow-md">
    <div className="flex items-center gap-3 mb-4">
      <div className={`rounded-full p-2 ${iconColor}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

// --- Componente de Item de Informação Reutilizável ---
const InfoItem: React.FC<{
  label: string;
  value: string | number | null | undefined;
  icon: React.ElementType;
}> = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2 text-gray-600">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <span className="font-semibold text-gray-900">{value || "N/A"}</span>
  </div>
);

// 2. NOVA FUNÇÃO: Calcula o status do IMC e a posição na barra
const getBmiStatus = (imc: number | null) => {
  // Define os limites da barra de visualização (15 a 40)
  const minBmi = 15;
  const maxBmi = 40;
  const totalRange = maxBmi - minBmi;

  if (!imc || imc <= 0) {
    return {
      label: "N/A",
      colorClass: "text-gray-500",
      percentage: 0,
    };
  }

  // Calcula a posição (0% a 100%) na barra
  // Garante que o valor fique entre os limites da barra
  const clampedImc = Math.max(minBmi, Math.min(imc, maxBmi));
  const percentage = ((clampedImc - minBmi) / totalRange) * 100;

  if (imc < 18.5) {
    return {
      label: "Abaixo do peso",
      colorClass: "text-blue-500",
      percentage,
    };
  }
  if (imc < 25) {
    return { label: "Peso ideal", colorClass: "text-green-600", percentage };
  }
  if (imc < 30) {
    return { label: "Sobrepeso", colorClass: "text-yellow-600", percentage };
  }
  return { label: "Obesidade", colorClass: "text-red-600", percentage };
};

const BmiGauge: React.FC<{ percentage: number }> = ({ percentage }) => {
  // Função auxiliar para calcular a posição das legendas
  const getLabelPosition = (value: number) => {
    const minBmi = 15;
    const maxBmi = 40;
    const totalRange = maxBmi - minBmi;
    const clampedValue = Math.max(minBmi, Math.min(value, maxBmi));
    return ((clampedValue - minBmi) / totalRange) * 100;
  };

  // Calcula a posição % de cada legenda
  const labels = [
    { value: 18.5, pos: getLabelPosition(18.5) },
    { value: 25, pos: getLabelPosition(25) },
    { value: 30, pos: getLabelPosition(30) },
  ];

  return (
    <div className="pt-7 p-4">
      {/* 1. A Barra Colorida (Gradiente) */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="bg-linear-to-r from-blue-400 via-green-400 via-40% to-yellow-400 to-70%"
          style={{ width: "80%" }} // A obesidade (vermelho) começa em ~80%
        />
        <div className="flex-1 bg-red-400" />
      </div>

      {/* 2. O Marcador Animado */}
      <div className="relative w-full h-3">
        <motion.div
          className="absolute -top-2 z-10" // z-10 para ficar sobre as linhas
          initial={{ left: "0%" }}
          animate={{ left: `${percentage}%` }} // Posição vinda do cálculo
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.3,
          }}
          style={{ transform: "translateX(-50%)" }} // Centraliza o marcador
        >
          {/* Marcador (bolinha + triângulo) */}
          <div className="h-2.5 w-2.5 rounded-full bg-gray-800 border-2 border-white shadow-lg" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[5px] border-t-gray-800" />
        </motion.div>
      </div>

      {/* 3. Legendas da Barra (Posicionadas Absolutamente) */}
      <div className="relative w-full h-4">
        {labels.map((label) => (
          <span
            key={label.value}
            className="absolute text-xs text-gray-500"
            style={{
              left: `${label.pos}%`, // Posição correta
              transform: "translateX(-50%)", // Centraliza o texto
            }}
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
    <div className="flex justify-between items-center gap-1">
      {allDays.map((day) => {
        const isActive = activeDays.includes(day.value);
        const isToday = day.value === today;

        return (
          <div
            key={day.value}
            title={day.long}
            className={`
              flex h-8 w-8 items-center justify-center rounded-full 
              border-2 text-xs font-bold transition-all
              ${
                isToday
                  ? "bg-[#A8F3DC]/60 text-[#2da484] border-[#A8F3DC]" // Cor "Hoje" (Verde)
                  : isActive
                  ? "bg-[#FCC3D2]/70 text-[#db889d] border-[#FCC3D2]" // Cor "Ativo" (Rosa)
                  : "bg-gray-200 text-gray-500 border-gray-300" // Cor "Inativo"
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

export default function ProfilePage() {
  // 1. Obter perfil base do AuthContext (carregado globalmente)
  const { userProfile } = useAuth();

  // 2. Estados locais para dados adicionais
  const [measurements, setMeasurements] = useState<UserMeasurement | null>(
    null
  );
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsMenuOpen, setSettingsMenuOpen] = useState(false);

  // 3. useEffect para buscar dados adicionais (medidas, preferências)
  useEffect(() => {
    if (!userProfile) return; // Espera o perfil estar disponível

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
        if (isApiError(err)) {
          setError(err.response?.data.error || "Erro ao buscar dados.");
        } else {
          setError("Falha ao carregar o perfil.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [userProfile]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Deseja realmente sair?")) {
      try {
        await signOut(auth);
        // O onAuthStateChanged no AuthContext cuidará de limpar o estado
        navigate("/login"); // Redireciona o usuário
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    }
  };

  // 4. Calcular IMC
  // 4. ATUALIZADO: useMemo agora calcula e retorna os dados do IMC
  const { imc, bmiStatus, bmiColor, bmiPercentage } = useMemo(() => {
    const alturaM = (userProfile?.altura_cm || 0) / 100;
    const pesoKg = measurements?.peso_kg || 0;
    let imcValue: number | null = null;

    if (alturaM > 0 && Number(pesoKg) > 0) {
      imcValue = parseFloat((Number(pesoKg) / (alturaM * alturaM)).toFixed(1));
    }

    // Pega o status, cor e percentual da função auxiliar
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

  // 5. Estado de Carregamento
  if (isLoading || !userProfile) {
    return (
      <div className="flex h-full items-center justify-center">
        <LuLoader className="h-12 w-12 animate-spin text-[#FCC3D2]" />
      </div>
    );
  }

  // 6. Estado de Erro
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg bg-red-100 p-4 text-red-700">
        <LuTriangleAlert className="h-8 w-8" />
        <h3 className="font-semibold">Erro ao carregar perfil</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Principal do Usuário - AGORA COM MENU DE OPÇÕES */}
      <div className="relative rounded-2xl bg-white p-6 shadow-md">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-gray-500">
            <LuCircleUser className="h-16 w-16" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              {userProfile.nome}
            </h1>
            <p className="text-gray-600">{userProfile.email}</p>
          </div>
        </div>

        {/* Botão e Menu de Configurações */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setSettingsMenuOpen(!isSettingsMenuOpen)}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            <LuSettings className="h-5 w-5" />
          </button>

          <AnimatePresence>
            {isSettingsMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <button className="flex gap-1 items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                  <LuKey />
                  Alterar senha
                </button>
                <button
                  className="flex gap-1 items-center w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LuLogOut />
                  Deslogar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <InfoCard
          title="Métricas"
          icon={LuCalculator}
          iconColor="bg-blue-100 text-blue-600"
        >
          {/* Item de IMC Atualizado */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <LuCalculator className="w-4 h-4" />
              <span>IMC</span>
            </div>
            {/* Mostra o valor e o status (ex: "22.1 (Peso ideal)") */}
            <span className={`font-medium ${bmiColor}`}>
              {imc ? `${imc} (${bmiStatus})` : "N/A"}
            </span>
          </div>

          {/* A Barra de Progresso Visual */}
          {imc && <BmiGauge percentage={bmiPercentage} />}

          <InfoItem
            label="Peso Atual"
            value={measurements?.peso_kg ? `${measurements.peso_kg} kg` : "N/A"}
            icon={LuWeight}
          />
          <InfoItem
            label="Altura"
            value={
              userProfile.altura_cm ? `${userProfile.altura_cm} cm` : "N/A"
            }
            icon={LuRuler}
          />
        </InfoCard>

        <InfoCard
          title="Objetivos"
          icon={LuTarget}
          iconColor="bg-[#FCC3D2]/30 text-[#db889d]"
        >
          <InfoItem
            label="Objetivo"
            value={formatObjective(userProfile.objetivo_atual)}
            icon={LuTarget}
          />
          <InfoItem
            label="Nível de Atividade"
            value={formatActivity(userProfile.nivel_atividade)}
            icon={LuHeartPulse}
          />
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LuHeartPulse className="w-4 h-4" />
              <span>Dias de Treino</span>
            </div>
            <TrainingDaysDisplay
              activeDays={userProfile.dias_treino}
              today={today}
            />
          </div>
        </InfoCard>

        <InfoCard
          title="Detalhes Pessoais"
          icon={LuCircleUser}
          iconColor="bg-gray-200 text-gray-700"
        >
          <InfoItem
            label="Nascimento"
            value={
              userProfile.data_nascimento
                ? new Date(userProfile.data_nascimento).toLocaleDateString(
                    "pt-BR"
                  )
                : "N/A"
            }
            icon={LuCake}
          />
          <InfoItem
            label="Gênero"
            value={formatGender(userProfile.genero)}
            icon={LuUserIcon}
          />
        </InfoCard>
      </div>

      {/* Grid de Medidas e Preferências */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <InfoCard
          title="Medidas (cm)"
          icon={LuScaling}
          iconColor="bg-[#A8F3DC]/60 text-[#2da484]"
        >
          {measurements ? (
            <>
              <InfoItem
                label="Cintura"
                value={measurements.cintura_cm}
                icon={LuScaling}
              />
              <InfoItem
                label="Quadril"
                value={measurements.quadril_cm}
                icon={LuScaling}
              />
              <InfoItem
                label="Braço"
                value={measurements.braco_cm}
                icon={LuScaling}
              />
              <InfoItem
                label="Coxa"
                value={measurements.coxa_cm}
                icon={LuScaling}
              />
            </>
          ) : (
            <p className="text-sm text-gray-500">Nenhuma medição encontrada.</p>
          )}
        </InfoCard>

        <InfoCard
          title="Preferências"
          icon={LuListChecks}
          iconColor="bg-yellow-100 text-yellow-700"
        >
          {preferences.length > 0 ? (
            preferences.map((pref) => (
              <InfoItem
                key={pref.preference_id}
                label={formatPreference(pref.tipo_restricao)}
                value={pref.valor}
                icon={LuShieldAlert}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">
              Nenhuma preferência registrada.
            </p>
          )}
        </InfoCard>
      </div>
    </div>
  );
}
