import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Lock,
  Target,
  Check,
  Calendar,
  ShieldAlert,
  Plus,
  Trash2,
  // Dumbbell,
  Home,
  Building2,
} from "lucide-react";
import type {
  DiaSemana,
  Genero,
  NivelAtividade,
  Objetivo,
  UserPreference,
  UserProfile,
} from "../../../types/models";
import {
  getUserPreferences,
  syncUserPreferences,
  updateUserProfile,
  isApiError,
} from "../../../api/apiClient";

// --- Função Auxiliar de Máscara ---
const formatPhone = (value: string) => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, "");

  // Limita a 11 dígitos
  const truncated = numbers.slice(0, 11);

  // Aplica a máscara (XX) XXXXX-XXXX
  if (truncated.length > 10) {
    return truncated.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (truncated.length > 5) {
    return truncated.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (truncated.length > 2) {
    return truncated.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
  } else {
    return truncated.replace(/^(\d*)/, "$1");
  }
};

// --- Constantes (Mantidas) ---
const OBJECTIVES = [
  { value: "perder_peso", label: "Perder Peso" },
  { value: "definir", label: "Definição Muscular" },
  { value: "ganhar_massa", label: "Ganhar Massa" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentario", label: "Sedentário" },
  { value: "leve", label: "Leve (1-2x semana)" },
  { value: "moderado", label: "Moderado (3-4x semana)" },
  { value: "ativo", label: "Ativo (5-6x semana)" },
  { value: "muito_ativo", label: "Muito Ativo (Todos os dias)" },
];

const GENDERS = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "outro", label: "Outro" },
];

const DIAS_SEMANA: { label: string; value: DiaSemana }[] = [
  { label: "Dom", value: "DOM" },
  { label: "Seg", value: "SEG" },
  { label: "Ter", value: "TER" },
  { label: "Qua", value: "QUA" },
  { label: "Qui", value: "QUI" },
  { label: "Sex", value: "SEX" },
  { label: "Sáb", value: "SAB" },
];

