import React from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  Target,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Load, Client, User } from '../../App';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

interface CommercialDashboardProps {
  loads: Load[];
  clients: Client[];
  currentUser: User;
}

const CommercialDashboard: React.FC<CommercialDashboardProps> = ({ loads, clients, currentUser }) => {
  // Filtrar dados apenas do usuário comercial logado (ou todos se for admin)
  const myLoads = loads.filter(l => l.commercialRep === currentUser.name);
  const myClients = clients.filter(c => c.commercialRep === currentUser.name);

  const totalSales = myLoads.reduce((acc, curr) => acc + curr.value, 0);
  const activeClients = myClients.filter(c => c.status === 'Ativo').length;
  const pendingLoads = myLoads.filter(l => l.status === 'AGUARDANDO PROGRAMAÇÃO').length;
  
  // Meta simulada
  const salesGoal = 50000;
  const goalProgress = Math.min(100, Math.round((totalSales / salesGoal) * 100));

  const monthlyData = [
    { name: 'Jan', vendas: 12000 },
    { name: 'Fev', vendas: 19000 },
    { name: 'Mar', vendas: 15000 },
    { name: 'Abr', vendas: 22000 },
    { name: 'Mai', vendas: 28000 },
    { name: 'Jun', vendas: totalSales },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50/50">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Olá, {currentUser.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Aqui está o resumo das suas vendas e clientes.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <ArrowUpRight size={16} /> +12%
              </span>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Total em Vendas</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSales)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Target size={24} />
              </div>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                Meta: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(salesGoal)}
              </span>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Progresso da Meta</h3>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-black text-gray-900 tracking-tight">{goalProgress}%</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${goalProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <Users size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Meus Clientes Ativos</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{activeClients}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Clock size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Aguardando Programação</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{pendingLoads}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Vendas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-bordeaux" />
            Evolução de Vendas
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B0000" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B0000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} tickFormatter={(val) => `R$ ${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Vendas']}
                />
                <Area type="monotone" dataKey="vendas" stroke="#8B0000" strokeWidth={3} fillOpacity={1} fill="url(#colorVendas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Últimas Vendas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase size={20} className="text-bordeaux" />
            Últimas Vendas
          </h3>
          <div className="space-y-4">
            {myLoads.slice(0, 5).map(load => (
              <div key={load.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{load.customer}</div>
                  <div className="text-xs text-gray-500">{load.origin} → {load.destination}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600 text-sm">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(load.value)}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium uppercase">{load.status}</div>
                </div>
              </div>
            ))}
            {myLoads.length === 0 && (
              <div className="text-center text-gray-500 italic py-4">Nenhuma venda registrada.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialDashboard;
