import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LuTrophy,
  LuFlame,
  LuDumbbell,
  LuUtensils,
  LuUser,
} from "react-icons/lu";
import { getLeaderboard } from "../../api/apiClient";

// Tipos
interface LeaderboardItem {
  rank: number;
  uid: string;
  nome: string;
  photo: string | null;
  streak: number;
  is_me: boolean;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"nutrition" | "workout">(
    "nutrition"
  );
  const [list, setList] = useState<LeaderboardItem[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboard(activeTab);
        setList(data.list);
        setUserRank(data.user_rank);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [activeTab]);

  // Função para renderizar medalhas
  const renderRankIcon = (rank: number) => {
    if (rank === 1) return <div className="text-2xl">🥇</div>;
    if (rank === 2) return <div className="text-2xl">🥈</div>;
    if (rank === 3) return <div className="text-2xl">🥉</div>;
    return (
      <span className="font-bold text-gray-500 w-6 text-center">{rank}º</span>
    );
  };

  const RowItem = ({ item }: { item: LeaderboardItem }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center p-4 rounded-2xl mb-2 border ${
        item.is_me
          ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200"
          : "bg-white border-gray-100"
      }`}
    >
      <div className="shrink-0 w-10 flex justify-center">
        {renderRankIcon(item.rank)}
      </div>

      <div className="shrink-0 ml-4">
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.nome}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <LuUser />
          </div>
        )}
      </div>

      <div className="ml-4 flex-1">
        <h4
          className={`text-sm font-bold ${
            item.is_me ? "text-indigo-900" : "text-gray-900"
          }`}
        >
          {item.nome} {item.is_me && "(Você)"}
        </h4>
        {item.is_me && (
          <p className="text-xs text-indigo-600 font-medium">Continue assim!</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
        <LuFlame
          className={`w-4 h-4 ${
            activeTab === "nutrition" ? "text-orange-500" : "text-blue-500"
          }`}
          fill="currentColor"
        />
        <span className="font-bold text-gray-800">{item.streak}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header com Gradiente */}
      <div className="bg-white pb-6 pt-6 px-4 rounded-b-3xl shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <LuTrophy className="text-yellow-500" /> Ranking Global
          </h1>

          {/* Abas */}
          <div className="flex p-1.5 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab("nutrition")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
                activeTab === "nutrition"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LuUtensils
                className={activeTab === "nutrition" ? "text-orange-500" : ""}
              />
              Foco na Dieta
            </button>
            <button
              onClick={() => setActiveTab("workout")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
                activeTab === "workout"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LuDumbbell
                className={activeTab === "workout" ? "text-blue-500" : ""}
              />
              Constância Treino
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="max-w-md mx-auto px-4 mt-6 space-y-2">
        {loading ? (
          <div className="text-center py-10 text-gray-400">
            Carregando ranking...
          </div>
        ) : (
          <>
            {list.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Ninguém entrou no ranking hoje. Seja o primeiro!
              </div>
            ) : (
              list.map((item) => <RowItem key={item.uid} item={item} />)
            )}

            {/* Se o usuário não estiver no Top 50, mostra ele fixo no final ou separado */}
            {userRank && !list.find((i) => i.uid === userRank.uid) && (
              <>
                <div className="flex items-center gap-4 my-6">
                  <div className="h-px bg-gray-300 flex-1" />
                  <span className="text-xs text-gray-400 font-bold uppercase">
                    Sua Posição
                  </span>
                  <div className="h-px bg-gray-300 flex-1" />
                </div>
                <RowItem item={userRank} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
