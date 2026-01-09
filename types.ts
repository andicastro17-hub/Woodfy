
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

export enum CostCategory {
  MATERIAL = 'Material',
  LABOR = 'Mão de obra',
  TRANSPORT = 'Transporte',
  THIRD_PARTY = 'Terceiros'
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
  startDate: string;
  deliveryDate: string;
  valueSold: number;
  estimatedCost: number;
  realCost: number;
  status: ProjectStatus;
  paymentStatus: PaymentStatus;
}

export interface Cost {
  id: string;
  projectId: string;
  category: CostCategory;
  description: string;
  value: number;
  date: string;
  type: CostType;
}

export interface Revenue {
  id: string;
  projectId: string;
  value: number;
  paymentMethod: string;
  date: string;
  status: PaymentStatus;
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
  category: 'MDF' | 'Ferragens' | 'Ferramentas' | 'Serviços' | 'Outros';
  contact: string;
  rating: number;
}

export interface GeneralExpense {
  id: string;
  description: string;
  category: 'Aluguel' | 'Energia' | 'Marketing' | 'Ferramentas' | 'Impostos' | 'Outros';
  value: number;
  dueDate: string;
  status: PaymentStatus;
}

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  totalValue: number;
  items: string;
  paymentMethod: string;
}
