import { Link, useNavigate } from "react-router";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:flex-row px-5 py-10 h-screen w-screen gap-4">
      <div className="grow border border-gray-500 bg-gray-400 text-black text-center items-center rounded-2xl">
        Welcome Video Here
      </div>
      <div className="flex flex-col w-full md:w-1/3 md:border md:h-2/3 md:self-center md:justify-around md:items-center md:rounded-2xl">
        <div className="text-center mb-8 gap-3 flex flex-col">
          <h1 className="font-bold text-3xl">
            Bem-vindo ao <br /> Power Slim
          </h1>
          <p className="text-md text-gray-500">
            Seu app inteligente para acompanhar seu progresso de treino e dietas
          </p>
        </div>
        <div className="w-full md:w-64 h-24 flex flex-col gap-1 text-center px-4">
          <button
            className="bg-[#ffd2f8] active:brightness-105 rounded-2xl py-3 text-lg text-black font-semibold cursor-pointer"
            onClick={() => navigate("/onboard")}
          >
            Começar
          </button>
          <Link to={"/login"}>Já possui uma conta?</Link>
        </div>
      </div>
    </div>
  );
}
