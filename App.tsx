
import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  CalendarDays, 
  CircleDollarSign, 
  Users, 
  Settings, 
  ChevronDown, 
  Bell, 
  UserCircle,
  Menu,
  X,
  Truck,
  Building2,
  Contact2,
  Globe,
  FileText,
  LogOut,
  Camera,
  Upload,
  User as UserIcon,
  ChevronLeft
} from 'lucide-react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, updatePassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import DashboardModule from './components/DashboardModule';
import CommercialModule from './pages/Commercial/CommercialModule';
import FinanceModule from './pages/Finance/FinanceModule';
import ProgrammingModule from './pages/Programming/ProgrammingModule';
import ClientsModule from './pages/Clients/ClientsModule';
import DriversModule from './pages/Programming/DriversModule';
import SettingsModule from './pages/Settings/SettingsModule';
import UsersModule from './pages/Users/UsersModule';
import CteModule from './pages/CTE/CteModule';
import CteEmissionModule from './pages/CTE/CteEmissionModule';
import TransportManagementModule from './pages/TransportManagement/TransportManagementModule';
import PricingModule from './pages/Pricing/PricingModule';
import CommercialDashboard from './pages/Commercial/CommercialDashboard';
import ProgrammerDashboard from './pages/Programming/ProgrammerDashboard';
import FinancialDashboard from './pages/Finance/FinancialDashboard';
import ClientDashboard from './pages/Clients/ClientDashboard';
import Login from './pages/Login/Login';

// --- CONTEXTO MULTI-EMPRESA ---
type CompanyId = 'BD' | 'LOG' | 'GLOBAL';

interface CompanyContextType {
  activeCompany: CompanyId;
  setActiveCompany: (id: CompanyId) => void;
  getCompanyBadge: (id: string | undefined) => React.ReactNode;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) throw new Error('useCompany must be used within a CompanyProvider');
  return context;
};

// --- INTERFACES ATUALIZADAS ---
export enum Module {
  Dashboard = 'Dashboard',
  Comercial = 'Comercial',
  Clientes = 'Clientes',
  Motoristas = 'Motoristas',
  Programacao = 'Programação',
  EmissaoCTE = 'Emissão de CTE',
  Financeiro = 'Financeiro',
  GestaoCTE = 'Gestão de CTE',
  Transportes = 'Gestão de Transportes',
  Usuarios = 'Usuários',
  Precificacao = 'Precificação',
  Configuracoes = 'Configurações'
}

export interface PricingConfig {
  id: string;
  ownerId: 'BD' | 'LOG';
  federalTaxes: number;
  icms: number;
  directCost: number;
  expenses: number;
  minProfit: number;
}

export interface CteRecord {
  id: string;
  loadId?: string;
  cteNumber: string;
  emissionDate: string;
  customer: string;
  origin: string;
  destination: string;
  cteValue: number;
  driverName: string;
  driverCpf: string;
  driverFreight: number;
  advanceValue: number;
  advanceDate: string;
  balanceValue: number;
  balanceDate: string;
  extraValue: number;
  extraReference: string;
  tollValue: number;
  taxesRetained: number;
  hasTaxes?: boolean;
  taxesValue?: number;
  status: 'ATIVO' | 'CANCELADO';
  financeConfirmed: boolean;
  financeRejected?: boolean;
  dueDate?: string;
  isPaid?: boolean;
}

export interface RouteEntry {
  origin: string;
  destination: string;
  date?: string;
  loadId?: string;
  frequency?: 'Sempre' | 'Ocasionalmente';
  type: 'Automático' | 'Manual';
}

export interface Client {
  id: string;
  ownerId: 'BD' | 'LOG' | 'GLOBAL'; // Identificador da empresa dona do registro
  name: string;
  cnpj: string;
  type: string;
  segment: string;
  city: string;
  state: string;
  commercialRep: string;
  status: 'Prospecção' | 'Ativo' | 'Inativo' | 'Ex-cliente' | 'Negociação Travada';
  createdAt?: string;
  lastNegotiation?: string;
  decisionMakers: any[];
  history: any[];
  icmsContributor: 'Sim' | 'Não' | 'Isento';
  stateRegistration?: string;
  taxRegime: 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';
  financeEmail?: string;
  financeEmail2?: string;
  financeContact?: string;
  financePhone?: string;
  financePhone2?: string;
  creditLimit?: number;
  paymentTerms?: string;
}

export interface CommercialGoal {
  id: string;
  userId: string;
  month: string;
  year: string;
  salesGoal: number;
  prospectingGoal: number;
}

export interface CommissionRule {
  id: string;
  role: 'Comercial' | 'Operacional';
  type: 'Comissao_Faturamento' | 'Meta_Extra';
  minRevenue?: number;
  maxRevenue?: number;
  commissionPercentage?: number;
  targetRevenue?: number;
  maxCostPercentage?: number;
  bonusAmount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  status: 'Ativo' | 'Inativo';
  ownerId: 'BD' | 'LOG' | 'GLOBAL';
  customerId?: string;
  photoURL?: string;
  isFirstLogin?: boolean;
}

export interface Driver {
  id: string;
  ownerId: 'BD' | 'LOG';
  name: string;
  type: 'PF' | 'PJ';
  cnpj_cpf: string;
  phone: string;
  vehicleType: string;
  plate: string;
  antt: string;
  rating: number;
  completedTrips: number;
  status: 'Disponível' | 'Em Viagem' | 'Bloqueado';
  historyRoutes: RouteEntry[];
  pix: string;
  city?: string;
  state?: string;
  docsExpired?: boolean;
}

export interface VehicleType {
  id: string;
  name: string;
  capacity: number;
  volume: number;
  active: boolean;
}

export interface RouteConfig {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  time: number;
  toll: number;
  fuel: number;
}

export type LoadStatus = 
  | 'NEGOCIACAO' 
  | 'DOCUMENTACAO' 
  | 'PRONTO_PROGRAMAR' 
  | 'AGUARDANDO PROGRAMAÇÃO' 
  | 'AGUARDANDO EMISSÃO'
  | 'EM TRÂNSITO' 
  | 'ENTREGUE'
  | 'Cancelado'
  | 'PERDIDO';

export interface LoadMessage {
  id: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
}

