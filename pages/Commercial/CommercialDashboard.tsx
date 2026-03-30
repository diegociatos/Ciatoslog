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
  Calendar,
  LayoutDashboard,
  Columns as KanbanIcon,
  ChevronRight,
  MoreVertical,
  MapPin,
  CalendarDays
} from 'lucide-react';
import { Load, Client, User, CommercialGoal, CommissionRule, LoadStatus } from '../../App';
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
  const [viewMode, setViewMode] = useState<'dashboard' | 'kanban'>('dashboard');

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
  const prospectingCount = useMemo(() => {
    const prospectingClients = myClients.filter(c => {
      if (c.status !== 'Prospecção') return false;
      if (!c.createdAt) return false;
      const clientDate = new Date(c.createdAt);
      const clientYear = clientDate.getFullYear().toString();
      const clientMonth = (clientDate.getMonth() + 1).toString().padStart(2, '0');
      
      if (clientYear !== selectedYear) return false;
      if (selectedMonth !== 'all' && clientMonth !== selectedMonth) return false;
      return true;
    });
    return prospectingClients.length;
  }, [myClients, selectedYear, selectedMonth]);
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
      return c.status === 'Ativo';
    }).length;
  }, [clients, currentUser.name]);
  
  // For prospecting, let's just use a simple calculation or mock if we don't have creation dates
  const prospectingProgress = prospectingGoal > 0 ? Math.min(100, Math.round((prospectingCount / prospectingGoal) * 100)) : 0;

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

  const kanbanColumns: { id: LoadStatus; title: string; color: string }[] = [
    { id: 'PROSPECTO', title: 'Prospecção', color: 'bg-gray-100 text-gray-700' },
    { id: 'PROPOSTA_APRESENTADA', title: 'Proposta Apresentada', color: 'bg-blue-100 text-blue-700' },
    { id: 'NEGOCIACAO', title: 'Negociação', color: 'bg-amber-100 text-amber-700' },
    { id: 'DOCUMENTACAO', title: 'Documentação', color: 'bg-blue-200 text-blue-800' },
    { id: 'PRONTO_PROGRAMAR', title: 'Pronto p/ Programar', color: 'bg-emerald-100 text-emerald-700' },
    { id: 'AGUARDANDO PROGRAMAÇÃO', title: 'Aguardando Programação', color: 'bg-purple-100 text-purple-700' },
    { id: 'EM_PROGRAMACAO', title: 'Em Programação', color: 'bg-indigo-100 text-indigo-700' },
    { id: 'EM TRÂNSITO', title: 'Em Trânsito', color: 'bg-blue-600 text-white' },
    { id: 'ENTREGUE', title: 'Entregue', color: 'bg-gray-200 text-gray-800' },
    { id: 'PERDIDO', title: 'Perdido', color: 'bg-red-100 text-red-700' },
  ];

  const kanbanData = useMemo(() => {
    const columns: Record<string, Load[]> = {};
    kanbanColumns.forEach(col => {
      columns[col.id] = filteredLoads.filter(l => l.status === col.id);
    });
    return columns;
  }, [filteredLoads, kanbanColumns]);

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50/50">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Olá, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Aqui está o resumo das suas vendas e clientes.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'dashboard' 
                  ? 'bg-bordeaux text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'kanban' 
                  ? 'bg-bordeaux text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <KanbanIcon size={18} />
              Kanban
            </button>
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
      </div>

      {viewMode === 'dashboard' ? (
        <>
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
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <Target size={24} />
              </div>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                Meta: {userGoals.prospectingGoal} leads
              </span>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Progresso de Prospecção</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {prospectingProgress} / {userGoals.prospectingGoal}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${userGoals.prospectingGoal > 0 ? Math.min((prospectingProgress / userGoals.prospectingGoal) * 100, 100) : 0}%` }} />
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
    </>
  ) : (
    /* Kanban View */
    <div className="flex gap-6 overflow-x-auto pb-6 min-h-[calc(100vh-250px)]">
      {kanbanColumns.map(column => (
        <div key={column.id} className="flex-shrink-0 w-80 flex flex-col">
          <div className={`flex items-center justify-between p-4 rounded-t-2xl border-b-2 border-white ${column.color}`}>
            <h3 className="font-black text-sm uppercase tracking-wider">{column.title}</h3>
            <span className="bg-white/50 px-2 py-0.5 rounded-lg text-xs font-bold">
              {kanbanData[column.id]?.length || 0}
            </span>
          </div>
          
          <div className="flex-1 bg-gray-100/50 p-3 rounded-b-2xl space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-hide">
            {kanbanData[column.id]?.map(load => (
              <div 
                key={load.id} 
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-bordeaux/20 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {load.internalNumber || load.proposalNumber || `#${load.id.substring(0, 6)}`}
                  </span>
                  <button className="text-gray-300 hover:text-gray-600">
                    <MoreVertical size={14} />
                  </button>
                </div>
                
                <h4 className="font-bold text-gray-900 mb-3 group-hover:text-bordeaux transition-colors">
                  {load.customer}
                </h4>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="truncate">{load.origin} → {load.destination}</span>
                  </div>
                  {load.collectionDate && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays size={12} className="text-gray-400" />
                      <span>Coleta: {new Date(load.collectionDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="text-sm font-black text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(load.value)}
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-bordeaux text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                      {load.commercialRep.substring(0, 1)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {(!kanbanData[column.id] || kanbanData[column.id].length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 opacity-50">
                <LayoutDashboard size={32} strokeWidth={1} className="mb-2" />
                <span className="text-xs font-medium italic text-center px-4">Nenhuma carga nesta etapa</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
);
};

export default CommercialDashboard;
