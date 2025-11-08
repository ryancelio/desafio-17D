import { useOnboarding } from "../../../context/OnboardingContext";

export default function Step1_Profile() {
  const { onboardingData, updateOnboardingData } = useOnboarding();

  return (
    <div>
      <label htmlFor="nome">Nome:</label>
      <input
        type="text"
        name="nome"
        id="nome"
        onChange={(e) =>
          updateOnboardingData({
            personal: { ...onboardingData.personal, nome: e.target.value },
          })
        }
        value={onboardingData.personal.nome}
      />
    </div>
  );
}
