export default function GeneroButton({
  children,
  variant,
  onClick,
}: {
  children: React.ReactNode;
  variant: "fem" | "masc" | "neutral";
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <button
      className={`border-2 ${
        variant === "masc"
          ? "border-[#a8f3dc] bg-[#d5f3f6]"
          : variant === "fem"
          ? "border-[#ffafc1] bg-[#f8e0e5]"
          : "border-gray-600 bg-gray-300"
      }  rounded-4xl py-4 hover:opacity-80 active:contrast-125 transition-all cursor-pointer`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
