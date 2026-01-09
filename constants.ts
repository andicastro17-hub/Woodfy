
import { ProjectStatus, PaymentStatus, Project, CostCategory, CostType, Cost, Revenue, Customer, Supplier, GeneralExpense, Sale } from './types';

export const FURNITURE_TYPES = [
  'Cozinha', 'Quarto', 'Banheiro', 'Sala', 'Escritório', 'Sob Medida', 'Outro'
];

export const PAYMENT_METHODS = [
  'PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 'Dinheiro', 'Boleto'
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cust1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-8888', address: 'Rua das Flores, 123', totalSpent: 15000, lastOrder: '2024-02-15' },
  { id: 'cust2', name: 'Maria Oliveira', email: 'maria@email.com', phone: '(11) 97777-6666', address: 'Av. Paulista, 1500', totalSpent: 8000, lastOrder: '2024-03-01' }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'Madeiras Brasil', category: 'MDF', contact: 'contato@madeiras.com', rating: 5 },
  { id: 'sup2', name: 'Ferragens Pro', category: 'Ferragens', contact: 'vendas@ferragens.com', rating: 4 }
];

export const INITIAL_EXPENSES: GeneralExpense[] = [
  { id: 'exp1', description: 'Aluguel Galpão', category: 'Aluguel', value: 2500, dueDate: '2024-05-10', status: PaymentStatus.PENDING },
  { id: 'exp2', description: 'Energia Elétrica', category: 'Energia', value: 450, dueDate: '2024-05-05', status: PaymentStatus.PAID }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    code: 'PROJ-001',
    clientId: 'cust1',
    clientName: 'João Silva',
    type: 'Cozinha',
    startDate: '2024-01-10',
    deliveryDate: '2024-02-15',
    valueSold: 15000,
    estimatedCost: 8000,
    realCost: 8500,
    status: ProjectStatus.FINISHED,
    paymentStatus: PaymentStatus.PAID
  }
];

export const INITIAL_COSTS: Cost[] = [
  { id: 'c1', projectId: '1', category: CostCategory.MATERIAL, description: 'MDF Branco', value: 4500, date: '2024-01-15', type: CostType.VARIABLE }
];

export const INITIAL_REVENUES: Revenue[] = [
  { id: 'r1', projectId: '1', value: 15000, paymentMethod: 'PIX', date: '2024-02-16', status: PaymentStatus.PAID }
];
