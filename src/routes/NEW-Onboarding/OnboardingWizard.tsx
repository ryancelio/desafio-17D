/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import { type OnboardingState } from "../../types/onboarding.schema";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useOnboarding } from "../../context/OnboardingContext";
import { useAuth } from "../../context/AuthContext";
import {
  LuChevronLeft,
  LuTriangleAlert,
  LuLoader as LuLoader2,
} from "react-icons/lu";

// Imports dos Steps
import { DataNascStep } from "./Steps/DataNascStep";
import { ObjetivoStep } from "./Steps/ObjetivoStep";
import { NivelAtvdStep } from "./Steps/NivelAtvdStep";
import { GeneroStep } from "./Steps/GeneroStep";
import MedidasStep from "./Steps/MedidasStep";
import PesoAlvoStep from "./Steps/PesoAlvoStep";
import NomeStep from "./Steps/NomeStep";
import EmailStep from "./Steps/EmailStep";
import { SenhaStep } from "./Steps/SenhaStep";
import TodasMedidasStep from "./Steps/TodasMedidasStep";
import DiasTreinoStep from "./Steps/DiasTreinoStep";
import FotosProgressoStep from "./Steps/FotosProgressoStep";
import PlanosStep from "./Steps/PlanosStep";
import GerandoPlanoStep from "./Steps/GerandoPlanoStep";
import DashboardPreviewStep from "./Steps/DashboardPreviewStep";
import { Checkout } from "./Steps/Checkout";

// Imports Firebase
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import TelefoneStep from "./Steps/TelefoneStep";
import LocalTreinoStep from "./Steps/LocalTreinoStep";
import SocialProofStep from "./Steps/SocialProofStep";
import FeaturesStep from "./Steps/FeaturesStep";
import FeaturesDetailedStep from "./Steps/FeaturesDetailedStep";
import PreferenciasStep from "./Steps/PreferenciaStep";
import { toast } from "sonner";
import { completeOnboarding, uploadProgressPhotos } from "../../api/apiClient";

export interface StepProps {
  onboardingData: OnboardingState;
  updateOnboardingData: (data: Partial<OnboardingState>) => void;
  setStepvalid: (isvalid: boolean) => void;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  onboardLoading: boolean;
  setOnboardLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onRegisterSubmit?: (submitFn: () => Promise<void> | void) => void;
}

