
import React, { useState } from 'react';
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
  Contact2
} from 'lucide-react';
import DashboardModule from './components/DashboardModule';
import CommercialModule from './pages/Commercial/CommercialModule';
import FinanceModule from './pages/Finance/FinanceModule';
import ProgrammingModule from './pages/Programming/ProgrammingModule';
import ClientsModule from './pages/Clients/ClientsModule';
import DriversModule from './pages/Programming/DriversModule';
import SettingsModule from './pages/Settings/SettingsModule';

// Define the modules for navigation
export enum Module {
  Dashboard = 'Dashboard',
  Comercial = 'Comercial',
  Clientes = 'Clientes',
  Motoristas = 'Motoristas',
  Programacao = 'Programação',
  Financeiro = 'Financeiro',
  PortalCliente = 'Portal do Cliente',
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
  date: string;
  customer: string;
  origin: string;
  destination: string;
  value: number;
  cost: number;
  status: LoadStatus;
  driverId?: string;
  driver?: string;
  plate?: string;
  advance?: number;
  balance?: number;
  vehicleTypeRequired?: string;
  commercialRep?: string;
}

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>(Module.Dashboard);
  const [selectedUnit, setSelectedUnit] = useState<string>('Ciatoslog');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Global Settings State
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([
    { id: '1', name: 'Carreta LS (Lonada)', capacity: 32, volume: 90, active: true },
    { id: '2', name: 'Truck', capacity: 14, volume: 45, active: true },
    { id: '3', name: 'Bitrem', capacity: 54, volume: 120, active: true },
  ]);

  const [routes, setRoutes] = useState<RouteConfig[]>([
    { id: '1', origin: 'São Paulo/SP', destination: 'Curitiba/PR', distance: 410, time: 6, toll: 120, fuel: 850 },
    { id: '2', origin: 'Rio de Janeiro/RJ', destination: 'Belo Horizonte/MG', distance: 440, time: 7, toll: 150, fuel: 920 },
  ]);

  const [segments, setSegments] = useState<string[]>([
    'Agronegócio', 'Alimentício', 'Automotivo', 'Bebidas', 'Construção Civil', 'E-commerce', 'Farmacêutico', 'Químico e Petroquímico'
  ]);

  // Global Drivers State
  const [drivers, setDrivers] = useState<Driver[]>([
    { 
      id: 'D1', name: 'João Silva', type: 'PF', cnpj_cpf: '111.222.333-44', phone: '(11) 98888-7777', 
      vehicleType: 'Truck', plate: 'ABC-1234', antt: '12345678', rating: 4.8, completedTrips: 152, 
      status: 'Disponível', 
      historyRoutes: [
        { origin: 'São Paulo/SP', destination: 'Curitiba/PR', type: 'Automático', loadId: 'L-PREV', date: '2023-10-01' },
        { origin: 'Rio de Janeiro/RJ', destination: 'Belo Horizonte/MG', type: 'Manual', frequency: 'Sempre' }
      ],
      pix: '11122233344', docsExpired: false
    },
    { 
      id: 'D2', name: 'Carlos Souza', type: 'PJ', cnpj_cpf: '12.345.678/0001-90', phone: '(21) 97777-6666', 
      vehicleType: 'Carreta LS (Lonada)', plate: 'XYZ-5678', antt: '87654321', rating: 4.5, completedTrips: 89, 
      status: 'Disponível', 
      historyRoutes: [
        { origin: 'São Paulo/SP', destination: 'Curitiba/PR', type: 'Manual', frequency: 'Ocasionalmente' }
      ], 
      pix: 'comercial@transsouza.com',
      docsExpired: false
    }
  ]);

  // Central state for clients
  const [clients, setClients] = useState<Client[]>([
    { 
      id: '1', name: 'AgroForte S.A.', cnpj: '12.345.678/0001-90', type: 'Indústria', segment: 'Agronegócio', 
      city: 'Cuiabá', state: 'MT', commercialRep: 'Marcos Oliveira', status: 'Ativo', lastNegotiation: '2023-11-01',
      decisionMakers: [{ name: 'João Silva', position: 'Gerente Logístico', phone: '(65) 99999-0000', email: 'joao@agroforte.com', influence: 100 }],
      history: [],
      icmsContributor: 'Sim',
      stateRegistration: '123456789',
      taxRegime: 'Lucro Real',
      financeEmail: 'financeiro@agroforte.com',
      financeContact: 'Mariana Silva',
      financePhone: '(65) 98888-1111'
    }
  ]);

  // Central state for loads
  const [loads, setLoads] = useState<Load[]>([
    { id: '1024', date: '2023-10-25', customer: 'Logística S.A.', origin: 'São Paulo/SP', destination: 'Curitiba/PR', value: 4500, cost: 3200, status: 'PRONTO_PROGRAMAR', vehicleTypeRequired: 'Truck', commercialRep: 'Marcos Oliveira' },
    { id: '1025', date: '2023-10-26', customer: 'AgroForte S.A.', origin: 'Cuiabá/MT', destination: 'Santos/SP', value: 12800, cost: 9400, status: 'NEGOCIACAO', vehicleTypeRequired: 'Carreta LS (Lonada)', commercialRep: 'Ana Beatriz' },
    { id: '1026', date: '2023-10-27', customer: 'Bebidas Sul', origin: 'Curitiba/PR', destination: 'Porto Alegre/RS', value: 3500, cost: 2800, status: 'DOCUMENTACAO', vehicleTypeRequired: 'Truck', commercialRep: 'Roberto Lima' },
  ]);

  const addLoad = (newLoad: Omit<Load, 'id' | 'date' | 'status'>) => {
    const load: Load = {
      ...newLoad,
      id: `${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'NEGOCIACAO',
    };
    setLoads([load, ...loads]);
  };

  const updateLoad = (updatedLoad: Load) => {
    setLoads(loads.map(l => l.id === updatedLoad.id ? updatedLoad : l));
    
    // Automatização de histórico quando carga é entregue
    if (updatedLoad.status === 'ENTREGUE' && updatedLoad.driverId) {
      setDrivers(prev => prev.map(d => {
        if (d.id === updatedLoad.driverId) {
          const alreadyHasRoute = d.historyRoutes.some(r => r.loadId === updatedLoad.id);
          if (alreadyHasRoute) return d;
          
          return {
            ...d,
            completedTrips: d.completedTrips + 1,
            historyRoutes: [
              ...d.historyRoutes,
              {
                origin: updatedLoad.origin,
                destination: updatedLoad.destination,
                date: new Date().toISOString().split('T')[0],
                loadId: updatedLoad.id,
                type: 'Automático'
              }
            ]
          };
        }
        return d;
      }));
    }
  };

  const renderContent = () => {
    switch (activeModule) {
      case Module.Dashboard:
        return <DashboardModule unit={selectedUnit} loads={loads} />;
      case Module.Comercial:
        return <CommercialModule loads={loads} addLoad={addLoad} updateLoad={updateLoad} clients={clients} />;
      case Module.Clientes:
        return <ClientsModule clients={clients} setClients={setClients} segments={segments} />;
      case Module.Motoristas:
        return <DriversModule drivers={drivers} setDrivers={setDrivers} vehicleTypes={vehicleTypes} />;
      case Module.Programacao:
        return <ProgrammingModule loads={loads} updateLoad={updateLoad} drivers={drivers} />;
      case Module.Financeiro:
        return <FinanceModule unit={selectedUnit} />;
      case Module.Configuracoes:
        return (
          <SettingsModule 
            vehicleTypes={vehicleTypes} 
            setVehicleTypes={setVehicleTypes} 
            routes={routes} 
            setRoutes={setRoutes} 
            segments={segments}
            setSegments={setSegments}
          />
        );
      default:
        return <div className="p-10 text-center italic text-gray-400">Em desenvolvimento...</div>;
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
            <h1 className="text-2xl font-bold text-gray-800 whitespace-nowrap">CIATOS LOG — Gestão Logística</h1>
            <div className="h-6 w-[1px] bg-gray-300 mx-2 hidden md:block"></div>
            <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-semibold cursor-pointer">
              <option value="BD">Unidade: BD</option>
              <option value="Ciatoslog">Unidade: Ciatoslog</option>
              <option value="Consolidado">Visão: Consolidado</option>
            </select>
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
  );
};

export default App;