const PREFERENCE_TYPES = [
  { value: "alergia", label: "Alergia" },
  { value: "intolerancia", label: "Intolerância" },
  { value: "preferencia", label: "Preferência" },
  { value: "limitacao_fisica", label: "Limitação Física" },
];

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { userProfile, firebaseUser, refetchProfile } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- Estados do Formulário ---
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [alturaCm, setAlturaCm] = useState<number | string>("");
  const [genero, setGenero] = useState("outro");

  const [objetivo, setObjetivo] = useState<Objetivo>("definir");
  const [atividade, setAtividade] = useState<NivelAtividade>("moderado");
  const [localTreino, setLocalTreino] = useState<"academia" | "casa">(
    "academia"
  );
  const [pesoAlvo, setPesoAlvo] = useState<number | string>("");
  const [diasTreino, setDiasTreino] = useState<DiaSemana[]>([]);

  // Preferências
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [newPrefType, setNewPrefType] = useState<
    "preferencia" | "alergia" | "intolerancia"
  >("preferencia");
  const [newPrefValue, setNewPrefValue] = useState("");

  // Senha
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // --- Carregar Dados Iniciais ---
  useEffect(() => {
    if (userProfile) {
      setNome(userProfile.nome || "");
      // Aplica a formatação ao carregar do banco também
      setTelefone(formatPhone(userProfile.telefone || ""));

      const p = userProfile.profile;
      if (p) {
        setDataNascimento(
          p.data_nascimento ? p.data_nascimento.split("T")[0] : ""
        );
        setAlturaCm(p.altura_cm || "");
        setGenero(p.genero || "outro");
        setObjetivo(p.objetivo || "definir");
        setAtividade(p.nivel_atividade || "sedentario");
        setLocalTreino(p.local_treino || "academia");
        setPesoAlvo(p.peso_alvo || "");
        setDiasTreino(p.dias_treino || []);
      }
    }

    const fetchPrefs = async () => {
      try {
        const prefs = await getUserPreferences();
        setPreferences(prefs);
      } catch (err) {
        console.error("Erro prefs", err);
      }
    };
    fetchPrefs();
  }, [userProfile]);

  // --- Handlers ---
  const toggleDia = (dia: DiaSemana) => {
    setDiasTreino((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const handleAddPreference = () => {
    if (!newPrefValue.trim()) return;
    const newPref: UserPreference = {
      preference_id: Date.now(),
      user_uid: firebaseUser?.uid || "",
      tipo_restricao: newPrefType,
      valor: newPrefValue,
    };
    setPreferences([...preferences, newPref]);
    setNewPrefValue("");
  };

  const handleRemovePreference = (id: number) => {
    setPreferences(preferences.filter((p) => p.preference_id !== id));
  };

  // --- Salvar ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!firebaseUser) throw new Error("Usuário não autenticado.");
      if (!userProfile) throw new Error("Perfil não carregado.");

      const updates: Partial<UserProfile> = {
        nome,
        telefone, // Salva o telefone formatado (ou você pode limpar com replace antes de salvar se preferir)
        profile: {
          ...userProfile.profile,
          data_nascimento: dataNascimento,
          altura_cm: Number(alturaCm) || 0,
          genero: genero as Genero,
          objetivo: objetivo,
          local_treino: localTreino,
          peso_alvo: Number(pesoAlvo) || 0,
          nivel_atividade: atividade,
          dias_treino: diasTreino,
        },
      };

      await updateUserProfile(updates);
      await syncUserPreferences(preferences);

      if (nome !== firebaseUser.displayName) {
        await updateProfile(firebaseUser, { displayName: nome });
      }

      if (showPasswordSection && newPassword) {
        if (!currentPassword) throw new Error("Confirme sua senha atual.");
        const credential = EmailAuthProvider.credential(
          firebaseUser.email!,
          currentPassword
        );
        await reauthenticateWithCredential(firebaseUser, credential);
        await updatePassword(firebaseUser, newPassword);
      }

      await refetchProfile();
      setSuccess("Perfil atualizado!");
      setTimeout(() => navigate("/perfil"), 1500);
    } catch (err: unknown) {
      console.error(err);
      let msg = "Erro ao atualizar. Verifique os dados.";

      if (typeof err === "object" && err !== null && "code" in err) {
        if ((err as { code: string }).code === "auth/wrong-password") {
          msg = "Senha incorreta.";
        }
      } else if (isApiError(err)) {
        msg = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 left-0 z-10 bg-white border-b w-full border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Editar Perfil</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-100 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <Check /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Dados Pessoais */}
          <section className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
              <User className="text-gray-400 w-5 h-5" /> Dados Pessoais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* INPUT TELEFONE COM MÁSCARA */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  maxLength={15}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Data Nascimento
                </label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Gênero
                </label>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white outline-none"
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={alturaCm}
                  onChange={(e) => setAlturaCm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="170"
                />
              </div>
            </div>
          </section>

          {/* ... Restante do código igual ... */}
          {/* 2. Metas & Físico */}
          <section className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
              <Target className="text-gray-400 w-5 h-5" /> Metas & Físico
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Objetivo Principal
                </label>
                <select
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value as Objetivo)}
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white outline-none"
                >
                  {OBJECTIVES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Peso Alvo (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={pesoAlvo}
                  onChange={(e) => setPesoAlvo(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none"
                  placeholder="70.5"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Nível de Atividade
                </label>
                <select
                  value={atividade}
                  onChange={(e) =>
                    setAtividade(e.target.value as NivelAtividade)
                  }
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white outline-none"
                >
                  {ACTIVITY_LEVELS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Local de Treino */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Onde você treina?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLocalTreino("academia")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    localTreino === "academia"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Building2 className="w-5 h-5" /> Academia
                </button>
                <button
                  type="button"
                  onClick={() => setLocalTreino("casa")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    localTreino === "casa"
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Home className="w-5 h-5" /> Em Casa
                </button>
              </div>
            </div>

            {/* Dias de Treino */}
            <div className="pt-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Dias de Treino
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {DIAS_SEMANA.map((dia) => {
                  const isActive = diasTreino.includes(dia.value);
                  return (
                    <button
                      key={dia.value}
                      type="button"
                      onClick={() => toggleDia(dia.value)}
                      className={`py-2 rounded-lg text-sm font-semibold transition-all border ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-600 border-gray-300"
                      }`}
                    >
                      {dia.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 3. Preferências */}
          <section className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
              <ShieldAlert className="text-gray-400 w-5 h-5" /> Restrições
            </h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {preferences.map((pref) => (
                <div
                  key={pref.preference_id}
                  className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-3 py-1.5 rounded-lg border border-yellow-200 text-xs font-medium"
                >
                  <span className="opacity-70 uppercase">
                    {pref.tipo_restricao}:
                  </span>{" "}
                  {pref.valor}
                  <button
                    type="button"
                    onClick={() => handleRemovePreference(pref.preference_id)}
                    className="hover:text-red-600 ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <div className="w-1/3">
                <select
                  value={newPrefType}
                  onChange={(e) =>
                    setNewPrefType(
                      e.target.value as
                        | "preferencia"
                        | "alergia"
                        | "intolerancia"
                    )
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none"
                >
                  {PREFERENCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={newPrefValue}
                  onChange={(e) => setNewPrefValue(e.target.value)}
                  placeholder="Ex: Amendoim"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddPreference}
                className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* 4. Segurança */}
          <section className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Lock className="text-gray-400 w-5 h-5" /> Segurança
              </h2>
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-sm text-indigo-600 font-medium hover:underline"
              >
                {showPasswordSection ? "Cancelar" : "Alterar Senha"}
              </button>
            </div>
            <AnimatePresence>
              {showPasswordSection && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 border border-yellow-200">
                    Confirme sua senha atual para definir uma nova.
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </form>
      </div>
    </div>
  );
}
