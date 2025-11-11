// // src/types/onboarding.ts

// // --- Tipos baseados nos Enums/Sets do SQL ---

// export type Genero = "masculino" | "feminino" | "outro";
// export type Objetivo = "perder_peso" | "definir" | "ganhar_massa";
// export type NivelAtividade =
//   | "sedentario"
//   | "leve"
//   | "moderado"
//   | "ativo"
//   | "muito_ativo";

// export type DiaSemana = "DOM" | "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB";
// export type TipoRestricao =
//   | "alergia"
//   | "intolerancia"
//   | "preferencia"
//   | "limitacao_fisica";

// // --- Interfaces para o Estado do Formulário ---

// // Etapa 1: Informações Pessoais
// export interface IPersonalData {
//   nome: string;
//   data_nascimento: string; // string é ideal para <input type="date">
//   genero: Genero | ""; // Permite estado inicial vazio
//   altura_cm: number;
// }

// // Etapa 2: Objetivos e Rotina
// export interface IGoalsData {
//   objetivo_atual: Objetivo | "";
//   nivel_atividade: NivelAtividade | "";
//   dias_treino: DiaSemana[]; // Usar array para seleção múltipla
// }

// // Etapa 3: Medidas Iniciais
// // Usamos string | '' para campos de formulário que podem estar vazios
// // e serão convertidos para `number | null` no envio.
// export interface IMeasurementsData {
//   peso_kg: string; // Obrigatório, mas pode estar vazio durante a digitação
//   cintura_cm: string;
//   quadril_cm: string;
//   braco_cm: string;
//   coxa_cm: string;
// }

// // Etapa 4: Preferências
// export interface IPreference {
//   tipo_restricao: TipoRestricao;
//   valor: string;
//   id: string;
// }

// // --- Interface Completa do Store (Estado) ---

// export interface OnboardingState {
//   personal: IPersonalData;
//   goals: IGoalsData;
//   measurements: IMeasurementsData;
//   preferences: IPreference[];
// }
