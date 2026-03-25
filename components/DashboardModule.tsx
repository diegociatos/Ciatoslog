
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Navigation,
  Users,
  UserPlus,
  DollarSign,
  Briefcase,
  Star,
  Truck,
  X,
  CalendarDays,
  Activity,
  AlertTriangle,
  Target
} from 'lucide-react';
import { Load, Client, Driver, Transaction, User, DRECategory, CteRecord, CommissionRule } from '../App';

interface DashboardProps {
  unit: string;
  loads: Load[];
  clients: Client[];
  drivers: Driver[];
  transactions: Transaction[];
  users: User[];
  dreCategories: DRECategory[];
  ctes: CteRecord[];
  currentUser: User;
  commissionRules: CommissionRule[];
}

const DashboardModule: React.FC<DashboardProps> = ({ unit, loads, clients, drivers, transactions, users, dreCategories, ctes, currentUser, commissionRules }) => {
  const [showNewClientsModal, setShowNewClientsModal] = useState(false);

  // Datas atuais
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Helper para extrair mês e ano de uma data (YYYY-MM-DD)
  const getMonthYear = (dateString: string) => {
    if (!dateString) return { month: 0, year: 0 };
    const [year, month] = dateString.split('-');
    return { month: parseInt(month, 10), year: parseInt(year, 10) };
  };

  // 1. FATURAMENTO E LUCRO - COMPETÊNCIA
  // Receita Operacional por Competência é lançada manualmente no financeiro
  const transactionsThisMonth = transactions.filter(t => {
    const { month, year } = getMonthYear(t.date);
    return month === currentMonth && year === currentYear && t.status === 'EFETIVADO';
  });
  const transactionsThisYear = transactions.filter(t => {
    const { year } = getMonthYear(t.date);
    return year === currentYear && t.status === 'EFETIVADO';
  });

  const getRevenueCompetencia = (txs: Transaction[]) => {
    return txs.filter(t => {
      const category = dreCategories.find(c => c.id === t.cat);
      return category && category.group === 'RECEITA_BRUTA_COMPETENCIA' && t.type === 'ENTRADA';
    }).reduce((acc, curr) => acc + curr.value, 0);
  };

  const revenueCompetenciaMonth = getRevenueCompetencia(transactionsThisMonth);
  const revenueCompetenciaYear = getRevenueCompetencia(transactionsThisYear);

  const validLoads = loads.filter(l => l.status !== 'Cancelado' && l.status !== 'PERDIDO');

  const loadsThisMonth = validLoads.filter(l => {
    const { month, year } = getMonthYear(l.date);
    return month === currentMonth && year === currentYear;
  });
  const loadsThisYear = validLoads.filter(l => {
    const { year } = getMonthYear(l.date);
    return year === currentYear;
  });

  const costCompetenciaMonth = loadsThisMonth.reduce((acc, curr) => acc + curr.cost, 0);
  const profitCompetenciaMonth = revenueCompetenciaMonth - costCompetenciaMonth;

  const costCompetenciaYear = loadsThisYear.reduce((acc, curr) => acc + curr.cost, 0);
  const profitCompetenciaYear = revenueCompetenciaYear - costCompetenciaYear;

  // 2. FATURAMENTO E LUCRO - CAIXA (Baseado nas Transações Efetivadas)

  const revenueCaixaMonth = transactionsThisMonth.filter(t => t.type === 'ENTRADA').reduce((acc, curr) => acc + curr.value, 0);
  const costCaixaMonth = transactionsThisMonth.filter(t => t.type === 'SAIDA').reduce((acc, curr) => acc + curr.value, 0);
  const profitCaixaMonth = revenueCaixaMonth - costCaixaMonth;

  const revenueCaixaYear = transactionsThisYear.filter(t => t.type === 'ENTRADA').reduce((acc, curr) => acc + curr.value, 0);
  const costCaixaYear = transactionsThisYear.filter(t => t.type === 'SAIDA').reduce((acc, curr) => acc + curr.value, 0);
  const profitCaixaYear = revenueCaixaYear - costCaixaYear;

  // 3. CLIENTES E MOTORISTAS
  const totalClients = clients.length;
  const totalDrivers = drivers.length;

  // Clientes Novos no Mês (Usando lastNegotiation como proxy para createdAt se não existir)
  const newClientsThisMonth = clients.filter(c => {
    const dateToUse = c.createdAt || c.lastNegotiation;
    if (!dateToUse) return false;
    const { month, year } = getMonthYear(dateToUse);
    return month === currentMonth && year === currentYear;
  });

  // 4. RANKING COMERCIAL
  const commercialRanking = useMemo(() => {
    const rankingMap: Record<string, { name: string; sales: number; loads: number; margin: number; cost: number }> = {};
    
    // Inicializar com todos os comerciais
    users.filter(u => u.role === 'Comercial').forEach(u => {
      rankingMap[u.name] = { name: u.name, sales: 0, loads: 0, margin: 0, cost: 0 };
    });

    // Calcular baseado nas cargas
    validLoads.forEach(load => {
      const client = clients.find(c => c.name === load.customer);
      if (client && client.commercialRep) {
        const rep = client.commercialRep;
        if (!rankingMap[rep]) {
          rankingMap[rep] = { name: rep, sales: 0, loads: 0, margin: 0, cost: 0 };
        }
        rankingMap[rep].sales += load.value;
        rankingMap[rep].cost += load.cost;
        rankingMap[rep].loads += 1;
      }
    });

    return Object.values(rankingMap)
      .map(rep => ({
        ...rep,
        marginPercent: rep.sales > 0 ? ((rep.sales - rep.cost) / rep.sales) * 100 : 0
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [validLoads, clients, users]);

  // 5. RANKING PROGRAMADORES
  const programmerRanking = useMemo(() => {
    const rankingMap: Record<string, { name: string; loads: number }> = {};
    
    // Inicializar com todos os programadores (Operacional)
    users.filter(u => u.role === 'Operacional').forEach(u => {
      rankingMap[u.name] = { name: u.name, loads: 0 };
    });

    // Calcular baseado nas cargas do mês
    loadsThisMonth.forEach(load => {
      if (load.assignedProgrammer) {
        const rep = load.assignedProgrammer;
        if (!rankingMap[rep]) {
          rankingMap[rep] = { name: rep, loads: 0 };
        }
        rankingMap[rep].loads += 1;
      }
    });

    return Object.values(rankingMap)
      .sort((a, b) => b.loads - a.loads);
  }, [loadsThisMonth, users]);

  // 6. GESTÃO DE CTE (Faturamento vs Custo Carreteiro)
  const cteFaturadoMonth = loadsThisMonth.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const cteCustoMonth = loadsThisMonth.reduce((acc, curr) => acc + (curr.cost || 0), 0);
  const cteRatioMonth = cteFaturadoMonth > 0 ? (cteCustoMonth / cteFaturadoMonth) * 100 : 0;

  const cteFaturadoYear = loadsThisYear.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const cteCustoYear = loadsThisYear.reduce((acc, curr) => acc + (curr.cost || 0), 0);
  const cteRatioYear = cteFaturadoYear > 0 ? (cteCustoYear / cteFaturadoYear) * 100 : 0;

  // 7. ANÁLISE DE PERDAS
  const lostLoadsAnalysis = useMemo(() => {
    const lostLoads = loadsThisMonth.filter(l => l.status === 'PERDIDO');
    const totalLostValue = lostLoads.reduce((acc, curr) => acc + (curr.value || 0), 0);
    
    const byReason: Record<string, { count: number; value: number }> = {};
    const byDepartment: Record<string, { count: number; value: number }> = {
      'Comercial': { count: 0, value: 0 },
      'Operacional': { count: 0, value: 0 },
      'Não Informado': { count: 0, value: 0 }
    };

    lostLoads.forEach(load => {
      const reason = load.lostReason || 'Não Informado';
      const dept = load.lostBy || 'Não Informado';
      const val = load.value || 0;

      if (!byReason[reason]) byReason[reason] = { count: 0, value: 0 };
      byReason[reason].count += 1;
      byReason[reason].value += val;

      if (byDepartment[dept]) {
        byDepartment[dept].count += 1;
        byDepartment[dept].value += val;
      } else {
        byDepartment['Não Informado'].count += 1;
        byDepartment['Não Informado'].value += val;
      }
    });

    return {
      totalLostValue,
      totalLostCount: lostLoads.length,
      byReason: Object.entries(byReason).sort((a, b) => b[1].count - a[1].count),
      byDepartment: Object.entries(byDepartment).sort((a, b) => b[1].count - a[1].count)
    };
  }, [loadsThisMonth]);

  // 8. COMISSÕES E BÔNUS (MÊS ATUAL)
  const commissionSummary = useMemo(() => {
    let totalCommercialCommission = 0;
    let totalCommercialBonus = 0;
    let totalOperationalBonus = 0;

    // Comercial
    users.filter(u => u.role === 'Comercial').forEach(user => {
      const userLoads = loadsThisMonth.filter(l => l.commercialRep === user.name && l.status !== 'PERDIDO');
      const totalSales = userLoads.reduce((acc, l) => acc + (l.value || 0), 0);
      const totalCost = userLoads.reduce((acc, l) => acc + (l.cost || 0), 0);
      const costRatio = totalSales > 0 ? (totalCost / totalSales) * 100 : 0;

      const myRules = commissionRules.filter(r => r.role === 'Comercial');
      
      // Comissão
      const comissaoRule = myRules.find(r => r.type === 'Comissao_Faturamento' && totalSales >= (r.minRevenue || 0) && totalSales <= (r.maxRevenue || Infinity));
      if (comissaoRule && comissaoRule.commissionPercentage) {
        totalCommercialCommission += totalSales * (comissaoRule.commissionPercentage / 100);
      }

      // Bônus Extra
      const extraRules = myRules.filter(r => r.type === 'Meta_Extra');
      for (const rule of extraRules) {
        const targetRev = rule.targetRevenue || 0;
        const maxCost = rule.maxCostPercentage || 100;
        const bonus = rule.bonusAmount || 0;

        if (totalSales >= targetRev && costRatio <= maxCost && totalSales > 0) {
          totalCommercialBonus += bonus;
        }
      }
    });

    // Operacional
    users.filter(u => u.role === 'Operacional').forEach(user => {
      const userLoads = loadsThisMonth.filter(l => l.assignedProgrammer === user.name && l.status !== 'AGUARDANDO PROGRAMAÇÃO' && l.status !== 'PERDIDO');
      const totalValue = userLoads.reduce((acc, l) => acc + (l.value || 0), 0);
      const totalCost = userLoads.reduce((acc, l) => acc + (l.cost || 0), 0);
      const costRatio = totalValue > 0 ? (totalCost / totalValue) * 100 : 0;

      const myRules = commissionRules.filter(r => r.role === 'Operacional' && r.type === 'Meta_Extra');
      for (const rule of myRules) {
        const maxCost = rule.maxCostPercentage || 100;
        const bonus = rule.bonusAmount || 0;

        if (totalValue > 0 && costRatio <= maxCost) {
          totalOperationalBonus += bonus;
        }
      }
    });

    return {
      totalCommercialCommission,
      totalCommercialBonus,
      totalOperationalBonus,
      total: totalCommercialCommission + totalCommercialBonus + totalOperationalBonus
    };
  }, [loadsThisMonth, users, commissionRules]);

  // Gráfico de Volume (Simulado para a semana atual)
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
    <div className="flex flex-col w-full space-y-10 animate-in fade-in duration-500 pb-12" style={{ fontFamily: '"Book Antiqua", serif' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard Executivo</h2>
          <p className="text-gray-500 mt-1 italic">
            Visão Consolidada — Unidade: <span className="text-[#6D0019] font-bold">{unit}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-gray-600">
            <Clock size={14} className="text-gray-500" />
            Sincronizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* BLOCO 1 — VISÃO EXECUTIVA (Topo) */}
      {currentUser.role !== 'Gestor' && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Visão Executiva (Mês Atual)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <ExecStatCard 
              title="Faturamento (Caixa)" 
              subtitle="Entradas efetivadas"
              value={revenueCaixaMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
            />
            <ExecStatCard 
              title="Faturamento (Competência)" 
              subtitle="Receita bruta do mês"
              value={revenueCompetenciaMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
            />
            <ExecStatCard 
              title="Lucro (Caixa)" 
              subtitle="Entradas - Saídas"
              value={profitCaixaMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
              isProfit={true}
              isPositive={profitCaixaMonth >= 0}
            />
            <ExecStatCard 
              title="Lucro (Competência)" 
              subtitle="Receita - Custo"
              value={profitCompetenciaMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
              isProfit={true}
              isPositive={profitCompetenciaMonth >= 0}
            />
          </div>
        </div>
      )}

      {/* BLOCO 2 — ACUMULADO DO ANO (YTD) */}
      {currentUser.role !== 'Gestor' && (
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            Acumulado do Ano (YTD)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <ExecStatCard 
              title="Faturamento YTD (Caixa)" 
              subtitle="Acumulado anual"
              value={revenueCaixaYear.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
            />
            <ExecStatCard 
              title="Faturamento YTD (Competência)" 
              subtitle="Acumulado anual"
              value={revenueCompetenciaYear.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
            />
            <ExecStatCard 
              title="Lucro YTD (Caixa)" 
              subtitle="Acumulado anual"
              value={profitCaixaYear.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
              isProfit={true}
              isPositive={profitCaixaYear >= 0}
            />
            <ExecStatCard 
              title="Lucro YTD (Competência)" 
              subtitle="Acumulado anual"
              value={profitCompetenciaYear.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
              isProfit={true}
              isPositive={profitCompetenciaYear >= 0}
            />
          </div>
        </div>
      )}

      {/* BLOCO 3 — DESEMPENHO OPERACIONAL */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Desempenho Operacional
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gestão de CTE */}
          <div className="lg:col-span-6 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Gestão de CTE (Faturado vs Custo)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              <div className="flex flex-col justify-between bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Mês Atual</p>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${cteRatioMonth < 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {cteRatioMonth.toFixed(1)}% Custo
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Faturado</p>
                    <div className="text-xl font-bold text-gray-900">{cteFaturadoMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Custo Carreteiro</p>
                    <div className="text-xl font-bold text-gray-900">{cteCustoMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Acumulado (YTD)</p>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${cteRatioYear < 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {cteRatioYear.toFixed(1)}% Custo
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Faturado</p>
                    <div className="text-xl font-bold text-gray-900">{cteFaturadoYear.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Custo Carreteiro</p>
                    <div className="text-xl font-bold text-gray-900">{cteCustoYear.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clientes e Motoristas */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex-1 flex flex-col justify-center">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total de Clientes</p>
              <h4 className="text-4xl font-bold text-gray-900">{totalClients}</h4>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex-1 flex flex-col justify-center">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total de Motoristas</p>
              <h4 className="text-4xl font-bold text-gray-900">{totalDrivers}</h4>
            </div>
          </div>

          {/* Novos Clientes */}
          <div 
            className="lg:col-span-3 p-8 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#4A0011] text-white shadow-lg cursor-pointer hover:opacity-95 transition-opacity flex flex-col justify-between"
            onClick={() => setShowNewClientsModal(true)}
          >
            <div>
              <div className="p-3 rounded-full bg-white/10 w-fit mb-4"><UserPlus size={24} className="text-white/80" /></div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Novos Clientes</p>
              <p className="text-white/40 text-[10px] italic">Cadastrados no mês</p>
            </div>
            <div>
              <h4 className="text-5xl font-bold text-white mb-2">{newClientsThisMonth.length}</h4>
              <p className="text-white/50 text-xs flex items-center gap-1">Ver detalhes <ArrowUpRight size={14} /></p>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO 4 — INTELIGÊNCIA COMERCIAL */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Inteligência Comercial e Operacional
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {/* Ranking Comercial */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-[450px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Classificação Comercial</h3>
            <div className="space-y-4 overflow-y-auto pr-2">
              {commercialRanking.map((member, idx) => {
                const isTop3 = idx < 3;
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;
                const maxSales = commercialRanking[0]?.sales || 1;
                const progress = (member.sales / maxSales) * 100;
                
                return (
                  <div key={idx} className="flex flex-col gap-2 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isTop3 ? 'bg-white shadow-sm' : 'bg-transparent text-gray-400'}`}>
                          {medal}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{member.name}</p>
                          <p className="text-[11px] text-gray-500">{member.loads} cargas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{member.sales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        <p className="text-[11px] font-bold text-emerald-600">Mg: {member.marginPercent.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-[#6D0019] h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {commercialRanking.length === 0 && (
                <div className="text-center text-gray-400 py-10 text-sm">Nenhum dado comercial.</div>
              )}
            </div>
          </div>

          {/* Cargas Programadas */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-[450px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Cargas Programadas (Operacional)</h3>
            <div className="space-y-4 overflow-y-auto pr-2">
              {programmerRanking.map((programmer, idx) => {
                const isTop3 = idx < 3;
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;
                const maxLoads = programmerRanking[0]?.loads || 1;
                const progress = (programmer.loads / maxLoads) * 100;

                return (
                  <div key={idx} className="flex flex-col gap-2 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isTop3 ? 'bg-white shadow-sm' : 'bg-transparent text-gray-400'}`}>
                          {medal}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{programmer.name}</p>
                          <p className="text-[11px] text-gray-500">Operacional</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{programmer.loads}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">cargas</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-[#6D0019] h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {programmerRanking.length === 0 && (
                <div className="text-center text-gray-400 py-10 text-sm">Nenhum dado operacional.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* BLOCO 5 — ANÁLISE DE PERDAS */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Análise de Perdas (Mês Atual)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Resumo de Perdas */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-[450px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Resumo de Cargas Perdidas</h3>
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
              <div className="p-6 bg-red-50 rounded-full text-red-600 mb-2">
                <AlertTriangle size={48} />
              </div>
              <div>
                <p className="text-4xl font-black text-gray-900 mb-2">{lostLoadsAnalysis.totalLostCount}</p>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cargas Perdidas</p>
              </div>
              <div className="w-full h-px bg-gray-100"></div>
              <div>
                <p className="text-2xl font-bold text-red-600 mb-1">{lostLoadsAnalysis.totalLostValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valor Total Perdido</p>
              </div>
            </div>
          </div>

          {/* Motivos de Perda */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-[450px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Motivos de Perda</h3>
            <div className="space-y-4 overflow-y-auto pr-2">
              {lostLoadsAnalysis.byReason.map(([reason, data], idx) => {
                const maxCount = lostLoadsAnalysis.byReason[0]?.[1].count || 1;
                const progress = (data.count / maxCount) * 100;
                
                return (
                  <div key={idx} className="flex flex-col gap-2 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                          {data.count}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{reason}</p>
                          <p className="text-[11px] text-gray-500">{data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {lostLoadsAnalysis.byReason.length === 0 && (
                <div className="text-center text-gray-400 py-10 text-sm">Nenhuma carga perdida registrada.</div>
              )}
            </div>
          </div>

          {/* Perdas por Departamento */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-[450px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Perdas por Departamento</h3>
            <div className="space-y-4 overflow-y-auto pr-2">
              {lostLoadsAnalysis.byDepartment.map(([dept, data], idx) => {
                if (data.count === 0) return null;
                const maxCount = Math.max(...lostLoadsAnalysis.byDepartment.map(d => d[1].count)) || 1;
                const progress = (data.count / maxCount) * 100;
                
                return (
                  <div key={idx} className="flex flex-col gap-2 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                          {data.count}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{dept}</p>
                          <p className="text-[11px] text-gray-500">{data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {lostLoadsAnalysis.totalLostCount === 0 && (
                <div className="text-center text-gray-400 py-10 text-sm">Nenhuma carga perdida registrada.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO 6 — COMISSÕES E BÔNUS */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Comissões e Bônus (Mês Atual)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600"><DollarSign size={24} /></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Comissão Comercial</p>
            </div>
            <h4 className="text-4xl font-bold text-blue-600">
              {commissionSummary.totalCommercialCommission.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h4>
            <p className="text-xs text-gray-500 mt-2">Total de comissões sobre faturamento</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-emerald-50 text-emerald-600"><Star size={24} /></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Bônus Comercial</p>
            </div>
            <h4 className="text-4xl font-bold text-emerald-600">
              {commissionSummary.totalCommercialBonus.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h4>
            <p className="text-xs text-gray-500 mt-2">Bônus por metas atingidas (Comercial)</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-orange-50 text-orange-600"><Target size={24} /></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Bônus Operacional</p>
            </div>
            <h4 className="text-4xl font-bold text-orange-600">
              {commissionSummary.totalOperationalBonus.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h4>
            <p className="text-xs text-gray-500 mt-2">Bônus por metas de custo (Operacional)</p>
          </div>

          <div className="bg-[#6D0019] p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-white/10 text-white"><Briefcase size={24} /></div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Total a Pagar</p>
            </div>
            <h4 className="text-4xl font-bold text-white">
              {commissionSummary.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h4>
            <p className="text-xs text-white/70 mt-2">Soma de todas as comissões e bônus</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Volume Operacional
        </h3>
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-[500px]">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Volume da Semana</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataVolume} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontFamily: '"Book Antiqua", serif'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontFamily: '"Book Antiqua", serif'}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontFamily: '"Book Antiqua", serif', padding: '12px 20px'}} 
                />
                <Bar dataKey="volume" radius={[8, 8, 0, 0]} barSize={50} fill="#6D0019" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal de Novos Clientes */}
      {showNewClientsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Novos Clientes</h3>
                  <p className="text-xs text-gray-500">Cadastrados no mês atual</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNewClientsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {newClientsThisMonth.length > 0 ? (
                <div className="space-y-3">
                  {newClientsThisMonth.map(client => (
                    <div key={client.id} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between hover:border-emerald-200 transition-colors bg-white">
                      <div>
                        <p className="font-bold text-gray-800">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.cnpj} • {client.city}/{client.state}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full">
                          {client.status}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">Rep: {client.commercialRep}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserPlus size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium">Nenhum cliente novo cadastrado este mês.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componentes Auxiliares
const ExecStatCard = ({ title, subtitle, value, isPositive, isProfit }: any) => (
  <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-full border border-gray-50">
    <div>
      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
      <p className="text-gray-400 text-[10px] italic mb-4">{subtitle}</p>
    </div>
    <div className="flex items-end justify-between">
      <h4 className="text-3xl font-bold text-gray-900 tracking-tight">
        {value}
      </h4>
      {isProfit && (
        <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        </div>
      )}
    </div>
  </div>
);

export default DashboardModule;
