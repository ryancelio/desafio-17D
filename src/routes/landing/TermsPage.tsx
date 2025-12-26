import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  LuZap,
  LuFileText,
  LuShieldAlert,
  LuCreditCard,
  LuUndo2, // Voltar
  LuChevronRight,
  LuScale,
} from "react-icons/lu";

// --- DADOS DOS TERMOS ---
const termsSections = [
  {
    id: "intro",
    title: "1. Introdução e Aceitação",
    content: (
      <>
        <p>
          Bem-vindo ao <strong>Power Slim</strong>. Ao acessar nosso site,
          baixar nosso aplicativo (PWA) ou utilizar nossos serviços, você
          concorda em cumprir estes Termos de Uso. Se você não concordar com
          qualquer parte destes termos, você não deve utilizar nossos serviços.
        </p>
        <p>
          Estes termos constituem um acordo legal entre você (o "Usuário") e o
          Power Slim. Reservamo-nos o direito de alterar estes termos a qualquer
          momento, e o uso contínuo do serviço constitui aceitação das novas
          regras.
        </p>
      </>
    ),
  },
  {
    id: "health",
    title: "2. Isenção de Responsabilidade Médica",
    icon: LuShieldAlert,
    content: (
      <>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700">
          <strong>AVISO IMPORTANTE:</strong> O Power Slim não é uma instituição
          médica e não oferece diagnósticos ou tratamentos médicos.
        </div>
        <p>
          Todo o conteúdo disponível no aplicativo, incluindo fichas de treino,
          sugestões nutricionais, textos e vídeos, tem caráter meramente
          informativo e educacional.
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>
            Consulte um médico antes de iniciar qualquer programa de exercícios
            ou dieta, especialmente se você tiver histórico de doenças
            cardíacas, pressão alta, obesidade ou outras condições
            preexistentes.
          </li>
          <li>
            Se sentir tontura, dor no peito, falta de ar ou desconforto durante
            o treino, pare imediatamente e procure ajuda médica.
          </li>
          <li>
            O uso das informações fornecidas é de sua exclusiva responsabilidade
            e risco. O Power Slim não se responsabiliza por lesões ou danos
            decorrentes da execução dos exercícios propostos.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "access",
    title: "3. Conta e Acesso",
    content: (
      <>
        <p>
          Para acessar recursos premium, você deve criar uma conta. Você é
          responsável por manter a confidencialidade de sua senha.
        </p>
        <p>
          Você garante que todas as informações fornecidas (peso, altura, idade,
          condições de saúde) são verdadeiras e atualizadas. O Power Slim não se
          responsabiliza por treinos inadequados gerados a partir de dados
          falsos ou desatualizados inseridos pelo usuário.
        </p>
        <p>
          É proibido compartilhar sua conta com terceiros. Detectar múltiplos
          acessos simultâneos pode levar à suspensão da conta.
        </p>
      </>
    ),
  },
  {
    id: "payments",
    title: "4. Planos, Pagamentos e Renovações",
    icon: LuCreditCard,
    content: (
      <>
        <p>
          Oferecemos planos de assinatura (Mensal e Anual) e compras avulsas
          (Créditos de Ficha).
        </p>
        <h4 className="font-bold mt-4 mb-2 text-gray-800">Assinatura Mensal</h4>
        <p>
          A cobrança é realizada automaticamente a cada mês no cartão de crédito
          cadastrado. O cancelamento pode ser feito a qualquer momento através
          do painel do usuário, interrompendo cobranças futuras.
        </p>
        <h4 className="font-bold mt-4 mb-2 text-gray-800">Plano Anual</h4>
        <p>
          O plano anual é cobrado como um pagamento único (pré-pago) ou
          parcelado via cartão de crédito, garantindo acesso por 12 meses. Este
          plano não possui renovação automática silenciosa; você será notificado
          antes do vencimento para realizar uma nova compra, se desejar.
        </p>
        <h4 className="font-bold mt-4 mb-2 text-gray-800">Créditos Avulsos</h4>
        <p>
          A compra de fichas avulsas é definitiva. Os créditos não possuem data
          de expiração enquanto sua conta estiver ativa, mas não são
          reembolsáveis após a utilização (geração da ficha).
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "5. Cancelamento e Reembolso",
    icon: LuScale,
    content: (
      <>
        <p>
          Em conformidade com o{" "}
          <strong>Código de Defesa do Consumidor (Art. 49)</strong>, você tem o
          direito de desistir da compra em até <strong>7 dias corridos</strong>{" "}
          após a contratação inicial, desde que não tenha utilizado o serviço de
          forma extensiva (ex: gerado múltiplas fichas e baixado conteúdo).
        </p>
        <p>
          Para solicitar o reembolso dentro do prazo de 7 dias, entre em contato
          com nosso suporte via WhatsApp ou e-mail.
        </p>
        <p>Após o período de 7 dias:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>
            <strong>Assinaturas:</strong> O cancelamento impedirá a renovação do
            próximo ciclo, mas não haverá reembolso proporcional do período já
            pago (seja mensal ou anual). Você continuará com acesso até o fim do
            ciclo vigente.
          </li>
          <li>
            <strong>Créditos:</strong> Não há reembolso para créditos não
            utilizados após o prazo de arrependimento.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "privacy",
    title: "6. Privacidade de Dados",
    content: (
      <>
        <p>
          Respeitamos sua privacidade. Seus dados de saúde, fotos de progresso e
          medidas são armazenados de forma segura e criptografada.
        </p>
        <p>
          Não vendemos seus dados para terceiros. Utilizamos as informações
          apenas para personalizar seu treino e melhorar nossos algoritmos. Para
          mais detalhes, consulte nossa Política de Privacidade.
        </p>
      </>
    ),
  },
  {
    id: "intellectual",
    title: "7. Propriedade Intelectual",
    content: (
      <>
        <p>
          Todo o conteúdo do Power Slim (logotipos, textos, vídeos de
          exercícios, código-fonte e algoritmos) é propriedade exclusiva da
          empresa. É proibida a cópia, distribuição, engenharia reversa ou
          revenda de qualquer parte do serviço sem autorização expressa.
        </p>
      </>
    ),
  },
  {
    id: "support",
    title: "8. Suporte e Contato",
    content: (
      <>
        <p>
          Para dúvidas, problemas técnicos ou solicitações financeiras, nosso
          canal oficial é o WhatsApp ou E-mail. Nos esforçamos para responder
          todas as solicitações em até 24 horas úteis.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(termsSections[0].id);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-600">
      {/* HEADER */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <LuZap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Power Slim
            </span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
          >
            <LuUndo2 className="w-4 h-4" /> Voltar
          </button>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
            <LuFileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Termos de Uso
          </h1>
          <p className="text-lg text-gray-500">
            Última atualização:{" "}
            {new Date().toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* SIDEBAR DE NAVEGAÇÃO (Desktop) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-32 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">
                Índice
              </h3>
              <ul className="space-y-1">
                {termsSections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${
                        activeSection === section.id
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span className="truncate">{section.title}</span>
                      {activeSection === section.id && (
                        <LuChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CONTEÚDO PRINCIPAL */}
          <div className="lg:col-span-8 space-y-12">
            {termsSections.map((section, idx) => (
              <motion.section
                id={section.id}
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onViewportEnter={() => setActiveSection(section.id)}
                className="scroll-mt-32"
              >
                <div className="flex items-center gap-3 mb-4">
                  {section.icon && (
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <section.icon className="w-5 h-5" />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                <div className="prose prose-indigo text-gray-600 max-w-none leading-relaxed">
                  {section.content}
                </div>
                <div className="h-px w-full bg-gray-100 mt-12" />
              </motion.section>
            ))}

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 mt-8 text-center">
              <p className="font-medium text-gray-900 mb-2">
                Ainda tem dúvidas sobre os termos?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Nossa equipe jurídica e de suporte está à disposição.
              </p>
              <a
                href="mailto:suporte@powerslim.pro" // Substitua pelo email real
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
              >
                Entrar em Contato
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER SIMPLIFICADO */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm">
            &copy; {new Date().getFullYear()} Power Slim. Todos os direitos
            reservados.
          </span>
          <div className="flex gap-6 text-sm">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <Link to="/login" className="hover:text-white">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
