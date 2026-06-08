export type CategoriaContrato = 'SaaS' | 'Infra' | 'Suporte' | 'Assinatura de IA';
export type CriticidadeContrato = 'Crítica' | 'Alta' | 'Média' | 'Baixa';
export type StatusContrato = 'Ativo' | 'Próximo do Vencimento' | 'Expirado';

export interface Installment {
  id: string;         // Identificador da parcela (Ex: PARC-01)
  dueDate: string;    // Data de vencimento da parcela (YYYY-MM-DD)
  value: number;      // Valor da parcela (R$)
  status: 'Em aberto' | 'Paga' | 'Próxima ao Vencimento' | 'Atrasada';
}

export interface Contract {
  id: string; // ID do Contrato (e.g., CONTRATO-2026-001)
  name: string; // Nome do Serviço
  provider: string; // Provedor
  category: CategoriaContrato; // Categoria
  startDate: string; // Data de Início (YYYY-MM-DD)
  endDate: string; // Data de Vencimento (YYYY-MM-DD)
  status: StatusContrato; // Status calculated or manually set
  monthlyValue: number; // Valor Mensal (R$)
  annualValue: number; // Valor Anual (R$ or conversion)
  currency: string; // Moeda de Cobrança (e.g., BRL, USD)
  licensedSeats: number; // Licenças Contratadas
  activeSeats: number; // Licenças Ativas
  excessLicenseCost: number; // Custo por Licença Excedente (R$)
  sponsor: string; // Dono do Contrato (Sponsor)
  criticality: CriticidadeContrato; // Criticidade
  contractLink: string; // Link para o PDF do Contrato
  sponsorEmail?: string; // E-mail do Dono do Contrato
  adminPanelLink?: string; // Link do Painel de Admin do Sistema
  negotiationNotes: string; // Notas de Negociação
  historicCosts?: { month: string; value: number }[]; // Histórico de custos (últimos meses)
  projectionRenewal?: number; // Proporção de ajuste estimado (%)
  installments?: Installment[]; // Listagem de parcelas / vencimentos de faturamento
  paymentFrequency?: 'Mensal' | 'Integral' | 'Parcelado'; // Frequência do faturamento
  installmentsCount?: number; // Número de parcelas (para Parcelado)
  paymentMethod?: 'Cartão de Crédito' | 'Faturamento'; // Método de pagamento
  cardHolder?: string; // Nome do responsável pelo cartão de crédito usado
  extraMonthlySpent?: number; // Gasto extra / excedente de consumo (ex: tokens de IA) no mês
}

export interface AiInsight {
  contractId: string;
  contractName: string;
  savingsOpportunity: number;
  recommendation: string;
  actionableSteps: string[];
}