export interface TrackingUpdate {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface Load {
  id: string;
  ownerId: 'BD' | 'LOG';
  date: string;
  customer: string;
  origin: string;
  destination: string;
  value: number;
  cost: number;
  status: LoadStatus;
  lostReason?: string;
  lostBy?: 'Comercial' | 'Operacional';
  loadType?: 'Fracionada' | 'Dedicada';
  driverId?: string;
  driver?: string;
  plate?: string;
  advance?: number;
  balance?: number;
  vehicleTypeRequired?: string;
  commercialRep?: string;
  assignedProgrammer?: string;
  merchandise?: string;
  weight?: number;
  volume?: number;
  originAddress?: string;
  destinationAddress?: string;
  commercialNotes?: string;
  targetDriverFreight?: number;
  otherCosts?: number;
  taxesRetained?: number;
  hasTaxes?: boolean;
  taxesValue?: number;
  cteNumber?: string;
  cteUrl?: string;
  ciotUrl?: string;
  contractUrl?: string;
  manifestUrl?: string;
  invoiceUrl?: string;
  otherDocsUrl?: string;
  gnreUrl?: string;
  boletoUrl?: string;
  messages?: LoadMessage[];
  trackingHistory?: TrackingUpdate[];
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'BANCO' | 'CAIXA';
  initialBalance: number;
}

export interface DRECategory {
  id: string;
  name: string;
  group: 'RECEITA_BRUTA_COMPETENCIA' | 'RECEITA_BRUTA_CAIXA' | 'TRIBUTOS' | 'CUSTO_DIRETO_PESSOAL' | 'CUSTO_DIRETO_OPERACIONAL' | 'DESPESAS_COMERCIAIS' | 'DESPESAS_ADMINISTRATIVAS' | 'DESPESAS_FINANCEIRAS' | 'INVESTIMENTOS';
}

export interface Transaction {
  id: string;
  ownerId: 'BD' | 'LOG';
  date: string;
  dueDate?: string;
  isRecurring?: boolean;
  desc: string;
  type: 'ENTRADA' | 'SAIDA';
  value: number;
  cat: string;
  bankAccountId?: string;
  cte?: string;
  status: 'PENDENTE' | 'EFETIVADO' | 'CANCELADO';
  clientName?: string;
  carreteiroType?: 'Adiantamento' | 'Saldo' | 'Extra' | 'Tributos sobre frete';
  orderIndex?: number;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState<Module>(Module.Dashboard);
  const [activeCompany, setActiveCompany] = useState<CompanyId>('LOG');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Estados com ownerId definido
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([
    { id: '1', name: 'Carreta LS (Lonada)', capacity: 32, volume: 90, active: true },
    { id: '2', name: 'Truck', capacity: 14, volume: 45, active: true },
  ]);

  const [drivers, setDrivers] = useState<Driver[]>([
    { 
      id: 'D1', ownerId: 'BD', name: 'João Silva (BD)', type: 'PF', cnpj_cpf: '111.222.333-44', phone: '(11) 98888-7777', 
      vehicleType: 'Truck', plate: 'ABC-1234', antt: '12345678', rating: 4.8, completedTrips: 152, 
      status: 'Disponível', city: 'São Paulo', state: 'SP', historyRoutes: [], pix: '11122233344'
    },
    { 
      id: 'D2', ownerId: 'LOG', name: 'Carlos Souza (LOG)', type: 'PJ', cnpj_cpf: '12.345.678/0001-90', phone: '(21) 97777-6666', 
      vehicleType: 'Carreta LS', plate: 'XYZ-5678', antt: '87654321', rating: 4.5, completedTrips: 89, 
      status: 'Disponível', city: 'Curitiba', state: 'PR', historyRoutes: [], pix: 'comercial@transsouza.com'
    }
  ]);

  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [ctes, setCtes] = useState<CteRecord[]>([
    {
      id: 'CTE1', loadId: 'L1', cteNumber: '1001', emissionDate: '2026-03-11', cteValue: 15000.00,
      customer: 'Vale S.A.', origin: 'Belo Horizonte/MG', destination: 'Vitória/ES',
      driverFreight: 10000.00, advanceValue: 6000.00, advanceDate: '2026-03-11',
      balanceValue: 4000.00, balanceDate: '2026-03-15', driverName: 'João Silva',
      driverCpf: '111.222.333-44', extraValue: 0, extraReference: '', tollValue: 250,
      taxesRetained: 150, status: 'ATIVO', financeConfirmed: true, financeRejected: false
    },
    {
      id: 'CTE2', loadId: 'L2', cteNumber: '1002', emissionDate: '2026-03-20', cteValue: 8000.00,
      customer: 'Ambev', origin: 'Agudos/SP', destination: 'Rio de Janeiro/RJ',
      driverFreight: 5500.00, advanceValue: 3000.00, advanceDate: '2026-03-20',
      balanceValue: 2500.00, balanceDate: '2026-03-25', driverName: 'Carlos Souza',
      driverCpf: '555.666.777-88', extraValue: 100, extraReference: 'Descarga', tollValue: 180,
      taxesRetained: 80, status: 'ATIVO', financeConfirmed: false, financeRejected: false
    },
    {
      id: 'CTE3', loadId: 'L5', cteNumber: '1003', emissionDate: '2026-03-21', cteValue: 7500.00,
      customer: 'Ambev', origin: 'Jaguariúna/SP', destination: 'Belo Horizonte/MG',
      driverFreight: 5000.00, advanceValue: 2500.00, advanceDate: '2026-03-21',
      balanceValue: 2500.00, balanceDate: '2026-03-26', driverName: 'Fernando Costa',
      driverCpf: '999.000.111-22', extraValue: 0, extraReference: '', tollValue: 120,
      taxesRetained: 75, status: 'CANCELADO', financeConfirmed: false, financeRejected: false
    }
  ]);

  const [commercialGoals, setCommercialGoals] = useState<CommercialGoal[]>([
    { id: 'G1', userId: 'Ana Beatriz', month: '03', year: '2026', salesGoal: 50000, prospectingGoal: 10 }
  ]);

  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([
    { id: 'CR1', role: 'Comercial', type: 'Comissao_Faturamento', minRevenue: 0, maxRevenue: 50000, commissionPercentage: 2 },
    { id: 'CR2', role: 'Comercial', type: 'Comissao_Faturamento', minRevenue: 50001, maxRevenue: 9999999, commissionPercentage: 3 },
    { id: 'CR3', role: 'Comercial', type: 'Meta_Extra', targetRevenue: 100000, maxCostPercentage: 60, bonusAmount: 1000 },
    { id: 'CR4', role: 'Operacional', type: 'Meta_Extra', maxCostPercentage: 58, bonusAmount: 1500 }
  ]);

