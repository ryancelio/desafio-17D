import React, { useEffect, useState, useRef } from "react";
import { type StepProps } from "../OnboardingWizard";
import { LuCamera, LuImagePlus, LuTrash2, LuX } from "react-icons/lu";
import { AnimatePresence, motion } from "framer-motion";

export const FotosProgressoStep: React.FC<StepProps> = ({
  onboardingData,
  updateOnboardingData,
  setStepvalid,
}) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Este passo é sempre válido, pois é opcional.
  useEffect(() => {
    setStepvalid(true);
  }, [setStepvalid]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const currentFiles = onboardingData.fotosProgresso || [];

    // Limita o total de fotos para 5 para não sobrecarregar
    const combinedFiles = [...currentFiles, ...newFiles].slice(0, 5);

    updateOnboardingData({ fotosProgresso: combinedFiles });

    // Gera previews para as novas imagens
    const newPreviews = combinedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const currentFiles = onboardingData.fotosProgresso || [];
    const updatedFiles = currentFiles.filter(
      (_, index) => index !== indexToRemove
    );
    updateOnboardingData({ fotosProgresso: updatedFiles });

    const updatedPreviews = updatedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviews(updatedPreviews);
  };

  // Limpa os Object URLs quando o componente é desmontado
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <motion.div
      initial={{ opacity: 0, x: "50%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "-50%" }}
      transition={{ type: "spring", stiffness: 50, damping: 15 }}
      className="w-full max-w-md text-center"
    >
      <LuCamera className="mx-auto h-12 w-12 text-gray-800 mb-4" />
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
        Acompanhe seu progresso
      </h1>
      <p className="mt-2 text-gray-600">
        Adicionar fotos é opcional, mas ajuda a visualizar sua evolução. Que tal
        registrar o ponto de partida?
      </p>

      <div className="mt-8 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <AnimatePresence>
            {previews.map((src, index) => (
              <motion.div
                key={src}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-xl overflow-hidden group"
              >
                <img
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500"
                    title="Remover imagem"
                  >
                    <LuX className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {(!onboardingData.fotosProgresso ||
            onboardingData.fotosProgresso.length < 5) && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-square
                         border-2 border-dashed border-gray-300 rounded-xl
                         text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <LuImagePlus className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium">Adicionar Foto</span>
            </motion.button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {onboardingData.fotosProgresso &&
          onboardingData.fotosProgresso.length > 0 && (
            <button
              onClick={() => {
                updateOnboardingData({ fotosProgresso: [] });
                setPreviews([]);
              }}
              className="flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium"
            >
              <LuTrash2 className="w-4 h-4" />
              Remover todas as fotos
            </button>
          )}
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Você pode pular este passo e adicionar fotos mais tarde.
      </p>
    </motion.div>
  );
};

export default FotosProgressoStep;
