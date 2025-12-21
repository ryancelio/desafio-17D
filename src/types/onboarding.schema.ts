import { z } from "zod";

// --- Enums do Zod (Alinhados com Models) ---
export const generoSchema = z.enum(["masculino", "feminino", "outro"]);
export const objetivoSchema = z.enum([
  "perder_peso",
  "definir",
  "ganhar_massa",
]);
export const nivelAtividadeSchema = z.enum([
  "sedentario",
  "leve",
  "moderado",
  "ativo",
  "muito_ativo",
]);
export const diaSemanaSchema = z.enum([
  "DOM",
  "SEG",
  "TER",
  "QUA",
  "QUI",
  "SEX",
  "SAB",
]);
export const tipoRestricaoSchema = z.enum([
  "alergia",
  "intolerancia",
  "preferencia",
  "limitacao_fisica",
]);

export const localTreinoSchema = z.enum(["academia", "casa"]);

// --- Schemas de Dados ---

export const personalSchema = z.object({
  nome: z.string().nullable(),
  data_nascimento: z.string().nullable(),
  genero: generoSchema.nullable(),
  altura_cm: z.number().int().min(0).nullable(),
  email: z.email(),
  telefone: z.string().nullable(),
  peso_alvo_kg: z.number().nullable(),
  local_treino: localTreinoSchema.default("casa"),
  dias_treino: z.array(diaSemanaSchema),
  objetivo_atual: objetivoSchema.default("definir"),
  nivel_atividade: nivelAtividadeSchema.default("sedentario"),
});

export const IMeasurementsData = z.object({
  peso_kg: z.number().positive(),
  cintura_cm: z.number().positive().optional(),
  quadril_cm: z.number().positive().optional(),
  braco_cm: z.number().positive().optional(),
  coxa_cm: z.number().positive().optional(),
});

export const preferenceSchema = z.object({
  id: z.string().or(z.number()), // Aceita ID temp (string/uuid) ou do banco (number)
  tipo_restricao: tipoRestricaoSchema,
  valor: z.string(),
});

export const selectedPlanSchema = z.object({
  plan_id: z.string(),
  title: z.string(),
  price: z.number(),
  planType: z.enum(["monthly", "annual"]),
});

// --- Schema Principal ---
export const onboardingStateSchema = z.object({
  personal: personalSchema,
  measurements: IMeasurementsData,
  preferences: z.array(preferenceSchema),
  selectedPlan: selectedPlanSchema.nullable(),
  fotosProgresso: z.array(z.instanceof(File)).optional(),
  password: z.string().min(6),
});

export type OnboardingState = z.infer<typeof onboardingStateSchema>;
