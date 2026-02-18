
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  Truck, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Navigation,
  CheckCircle2,
  Users,
  UserPlus,
  UserMinus,
  DollarSign,
  Briefcase,
  Star
} from 'lucide-react';
import { Load } from '../App';

interface DashboardProps {
  unit: string;
  loads: Load[];
}

const DashboardModule: React.FC<DashboardProps> = ({ unit, loads }) => {
  // Cálculos Automáticos
  const totalRevenue = loads.reduce((acc, curr) => acc + curr.value, 0);
  const totalCosts = loads.reduce((acc, curr) => acc + curr.cost, 0);
  const netProfit = totalRevenue - totalCosts;
  
  // Dados Simulados para os novos KPIs
  const avgDeliveryTime = "2.8 dias";
  const failureRate = "1.4%";
  
  // Dados de Clientes
  const totalClients = 142;
  const newClientsMonth = 12;
  const inactiveClients = 8; // Clientes sem contratar há 2 meses

  // Dados do Time Comercial (Simulados)
  const commercialTeam = [
    { name: 'Marcos Oliveira', sales: 450000, margin: '18%', loads: 42, rating: 4.8 },
    { name: 'Ana Beatriz', sales: 385000, margin: '22%', loads: 38, rating: 4.9 },
    { name: 'Roberto Lima', sales: 290000, margin: '15%', loads: 25, rating: 4.5 },
    { name: 'Juliana Costa', sales: 120000, margin: '12%', loads: 12, rating: 4.2 },
  ];

  const dataVolume = [
    { name: 'Seg', volume: 450 },
    { name: 'Ter', volume: 520 },
    { name: 'Qua', volume: 610 },
    { name: 'Qui', volume: 580 },
    { name: 'Sex', volume: 720 },
    { name: 'Sáb', volume: 320 },
    { name: 'Dom', volume: 150 },
  ];

  return (
    <div className="flex flex-col w-full space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Controladoria & Performance</h2>
          <p className="text-gray-500 italic">
            Dashboard consolidado — Unidade: <span className="text-bordeaux font-bold">{unit}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2 text-sm font-bold text-gray-600">
            <Clock size={16} className="text-bordeaux" />
            Sincronizado: 11:45
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <StatCard 
          title="Lucro Líquido (Mês)" 
          value={netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
          change="+8.4%" 
          isPositive={true}
          icon={<DollarSign size={20} />}
          color="bordeaux"
        />
        <StatCard 
          title="Tempo Médio Entrega" 
          value={avgDeliveryTime} 
          change="-0.4 dias" 
          isPositive={true}
          icon={<Clock size={20} />}
          color="blue"
        />
        <StatCard 
          title="Taxa de Falhas" 
          value={failureRate} 
          change="-2.1%" 
          isPositive={true}
          icon={<AlertCircle size={20} />}
          color="emerald"
        />
        <StatCard 
          title="Faturamento Bruto" 
          value={totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
          change="+15.2%" 
          isPositive={true}
          icon={<TrendingUp size={20} />}
          color="indigo"
        />
      </div>

      {/* Clientes & CRM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ClientSmallCard 
          title="Total de Clientes" 
          value={totalClients} 
          icon={<Users className="text-blue-600" />} 
          bgColor="bg-blue-50"
        />
        <ClientSmallCard 
          title="Novos (Este Mês)" 
          value={newClientsMonth} 
          icon={<UserPlus className="text-emerald-600" />} 
          bgColor="bg-emerald-50"
          subtitle="Prospecção ativa"
        />
        <ClientSmallCard 
          title="Inativos (> 60 dias)" 
          value={inactiveClients} 
          icon={<UserMinus className="text-red-600" />} 
          bgColor="bg-red-50"
          highlight={true}
          subtitle="Ação necessária urgente"
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 text-lg">Volume Operacional</h3>
            <div className="text-[10px] font-black uppercase tracking-wider text-bordeaux bg-bordeaux/5 px-2 py-1 rounded">Semana 42</div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataVolume}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Book Antiqua'}} />
                <Bar dataKey="volume" radius={[6, 6, 0, 0]} barSize={45}>
                  {dataVolume.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.volume > 600 ? '#6D0019' : '#8B0024'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Desempenho do Time Comercial */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 text-lg">Ranking Comercial</h3>
            <Briefcase size={18} className="text-gray-400" />
          </div>
          <div className="space-y-4 overflow-y-auto pr-2">
            {commercialTeam.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:border-bordeaux/20 transition-all bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bordeaux/10 flex items-center justify-center text-bordeaux font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{member.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-black">{member.loads} cargas finalizadas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-bordeaux">{member.sales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <div className="flex items-center justify-end gap-1">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-gray-600">{member.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monitoramento em Tempo Real */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bordeaux text-white rounded-lg">
              <Navigation size={20} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Rastreamento Ativo</h3>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-white text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">Veículo</th>
                <th className="px-8 py-5">Condutor</th>
                <th className="px-8 py-5">Rota</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Progresso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <ActivityRow truck="ABC-1234" driver="Carlos Silva" route="São Paulo → Curitiba" status="Em Trânsito" progress={75} statusColor="blue" />
              <ActivityRow truck="XYZ-5678" driver="João Pereira" route="Rio de Janeiro → BH" status="Carga Concluída" progress={100} statusColor="emerald" />
              <ActivityRow truck="KJH-9012" driver="Ricardo Souza" route="Cuiabá → Santos" status="Em Trânsito" progress={22} statusColor="blue" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componentes Auxiliares
const StatCard = ({ title, value, change, isPositive, icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
    <div className="flex items-start justify-between mb-6">
      <div className={`p-3 rounded-xl ${
        color === 'bordeaux' ? 'bg-bordeaux text-white' :
        color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
        color === 'blue' ? 'bg-blue-50 text-blue-600' :
        'bg-indigo-50 text-indigo-600'
      }`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-black ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {change}
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      </div>
    </div>
    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
    <h4 className="text-2xl font-black text-gray-800 tracking-tight">{value}</h4>
  </div>
);

const ClientSmallCard = ({ title, value, icon, bgColor, highlight, subtitle }: any) => (
  <div className={`p-5 rounded-2xl border border-gray-100 bg-white flex items-center gap-4 ${highlight ? 'ring-2 ring-red-100' : ''}`}>
    <div className={`p-4 rounded-xl ${bgColor}`}>{icon}</div>
    <div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">{title}</p>
      <h5 className="text-2xl font-black text-gray-800 leading-none">{value}</h5>
      {subtitle && <p className="text-[10px] text-gray-400 italic mt-1">{subtitle}</p>}
    </div>
  </div>
);

const ActivityRow = ({ truck, driver, route, status, progress, statusColor }: any) => (
  <tr className="hover:bg-gray-50/80 transition-all">
    <td className="px-8 py-5 font-black text-gray-800 text-sm">{truck}</td>
    <td className="px-8 py-5 text-sm font-bold text-gray-700">{driver}</td>
    <td className="px-8 py-5 text-sm text-gray-600 italic">{route}</td>
    <td className="px-8 py-5">
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
        statusColor === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' :
        'bg-emerald-50 text-emerald-600 border-emerald-100'
      }`}>
        {status}
      </span>
    </td>
    <td className="px-8 py-5">
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div className={`h-2.5 rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-bordeaux'}`} style={{ width: `${progress}%` }}></div>
        </div>
        <span className="text-xs font-black text-gray-400">{progress}%</span>
      </div>
    </td>
  </tr>
);

export default DashboardModule;
