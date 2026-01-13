import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Clock,
  Flame,
  ChefHat,
  Utensils,
  List,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Recipe } from "../../../types/models";
import { getRecipes } from "../../../api/apiClient";

// Componente para exibir os Macros Nutricionais
const MacroBadge = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div
    className={`flex flex-col items-center p-3 rounded-xl border ${color} bg-white shadow-sm min-w-20`}
  >
    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
      {label}
    </span>
    <span className="text-lg font-extrabold text-gray-800">{value}g</span>
  </div>
);

export default function RecipeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Busca os dados da receita pelo ID
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getRecipes({ id: Number(id) });
        setRecipe(data[0]);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar a receita.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <Utensils className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Ops! Receita não encontrada
        </h2>
        <p className="text-gray-500 mb-6">
          {error || "A receita que você procura não existe ou foi removida."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-12">
      {/* Imagem de Capa (Hero) */}
      <div className="relative h-72 md:h-96 w-full bg-gray-200">
        <img
          src={recipe.url_imagem || "/placeholder-recipe.jpg"}
          alt={recipe.titulo}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

        {/* Botão Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Título Sobreposto (Mobile) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold leading-tight mb-2"
          >
            {recipe.titulo}
          </motion.h1>

          <div className="flex items-center gap-4 text-sm font-medium text-white/90">
            {recipe.tempo_preparo_min && (
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                <Clock className="w-4 h-4" /> {recipe.tempo_preparo_min} min
              </span>
            )}
            <span className="flex items-center gap-1.5 bg-emerald-500/80 px-3 py-1 rounded-full backdrop-blur-sm">
              <Flame className="w-4 h-4" /> {recipe.calorias_kcal} kcal
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-6 relative z-10">
        {/* Cards de Macros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 justify-center mb-8"
        >
          <MacroBadge
            label="Prot"
            value={recipe.macros?.proteinas_g || 0}
            color="border-blue-100 text-blue-600"
          />
          <MacroBadge
            label="Carb"
            value={recipe.macros?.carboidratos_g || 0}
            color="border-amber-100 text-amber-600"
          />
          <MacroBadge
            label="Gord"
            value={recipe.macros?.gorduras_g || 0}
            color="border-rose-100 text-rose-600"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Coluna 1: Ingredientes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
              <List className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900">Ingredientes</h2>
            </div>

            <ul className="space-y-3">
              {recipe.ingredientes?.map((ing, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-gray-700 leading-relaxed">{ing}</span>
                </li>
              ))}
              {(!recipe.ingredientes || recipe.ingredientes.length === 0) && (
                <p className="text-gray-400 italic text-sm">
                  Nenhum ingrediente listado.
                </p>
              )}
            </ul>
          </motion.div>

          {/* Coluna 2: Modo de Preparo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
              <ChefHat className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Modo de Preparo
              </h2>
            </div>

            <div className="space-y-6">
              {recipe.preparo?.map((step, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      {index + 1}
                    </div>
                    {index !== (recipe.preparo?.length || 0) - 1 && (
                      <div className="w-0.5 h-full bg-gray-100 my-2 group-hover:bg-emerald-100 transition-colors" />
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed pt-1 pb-4">
                    {step}
                  </p>
                </div>
              ))}
              {(!recipe.preparo || recipe.preparo.length === 0) && (
                <p className="text-gray-400 italic text-sm">
                  Modo de preparo não informado.
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tags e Extras */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium uppercase tracking-wide"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
