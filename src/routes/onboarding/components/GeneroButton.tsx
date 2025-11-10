import React from "react";

type GeneroButtonProps = {
  children: React.ReactNode;
  variant: "fem" | "masc" | "neutral";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  isSelected: boolean; // <-- 1. Prop 'isSelected' adicionada
};

export default function GeneroButton({
  children,
  variant,
  onClick,
  isSelected,
}: GeneroButtonProps) {
  // 2. Estilos base do botão clicável
  const baseButtonStyles =
    "w-full h-full py-4 bg-linear-to-r hover:opacity-80 active:contrast-125 transition-all cursor-pointer focus:outline-none";

  // --- 3. Lida com o caso especial da borda gradiente PRIMEIRO ---
  if (variant === "neutral" && isSelected) {
    return (
      // Este 'div' wrapper aplica o gradiente como "borda"
      // As cores vêm das suas classes 'fem' (border-[#ffafc1]) e 'masc' (border-[#a8f3dc])
      <div className="rounded-4xl p-px bg-linear-to-r from-[#ffafc1] to-[#a8f3dc]">
        <button
          className={`${baseButtonStyles} from-[#d5f3f6] to-[#f8e0e5] bg-linear-90 rounded-[calc(var(--radius-4xl)-2px)]`}
          onClick={onClick}
        >
          {children}
        </button>
      </div>
    );
  }

  // --- 4. Lida com todos os outros botões (masc, fem, e neutral não selecionado) ---

  // Mapeia variantes para seus estilos
  const variantStyles = {
    masc: {
      bg: "from-[#d5f3f6]  to-[#8beaff]",
      selectedBorder: "border-[#a0f3fc] ",
    },
    fem: {
      bg: "from-[#f8e0e5] to-[#ebc2d4] ",
      selectedBorder: "border-[#ffafc1] ",
    },
    neutral: {
      bg: "from-[#d5f3f6] to-[#f8e0e5] ",
      selectedBorder: "border-gray-700 ", // (Fallback, não deve ser atingido se 'isSelected' for false)
    },
  };

  const styles = variantStyles[variant];

  // Determina a borda (selecionada ou padrão)
  const borderStyle = isSelected ? styles.selectedBorder : "border-gray-700";

  return (
    <button
      className={`${baseButtonStyles} ${styles.bg} ${borderStyle} border rounded-4xl`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
