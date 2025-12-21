import { motion } from "framer-motion";
import { LuTriangleAlert } from "react-icons/lu";
import { Link } from "react-router";

/**
 * Página 404 profissional e responsiva, com foco em mobile-first.
 * Oferece uma mensagem clara e uma ação para o usuário retornar ao início.
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100"
        >
          <LuTriangleAlert className="h-10 w-10 text-red-500" />
        </motion.div>

        <h1 className="mt-6 text-2xl font-bold text-gray-800 md:text-3xl">
          Página Não Encontrada
        </h1>
        <p className="mt-4 text-gray-600">
          Oops! A página que você está procurando não existe ou foi movida.
        </p>

        <Link
          to="/"
          className="mt-8 inline-block w-full rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white shadow-md transition-transform duration-150 hover:bg-indigo-700 active:scale-95 sm:w-auto"
        >
          Voltar para o Início
        </Link>
      </motion.div>
    </div>
  );
}
