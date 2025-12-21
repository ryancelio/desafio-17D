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
import { FirebaseError } from "firebase/app";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função auxiliar para processar a sincronização pós-login
  const processLoginSuccess = async (userDisplayName?: string | null) => {
    try {
      // Sincroniza com o backend PHP
      await apiClient.syncUser({
        nome: userDisplayName || email.split("@")[0] || "Usuário",
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Erro na sincronização:", err);
      // Mesmo que o sync falhe, o usuário logou no Firebase.
      // Decisão de negócio: Bloquear ou deixar entrar?
      // Geralmente deixamos entrar e o Dashboard tenta carregar/syncar novamente.
      navigate("/dashboard");
    }
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || password.length < 6) {
      setError("Verifique seus dados.");
      setLoading(false);
      return;
    }

    try {
      // 1. Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Sync Backend
      await processLoginSuccess(userCredential.user.displayName);
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
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
        setError(err.response?.data.error || "Erro de conexão com servidor.");
      } else {
        setError("Ocorreu um erro inesperado.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(providerName: "google" | "facebook") {
    const provider =
      providerName === "google"
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();

    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, provider);
      await processLoginSuccess(result.user.displayName);
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/popup-closed-by-user") {
          setError(null); // Usuário fechou a janela, não é erro crítico
        } else {
          setError(`Erro ao entrar com ${providerName}.`);
        }
      } else {
        setError("Erro inesperado.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#fcc3d2] to-[#a8f3dc] transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80  backdrop-blur-md p-8 rounded-2xl shadow-2xl  border border-white/40"
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
          <h1 className="text-2xl font-semibold text-gray-800 ">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-gray-600  mt-1">
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
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg border border-[#fcc3d2] focus:ring-2 focus:ring-[#ffafc1] focus:outline-none text-gray-800"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 ">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg border border-[#a8f3dc] focus:ring-2 focus:ring-[#8de6c8] focus:outline-none text-gray-800"
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
            onClick={() => handleSocialLogin("google")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg border-gray-300 hover:bg-[#fef3f6]
              cursor-pointer transition-all text-gray-700
              hover:border-[#ffafc1]
              `}
          >
            <FaGoogle className="text-[#ea4335]" /> Google
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={() => handleSocialLogin("facebook")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg border-gray-300 hover:bg-[#f2faff]
              cursor-pointer transition-all text-gray-700
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
