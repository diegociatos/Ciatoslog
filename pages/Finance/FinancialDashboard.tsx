import React, { useState, useMemo } from 'react';
import { 
  CircleDollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Building2, Receipt, Calendar, AlertCircle, Clock
} from 'lucide-react';
import { Transaction, BankAccount, User as UserType, CteRecord } from '../../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FinancialDashboardProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  bankAccounts: BankAccount[];
  currentUser: UserType;
  ctes: CteRecord[];
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ transactions, setTransactions, bankAccounts, currentUser, ctes }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const totalBalance = bankAccounts.reduce((acc, curr) => acc + curr.balance, 0);

  // --- CAIXA (Cash Basis) ---
  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
  });

  const monthlyRevenueCaixa = currentMonthTransactions
    .filter(t => t.type === 'ENTRADA' && t.status === 'EFETIVADO')
    .reduce((acc, curr) => acc + curr.value, 0);

  const monthlyExpensesCaixa = currentMonthTransactions
    .filter(t => t.type === 'SAIDA' && t.status === 'EFETIVADO')
    .reduce((acc, curr) => acc + curr.value, 0);

  const lucroLiquidoCaixa = monthlyRevenueCaixa - monthlyExpensesCaixa;

  // --- COMPETÊNCIA (Accrual Basis) ---
  const currentMonthCtes = ctes.filter(c => {
    const d = new Date(c.emissionDate);
    return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear && c.status !== 'CANCELADO';
  });

  const receitaBrutaCompetencia = currentMonthCtes.reduce((acc, curr) => acc + curr.cteValue, 0);
  const custoCarreteiroCompetencia = currentMonthCtes.reduce((acc, curr) => acc + curr.driverFreight, 0);
  
  // Despesas operacionais (excluindo custo carreteiro que já foi calculado acima)
  // Assumimos que a categoria 5 é custo carreteiro, então pegamos as outras saídas
  const outrasDespesasCompetencia = currentMonthTransactions
    .filter(t => t.type === 'SAIDA' && t.cat !== '5')
    .reduce((acc, curr) => acc + curr.value, 0);

  const lucroLiquidoCompetencia = receitaBrutaCompetencia - custoCarreteiroCompetencia - outrasDespesasCompetencia;
  const margemBruta = receitaBrutaCompetencia > 0 ? ((receitaBrutaCompetencia - custoCarreteiroCompetencia) / receitaBrutaCompetencia) * 100 : 0;
  const margemLiquida = receitaBrutaCompetencia > 0 ? (lucroLiquidoCompetencia / receitaBrutaCompetencia) * 100 : 0;

  // --- RECEBÍVEIS E INADIMPLÊNCIA ---
  const today = new Date().toISOString().split('T')[0];
  
  const ctesNaoPagos = ctes.filter(c => !c.isPaid && c.status !== 'CANCELADO');
  const valorAReceber = ctesNaoPagos.reduce((acc, curr) => acc + curr.cteValue, 0);
  
  const ctesInadimplentes = ctesNaoPagos.filter(c => c.dueDate && c.dueDate < today);
  const valorInadimplencia = ctesInadimplentes.reduce((acc, curr) => acc + curr.cteValue, 0);
  
  // Clientes Inadimplentes (agrupados)
  const clientesInadimplentesMap = new Map<string, number>();
  ctesInadimplentes.forEach(c => {
    const current = clientesInadimplentesMap.get(c.customer) || 0;
    clientesInadimplentesMap.set(c.customer, current + c.cteValue);
  });
  const clientesInadimplentes = Array.from(clientesInadimplentesMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Prazo Médio de Recebimentos (em dias)
  let totalDias = 0;
  let countCtesComVencimento = 0;
  ctes.filter(c => c.status !== 'CANCELADO' && c.dueDate).forEach(c => {
    const emission = new Date(c.emissionDate);
    const due = new Date(c.dueDate!);
    const diffTime = Math.abs(due.getTime() - emission.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    totalDias += diffDays;
    countCtesComVencimento++;
  });
  const prazoMedioRecebimento = countCtesComVencimento > 0 ? Math.round(totalDias / countCtesComVencimento) : 0;

  // Chart data (last 6 months - Caixa)
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(selectedYear, selectedMonth - 1, 1);
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth();
    const year = d.getFullYear();
    
    const monthTrans = transactions.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === month && td.getFullYear() === year && t.status === 'EFETIVADO';
    });

    const rev = monthTrans.filter(t => t.type === 'ENTRADA').reduce((acc, curr) => acc + curr.value, 0);
    const exp = monthTrans.filter(t => t.type === 'SAIDA').reduce((acc, curr) => acc + curr.value, 0);

    chartData.push({
      name: d.toLocaleString('pt-BR', { month: 'short' }),
      Receitas: rev,
      Despesas: exp
    });
  }

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50/50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Dashboard Financeiro
          </h1>
          <p className="text-gray-500 mt-1">Visão geral de caixa e competência.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <Calendar size={20} className="text-gray-400 ml-2" />
          <select 
            className="bg-transparent border-none text-gray-700 font-bold focus:ring-0 cursor-pointer"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}
              </option>
            ))}
          </select>
          <select 
            className="bg-transparent border-none text-gray-700 font-bold focus:ring-0 cursor-pointer"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs Competência */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">Resultados por Competência (CTEs Emitidos)</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm mb-1">Receita Bruta</h3>
          <div className="text-2xl font-black text-blue-600 tracking-tight">{formatMoney(receitaBrutaCompetencia)}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm mb-1">Custo Carreteiro</h3>
          <div className="text-2xl font-black text-red-600 tracking-tight">{formatMoney(custoCarreteiroCompetencia)}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm mb-1">Margem Bruta</h3>
          <div className="text-2xl font-black text-gray-900 tracking-tight">{margemBruta.toFixed(2)}%</div>
          <p className="text-xs text-gray-400 mt-1">Receita vs Custo Carreteiro</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm mb-1">Lucro Líquido / Margem</h3>
          <div className={`text-2xl font-black tracking-tight ${lucroLiquidoCompetencia >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatMoney(lucroLiquidoCompetencia)}
          </div>
          <p className="text-xs text-gray-400 mt-1">{margemLiquida.toFixed(2)}% de Margem Líquida</p>
        </div>
      </div>

      {/* KPIs Caixa */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">Resultados de Caixa (Efetivados)</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <h3 className="text-gray-500 font-medium text-sm mb-1">Saldo em Contas</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{formatMoney(totalBalance)}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm mb-1">Entradas (Mês)</h3>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">{formatMoney(monthlyRevenueCaixa)}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm mb-1">Saídas (Mês)</h3>
          <div className="text-2xl font-black text-red-600 tracking-tight">{formatMoney(monthlyExpensesCaixa)}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm mb-1">Saldo do Mês</h3>
          <div className={`text-2xl font-black tracking-tight ${lucroLiquidoCaixa >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatMoney(lucroLiquidoCaixa)}
          </div>
        </div>
      </div>

      {/* Recebíveis e Inadimplência */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">Recebíveis e Inadimplência (Geral)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Receipt size={24} /></div>
          <div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Valor a Receber</h3>
            <div className="text-2xl font-black text-gray-900 tracking-tight">{formatMoney(valorAReceber)}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl"><AlertCircle size={24} /></div>
          <div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Inadimplência</h3>
            <div className="text-2xl font-black text-red-600 tracking-tight">{formatMoney(valorInadimplencia)}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Clock size={24} /></div>
          <div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Prazo Médio Recebimento</h3>
            <div className="text-2xl font-black text-gray-900 tracking-tight">{prazoMedioRecebimento} dias</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Fluxo de Caixa */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CircleDollarSign size={20} className="text-bordeaux" />
            Fluxo de Caixa (Últimos 6 Meses)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `R$ ${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatMoney(value)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clientes Inadimplentes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            Clientes Inadimplentes
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-72 pr-2">
            {clientesInadimplentes.map((c, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-red-50/50 rounded-xl border border-red-100">
                <span className="font-bold text-gray-800 text-sm truncate max-w-[150px]" title={c.name}>{c.name}</span>
                <span className="font-black text-red-600 text-sm">{formatMoney(c.value)}</span>
              </div>
            ))}
            {clientesInadimplentes.length === 0 && (
              <div className="text-center text-gray-500 italic py-4">Nenhum cliente inadimplente.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
