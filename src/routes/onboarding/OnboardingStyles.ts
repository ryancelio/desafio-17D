import styled, { css } from "styled-components"; // 👈 1. Importar o 'css'

// --- Cores Pastel ---
const pinkPastel = "#FCC3D2";
const mintPastel = "#A8F3DC";
const textDark = "#4A5568";
const textLight = "#718096";
const bgWhite = "rgba(255, 255, 255, 0.9)";
// const bgDark = "rgba(42, 50, 66, 0.9)";
const borderColor = "rgba(255, 255, 255, 0.4)";

// --- Layout Principal ---
export const LayoutWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, ${pinkPastel} 0%, ${mintPastel} 100%);
`;

export const FormContainer = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 2.5rem 2rem;
  background: ${bgWhite};
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid ${borderColor};
  overflow: hidden;

  @media (max-width: 640px) {
    padding: 2rem 1.5rem;
  }
`;

// --- Barra de Progresso ---
export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 2rem;

  .progress-fill {
    height: 100%;
    background: linear-gradient(to right, ${pinkPastel}, ${mintPastel});
    border-radius: 4px;
  }
`;

// --- Navegação ---
export const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
`;

const BaseButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const NextButton = styled(BaseButton)`
  background: linear-gradient(to right, ${pinkPastel}, #bdeee2);
  color: ${textDark};
  box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.1);

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.12);
  }
`;

export const PrevButton = styled(BaseButton)`
  background: transparent;
  color: ${textLight};

  &:not(:disabled):hover {
    background: #f1f5f9;
  }
`;

// --- Elementos de Formulário ---
export const StepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${textDark};
  text-align: center;
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: ${textLight};
  text-align: center;
  margin-top: -1rem;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${textDark};
  margin-bottom: 0.5rem;
`;

//
// ⬇️ --- SEÇÃO CORRIGIDA --- ⬇️
//

// 2. Criamos um 'css' helper com os estilos base
const baseFormElementStyles = css`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #fff;
  color: ${textDark};
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: ${mintPastel};
    box-shadow: 0 0 0 3px rgba(168, 243, 220, 0.5);
  }
`;

// 3. Aplicamos os estilos base ao Input
export const Input = styled.input`
  ${baseFormElementStyles}
`;

// 4. Aplicamos os estilos base ao Select e adicionamos a estilização da seta
export const Select = styled.select`
  ${baseFormElementStyles}

  // Melhora a UX removendo a seta padrão e adicionando uma customizada
  appearance: none;
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%23${textLight.substring(
    1
  )}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 10 13 14 9"%3e%3c/polyline%3e%3c/svg%3e');
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  padding-right: 2.5rem; // Espaço para a seta
`;

// ⬆️ --- FIM DA SEÇÃO CORRIGIDA --- ⬆️
//

// --- Estilos para Etapa 4 (Dinâmica) ---
export const PreferenceItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: flex-end;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;

    ${FieldGroup} {
      width: 100%;
    }
  }
`;

export const AddButton = styled(PrevButton)`
  color: ${pinkPastel};
  font-weight: 700;
  text-align: center;
  justify-content: center;
  width: 100%;

  &:not(:disabled):hover {
    background: rgba(252, 195, 210, 0.1);
  }
`;

export const RemoveButton = styled.button`
  height: 48px;
  width: 48px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: ${textLight};
  font-size: 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fffbeb;
    border-color: #f87171;
    color: #f87171;
  }

  @media (max-width: 640px) {
    width: 100%;
    height: 40px;
    font-size: 1rem;
  }
`;
// ... (todos os estilos anteriores: LayoutWrapper, FormContainer, Input, Select, etc.)

// --- ESTILOS ADICIONAIS PARA A ETAPA 2 ---

export const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${textDark};
  margin-top: 1rem;
  margin-bottom: -0.5rem;
`;

export const CardGrid = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$columns || 2}, 1fr);
  gap: 1rem;

  @media (max-width: 640px) {
    /* Força 1 coluna em mobile para os objetivos */
    grid-template-columns: 1fr;
  }

  ${(props) =>
    props.$columns === 3 &&
    css`
      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    `}

  ${(props) =>
    props.$columns === 1 &&
    css`
      grid-template-columns: 1fr;
    `}
`;

export const OptionCard = styled.div<{ $isActive: boolean }>`
  padding: 1.25rem;
  border-radius: 16px;
  border: 2px solid;
  border-color: ${(props) => (props.$isActive ? mintPastel : "#E2E8F0")};
  background: ${(props) =>
    props.$isActive ? `rgba(168, 243, 220, 0.1)` : "#FFF"};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: ${(props) =>
    props.$isActive ? `0 0 0 3px rgba(168, 243, 220, 0.5)` : "none"};

  &:hover {
    border-color: ${(props) => (props.$isActive ? mintPastel : "#CBD5E1")};
  }
`;

export const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${textDark};
  margin: 0;
`;

export const CardDescription = styled.p`
  font-size: 0.875rem;
  color: ${textLight};
  margin: 0.25rem 0 0 0;
`;

export const DaySelectorContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
`;

export const DayToggle = styled.button<{ $isActive: boolean }>`
  height: 48px;
  width: 48px;
  border-radius: 50%; // Círculo
  border: 2px solid;
  border-color: ${(props) => (props.$isActive ? pinkPastel : "#E2E8F0")};
  background: ${(props) => (props.$isActive ? pinkPastel : "#FFF")};
  color: ${(props) => (props.$isActive ? "white" : textDark)};
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: ${(props) => (props.$isActive ? pinkPastel : "#CBD5E1")};
  }

  @media (max-width: 640px) {
    height: 40px;
    width: 40px;
    font-size: 0.875rem;
  }
`;
