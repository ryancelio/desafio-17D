import { useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuArrowLeft,
  LuWeight,
  LuPlus,
  LuCamera,
  LuTrash2,
  LuLoader as LuLoader2,
  LuCircleCheck as LuCheckCircle,
  LuTriangleAlert as LuAlertTriangle,
  LuRuler,
} from "react-icons/lu";
import apiClient from "../../../api/apiClient";

// --- Tipos ---
type MeasurementData = {
  peso_kg: string;
  cintura_cm?: string;
  quadril_cm?: string;
  braco_cm?: string;
  coxa_cm?: string;
  fotos: File[];
};

type ApiStatus = "idle" | "loading" | "success" | "error";

// --- Componentes ---

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps,
}) => (
  <div className="flex justify-center space-x-2 mb-8">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <motion.div
        key={index}
        className={`h-2 rounded-full ${
          index < currentStep ? "bg-indigo-500" : "bg-gray-300"
        }`}
        initial={{ width: 0 }}
        animate={{ width: "2.5rem" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const MeasurementInput: React.FC<{
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  unit: string;
}> = ({ label, value, onChange, unit }) => (
  <div className="relative">
    <label
      htmlFor={label}
      className="absolute -top-2.5 left-2 inline-block bg-gray-50 px-1 text-sm font-medium text-gray-600"
    >
      {label}
    </label>
    <div className="flex items-center">
      <input
        type="number"
        id={label}
        name={label}
        min={0}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
        placeholder="0"
      />
      <span className="ml-3 text-gray-500">{unit}</span>
    </div>
  </div>
);

// --- Página Principal ---

export default function AddMeasurementsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<ApiStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState<MeasurementData>({
    peso_kg: "",
    fotos: [],
  });

  const totalSteps = 4; // Peso, Medidas, Fotos, Revisão

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1); // Volta para a página anterior (Dashboard)
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setData((prev) => ({ ...prev, fotos: [...prev.fotos, ...newFiles] }));
    }
  };

  const removePhoto = (index: number) => {
    setData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("peso_kg", data.peso_kg);
    if (data.cintura_cm) formData.append("cintura_cm", data.cintura_cm);
    if (data.quadril_cm) formData.append("quadril_cm", data.quadril_cm);
    if (data.braco_cm) formData.append("braco_cm", data.braco_cm);
    if (data.coxa_cm) formData.append("coxa_cm", data.coxa_cm);

    data.fotos.forEach((file) => {
      formData.append("fotos[]", file);
    });

    try {
      await apiClient.addMeasurement(formData);
      setStatus("success");
      // Redireciona para o dashboard após 2 segundos
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setStatus("error");
      setErrorMessage("Falha ao salvar as medidas. Tente novamente.");
      console.error(error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Peso
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center">
              <LuWeight className="mx-auto h-12 w-12 text-indigo-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-800">
                Qual é o seu peso atual?
              </h2>
              <p className="mt-2 text-gray-500">
                Insira seu peso em quilogramas (kg).
              </p>
            </div>
            <MeasurementInput
              label="Peso"
              value={data.peso_kg}
              onChange={(val) => setData({ ...data, peso_kg: val })}
              unit="kg"
            />
            <button
              onClick={handleNext}
              disabled={!data.peso_kg || parseFloat(data.peso_kg) <= 0}
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              Continuar
            </button>
          </motion.div>
        );
      case 2: // Medidas Corporais
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <LuRuler className="mx-auto h-12 w-12 text-indigo-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-800">
                Medidas Corporais (Opcional)
              </h2>
              <p className="mt-2 text-gray-500">
                Acompanhe a evolução do seu corpo com mais detalhes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <MeasurementInput
                label="Cintura"
                value={data.cintura_cm}
                onChange={(val) => setData({ ...data, cintura_cm: val })}
                unit="cm"
              />
              <MeasurementInput
                label="Quadril"
                value={data.quadril_cm}
                onChange={(val) => setData({ ...data, quadril_cm: val })}
                unit="cm"
              />
              <MeasurementInput
                label="Braço"
                value={data.braco_cm}
                onChange={(val) => setData({ ...data, braco_cm: val })}
                unit="cm"
              />
              <MeasurementInput
                label="Coxa"
                value={data.coxa_cm}
                onChange={(val) => setData({ ...data, coxa_cm: val })}
                unit="cm"
              />
            </div>
            <button
              onClick={handleNext}
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-indigo-700 transition-all"
            >
              Continuar
            </button>
          </motion.div>
        );
      case 3: // Fotos
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <LuCamera className="mx-auto h-12 w-12 text-indigo-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-800">
                Fotos da Evolução (Opcional)
              </h2>
              <p className="mt-2 text-gray-500">
                Uma imagem vale mais que mil palavras. Adicione fotos para
                visualizar seu progresso.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {data.fotos.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview ${index}`}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white"
                  >
                    <LuTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                <LuPlus className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Adicionar</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
            <button
              onClick={handleNext}
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-indigo-700 transition-all"
            >
              Revisar e Salvar
            </button>
          </motion.div>
        );
      case 4: // Revisão
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <LuCheckCircle className="mx-auto h-12 w-12 text-indigo-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-800">
                Revisar e Salvar
              </h2>
              <p className="mt-2 text-gray-500">
                Confirme os dados antes de salvar.
              </p>
            </div>
            <div className="space-y-4 rounded-lg bg-white p-4 shadow-inner">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Peso:</span>
                <span className="font-bold text-gray-900">
                  {data.peso_kg} kg
                </span>
              </div>
              {data.cintura_cm && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Cintura:</span>
                  <span className="font-bold text-gray-900">
                    {data.cintura_cm} cm
                  </span>
                </div>
              )}
              {data.quadril_cm && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Quadril:</span>
                  <span className="font-bold text-gray-900">
                    {data.quadril_cm} cm
                  </span>
                </div>
              )}
              {data.braco_cm && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Braço:</span>
                  <span className="font-bold text-gray-900">
                    {data.braco_cm} cm
                  </span>
                </div>
              )}
              {data.coxa_cm && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Coxa:</span>
                  <span className="font-bold text-gray-900">
                    {data.coxa_cm} cm
                  </span>
                </div>
              )}
              {data.fotos.length > 0 && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Fotos:</span>
                  <span className="font-bold text-gray-900">
                    {data.fotos.length}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              className="w-full rounded-lg bg-green-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-green-700 transition-all"
            >
              Salvar Medidas
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const renderStatusOverlay = () => {
    if (status === "idle") return null;

    const messages = {
      loading: { icon: LuLoader2, text: "Salvando...", spin: true },
      success: { icon: LuCheckCircle, text: "Medidas salvas!", spin: false },
      error: { icon: LuAlertTriangle, text: errorMessage, spin: false },
    };

    const { icon: Icon, text, spin } = messages[status];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-800 bg-opacity-75"
      >
        <Icon
          className={`h-16 w-16 text-white ${spin ? "animate-spin" : ""}`}
        />
        <p className="mt-4 text-lg font-semibold text-white">{text}</p>
      </motion.div>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex items-center p-4 bg-white shadow-sm">
        <button onClick={handleBack} className="p-2 text-gray-600">
          <LuArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="mx-auto text-lg font-semibold text-gray-800">
          Adicionar Nova Medição
        </h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <StepIndicator currentStep={step} totalSteps={totalSteps} />
        <div className="relative">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          <AnimatePresence>{renderStatusOverlay()}</AnimatePresence>
        </div>
      </main>
    </div>
  );
}
