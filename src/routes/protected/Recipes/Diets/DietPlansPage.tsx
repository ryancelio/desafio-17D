import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Loader2, Utensils, Sparkles, Lock } from "lucide-react";
import apiClient from "../../../../api/apiClient";
// Importamos os tipos específicos da resposta da API
import type {
  GetUserDietsResponse,
  DietPlanResponse,
} from "../../../../types/api-types";
import { useAuth } from "../../../../context/AuthContext";
import UpgradeModal from "../../dashboard/Components/UpgradeModal";

// --- Card da Dieta (Tipado) ---
const DietCard: React.FC<{ plan: DietPlanResponse }> = ({ plan }) => {
  return (
    <Link to={`/dieta/${plan.plan_id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-green-200 transition-all"
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">
              <Utensils className="h-3 w-3" /> Nutrição
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {plan.calorias_meta} kcal
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
            {plan.nome}
          </h3>
        </div>

        {/* Resumo de Refeições */}
        <div className="flex-1 px-5 pb-4 space-y-2 bg-gray-50/50 pt-3">
          {plan.meals.slice(0, 3).map((meal) => (
            <div
              key={meal.meal_id}
              className="flex justify-between text-sm text-gray-600"
            >
              <span>{meal.nome}</span>
              <span className="text-xs text-gray-400">
                {meal.horario?.slice(0, 5)}
              </span>
            </div>
          ))}
          {plan.meals.length > 3 && (
            <p className="text-xs text-gray-400">
              + {plan.meals.length - 3} refeições
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default function DietPlansPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Estado tipado corretamente com a resposta da API (Array de DietPlanResponse)
  const [plans, setPlans] = useState<GetUserDietsResponse>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  // Permissão: Planos "Completo" ou "Nutri"
  const hasAccess = useMemo(() => {
    const planName = userProfile?.subscription?.plan_name?.toLowerCase() || "";
    return (
      planName.includes("nutri") ||
      planName.includes("completo") ||
      planName.includes("premium")
    );
  }, [userProfile]);

  useEffect(() => {
    apiClient
      .getUserDiets()
      .then((data) => {
        setPlans(data); // Agora o TypeScript infere corretamente sem 'as any'
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleRequestClick = () => {
    if (hasAccess) navigate("/dieta/solicitar");
    else setShowUpgradeModal(true);
  };

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-green-500 w-10 h-10" />
      </div>
    );

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Utensils className="text-green-500" /> Planos Alimentares
          </h1>
          <p className="text-sm text-gray-500">
            Seus cardápios personalizados.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRequestClick}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-black active:scale-95"
          >
            {hasAccess ? (
              <Sparkles className="text-yellow-300" />
            ) : (
              <Lock className="text-gray-400" />
            )}
            Solicitar Dieta
          </button>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">Nenhum plano alimentar ativo.</p>
          <button
            onClick={handleRequestClick}
            className="text-green-600 font-bold mt-2 hover:underline"
          >
            Solicitar agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((p) => (
            <DietCard key={p.plan_id} plan={p} />
          ))}
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          navigate("/assinatura/mudar");
        }}
      />
    </div>
  );
}
