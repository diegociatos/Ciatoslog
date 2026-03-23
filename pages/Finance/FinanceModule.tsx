import React, { useState, useMemo } from 'react';
import { 
  ArrowUpCircle, ArrowDownCircle, Wallet, Download, Calendar,
  TrendingUp, Scale, FileSpreadsheet, Plus, CheckCircle, Clock, X, Building2, Layers
} from 'lucide-react';
import { Transaction, BankAccount, DRECategory } from '../../App';

type FinanceTab = 'Fluxo de Caixa' | 'Ordens de Pagamento' | 'DRE';

interface FinanceModuleProps {
  unit: string;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'ownerId'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  bankAccounts: BankAccount[];
  dreCategories: DRECategory[];
  clients: any[];
}

const formatCurrency = (val: number) => 
  val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const FinanceModule: React.FC<FinanceModuleProps> = ({ 
  unit, 
  transactions, 
  addTransaction, 
  updateTransaction,
  bankAccounts,
  dreCategories,
  clients
}) => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('Fluxo de Caixa');

  const completedTransactions = transactions.filter(t => t.status === 'EFETIVADO');
  const pendingTransactions = transactions.filter(t => t.status === 'PENDENTE');

  const totalIn = completedTransactions.filter(i => i.type === 'ENTRADA').reduce((a, b) => a + b.value, 0);
  const totalOut = completedTransactions.filter(i => i.type === 'SAIDA').reduce((a, b) => a + b.value, 0);

  const renderContent = () => {
    switch (activeTab) {
      case 'Fluxo de Caixa':
        return <CashFlow 
          transactions={completedTransactions} 
          bankAccounts={bankAccounts}
          dreCategories={dreCategories}
          addTransaction={addTransaction}
          clients={clients}
        />;
      case 'Ordens de Pagamento':
        return <PaymentOrders 
          transactions={pendingTransactions} 
          updateTransaction={updateTransaction} 
          bankAccounts={bankAccounts} 
          dreCategories={dreCategories}
          clients={clients}
        />;
      case 'DRE':
        return <DynamicDRE transactions={completedTransactions} dreCategories={dreCategories} clients={clients} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Financeiro & Controladoria</h2>
          <p className="text-gray-500 italic">Gestão de resultados, fluxo de caixa e auditoria contábil.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 shadow-sm transition-all">
            <Calendar size={18} /> Novembro / 2023
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 bg-white rounded-t-3xl shadow-sm px-6">
        {[
          { id: 'Fluxo de Caixa', label: 'Fluxo de Caixa', icon: <Wallet size={18} /> },
          { id: 'Ordens de Pagamento', label: 'Ordens de Pagamento', icon: <Clock size={18} /> },
          { id: 'DRE', label: 'DRE', icon: <FileSpreadsheet size={18} /> }
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FinanceTab)}
            className={`px-8 py-5 font-black text-xs uppercase tracking-widest transition-all border-b-4 flex items-center gap-3 ${
              activeTab === tab.id 
                ? 'border-bordeaux text-bordeaux bg-bordeaux/5' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.icon} {tab.label}
            {tab.id === 'Ordens de Pagamento' && pendingTransactions.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingTransactions.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="py-4">
        {renderContent()}
      </div>
    </div>
  );
};

// --- Cash Flow Component ---
const CashFlow = ({ transactions, bankAccounts, dreCategories, addTransaction, clients }: any) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'ENTRADA' | 'SAIDA'>('SAIDA');
  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts.length > 0 ? bankAccounts[0].id : '');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    value: '',
    cat: '',
    desc: '',
    bankAccountId: selectedBankId,
    cte: '',
    clientName: ''
  });

  const selectedBank = bankAccounts.find((b: any) => b.id === selectedBankId);
  const initialBalance = selectedBank ? selectedBank.initialBalance : 0;

  const filteredTransactions = selectedBankId 
    ? transactions.filter((t: any) => t.bankAccountId === selectedBankId)
    : [];

  const totalIn = filteredTransactions.filter((i: any) => i.type === 'ENTRADA').reduce((a: any, b: any) => a + b.value, 0);
  const totalOut = filteredTransactions.filter((i: any) => i.type === 'SAIDA').reduce((a: any, b: any) => a + b.value, 0);

  // Calculate running balance
  let currentBalance = initialBalance;
  const transactionsWithBalance = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => {
    if (t.type === 'ENTRADA') currentBalance += t.value;
    else currentBalance -= t.value;
    return { ...t, balance: currentBalance };
  }).reverse(); // Show newest first

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      date: formData.date,
      type: modalType,
      value: parseFloat(formData.value),
      cat: formData.cat,
      desc: formData.desc,
      status: 'EFETIVADO',
      bankAccountId: formData.bankAccountId,
      cte: formData.cte,
      clientName: formData.clientName
    });
    setShowModal(false);
    setFormData({ date: new Date().toISOString().split('T')[0], value: '', cat: '', desc: '', bankAccountId: selectedBankId, cte: '', clientName: '' });
  };

  const openModal = (type: 'ENTRADA' | 'SAIDA') => {
    setModalType(type);
    setFormData(prev => ({ ...prev, clientName: '' })); // Reset client when opening
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Bank Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {bankAccounts.map((bank: any) => (
          <button
            key={bank.id}
            onClick={() => {
              setSelectedBankId(bank.id);
              setFormData(prev => ({ ...prev, bankAccountId: bank.id }));
            }}
            className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
              selectedBankId === bank.id 
                ? 'bg-bordeaux text-white shadow-md' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {bank.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard title="Saldo Inicial" value={initialBalance} type="initial" icon={<Wallet />} />
        <SummaryCard title="Entradas" value={totalIn} type="in" icon={<ArrowUpCircle />} />
        <SummaryCard title="Saídas" value={totalOut} type="out" icon={<ArrowDownCircle />} />
        <SummaryCard title="Saldo Atual" value={initialBalance + totalIn - totalOut} type="balance" icon={<Wallet />} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">Lançamentos do Fluxo de Caixa</h3>
          <div className="flex gap-2">
            <button onClick={() => openModal('ENTRADA')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md hover:opacity-90">
              <Plus size={16} /> Nova Receita
            </button>
            <button onClick={() => openModal('SAIDA')} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md hover:opacity-90">
              <Plus size={16} /> Nova Despesa
            </button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 py-4">Data</th>
                <th className="px-4 py-4">Entrada</th>
                <th className="px-4 py-4">Saída</th>
                <th className="px-4 py-4">Saldo</th>
                <th className="px-4 py-4">Receita/Despesa</th>
                <th className="px-4 py-4">Detalhamento</th>
                <th className="px-4 py-4">CTe</th>
                <th className="px-4 py-4">Banco/Caixa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactionsWithBalance.map((item: any) => {
                const bank = bankAccounts.find((b: any) => b.id === item.bankAccountId);
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="px-4 py-3 text-gray-500 italic">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{item.type === 'ENTRADA' ? formatCurrency(item.value) : '-'}</td>
                    <td className="px-4 py-3 font-bold text-red-600">{item.type === 'SAIDA' ? formatCurrency(item.value) : '-'}</td>
                    <td className={`px-4 py-3 font-bold ${item.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(item.balance)}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-1 bg-gray-100 rounded-full text-gray-600 font-bold uppercase">
                        {dreCategories.find((c: any) => c.id === item.cat) ? dreCategories.find((c: any) => c.id === item.cat)?.name : item.cat}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.desc} {item.clientName ? `(${item.clientName})` : ''}</td>
                    <td className="px-4 py-3 text-gray-500">{item.cte || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{bank ? bank.name : '-'}</td>
                  </tr>
                );
              })}
              {transactionsWithBalance.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 italic">Nenhum lançamento encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Nova {modalType === 'ENTRADA' ? 'Receita' : 'Despesa'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                  <input 
                    type="date" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor (R$)</label>
                  <input 
                    type="number" step="0.01" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Banco / Caixa</label>
                  <select 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    value={formData.bankAccountId} onChange={e => setFormData({...formData, bankAccountId: e.target.value})} required
                  >
                    <option value="">Selecione...</option>
                    {bankAccounts.map((b: any) => <option key={b.id} value={b.id}>{b.name} ({b.type})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria DRE</label>
                  <select 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    value={formData.cat} onChange={e => setFormData({...formData, cat: e.target.value})} required
                  >
                    <option value="">Selecione...</option>
                    {dreCategories.filter((c: any) => modalType === 'ENTRADA' ? c.group.includes('RECEITA') : !c.group.includes('RECEITA')).map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.group})</option>)}
                  </select>
                </div>
                {modalType === 'ENTRADA' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
                    <select 
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                      value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} required
                    >
                      <option value="">Selecione o Cliente...</option>
                      {clients && clients.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fornecedor / Beneficiário (Opcional)</label>
                    <input 
                      type="text" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                      value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})}
                      placeholder="Ex: Posto Shell"
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detalhamento / Descrição</label>
                  <input 
                    type="text" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CTe (Opcional)</label>
                  <input 
                    type="text" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    value={formData.cte} onChange={e => setFormData({...formData, cte: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-bordeaux text-white font-bold rounded-lg shadow-md hover:opacity-90">Salvar Lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Payment Orders Component ---
const PaymentOrders = ({ transactions, updateTransaction, bankAccounts, dreCategories }: any) => {
  const [payingTx, setPayingTx] = useState<any>(null);
  const [payData, setPayData] = useState({ bankAccountId: '', date: new Date().toISOString().split('T')[0] });

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (payingTx) {
      updateTransaction({
        ...payingTx,
        status: 'EFETIVADO',
        bankAccountId: payData.bankAccountId,
        date: payData.date
      });
      setPayingTx(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg">Ordens de Pagamento Pendentes</h3>
        <p className="text-sm text-gray-500">Lançamentos gerados pela programação aguardando efetivação no caixa.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Data Origem</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500 italic">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{item.desc}</td>
                <td className="px-6 py-4">
                  <span className="text-[10px] px-2 py-1 bg-gray-100 rounded-full text-gray-500 font-bold uppercase tracking-widest">
                    {dreCategories.find((c: any) => c.id === item.cat) ? dreCategories.find((c: any) => c.id === item.cat)?.name : item.cat}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-red-600">
                  {formatCurrency(item.value)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => setPayingTx(item)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle size={14} /> Efetivar Pagamento
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">Nenhuma ordem de pagamento pendente.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Efetivar Pagamento */}
      {payingTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Efetivar Pagamento</h3>
              <button onClick={() => setPayingTx(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Pagando:</p>
              <p className="font-bold text-gray-800">{payingTx.desc}</p>
              <p className="text-xl font-black text-red-600 mt-2">{formatCurrency(payingTx.value)}</p>
            </div>
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data do Pagamento</label>
                <input 
                  type="date" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                  value={payData.date} onChange={e => setPayData({...payData, date: e.target.value})} required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Conta Bancária / Caixa</label>
                <select 
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                  value={payData.bankAccountId} onChange={e => setPayData({...payData, bankAccountId: e.target.value})} required
                >
                  <option value="">Selecione de onde saiu o dinheiro...</option>
                  {bankAccounts.map((b: any) => <option key={b.id} value={b.id}>{b.name} ({b.type})</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setPayingTx(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-md hover:bg-emerald-700 flex items-center gap-2">
                  <CheckCircle size={18} /> Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Dynamic DRE Component ---
const DynamicDRE = ({ transactions, dreCategories }: any) => {
  const [viewMode, setViewMode] = useState<'GLOBAL' | 'BD' | 'LOG'>('GLOBAL');
  const [periodicity, setPeriodicity] = useState<'MENSAL' | 'TRIMESTRAL' | 'ANUAL'>('MENSAL');

  let txs = transactions.filter((t: any) => t.status === 'EFETIVADO');
  if (viewMode !== 'GLOBAL') {
    txs = txs.filter((t: any) => t.ownerId === viewMode);
  }

  const getPeriodKey = (dateStr: string) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    if (periodicity === 'ANUAL') return `${year}`;
    const month = d.getMonth() + 1;
    if (periodicity === 'MENSAL') return `${year}-${String(month).padStart(2, '0')}`;
    const quarter = Math.ceil(month / 3);
    return `${year}-Q${quarter}`;
  };

  let minYear = new Date().getFullYear();
  let maxYear = new Date().getFullYear();

  if (txs.length > 0) {
    const years = txs.map((t: any) => new Date(t.date).getFullYear()).filter((y: number) => !isNaN(y));
    if (years.length > 0) {
      minYear = Math.min(...years);
      maxYear = Math.max(...years);
    }
  }

  const periods: string[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    if (periodicity === 'ANUAL') {
      periods.push(`${year}`);
    } else if (periodicity === 'TRIMESTRAL') {
      for (let q = 1; q <= 4; q++) {
        periods.push(`${year}-Q${q}`);
      }
    } else if (periodicity === 'MENSAL') {
      for (let m = 1; m <= 12; m++) {
        periods.push(`${year}-${String(m).padStart(2, '0')}`);
      }
    }
  }
  const columns = [...periods, 'TOTAL'];

  const formatPeriod = (periodStr: string) => {
    if (periodStr === 'TOTAL') return 'TOTAL';
    if (periodicity === 'ANUAL') return periodStr;
    if (periodicity === 'TRIMESTRAL') {
      const [year, q] = periodStr.split('-');
      return `${q} ${year}`;
    }
    const [year, month] = periodStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '').toUpperCase();
  };

  const filterByPeriod = (txList: any[], periodKey: string) => {
    if (periodKey === 'TOTAL') return txList;
    return txList.filter(t => getPeriodKey(t.date) === periodKey);
  };

  const getGroupTotal = (groupId: string, periodKey: string) => {
    const groupCats = dreCategories.filter((c: any) => c.group === groupId).map((c: any) => c.id);
    let filteredTxs = txs.filter((t: any) => groupCats.includes(t.cat));
    filteredTxs = filterByPeriod(filteredTxs, periodKey);
    return filteredTxs.reduce((acc: number, t: any) => acc + (t.type === 'ENTRADA' ? t.value : -t.value), 0);
  };

  const getCatTotal = (catId: string, periodKey: string) => {
    let filteredTxs = txs.filter((t: any) => t.cat === catId);
    filteredTxs = filterByPeriod(filteredTxs, periodKey);
    return filteredTxs.reduce((acc: number, t: any) => acc + (t.type === 'ENTRADA' ? t.value : -t.value), 0);
  };

  const getClientTotal = (clientName: string, periodKey: string) => {
    const groupCats = dreCategories.filter((c: any) => c.group === 'RECEITA_BRUTA_CAIXA').map((c: any) => c.id);
    let filteredTxs = txs.filter((t: any) => groupCats.includes(t.cat) && t.clientName === clientName);
    filteredTxs = filterByPeriod(filteredTxs, periodKey);
    return filteredTxs.reduce((acc: number, t: any) => acc + (t.type === 'ENTRADA' ? t.value : -t.value), 0);
  };

  const getOtherClientsTotal = (periodKey: string) => {
    const groupCats = dreCategories.filter((c: any) => c.group === 'RECEITA_BRUTA_CAIXA').map((c: any) => c.id);
    let filteredTxs = txs.filter((t: any) => groupCats.includes(t.cat) && !t.clientName);
    filteredTxs = filterByPeriod(filteredTxs, periodKey);
    return filteredTxs.reduce((acc: number, t: any) => acc + (t.type === 'ENTRADA' ? t.value : -t.value), 0);
  };

  const renderRow = (label: string, values: number[], styleClass: string) => (
    <div className={`flex border-b border-gray-200 ${styleClass}`}>
      <div className="w-64 flex-shrink-0 px-2 py-1 text-xs border-r border-gray-200 flex items-center">
        {label}
      </div>
      {values.map((val, idx) => (
        <div key={idx} className="flex-1 min-w-[100px] px-2 py-1 text-right text-xs border-r border-gray-200 flex items-center justify-end">
          {val === 0 ? '-' : formatCurrency(val)}
        </div>
      ))}
    </div>
  );

  const renderGroupItems = (groupId: string) => {
    if (groupId === 'RECEITA_BRUTA_CAIXA') {
      // Get unique clients that have transactions in this group
      const groupCats = dreCategories.filter((c: any) => c.group === groupId).map((c: any) => c.id);
      const groupTxs = txs.filter((t: any) => groupCats.includes(t.cat));
      const clientNames = Array.from(new Set(groupTxs.map((t: any) => t.clientName).filter(Boolean))) as string[];
      
      let index = 0;
      const rows = clientNames.map(clientName => {
        const values = columns.map(m => getClientTotal(clientName, m));
        index++;
        return renderRow(`- ${clientName}`, values, index % 2 === 0 ? 'bg-white text-black' : 'bg-gray-50 text-black');
      });

      // Add "Outros" if there are transactions without a client
      const hasOthers = groupTxs.some((t: any) => !t.clientName);
      if (hasOthers) {
        const values = columns.map(m => getOtherClientsTotal(m));
        index++;
        rows.push(renderRow('- Outros', values, index % 2 === 0 ? 'bg-white text-black' : 'bg-gray-50 text-black'));
      }
      return rows;
    }

    const cats = dreCategories.filter((c: any) => c.group === groupId);
    return cats.map((cat: any, index: number) => {
      const values = columns.map(m => getCatTotal(cat.id, m));
      return renderRow(cat.name, values, index % 2 === 0 ? 'bg-white text-black' : 'bg-gray-50 text-black');
    });
  };

  const getCalculatedRow = (calcFn: (m: string) => number, label: string, styleClass: string) => {
    const values = columns.map(m => calcFn(m));
    return renderRow(label, values, styleClass);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <button 
            onClick={() => setViewMode('GLOBAL')}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${viewMode === 'GLOBAL' ? 'bg-bordeaux text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Layers size={18} /> DRE Global Consolidado
          </button>
          <button 
            onClick={() => setViewMode('BD')}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${viewMode === 'BD' ? 'bg-bordeaux text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Building2 size={18} /> BD Transportes
          </button>
          <button 
            onClick={() => setViewMode('LOG')}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${viewMode === 'LOG' ? 'bg-bordeaux text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Building2 size={18} /> Ciatoslog
          </button>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['MENSAL', 'TRIMESTRAL', 'ANUAL'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriodicity(p)}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${periodicity === p ? 'bg-white text-bordeaux shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {p.charAt(0) + p.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="min-w-max">
          {/* Header */}
          <div className="flex bg-black text-white font-bold text-xs">
            <div className="w-64 flex-shrink-0 px-2 py-2 border-r border-gray-700 flex items-center justify-center">
              {viewMode === 'GLOBAL' ? 'CONSOLIDADO' : (viewMode === 'BD' ? 'BD TRANSPORTES' : 'CIATOSLOG')}
            </div>
            {columns.map((col, idx) => (
              <div key={idx} className="flex-1 min-w-[100px] px-2 py-2 border-r border-gray-700 flex flex-col items-center justify-center text-center">
                <span>{formatPeriod(col)}</span>
                <span className="text-[10px] font-normal">Efetivo</span>
              </div>
            ))}
          </div>

          {/* DRE Body */}
          {getCalculatedRow(m => getGroupTotal('RECEITA_BRUTA_COMPETENCIA', m), 'RECEITA OPERACIONAL POR COMPETÊNCIA', 'bg-black text-white font-bold')}
          {renderGroupItems('RECEITA_BRUTA_COMPETENCIA')}

          {getCalculatedRow(m => getGroupTotal('RECEITA_BRUTA_CAIXA', m), 'RECEITA OPERACIONAL BRUTA', 'bg-black text-white font-bold')}
          {renderGroupItems('RECEITA_BRUTA_CAIXA')}

          {getCalculatedRow(m => getGroupTotal('TRIBUTOS', m), 'TRIBUTOS', 'bg-bordeaux text-white font-bold')}
          {renderGroupItems('TRIBUTOS')}

          {getCalculatedRow(m => getGroupTotal('RECEITA_BRUTA_CAIXA', m) + getGroupTotal('TRIBUTOS', m), 'RECEITA OPERACIONAL LÍQUIDA', 'bg-black text-white font-bold')}
          
          {getCalculatedRow(m => getGroupTotal('CUSTO_DIRETO_PESSOAL', m) + getGroupTotal('CUSTO_DIRETO_OPERACIONAL', m), 'CUSTO DIRETO TOTAL', 'bg-bordeaux text-white font-bold')}
          
          {getCalculatedRow(m => getGroupTotal('CUSTO_DIRETO_PESSOAL', m), 'CUSTO DIRETO PESSOAL', 'bg-bordeaux text-white font-bold')}
          {renderGroupItems('CUSTO_DIRETO_PESSOAL')}

          {getCalculatedRow(m => getGroupTotal('CUSTO_DIRETO_OPERACIONAL', m), 'CUSTO DIRETO', 'bg-bordeaux text-white font-bold')}
          {renderGroupItems('CUSTO_DIRETO_OPERACIONAL')}

          {getCalculatedRow(m => (getGroupTotal('RECEITA_BRUTA_CAIXA', m) + getGroupTotal('TRIBUTOS', m)) + (getGroupTotal('CUSTO_DIRETO_PESSOAL', m) + getGroupTotal('CUSTO_DIRETO_OPERACIONAL', m)), 'LUCRO BRUTO', 'bg-black text-white font-bold')}

          {getCalculatedRow(m => getGroupTotal('DESPESAS_COMERCIAIS', m) + getGroupTotal('DESPESAS_ADMINISTRATIVAS', m) + getGroupTotal('DESPESAS_FINANCEIRAS', m), 'DESPESAS OPERACIONAIS', 'bg-bordeaux text-white font-bold')}

          {getCalculatedRow(m => getGroupTotal('DESPESAS_COMERCIAIS', m), 'DESPESAS COMERCIAIS', 'bg-white text-bordeaux font-bold')}
          {renderGroupItems('DESPESAS_COMERCIAIS')}

          {getCalculatedRow(m => getGroupTotal('DESPESAS_ADMINISTRATIVAS', m), 'DESPESAS ADMINISTRATIVAS', 'bg-white text-bordeaux font-bold')}
          {renderGroupItems('DESPESAS_ADMINISTRATIVAS')}

          {getCalculatedRow(m => getGroupTotal('DESPESAS_FINANCEIRAS', m), 'DESPESAS FINANCEIRAS', 'bg-white text-bordeaux font-bold')}
          {renderGroupItems('DESPESAS_FINANCEIRAS')}

          {getCalculatedRow(m => (getGroupTotal('RECEITA_BRUTA_CAIXA', m) + getGroupTotal('TRIBUTOS', m)) + (getGroupTotal('CUSTO_DIRETO_PESSOAL', m) + getGroupTotal('CUSTO_DIRETO_OPERACIONAL', m)) + (getGroupTotal('DESPESAS_COMERCIAIS', m) + getGroupTotal('DESPESAS_ADMINISTRATIVAS', m) + getGroupTotal('DESPESAS_FINANCEIRAS', m)), 'LUCRO LÍQUIDO', 'bg-[#1f497d] text-white font-bold')}

          {getCalculatedRow(m => getGroupTotal('INVESTIMENTOS', m), 'INVESTIMENTOS', 'bg-bordeaux text-white font-bold')}
          {renderGroupItems('INVESTIMENTOS')}

          {getCalculatedRow(m => ((getGroupTotal('RECEITA_BRUTA_CAIXA', m) + getGroupTotal('TRIBUTOS', m)) + (getGroupTotal('CUSTO_DIRETO_PESSOAL', m) + getGroupTotal('CUSTO_DIRETO_OPERACIONAL', m)) + (getGroupTotal('DESPESAS_COMERCIAIS', m) + getGroupTotal('DESPESAS_ADMINISTRATIVAS', m) + getGroupTotal('DESPESAS_FINANCEIRAS', m))) + getGroupTotal('INVESTIMENTOS', m), 'RESULTADO DO EXERCÍCIO', 'bg-[#1f497d] text-white font-bold')}
        </div>
      </div>
    </div>
  );
};



const SummaryCard = ({ title, value, type, icon }: { title: string, value: number, type: 'in' | 'out' | 'balance' | 'initial', icon: any }) => {
  const colors = {
    in: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    out: 'text-red-600 bg-red-50 border-red-100',
    balance: 'text-bordeaux bg-white border-bordeaux shadow-md',
    initial: 'text-gray-600 bg-gray-50 border-gray-200'
  };
  
  return (
    <div className={`p-6 rounded-2xl border ${colors[type]} transition-all flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold uppercase text-xs tracking-tighter opacity-70">{title}</span>
        <div className="p-2 rounded-lg bg-current bg-opacity-10">{icon}</div>
      </div>
      <h4 className="text-2xl font-black">{formatCurrency(value)}</h4>
    </div>
  );
};

export default FinanceModule;