const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const buttonControls = useAnimation();

  const { onboardingData, updateOnboardingData, isStepValid, setStepValid } =
    useOnboarding();
  const { firebaseUser, userProfile, refetchProfile } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [onboardLoading, setOnboardLoading] = useState(false);

  // --- CORREÇÃO 1: CONGELAR OS STEPS ---
  // Usamos useRef para definir a lista de passos APENAS UMA VEZ na montagem do componente.
  // Isso impede que passos "sumam" quando o firebaseUser muda, mantendo o índice estável.

  // Captura o estado inicial de autenticação e assinatura
  const startedAuthenticated = useRef(!!firebaseUser);
  const startedActive = useRef(userProfile?.subscription?.has_access ?? false);
  const viewContentTracked = useRef(false);

  useEffect(() => {
    if (!viewContentTracked.current && typeof window.fbq !== "undefined") {
      viewContentTracked.current = true;

      window.fbq("track", "ViewContent", {
        content_name: "Onboarding Start", // Nome legível para o Gerenciador de Anúncios
        content_category: "Funnel", // Categoria para organização
        content_type: "product", // Padrão do FB
      });
    }
  }, []);

  const stepComponentsRef = useRef<React.FC<StepProps>[]>([]);

  if (stepComponentsRef.current.length === 0) {
    // Array base de steps
    const steps = [
      ObjetivoStep,
      NivelAtvdStep,
      GeneroStep,
      DataNascStep,
      MedidasStep,
      PesoAlvoStep,
      TodasMedidasStep,
      LocalTreinoStep,
      DiasTreinoStep,
      FotosProgressoStep,
      PreferenciasStep,
    ];

    // Adiciona Auth se não começou logado
    if (!startedAuthenticated.current) {
      steps.push(NomeStep, EmailStep, TelefoneStep, SenhaStep);
    }

    // Steps de transição
    steps.push(
      GerandoPlanoStep,
      DashboardPreviewStep,
      SocialProofStep,
      FeaturesStep,
      FeaturesDetailedStep
    );

    // Adiciona Pagamento se não começou ativo
    if (!startedActive.current) {
      steps.push(PlanosStep, Checkout);
    }

    // stepComponentsRef.current = [PlanosStep, Checkout];
    // stepComponentsRef.current = [SocialProofStep];
    stepComponentsRef.current = steps;
  }

  const stepComponents = stepComponentsRef.current;
  const LAST_STEP_INDEX = stepComponents.length - 1;
  const CurrentStepComponent = stepComponents[step];

  // --- CORREÇÃO 4: GUARDIÃO DE ÍNDICE ---
  useEffect(() => {
    if (step > LAST_STEP_INDEX) {
      setStep(LAST_STEP_INDEX);
    }
  }, [step, LAST_STEP_INDEX]);

  const syncWithBackend = async () => {
    let photoUrls: string[] = [];

    if (
      onboardingData.fotosProgresso &&
      onboardingData.fotosProgresso.length > 0
    ) {
      try {
        // Usa o novo endpoint PHP
        photoUrls = await uploadProgressPhotos(onboardingData.fotosProgresso);
      } catch (uploadError) {
        toast.error("Falha ao enviar fotos");
        console.error("Erro ao enviar fotos:", uploadError);
        // Opcional: throw new Error("Falha ao enviar fotos"); se quiser bloquear o processo
      }
    }

    const payload = {
      personal: {
        ...onboardingData.personal,
        email: onboardingData.personal.email || firebaseUser?.email,
        nome: onboardingData.personal.nome || firebaseUser?.displayName,
      },
      measurements: onboardingData.measurements || { peso_kg: 0 },
      preferences: onboardingData.preferences || [],
      photos: photoUrls,
    };

    const response = await completeOnboarding(payload);

    console.log(payload);
    console.log(response);

    if (!response.success) {
      throw new Error(response.message || "Falha ao salvar dados no sistema.");
    }
  };

  // --- LÓGICA DE CRIAÇÃO DE CONTA ---
  // CORREÇÃO 2: Retorna boolean e não muda o step internamente
  const handleCreateAccount = async (): Promise<boolean> => {
    setOnboardLoading(true);
    setError(null);

    try {
      const email = onboardingData.personal.email;
      const password = onboardingData.password;
      const nome = onboardingData.personal.nome;

      if (!email || !password) throw new Error("Email e senha obrigatórios.");

      // 1. Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (nome) await updateProfile(user, { displayName: nome });

      if (typeof window.fbq !== "undefined") {
        window.fbq("track", "CompleteRegistration", {
          content_name: "Onboarding Signup", // Nome para identificar no gerenciador
          status: "success",
        });
      }

      // 3. MySQL Sync
      await syncWithBackend();
      await refetchProfile();

      return true; // Sucesso
    } catch (err: any) {
      console.error(err);
      let msg = "Erro ao criar conta.";
      if (err.code === "auth/email-already-in-use")
        msg = "Email já cadastrado.";
      else if (err.code === "auth/weak-password") msg = "Senha muito fraca.";
      else msg = err.message || msg;

      setError(msg);
      buttonControls.start({
        x: [0, -8, 8, -8, 0],
        transition: { duration: 0.4 },
      });
      return false; // Falha
    } finally {
      setOnboardLoading(false);
    }
  };

  // --- LÓGICA DE FINALIZAÇÃO ---
  const submitOnboardingUpdate = async () => {
    if (!firebaseUser) return;
    setOnboardLoading(true);
    setError(null);

    try {
      await syncWithBackend();
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Erro no submitOnboarding:", err);
      setError(err.message || "Erro de conexão.");
    } finally {
      setOnboardLoading(false);
    }
  };

  // --- NAVEGAÇÃO CENTRALIZADA ---
  const handleNav = async (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (step <= 0) return;
      setStep(step - 1);
      return;
    }

    // Validação do Step atual
    if (!isStepValid) {
      setError("Preencha os campos obrigatórios.");
      buttonControls.start({
        x: [0, -8, 8, -8, 0],
        transition: { duration: 0.4 },
      });
      return;
    }
    setError(null);

    // CASO 1: Criar Conta
    if (CurrentStepComponent === SenhaStep) {
      const success = await handleCreateAccount();
      if (success) {
        // Remove passos de auth já concluídos para evitar retorno
        const authSteps = [NomeStep, EmailStep, TelefoneStep, SenhaStep];
        const newSteps = stepComponentsRef.current.filter(
          (comp) => !authSteps.includes(comp as any)
        );
        stepComponentsRef.current = newSteps;

        // Ajusta o índice para o próximo passo (GerandoPlanoStep) no novo array
        const nextIndex = newSteps.indexOf(GerandoPlanoStep);
        if (nextIndex !== -1) {
          setStep(nextIndex);
        } else {
          setStep((s) => s + 1);
        }
      }
      return;
    }

    // CASO NOVO: Sincronizar dados para usuário existente ANTES do pagamento
    // Se o usuário começou o fluxo já logado, sincroniza os dados coletados antes de ir para os planos.
    if (
      CurrentStepComponent === SocialProofStep &&
      startedAuthenticated.current
    ) {
      setOnboardLoading(true);
      setError(null);
      try {
        await syncWithBackend();
        await refetchProfile(); // Atualiza o contexto global com os novos dados
        setStep((s) => s + 1); // Avança para o próximo passo (PlanosStep)
      } catch (err: any) {
        console.error("Erro ao sincronizar dados:", err);
        setError(err.message || "Erro ao salvar suas informações.");
        buttonControls.start({
          x: [0, -8, 8, -8, 0],
          transition: { duration: 0.4 },
        });
      } finally {
        setOnboardLoading(false);
      }
      return; // Importante para não continuar a execução
    }

    // CASO 2: Finalizar (Se for o último passo e não precisa pagar)
    const needsPayment = !startedActive.current; // Baseado no estado inicial
    const isLastStep = step === LAST_STEP_INDEX;

    // Se é o último passo e o usuário já tinha acesso desde o início ou o fluxo não inclui pagamento
    if (isLastStep && !needsPayment) {
      await submitOnboardingUpdate();
      return;
    }

    // Se é o último passo (Checkout) e precisa pagar, o próprio componente Checkout lida com o submit.
    // Mas se por algum motivo cair aqui:
    if (isLastStep && needsPayment) {
      // Deixa o componente Checkout lidar ou exibe erro
      return;
    }

    // Navegação Padrão
    if (step < LAST_STEP_INDEX) {
      setStep(step + 1);
    }
  };

  const buttonContent = (): React.ReactNode => {
    if (onboardLoading)
      return (
        <div className="flex items-center justify-center gap-2">
          <LuLoader2 className="animate-spin" /> Processando...
        </div>
      );

    if (CurrentStepComponent === SenhaStep) return "Criar Conta";

    // Lógica visual do botão final
    if (step === LAST_STEP_INDEX) {
      // Se a lista de steps inclui pagamento (Checkout), o botão do wizard deve sumir ou mudar
      if (stepComponentsRef.current.includes(Checkout)) {
        if (onboardingData.selectedPlan?.planType === "monthly")
          return "Ir para Pagamento Seguro";
        return "Finalizar Pagamento";
      }
      return "Ir para Inicio";
    }

    return "Continuar";
  };

  return (
    // CORREÇÃO:
    // 1. h-[100dvh]: Garante altura correta em mobile com barra de navegação
    // 2. w-full max-w-[100vw]: Impede que o container exceda a largura da tela
    // 3. overflow-x-hidden: Corta qualquer elemento filho que tente vazar lateralmente
    <div className="h-[100dvh] w-full max-w-[100vw] flex flex-col bg-white overflow-x-hidden fixed inset-0">
      {/* Header */}
      <div className="relative w-full px-4 py-4 text-2xl flex gap-4 items-center z-20 bg-white/80 backdrop-blur-sm shrink-0">
        <button
          onClick={() => handleNav("prev")}
          className="w-8 h-8 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity hover:bg-gray-100 rounded-full"
          disabled={step <= 0 || onboardLoading}
        >
          <LuChevronLeft />
        </button>
        <div className="grow w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-2 bg-gray-900 rounded-full"
            role="progressbar"
            aria-valuenow={((step + 1) / stepComponents.length) * 100}
            aria-valuemin={0}
            aria-valuemax={100}
            initial={false}
            animate={{
              width: `${((step + 1) / stepComponents.length) * 100}%`,
            }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
          />
        </div>
      </div>

      {/* Main Content */}
      {/* CORREÇÃO: flex-col e w-full garantem centralização. padding-bottom seguro para o footer */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden px-5 pt-4 pb-32 flex flex-col items-center">
        <div className="w-full max-w-md mx-auto">
          {CurrentStepComponent ? (
            <CurrentStepComponent
              onboardingData={onboardingData}
              updateOnboardingData={updateOnboardingData}
              setStepvalid={setStepValid}
              setStep={setStep}
              setOnboardLoading={setOnboardLoading}
              onboardLoading={onboardLoading}
            />
          ) : (
            <div className="flex flex-col items-center mt-10">
              <LuLoader2 className="w-10 h-10 animate-spin text-gray-400" />
              <p className="text-gray-500 mt-2">Carregando etapa...</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-20">
        <div className="pointer-events-auto max-w-md mx-auto w-full">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium shadow-sm"
              >
                <LuTriangleAlert className="w-4 h-4 shrink-0" />
                <span className="truncate">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!(CurrentStepComponent === Checkout && !startedActive.current) && (
            <motion.button
              className={`w-full bg-gray-900 text-white font-bold text-lg rounded-xl py-4 shadow-lg shadow-gray-200 transition-all ${
                onboardLoading
                  ? "cursor-not-allowed bg-gray-600"
                  : "hover:bg-black active:scale-[0.98]"
              }`}
              onClick={() => handleNav("next")}
              disabled={onboardLoading}
              animate={buttonControls}
            >
              {buttonContent()}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
