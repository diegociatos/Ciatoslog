
import React, { useState, createContext, useContext, useMemo } from 'react';
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
  FileText
} from 'lucide-react';
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
import CommercialDashboard from './pages/Commercial/CommercialDashboard';
import ProgrammerDashboard from './pages/Programming/ProgrammerDashboard';
import FinancialDashboard from './pages/Finance/FinancialDashboard';

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
  Usuarios = 'Usuários',
  Configuracoes = 'Configurações'
}

export interface CteRecord {
  id: string;
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
  status: 'ATIVO' | 'CANCELADO';
  financeConfirmed: boolean;
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
  ownerId: 'BD' | 'LOG'; // Identificador da empresa dona do registro
  name: string;
  cnpj: string;
  type: string;
  segment: string;
  city: string;
  state: string;
  commercialRep: string;
  status: 'Prospecção' | 'Ativo' | 'Inativo' | 'Ex-cliente' | 'Negociação Travada';
  lastNegotiation?: string;
  decisionMakers: any[];
  history: any[];
  icmsContributor: 'Sim' | 'Não' | 'Isento';
  stateRegistration?: string;
  taxRegime: 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';
  financeEmail?: string;
  financeContact?: string;
  financePhone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Operacional' | 'Financeiro' | 'Comercial' | 'Motorista';
  status: 'Ativo' | 'Inativo';
  ownerId: 'BD' | 'LOG' | 'GLOBAL';
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
  | 'Cancelado';

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
  cteNumber?: string;
  cteUrl?: string;
  ciotUrl?: string;
  contractUrl?: string;
  manifestUrl?: string;
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
  desc: string;
  type: 'ENTRADA' | 'SAIDA';
  value: number;
  cat: string;
  bankAccountId?: string;
  cte?: string;
  status: 'PENDENTE' | 'EFETIVADO';
  clientName?: string;
}

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>(Module.Dashboard);
  const [activeCompany, setActiveCompany] = useState<CompanyId>('LOG');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const [clients, setClients] = useState<Client[]>([
    { 
      id: '1', ownerId: 'LOG', name: 'AgroForte S.A.', cnpj: '12.345.678/0001-90', type: 'Indústria', segment: 'Agronegócio', 
      city: 'Cuiabá', state: 'MT', commercialRep: 'Marcos Oliveira', status: 'Ativo', lastNegotiation: '2023-11-01',
      decisionMakers: [], history: [], icmsContributor: 'Sim', taxRegime: 'Lucro Real'
    },
    { 
      id: '2', ownerId: 'BD', name: 'Mineração Vale (BD)', cnpj: '99.888.777/0001-11', type: 'Indústria', segment: 'Químico e Petroquímico', 
      city: 'Belo Horizonte', state: 'MG', commercialRep: 'Ana Beatriz', status: 'Ativo', lastNegotiation: '2023-12-01',
      decisionMakers: [], history: [], icmsContributor: 'Sim', taxRegime: 'Lucro Real'
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Diego Ciatos', email: 'diegociatos@gmail.com', role: 'Administrador', status: 'Ativo', ownerId: 'GLOBAL' },
    { id: '2', name: 'Ana Beatriz', email: 'ana@ciatoslog.com.br', role: 'Comercial', status: 'Ativo', ownerId: 'LOG' },
    { id: '3', name: 'Marcos Oliveira', email: 'marcos@bdtransportes.com.br', role: 'Operacional', status: 'Ativo', ownerId: 'BD' },
    { id: '4', name: 'Carla Financeiro', email: 'carla@ciatoslog.com.br', role: 'Financeiro', status: 'Ativo', ownerId: 'GLOBAL' }
  ]);

  const [ctes, setCtes] = useState<CteRecord[]>([
    {
      id: '1', cteNumber: '3915', emissionDate: '2026-01-02', cteValue: 62500.00,
      customer: 'Mineração Vale', origin: 'Belo Horizonte/MG', destination: 'Vitória/ES',
      driverFreight: 26207.61, advanceValue: 21142.60, advanceDate: '2026-01-05',
      balanceValue: 3857.40, balanceDate: '2026-01-12', driverName: 'Arlindo Dos Santos',
      driverCpf: '848.374.468-68', extraValue: -987.68, extraReference: 'Seguro Balsa', tollValue: 0,
      taxesRetained: 219.93, status: 'ATIVO', financeConfirmed: true
    }
  ]);

  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  const [loads, setLoads] = useState<Load[]>([
    { 
      id: '1024', ownerId: 'LOG', date: '2023-10-25', customer: 'AgroForte S.A.', origin: 'São Paulo/SP', 
      destination: 'Curitiba/PR', value: 4500, cost: 3200, status: 'AGUARDANDO PROGRAMAÇÃO', 
      loadType: 'Dedicada', vehicleTypeRequired: 'Truck', commercialRep: 'Marcos Oliveira'
    },
    { 
      id: '1025', ownerId: 'BD', date: '2023-10-26', customer: 'Mineração Vale (BD)', origin: 'BH/MG', 
      destination: 'Vitória/ES', value: 12800, cost: 9400, status: 'NEGOCIACAO', 
      loadType: 'Dedicada', vehicleTypeRequired: 'Carreta LS'
    },
    { 
      id: '1026', ownerId: 'LOG', date: '2026-03-23', customer: 'Indústrias Brasil', origin: 'Rio de Janeiro/RJ', 
      destination: 'Campinas/SP', value: 6500, cost: 4800, status: 'AGUARDANDO EMISSÃO', 
      loadType: 'Fracionada', vehicleTypeRequired: 'Toco', commercialRep: 'Ana Beatriz',
      driverId: '1', driver: 'João Silva', plate: 'ABC-1234', advance: 2000, balance: 2800,
      assignedProgrammer: 'Operacional'
    },
    { 
      id: '1027', ownerId: 'BD', date: '2026-03-24', customer: 'Comércio Varejista Ltda', origin: 'Belo Horizonte/MG', 
      destination: 'Goiânia/GO', value: 8900, cost: 6200, status: 'AGUARDANDO EMISSÃO', 
      loadType: 'Dedicada', vehicleTypeRequired: 'Carreta', commercialRep: 'Ana Beatriz',
      driverId: '2', driver: 'Pedro Santos', plate: 'XYZ-9876', advance: 3000, balance: 3200,
      assignedProgrammer: 'Comercial'
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', ownerId: 'LOG', date: '2026-11-10', desc: 'Faturamento Cliente AgroForte', type: 'ENTRADA', value: 15200.50, cat: '1', status: 'EFETIVADO', bankAccountId: '1', clientName: 'AgroForte S.A.' },
    { id: '2', ownerId: 'LOG', date: '2026-11-11', desc: 'Abastecimento Frota - Posto Shell', type: 'SAIDA', value: 4850.20, cat: '6', status: 'EFETIVADO', bankAccountId: '1' },
    { id: '3', ownerId: 'LOG', date: '2026-11-11', desc: 'Manutenção Caminhão ABC-1234', type: 'SAIDA', value: 1200.00, cat: '7', status: 'EFETIVADO', bankAccountId: '1' },
    { id: '4', ownerId: 'BD', date: '2026-11-12', desc: 'Faturamento Indústrias Brasil', type: 'ENTRADA', value: 8900.00, cat: '1', status: 'EFETIVADO', bankAccountId: '2', clientName: 'Indústrias Brasil' },
    { id: '5', ownerId: 'BD', date: '2026-11-13', desc: 'Pedágio Rota SP-RJ', type: 'SAIDA', value: 450.80, cat: '10', status: 'EFETIVADO', bankAccountId: '2' },
    { id: '6', ownerId: 'LOG', date: '2026-11-14', desc: 'Pagamento Motoristas Quinzena', type: 'SAIDA', value: 22000.00, cat: '5', status: 'EFETIVADO', bankAccountId: '1' },
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
  ]);

  // LÓGICA DE FILTRAGEM GLOBAL
  const filteredLoads = useMemo(() => 
    activeCompany === 'GLOBAL' ? loads : loads.filter(l => l.ownerId === activeCompany),
    [loads, activeCompany]
  );

  const filteredClients = useMemo(() => 
    activeCompany === 'GLOBAL' ? clients : clients.filter(c => c.ownerId === activeCompany),
    [clients, activeCompany]
  );

  const filteredDrivers = useMemo(() => 
    activeCompany === 'GLOBAL' ? drivers : drivers.filter(d => d.ownerId === activeCompany),
    [drivers, activeCompany]
  );

  const filteredTransactions = useMemo(() => 
    activeCompany === 'GLOBAL' ? transactions : transactions.filter(t => t.ownerId === activeCompany),
    [transactions, activeCompany]
  );

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
    setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const renderContent = () => {
    switch (activeModule) {
      case Module.Dashboard:
        if (currentUser.role === 'Comercial') {
          return <CommercialDashboard loads={filteredLoads} clients={filteredClients} currentUser={currentUser} />;
        }
        if (currentUser.role === 'Operacional') {
          return <ProgrammerDashboard loads={filteredLoads} drivers={filteredDrivers} currentUser={currentUser} goToProgramming={() => setActiveModule(Module.Programacao)} />;
        }
        if (currentUser.role === 'Financeiro') {
          return <FinancialDashboard transactions={filteredTransactions} bankAccounts={bankAccounts} currentUser={currentUser} />;
        }
        return <DashboardModule unit={activeCompany} loads={filteredLoads} />;
      case Module.Comercial:
        return <CommercialModule loads={filteredLoads} addLoad={addLoad} updateLoad={updateLoad} deleteLoad={deleteLoad} clients={filteredClients} drivers={filteredDrivers} goToProgramming={() => setActiveModule(Module.Programacao)} />;
      case Module.Clientes:
        return <ClientsModule clients={filteredClients} setClients={setClients} segments={segments} />;
      case Module.Motoristas:
        return <DriversModule drivers={filteredDrivers} setDrivers={setDrivers} vehicleTypes={vehicleTypes} />;
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
          clients={clients}
        />;
      case Module.GestaoCTE:
        return <CteModule ctes={ctes} setCtes={setCtes} currentUser={currentUser} />;
      case Module.EmissaoCTE:
        return <CteEmissionModule loads={filteredLoads} updateLoad={updateLoad} currentUser={currentUser} />;
      case Module.Usuarios:
        return <UsersModule users={users} setUsers={setUsers} />;
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
        />;
      default:
        return <div className="p-10 text-center italic text-gray-400">Módulo em desenvolvimento...</div>;
    }
  };

  const navItems = [
    { id: Module.Dashboard, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: Module.Comercial, icon: <Briefcase size={20} />, label: 'Comercial' },
    { id: Module.Clientes, icon: <Building2 size={20} />, label: 'Clientes / CRM' },
    { id: Module.Programacao, icon: <CalendarDays size={20} />, label: 'Programação' },
    { id: Module.Motoristas, icon: <Contact2 size={20} />, label: 'Motoristas' },
    { id: Module.EmissaoCTE, icon: <FileText size={20} />, label: 'Emissão de CTE' },
    { id: Module.GestaoCTE, icon: <FileText size={20} />, label: 'Gestão de CTE' },
    { id: Module.Financeiro, icon: <CircleDollarSign size={20} />, label: 'Financeiro' },
    { id: Module.Usuarios, icon: <Users size={20} />, label: 'Usuários' },
    { id: Module.Configuracoes, icon: <Settings size={20} />, label: 'Configurações' },
  ].filter(item => {
    if (item.id === Module.Financeiro) return ['Administrador', 'Financeiro'].includes(currentUser.role);
    if (item.id === Module.EmissaoCTE) return ['Administrador', 'Comercial', 'Operacional', 'Financeiro'].includes(currentUser.role);
    if (item.id === Module.GestaoCTE) return ['Administrador', 'Financeiro', 'Comercial', 'Operacional'].includes(currentUser.role);
    if (item.id === Module.Usuarios || item.id === Module.Configuracoes) return ['Administrador'].includes(currentUser.role);
    if (item.id === Module.Comercial) return ['Administrador', 'Comercial', 'Financeiro'].includes(currentUser.role);
    if (item.id === Module.Programacao || item.id === Module.Motoristas) return ['Administrador', 'Operacional', 'Comercial', 'Financeiro'].includes(currentUser.role);
    return true; // Dashboard, Clientes
  });

  return (
    <CompanyContext.Provider value={companyContextValue}>
      <div className="flex h-screen overflow-hidden text-gray-900 w-full" style={{ fontFamily: 'Book Antiqua, serif' }}>
        <aside className={`${isSidebarOpen ? 'w-[260px]' : 'w-20'} bg-bordeaux text-white transition-all duration-300 flex flex-col z-20 shadow-xl shrink-0`}>
          <div className="p-6 flex items-center gap-3 border-b border-white/10 overflow-hidden">
            <div className="bg-white p-2 rounded-lg shrink-0"><Truck size={24} className="text-bordeaux" /></div>
            {isSidebarOpen && <span className="font-bold text-xl tracking-tight uppercase whitespace-nowrap">CIATOS LOG</span>}
          </div>
          <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActiveModule(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeModule === item.id ? 'bg-white text-bordeaux shadow-lg scale-[1.02]' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}>
                <div className="shrink-0">{item.icon}</div>
                {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
          <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800 whitespace-nowrap">CIATOS LOG — Gestão</h1>
              <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>
              
              {/* SELETOR DE EMPRESA GLOBAL */}
              <div className="relative group">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl cursor-pointer hover:border-bordeaux/30 transition-all">
                  <div className="p-1.5 bg-bordeaux text-white rounded-lg">
                    {activeCompany === 'GLOBAL' ? <Globe size={16}/> : <Building2 size={16}/>}
                  </div>
                  <div className="flex flex-col pr-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1 tracking-widest">Empresa Ativa</span>
                    <span className="text-xs font-black text-bordeaux uppercase leading-none">
                      {activeCompany === 'BD' ? 'BD Transportes' : activeCompany === 'LOG' ? 'Ciatoslog' : 'Visão Global'}
                    </span>
                  </div>
                  <ChevronDown size={16} className="text-gray-300 absolute right-4" />
                </div>
                
                {/* DROPDOWN ELEGANTE */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-3xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] py-3 overflow-hidden">
                   <CompanyOption id="BD" name="BD Transportes" cnpj="00.000.000/0001-00" active={activeCompany === 'BD'} onClick={() => setActiveCompany('BD')} />
                   <CompanyOption id="LOG" name="Ciatoslog" cnpj="00.000.000/0001-01" active={activeCompany === 'LOG'} onClick={() => setActiveCompany('LOG')} />
                   <div className="h-[1px] bg-gray-100 my-2 mx-4"></div>
                   <CompanyOption id="GLOBAL" name="Visão Consolidada" cnpj="Holding Group" active={activeCompany === 'GLOBAL'} onClick={() => setActiveCompany('GLOBAL')} icon={<Globe size={18}/>} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><Bell size={20} /><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
              
              {/* SELETOR DE USUÁRIO (SIMULAÇÃO DE LOGIN) */}
              <div className="relative group border-l border-gray-200 pl-6">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                  </div>
                  <div className="bg-gray-100 p-1 rounded-full border-2 border-bordeaux/20 shrink-0">
                    <UserCircle size={32} className="text-bordeaux" />
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
                
                {/* DROPDOWN DE USUÁRIOS */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alternar Usuário</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {users.map(user => (
                      <button 
                        key={user.id}
                        onClick={() => {
                          setCurrentUser(user);
                          setActiveModule(Module.Dashboard);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${currentUser.id === user.id ? 'bg-bordeaux/5' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentUser.id === user.id ? 'bg-bordeaux text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${currentUser.id === user.id ? 'text-bordeaux' : 'text-gray-900'}`}>{user.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wider">{user.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 flex flex-col w-full h-full overflow-y-auto bg-[#F8F9FA] p-8">{renderContent()}</main>
        </div>
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
