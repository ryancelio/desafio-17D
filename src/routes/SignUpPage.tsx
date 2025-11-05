import { useState } from "react";
import { motion } from "framer-motion";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router";
import { FaUserPlus } from "react-icons/fa6";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError("Digite um email.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      // Cria o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Cria o documento do usuário no Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        nome: "",
        isActive: false,
        createdAt: serverTimestamp(),
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erro ao criar conta. Tente novamente.");
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
        className="w-full max-w-md bg-white/80 dark:bg-gray-900/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/40 dark:shadow-[#fcc3d2]"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-linear-to-r from-[#ffafc1] to-[#9eeed0] rounded-full shadow-md">
              <FaUserPlus className="text-white text-xl" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Criar conta
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Registre-se para começar sua jornada
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

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg border border-[#fcc3d2] focus:ring-2 focus:ring-[#ffafc1] focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
              className="w-full mt-1 p-2 rounded-lg border border-[#a8f3dc] focus:ring-2 focus:ring-[#8de6c8] focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirmar Senha
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg border border-[#a8f3dc] focus:ring-2 focus:ring-[#8de6c8] focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
            {loading ? "Criando conta..." : "Cadastrar"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem uma conta?{" "}
          <a
            href="/login"
            className="text-[#ff7da2] hover:underline font-medium"
          >
            Entrar
          </a>
        </p>
      </motion.div>
    </div>
  );
}
