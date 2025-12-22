import React from "react";
import { Route } from "react-router";
import OnboardingProvider from "../../context/OnboardingContext";
import RootRedirector from "../../hooks/UserRedirect";
import LoginPage2 from "../LoginPage2";
import OnboardingWizard from "../NEW-Onboarding/OnboardingWizard";
import { Sucesso } from "../NEW-Onboarding/Steps/Sucesso";
import SignUpPage from "../SignUpPage";
import UserCreationRoute from "../UserCreationRoute";

export default function PublicRoutes() {
  return (
    <React.Fragment>
      <Route path="/" element={<RootRedirector />} />
      <Route path="/onboard/sucesso" element={<Sucesso />} />
      <Route
        path="/onboard"
        element={
          <OnboardingProvider>
            <OnboardingWizard />
          </OnboardingProvider>
        }
      />
      <Route
        path="/login"
        element={
          <UserCreationRoute>
            <LoginPage2 />
          </UserCreationRoute>
        }
      />
      <Route
        path="/register"
        element={
          <UserCreationRoute>
            <SignUpPage />
          </UserCreationRoute>
        }
      />
    </React.Fragment>
  );
}
