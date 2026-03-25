import React, { useState, useMemo } from 'react';
import { CteRecord } from '../../App';
import { CheckCircle, AlertCircle, Edit2, Save, X } from 'lucide-react';

interface CteReceivablesProps {
  ctes: CteRecord[];
  setCtes: React.Dispatch<React.SetStateAction<CteRecord[]>>;
}

const CteReceivables: React.FC<CteReceivablesProps> = ({ ctes, setCtes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDueDate, setEditDueDate] = useState('');

  const filteredCtes = useMemo(() => {
    return ctes.filter(cte => 
      cte.status === 'ATIVO' &&
      (cte.cteNumber.includes(searchTerm) || cte.customer.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => {
      // Sort by due date, then by emission date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(b.emissionDate).getTime() - new Date(a.emissionDate).getTime();
    });
  }, [ctes, searchTerm]);

  const totalReceivables = filteredCtes.reduce((acc, cte) => acc + cte.cteValue, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const defaultAmount = filteredCtes
    .filter(cte => !cte.isPaid && cte.dueDate && cte.dueDate < today)
    .reduce((acc, cte) => acc + cte.cteValue, 0);

  const handleMarkAsPaid = (id: string) => {
    setCtes(ctes.map(cte => 
      cte.id === id ? { ...cte, isPaid: true } : cte
    ));
  };

  const handleStartEdit = (cte: CteRecord) => {
    setEditingId(cte.id);
    setEditDueDate(cte.dueDate || '');
  };

  const handleSaveEdit = (id: string) => {
    setCtes(ctes.map(cte => 
      cte.id === id ? { ...cte, dueDate: editDueDate } : cte
    ));
    setEditingId(null);
  };

  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <CheckCircle size={20} />
            </div>
            <h3 className="font-bold text-gray-700">Total a Receber (CTEs Ativos)</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">{formatCurrency(totalReceivables)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <h3 className="font-bold text-red-700">Inadimplência Acumulada</h3>
          </div>
          <p className="text-3xl font-black text-red-600">{formatCurrency(defaultAmount)}</p>
          <p className="text-sm text-red-500 mt-1">CTEs vencidos e não pagos</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-800">Recebimentos de CTEs</h2>
          <input
            type="text"
            placeholder="Buscar por CTE ou Cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none w-full md:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">CTE</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Cliente</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Emissão</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Vencimento</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Valor</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCtes.map((cte) => {
                const isOverdue = !cte.isPaid && cte.dueDate && cte.dueDate < today;
                
                return (
                  <tr key={cte.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{cte.cteNumber}</td>
                    <td className="py-4 px-6 text-gray-600">{cte.customer}</td>
                    <td className="py-4 px-6 text-gray-600">{formatDate(cte.emissionDate)}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {editingId === cte.id ? (
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                        />
                      ) : (
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          {formatDate(cte.dueDate)}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">{formatCurrency(cte.cteValue)}</td>
                    <td className="py-4 px-6">
                      {cte.isPaid ? (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">Pago</span>
                      ) : isOverdue ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold">Vencido</span>
                      ) : (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">A Receber</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {editingId === cte.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(cte.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Salvar">
                            <Save size={18} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Cancelar">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          {!cte.isPaid && (
                            <>
                              <button onClick={() => handleStartEdit(cte)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Vencimento">
                                <Edit2 size={18} />
                              </button>
                              <button onClick={() => handleMarkAsPaid(cte.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Dar Baixa (Marcar como Pago)">
                                <CheckCircle size={18} />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredCtes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Nenhum CTE encontrado.
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

export default CteReceivables;
