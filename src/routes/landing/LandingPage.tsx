import React from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  LuDumbbell,
  LuUtensils,
  LuTimer,
  LuChartLine as LuLineChart,
  LuChevronRight,
  LuCircleCheck as LuCheckCircle,
  LuPlay,
  LuSmartphone,
  LuZap,
  LuClipboardList, // Novo ícone para avaliação
} from "react-icons/lu";

// --- Subcomponentes ---

const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}> = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
  >
    <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </motion.div>
);

const BenefitItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-3 mb-3">
    <div className="shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
      <LuCheckCircle className="h-4 w-4" />
    </div>
    <span className="text-gray-700 font-medium">{text}</span>
  </div>
);

// --- Página Principal ---

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gray-50 overflow-x-hidden font-sans">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <LuZap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Power Slim
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors hidden sm:block"
            >
              Entrar
            </Link>
            <button
              onClick={() => navigate("/onboard")}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-900/20"
            >
              Fazer Análise
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Texto Hero */}
          <div className="lg:w-1/2 text-center lg:text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold uppercase tracking-wide mb-4 border border-indigo-100">
                🚀 O App Definitivo Fitness
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Descubra o plano ideal para{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">
                  transformar seu corpo.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Faça sua avaliação corporal gratuita e receba uma estratégia de
                treino e dieta personalizada para atingir seus objetivos mais
                rápido.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
            >
              <button
                onClick={() => navigate("/onboard")}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Fazer Avaliação Gratuita
                <LuChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <LuPlay className="h-5 w-5 fill-current" />
                Já sou aluno
              </button>
            </motion.div>

            <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <LuClipboardList className="text-green-500" /> Análise de perfil
                grátis
              </span>
              <span className="flex items-center gap-1">
                <LuCheckCircle className="text-green-500" /> Sem compromisso
              </span>
            </div>
          </div>

          {/* Imagem/Mockup Hero */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 relative"
          >
            <div className="relative mx-auto border-gray-800 bg-gray-800 border-14 rounded-[2.5rem] h-150 w-75 shadow-2xl flex flex-col overflow-hidden">
              <div className="h-8 w-0.75 bg-gray-800 absolute -start-4.25 top-18 rounded-s-lg"></div>
              <div className="h-11.5 w-0.75 bg-gray-800 absolute -start-4.25 top-31 rounded-s-lg"></div>
              <div className="h-11.5 w-0.75 bg-gray-800 absolute -start-4.25 top-44.5 rounded-s-lg"></div>
              <div className="h-16 w-0.75 bg-gray-800 absolute -end-4.25 top-35.5 rounded-e-lg"></div>
              <div className="rounded-4xl overflow-hidden w-full h-full bg-white relative">
                {/* Mockup Screen Content */}
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500 to-purple-600 opacity-90 flex flex-col items-center justify-center text-white p-6 text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <LuDumbbell className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Seu Plano</h3>
                  <p className="text-indigo-100 mb-8">
                    Personalizado para você
                  </p>
                  <div className="w-full bg-white/20 h-2 rounded-full mb-4 overflow-hidden">
                    <div className="w-3/4 bg-white h-full rounded-full" />
                  </div>
                  <p className="text-sm font-medium">Análise Concluída</p>
                </div>
                {/* Floating Cards simulating app UI */}
                <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <LuTimer />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">
                      Meta Diária
                    </p>
                    <p className="text-lg font-bold text-gray-900">100%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Elementos decorativos flutuantes */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 -left-10 md:-left-20 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3"
            >
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <LuUtensils />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Dieta Flexível
                </p>
                <p className="text-xs text-gray-500">Sem passar fome</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-40 -right-4 md:-right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3"
            >
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <LuLineChart />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Resultado</p>
                <p className="text-xs text-gray-500">Garantido</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- FUNCIONALIDADES (GRID) --- */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Tudo o que você precisa para evoluir
            </h2>
            <p className="text-lg text-gray-500">
              Deixamos a complexidade de lado. O Power Slim foca no que
              realmente importa: a sua constância e os seus resultados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={LuDumbbell}
              title="Treinos Guiados"
              description="Fichas de treino detalhadas, organizadas por grupos musculares, com vídeos explicativos."
              delay={0.1}
            />
            <FeatureCard
              icon={LuUtensils}
              title="Nutrição Inteligente"
              description="Acesso a centenas de receitas fitness calculadas para o seu objetivo calórico."
              delay={0.2}
            />
            <FeatureCard
              icon={LuTimer}
              title="Ferramentas Pro"
              description="Cronômetro integrado, contador de repetições e descanso automático entre séries."
              delay={0.3}
            />
            <FeatureCard
              icon={LuLineChart}
              title="Evolução Real"
              description="Registre peso, medidas e fotos. Veja gráficos do seu progresso ao longo do tempo."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* --- BENEFÍCIOS / MOBILE FOCUS --- */}
      <section className="py-20 px-6 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 relative">
            {/* Círculo decorativo */}
            <div className="absolute inset-0 bg-linear-to-tr from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-50 scale-90" />
            <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-indigo-600 text-white p-3 rounded-xl">
                  <LuSmartphone className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Mobile First
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Experiência nativa no navegador
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-16 bg-gray-50 rounded-xl w-full animate-pulse" />
                <div className="h-16 bg-gray-50 rounded-xl w-full animate-pulse delay-75" />
                <div className="h-16 bg-gray-50 rounded-xl w-full animate-pulse delay-150" />
              </div>
            </div>
          </div>

          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
              Acompanhamento Profissional no seu bolso
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Esqueça planilhas complicadas ou notas no celular. O Power Slim
              oferece uma interface otimizada para o toque, perfeita para usar
              na academia ou na cozinha.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BenefitItem text="Cronômetro de descanso" />
              <BenefitItem text="Histórico de cargas" />
              <BenefitItem text="Galeria de fotos segura" />
              <BenefitItem text="Cálculo de macros" />
              <BenefitItem text="Modo offline (PWA)" />
              <BenefitItem text="Suporte dedicado" />
            </div>

            <div className="mt-10">
              <button
                onClick={() => navigate("/onboard")}
                className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg active:scale-95"
              >
                Fazer minha avaliação
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 px-6 bg-linear-to-br from-indigo-600 to-purple-700 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Descubra o potencial do seu corpo
          </h2>
          <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de usuários que já transformaram seus hábitos.
            Comece com uma análise profissional gratuita.
          </p>
          <button
            onClick={() => navigate("/onboard")}
            className="px-10 py-5 bg-white text-indigo-600 rounded-full font-extrabold text-xl shadow-2xl hover:bg-gray-50 transition-transform hover:scale-105 active:scale-100"
          >
            Iniciar Avaliação Gratuita
          </button>
          <p className="mt-6 text-sm text-indigo-200 opacity-80">
            Sua análise de perfil é 100% gratuita e sem compromisso.
          </p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-gray-800 p-2 rounded-lg text-white">
              <LuZap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-white">Power Slim</span>
          </div>

          <div className="flex gap-8 text-sm font-medium">
            <Link to="#" className="hover:text-white transition-colors">
              Sobre
            </Link>
            <Link to="#" className="hover:text-white transition-colors">
              Planos
            </Link>
            <Link to="#" className="hover:text-white transition-colors">
              Privacidade
            </Link>
            <Link to="#" className="hover:text-white transition-colors">
              Termos
            </Link>
          </div>

          <p className="text-xs opacity-50">
            &copy; {new Date().getFullYear()} Power Slim. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
