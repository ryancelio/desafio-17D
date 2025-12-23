import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router"; // Use useSearchParams
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import {
  ArrowLeft,
  Ticket,
  Loader2,
  ShieldCheck,
  Check,
  Dumbbell,
  Utensils,
  Copy,
  X,
  QrCode,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../api/apiClient";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import type { IPaymentBrickCustomization } from "@mercadopago/sdk-react/esm/bricks/payment/type";

// Defina sua chave pública aqui
const PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY_TEST || "";

interface CreditPackage {
  package_id: number;
  name: string;
  credits: number;
  price: number;
  best_value: boolean;
  type: "workout" | "diet";
}

interface PixData {
  qr_code: string;
  qr_code_base64: string;
}

export default function BuyCreditsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook para ler a URL
  const { firebaseUser } = useAuth();

  // 1. Determina o tipo via URL (ex: ?type=diet). Default: workout
  const typeParam = searchParams.get("type");
  const purchaseType: "workout" | "diet" =
    typeParam === "diet" ? "diet" : "workout";

  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<CreditPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Estados para PIX
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [, setPaymentId] = useState<number | null>(null);
  const pollingRef = useRef<number | null>(null); // Corrigido tipagem para NodeJS.Timeout ou number

  // Inicializa MP apenas uma vez
  useEffect(() => {
    initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Carrega Pacotes (Dependência: purchaseType)
  useEffect(() => {
    const loadPackages = async () => {
      setLoadingPackages(true);
      setSelectedPkg(null); // Reseta seleção se mudar de tipo
      try {
        const data = await apiClient.getCreditPackages(purchaseType);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedData = data.map((pkg: any) => ({
          ...pkg,
          price: Number(pkg.price),
          credits: Number(pkg.credits),
        }));
        setPackages(formattedData);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar pacotes.");
      } finally {
        setLoadingPackages(false);
      }
    };
    loadPackages();
  }, [purchaseType]); // Recarrega se a URL mudar

  // Função de Polling
  const startPolling = (id: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = window.setInterval(async () => {
      try {
        const res = await apiClient.checkPaymentStatus(id);
        if (res.status === "approved") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setShowPixModal(false);
          toast.success("Pagamento confirmado! Créditos liberados.");
          const dest = purchaseType === "diet" ? "/dietas" : "/treinos";
          setTimeout(() => navigate(dest), 1500);
        }
      } catch (error) {
        console.error("Erro no polling", error);
      }
    }, 5000);
  };

  // Callback do Brick
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPaymentBrickSubmit = async ({ formData }: any) => {
    if (!selectedPkg) return;
    setLoading(true);

    try {
      const payload = {
        ...formData,
        package_id: selectedPkg.package_id,
        credits_amount: selectedPkg.credits,
      };

      const result = await apiClient.purchaseCredits(payload);

      if (result.status === "approved") {
        toast.success(
          `Créditos de ${
            purchaseType === "diet" ? "Dieta" : "Treino"
          } adicionados!`
        );
        const dest = purchaseType === "diet" ? "/dietas" : "/treinos";
        setTimeout(() => navigate(dest), 1500);
      } else if (result.status === "pending" && result.pix_data) {
        setPixData(result.pix_data);
        setPaymentId(result.id);
        setShowPixModal(true);
        startPolling(result.id);
      } else {
        toast.error(
          "Pagamento não concluído: " + (result.message || "Verifique os dados")
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  const paymentInitialization = {
    amount: selectedPkg ? selectedPkg.price : 0,
    payer: { email: firebaseUser?.email || "email@teste.com" },
  };

  const paymentCustomization: IPaymentBrickCustomization = {
    paymentMethods: {
      creditCard: "all",
      bankTransfer: "all",
      maxInstallments: 3,
    },
    visual: {
      style: { theme: "default" },
      hideFormTitle: false,
    },
  };

  // Configuração Visual baseada no purchaseType
  const theme =
    purchaseType === "diet"
      ? {
          label: "Dieta",
          icon: Utensils,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-600",
          checkBg: "bg-emerald-600",
          badgeBg: "bg-emerald-500",
          hoverBorder: "hover:border-emerald-300",
        }
      : {
          label: "Treino",
          icon: Dumbbell,
          color: "text-indigo-600",
          bgColor: "bg-indigo-50",
          borderColor: "border-indigo-600",
          checkBg: "bg-indigo-600",
          badgeBg: "bg-indigo-500",
          hoverBorder: "hover:border-indigo-300",
        };

  const copyToClipboard = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      toast.success("Código PIX copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32 relative">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Adicionar Créditos
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.bgColor} ${theme.color}`}
              >
                {theme.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Compre fichas avulsas de {theme.label.toLowerCase()} sem assinar
              um plano mensal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Lista de Pacotes */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <theme.icon className={`w-5 h-5 ${theme.color}`} /> Escolha seu
              pacote
            </h2>

            {loadingPackages ? (
              <div className="py-10 text-center text-gray-400 flex flex-col items-center gap-2">
                <Loader2 className="animate-spin w-6 h-6" /> Carregando
                opções...
              </div>
            ) : packages.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                Nenhum pacote disponível.
              </div>
            ) : (
              <div className="space-y-3">
                {packages.map((pkg) => {
                  const isSelected = selectedPkg?.package_id === pkg.package_id;
                  return (
                    <motion.div
                      key={pkg.package_id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? `${theme.borderColor} ${theme.bgColor} shadow-md`
                          : `border-gray-200 bg-white ${theme.hoverBorder} hover:shadow-sm`
                      }`}
                    >
                      {pkg.best_value && (
                        <span
                          className={`absolute -top-3 right-4 ${theme.badgeBg} text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm`}
                        >
                          MELHOR VALOR
                        </span>
                      )}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? `${theme.borderColor} ${theme.checkBg}`
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h3
                              className={`font-bold ${
                                isSelected ? "text-gray-900" : "text-gray-700"
                              }`}
                            >
                              {pkg.name}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">
                              {pkg.credits}{" "}
                              {pkg.credits > 1 ? "Solicitações" : "Solicitação"}
                            </p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          R$ {pkg.price.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Aviso de Segurança */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 mt-6 shadow-sm">
              <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                <ShieldCheck className="w-5 h-5" /> Pagamento Seguro
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Seus dados são criptografados. Pagamentos via Cartão liberam na
                hora. PIX pode levar alguns segundos.
              </p>
            </div>
          </div>

          {/* Área de Pagamento (Brick) */}
          <div className="relative">
            {!selectedPkg ? (
              <div className="bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 p-10 flex flex-col items-center justify-center text-center h-[400px]">
                <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Ticket className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-500 font-medium">
                  Aguardando seleção
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Selecione um pacote ao lado para abrir o pagamento.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 overflow-hidden relative"
              >
                {loading && (
                  <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center">
                    <Loader2
                      className={`w-10 h-10 animate-spin ${theme.color} mb-2`}
                    />
                    <p className={`font-medium animate-pulse ${theme.color}`}>
                      Processando pagamento...
                    </p>
                  </div>
                )}

                <div className="mb-6 border-b border-gray-100 pb-4">
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Resumo do Pedido
                  </p>
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <span className="block text-lg font-bold text-gray-900">
                        {selectedPkg.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Créditos de {theme.label}
                      </span>
                    </div>
                    <span className={`text-xl font-bold ${theme.color}`}>
                      R$ {selectedPkg.price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>

                <div key={selectedPkg.package_id}>
                  <Payment
                    initialization={paymentInitialization}
                    customization={paymentCustomization}
                    onSubmit={onPaymentBrickSubmit}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DO PIX */}
      <AnimatePresence>
        {showPixModal && pixData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl"
            >
              <button
                onClick={() => setShowPixModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="text-center mb-6">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Pague com PIX
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Escaneie o QR Code ou copie o código abaixo.
                </p>
              </div>

              <div className="flex justify-center mb-6">
                <img
                  src={`data:image/png;base64,${pixData.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="w-48 h-48 border-2 border-gray-100 rounded-xl"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between gap-3 border border-gray-200">
                <p className="text-xs text-gray-500 font-mono truncate flex-1">
                  {pixData.qr_code}
                </p>
                <button
                  onClick={copyToClipboard}
                  className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3 h-3" /> Copiar
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Aguardando
                  confirmação...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