  const [pricingConfigs, setPricingConfigs] = useState<PricingConfig[]>([]);
  const [loads, setLoads] = useState<Load[]>([
    { 
      id: 'L1', ownerId: 'BD', date: '2026-03-10', customer: 'Vale S.A.', origin: 'Belo Horizonte/MG', 
      destination: 'Vitória/ES', value: 15000, cost: 10000, status: 'ENTREGUE', 
      loadType: 'Dedicada', vehicleTypeRequired: 'Carreta LS', commercialRep: 'Ana Beatriz',
      assignedProgrammer: 'Marcos Oliveira', merchandise: 'Minério', weight: 32000,
      driverId: 'D1', driver: 'João Silva', plate: 'ABC-1234', advance: 6000, balance: 4000,
      cteNumber: '1001'
    },
    { 
      id: 'L2', ownerId: 'LOG', date: '2026-03-20', customer: 'Ambev', origin: 'Agudos/SP', 
      destination: 'Rio de Janeiro/RJ', value: 8000, cost: 5500, status: 'EM TRÂNSITO', 
      loadType: 'Dedicada', vehicleTypeRequired: 'Sider', commercialRep: 'Ana Beatriz',
      assignedProgrammer: 'Marcos Oliveira', merchandise: 'Bebidas', weight: 25000,
      driverId: 'D2', driver: 'Carlos Souza', plate: 'XYZ-9876', advance: 3000, balance: 2500,
      cteNumber: '1002'
    },
    { 
      id: 'L3', ownerId: 'LOG', date: '2026-03-22', customer: 'Gerdau', origin: 'Ouro Branco/MG', 
      destination: 'São Paulo/SP', value: 12000, cost: 8500, status: 'AGUARDANDO EMISSÃO', 
      loadType: 'Dedicada', vehicleTypeRequired: 'Carreta', commercialRep: 'Marcos Oliveira',
      assignedProgrammer: 'Marcos Oliveira', merchandise: 'Aço', weight: 30000,
      driverId: 'D3', driver: 'Roberto Alves', plate: 'DEF-5678', advance: 5000, balance: 3500
    },
    { 
      id: 'L4', ownerId: 'BD', date: '2026-03-23', customer: 'Vale S.A.', origin: 'Mariana/MG', 
      destination: 'Tubarão/ES', value: 16000, cost: 11000, status: 'AGUARDANDO PROGRAMAÇÃO', 
      loadType: 'Dedicada', vehicleTypeRequired: 'Carreta LS', commercialRep: 'Ana Beatriz',
      merchandise: 'Minério', weight: 32000
    },
    { 
      id: 'L5', ownerId: 'LOG', date: '2026-03-21', customer: 'Ambev', origin: 'Jaguariúna/SP', 
      destination: 'Belo Horizonte/MG', value: 7500, cost: 5000, status: 'Cancelado', 
      loadType: 'Dedicada', vehicleTypeRequired: 'Sider', commercialRep: 'Ana Beatriz',
      assignedProgrammer: 'Marcos Oliveira', merchandise: 'Bebidas', weight: 24000,
      driverId: 'D4', driver: 'Fernando Costa', plate: 'GHI-9012', advance: 2500, balance: 2500,
      cteNumber: '1003'
    },
    { 
      id: 'L6', ownerId: 'BD', date: '2026-03-24', customer: 'Vale S.A.', origin: 'Nova Lima/MG', 
      destination: 'Rio de Janeiro/RJ', value: 18000, cost: 12000, status: 'EM TRÂNSITO', 
      loadType: 'Dedicada', vehicleTypeRequired: 'Carreta LS', commercialRep: 'Ana Beatriz',
      assignedProgrammer: 'Marcos Oliveira', merchandise: 'Minério', weight: 32000,
      driverId: 'D5', driver: 'Antônio Carlos', plate: 'JKL-3456', advance: 7000, balance: 5000,
      cteNumber: '1004'
    },
    { 
      id: 'L7', ownerId: 'BD', date: '2026-03-23', customer: 'Vale S.A.', origin: 'Brumadinho/MG', 
      destination: 'Santos/SP', value: 22000, cost: 15000, status: 'AGUARDANDO EMISSÃO', 
      loadType: 'Dedicada', vehicleTypeRequired: 'Carreta LS', commercialRep: 'Ana Beatriz',
      assignedProgrammer: 'Marcos Oliveira', merchandise: 'Minério', weight: 32000,
      driverId: 'D6', driver: 'Paulo Mendes', plate: 'MNO-7890', advance: 8000, balance: 7000
    },
    { 
      id: 'L8', ownerId: 'LOG', date: '2026-03-18', customer: 'Ambev', origin: 'Jacareí/SP', 
      destination: 'Curitiba/PR', value: 9500, cost: 6500, status: 'ENTREGUE', 
      loadType: 'Dedicada', vehicleTypeRequired: 'Sider', commercialRep: 'Ana Beatriz',
      assignedProgrammer: 'Marcos Oliveira', merchandise: 'Bebidas', weight: 26000,
      driverId: 'D7', driver: 'Ricardo Silva', plate: 'PQR-1234', advance: 3500, balance: 3000,
      cteNumber: '1005'
    },
    { 
      id: 'L9', ownerId: 'BD', date: '2026-03-15', customer: 'Vale S.A.', origin: 'Itabira/MG', 
      destination: 'Vitória/ES', value: 14500, cost: 9500, status: 'ENTREGUE', 
      loadType: 'Dedicada', vehicleTypeRequired: 'Carreta LS', commercialRep: 'Ana Beatriz',
      assignedProgrammer: 'Marcos Oliveira', merchandise: 'Minério', weight: 32000,
      driverId: 'D8', driver: 'Luiz Fernando', plate: 'STU-5678', advance: 5000, balance: 4500,
      cteNumber: '1006'
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    // Load 1 (Fully realized)
    { id: 'T1', ownerId: 'BD', date: '2026-03-11', desc: 'Adiantamento - João Silva (Carga #L1)', type: 'SAIDA', value: 6000, cat: '5', bankAccountId: '1', cte: '1001', status: 'EFETIVADO', clientName: 'Vale S.A.', carreteiroType: 'Adiantamento' },
    { id: 'T2', ownerId: 'BD', date: '2026-03-15', desc: 'Saldo - João Silva (Carga #L1)', type: 'SAIDA', value: 4000, cat: '5', bankAccountId: '1', cte: '1001', status: 'EFETIVADO', clientName: 'Vale S.A.', carreteiroType: 'Saldo' },
    { id: 'T3', ownerId: 'BD', date: '2026-03-18', desc: 'Recebimento Frete CTE 1001', type: 'ENTRADA', value: 15000, cat: '1', bankAccountId: '1', cte: '1001', status: 'EFETIVADO', clientName: 'Vale S.A.' },
    
    // Load 2 (In Transit - Advance paid, Balance pending)
    { id: 'T4', ownerId: 'LOG', date: '2026-03-20', desc: 'Adiantamento - Carlos Souza (Carga #L2)', type: 'SAIDA', value: 3000, cat: '5', bankAccountId: '2', cte: '1002', status: 'EFETIVADO', clientName: 'Ambev', carreteiroType: 'Adiantamento' },
    { id: 'T5', ownerId: 'LOG', date: '2026-03-25', desc: 'Saldo - Carlos Souza (Carga #L2)', type: 'SAIDA', value: 2500, cat: '5', bankAccountId: '2', cte: '1002', status: 'PENDENTE', clientName: 'Ambev', carreteiroType: 'Saldo' },
    { id: 'T6', ownerId: 'LOG', date: '2026-03-20', desc: 'Extra - Descarga (Carga #L2)', type: 'SAIDA', value: 100, cat: '5', bankAccountId: '2', cte: '1002', status: 'PENDENTE', clientName: 'Ambev', carreteiroType: 'Extra' },
    { id: 'T7', ownerId: 'LOG', date: '2026-04-05', desc: 'Recebimento Frete CTE 1002', type: 'ENTRADA', value: 8000, cat: '1', bankAccountId: '2', cte: '1002', status: 'PENDENTE', clientName: 'Ambev' },

    // Load 5 (Cancelled CTE - pending orders should show as cancelled in UI)
    { id: 'T8', ownerId: 'LOG', date: '2026-03-21', desc: 'Adiantamento - Fernando Costa (Carga #L5)', type: 'SAIDA', value: 2500, cat: '5', bankAccountId: '2', cte: '1003', status: 'PENDENTE', clientName: 'Ambev', carreteiroType: 'Adiantamento' },
    { id: 'T9', ownerId: 'LOG', date: '2026-03-26', desc: 'Saldo - Fernando Costa (Carga #L5)', type: 'SAIDA', value: 2500, cat: '5', bankAccountId: '2', cte: '1003', status: 'PENDENTE', clientName: 'Ambev', carreteiroType: 'Saldo' }
  ]);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    { id: '1', name: 'Itaú - Conta Principal', type: 'BANCO', initialBalance: 150000 },
    { id: '2', name: 'Caixa Interno', type: 'CAIXA', initialBalance: 5000 },
  ]);

