import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuChevronDown,
  LuFlame,
  LuClock,
  LuArrowLeft,
  LuChefHat,
  LuExternalLink,
} from "react-icons/lu";
import type { DietPlanResponse } from "../../../../types/api-types";
import { getUserDiets } from "../../../../api/apiClient";

export default function DietDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Tipagem forte do estado
  const [diet, setDiet] = useState<DietPlanResponse | null>(null);
  const [openMeal, setOpenMeal] = useState<number | null>(null);

  useEffect(() => {
    getUserDiets().then((diets) => {
      // TypeScript infere que 'diets' é GetUserDietsResponse
      const found = diets.find((d) => d.plan_id.toString() === id);

      setDiet(found || null);

      if (found && found.meals.length > 0) {
        setOpenMeal(found.meals[0].meal_id);
      }
    });
  }, [id]);

  if (!diet) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2"
      >
        <LuArrowLeft /> Voltar
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{diet.nome}</h1>
        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1 mt-2">
          <LuFlame /> Meta: {diet.calorias_meta} kcal
        </span>
      </div>

      {/* Lista de Refeições */}
      <div className="space-y-4">
        {diet.meals.map((meal) => {
          const isOpen = openMeal === meal.meal_id;

          // 'item' é inferido automaticamente como DietItemResponse
          const mealCals = meal.items.reduce(
            (acc, item) => acc + item.calorias,
            0
          );

          return (
            <motion.div
              key={meal.meal_id}
              initial={false}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen
                  ? "bg-white border-green-200 shadow-md ring-1 ring-green-100"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Cabeçalho da Refeição */}
              <button
                onClick={() => setOpenMeal(isOpen ? null : meal.meal_id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      isOpen
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <LuChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`font-bold ${
                        isOpen ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {meal.nome}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <LuClock className="w-3 h-3" />{" "}
                      {meal.horario ? meal.horario.slice(0, 5) : "--:--"} • ~
                      {mealCals} kcal
                    </p>
                  </div>
                </div>
                <LuChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Conteúdo (Lista de Receitas) */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden bg-gray-50/50"
                  >
                    <div className="p-4 pt-0 space-y-3">
                      <hr className="border-gray-100 mb-3" />

                      {meal.items.map((item) => (
                        <div
                          key={item.item_id}
                          className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
                        >
                          {/* Imagem da Receita (Thumb) */}
                          {item.imagem && (
                            <img
                              src={item.imagem}
                              alt={item.titulo}
                              className="w-16 h-16 rounded-lg object-cover bg-gray-200"
                            />
                          )}

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-gray-800 text-sm">
                                {item.titulo}
                              </h4>
                              <span className="text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                {item.calorias} kcal
                              </span>
                            </div>

                            <p className="text-xs text-green-600 font-medium mt-0.5">
                              Sugerido: {item.porcao}
                            </p>

                            {item.obs && (
                              <p className="text-[10px] text-gray-400 italic mt-1">
                                {item.obs}
                              </p>
                            )}

                            {/* Link para ver detalhes da receita */}
                            <Link
                              to={`/receitas/${item.recipe_id}`}
                              className="inline-flex items-center gap-1 text-[10px] text-indigo-600 font-bold mt-2 hover:underline"
                            >
                              Ver modo de preparo{" "}
                              <LuExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}

                      {meal.items.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">
                          Nenhum alimento cadastrado nesta refeição.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
