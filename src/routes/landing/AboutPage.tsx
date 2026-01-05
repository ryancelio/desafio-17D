import React from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  LuTarget,
  LuUsers,
  LuBrainCircuit,
  LuShieldCheck,
  LuSmartphone,
  LuArrowRight,
  LuHeart,
  LuDumbbell,
  LuCheck,
} from "react-icons/lu";
import LandingLayout from "./LandingLayout";
// --- COMPONENTES AUXILIARES ---

const ValueCard: React.FC<{
  icon: React.ElementType;
  title: string;
  desc: string;
  delay: number;
}> = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-pasPink/50 transition-colors"
  >
    <div className="w-12 h-12 bg-pasPink/20 rounded-xl flex items-center justify-center text-gray-900 mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const StatItem: React.FC<{ number: string; label: string }> = ({
  number,
  label,
}) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">
      {number}
    </div>
    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </div>
  </div>
);

// --- PÁGINA PRINCIPAL ---

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <LandingLayout>
      {/* HEADER HERO */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden bg-white">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-pasPink/20 text-gray-900 text-sm font-bold uppercase tracking-wide mb-6 border border-pasPink/30">
              Sobre Nós
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Democratizando o acesso à{" "}
              <span className="text-gray-900 bg-pasPink/50 px-2 rounded-lg">
                saúde de verdade.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Acreditamos que todo mundo merece um plano de treino e dieta
              profissional, sem a complexidade de planilhas ou o custo
              proibitivo de consultorias presenciais.
            </p>
          </motion.div>
        </div>

        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-20 w-[800px] h-[800px] bg-pasPink/20 rounded-full blur-3xl -z-10" />
      </section>

      {/* A NOSSA MISSÃO */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gray-200 relative z-10">
              {/* Imagem Placeholder - Pode substituir por uma foto real de lifestyle */}
              <img
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Pessoa treinando feliz"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="text-white">
                  <p className="font-bold text-lg">
                    "O melhor treino é aquele que você faz."
                  </p>
                </div>
              </div>
            </div>
            {/* Elemento Decorativo */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-pasPink/50 rounded-3xl -z-0" />
          </motion.div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Por que criamos o Power Slim?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Notamos que a indústria fitness estava dividida em dois extremos:
              aplicativos genéricos que não consideram quem você é, e personal
              trainers com custos que nem todos podem pagar mensalmente.
            </p>
            <p className="text-gray-600 leading-relaxed">
              O Power Slim nasceu para preencher essa lacuna. Utilizamos
              algoritmos inteligentes e curadoria profissional para criar fichas
              de treino que se adaptam ao seu local (casa ou academia), suas
              limitações e seus objetivos.
            </p>

            <div className="space-y-3 pt-4">
              {[
                "Foco na constância, não na perfeição.",
                "Ciência aplicada de forma simples.",
                "Tecnologia a serviço do bem-estar.",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <LuCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS (GRID) */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              O que nos torna únicos
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Não somos apenas mais um app de cronômetro. Somos um ecossistema
              completo para sua evolução.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ValueCard
              icon={LuBrainCircuit}
              title="Inteligência Adaptativa"
              desc="Nossos treinos não são estáticos. Você pode solicitar novas fichas baseadas em como seu corpo está respondendo."
              delay={0.1}
            />
            <ValueCard
              icon={LuShieldCheck}
              title="Segurança em Primeiro Lugar"
              desc="Respeitamos suas lesões e limitações. O sistema filtra exercícios perigosos para o seu perfil automaticamente."
              delay={0.2}
            />
            <ValueCard
              icon={LuSmartphone}
              title="Experiência de App Nativo"
              desc="Funciona como um app instalado, mas sem ocupar espaço. Rápido, leve e disponível offline (PWA)."
              delay={0.3}
            />
            <ValueCard
              icon={LuTarget}
              title="Metas Realistas"
              desc="Não vendemos milagres. Ajudamos você a calcular prazos reais para atingir seu peso ideal de forma saudável."
              delay={0.4}
            />
            <ValueCard
              icon={LuUsers}
              title="Suporte Humanizado"
              desc="Dúvidas sobre a execução? Problemas com o pagamento? Nosso time de suporte está a um clique no WhatsApp."
              delay={0.5}
            />
            <ValueCard
              icon={LuDumbbell}
              title="Liberdade de Escolha"
              desc="Treine onde quiser. Alterne entre fichas de 'Casa' e 'Academia' sem perder seu histórico de progresso."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* ESTATÍSTICAS (PROVA SOCIAL SIMULADA) */}
      <section className="py-16 px-6 bg-pasPink/10 border-y border-pasPink/20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem number="+10k" label="Usuários Ativos" />
          <StatItem number="+500" label="Exercícios Cadastrados" />
          <StatItem number="98%" label="Satisfação" />
          <StatItem number="24/7" label="Disponibilidade" />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-16 h-16 bg-pasPink/30 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <LuHeart className="w-8 h-8 fill-current" />
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Pronto para começar sua melhor versão?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Junte-se à comunidade Power Slim hoje mesmo. Comece com uma análise
            gratuita e descubra o que preparamos para você.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/onboard")}
              className="px-8 py-4 bg-pasPink text-gray-900 rounded-xl font-bold text-lg shadow-xl shadow-pasPink/30 hover:bg-pasPink/90 transition-all active:scale-95 flex items-center gap-2"
            >
              Fazer Análise Grátis <LuArrowRight />
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
