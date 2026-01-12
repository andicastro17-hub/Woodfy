
import { ProjectStatus, PaymentStatus, Project, CostType, Cost, Revenue, Customer, Supplier, GeneralExpense, Budget } from './types';

export const FURNITURE_TYPES = [
  'Cozinha', 'Quarto', 'Banheiro', 'Sala', 'Escritório', 'Sob Medida', 'Venda Direta', 'Outro'
];

export const COST_CATEGORIES: string[] = ['Cozinha', 'Quarto', 'Sala', 'Banheiro', 'Lavabo', 'Closet', 'Hall de entrada', 'Area Social', 'Balcão', 'Mesa', 'Outros'];

export const PAYMENT_METHODS = [
  'PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 'Dinheiro', 'Boleto'
];

export const EXPENSE_CATEGORIES: Array<GeneralExpense['category']> = ['Aluguel', 'Energia', 'Água', 'Internet', 'Telefone', 'Marketing', 'Ferramentas', 'Impostos', 'Salários', 'Contabilidade', 'Frete', 'Descarte de Resíduos', 'Outros'];

export const REVENUE_CATEGORIES: string[] = ['Venda de Resíduos', 'Serviços de Reparo', 'Consultoria', 'Outros'];

export const SUPPLIER_CATEGORIES: Array<Supplier['category']> = ['MDF', 'Ferragens', 'Ferramentas', 'Serviços', 'Vidros', 'Metais', 'Terceirização', 'Usinagem', 'Telefonia', 'Outros'];

export const PREDEFINED_PAYABLE_DESCRIPTIONS: string[] = [
  'Aluguel',
  'Água',
  'Luz',
  'Internet',
  'Contabilidade',
  'Impostos',
  'Salários',
  'Marketing'
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Aluguel': '#3b82f6', // blue-500
  'Energia': '#facc15', // yellow-400
  'Água': '#0ea5e9', // sky-500
  'Internet': '#6366f1', // indigo-500
  'Telefone': '#8b5cf6', // violet-500
  'Marketing': '#ec4899', // pink-500
  'Ferramentas': '#a855f7', // purple-500
  'Impostos': '#ef4444', // red-500
  'Salários': '#f97316', // orange-500
  'Contabilidade': '#84cc16', // lime-500
  'Frete': '#14b8a6', // teal-500
  'Descarte de Resíduos': '#6b7280', // gray-500
  'Custos de Projetos': '#d97706', // amber-600
  'Outros': '#a1a1aa', // zinc-400
};

export const MANAGEMENT_TIPS: string[] = [
  "Fique atento aos custos variáveis (terceiros e transporte). Em marcenarias, eles são os maiores responsáveis por diminuir a margem de lucro real.",
  "Negocie com fornecedores para comprar materiais em maior quantidade e conseguir descontos.",
  "Mantenha um controle rigoroso do seu fluxo de caixa. Saber exatamente quanto dinheiro entra e sai é fundamental.",
  "Ofereça um atendimento ao cliente excepcional. Um cliente satisfeito não só retorna como também indica.",
  "Invista em boas ferramentas e na manutenção do seu maquinário. Isso aumenta a produtividade.",
  "Digitalize sua gestão. Use planilhas ou softwares para controlar projetos, finanças e clientes.",
  "Sempre formalize orçamentos e contratos. Um documento bem detalhado protege tanto você quanto o cliente.",
  "Calcule corretamente o preço de venda dos seus móveis. Leve em conta todos os custos."
];


// --- DADOS DE EXEMPLO ---
const CUST_1_ID = 'cust_1_cs';
const CUST_2_ID = 'cust_2_mc';
const CUST_3_ID = 'cust_3_az';

const PROJ_1_ID = 'proj_1_p001';
const PROJ_2_ID = 'proj_2_p002';
const PROJ_3_ID = 'proj_3_p003';

const BUDGET_1_ID = 'budg_1';
const BUDGET_2_ID = 'budg_2';

const today = new Date();
const oneMonthAgo = new Date(new Date().setMonth(today.getMonth() - 1));
const twoWeeksAgo = new Date(new Date().setDate(today.getDate() - 14));
const oneWeekAgo = new Date(new Date().setDate(today.getDate() - 7));
const inTwoWeeks = new Date(new Date().setDate(today.getDate() + 14));

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: CUST_1_ID, name: 'Carlos Silva', email: 'carlos.silva@email.com', phone: '(11) 98765-4321', address: 'Rua das Flores, 123, São Paulo, SP', totalSpent: 15000, lastOrder: formatDate(oneMonthAgo) },
  { id: CUST_2_ID, name: 'Mariana Costa', email: 'mariana.costa@email.com', phone: '(21) 91234-5678', address: 'Av. Copacabana, 456, Rio de Janeiro, RJ', totalSpent: 8500, lastOrder: formatDate(twoWeeksAgo) },
  { id: CUST_3_ID, name: 'Studio de Arquitetura Z', email: 'contato@studioz.com', phone: '(31) 95555-8888', address: 'Rua dos Inconfidentes, 789, Belo Horizonte, MG', totalSpent: 0, lastOrder: formatDate(today) },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'supp_1', name: 'Madeiras & Cia', category: 'MDF', phone: '(11) 2345-6789', email: 'vendas@madeirascia.com', rating: 5 },
  { id: 'supp_2', name: 'Ferragens União', category: 'Ferragens', phone: '(41) 3322-1100', email: 'contato@ferragensuniao.com.br', rating: 4 },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: PROJ_1_ID,
    code: 'P001',
    clientId: CUST_1_ID,
    clientName: 'Carlos Silva',
    type: 'Cozinha',
    description: 'Cozinha completa em MDF Louro Freijó com puxadores em perfil de alumínio preto e dobradiças com amortecimento.',
    startDate: formatDate(oneMonthAgo),
    deliveryDate: formatDate(oneWeekAgo),
    valueSold: 15000,
    estimatedCost: 7000,
    realCost: 7250,
    status: ProjectStatus.FINISHED,
    paymentStatus: PaymentStatus.PAID,
  },
  {
    id: PROJ_2_ID,
    code: 'P002',
    clientId: CUST_2_ID,
    clientName: 'Mariana Costa',
    type: 'Quarto',
    description: 'Guarda-roupa casal com 6 portas de bater, espelho central e maleiro. Acabamento em MDF Branco TX.',
    startDate: formatDate(twoWeeksAgo),
    deliveryDate: formatDate(inTwoWeeks),
    valueSold: 8500,
    estimatedCost: 3800,
    realCost: 0,
    status: ProjectStatus.IN_PROGRESS,
    paymentStatus: PaymentStatus.PENDING,
  },
   {
    id: PROJ_3_ID,
    code: 'P003',
    clientId: CUST_3_ID,
    clientName: 'Studio de Arquitetura Z',
    type: 'Escritório',
    description: 'Mobiliário completo para recepção de escritório de arquitetura, incluindo balcão e painel ripado.',
    startDate: formatDate(today),
    deliveryDate: formatDate(new Date(new Date().setDate(today.getDate() + 30))),
    valueSold: 22000,
    estimatedCost: 10500,
    realCost: 0,
    status: ProjectStatus.IN_PROGRESS,
    paymentStatus: PaymentStatus.PENDING,
  },
];

