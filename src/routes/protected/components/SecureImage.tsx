import { useState, useEffect } from "react";
import { LuImageOff, LuLoader } from "react-icons/lu";
import { getUserPhotos } from "../../../api/apiClient";

interface SecureImageProps {
  src: string; // O caminho que vem do banco (ex: /uploads/...)
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const SecureImage: React.FC<SecureImageProps> = ({
  src,
  alt,
  className,
  onClick,
}) => {
  const [imageObjectUrl, setImageObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      try {
        setLoading(true);
        // Chama o endpoint PHP passando o caminho
        // Importante: responseType 'blob' para imagens
        const response = await getUserPhotos(src);

        if (isMounted) {
          // Cria uma URL temporária local para o blob baixado
          const url = URL.createObjectURL(response as unknown as Blob);
          setImageObjectUrl(url);
        }
      } catch (err) {
        console.error("Erro ao carregar imagem segura:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (src) fetchImage();

    // Limpeza de memória
    return () => {
      isMounted = false;
      if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
    };
  }, [src]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <LuLoader className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !imageObjectUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
      >
        <LuImageOff />
      </div>
    );
  }

  return (
    <img
      src={imageObjectUrl}
      alt={alt}
      className={className}
      onClick={onClick}
    />
  );
};
