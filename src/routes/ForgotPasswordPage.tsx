import { useState } from "react";
import { motion } from "framer-motion";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router";
import { FaArrowLeft, FaEnvelope, FaKey } from "react-icons/fa6";
import { FirebaseError } from "firebase/app";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Por favor, digite seu email.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "Verifique seu email! Enviamos um link para redefinir sua senha."
      );
      setEmail(""); // Limpa o campo
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/user-not-found":
            setError("Nenhuma conta encontrada com este email.");
            break;
          case "auth/invalid-email":
            setError("Email inválido.");
            break;
          default:
            setError("Erro ao enviar email. Tente novamente.");
        }
      } else {
        setError("Ocorreu um erro inesperado.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#fcc3d2] to-[#a8f3dc] transition-colors p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/40 relative"
      >
        <Link
          to="/login"
          className="absolute top-6 left-6 text-gray-500 hover:text-[#ff7da2] transition-colors"
        >
          <FaArrowLeft />
        </Link>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-linear-to-r from-[#ffafc1] to-[#9eeed0] rounded-full shadow-md">
              <FaKey className="text-white text-xl" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Recuperar Senha
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Digite seu email e enviaremos um link para você criar uma nova
            senha.
          </p>
        </div>

        {/* Mensagem de Sucesso */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#dcfce7] text-[#166534] px-4 py-3 rounded-lg mb-4 text-sm text-center border border-[#bbf7d0]"
          >
            {message}
          </motion.div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#ffe4e9] text-[#b91c1c] px-3 py-2 rounded-lg mb-3 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email cadastrado
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 p-2 rounded-lg border border-[#fcc3d2] focus:ring-2 focus:ring-[#ffafc1] focus:outline-none text-gray-800 bg-white/50"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-linear-to-r from-[#ffafc1] to-[#9eeed0] hover:opacity-90 transition-all text-white font-semibold rounded-lg shadow-md disabled:opacity-70 cursor-pointer"
          >
            {loading ? "Enviando..." : "Enviar Email de Recuperação"}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-[#ff7da2] transition-colors font-medium"
          >
            Voltar para o Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
