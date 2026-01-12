import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  LuDumbbell,
  LuUtensils,
  LuChartLine as LuLineChart,
  LuChevronRight,
  LuCircleCheck as LuCheckCircle,
  LuPlay,
  LuSmartphone,
  LuClipboardList,
  LuChevronDown,
  LuBookOpen,
  LuRuler,
  LuDroplets,
  LuFlame,
  LuTrophy,
  LuBrainCircuit,
  LuWifiOff,
  LuStethoscope,
  LuFileText,
  LuDatabase,
  LuTarget,
  LuChartLine,
} from "react-icons/lu";
import LandingLayout from "./LandingLayout";

// --- Subcomponentes (Mantidos iguais, apenas garantindo responsividade nos cards) ---

const RotatingText: React.FC<{ words: string[] }> = ({ words }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span className="inline-flex h-[1.1em] w-auto overflow-hidden items-center relative translate-y-[0.05em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0, rotateX: -90 }}
          animate={{ y: "0%", opacity: 1, rotateX: 0 }}
          exit={{ y: "-100%", opacity: 0, rotateX: 90 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="text-transparent bg-clip-text bg-linear-to-r from-pasPink to-pasGreen block leading-none whitespace-nowrap"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}> = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay, type: "spring", stiffness: 50 }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="group relative bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 
               hover:shadow-[0_20px_50px_-12px_rgba(255,105,180,0.15)] 
               hover:border-pasPink/30 transition-all duration-300 h-full overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-pasPink/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-150 group-hover:from-pasPink/20" />
    <div className="relative mb-4">
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 group-hover:bg-pasPink group-hover:text-white group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-pasPink/30 transition-all duration-300">
        <Icon className="h-7 w-7 transition-transform duration-300" />
      </div>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pasPink transition-colors duration-300">
      {title}
    </h3>
    <p className="text-gray-500 leading-relaxed text-sm font-medium group-hover:text-gray-600">
      {description}
    </p>
  </motion.div>
);