export const INITIAL_COSTS: Cost[] = [
  { id: 'cost_1', projectId: PROJ_1_ID, category: 'Cozinha', description: 'Chapas de MDF Louro Freijó', value: 4500, date: formatDate(oneMonthAgo), type: CostType.VARIABLE },
  { id: 'cost_2', projectId: PROJ_1_ID, category: 'Cozinha', description: 'Dobradiças e corrediças', value: 1250, date: formatDate(oneMonthAgo), type: CostType.VARIABLE },
  { id: 'cost_3', projectId: PROJ_2_ID, category: 'Quarto', description: 'Chapas de MDF Branco TX', value: 2100, date: formatDate(twoWeeksAgo), type: CostType.VARIABLE },
];

export const INITIAL_REVENUES: Revenue[] = [
  { id: 'rev_1', projectId: PROJ_1_ID, value: 7500, paymentMethod: 'PIX', date: formatDate(oneMonthAgo), status: PaymentStatus.PAID, description: "Entrada P001" },
  { id: 'rev_2', projectId: PROJ_1_ID, value: 7500, paymentMethod: 'Transferência', date: formatDate(oneWeekAgo), status: PaymentStatus.PAID, description: "Entrega P001" },
  { id: 'rev_3', projectId: PROJ_2_ID, value: 4250, paymentMethod: 'Cartão de Crédito', date: formatDate(twoWeeksAgo), status: PaymentStatus.PAID, description: "Entrada P002" },
  { id: 'rev_4', projectId: PROJ_2_ID, value: 4250, paymentMethod: 'Boleto', date: formatDate(inTwoWeeks), status: PaymentStatus.PENDING, description: "Entrega P002" },
];

export const INITIAL_EXPENSES: GeneralExpense[] = [
  { id: 'exp_1', description: 'Aluguel do Galpão', category: 'Aluguel', value: 2500, dueDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 5)), status: PaymentStatus.PAID, paymentMethod: 'Transferência' },
  { id: 'exp_2', description: 'Conta de Energia Elétrica', category: 'Energia', value: 450.70, dueDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 15)), status: PaymentStatus.PAID, paymentMethod: 'Boleto' },
  { id: 'exp_3', description: 'Plano de Internet Fibra', category: 'Internet', value: 129.90, dueDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 10)), status: PaymentStatus.PENDING },
];

export const INITIAL_BUDGETS: Budget[] = [
    {
        id: BUDGET_1_ID,
        customerId: CUST_1_ID,
        customerName: 'Carlos Silva',
        date: formatDate(new Date(new Date(oneMonthAgo).setDate(oneMonthAgo.getDate() - 2))),
        items: [
            { id: 'bi1', description: 'MDF Louro Freijó', quantity: 10, unitPrice: 450, totalPrice: 4500 },
            { id: 'bi2', description: 'Ferragens (dobradiças, corrediças)', quantity: 1, unitPrice: 1250, totalPrice: 1250 },
            { id: 'bi3', description: 'Mão de Obra e Terceiros', quantity: 1, unitPrice: 1250, totalPrice: 1250 },
        ],
        totalCost: 7000,
        multiplier: 2.5,
        taxes: 6,
        finalPrice: 15000,
        status: 'Aprovado'
    },
    {
        id: BUDGET_2_ID,
        customerId: CUST_2_ID,
        customerName: 'Mariana Costa',
        date: formatDate(new Date(new Date(twoWeeksAgo).setDate(twoWeeksAgo.getDate() - 1))),
        items: [
            { id: 'bi4', description: 'MDF Branco TX', quantity: 6, unitPrice: 350, totalPrice: 2100 },
            { id: 'bi5', description: 'Espelho 4mm Lapidado', quantity: 1, unitPrice: 500, totalPrice: 500 },
            { id: 'bi6', description: 'Mão de Obra', quantity: 1, unitPrice: 1200, totalPrice: 1200 },
        ],
        totalCost: 3800,
        multiplier: 2.5,
        taxes: 6,
        finalPrice: 8500,
        status: 'Enviado'
    }
];