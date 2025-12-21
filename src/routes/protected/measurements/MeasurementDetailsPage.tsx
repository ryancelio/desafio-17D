import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import apiClient, {
  isApiError,
  // type MeasurementDetailsResponse,
} from "../../../api/apiClient";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuArrowLeft,
  LuChevronLeft,
  LuChevronRight,
  LuLoaderCircle as LuLoader2,
  LuTriangleAlert,
  LuCalendar,
  LuWeight,
  LuRuler,
  LuImage,
} from "react-icons/lu";
import FullscreenImageViewer from "./components/FullscreenImageViewer";
import type { MeasurementDetailsResponse } from "../../../types/api-types";
import { SecureImage } from "../components/SecureImage";

const InfoPill: React.FC<{ label: string; value: string | number | null }> = ({
  label,
  value,
}) => {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-indigo-50 p-3 text-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-lg font-bold text-gray-800">{value}</span>
    </div>
  );
};

export default function MeasurementDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<MeasurementDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!id) {
      navigate("/dashboard");
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getMeasurementDetails(
          parseInt(id, 10)
        );
        setData(response);
      } catch (err) {
        if (isApiError(err)) {
          setError(err.response?.data.error || "Erro ao buscar medição.");
        } else {
          setError("Falha ao carregar os detalhes da medição.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, navigate]);

  const handleNavigate = (targetId: number | null) => {
    if (targetId) {
      navigate(`/measurements/${targetId}`);
    }
  };

  const formattedDate = data?.details.data_medicao
    ? new Date(data.details.data_medicao).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center p-10">
          <LuLoader2 className="h-12 w-12 animate-spin text-indigo-500" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg bg-red-100 p-4 text-red-700">
          <LuTriangleAlert className="h-8 w-8" />
          <h3 className="font-semibold">Erro ao Carregar</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="text-center text-gray-500 p-10">
          Nenhum dado encontrado para esta medição.
        </div>
      );
    }

    const { details, photos } = data;
    const hasBodyMeasurements =
      details.cintura_cm ||
      details.quadril_cm ||
      details.braco_cm ||
      details.coxa_cm;

    return (
      <motion.div
        key={id} // Anima a troca de conteúdo quando o ID muda
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Card de Peso */}
        <div className="rounded-2xl bg-white p-6 shadow-md text-center">
          <LuWeight className="mx-auto h-8 w-8 text-indigo-500 mb-2" />
          <h3 className="text-lg font-semibold text-gray-600">
            Peso Registrado
          </h3>
          <p className="text-4xl font-bold text-gray-900">
            {details.peso_kg} <span className="text-2xl">kg</span>
          </p>
        </div>

        {/* Card de Medidas Corporais */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <LuRuler className="h-6 w-6 text-indigo-500" />
            <h3 className="text-xl font-semibold text-gray-800">
              Medidas Corporais (cm)
            </h3>
          </div>
          {hasBodyMeasurements ? (
            <div className="grid grid-cols-2 gap-4">
              <InfoPill label="Cintura" value={details.cintura_cm || "N/A"} />
              <InfoPill label="Quadril" value={details.quadril_cm || "N/A"} />
              <InfoPill label="Braço" value={details.braco_cm || "N/A"} />
              <InfoPill label="Coxa" value={details.coxa_cm || "N/A"} />
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <p>Nenhuma medida corporal foi adicionada para este registro.</p>
            </div>
          )}
        </div>

        {/* Card de Fotos */}
        {photos.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <LuImage className="h-6 w-6 text-indigo-500" />
              <h3 className="text-xl font-semibold text-gray-800">Fotos</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {photos.map((url, index) => (
                <motion.div whileHover={{ scale: 1.05 }} key={index}>
                  <SecureImage
                    src={`/api/${url}`}
                    alt={`Foto da medição ${index + 1}`}
                    className="h-40 w-full rounded-lg object-cover shadow-sm cursor-pointer"
                    onClick={() => setFullscreenImageIndex(index)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col bg-gray-50 h-full w-full overflow-y-auto">
      {/* Cabeçalho e Navegação (Fixos) */}
      <div className="shrink-0 sticky top-0 z-20 bg-gray-50">
        <header className="flex items-center justify-between bg-white p-4 shadow-sm">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 text-gray-600"
          >
            <LuArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            Detalhes da Medição
          </h1>
          <div className="w-8"></div> {/* Espaçador */}
        </header>

        <nav className="flex items-center justify-between bg-gray-100 p-3 shadow-inner">
          <button
            onClick={() => handleNavigate(data?.navigation.previous_id ?? null)}
            disabled={!data?.navigation.previous_id || isLoading}
            className="p-2 rounded-full text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            <LuChevronLeft className="h-6 w-6" />
          </button>

          <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 font-semibold text-gray-700"
              >
                <LuCalendar className="h-4 w-4" />
                <span>{isLoading ? "Carregando..." : formattedDate}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={() => handleNavigate(data?.navigation.next_id ?? null)}
            disabled={!data?.navigation.next_id || isLoading}
            className="p-2 rounded-full text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            <LuChevronRight className="h-6 w-6" />
          </button>
        </nav>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 md:p-6">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </main>

      {/* --- Visualizador de Imagem em Tela Cheia --- */}
      <AnimatePresence>
        {fullscreenImageIndex !== null && (
          <FullscreenImageViewer
            photos={data?.photos || []}
            startIndex={fullscreenImageIndex}
            onClose={() => setFullscreenImageIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
