import { useState } from "react";
import { motion } from "framer-motion";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router"; // 👈 CORRIGIDO
import { FaGoogle, FaFacebookF, FaLock } from "react-icons/fa6";
import apiClient, { isApiError } from "../api/apiClient"; // 👈 ATUALIZADO

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (email.length === 0) {
      setError("Digite um email.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      // 1. Autentica com o Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // O 'auth.currentUser' agora está definido

      // 2. 👈 ATUALIZADO: Sincroniza com o backend PHP
      // O interceptor do axios cuida do token.
      // Passamos apenas o 'nome' (extraído do email) como fallback.
      await apiClient.syncUser({
        nome: email.split("@")[0] || "Novo Usuário",
      });

      // 3. Navega para o dashboard
      navigate("/dashboard");
    } catch (err: unknown) {
      // 👈 ATUALIZADO: Tratamento de erro tipado
      if (isApiError(err)) {
        // Erro vindo do nosso backend PHP (ex: token inválido)
        setError(err.response?.data.error || "Erro de API");
      } else {
        // Erro vindo do Firebase (ex: auth/wrong-password)
        setError("Email ou senha inválidos.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError(null);

    try {
      // 1. Autentica com o Firebase
      const result = await signInWithPopup(auth, provider);

      // 2. 👈 ATUALIZADO: Sincroniza com o backend PHP
      // Passamos o displayName do Google, se existir.
      await apiClient.syncUser({
        nome: result.user.displayName || undefined,
      });

      // 3. Navega para o dashboard
      navigate("/dashboard");
    } catch (err: unknown) {
      // 👈 ATUALIZADO: Tratamento de erro tipado
      if (isApiError(err)) {
        setError(err.response?.data.error || "Erro de API");
      } else {
        setError("Erro ao entrar com o Google.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFacebookLogin() {
    const provider = new FacebookAuthProvider();
    setLoading(true);
    setError(null);

    try {
      // 1. Autentica com o Firebase
      const response = await signInWithPopup(auth, provider);

      // 2. 👈 ATUALIZADO: Sincroniza com o backend PHP
      // Passamos o displayName do Facebook, se existir.
      await apiClient.syncUser({
        nome: response.user.displayName || undefined,
      });

      // 3. Navega para o dashboard
      navigate("/dashboard");
    } catch (err: unknown) {
      // 👈 ATUALIZADO: Tratamento de erro tipado
      if (isApiError(err)) {
        setError(err.response?.data.error || "Erro de API");
      } else {
        setError("Erro ao entrar com o Facebook.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#fcc3d2] to-[#a8f3dc] dark:from-gray-900 dark:to-gray-800 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80 dark:bg-gray-900/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl dark:shadow-[#a8f3dc] border border-white/40"
      >
        {/* ... O resto do seu JSX (UI) permanece o mesmo ... */}
        {/* Nenhuma mudança visual é necessária */}
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
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg border border-[#fcc3d2] focus:ring-2 focus:ring-[#ffafc1] focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white text-gray-800"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg border border-[#a8f3dc] focus:ring-2 focus:ring-[#8de6c8] focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white text-gray-800"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 bg-linear-to-r from-[#ffafc1] to-[#9eeed0] hover:opacity-90 transition-all text-white font-semibold rounded-lg shadow-md disabled:opacity-70 cursor-pointer"
          >
            {loading ? "Entrando..." : "Entrar"}
          </motion.button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
          <div className="h-px bg-gray-400 flex-1"></div>
          <span>ou</span>
          <div className="h-px bg-gray-400 flex-1"></div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={handleGoogleLogin}
            className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg border-gray-300 hover:bg-[#fef3f6]
              dark:border-gray-700 dark:hover:bg-gray-800 cursor-pointer transition-all dark:text-gray-100 text-gray-700
              hover:border-[#ffafc1]
              `}
          >
            <FaGoogle className="text-[#ea4335]" /> Google
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={handleFacebookLogin}
            className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg border-gray-300 hover:bg-[#f2faff]
              dark:border-gray-700 dark:hover:bg-gray-800 cursor-pointer transition-all dark:text-gray-100 text-gray-700
              hover:border-[#70f1cb]
              `}
          >
            <FaFacebookF className="text-[#1877f2]" /> Facebook
          </motion.button>
        </div>

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
