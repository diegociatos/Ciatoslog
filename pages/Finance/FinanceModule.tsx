import React, { useState, useMemo } from 'react';
import { 
  ArrowUpCircle, ArrowDownCircle, Wallet, Download, Calendar,
  TrendingUp, Scale, FileSpreadsheet, Plus, CheckCircle, Clock, X, Building2, Layers, ArrowUp, ArrowDown
} from 'lucide-react';
import { Transaction, BankAccount, DRECategory, CteRecord, User } from '../../App';

import CompanyValuation from './CompanyValuation';
import CteReceivables from './CteReceivables';

type FinanceTab = 'Fluxo de Caixa' | 'Ordens de Pagamento' | 'DRE' | 'Valuation' | 'Recebimentos CTE';

interface FinanceModuleProps {
  unit: string;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'ownerId'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  bankAccounts: BankAccount[];
  dreCategories: DRECategory[];
  addDreCategory: (newCategory: Omit<DRECategory, 'id'>) => void;
  updateDreCategory: (updatedCategory: DRECategory) => void;
  deleteDreCategory: (categoryId: string) => void;
  clients: any[];
  ctes: CteRecord[];
  addCte: (newCte: Omit<CteRecord, 'id'>) => void;
  updateCte: (updatedCte: CteRecord) => void;
  deleteCte: (cteId: string) => void;
  currentUser: User;
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
  addDreCategory,
  updateDreCategory,
  deleteDreCategory,
  clients,
  ctes,
  addCte,
  updateCte,
  deleteCte,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<FinanceTab>(currentUser.role.includes('Gestor') ? 'Ordens de Pagamento' : 'Fluxo de Caixa');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const completedTransactions = transactions.filter(t => t.status === 'EFETIVADO');
  const pendingTransactions = transactions.filter(t => t.status === 'PENDENTE' || t.status === 'CANCELADO');
  const activeTransactions = transactions.filter(t => t.status !== 'CANCELADO');

  const totalIn = completedTransactions.filter(i => i.type === 'ENTRADA').reduce((a, b) => a + b.value, 0);
  const totalOut = completedTransactions.filter(i => i.type === 'SAIDA').reduce((a, b) => a + b.value, 0);

