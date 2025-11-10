import { useState } from "react";
import { motion } from "framer-motion";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router"; // 👈 ATUALIZADO
import { FaUserPlus } from "react-icons/fa6";
import apiClient, { isApiError } from "../api/apiClient"; // 👈 NOVO

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
      // 1. Cria o usuário no Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);
      // O 'auth.currentUser' agora está definido e o interceptor do axios o pegará

      // 2. 👈 ATUALIZADO: Sincroniza o usuário com o backend MySQL
      // Removemos a lógica do Firestore e chamamos nossa API.
      await apiClient.syncUser({
        nome: email.split("@")[0] || "", // Envia um nome padrão
      });

      // 3. Navega para o dashboard
      navigate("/dashboard");
    } catch (err) {
      // 'any' para capturar o '.code' do Firebase
      console.error(err);

      // 4. 👈 ATUALIZADO: Tratamento de erro aprimorado
      if (isApiError(err)) {
        // Erro vindo do nosso backend PHP
        setError(err.response?.data.error || "Erro de API");
        // @ts-expect-error Firebase Error
      } else if (err.code === "auth/email-already-in-use") {
        // Erro específico do Firebase
        setError("Este e-mail já está em uso.");
      } else {
        // Outro erro
        setError("Erro ao criar conta. Tente novamente.");
      }
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
        className="w-full max-w-md bg-white/80   backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/40 "
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
          <h1 className="text-2xl font-semibold text-gray-800 ">Criar conta</h1>
          <p className="text-sm text-gray-600  mt-1">
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
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg border border-[#fcc3d2] focus:ring-2 focus:ring-[#ffafc1] focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg border border-[#a8f3dc] focus:ring-2 focus:ring-[#8de6c8] focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 ">
              Confirmar Senha
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg border border-[#a8f3dc] focus:ring-2 focus:ring-[#8de6c8] focus:outline-none "
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
          <Link
            to="/login"
            className="text-[#ff7da2] hover:underline font-medium"
          >
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
