import React from "react";
import { Link, useNavigate } from "react-router";
import { FaWhatsapp } from "react-icons/fa";

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
  // 2. Função para disparar o evento de Contato
  const handleWhatsAppClick = () => {
    if (typeof window.fbq !== "undefined") {
      window.fbq("track", "Contact", {
        content_name: "WhatsApp Floating Button", // Identifica qual botão foi clicado
      });
      // console.log("Pixel Contact disparado!");
    }
  };
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gray-50 overflow-x-hidden font-sans relative flex flex-col">
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
        <FaWhatsapp className="w-8 h-8" />
        <span className="absolute right-full mr-3 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Fale Conosco
        </span>
      </a>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg shadow-sm">
              <img src="/icon_small.png" alt="Logo" className="w-10 h-10" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Power Slim
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Entrar
            </Link>
            <button
              onClick={() => navigate("/onboard")}
              className="bg-pasPink text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-pasPink/90 transition-all active:scale-95 shadow-lg shadow-pasPink/20"
            >
              Fazer Análise
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-pasPink p-2 rounded-lg shadow-sm">
              <img src="/icon_small.png" alt="Logo" className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">Power Slim</span>
          </div>

          <div className="flex gap-8 text-sm font-medium">
            <Link to="/sobre" className="hover:text-white transition-colors">
              Sobre
            </Link>
            <Link to="/planos" className="hover:text-white transition-colors">
              Planos
            </Link>
            <Link to="/termos" className="hover:text-white transition-colors">
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
