import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Save, X, FileText, CheckCircle, Ban, AlertCircle, Download, XCircle, Upload } from 'lucide-react';
import { CteRecord, User } from '../../App';
import * as XLSX from 'xlsx';

interface CteModuleProps {
  ctes: CteRecord[];
  addCte: (newCte: CteRecord) => void;
  updateCte: (updatedCte: CteRecord) => void;
  deleteCte: (cteId: string) => void;
  currentUser: User;
}

const CteModule: React.FC<CteModuleProps> = ({ ctes, addCte, updateCte, deleteCte, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState('mes');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [autoFilledId, setAutoFilledId] = useState<string | null>(null);
  
  const isAdmin = currentUser.role === 'Administrador';
  const isFinanceiro = currentUser.role === 'Financeiro' || isAdmin;

  const [formData, setFormData] = useState<Omit<CteRecord, 'id'>>({
    cteNumber: '',
    emissionDate: new Date().toISOString().split('T')[0],
    customer: '',
    origin: '',
    destination: '',
    cteValue: 0,
    driverName: '',
    driverCpf: '',
    driverFreight: 0,
    advanceValue: 0,
    advanceDate: '',
    balanceValue: 0,
    balanceDate: '',
    extraValue: 0,
    extraReference: '',
    tollValue: 0,
    taxesRetained: 0,
    hasTaxes: false,
    taxesValue: 0,
    status: 'ATIVO',
    financeConfirmed: false,
    financeRejected: false,
    dueDate: '',
    paymentConfirmed: false
  });

  const isComercial = isAdmin || (currentUser.role === 'Comercial' && !formData.financeRejected);
  const isOperacional = isAdmin || (currentUser.role === 'Operacional' && !formData.financeRejected);

  const filterByPeriod = (dateString: string) => {
    if (period === 'todos') return true;
    
    // Convert date string (YYYY-MM-DD) to Date object safely
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const now = new Date();
    
    if (period === 'mes') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    
    if (period === 'trimestre') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const dateQuarter = Math.floor(date.getMonth() / 3);
      return currentQuarter === dateQuarter && date.getFullYear() === now.getFullYear();
    }
    
    if (period === 'ano') {
      return date.getFullYear() === now.getFullYear();
    }
    
    return true;
  };

  const filteredCtes = ctes.filter(cte => 
    (cte.cteNumber.includes(searchTerm) || 
    cte.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cte.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cte.driverCpf.includes(searchTerm)) &&
    filterByPeriod(cte.emissionDate)
  ).sort((a, b) => (parseInt(b.cteNumber) || 0) - (parseInt(a.cteNumber) || 0));

  const getNextCteNumber = () => {
    if (ctes.length === 0) return '1';
    const maxNumber = Math.max(...ctes.map(c => parseInt(c.cteNumber) || 0));
    return (maxNumber + 1).toString();
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws);
      
      data.forEach(item => {
        const newCte: CteRecord = {
          id: Math.random().toString(36).substr(2, 9),
          cteNumber: item['CTE']?.toString() || '',
          emissionDate: item['Data Emissão'] || '',
          customer: item['Cliente'] || '',
          origin: item['Origem'] || '',
          destination: item['Destino'] || '',
          cteValue: Number(item['Valor CTE']) || 0,
          driverName: item['Motorista'] || '',
          driverCpf: item['CPF']?.toString() || '',
          driverFreight: Number(item['Valor Carreteiro']) || 0,
          advanceValue: Number(item['Adiantamento']) || 0,
          advanceDate: item['Data Adiantamento'] || '',
          balanceValue: Number(item['Saldo']) || 0,
          balanceDate: item['Data Saldo'] || '',
          extraValue: Number(item['Pedágio']) || 0,
          extraReference: item['Referência (Extra)'] || '',
          tollValue: Number(item['Pedágio']) || 0,
          taxesRetained: Number(item['Tributos']) || 0,
          status: 'ATIVO',
          financeConfirmed: false,
          financeRejected: false,
          dueDate: item['Data Vencimento'] || '',
          paymentConfirmed: false
        };
        addCte(newCte);
      });
    };
    reader.readAsBinaryString(file);
  };

  const handleOpenForm = (cte?: CteRecord) => {
    setAutoFilledId(null);
    if (cte) {
      setEditingId(cte.id);
      setFormData({
        cteNumber: cte.cteNumber,
        emissionDate: cte.emissionDate,
        customer: cte.customer,
        origin: cte.origin,
        destination: cte.destination,
        cteValue: cte.cteValue,
        driverName: cte.driverName,
        driverCpf: cte.driverCpf,
        driverFreight: cte.driverFreight,
        advanceValue: cte.advanceValue,
        advanceDate: cte.advanceDate,
        balanceValue: cte.balanceValue,
        balanceDate: cte.balanceDate,
        extraValue: cte.extraValue,
        extraReference: cte.extraReference,
        tollValue: cte.tollValue,
        taxesRetained: cte.taxesRetained,
        hasTaxes: cte.hasTaxes || false,
        taxesValue: cte.taxesValue || 0,
        status: cte.status,
        financeConfirmed: cte.financeConfirmed,
        financeRejected: cte.financeRejected || false
      });
    } else {
      setEditingId(null);
      setFormData({
        cteNumber: getNextCteNumber(),
        emissionDate: new Date().toISOString().split('T')[0],
        customer: '',
        origin: '',
        destination: '',
        cteValue: 0,
        driverName: '',
        driverCpf: '',
        driverFreight: 0,
        advanceValue: 0,
        advanceDate: '',
        balanceValue: 0,
        balanceDate: '',
        extraValue: 0,
        extraReference: '',
        tollValue: 0,
        taxesRetained: 0,
        hasTaxes: false,
        taxesValue: 0,
        status: 'ATIVO',
        financeConfirmed: false,
        financeRejected: false
      });
    }
    setIsFormOpen(true);
  };

  const handleCteNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const existingCte = ctes.find(c => c.cteNumber === value);
    
    if (existingCte) {
      if (!editingId) {
        setAutoFilledId(existingCte.id);
      }
      setEditingId(existingCte.id);
      setFormData({
        cteNumber: existingCte.cteNumber,
        emissionDate: existingCte.emissionDate,
        customer: existingCte.customer,
        origin: existingCte.origin,
        destination: existingCte.destination,
        cteValue: existingCte.cteValue,
        driverName: existingCte.driverName,
        driverCpf: existingCte.driverCpf,
        driverFreight: existingCte.driverFreight,
        advanceValue: existingCte.advanceValue,
        advanceDate: existingCte.advanceDate,
        balanceValue: existingCte.balanceValue,
        balanceDate: existingCte.balanceDate,
        extraValue: existingCte.extraValue,
        extraReference: existingCte.extraReference,
        tollValue: existingCte.tollValue,
        taxesRetained: existingCte.taxesRetained,
        hasTaxes: existingCte.hasTaxes || false,
        taxesValue: existingCte.taxesValue || 0,
        status: existingCte.status,
        financeConfirmed: existingCte.financeConfirmed,
        financeRejected: existingCte.financeRejected || false
      });
    } else {
      if (editingId && editingId === autoFilledId) {
        setEditingId(null);
        setAutoFilledId(null);
      }
      setFormData({...formData, cteNumber: value});
    }
  };

  const handleSave = () => {
    if (editingId) {
      const updatedCte: CteRecord = { 
        ...formData, 
        id: editingId,
        financeRejected: isAdmin && formData.financeRejected ? false : formData.financeRejected,
        financeConfirmed: isAdmin && formData.financeRejected ? false : formData.financeConfirmed
      } as CteRecord;
      updateCte(updatedCte);
    } else {
      const newCte: CteRecord = { ...formData, id: Math.random().toString(36).substr(2, 9) } as CteRecord;
      addCte(newCte);
    }
    setIsFormOpen(false);
  };

  const handleCancelCte = (id: string) => {
    const cte = ctes.find(c => c.id === id);
    if (cte) {
      updateCte({ ...cte, status: 'CANCELADO' });
    }
  };

  const handleConfirmFinance = (id: string) => {
    const cte = ctes.find(c => c.id === id);
    if (cte) {
      updateCte({ ...cte, financeConfirmed: true, financeRejected: false });
    }
  };

  const handleRejectFinance = (id: string) => {
    const cte = ctes.find(c => c.id === id);
    if (cte) {
      updateCte({ ...cte, financeConfirmed: false, financeRejected: true });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const exportToExcel = () => {
    const headers = [
      'CTE', 'Status', 'Data Emissão', 'Cliente', 'Origem', 'Destino',
      'Valor CTE', 'Motorista', 'CPF', 'Valor Carreteiro', 'Adiantamento',
      'Data Adiantamento', 'Saldo', 'Data Saldo', 'Pedágio', 'Valor Extra',
      'Referência (Extra)', 'Tributos', 'Financeiro Confirmado', 'Data Vencimento', 'Pagamento Confirmado'
    ];

    const rows = filteredCtes.map(cte => [
      cte.cteNumber,
      cte.status,
      formatDate(cte.emissionDate),
      cte.customer,
      cte.origin,
      cte.destination,
      cte.cteValue,
      cte.driverName,
      cte.driverCpf,
      cte.driverFreight,
      cte.advanceValue,
      formatDate(cte.advanceDate),
      cte.balanceValue,
      formatDate(cte.balanceDate),
      cte.tollValue,
      cte.extraValue,
      cte.extraReference,
      cte.taxesRetained,
      cte.financeConfirmed ? 'Sim' : 'Não',
      cte.dueDate ? formatDate(cte.dueDate) : '',
      cte.paymentConfirmed ? 'Sim' : 'Não'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => {
        if (typeof cell === 'string') {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        if (typeof cell === 'number') {
          return `"${cell.toString().replace('.', ',')}"`;
        }
        return `"${cell}"`;
      }).join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_ctes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10" style={{ fontFamily: 'Book Antiqua, serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Gestão de CTE</h2>
          <p className="text-gray-500 italic">Controle de valores de venda, despesas e custos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToExcel}
            className="bg-white text-gray-700 border border-gray-200 px-4 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Download size={20} />
            Exportar Excel
          </button>
          <input type="file" id="excel-upload" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
          <label 
            htmlFor="excel-upload"
            className="bg-white text-gray-700 border border-gray-200 px-4 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Upload size={20} />
            Importar Excel
          </label>
          <button 
            onClick={() => handleOpenForm()}
            className="bg-bordeaux text-white px-6 py-3 rounded-xl font-bold hover:bg-bordeaux/90 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Novo CTE
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por CTE, Motorista ou CPF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="w-full md:w-auto">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full md:w-48 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none font-medium text-gray-700"
            >
              <option value="mes">Este Mês</option>
              <option value="trimestre">Este Trimestre</option>
              <option value="ano">Este Ano</option>
              <option value="todos">Todos os Períodos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white uppercase bg-bordeaux">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">CTE</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Valor CTE</th>
                <th className="px-4 py-3 bg-red-900">Valor Carreteiro</th>
                <th className="px-4 py-3 bg-red-900">Adiantamento</th>
                <th className="px-4 py-3 bg-red-900">Saldo</th>
                <th className="px-4 py-3">Motorista</th>
                <th className="px-4 py-3">Custos Extras</th>
                <th className="px-4 py-3">Tributos</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Financeiro</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCtes.map((cte, index) => (
                <tr key={cte.id} className={`border-b border-gray-100 transition-colors ${cte.financeRejected ? 'bg-red-50 hover:bg-red-100' : index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-50'} ${cte.status === 'CANCELADO' ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 font-bold text-gray-900">{cte.cteNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${cte.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {cte.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(cte.emissionDate)}</td>
                  <td className="px-4 py-3">{cte.customer}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">{formatCurrency(cte.cteValue)}</td>
                  <td className="px-4 py-3 font-medium text-red-600">{formatCurrency(cte.driverFreight)}</td>
                  <td className="px-4 py-3">{formatCurrency(cte.advanceValue)}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(cte.balanceValue)}</td>
                  <td className="px-4 py-3">{cte.driverName}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <div>Pedágio: {formatCurrency(cte.tollValue)}</div>
                      <div>Extra: {formatCurrency(cte.extraValue)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-red-600">{formatCurrency(cte.taxesRetained)}</td>
                  <td className="px-4 py-3">{cte.dueDate ? formatDate(cte.dueDate) : '-'}</td>
                  <td className="px-4 py-3">
                    {cte.financeRejected ? (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-100 px-2 py-1 rounded-md w-fit">
                        <AlertCircle size={14} /> Divergência
                      </span>
                    ) : cte.financeConfirmed ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-md w-fit">
                        <CheckCircle size={14} /> Confirmado
                      </span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded-md w-fit">
                          <AlertCircle size={14} /> Pendente
                        </span>
                        {isFinanceiro && (
                          <button 
                            onClick={() => updateCte({...cte, financeConfirmed: true, paymentConfirmed: true})}
                            className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-md hover:bg-emerald-700"
                          >
                            Confirmar Pagamento
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isFinanceiro && !cte.financeConfirmed && cte.status === 'ATIVO' && (
                        <>
                          <button onClick={() => handleConfirmFinance(cte.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Confirmar Custos">
                            <CheckCircle size={18} />
                          </button>
                          {!cte.financeRejected && (
                            <button onClick={() => handleRejectFinance(cte.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Apontar Divergência">
                              <XCircle size={18} />
                            </button>
                          )}
                        </>
                      )}
                      <button onClick={() => handleOpenForm(cte)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Edit3 size={18} />
                      </button>
                      {isFinanceiro && cte.status === 'ATIVO' && (
                        <button onClick={() => handleCancelCte(cte.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancelar CTE">
                          <Ban size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCtes.length === 0 && (
                <tr>
                  <td colSpan={14} className="px-4 py-8 text-center text-gray-500 italic">
                    Nenhum CTE encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bordeaux/10 flex items-center justify-center text-bordeaux">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{editingId ? 'Editar CTE' : 'Novo CTE'}</h3>
                  <p className="text-sm text-gray-500 italic">Preencha os dados do conhecimento de transporte.</p>
                </div>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {formData.status === 'CANCELADO' && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
                  <Ban size={24} />
                  <div>
                    <h4 className="font-bold">CTE Cancelado</h4>
                    <p className="text-sm">Este CTE foi cancelado e não pode ser faturado.</p>
                  </div>
                </div>
              )}

              {formData.financeRejected && formData.status !== 'CANCELADO' && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
                  <AlertCircle size={24} />
                  <div>
                    <h4 className="font-bold">Divergência Financeira</h4>
                    <p className="text-sm">O Financeiro apontou divergência nos valores deste CTE. Apenas o Administrador pode ajustar e salvar para reavaliação.</p>
                  </div>
                </div>
              )}

              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-bold text-gray-900">Dados Comerciais</h4>
                  {!isComercial && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-bold">Apenas Comercial</span>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Número do CTE (Sequencial)</label>
                    <input 
                      type="text" 
                      value={formData.cteNumber}
                      onChange={handleCteNumberChange}
                      disabled={!isComercial}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Data de Emissão</label>
                    <input 
                      type="date" 
                      value={formData.emissionDate}
                      onChange={e => setFormData({...formData, emissionDate: e.target.value})}
                      disabled={!isComercial}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Valor CTE (Venda)</label>
                    <input 
                      type="number" 
                      value={formData.cteValue}
                      onChange={e => setFormData({...formData, cteValue: Number(e.target.value)})}
                      disabled={!isComercial}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Cliente</label>
                    <input 
                      type="text" 
                      value={formData.customer}
                      onChange={e => setFormData({...formData, customer: e.target.value})}
                      disabled={!isComercial}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Origem</label>
                    <input 
                      type="text" 
                      value={formData.origin}
                      onChange={e => setFormData({...formData, origin: e.target.value})}
                      disabled={!isComercial}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Destino</label>
                    <input 
                      type="text" 
                      value={formData.destination}
                      onChange={e => setFormData({...formData, destination: e.target.value})}
                      disabled={!isComercial}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-bold text-gray-900">Custos e Despesas (Programador)</h4>
                  {!isOperacional && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-bold">Apenas Operacional</span>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Motorista</label>
                    <input 
                      type="text" 
                      value={formData.driverName}
                      onChange={e => setFormData({...formData, driverName: e.target.value})}
                      disabled={!isOperacional}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">CPF do Motorista</label>
                    <input 
                      type="text" 
                      value={formData.driverCpf}
                      onChange={e => setFormData({...formData, driverCpf: e.target.value})}
                      disabled={!isOperacional}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Valor Carreteiro</label>
                    <input 
                      type="number" 
                      value={formData.driverFreight}
                      onChange={e => setFormData({...formData, driverFreight: Number(e.target.value)})}
                      disabled={!isOperacional}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Adiantamento</label>
                    <input 
                      type="number" 
                      value={formData.advanceValue}
                      onChange={e => setFormData({...formData, advanceValue: Number(e.target.value)})}
                      disabled={!isOperacional}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Data Adiantamento</label>
                    <input 
                      type="date" 
                      value={formData.advanceDate}
                      onChange={e => setFormData({...formData, advanceDate: e.target.value})}
                      disabled={!isOperacional}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Saldo</label>
                    <input 
                      type="number" 
                      value={formData.balanceValue}
                      onChange={e => setFormData({...formData, balanceValue: Number(e.target.value)})}
                      disabled={!isOperacional}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Data Saldo</label>
                    <input 
                      type="date" 
                      value={formData.balanceDate}
                      onChange={e => setFormData({...formData, balanceDate: e.target.value})}
                      disabled={!isOperacional}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Pedágio</label>
                    <input 
                      type="number" 
                      value={formData.tollValue}
                      onChange={e => setFormData({...formData, tollValue: Number(e.target.value)})}
                      disabled={!isOperacional}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Valor Extra</label>
                    <input 
                      type="number" 
                      value={formData.extraValue}
                      onChange={e => setFormData({...formData, extraValue: Number(e.target.value)})}
                      disabled={!isOperacional}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Referência (Valor Extra)</label>
                    <input 
                      type="text" 
                      value={formData.extraReference}
                      onChange={e => setFormData({...formData, extraReference: e.target.value})}
                      disabled={!isOperacional}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Houve Retenção?</label>
                    <div className="flex items-center h-[50px]">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.hasTaxes}
                          onChange={(e) => setFormData({
                            ...formData, 
                            hasTaxes: e.target.checked,
                            taxesRetained: e.target.checked ? formData.taxesValue : 0
                          })}
                          disabled={!isOperacional}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bordeaux"></div>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Valor dos Tributos</label>
                    <input 
                      type="number" 
                      value={formData.taxesValue}
                      onChange={e => setFormData({
                        ...formData, 
                        taxesValue: Number(e.target.value),
                        taxesRetained: formData.hasTaxes ? Number(e.target.value) : 0
                      })}
                      disabled={!isOperacional}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
                
                {!formData.hasTaxes && formData.taxesValue > 0 && (
                  <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-700 mt-4 animate-in fade-in">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-[10px] font-black uppercase leading-tight">Atenção: Como não há retenção, o valor de {formData.taxesValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} deve estar acrescido ao custo do carreteiro (Valor Carreteiro).</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-3 bg-bordeaux text-white font-bold rounded-xl hover:bg-bordeaux/90 transition-colors flex items-center gap-2"
              >
                <Save size={20} />
                Salvar CTE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CteModule;
