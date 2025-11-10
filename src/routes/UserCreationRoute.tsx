import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router";

export default function UserCreationRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { firebaseUser } = useAuth();

  // Usuário ja logado
  if (firebaseUser) {
    return <Navigate to="../dashboard" replace />;
  }
  return children;
}
