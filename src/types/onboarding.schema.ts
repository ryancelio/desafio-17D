import { z } from "zod";

// --- Tipos Base (Enums e Sets) ---
// Estes correspondem aos seus tipos SQL

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

// --- Schemas das Etapas (Definem a FORMA dos dados) ---
// Note que eles permitem os valores do 'initialState' (ex: "" ou 0)

export const personalSchema = z.object({
  nome: z.string(),
  data_nascimento: z.string(), // O <input type="date"> usa string YYYY-MM-DD
  genero: generoSchema.or(z.literal("")), // Permite "" ou o enum
  altura_cm: z.number().int().min(0), // Permite 0
});

export const goalsSchema = z.object({
  objetivo_atual: objetivoSchema.or(z.literal("")),
  nivel_atividade: nivelAtividadeSchema.or(z.literal("")),
  dias_treino: z.array(diaSemanaSchema),
});

export const measurementsSchema = z.object({
  peso_kg: z.string(),
  cintura_cm: z.string(),
  quadril_cm: z.string(),
  braco_cm: z.string(),
  coxa_cm: z.string(),
});

export const preferenceSchema = z.object({
  id: z.uuid(),
  tipo_restricao: tipoRestricaoSchema,
  valor: z.string(),
});

// --- Schema Principal do Estado ---
export const onboardingStateSchema = z.object({
  personal: personalSchema,
  goals: goalsSchema,
  measurements: measurementsSchema,
  preferences: z.array(preferenceSchema),
});

const minDate = new Date("1900-01-01");
const maxDate = new Date(); // Data de hoje

// Validação para Step 1
export const step1PersonalValidationSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres."),

  // Verifica se a string é uma data válida no formato YYYY-MM-DD
  data_nascimento: z
    // 3a. Primeiro, garante que é uma string não vazia
    .string()
    .min(1, "Selecione uma data de nascimento.")
    // 3b. Tenta converter a string para um objeto Date
    .pipe(
      z.coerce.date({
        error: "Selecione uma data de nascimento válida.",
      })
    )
    // 3c. Valida o intervalo do objeto Date
    .pipe(
      z
        .date()
        .min(minDate, { message: "Data inválida (anterior a 1900)." })
        .max(maxDate, { message: "Data de nascimento não pode ser no futuro." })
    ),
  // NÃO permite "" (string vazia)
  genero: z.enum(["masculino", "feminino", "outro"], {
    message: "Selecione um gênero.",
  }),

  // Mantemos 'altura_cm' aqui para o formato corresponder,
  // mas não aplicamos regras (já que não está neste formulário)
  altura_cm: z.number(),
});

export const step2GoalsValidationSchema = z.object({
  // Não pode ser ""
  objetivo_atual: z.enum(["perder_peso", "definir", "ganhar_massa"], {
    message: "Selecione um objetivo.",
  }),

  // Não pode ser "" (o seu 'initialState' é "moderado", então isso funciona)
  nivel_atividade: z.enum(
    ["sedentario", "leve", "moderado", "ativo", "muito_ativo"],
    {
      message: "Selecione um nível de atividade.",
    }
  ),

  // O array de dias não pode estar vazio
  dias_treino: z
    .array(diaSemanaSchema)
    .min(1, "Selecione pelo menos um dia de treino."),
});
const optionalNumericString = z
  // 'preprocess' limpa o dado ANTES da validação.
  .preprocess(
    // 1. Se o valor for uma string vazia ou só espaços, transforme-o em 'undefined'.
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    // 2. Agora, o 'z.coerce' recebe a string original ou 'undefined'.
    z.coerce
      .number({ error: "Deve ser um número." })
      .positive("Deve ser maior que 0.")
      .optional() // 3. O '.optional()' permite que 'undefined' passe sem erros.
  );
// --- FIM DA CORREÇÃO ---

// 2. O schema de validação principal do Step 3
export const step3MeasurementValidationSchema = z.object({
  // 'peso_kg' é obrigatório
  peso_kg: z
    .string()
    .min(1, "Peso é obrigatório.") // Não pode ser ""
    .pipe(
      z.preprocess(
        (val) =>
          typeof val === "string" && val.trim() === "" ? undefined : val,

        z.coerce
          .number({ error: "Peso deve ser um número." })
          .positive("Peso deve ser maior que 0.")
      )
    ),

  // Campos opcionais usam o schema reutilizável
  cintura_cm: optionalNumericString,
  quadril_cm: optionalNumericString,
  braco_cm: optionalNumericString,
  coxa_cm: optionalNumericString,
});
// Define as regras para CADA item dentro do array
const preferenceItemSchema = z.object({
  id: z.uuid(),
  tipo_restricao: tipoRestricaoSchema,
  valor: z.string().trim().min(1, "O valor não pode ser vazio."),
});

// O schema do step é um ARRAY que usa o schema do item
// (Um array vazio [] é válido)
export const step4PreferencesValidationSchema = z.array(preferenceItemSchema);

// --- Tipos Inferidos (Substituem seu antigo onboarding.ts) ---

export type IPersonalData = z.infer<typeof personalSchema>;
export type IGoalsData = z.infer<typeof goalsSchema>;
export type IMeasurementsData = z.infer<typeof measurementsSchema>;
export type IPreference = z.infer<typeof preferenceSchema>;
export type OnboardingState = z.infer<typeof onboardingStateSchema>;

// Re-exporta os tipos de enum para uso fácil
export type Genero = z.infer<typeof generoSchema>;
export type Objetivo = z.infer<typeof objetivoSchema>;
export type NivelAtividade = z.infer<typeof nivelAtividadeSchema>;
export type DiaSemana = z.infer<typeof diaSemanaSchema>;
export type TipoRestricao = z.infer<typeof tipoRestricaoSchema>;
