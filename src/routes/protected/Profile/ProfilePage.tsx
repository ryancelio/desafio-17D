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
  LuLoader,
  LuUser,
} from "react-icons/lu";
import { motion } from "framer-motion"; // 1. IMPORTAR 'motion'

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
    <span className="font-medium text-gray-900">{value || "N/A"}</span>
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
  return (
    <div className="pt-3">
      {/* 1. A Barra Colorida (Gradiente) */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="bg-gradient-to-r from-blue-400 via-green-400 via-40% to-yellow-400 to-70%"
          style={{ width: "80%" }} // A obesidade (vermelho) começa em ~80%
        />
        <div className="flex-1 bg-red-400" />
      </div>

      {/* 2. O Marcador Animado */}
      <div className="relative w-full h-3">
        <motion.div
          className="absolute -top-2"
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
          {/* Seta/triângulo apontando para baixo */}
          <div className="h-2.5 w-2.5 rounded-full bg-gray-800 border-2 border-white shadow-lg" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-800" />
        </motion.div>
      </div>
      {/* 3. Legendas da Barra */}
      <div className="flex justify-between text-xs text-gray-500 px-1 relative -top-1">
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
      </div>
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

  // 4. Calcular IMC
  // 4. ATUALIZADO: useMemo agora calcula e retorna os dados do IMC
  const { imc, bmiStatus, bmiColor, bmiPercentage } = useMemo(() => {
    const alturaM = (userProfile?.altura_cm || 0) / 100;
    const pesoKg = measurements?.peso_kg || 0;
    let imcValue: number | null = null;

    if (alturaM > 0 && pesoKg > 0) {
      imcValue = parseFloat((pesoKg / (alturaM * alturaM)).toFixed(1));
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
      {/* Card Principal do Usuário */}
      <div className="flex flex-col md:flex-row items-center gap-6 rounded-2xl bg-white p-6 shadow-md">
        <div className="relative">
          {/* Placeholder da Foto de Perfil */}
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-gray-500">
            <LuCircleUser className="h-16 w-16" />
          </div>
          <button className="absolute -bottom-1 -right-1 rounded-full bg-[#FCC3D2] p-1.5 text-gray-800 shadow-md hover:bg-[#db889d]">
            <LuSettings className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {userProfile.nome}
          </h1>
          <p className="text-gray-600">{userProfile.email}</p>
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
          <InfoItem
            label="Dias de Treino"
            value={userProfile.dias_treino.join(", ")}
            icon={LuHeartPulse}
          />
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
            icon={LuUser}
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
                key={pref.id}
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

      {/* Card de Configurações */}
      <InfoCard
        title="Configurações da Conta"
        icon={LuSettings}
        iconColor="bg-gray-200 text-gray-700"
      >
        <button className="text-sm font-medium text-blue-600 hover:underline">
          Alterar senha
        </button>
        <button className="text-sm font-medium text-red-600 hover:underline">
          Encerrar conta
        </button>
      </InfoCard>
    </div>
  );
}
