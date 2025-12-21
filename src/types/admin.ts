export interface PendingLead {
  uid: string;
  nome: string;
  email: string;
  telefone?: string;
  criado_em: string;
  tentativas: number;
}
