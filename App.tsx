
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
  Globe
} from 'lucide-react';
import DashboardModule from './components/DashboardModule';
import CommercialModule from './pages/Commercial/CommercialModule';
import FinanceModule from './pages/Finance/FinanceModule';
import ProgrammingModule from './pages/Programming/ProgrammingModule';
import ClientsModule from './pages/Clients/ClientsModule';
import DriversModule from './pages/Programming/DriversModule';
import SettingsModule from './pages/Settings/SettingsModule';

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
  Financeiro = 'Financeiro',
  Configuracoes = 'Configurações'
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
    }
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

  const renderContent = () => {
    switch (activeModule) {
      case Module.Dashboard:
        return <DashboardModule unit={activeCompany} loads={filteredLoads} />;
      case Module.Comercial:
        return <CommercialModule loads={filteredLoads} addLoad={addLoad} updateLoad={updateLoad} deleteLoad={deleteLoad} clients={filteredClients} drivers={filteredDrivers} />;
      case Module.Clientes:
        return <ClientsModule clients={filteredClients} setClients={setClients} segments={['Agronegócio', 'Indústria']} />;
      case Module.Motoristas:
        return <DriversModule drivers={filteredDrivers} setDrivers={setDrivers} vehicleTypes={vehicleTypes} />;
      case Module.Programacao:
        return <ProgrammingModule loads={filteredLoads} updateLoad={updateLoad} drivers={filteredDrivers} />;
      case Module.Financeiro:
        return <FinanceModule unit={activeCompany} />;
      case Module.Configuracoes:
        return <SettingsModule vehicleTypes={vehicleTypes} setVehicleTypes={setVehicleTypes} routes={[]} setRoutes={() => {}} segments={[]} setSegments={() => {}} />;
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
    { id: Module.Financeiro, icon: <CircleDollarSign size={20} />, label: 'Financeiro' },
    { id: Module.Configuracoes, icon: <Settings size={20} />, label: 'Configurações' },
  ];

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
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <div className="text-right hidden sm:block"><p className="text-sm font-bold text-gray-800">Gestor Administrativo</p><p className="text-xs text-gray-500">Logística Brasil</p></div>
                <div className="bg-gray-100 p-1 rounded-full border-2 border-bordeaux/20 shrink-0"><UserCircle size={32} className="text-bordeaux" /></div>
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
