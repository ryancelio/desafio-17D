import React from "react";
import { Link, useNavigate } from "react-router";
import { FaWhatsapp } from "react-icons/fa";
import { LuLock, LuUser } from "react-icons/lu"; // Ícones novos

const WHATSAPP_NUMBER = "5531991778410";
const WHATSAPP_MESSAGE = "Olá! Gostaria de tirar dúvidas sobre o Power Slim.";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE
)}`;

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  // Função para disparar o evento de Contato
  const handleWhatsAppClick = () => {
    if (typeof window.fbq !== "undefined") {
      window.fbq("track", "Contact", {
        content_name: "WhatsApp Floating Button",
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 overflow-x-hidden font-sans relative flex flex-col selection:bg-pasPink/30 selection:text-pasPink-900">
      {/* --- BOTÃO FLUTUANTE WHATSAPP --- */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        onClick={handleWhatsAppClick}
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Falar no WhatsApp"
        title="Falar com Suporte"
      >
        <FaWhatsapp className="w-7 h-7" />
        <span className="absolute right-full mr-3 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none transform translate-x-2 group-hover:translate-x-0">
          Fale Conosco
        </span>
      </a>

      {/* NAVBAR (Premium Glass Effect) */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* 1. LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-xl bg-gray-50 border border-gray-100 group-hover:border-pasPink/30 transition-colors">
              <img src="/icon_small.png" alt="Logo" className="w-8 h-8" />
            </div>
            <span className="text-lg font-extrabold text-gray-900 tracking-tight">
              Power Slim
            </span>
          </Link>

          {/* 2. LINKS DE NAVEGAÇÃO (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/#funcionalidades"
              className="text-sm font-medium text-gray-600 hover:text-pasPink transition-colors"
            >
              Funcionalidades
            </a>
            <Link
              to="/planos"
              className="text-sm font-medium text-gray-600 hover:text-pasPink transition-colors"
            >
              Planos
            </Link>
            <Link
              to="/sobre"
              className="text-sm font-medium text-gray-600 hover:text-pasPink transition-colors"
            >
              Sobre Nós
            </Link>
          </div>

          {/* 3. AÇÕES (Direita) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Botão Admin (Restrito) */}
            <Link
              to="/admin"
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              title="Área Administrativa"
            >
              <LuLock className="w-4 h-4" />
            </Link>

            {/* Divisor */}
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            {/* Login */}
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LuUser className="w-4 h-4" />
              Entrar
            </Link>

            {/* CTA Principal */}
            <button
              onClick={() => navigate("/onboard")}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 w-full relative z-0">{children}</main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6 border-t border-gray-800 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Coluna Logo */}
            <div className="col-span-1 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <div className="bg-white/10 p-2 rounded-lg">
                  <img src="/icon_small.png" alt="Logo" className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">Power Slim</span>
              </div>
              <p className="text-sm leading-relaxed opacity-60">
                Sua jornada para uma vida mais saudável começa aqui. Tecnologia
                e ciência a favor do seu corpo.
              </p>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="text-white font-bold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/login"
                    className="hover:text-white transition-colors"
                  >
                    Login Aluno
                  </Link>
                </li>
                <li>
                  <Link
                    to="/onboard"
                    className="hover:text-white transition-colors"
                  >
                    Criar Conta
                  </Link>
                </li>
                <li>
                  <Link
                    to="/planos"
                    className="hover:text-white transition-colors"
                  >
                    Planos e Preços
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/termos"
                    className="hover:text-white transition-colors"
                  >
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacidade"
                    className="hover:text-white transition-colors"
                  >
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="text-white font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-pasGreen transition-colors flex items-center gap-2"
                  >
                    <FaWhatsapp /> WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:suporte@powerslim.com"
                    className="hover:text-white transition-colors"
                  >
                    suporte@powerslim.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-40">
            <p>
              &copy; {new Date().getFullYear()} Power Slim. Todos os direitos
              reservados.
            </p>
            <div className="flex gap-4">
              <span>Feito com ❤️ para sua evolução.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