  const [routes, setRoutes] = useState<RouteConfig[]>([]);
  const [segments, setSegments] = useState<string[]>(['Agronegócio', 'Indústria', 'Químico e Petroquímico']);

  const [dreCategories, setDreCategories] = useState<DRECategory[]>([
    { id: '1', name: 'Frete', group: 'RECEITA_BRUTA_CAIXA' },
    { id: '2', name: 'PIS', group: 'TRIBUTOS' },
    { id: '3', name: 'COFINS', group: 'TRIBUTOS' },
    { id: '4', name: 'ICMS', group: 'TRIBUTOS' },
    { id: '5', name: 'Carreteiro', group: 'CUSTO_DIRETO_OPERACIONAL' },
    { id: '6', name: 'Combustível', group: 'CUSTO_DIRETO_OPERACIONAL' },
    { id: '7', name: 'Manutenção', group: 'CUSTO_DIRETO_OPERACIONAL' },
    { id: '8', name: 'Despesas Administrativas', group: 'DESPESAS_ADMINISTRATIVAS' },
    { id: '9', name: 'Impostos', group: 'TRIBUTOS' },
    { id: '10', name: 'Operacional', group: 'CUSTO_DIRETO_OPERACIONAL' },
    { id: '11', name: 'Depreciação de Veículos', group: 'DEPRECIACAO' },
    { id: '12', name: 'IRPJ e CSLL', group: 'IMPOSTOS_LUCRO' },
    { id: '13', name: 'Juros e Multas', group: 'RESULTADO_FINANCEIRO' },
    { id: '14', name: 'Receita por Competência', group: 'RECEITA_BRUTA_COMPETENCIA' },
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser?.email);
      if (firebaseUser) {
        try {
          const email = firebaseUser.email?.toLowerCase();
          if (!email) throw new Error("No email found");
          
          console.log("Checking Firestore for user:", email);
          const userDoc = await getDoc(doc(db, 'users', email));
          
          if (userDoc.exists()) {
            console.log("User found in Firestore:", email);
            setCurrentUser(userDoc.data() as User);
            setIsAuthenticated(true);
          } else {
            console.log("User NOT found in Firestore:", email);
            if (email === 'diegociatos@gmail.com') {
              console.log("Creating default admin user in Firestore...");
              const newUser: User = {
                id: email,
                name: firebaseUser.displayName || 'Admin',
                email: email,
                role: 'Administrador',
                status: 'Ativo',
                ownerId: 'GLOBAL'
              };
              await setDoc(doc(db, 'users', email), newUser);
              setCurrentUser(newUser);
              setIsAuthenticated(true);
            } else {
              console.warn("Unauthorized user attempted login:", email);
              await signOut(auth);
              alert(`Usuário não autorizado (${email}). O administrador deve cadastrar seu e-mail no sistema.`);
              setIsAuthenticated(false);
              setCurrentUser(null);
            }
          }
        } catch (error: any) {
          console.error("Error fetching user data:", error);
          alert("Erro ao carregar dados do usuário: " + error.message);
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser?.isFirstLogin) {
      setIsProfileModalOpen(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      console.log("Current user loaded:", currentUser.email, "Role:", currentUser.role);
    }
  }, [currentUser]);

  // Fetch clients from Firestore
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    
    const unsubscribe = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const clientsData: Client[] = [];
      snapshot.forEach((doc) => {
        clientsData.push({ id: doc.id, ...doc.data() } as Client);
      });
      // If empty, set defaults
      if (clientsData.length === 0) {
        const defaultClients: Client[] = [
          { 
            id: 'C1', ownerId: 'BD', name: 'Vale S.A.', cnpj: '33.592.510/0001-54', type: 'Indústria', segment: 'Mineração', 
            city: 'Belo Horizonte', state: 'MG', commercialRep: 'Ana Beatriz', status: 'Ativo', lastNegotiation: '2026-03-01',
            decisionMakers: [], history: [], icmsContributor: 'Sim', taxRegime: 'Lucro Real', creditLimit: 500000, paymentTerms: '30 dias'
          },
          { 
            id: 'C2', ownerId: 'LOG', name: 'Ambev', cnpj: '07.526.557/0001-00', type: 'Indústria', segment: 'Bebidas', 
            city: 'São Paulo', state: 'SP', commercialRep: 'Ana Beatriz', status: 'Ativo', lastNegotiation: '2026-03-10',
            decisionMakers: [], history: [], icmsContributor: 'Sim', taxRegime: 'Lucro Real', creditLimit: 300000, paymentTerms: '15 dias'
          },
          { 
            id: 'C3', ownerId: 'GLOBAL', name: 'Gerdau', cnpj: '33.222.111/0001-99', type: 'Indústria', segment: 'Siderurgia', 
            city: 'Porto Alegre', state: 'RS', commercialRep: 'Marcos Oliveira', status: 'Ativo', lastNegotiation: '2026-03-15',
            decisionMakers: [], history: [], icmsContributor: 'Sim', taxRegime: 'Lucro Real', creditLimit: 800000, paymentTerms: '45 dias'
          }
        ];
        setClients(defaultClients);
        // Save defaults to Firestore
        defaultClients.forEach(c => setDoc(doc(db, 'clients', c.id), c));
      } else {
        setClients(clientsData);
      }
    }, (error) => {
      console.error("Error fetching clients:", error);
    });

    return () => unsubscribe();
  }, [isAuthenticated, currentUser]);

  // Fetch users from Firestore
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    
    // Only admins can read all users, but users can read their own profile.
    // For simplicity, if the user is not an admin, we just set their own profile in the users array.
    if (currentUser.role !== 'Administrador') {
      setUsers([currentUser]);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as User);
      });
      console.log("Users updated from Firestore:", usersData.length, "users found.");
      setUsers(usersData);
    }, (error) => {
      console.error("Error fetching users from Firestore:", error);
      if (error.message.includes('permission-denied')) {
        console.warn("Permission denied while fetching users. This is expected if you are not an admin.");
      } else {
        alert("Erro ao carregar lista de usuários: " + error.message);
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated, currentUser]);

  // Fetch pricingConfigs from Firestore
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    
    const unsubscribe = onSnapshot(collection(db, 'pricingConfigs'), (snapshot) => {
      const configsData: PricingConfig[] = [];
      snapshot.forEach((doc) => {
        configsData.push({ id: doc.id, ...doc.data() } as PricingConfig);
      });
      // If empty, set defaults
      if (configsData.length === 0) {
        setPricingConfigs([
          { id: 'P1', ownerId: 'BD', federalTaxes: 14.33, icms: 12, directCost: 5, expenses: 10, minProfit: 15 },
          { id: 'P2', ownerId: 'LOG', federalTaxes: 14.33, icms: 12, directCost: 5, expenses: 10, minProfit: 15 }
        ]);
      } else {
        setPricingConfigs(configsData);
      }
    }, (error) => {
      console.error("Error fetching pricing configs:", error);
    });

    return () => unsubscribe();
  }, [isAuthenticated, currentUser]);

  // Helper visual para badges de empresa
  const getCompanyBadge = (id: string | undefined) => {
    if (activeCompany !== 'GLOBAL' || !id) return null;
    return (
      <span className={`ml-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${id === 'BD' ? 'bg-amber-100 text-amber-700' : 'bg-bordeaux/10 text-bordeaux'}`}>
        {id}
      </span>
    );
  };

  const companyContextValue = useMemo(() => ({
    activeCompany,
    setActiveCompany,
    getCompanyBadge
  }), [activeCompany]);

  // LÓGICA DE FILTRAGEM GLOBAL
  const filteredLoads = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Cliente') return loads.filter(l => l.customer === currentUser.name);
    return activeCompany === 'GLOBAL' ? loads : loads.filter(l => l.ownerId === activeCompany);
  }, [loads, activeCompany, currentUser]);

  const filteredClients = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Cliente') return clients.filter(c => c.name === currentUser.name);
    return activeCompany === 'GLOBAL' ? clients : clients.filter(c => c.ownerId === activeCompany);
  }, [clients, activeCompany, currentUser]);

  const filteredDrivers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Cliente') return drivers; // Or filter if needed
    return activeCompany === 'GLOBAL' ? drivers : drivers.filter(d => d.ownerId === activeCompany);
  }, [drivers, activeCompany, currentUser]);

  const filteredTransactions = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Cliente') return transactions.filter(t => t.clientName === currentUser.name);
    return activeCompany === 'GLOBAL' ? transactions : transactions.filter(t => t.ownerId === activeCompany);
  }, [transactions, activeCompany, currentUser]);

  const navItems = useMemo(() => {
    if (!currentUser) return [];
    
    const allItems = [
      { id: Module.Dashboard, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
      { id: Module.Comercial, icon: <Briefcase size={20} />, label: 'Comercial' },
      { id: Module.Clientes, icon: <Building2 size={20} />, label: 'Clientes / CRM' },
      { id: Module.Programacao, icon: <CalendarDays size={20} />, label: 'Programação' },
      { id: Module.Motoristas, icon: <Contact2 size={20} />, label: 'Motoristas' },
      { id: Module.EmissaoCTE, icon: <FileText size={20} />, label: 'Emissão de CTE' },
      { id: Module.GestaoCTE, icon: <FileText size={20} />, label: 'Gestão de CTE' },
      { id: Module.Transportes, icon: <Truck size={20} />, label: 'Gestão de Transportes' },
      { id: Module.Financeiro, icon: <CircleDollarSign size={20} />, label: 'Financeiro' },
      { id: Module.Usuarios, icon: <Users size={20} />, label: 'Usuários' },
      { id: Module.Precificacao, icon: <CircleDollarSign size={20} />, label: 'Precificação' },
      { id: Module.Configuracoes, icon: <Settings size={20} />, label: 'Configurações' },
    ];

    const role = currentUser.role;
    // Se for Administrador (ou contiver Administrador no nome), vê tudo sem restrições
    if (role.includes('Administrador')) return allItems;

    // Filtro para outros papéis
    return allItems.filter(item => {
      const isGestor = role.includes('Gestor');
      const isComercial = role.includes('Comercial');
      const isFinanceiro = role.includes('Financeiro');
      const isOperacional = role.includes('Operacional');
      const isCliente = role.includes('Cliente');
      
      switch (item.id) {
        case Module.Dashboard:
          return isComercial || isFinanceiro || isOperacional || isGestor;
        case Module.Comercial:
        case Module.Clientes:
          return isComercial || isFinanceiro || isGestor;
        case Module.Programacao:
        case Module.Motoristas:
        case Module.EmissaoCTE:
        case Module.GestaoCTE:
          return isComercial || isOperacional || isFinanceiro || isGestor;
        case Module.Transportes:
          return isOperacional || isComercial || isCliente || isGestor;
        case Module.Financeiro:
        case Module.Usuarios:
        case Module.Precificacao:
          return isFinanceiro || isGestor;
        case Module.Configuracoes:
          return isGestor;
        default:
          return false;
      }
    });
  }, [currentUser, currentUser?.role]);

  const handleLogout = async () => {
    console.log("Iniciando logout...");
    try {
      setIsUserMenuOpen(false);
      
      // Feedback imediato limpando o estado local
      setIsAuthenticated(false);
      setCurrentUser(null);
      
      // Logout do Firebase
      await signOut(auth);
      
      // Forçamos o recarregamento da página para garantir um estado limpo
      window.location.href = '/';
      console.log("Logout concluído com sucesso.");
    } catch (error) {
      console.error("Erro ao sair:", error);
      // Mesmo com erro, garantimos que o estado local seja limpo
      setIsAuthenticated(false);
      setCurrentUser(null);
      window.location.href = '/';
    }
  };

  const handleUpdateProfile = async (data: { name: string; photoURL?: string; password?: string; isFirstLogin?: boolean }) => {
    if (!currentUser || !auth.currentUser) return;
    try {
      if (data.password) {
        await updatePassword(auth.currentUser, data.password);
      }
      await updateDoc(doc(db, 'users', currentUser.id), data);
      setCurrentUser({ ...currentUser, ...data });
      setIsProfileModalOpen(false);
      if (data.password) {
        alert("Perfil atualizado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Erro ao atualizar perfil: " + error.message);
    }
  };

  const addLoad = (newLoad: Omit<Load, 'id' | 'date' | 'ownerId'>) => {
    const load: Load = {
      ...newLoad,
      id: `${Math.floor(1000 + Math.random() * 9000)}`,
      ownerId: activeCompany === 'GLOBAL' ? 'LOG' : activeCompany, // Assume LOG se estiver em visão global ao criar
      date: new Date().toISOString().split('T')[0],
      status: newLoad.status || 'NEGOCIACAO',
    };
    setLoads([load, ...loads]);
  };

  const updateLoad = (updatedLoad: Load) => setLoads(loads.map(l => l.id === updatedLoad.id ? updatedLoad : l));
  const deleteLoad = (loadId: string) => setLoads(loads.filter(l => l.id !== loadId));

  const addTransaction = (newTransaction: Omit<Transaction, 'id' | 'ownerId'>, specificOwnerId?: 'BD' | 'LOG') => {
    const transaction: Transaction = {
      ...newTransaction,
      id: `${Math.floor(1000 + Math.random() * 9000)}`,
      ownerId: specificOwnerId || (activeCompany === 'GLOBAL' ? 'LOG' : activeCompany),
    };
    setTransactions([transaction, ...transactions]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const renderContent = () => {
    if (!currentUser) return null;
    switch (activeModule) {
      case Module.Dashboard:
        const role = currentUser.role;
        const isCliente = role.includes('Cliente');
        const isComercial = role.includes('Comercial');
        const isOperacional = role.includes('Operacional');
        const isFinanceiro = role.includes('Financeiro');
        const isGestor = role.includes('Gestor');

        if (isGestor) {
          return <DashboardModule unit={activeCompany} loads={filteredLoads} clients={filteredClients} drivers={filteredDrivers} transactions={filteredTransactions} users={users} dreCategories={dreCategories} ctes={ctes} currentUser={currentUser} commissionRules={commissionRules} />;
        }
        if (isCliente) {
          return <ClientDashboard loads={filteredLoads} currentUser={currentUser} goToTransportManagement={() => setActiveModule(Module.Transportes)} />;
        }
        if (isComercial) {
          return <CommercialDashboard loads={filteredLoads} clients={filteredClients} currentUser={currentUser} commercialGoals={commercialGoals} commissionRules={commissionRules} />;
        }
        if (isOperacional) {
          return <ProgrammerDashboard loads={filteredLoads} drivers={filteredDrivers} currentUser={currentUser} goToProgramming={() => setActiveModule(Module.Programacao)} commissionRules={commissionRules} />;
        }
        if (isFinanceiro) {
          return <FinancialDashboard transactions={filteredTransactions} setTransactions={setTransactions} bankAccounts={bankAccounts} currentUser={currentUser} ctes={ctes} />;
        }
        return <DashboardModule unit={activeCompany} loads={filteredLoads} clients={filteredClients} drivers={filteredDrivers} transactions={filteredTransactions} users={users} dreCategories={dreCategories} ctes={ctes} currentUser={currentUser} commissionRules={commissionRules} />;
      case Module.Comercial:
        return <CommercialModule loads={filteredLoads} addLoad={addLoad} updateLoad={updateLoad} deleteLoad={deleteLoad} clients={filteredClients} drivers={filteredDrivers} goToProgramming={() => setActiveModule(Module.Programacao)} />;
      case Module.Clientes:
        return <ClientsModule clients={filteredClients} setClients={setClients} segments={segments} loads={filteredLoads} currentUser={currentUser} />;
      case Module.Motoristas:
        return <DriversModule drivers={filteredDrivers} setDrivers={setDrivers} vehicleTypes={vehicleTypes} currentUser={currentUser} />;
      case Module.Programacao:
        return <ProgrammingModule loads={filteredLoads} updateLoad={updateLoad} drivers={filteredDrivers} addTransaction={addTransaction} currentUser={currentUser} />;
      case Module.Financeiro:
        return <FinanceModule 
          unit={activeCompany} 
          transactions={filteredTransactions} 
          addTransaction={addTransaction} 
          updateTransaction={updateTransaction}
          bankAccounts={bankAccounts}
          dreCategories={dreCategories}
          setDreCategories={setDreCategories}
          clients={clients}
          ctes={ctes}
          setCtes={setCtes}
          currentUser={currentUser}
        />;
      case Module.GestaoCTE:
        return <CteModule ctes={ctes} setCtes={setCtes} currentUser={currentUser} />;
      case Module.Transportes:
        return <TransportManagementModule loads={filteredLoads} updateLoad={updateLoad} currentUser={currentUser} />;
      case Module.EmissaoCTE:
        return <CteEmissionModule loads={filteredLoads} updateLoad={updateLoad} currentUser={currentUser} ctes={ctes} setCtes={setCtes} />;
      case Module.Usuarios:
        return <UsersModule users={users} setUsers={setUsers} clients={clients} />;
      case Module.Precificacao:
        return <PricingModule pricingConfigs={pricingConfigs} setPricingConfigs={setPricingConfigs} />;
      case Module.Configuracoes:
        return <SettingsModule 
          vehicleTypes={vehicleTypes} 
          setVehicleTypes={setVehicleTypes} 
          routes={routes} 
          setRoutes={setRoutes} 
          segments={segments} 
          setSegments={setSegments} 
          bankAccounts={bankAccounts}
          setBankAccounts={setBankAccounts}
          dreCategories={dreCategories}
          setDreCategories={setDreCategories}
          users={users}
          commercialGoals={commercialGoals}
          setCommercialGoals={setCommercialGoals}
          commissionRules={commissionRules}
          setCommissionRules={setCommissionRules}
        />;
      default:
        return <div className="p-10 text-center italic text-gray-400">Módulo em desenvolvimento...</div>;
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-bordeaux border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Login onLogin={async (emailInput, password) => {
      const email = emailInput?.toLowerCase().trim();
      console.log("Attempting login for:", email);
      if (email && password) {
        try {
          console.log("Calling signInWithEmailAndPassword...");
          await signInWithEmailAndPassword(auth, email, password);
          console.log("Login successful for:", email);
        } catch (error: any) {
          console.error("Login error:", error);
          
          const authErrorCodes = [
            'auth/user-not-found',
            'auth/wrong-password',
            'auth/invalid-credential',
            'auth/invalid-email',
            'auth/user-disabled'
          ];

          // Migration logic: if user not in Auth but in Firestore
          if (authErrorCodes.includes(error.code)) {
            console.log("Auth error caught, checking Firestore for migration/mismatch...");
            try {
              const userDoc = await getDoc(doc(db, 'users', email));
              if (userDoc.exists()) {
                const userData = userDoc.data() as any;
                console.log("User found in Firestore, checking password...");
                if (userData.password === password) {
                  // Password matches Firestore! Try to create Auth user.
                  console.log("Password matches Firestore, attempting to create Auth user...");
                  try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    console.log("Auth user created successfully via migration.");
                    return;
                  } catch (createError: any) {
                    console.error("Error creating Auth user during migration:", createError);
                    if (createError.code === 'auth/operation-not-allowed') {
                      alert("O login com E-mail/Senha não está habilitado no Firebase Console. Por favor, habilite-o em Authentication > Sign-in method.");
                      return;
                    }
                    if (createError.code === 'auth/email-already-in-use') {
                      alert("Este usuário já existe no sistema de autenticação, mas a senha fornecida não coincide com a do serviço de autenticação. Tente uma senha anterior ou use o login com Google.");
                      return;
                    }
                    throw createError;
                  }
                } else {
                  console.warn("Password mismatch with Firestore.");
                  alert("E-mail ou senha incorretos (conforme registros do sistema).");
                  return;
                }
              } else {
                console.warn("User not found in Firestore either (ID checked:", email, ")");
              }
            } catch (firestoreError: any) {
              console.error("Migration/Firestore check error:", firestoreError);
              if (firestoreError.code === 'auth/operation-not-allowed') {
                alert("O login com E-mail/Senha não está habilitado no Firebase Console. Por favor, habilite-o em Authentication > Sign-in method.");
                return;
              }
            }
            alert("E-mail ou senha incorretos!");
          } else if (error.code === 'auth/operation-not-allowed') {
            alert("O login com E-mail/Senha não está habilitado no Firebase Console. Por favor, habilite-o em Authentication > Sign-in method.");
          } else if (error.code === 'auth/network-request-failed') {
            alert("Erro de conexão: O sistema não conseguiu se comunicar com o Firebase. Verifique sua internet, desative bloqueadores de anúncios ou tente abrir em uma nova aba.");
          } else {
            alert("Erro ao fazer login: " + error.message);
          }
        }
      }
    }} />;
  }

  return (
    <CompanyContext.Provider value={companyContextValue}>
      <div className="flex h-screen overflow-hidden text-gray-900 w-full" style={{ fontFamily: 'Book Antiqua, serif' }}>
        <aside className={`${isSidebarOpen ? 'w-[260px]' : 'w-20'} h-full bg-bordeaux text-white transition-all duration-300 flex flex-col z-20 shadow-xl shrink-0`}>
          <div className="p-6 flex items-center gap-3 border-b border-white/10 overflow-hidden">
            <div className="bg-white p-2 rounded-lg shrink-0"><Truck size={24} className="text-bordeaux" /></div>
            {isSidebarOpen && <span className="font-bold text-xl tracking-tight uppercase whitespace-nowrap">CIATOS LOG</span>}
          </div>
          <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveModule(item.id)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeModule === item.id ? 'bg-white text-bordeaux shadow-lg scale-[1.02]' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
              >
                <div className="shrink-0">{item.icon}</div>
                {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10 space-y-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-200 hover:text-white transition-all group border border-red-500/20"
              title="Sair do Sistema"
            >
              <div className="shrink-0"><LogOut size={20} className="group-hover:scale-110 transition-transform" /></div>
              {isSidebarOpen && <span className="font-bold whitespace-nowrap">Sair do Sistema</span>}
            </button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
              {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
          <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800 whitespace-nowrap">CIATOS LOG — Gestão</h1>
              <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>
              
              {/* SELETOR DE EMPRESA GLOBAL */}
              {currentUser.role !== 'Cliente' && (
                <div className="relative group">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl cursor-pointer hover:border-bordeaux/30 transition-all">
                    <div className="p-1.5 bg-bordeaux text-white rounded-lg">
                      {activeCompany === 'GLOBAL' ? <Globe size={16}/> : <Building2 size={16}/>}
                    </div>
                    <div className="flex flex-col pr-6">
                      <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1 tracking-widest">Empresa Ativa</span>
                      <span className="text-xs font-black text-bordeaux uppercase leading-none">
                        {activeCompany === 'BD' ? 'BD Transportes' : activeCompany === 'LOG' ? 'Logística Brasil' : 'Visão Global'}
                      </span>
                    </div>
                    <ChevronDown size={16} className="text-gray-300 absolute right-4" />
                  </div>
                  
                  {/* DROPDOWN ELEGANTE */}
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-3xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] py-3 overflow-hidden">
                     <CompanyOption id="BD" name="BD Transportes" cnpj="00.000.000/0001-00" active={activeCompany === 'BD'} onClick={() => setActiveCompany('BD')} />
                     <CompanyOption id="LOG" name="Logística Brasil" cnpj="00.000.000/0001-01" active={activeCompany === 'LOG'} onClick={() => setActiveCompany('LOG')} />
                     <div className="h-[1px] bg-gray-100 my-2 mx-4"></div>
                     <CompanyOption id="GLOBAL" name="Visão Consolidada" cnpj="Holding Group" active={activeCompany === 'GLOBAL'} onClick={() => setActiveCompany('GLOBAL')} icon={<Globe size={18}/>} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><Bell size={20} /><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
              
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
              
              {/* SELETOR DE USUÁRIO (SIMULAÇÃO DE LOGIN) */}
              <div className="relative border-l border-gray-200 pl-4">
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-all border border-transparent hover:border-gray-100"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                  </div>
                  <div className="bg-gray-100 p-1 rounded-full border-2 border-bordeaux/20 shrink-0 w-10 h-10 overflow-hidden flex items-center justify-center">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle size={32} className="text-bordeaux" />
                    )}
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {/* DROPDOWN DE USUÁRIOS */}
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-900">{currentUser.name}</p>
                        <p className="text-xs text-gray-500">{currentUser.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <button 
                          onClick={() => {
                            setIsProfileModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left flex items-center gap-2"
                        >
                          <UserIcon size={16} />
                          Meu Perfil
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogout();
                          }}
                          className="w-full px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left flex items-center gap-3 border border-transparent hover:border-red-100"
                        >
                          <div className="p-1.5 bg-red-100 rounded-lg">
                            <LogOut size={16} />
                          </div>
                          Sair do Sistema
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 flex flex-col w-full h-full overflow-y-auto bg-[#F8F9FA] p-8">{renderContent()}</main>
        </div>

        {/* MODAL DE PERFIL */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-bordeaux text-white">
                <div>
                  <h3 className="text-xl font-bold">Meu Perfil</h3>
                  {currentUser.isFirstLogin && (
                    <p className="text-xs text-white/70 mt-1">Primeiro acesso: atualize seus dados e senha.</p>
                  )}
                </div>
                <button 
                  onClick={() => {
                    if (currentUser.isFirstLogin) {
                      alert("Por favor, atualize seus dados e altere sua senha no seu primeiro acesso.");
                      return;
                    }
                    setIsProfileModalOpen(false);
                  }} 
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newPassword = formData.get('password') as string;
                const updateData: any = {
                  name: formData.get('name') as string,
                  photoURL: formData.get('photoURL') as string
                };
                
                if (newPassword) {
                  updateData.password = newPassword;
                  updateData.isFirstLogin = false;
                } else if (currentUser.isFirstLogin) {
                  alert("Por favor, defina uma nova senha no seu primeiro acesso.");
                  return;
                }

                handleUpdateProfile(updateData);
              }} className="p-8 space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-bordeaux/20 overflow-hidden flex items-center justify-center">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle size={64} className="text-bordeaux" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full cursor-pointer">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 italic text-center">Insira a URL de uma imagem para sua foto de perfil</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Nome Completo</label>
                    <input 
                      name="name"
                      defaultValue={currentUser.name}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">URL da Foto</label>
                    <input 
                      name="photoURL"
                      defaultValue={currentUser.photoURL}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
                      placeholder="https://exemplo.com/foto.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">E-mail (Não alterável)</label>
                    <input 
                      value={currentUser.email}
                      disabled
                      className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Nova Senha</label>
                    <input 
                      name="password"
                      type="password"
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
                      placeholder="Deixe em branco para não alterar"
                      required={currentUser.isFirstLogin}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  {!currentUser.isFirstLogin && (
                    <button 
                      type="button"
                      onClick={() => setIsProfileModalOpen(false)}
                      className="flex-1 py-4 px-6 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      Cancelar
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="flex-1 py-4 px-6 bg-bordeaux text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-bordeaux/20 transition-all"
                  >
                    {currentUser.isFirstLogin ? 'Confirmar Dados e Senha' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CompanyContext.Provider>
  );
};

const CompanyOption = ({ id, name, cnpj, active, onClick, icon }: any) => (
  <button onClick={onClick} className={`w-full px-6 py-4 flex items-center gap-4 text-left transition-all ${active ? 'bg-bordeaux text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
    <div className={`p-2 rounded-xl ${active ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-400'}`}>
      {icon || <Building2 size={18}/>}
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-tight">{name}</p>
      <p className={`text-[10px] font-bold ${active ? 'text-white/60' : 'text-gray-400'}`}>{cnpj}</p>
    </div>
  </button>
);

export default App;
