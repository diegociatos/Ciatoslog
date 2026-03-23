import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Save, X, FileText, CheckCircle, Ban, AlertCircle } from 'lucide-react';
import { CteRecord, User } from '../../App';

interface CteModuleProps {
  ctes: CteRecord[];
  setCtes: React.Dispatch<React.SetStateAction<CteRecord[]>>;
  currentUser: User;
}

const CteModule: React.FC<CteModuleProps> = ({ ctes, setCtes, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const isFinanceiro = currentUser.role === 'Financeiro' || currentUser.role === 'Administrador';
  const isComercial = currentUser.role === 'Comercial' || currentUser.role === 'Administrador';
  const isOperacional = currentUser.role === 'Operacional' || currentUser.role === 'Administrador';

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
    status: 'ATIVO',
    financeConfirmed: false
  });

  const filteredCtes = ctes.filter(cte => 
    cte.cteNumber.includes(searchTerm) || 
    cte.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cte.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cte.driverCpf.includes(searchTerm)
  );

  const getNextCteNumber = () => {
    if (ctes.length === 0) return '1';
    const maxNumber = Math.max(...ctes.map(c => parseInt(c.cteNumber) || 0));
    return (maxNumber + 1).toString();
  };

  const handleOpenForm = (cte?: CteRecord) => {
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
        status: cte.status,
        financeConfirmed: cte.financeConfirmed
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
        status: 'ATIVO',
        financeConfirmed: false
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setCtes(ctes.map(c => c.id === editingId ? { ...formData, id: editingId } : c));
    } else {
      setCtes([{ ...formData, id: Math.random().toString(36).substr(2, 9) }, ...ctes]);
    }
    setIsFormOpen(false);
  };

  const handleCancelCte = (id: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este CTE?')) {
      setCtes(ctes.map(c => c.id === id ? { ...c, status: 'CANCELADO' } : c));
    }
  };

  const handleConfirmFinance = (id: string) => {
    if (window.confirm('Confirmar os valores de custos e extras deste CTE?')) {
      setCtes(ctes.map(c => c.id === id ? { ...c, financeConfirmed: true } : c));
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10" style={{ fontFamily: 'Book Antiqua, serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Gestão de CTE</h2>
          <p className="text-gray-500 italic">Controle de valores de venda, despesas e custos.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-bordeaux text-white px-6 py-3 rounded-xl font-bold hover:bg-bordeaux/90 transition-all shadow-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Novo CTE
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por CTE, Motorista ou CPF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
            />
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
                <th className="px-4 py-3">Financeiro</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCtes.map((cte, index) => (
                <tr key={cte.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${cte.status === 'CANCELADO' ? 'opacity-60' : ''}`}>
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
                  <td className="px-4 py-3">
                    {cte.financeConfirmed ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <CheckCircle size={14} /> Confirmado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                        <AlertCircle size={14} /> Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isFinanceiro && !cte.financeConfirmed && cte.status === 'ATIVO' && (
                        <button onClick={() => handleConfirmFinance(cte.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Confirmar Custos">
                          <CheckCircle size={18} />
                        </button>
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
                      onChange={e => setFormData({...formData, cteNumber: e.target.value})}
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">Retenção de Tributos</label>
                    <input 
                      type="number" 
                      value={formData.taxesRetained}
                      onChange={e => setFormData({...formData, taxesRetained: Number(e.target.value)})}
                      disabled={!isOperacional}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
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