const SmartBenefitCard: React.FC<{
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  delay: number;
}> = ({ icon: Icon, title, subtitle, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, type: "spring", stiffness: 50 }}
    whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.8)" }}
    className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-default"
  >
    <div
      className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${color}`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
      <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
    </div>
  </motion.div>
);

const MobileAppPreview = () => (
  <motion.div
    id="mobile-app-preview"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.4 }}
    className="lg:hidden w-full max-w-sm mx-auto mt-16 mb-20 relative z-20 scroll-mt-24"
  >
    <div className="absolute -inset-4 bg-white/40 backdrop-blur-xl rounded-[2.5rem] -z-10 border border-white/20 shadow-xl"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-pasPink/20 blur-[60px] rounded-full -z-20" />

    <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
      {/* Mockup Content (Mantido igual) */}
      <div className="bg-gray-50/80 px-5 py-4 border-b border-gray-100 flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="Avatar"
              className="w-full h-full object-cover opacity-80"
            />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Dashboard
            </p>
            <p className="text-sm font-bold text-gray-800">Olá, Vencedor</p>
          </div>
        </div>
        <div className="bg-white p-2 rounded-full shadow-sm text-pasPink">
          <LuTrophy className="w-4 h-4" />
        </div>
      </div>
      <div className="p-5 space-y-4 bg-white">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <LuFlame className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-bold text-gray-500">
                Calorias (Hoje)
              </span>
              <span className="text-xs font-bold text-orange-500">
                1.250 / 2.000
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 w-[60%] rounded-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-linear-to-br from-gray-900 to-gray-800 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <LuDumbbell className="w-16 h-16 absolute -right-4 -bottom-4 text-white/10 rotate-[-20deg]" />
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
              Treino A
            </p>
            <p className="font-bold text-lg leading-tight">
              Peito &<br />
              Tríceps
            </p>
            <div className="mt-3 inline-flex items-center gap-1 text-[10px] bg-white/20 px-2 py-1 rounded-full">
              <LuPlay className="w-3 h-3" /> Iniciar
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 flex items-center gap-3">
              <LuDroplets className="text-blue-500 w-5 h-5" />
              <div>
                <p className="text-[10px] text-gray-500 font-bold">Água</p>
                <p className="text-sm font-bold text-gray-900">1.5L</p>
              </div>
            </div>
            <div className="bg-pasGreen/20 p-3 rounded-2xl border border-pasGreen/30 flex items-center gap-3">
              <LuRuler className="text-gray-800 w-5 h-5" />
              <div>
                <p className="text-[10px] text-gray-600 font-bold">Peso</p>
                <p className="text-sm font-bold text-gray-900">-2.1kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Página Principal ---

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  const yBackground1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const yBackground2 = useTransform(scrollY, [0, 1000], [0, -200]);
  const buttonOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  const buttonPointerEvents = useTransform(scrollY, (y) =>
    y > 100 ? "none" : "auto"
  );

  const handleScrollDown = () => {
    const isMobile = window.innerWidth < 1024;
    const targetId = isMobile ? "mobile-app-preview" : "filosofia";
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <LandingLayout>
      {/* HERO SECTION ... (Mantido) */}
      <section className="relative min-h-dvh flex flex-col justify-center px-6 overflow-hidden pt-24 pb-24 lg:pt-20 lg:pb-20">
        <div className="absolute inset-0 -z-30 overflow-hidden bg-gray-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),rgba(249,250,251,1))]"></div>
          <motion.div
            style={{ y: yBackground1 }}
            className="absolute top-0 right-0 -mt-40 -mr-40 w-160 h-160 bg-pasPink/20 rounded-full blur-[100px] opacity-70 mix-blend-multiply"
          />
          <motion.div
            style={{ y: yBackground2 }}
            className="absolute bottom-0 left-0 -mb-40 -ml-40 w-140 h-140 bg-pasGreen/20 rounded-full blur-[100px] opacity-70 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-8 w-full grow justify-center z-10">
          <div className="lg:w-5/12 text-center lg:text-left space-y-8 relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md text-gray-900 text-sm font-bold uppercase tracking-wide mb-6 border border-gray-200 shadow-sm hover:scale-105 transition-transform cursor-default">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pasPink opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-pasPink"></span>
                </span>
                Metodologia Profissional
              </span>

              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight flex flex-col md:block items-center md:items-start">
                Sua evolução guiada por Especialistas em{" "}
                <RotatingText words={["Performance", "Estética", "Saúde"]} />
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                Receba <strong>fichas de treino</strong> e{" "}
                <strong>planos alimentares</strong> criados por profissionais.
                Comece com uma <strong>avaliação corporal detalhada</strong> e
                descubra o caminho exato para o corpo que você deseja.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <button
                onClick={() => navigate("/onboard")}
                className="w-full sm:w-auto px-8 py-4 bg-pasPink hover:bg-pasPink/90 text-gray-900 rounded-2xl font-bold text-lg shadow-xl shadow-pasPink/25 transition-all active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Fazer Avaliação Gratuita{" "}
                  <LuChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-md text-gray-700 border border-gray-200/50 hover:bg-white hover:border-gray-300 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
              >
                <LuPlay className="h-5 w-5 fill-current" />
                Já sou aluno
              </button>
            </motion.div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-gray-600 font-medium">
              <span className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                <LuClipboardList className="text-pasGreen w-5 h-5" /> Fichas
                Personalizadas
              </span>
              <span className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                <LuStethoscope className="text-pasGreen w-5 h-5" /> Avaliação
                Corporal
              </span>
            </div>

            <MobileAppPreview />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{
              duration: 1,
              delay: 0.1,
              type: "spring",
              bounce: 0.3,
            }}
            className="lg:w-7/12 relative hidden lg:block h-150 perspective-[2000px]"
          >
            <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
              <motion.div
                animate={{ y: [-10, 0, -10], rotate: [-6, -5, -6] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-12 left-12 w-64 h-80 bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-white/50 -rotate-6 z-0"
              >
                <img
                  src="/Untitled.jpg"
                  alt="Treino"
                  className="object-cover w-full h-full brightness-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white font-bold text-lg drop-shadow-md">
                  Foco no Treino
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [10, 0, 10], rotate: [6, 7, 6] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute bottom-24 right-8 w-64 h-80 bg-gray-100 rounded-3xl shadow-2xl overflow-hidden border-4 border-white/50 rotate-6 z-0 opacity-90"
              >
                <img
                  src="/Diet.jpg"
                  alt="Nutrição"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-linear-to-t from-pasGreen/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-gray-900 font-bold text-lg">
                  Nutrição Real
                </div>
              </motion.div>
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3, type: "spring" }}
                className="relative z-20 transform-gpu hover:scale-105 transition-transform duration-500"
                style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))" }}
              >
                <div className="relative mx-auto border-gray-900 bg-gray-900 border-12 rounded-[3rem] h-130 w-65 shadow-xl flex flex-col overflow-hidden">
                  <div className="h-6 w-0.75 bg-gray-800 absolute -start-3 top-20 rounded-s-lg"></div>
                  <div className="h-10 w-0.75 bg-gray-800 absolute -start-3 top-32 rounded-s-lg"></div>
                  <div className="h-14 w-0.75 bg-gray-800 absolute -end-3 top-24 rounded-e-lg"></div>
                  <div className="rounded-[2.2rem] overflow-hidden w-full h-full bg-white relative">
                    <div className="absolute inset-0 bg-white flex flex-col">
                      <div className="pt-8 pb-4 px-6 flex justify-between items-center bg-gray-50">
                        <div>
                          <p className="text-xs text-gray-500">Bom dia,</p>
                          <h4 className="font-bold text-gray-900">Atleta</h4>
                        </div>
                        <div className="w-10 h-10 bg-pasPink/20 rounded-full flex items-center justify-center">
                          <LuDumbbell className="text-pasPink w-5 h-5" />
                        </div>
                      </div>
                      <div className="p-6 space-y-4 bg-linear-to-b from-gray-50 to-white flex-1">
                        <div className="bg-pasPink/10 p-4 rounded-2xl border border-pasPink/20">
                          <div className="flex items-center gap-3 mb-2">
                            <LuUtensils className="text-pasPink" />{" "}
                            <span className="font-bold text-gray-900">
                              Calorias Hoje
                            </span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              animate={{ width: ["0%", "75%"] }}
                              transition={{ duration: 1.5, delay: 1 }}
                              className="h-full bg-pasPink rounded-full"
                            ></motion.div>
                          </div>
                          <div className="flex justify-between text-xs mt-1 text-gray-500">
                            <span>1500 kcal</span>
                            <span>Meta: 2000</span>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1 bg-pasGreen/10 p-4 rounded-2xl border border-pasGreen/20 h-28 flex flex-col justify-between">
                            <LuDumbbell className="text-pasGreen" />
                            <span className="font-bold text-gray-900 text-sm">
                              Próximo Treino: Peito
                            </span>
                          </div>
                          <div className="flex-1 bg-gray-100 p-4 rounded-2xl h-28 flex flex-col justify-between">
                            <LuLineChart className="text-gray-400" />
                            <span className="font-bold text-gray-600 text-sm">
                              Evolução
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="h-16 bg-white border-t border-gray-100 flex justify-around items-center px-6">
                        <div className="text-pasPink">
                          <div className="w-6 h-6 bg-current rounded-full opacity-20 mb-1 mx-auto"></div>
                        </div>
                        <div className="text-gray-300">
                          <div className="w-6 h-6 bg-current rounded-full opacity-20 mb-1 mx-auto"></div>
                        </div>
                        <div className="text-gray-300">
                          <div className="w-6 h-6 bg-current rounded-full opacity-20 mb-1 mx-auto"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [-15, 0, -15], x: [5, 0, 5] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-16 -left-4 bg-white/90 backdrop-blur-md p-3 pr-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white flex items-center gap-3 z-30"
              >
                <div className="bg-pasPink p-2 rounded-xl text-gray-900 shadow-sm">
                  <LuRuler className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900">
                    Medidas
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Histórico completo
                  </p>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [15, 0, 15], x: [-5, 0, -5] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute bottom-32 -right-8 bg-white/90 backdrop-blur-md p-3 pr-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white flex items-center gap-3 z-30"
              >
                <div className="bg-pasGreen p-2 rounded-xl text-gray-900 shadow-sm">
                  <LuLineChart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900">
                    Resultados
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Gráficos de evolução
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: buttonOpacity, pointerEvents: buttonPointerEvents }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 cursor-pointer"
        >
          <motion.button
            onClick={handleScrollDown}
            className="flex flex-col items-center gap-2 group"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-pasPink transition-colors bg-white/50 px-2 rounded-sm backdrop-blur-sm">
              Descubra Mais
            </span>
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 flex items-center justify-center group-hover:bg-pasPink group-hover:text-white group-hover:border-pasPink transition-all duration-300 relative overflow-hidden">
              <LuChevronDown className="w-6 h-6 relative z-10 animate-bounce-slow" />
            </div>
          </motion.button>
        </motion.div>
      </section>

      {/* --- SEÇÃO: FILOSOFIA/VERDADEIRO EU (Fundo Escuro - AJUSTES MOBILE) --- */}
      {/* Alterado py-24 para py-16 no mobile para reduzir espaço */}
      <section
        id="filosofia"
        className="py-16 md:py-24 px-6 bg-gray-900 relative overflow-hidden scroll-mt-0"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pasPink/10 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pasGreen/10 rounded-full blur-[120px] mix-blend-screen"></div>
        </div>

        {/* Alterado gap-16 para gap-8 no mobile */}
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16 relative z-10">
          <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-pasGreen font-bold text-sm uppercase tracking-wider mb-4 block">
                Nossa Filosofia
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                Não é mágica. <br /> É ciência aplicada a{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-pasPink to-pasGreen">
                  você.
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed font-light">
                "Alcançar o seu verdadeiro eu" não é um slogan vazio. É o
                resultado inevitável quando você para de tentar métodos
                genéricos e começa a dar ao seu corpo exatamente o que ele
                precisa, baseado em dados reais da sua avaliação.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4"
            >
              {/* Mini Cards de Processo */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <LuStethoscope className="w-10 h-10 text-pasPink mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-bold mb-2">1. Avaliação</h4>
                <p className="text-gray-400 text-sm">
                  Mapeamos seu corpo e histórico.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <LuBrainCircuit className="w-10 h-10 text-white mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-bold mb-2">2. Inteligência</h4>
                <p className="text-gray-400 text-sm">
                  Nossos experts montam seu plano.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <LuTarget className="w-10 h-10 text-pasGreen mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-bold mb-2">3. Resultado</h4>
                <p className="text-gray-400 text-sm">
                  Você executa e conquista.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            // Alterado h-[500px] para h-[400px] no mobile
            className="lg:w-1/2 relative h-[400px] lg:h-[500px] w-full rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
          >
            <img
              src="https://placehold.co/600x800/111827/FFFFFF/png?text=Dados+que+Geram+Resultados"
              alt="Visualização de Dados"
              className="object-cover w-full h-full opacity-80 mix-blend-luminosity"
            />
            {/* Gradiente reforçado */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>

            {/* Padding reduzido no mobile (p-6) */}
            <div className="absolute bottom-0 left-0 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-pasPink/20 p-3 rounded-xl backdrop-blur-md border border-pasPink/30">
                  <LuDatabase className="w-8 h-8 text-pasPink" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  Dados Reais
                </h3>
              </div>
              <p className="text-gray-300 text-base md:text-lg">
                Sua ficha não é um "copia e cola". Ela é construída bit a bit
                com base na sua avaliação corporal única.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FUNCIONALIDADES (GRID) --- */}
      {/* Alterado py-24 para py-16 no mobile */}
      <section
        id="funcionalidades"
        className="py-16 md:py-24 px-6 bg-white scroll-mt-0 relative z-10"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gray-100 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-pasPink font-bold text-sm uppercase tracking-wider mb-3 block">
              Ferramentas Exclusivas
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Tudo o que você precisa, <br /> sem complexidade.
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed font-light">
              O Power Slim centraliza sua jornada fitness. Tenha acesso a planos
              profissionais e acompanhamento detalhado em um único app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            <FeatureCard
              icon={LuClipboardList}
              title="Fichas de Treino"
              description="Treinos periodizados montados por especialistas para hipertrofia, emagrecimento ou resistência."
              delay={0.1}
            />
            <FeatureCard
              icon={LuUtensils}
              title="Dietas Personalizadas"
              description="Planos alimentares flexíveis criados por nutricionistas, ajustados à sua rotina e preferências."
              delay={0.2}
            />
            <FeatureCard
              icon={LuStethoscope}
              title="Avaliação Física"
              description="Registre suas medidas, peso e fotos para que nossa inteligência adapte seu plano constantemente."
              delay={0.3}
            />
            <FeatureCard
              icon={LuBookOpen}
              title="Execução Correta"
              description="Vídeos e instruções detalhadas de cada exercício para garantir segurança e resultados máximos."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* --- BENEFÍCIOS (Seção Reconstruída) --- */}
      {/* Alterado py-24 para py-16 no mobile */}
      <section className="py-16 md:py-24 px-6 bg-gray-50/50 overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-20">
          <div className="md:w-1/2 relative order-2 md:order-1">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-linear-to-tr from-pasPink/20 to-pasGreen/20 rounded-full blur-[100px] opacity-60 pointer-events-none" />
            <div className="relative bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-gray-200/50 border border-white">
              <div className="flex items-center gap-5 mb-10">
                <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-lg shadow-gray-900/30">
                  <LuSmartphone className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Sua academia no bolso
                  </h3>
                  <p className="text-gray-500 font-medium">
                    Controle total na palma da mão
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-gray-50/80 rounded-2xl border border-gray-100/80 backdrop-blur-sm shadow-sm hover:scale-[1.02] transition-transform cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pasGreen/20 flex items-center justify-center text-pasGreen">
                      <LuDumbbell className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Treino de Hoje</p>
                      <p className="text-xs text-gray-500 font-medium">
                        Supino Reto 4x10
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-pasGreen text-gray-900 px-3 py-1.5 rounded-full shadow-sm">
                    Concluído
                  </span>
                </div>
                <div className="flex items-center justify-between p-5 bg-gray-50/80 rounded-2xl border border-gray-100/80 backdrop-blur-sm shadow-sm hover:scale-[1.02] transition-transform cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pasPink/20 flex items-center justify-center text-pasPink">
                      <LuUtensils className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Proteína</p>
                      <p className="text-xs text-gray-500 font-medium">
                        Faltam 20g
                      </p>
                    </div>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-pasPink w-[80%] rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-5 bg-gray-50/80 rounded-2xl border border-gray-100/80 backdrop-blur-sm shadow-sm hover:scale-[1.02] transition-transform cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <LuDroplets className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Hidratação</p>
                      <p className="text-xs text-gray-500 font-medium">
                        Meta batida!
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-600 p-1.5 rounded-full text-white shadow-sm shadow-blue-200">
                    <LuCheckCircle className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 order-1 md:order-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Abandone o <br />
                <span className="text-gray-400 line-through decoration-pasPink decoration-4">
                  caos das notas.
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                Esqueça os blocos de notas confusos e planilhas complexas. O
                Power Slim organiza sua vida fitness em um sistema inteligente e
                bonito.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <SmartBenefitCard
                icon={LuBrainCircuit}
                title="Método Científico"
                subtitle="Treinos Periodizados"
                color="bg-indigo-500"
                delay={0.1}
              />
              <SmartBenefitCard
                icon={LuRuler}
                title="Métricas Reais"
                subtitle="Acompanhe medidas"
                color="bg-rose-500"
                delay={0.2}
              />
              <SmartBenefitCard
                icon={LuChartLine}
                title="Gráficos Pro"
                subtitle="Evolução visual"
                color="bg-emerald-500"
                delay={0.3}
              />
              <SmartBenefitCard
                icon={LuFileText}
                title="Fichas Completas"
                subtitle="Exercícios detalhados"
                color="bg-orange-500"
                delay={0.4}
              />
              <SmartBenefitCard
                icon={LuUtensils}
                title="Macros Fácil"
                subtitle="Controle diário"
                color="bg-pasPink"
                delay={0.5}
              />
              <SmartBenefitCard
                icon={LuWifiOff}
                title="Modo Offline"
                subtitle="Acesse onde estiver"
                color="bg-gray-800"
                delay={0.6}
              />
            </div>
            <div>
              <button
                onClick={() => navigate("/onboard")}
                className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl shadow-gray-900/30 hover:-translate-y-1 active:translate-y-0 active:scale-95 flex items-center gap-3"
              >
                <LuPlay className="fill-current w-5 h-5" />
                Fazer avaliação corporal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA FINAL ... (Mantido) --- */}
      <section className="py-32 px-6 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-pasPink/5 z-0"></div>
        <motion.div
          animate={{
            x: ["-20%", "20%", "-20%"],
            y: ["0%", "30%", "0%"],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] rounded-full bg-pasPink blur-[150px] opacity-40 mix-blend-multiply z-1"
        />
        <motion.div
          animate={{
            x: ["20%", "-20%", "20%"],
            y: ["10%", "-20%", "10%"],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[150%] rounded-full bg-pasGreen blur-[150px] opacity-40 mix-blend-multiply z-1"
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[80px] z-5"></div>

        <div className="max-w-5xl mx-auto text-center relative z-20">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight text-gray-900 leading-tight">
            Seu corpo, seus dados, <br /> seu resultado.
          </h2>
          <p className="text-gray-900/80 text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Comece agora a usar a ferramenta definitiva para quem leva treino e
            dieta a sério. Junte-se à comunidade Power Slim.
          </p>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 25px 60px -12px rgba(255,105,180,0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/onboard")}
            className="px-12 py-6 bg-white text-gray-900 rounded-full font-extrabold text-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all relative overflow-hidden group"
          >
            <span className="relative z-10">Criar Minha Conta Grátis</span>
            <div className="absolute inset-0 bg-linear-to-r from-pasPink/10 to-pasGreen/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>
          <p className="mt-8 text-base text-gray-900 font-semibold opacity-70">
            Escolha o plano que combine melhor com seus objetivos.
          </p>
        </div>
      </section>
    </LandingLayout>
  );
}
