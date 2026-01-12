
export enum ProjectStatus {
  IN_PROGRESS = 'Em andamento',
  FINISHED = 'Finalizado',
  DELAYED = 'Atrasado'
}

export enum PaymentStatus {
  PAID = 'Pago',
  PENDING = 'Pendente',
  OVERDUE = 'Atrasado'
}

export enum CostType {
  FIXED = 'Fixo',
  VARIABLE = 'Variável'
}

export interface Project {
  id: string;
  code: string;
  clientId: string;
  clientName: string; // Denormalized for quick access
  type: string;
  description: string;
  startDate: string;
  deliveryDate?: string;
  valueSold: number;
  estimatedCost?: number;
  realCost: number;
  status: ProjectStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
}

export interface Cost {
  id: string;
  category: string;
  description: string;
  value: number;
  date: string;
  type: CostType;
  supplierId?: string;
  paymentMethod?: string;
  notes?: string;
  projectId?: string;
}

export interface Revenue {
  id: string;
  projectId?: string; // Optional: for revenues not linked to projects
  description?: string; // For non-project revenues
  category?: string; // For non-project revenues
  value: number;
  paymentMethod: string;
  date: string;
  status: PaymentStatus;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalSpent: number;
  lastOrder: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: 'MDF' | 'Ferragens' | 'Ferramentas' | 'Serviços' | 'Outros' | 'Vidros' | 'Metais' | 'Terceirização' | 'Usinagem' | 'Telefonia';
  phone: string;
  email: string;
  rating: number;
}

export interface GeneralExpense {
  id: string;
  description: string;
  category: 'Aluguel' | 'Energia' | 'Marketing' | 'Ferramentas' | 'Impostos' | 'Outros' | 'Água' | 'Internet' | 'Telefone' | 'Contabilidade' | 'Salários' | 'Frete' | 'Descarte de Resíduos';
  value: number;
  dueDate: string;
  status: PaymentStatus;
  supplierId?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Budget {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  items: BudgetItem[];
  totalCost: number;
  multiplier: number;
  taxes: number;
  finalPrice: number;
  status: 'Rascunho' | 'Enviado' | 'Aprovado' | 'Rejeitado';
}