  const renderContent = () => {
    switch (activeTab) {
      case 'Fluxo de Caixa':
        return <CashFlow 
          transactions={activeTransactions} 
          bankAccounts={bankAccounts}
          dreCategories={dreCategories}
          addTransaction={addTransaction}
          updateTransaction={updateTransaction}
          clients={clients}
          ctes={ctes}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />;
      case 'Ordens de Pagamento':
        return <PaymentOrders 
          transactions={pendingTransactions} 
          updateTransaction={updateTransaction} 
          bankAccounts={bankAccounts} 
          dreCategories={dreCategories}
          clients={clients}
          ctes={ctes}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />;
      case 'DRE':
        return <DynamicDRE transactions={completedTransactions} dreCategories={dreCategories} clients={clients} />;
      case 'Valuation':
        return <CompanyValuation 
          transactions={completedTransactions} 
          dreCategories={dreCategories} 
          addDreCategory={addDreCategory}
          updateDreCategory={updateDreCategory}
          deleteDreCategory={deleteDreCategory}
        />;
      case 'Recebimentos CTE':
        return <CteReceivables ctes={ctes} updateCte={updateCte} />;
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
          <input 
            type="month" 
            value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-');
              if (y && m) {
                setSelectedYear(parseInt(y));
                setSelectedMonth(parseInt(m));
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="flex border-b border-gray-200 bg-white rounded-t-3xl shadow-sm px-6">
        {[
          { id: 'Fluxo de Caixa', label: 'Fluxo de Caixa', icon: <Wallet size={18} />, restricted: currentUser.role.includes('Gestor') },
          { id: 'Ordens de Pagamento', label: 'Ordens de Pagamento', icon: <Clock size={18} /> },
          { id: 'Recebimentos CTE', label: 'Recebimentos CTE', icon: <CheckCircle size={18} /> },
          { id: 'DRE', label: 'DRE', icon: <FileSpreadsheet size={18} />, restricted: currentUser.role.includes('Gestor') },
          { id: 'Valuation', label: 'Valuation & Histórico', icon: <TrendingUp size={18} />, restricted: currentUser.role.includes('Gestor') }
        ].filter(tab => !tab.restricted).map((tab: any) => (
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
const CashFlow = ({ transactions, bankAccounts, dreCategories, addTransaction, updateTransaction, clients, ctes, selectedMonth, selectedYear }: any) => {
  const [showModal, setShowModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPeriod, setExportPeriod] = useState<'MONTH' | 'YEAR' | 'CUSTOM'>('MONTH');
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportStartDate, setExportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportEndDate, setExportEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [modalType, setModalType] = useState<'ENTRADA' | 'SAIDA'>('SAIDA');
  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts.length > 0 ? bankAccounts[0].id : '');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: false,
    status: 'EFETIVADO',
    value: '',
    cat: '',
    desc: '',
    bankAccountId: selectedBankId,
    cte: '',
    clientName: '',
    carreteiroType: ''
  });

  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleEditClick = (tx: any) => {
    setEditingTxId(tx.id);
    setEditData({ ...tx });
  };

  const handleSaveEdit = () => {
    if (editingTxId) {
      if (editData.cat === '5') {
        if (!editData.cte || !editData.carreteiroType) {
          alert("Para despesas de carreteiro, o CTE e o Tipo de Lançamento são obrigatórios.");
          return;
        }
      }
      updateTransaction(editData);
      setEditingTxId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTxId(null);
  };

  const selectedBank = bankAccounts.find((b: any) => b.id === selectedBankId);
  const baseInitialBalance = selectedBank ? selectedBank.initialBalance : 0;

  const allBankTransactions = selectedBankId 
    ? transactions.filter((t: any) => t.bankAccountId === selectedBankId)
    : [];

  const sortedAllTransactions = [...allBankTransactions].sort((a, b) => {
    const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (a.orderIndex || 0) - (b.orderIndex || 0);
  });

  let runningBalance = baseInitialBalance;
  const transactionsWithBalance = sortedAllTransactions.map(t => {
    if (t.type === 'ENTRADA') runningBalance += t.value;
    else runningBalance -= t.value;
    return { ...t, balance: runningBalance };
  });

  const displayedTransactions = transactionsWithBalance.filter(t => {
    const d = new Date(t.date);
    return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
  }).reverse();

  const previousTransactions = transactionsWithBalance.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() < selectedYear || (d.getFullYear() === selectedYear && (d.getMonth() + 1) < selectedMonth);
  });

  const initialBalance = previousTransactions.length > 0 
    ? previousTransactions[previousTransactions.length - 1].balance 
    : baseInitialBalance;

  const totalIn = displayedTransactions.filter((i: any) => i.type === 'ENTRADA').reduce((a: any, b: any) => a + b.value, 0);
  const totalOut = displayedTransactions.filter((i: any) => i.type === 'SAIDA').reduce((a: any, b: any) => a + b.value, 0);

  const handleMove = (tx: any, direction: 'UP' | 'DOWN') => {
    const sameDateTxs = [...allBankTransactions]
      .filter(t => t.date === tx.date)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    let needsFullUpdate = false;
    sameDateTxs.forEach((t, i) => {
      if (t.orderIndex === undefined) {
        t.orderIndex = i;
        needsFullUpdate = true;
      }
    });

    const currentIndex = sameDateTxs.findIndex(t => t.id === tx.id);
    if (currentIndex === -1) return;

    // UP in UI = smaller index in reversed list = larger index in chronological list
    const targetIndex = direction === 'UP' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex < 0 || targetIndex >= sameDateTxs.length) return;

    const currentTx = { ...sameDateTxs[currentIndex] };
    const targetTx = { ...sameDateTxs[targetIndex] };

    const tempOrder = currentTx.orderIndex;
    currentTx.orderIndex = targetTx.orderIndex;
    targetTx.orderIndex = tempOrder;

    if (currentTx.orderIndex === targetTx.orderIndex) {
      currentTx.orderIndex = direction === 'UP' ? 1 : 0;
      targetTx.orderIndex = direction === 'UP' ? 0 : 1;
    }

    if (needsFullUpdate) {
      sameDateTxs.forEach(t => {
        if (t.id !== currentTx.id && t.id !== targetTx.id) {
          updateTransaction(t);
        }
      });
    }

    updateTransaction(currentTx);
    updateTransaction(targetTx);
  };

  const exportToCSV = () => {
    let txsToExport = transactionsWithBalance;

    if (exportPeriod === 'MONTH') {
      txsToExport = txsToExport.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === exportMonth && d.getFullYear() === exportYear;
      });
    } else if (exportPeriod === 'YEAR') {
      txsToExport = txsToExport.filter(t => new Date(t.date).getFullYear() === exportYear);
    } else if (exportPeriod === 'CUSTOM') {
      const start = new Date(exportStartDate).getTime();
      const end = new Date(exportEndDate).getTime();
      txsToExport = txsToExport.filter(t => {
        const time = new Date(t.date).getTime();
        return time >= start && time <= end;
      });
    }

    const headers = ['Data', 'Entrada', 'Saída', 'Saldo', 'Receita/Despesa', 'Detalhamento', 'CTe', 'Banco/Caixa'];
    const rows = txsToExport.map(item => {
      const bank = bankAccounts.find((b: any) => b.id === item.bankAccountId);
      const catName = dreCategories.find((c: any) => c.id === item.cat)?.name || item.cat;
      const entrada = item.type === 'ENTRADA' ? item.value.toFixed(2).replace('.', ',') : '';
      const saida = item.type === 'SAIDA' ? item.value.toFixed(2).replace('.', ',') : '';
      const saldo = item.balance.toFixed(2).replace('.', ',');
      const date = new Date(item.date).toLocaleDateString('pt-BR');
      let detalhamento = item.desc;
      if (item.clientName) detalhamento += ` (${item.clientName})`;
      if (item.cat === '5' && item.carreteiroType) detalhamento += ` [${item.carreteiroType}]`;
      
      return [
        date,
        `"${entrada}"`,
        `"${saida}"`,
        `"${saldo}"`,
        `"${catName}"`,
        `"${detalhamento}"`,
        `"${item.cte || ''}"`,
        `"${bank ? bank.name : ''}"`
      ].join(';');
    });

    const csvContent = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fluxo_de_caixa_${exportPeriod.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.cat === '5') {
      if (!formData.cte || !formData.carreteiroType) {
        alert("Para despesas de carreteiro, o CTE e o Tipo de Lançamento são obrigatórios.");
        return;
      }
    }

    const baseTx = {
      type: modalType,
      value: parseFloat(formData.value),
      cat: formData.cat,
      desc: formData.desc,
      bankAccountId: formData.bankAccountId,
      cte: formData.cte,
      clientName: formData.clientName,
      carreteiroType: formData.carreteiroType as any
    };

    if (formData.isRecurring) {
      for (let i = 0; i < 12; i++) {
        const d = new Date(formData.dueDate || formData.date);
        d.setMonth(d.getMonth() + i);
        const dateStr = d.toISOString().split('T')[0];
        addTransaction({
          ...baseTx,
          date: dateStr,
          dueDate: dateStr,
          isRecurring: true,
          status: i === 0 ? formData.status as any : 'PENDENTE'
        });
      }
    } else {
      addTransaction({
        ...baseTx,
        date: formData.date,
        dueDate: formData.dueDate,
        status: formData.status as any
      });
    }

    setShowModal(false);
    setFormData({ date: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0], isRecurring: false, status: 'EFETIVADO', value: '', cat: '', desc: '', bankAccountId: selectedBankId, cte: '', clientName: '', carreteiroType: '' });
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
            <button onClick={() => setShowExportModal(true)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50" title="Exportar CSV">
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
                <th className="px-4 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedTransactions.map((item: any) => {
                const bank = bankAccounts.find((b: any) => b.id === item.bankAccountId);
                const isEditing = editingTxId === item.id;
                
                // Validate Carreteiro value
                let isDivergent = false;
                if (item.cat === '5' && item.cte && item.carreteiroType) {
                  const cteRecord = ctes.find((c: any) => c.cteNumber === item.cte);
                  if (cteRecord) {
                    const expectedValue = 
                      item.carreteiroType === 'Adiantamento' ? cteRecord.advanceValue :
                      item.carreteiroType === 'Saldo' ? cteRecord.balanceValue :
                      item.carreteiroType === 'Extra' ? cteRecord.extraValue :
                      item.carreteiroType === 'Tributos sobre frete' ? cteRecord.taxesRetained : 0;
                    
                    if (item.value !== expectedValue) {
                      isDivergent = true;
                    }
                  }
                }

                if (isEditing) {
                  return (
                    <tr key={item.id} className="bg-blue-50/30 text-sm">
                      <td className="px-4 py-3">
                        <input type="date" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} className="w-full p-1 border border-gray-300 rounded text-xs" />
                      </td>
                      <td className="px-4 py-3">
                        {editData.type === 'ENTRADA' && (
                          <input type="number" step="0.01" value={editData.value} onChange={e => setEditData({...editData, value: parseFloat(e.target.value)})} className="w-full p-1 border border-gray-300 rounded text-xs" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editData.type === 'SAIDA' && (
                          <input type="number" step="0.01" value={editData.value} onChange={e => setEditData({...editData, value: parseFloat(e.target.value)})} className="w-full p-1 border border-gray-300 rounded text-xs" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400">-</td>
                      <td className="px-4 py-3">
                        <select value={editData.cat} onChange={e => setEditData({...editData, cat: e.target.value})} className="w-full p-1 border border-gray-300 rounded text-xs">
                          {dreCategories.filter((c: any) => editData.type === 'ENTRADA' ? c.group.includes('RECEITA') : !c.group.includes('RECEITA')).map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" value={editData.desc} onChange={e => setEditData({...editData, desc: e.target.value})} className="w-full p-1 border border-gray-300 rounded text-xs" />
                        {editData.cat === '5' && (
                          <select value={editData.carreteiroType || ''} onChange={e => setEditData({...editData, carreteiroType: e.target.value})} className={`w-full mt-1 p-1 border ${!editData.carreteiroType ? 'border-red-500' : 'border-gray-300'} rounded text-xs text-red-600`}>
                            <option value="">Tipo (Obrigatório)...</option>
                            <option value="Adiantamento">Adiantamento</option>
                            <option value="Saldo">Saldo</option>
                            <option value="Extra">Extra</option>
                            <option value="Tributos sobre frete">Tributos sobre frete</option>
                          </select>
                        )}
                        <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})} className="w-full mt-1 p-1 border border-gray-300 rounded text-xs font-bold">
                          <option value="EFETIVADO">Efetivado</option>
                          <option value="PENDENTE">Pendente</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" value={editData.cte || ''} onChange={e => setEditData({...editData, cte: e.target.value})} className={`w-full p-1 border ${editData.cat === '5' && !editData.cte ? 'border-red-500' : 'border-gray-300'} rounded text-xs`} placeholder={editData.cat === '5' ? "Nº CTE (Obrigatório)" : "Nº CTE"} />
                      </td>
                      <td className="px-4 py-3">
                        <select value={editData.bankAccountId} onChange={e => setEditData({...editData, bankAccountId: e.target.value})} className="w-full p-1 border border-gray-300 rounded text-xs">
                          {bankAccounts.map((b: any) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={handleSaveEdit} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded" title="Salvar"><CheckCircle size={16} /></button>
                          <button onClick={handleCancelEdit} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Cancelar"><X size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                const isPendente = item.status === 'PENDENTE';

                return (
                  <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors text-sm ${isDivergent ? 'bg-red-50' : ''} ${isPendente ? 'opacity-60 bg-yellow-50/30' : ''}`}>
                    <td className="px-4 py-3 text-gray-500 italic">
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                      {isPendente && <span className="block text-[10px] text-yellow-600 font-bold uppercase mt-1">Pendente</span>}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{item.type === 'ENTRADA' ? formatCurrency(item.value) : '-'}</td>
                    <td className={`px-4 py-3 font-bold ${isDivergent ? 'text-red-700' : 'text-red-600'}`}>{item.type === 'SAIDA' ? formatCurrency(item.value) : '-'}</td>
                    <td className={`px-4 py-3 font-bold ${item.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(item.balance)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${isDivergent ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                        {dreCategories.find((c: any) => c.id === item.cat) ? dreCategories.find((c: any) => c.id === item.cat)?.name : item.cat}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.desc} {item.clientName ? `(${item.clientName})` : ''}
                      {item.cat === '5' && item.carreteiroType && (
                        <span className="ml-2 text-xs text-red-600 font-bold">[{item.carreteiroType}]</span>
                      )}
                      {isDivergent && (
                        <span className="block text-xs text-red-600 font-bold mt-1">Divergência com CTE</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.cte || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{bank ? bank.name : '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {isPendente && (
                          <button onClick={() => updateTransaction({...item, status: 'EFETIVADO'})} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded transition-colors" title="Efetivar">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button onClick={() => handleMove(item, 'UP')} className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors" title="Mover para cima">
                          <ArrowUp size={16} />
                        </button>
                        <button onClick={() => handleMove(item, 'DOWN')} className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors" title="Mover para baixo">
                          <ArrowDown size={16} />
                        </button>
                        <button onClick={() => handleEditClick(item)} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Editar">
                          <FileSpreadsheet size={16} />
                        </button>
                      </div>
                    </td>
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

      {/* Modal Exportar */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Exportar Fluxo de Caixa</h3>
              <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Período de Exportação</label>
                <select 
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                  value={exportPeriod} onChange={e => setExportPeriod(e.target.value as any)}
                >
                  <option value="MONTH">Mês Específico</option>
                  <option value="YEAR">Ano Inteiro</option>
                  <option value="CUSTOM">Período Personalizado</option>
                </select>
              </div>

              {exportPeriod === 'MONTH' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mês</label>
                    <select 
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                      value={exportMonth} onChange={e => setExportMonth(parseInt(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ano</label>
                    <input 
                      type="number" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                      value={exportYear} onChange={e => setExportYear(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {exportPeriod === 'YEAR' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ano</label>
                  <input 
                    type="number" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    value={exportYear} onChange={e => setExportYear(parseInt(e.target.value))}
                  />
                </div>
              )}

              {exportPeriod === 'CUSTOM' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Inicial</label>
                    <input 
                      type="date" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                      value={exportStartDate} onChange={e => setExportStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Final</label>
                    <input 
                      type="date" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                      value={exportEndDate} onChange={e => setExportEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowExportModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button onClick={exportToCSV} className="px-4 py-2 bg-bordeaux text-white font-bold rounded-lg hover:bg-red-900 shadow-md">Exportar CSV</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Lançamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Nova {modalType === 'ENTRADA' ? 'Receita' : 'Despesa'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <select 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required
                  >
                    <option value="EFETIVADO">Efetivado (No Extrato)</option>
                    <option value="PENDENTE">Pendente (A Pagar/Receber)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data de Lançamento</label>
                  <input 
                    type="date" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data de Vencimento</label>
                  <input 
                    type="date" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center mt-6">
                  <input 
                    type="checkbox" 
                    id="isRecurring"
                    className="w-4 h-4 text-bordeaux border-gray-300 rounded focus:ring-bordeaux"
                    checked={formData.isRecurring} 
                    onChange={e => setFormData({...formData, isRecurring: e.target.checked})} 
                  />
                  <label htmlFor="isRecurring" className="ml-2 block text-sm font-bold text-gray-700">
                    Lançamento Recorrente (12 meses)
                  </label>
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
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    CTe {formData.cat === '5' ? <span className="text-red-500">*</span> : '(Opcional)'}
                  </label>
                  <input 
                    type="text" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                    value={formData.cte} onChange={e => setFormData({...formData, cte: e.target.value})}
                    required={formData.cat === '5'}
                  />
                </div>
                {formData.cat === '5' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Lançamento Carreteiro <span className="text-red-500">*</span></label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                      value={formData.carreteiroType || ''}
                      onChange={e => setFormData({...formData, carreteiroType: e.target.value})}
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="Adiantamento">Adiantamento</option>
                      <option value="Saldo">Saldo</option>
                      <option value="Extra">Extra</option>
                      <option value="Tributos sobre frete">Tributos sobre frete</option>
                    </select>
                  </div>
                )}
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
const PaymentOrders = ({ transactions, updateTransaction, bankAccounts, dreCategories, ctes, selectedMonth, selectedYear }: any) => {
  const [payingTx, setPayingTx] = useState<any>(null);
  const [payData, setPayData] = useState({ bankAccountId: '', date: new Date().toISOString().split('T')[0] });

  const displayedTransactions = transactions.filter((t: any) => {
    const d = new Date(t.dueDate || t.date);
    return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
  });

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

  const handleCancelOrder = (tx: any) => {
    updateTransaction({
      ...tx,
      status: 'CANCELADO'
    });
  };

  const isTransactionCancelled = (tx: any) => {
    if (tx.cte) {
      const relatedCte = ctes.find((c: any) => c.cteNumber === tx.cte);
      if (relatedCte && relatedCte.status === 'CANCELADO') return true;
    }
    const loadIdMatch = tx.desc.match(/Carga #(\w+)/);
    if (loadIdMatch) {
      const loadId = loadIdMatch[1];
      const relatedCte = ctes.find((c: any) => c.loadId === loadId);
      if (relatedCte && relatedCte.status === 'CANCELADO') return true;
    }
    return false;
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
            {displayedTransactions.map((item: any) => {
              const cteCancelled = isTransactionCancelled(item);
              const isOrderCancelled = item.status === 'CANCELADO';
              const cancelled = cteCancelled || isOrderCancelled;
              return (
                <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${cancelled ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 text-sm text-gray-500 italic">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {item.desc}
                    {cteCancelled && !isOrderCancelled && <span className="ml-2 text-[10px] px-2 py-1 bg-red-100 text-red-800 rounded-full uppercase tracking-widest">CTE Cancelado</span>}
                    {isOrderCancelled && <span className="ml-2 text-[10px] px-2 py-1 bg-gray-200 text-gray-600 rounded-full uppercase tracking-widest">Ordem Cancelada</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] px-2 py-1 bg-gray-100 rounded-full text-gray-500 font-bold uppercase tracking-widest">
                      {dreCategories.find((c: any) => c.id === item.cat) ? dreCategories.find((c: any) => c.id === item.cat)?.name : item.cat}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600">
                    {formatCurrency(item.value)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setPayingTx(item)}
                        disabled={cancelled}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${cancelled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        title="Efetivar Pagamento"
                      >
                        <CheckCircle size={14} /> Efetivar
                      </button>
                      {!isOrderCancelled && (
                        <button
                          onClick={() => handleCancelOrder(item)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                          title="Cancelar Ordem"
                        >
                          <X size={14} /> Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {displayedTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">Nenhuma ordem de pagamento pendente para este mês.</td>
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
