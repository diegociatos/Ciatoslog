import React from 'react';
import { 
  CircleDollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Building2, Receipt
} from 'lucide-react';
import { Transaction, BankAccount, User as UserType } from '../../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FinancialDashboardProps {
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  currentUser: UserType;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ transactions, bankAccounts, currentUser }) => {
  const totalBalance = bankAccounts.reduce((acc, curr) => acc + curr.balance, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyRevenue = currentMonthTransactions
    .filter(t => t.type === 'ENTRADA' && t.status === 'EFETIVADO')
    .reduce((acc, curr) => acc + curr.value, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'SAIDA' && t.status === 'EFETIVADO')
    .reduce((acc, curr) => acc + curr.value, 0);

  const pendingPayables = transactions
    .filter(t => t.type === 'SAIDA' && t.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.value, 0);

  const pendingReceivables = transactions
    .filter(t => t.type === 'ENTRADA' && t.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.value, 0);

  // Chart data (last 6 months)
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
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

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50/50">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Olá, {currentUser.name.split(' ')[0]}! 💰
        </h1>
        <p className="text-gray-500 mt-1">Aqui está o resumo financeiro da operação.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <Wallet size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Saldo em Contas</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Receitas do Mês</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight text-blue-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyRevenue)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <TrendingDown size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Despesas do Mês</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight text-red-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyExpenses)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Receipt size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">A Pagar / A Receber</h3>
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pagar:</span>
                <span className="font-bold text-red-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingPayables)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Receber:</span>
                <span className="font-bold text-emerald-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingReceivables)}</span>
              </div>
            </div>
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
                  formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Últimas Movimentações */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Receipt size={20} className="text-bordeaux" />
            Últimas Movimentações
          </h3>
          <div className="space-y-4">
            {transactions.slice(0, 6).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${t.type === 'ENTRADA' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'ENTRADA' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{t.desc}</div>
                    <div className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm ${t.type === 'ENTRADA' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'ENTRADA' ? '+' : '-'}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.value)}
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${t.status === 'EFETIVADO' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {t.status}
                  </div>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center text-gray-500 italic py-4">Nenhuma movimentação registrada.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
