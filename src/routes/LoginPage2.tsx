import { useState } from "react";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router";
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa6";
import apiClient, { isApiError, logLoginAttempt } from "../api/apiClient";
import { FirebaseError } from "firebase/app";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const processLoginSuccess = async (userDisplayName?: string | null) => {
    try {
      await apiClient.syncUser({
        nome: userDisplayName || email.split("@")[0] || "Usuário",
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Erro na sincronização:", err);
      navigate("/dashboard");
    }
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validação básica
    if (!email || password.length < 6) {
      setError("Verifique seus dados.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await processLoginSuccess(userCredential.user.displayName);
    } catch (err: unknown) {
      // Variável para armazenar a razão do erro como STRING
      let failureReason = "unknown_error";

      if (err instanceof FirebaseError) {
        failureReason = err.code; // Ex: 'auth/wrong-password'

        switch (err.code) {
          case "auth/invalid-credential":
          case "auth/user-not-found":
          case "auth/wrong-password":
            setError("Email ou senha incorretos.");
            break;
          case "auth/too-many-requests":
            setError("Muitas tentativas. Tente mais tarde.");
            break;
          default:
            setError("Erro ao realizar login.");
        }
      } else if (isApiError(err)) {
        failureReason = String(err.response?.data?.error || "api_error");
        setError(err.response?.data.error || "Erro de conexão com servidor.");
      } else {
        // Converte qualquer outro erro para string
        failureReason = err instanceof Error ? err.message : String(err);
        setError("Ocorreu um erro inesperado.");
      }

      // CORREÇÃO: Envia 'failureReason' que é garantidamente uma string
      logLoginAttempt(email, "failed_attempt", failureReason).catch(
        console.error
      );

      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-linear-to-br from-[#fcc3d2] to-[#a8f3dc] transition-colors p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/50"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-linear-to-r from-[#ffafc1] to-[#9eeed0] rounded-full shadow-md">
              <FaLock className="text-white text-xl" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Entre com sua conta para continuar
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#ffe4e9] text-[#b91c1c] px-3 py-2 rounded-lg mb-3 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaEnvelope />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ffafc1] focus:ring-4 focus:ring-[#ffafc1]/20 transition-all outline-none text-gray-800 placeholder-gray-400"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#8de6c8] focus:ring-4 focus:ring-[#8de6c8]/20 transition-all outline-none text-gray-800 placeholder-gray-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <Link
                to="/forgot-password"
                className="text-xs text-gray-500 hover:text-[#ff7da2] transition-colors font-medium"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-linear-to-r from-[#ffafc1] to-[#9eeed0] hover:opacity-90 active:scale-[0.98] transition-all text-white font-bold text-lg rounded-xl shadow-lg shadow-[#ffafc1]/30 disabled:opacity-70 cursor-pointer"
          >
            {loading ? "Entrando..." : "Entrar"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Não tem uma conta?{" "}
          <Link
            to="/register"
            className="text-[#ff7da2] hover:underline font-medium"
          >
            Cadastre-se
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
