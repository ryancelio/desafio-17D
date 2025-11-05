import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./AuthContext.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import LoginPage from "./routes/LoginPage.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import Dashboard from "./routes/protected/dashboard/Dashboard.tsx";
import SignUpPage from "./routes/SignUpPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
