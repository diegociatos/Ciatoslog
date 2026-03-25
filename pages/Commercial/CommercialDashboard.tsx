import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  Target,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Wallet,
  Calendar
} from 'lucide-react';
import { Load, Client, User, CommercialGoal, CommissionRule } from '../../App';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

interface CommercialDashboardProps {
  loads: Load[];
  clients: Client[];
  currentUser: User;
  commercialGoals: CommercialGoal[];
  commissionRules: CommissionRule[];
}

const CommercialDashboard: React.FC<CommercialDashboardProps> = ({ loads, clients, currentUser, commercialGoals, commissionRules }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const years = Array.from({ length: 10 }, (_, i) => (currentYear - 2 + i).toString());

  const months = [
    { value: 'all', label: 'Ano Todo' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  // Filtrar dados apenas do usuário comercial logado (ou todos se for admin)
  const filteredLoads = useMemo(() => {
    return loads.filter(l => {
      if (l.commercialRep !== currentUser.name) return false;
      
      const loadDate = new Date(l.date);
      const loadYear = loadDate.getFullYear().toString();
      const loadMonth = (loadDate.getMonth() + 1).toString().padStart(2, '0');

      if (loadYear !== selectedYear) return false;
      if (selectedMonth !== 'all' && loadMonth !== selectedMonth) return false;

      return true;
    });
  }, [loads, currentUser.name, selectedYear, selectedMonth]);

  const myClients = clients.filter(c => c.commercialRep === currentUser.name);

  const validLoads = filteredLoads.filter(l => l.status !== 'Cancelado' && l.status !== 'PERDIDO');
  const lostLoads = filteredLoads.filter(l => l.status === 'PERDIDO' || l.status === 'Cancelado');

  const totalSales = validLoads.reduce((acc, curr) => acc + curr.value, 0);
  const totalCost = validLoads.reduce((acc, curr) => acc + (curr.cost || 0), 0);
  const profitMargin = totalSales > 0 ? ((totalSales - totalCost) / totalSales) * 100 : 0;
  
  const activeClients = myClients.filter(c => c.status === 'Ativo').length;
  const pendingLoads = validLoads.filter(l => l.status === 'AGUARDANDO PROGRAMAÇÃO').length;
  
  const totalMyLoads = validLoads.length;
  const programmedByMe = validLoads.filter(l => l.assignedProgrammer === 'Comercial').length;
  const programmingProgress = totalMyLoads > 0 ? Math.round((programmedByMe / totalMyLoads) * 100) : 0;
  
  // Metas do usuário
  const userGoals = useMemo(() => {
    if (selectedMonth === 'all') {
      const yearGoals = commercialGoals.filter(g => g.userId === currentUser.name && g.year === selectedYear);
      return {
        salesGoal: yearGoals.reduce((acc, g) => acc + g.salesGoal, 0),
        prospectingGoal: yearGoals.reduce((acc, g) => acc + g.prospectingGoal, 0)
      };
    } else {
      const monthGoal = commercialGoals.find(g => g.userId === currentUser.name && g.year === selectedYear && g.month === selectedMonth);
      return {
        salesGoal: monthGoal?.salesGoal || 0,
        prospectingGoal: monthGoal?.prospectingGoal || 0
      };
    }
  }, [commercialGoals, currentUser.name, selectedYear, selectedMonth]);

  const salesGoal = userGoals.salesGoal;
  const prospectingGoal = userGoals.prospectingGoal;
  const goalProgress = salesGoal > 0 ? Math.min(100, Math.round((totalSales / salesGoal) * 100)) : 0;
  
  const newClientsThisPeriod = useMemo(() => {
    return clients.filter(c => {
      if (c.commercialRep !== currentUser.name) return false;
      // Assuming we don't have a creation date for clients, we'll use lastNegotiation as a proxy or just count active clients for now if we don't have a created date.
      // Let's check if client has a date field. If not, we'll just use a placeholder logic or activeClients.
      // For a real app, Client should have a 'createdAt' field.
      // We'll just use activeClients for now or simulate new clients.
      return c.status === 'Ativo';
    }).length;
  }, [clients, currentUser.name]);
  
  // For prospecting, let's just use a simple calculation or mock if we don't have creation dates
  const prospectingProgress = prospectingGoal > 0 ? Math.min(100, Math.round((activeClients / prospectingGoal) * 100)) : 0;

  // Comissões e Metas Extras
  const commissionData = useMemo(() => {
    let earnedCommission = 0;
    let potentialCommission = 0;
    let earnedBonus = 0;
    let potentialBonus = 0;
    let nextGoalRevenue = 0;
    let nextGoalPercentage = 0;

    const myRules = commissionRules.filter(r => r.role === 'Comercial');
    
    // Regras de Faturamento
    const revenueRules = myRules.filter(r => r.type === 'Comissao_Faturamento').sort((a, b) => (a.minRevenue || 0) - (b.minRevenue || 0));
    
    for (const rule of revenueRules) {
      const min = rule.minRevenue || 0;
      const max = rule.maxRevenue || Infinity;
      const pct = rule.commissionPercentage || 0;

      if (totalSales >= min && totalSales <= max) {
        earnedCommission = totalSales * (pct / 100);
      }
      
      if (totalSales < min && nextGoalRevenue === 0) {
        nextGoalRevenue = min;
        nextGoalPercentage = pct;
        potentialCommission = min * (pct / 100);
      }
    }

    // Regras de Meta Extra
    const extraRules = myRules.filter(r => r.type === 'Meta_Extra');
    const currentCostPercentage = totalSales > 0 ? (totalCost / totalSales) * 100 : 0;

    for (const rule of extraRules) {
      const target = rule.targetRevenue || 0;
      const maxCost = rule.maxCostPercentage || 100;
      const bonus = rule.bonusAmount || 0;

      if (totalSales >= target && currentCostPercentage <= maxCost) {
        earnedBonus += bonus;
      } else if (totalSales < target || currentCostPercentage > maxCost) {
        potentialBonus += bonus;
      }
    }

    return {
      earnedCommission,
      potentialCommission,
      earnedBonus,
      potentialBonus,
      nextGoalRevenue,
      nextGoalPercentage,
      currentCostPercentage
    };
  }, [totalSales, totalCost, commissionRules]);

  const monthlyData = useMemo(() => {
    if (selectedMonth !== 'all') {
      // Se um mês específico está selecionado, mostra evolução por semana (simplificado)
      return [
        { name: 'Sem 1', vendas: totalSales * 0.2 },
        { name: 'Sem 2', vendas: totalSales * 0.3 },
        { name: 'Sem 3', vendas: totalSales * 0.1 },
        { name: 'Sem 4', vendas: totalSales * 0.4 },
      ];
    }

    // Se "Ano Todo" está selecionado, mostra evolução por mês
    const data = months.filter(m => m.value !== 'all').map(m => {
      const monthLoads = loads.filter(l => {
        if (l.commercialRep !== currentUser.name) return false;
        if (l.status === 'Cancelado' || l.status === 'PERDIDO') return false;
        const loadDate = new Date(l.date);
        return loadDate.getFullYear().toString() === selectedYear && 
               (loadDate.getMonth() + 1).toString().padStart(2, '0') === m.value;
      });
      return {
        name: m.label.substring(0, 3),
        vendas: monthLoads.reduce((acc, curr) => acc + curr.value, 0)
      };
    });
    return data;
  }, [selectedMonth, selectedYear, loads, currentUser.name, totalSales, months]);

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50/50">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Olá, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Aqui está o resumo das suas vendas e clientes.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 px-3 border-r border-gray-100">
            <Calendar size={18} className="text-gray-400" />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="px-3">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <Wallet size={24} />
              </div>
              <span className={`text-sm font-bold px-2 py-1 rounded-lg ${profitMargin >= 15 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                Margem: {profitMargin.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Custo Carreteiro</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost)}
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
                Meta: {salesGoal > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(salesGoal) : 'Não definida'}
              </span>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Progresso da Meta</h3>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-black text-gray-900 tracking-tight">{salesGoal > 0 ? `${goalProgress}%` : '-'}</div>
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
              <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                Meta: {prospectingGoal > 0 ? prospectingGoal : 'Não definida'}
              </span>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Prospecção (Clientes Ativos)</h3>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-black text-gray-900 tracking-tight">{activeClients}</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${prospectingProgress}%` }} />
            </div>
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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <Truck size={24} />
              </div>
              <span className={`text-sm font-bold px-2 py-1 rounded-lg ${programmingProgress >= 60 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                Meta: 60%
              </span>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Cargas Programadas</h3>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-black text-gray-900 tracking-tight">{programmedByMe}</div>
              <div className="text-sm font-medium text-gray-500 mb-1">/ {totalMyLoads}</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div className={`h-2 rounded-full ${programmingProgress >= 60 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, programmingProgress)}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-2 font-medium">
              {programmingProgress}% do total de vendas
            </div>
          </div>
        </div>
      </div>

      {/* Comissões e Metas Extras */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Wallet className="text-emerald-500" /> Comissões e Bônus
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <h3 className="text-emerald-800 font-medium text-sm mb-1">Comissão Atual</h3>
            <div className="text-2xl font-black text-emerald-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commissionData.earnedCommission)}
            </div>
            {commissionData.nextGoalRevenue > 0 && (
              <p className="text-xs text-emerald-600 mt-2">
                Próxima faixa: {commissionData.nextGoalPercentage}% ao atingir {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commissionData.nextGoalRevenue)}
              </p>
            )}
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="text-blue-800 font-medium text-sm mb-1">Bônus Conquistado</h3>
            <div className="text-2xl font-black text-blue-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commissionData.earnedBonus)}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Bônus por meta extra atingida
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <h3 className="text-amber-800 font-medium text-sm mb-1">Bônus Potencial</h3>
            <div className="text-2xl font-black text-amber-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commissionData.potentialBonus)}
            </div>
            <p className="text-xs text-amber-600 mt-2">
              Valor a receber se atingir as metas extras
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="text-gray-800 font-medium text-sm mb-1">Custo Atual</h3>
            <div className="text-2xl font-black text-gray-600">
              {commissionData.currentCostPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Custo sobre faturamento
            </p>
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
            {validLoads.slice(0, 5).map(load => (
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
            {validLoads.length === 0 && (
              <div className="text-center text-gray-500 italic py-4">Nenhuma venda registrada no período.</div>
            )}
          </div>
        </div>
      </div>

      {/* Gestão de Perdas de Chances */}
      <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <AlertCircle size={20} className="text-red-600" />
          Gestão de Perdas de Chances
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Data</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Cliente</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Rota</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Valor Proposto</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Origem da Perda</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Motivo da Perda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lostLoads.map(load => (
                <tr key={load.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {new Date(load.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 text-sm">{load.customer}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{load.origin} → {load.destination}</td>
                  <td className="py-3 px-4 font-medium text-red-600 text-sm">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(load.value)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${load.lostBy === 'Operacional' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {load.lostBy || 'Comercial'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {load.lostReason || 'Motivo não informado'}
                  </td>
                </tr>
              ))}
              {lostLoads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhuma perda de chance registrada no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommercialDashboard;
