import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, BarChart3, Save, Edit2, Check, Calculator, Plus, Trash2 } from 'lucide-react';
import { Transaction, DRECategory } from '../../App';

interface CompanyValuationProps {
  transactions: Transaction[];
  dreCategories: DRECategory[];
  addDreCategory: (newCategory: Omit<DRECategory, 'id'>) => void;
  updateDreCategory: (updatedCategory: DRECategory) => void;
  deleteDreCategory: (categoryId: string) => void;
}

const formatCurrency = (val: number) => 
  val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

const formatPercent = (val: number) => 
  val.toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 1 });

const years = [2021, 2022, 2023, 2024, 2025, 2026];

const CompanyValuation: React.FC<CompanyValuationProps> = ({ 
  transactions, 
  dreCategories, 
  addDreCategory, 
  updateDreCategory, 
  deleteDreCategory 
}) => {
  const [historicalData, setHistoricalData] = useState<Record<string, Record<number, number>>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [ebitdaMultiple, setEbitdaMultiple] = useState<number>(6.5);
  const [revenueMultiple, setRevenueMultiple] = useState<number>(1.2);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryGroup, setNewCategoryGroup] = useState('');

  // Calculate 2026 values from transactions
  const currentYearTransactions = transactions.filter(t => t.date.startsWith('2026') && t.status === 'EFETIVADO');
  
  const getCategoryValue = (categoryId: string, year: number) => {
    if (year === 2026) {
      const catTxs = currentYearTransactions.filter(t => t.cat === categoryId);
      const total = catTxs.reduce((acc, t) => acc + (t.type === 'ENTRADA' ? t.value : -t.value), 0);
      return Math.abs(total); // Return absolute value, we handle signs in the DRE structure
    }
    return historicalData[categoryId]?.[year] || 0;
  };

  const handleInputChange = (categoryId: string, year: number, value: string) => {
    const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
    setHistoricalData(prev => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {}),
        [year]: numValue
      }
    }));
  };

  const handleNameChange = (categoryId: string, newName: string) => {
    const category = dreCategories.find(c => c.id === categoryId);
    if (category) {
      updateDreCategory({ ...category, name: newName });
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName && newCategoryGroup) {
      addDreCategory({ name: newCategoryName, group: newCategoryGroup });
      setNewCategoryName('');
      setNewCategoryGroup('');
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteDreCategory(categoryId);
  };

  // DRE Structure Calculation
  const getGroupTotal = (groups: string[], year: number) => {
    const categoriesInGroup = dreCategories.filter(c => groups.includes(c.group));
    return categoriesInGroup.reduce((acc, c) => {
      let val = getCategoryValue(c.id, year);
      // If it's a financial result, it can be negative, but we stored it as absolute or negative?
      // For simplicity, let's assume historical data for financial result is stored with its sign.
      if (c.group === 'RESULTADO_FINANCEIRO' && year !== 2026) {
        val = historicalData[c.id]?.[year] || 0;
      }
      return acc + val;
    }, 0);
  };

  const calculateDRE = (year: number) => {
    const grossRevenue = getGroupTotal(['RECEITA_BRUTA_CAIXA', 'RECEITA_BRUTA_COMPETENCIA'], year);
    const deductions = getGroupTotal(['TRIBUTOS'], year);
    const netRevenue = grossRevenue - deductions;
    const cogs = getGroupTotal(['CUSTO_DIRETO_PESSOAL', 'CUSTO_DIRETO_OPERACIONAL'], year);
    const grossProfit = netRevenue - cogs;
    const opex = getGroupTotal(['DESPESAS_FIXAS', 'DESPESAS_ADMINISTRATIVAS'], year);
    const ebitda = grossProfit - opex;
    const da = getGroupTotal(['DEPRECIACAO'], year);
    const ebit = ebitda - da;
    
    // For 2026, we calculate financial result from transactions.
    // ENTRADA = positive, SAIDA = negative
    let financialResult = 0;
    if (year === 2026) {
      const finTxs = currentYearTransactions.filter(t => {
        const cat = dreCategories.find(c => c.id === t.cat);
        return cat?.group === 'RESULTADO_FINANCEIRO';
      });
      financialResult = finTxs.reduce((acc, t) => acc + (t.type === 'ENTRADA' ? t.value : -t.value), 0);
    } else {
      // For historical, we just sum the values (they might be negative)
      const finCats = dreCategories.filter(c => c.group === 'RESULTADO_FINANCEIRO');
      financialResult = finCats.reduce((acc, c) => acc + (historicalData[c.id]?.[year] || 0), 0);
    }

    const taxes = getGroupTotal(['IMPOSTOS_LUCRO'], year);
    const netIncome = ebit + financialResult - taxes;

    return { grossRevenue, deductions, netRevenue, cogs, grossProfit, opex, ebitda, da, ebit, financialResult, taxes, netIncome };
  };

  const dreByYear = years.reduce((acc, year) => {
    acc[year] = calculateDRE(year);
    return acc;
  }, {} as Record<number, ReturnType<typeof calculateDRE>>);

  // Valuation based on 2026 (or 2025 if 2026 is empty, but let's use 2026 annualized or just 2025 for now)
  // Let's use 2025 for valuation since 2026 is ongoing
  const valuationYear = 2025;
  const valuationEbitda = dreByYear[valuationYear].ebitda * ebitdaMultiple;
  const valuationRevenue = dreByYear[valuationYear].netRevenue * revenueMultiple;
  const averageValuation = (valuationEbitda + valuationRevenue) / 2;

  const renderCategoryRows = (groups: string[]) => {
    const categories = dreCategories.filter(c => groups.includes(c.group));
    if (categories.length === 0) return null;

    return categories.map(c => (
      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
        <td className="py-2 px-4 text-sm pl-8 flex items-center justify-between">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              <input 
                type="text" 
                value={c.name} 
                onChange={(e) => handleNameChange(c.id, e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-bordeaux focus:border-transparent"
              />
              <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
            </div>
          ) : (
            <span className="text-gray-600">{c.name}</span>
          )}
        </td>
        {years.map(year => (
          <td key={`${c.id}-${year}`} className="py-2 px-4 text-right text-sm text-gray-500">
            {year === 2026 ? (
              <span className="font-medium text-gray-700">{formatCurrency(getCategoryValue(c.id, year))}</span>
            ) : isEditing ? (
              <input
                type="number"
                value={historicalData[c.id]?.[year] || ''}
                onChange={(e) => handleInputChange(c.id, year, e.target.value)}
                className="w-full text-right border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                placeholder="0"
              />
            ) : (
              <span>{formatCurrency(getCategoryValue(c.id, year))}</span>
            )}
          </td>
        ))}
      </tr>
    ));
  };

  const renderSubtotalRow = (label: string, field: keyof ReturnType<typeof calculateDRE>, isHighlight = false) => (
    <tr className={`border-b border-gray-200 ${isHighlight ? 'bg-bordeaux/5 text-bordeaux font-black' : 'bg-gray-50/80 font-bold text-gray-800'}`}>
      <td className="py-3 px-4 text-sm">{label}</td>
      {years.map(year => (
        <td key={`${year}-${field}`} className="py-3 px-4 text-right text-sm">
          {formatCurrency(dreByYear[year][field])}
        </td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-bordeaux" /> Histórico DRE & Valuation
          </h2>
          <p className="text-gray-500 text-sm mt-1">Acompanhe a evolução dos resultados e a valorização estimada da empresa.</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all ${
            isEditing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {isEditing ? <><Save size={16} /> Concluir Edição</> : <><Edit2 size={16} /> Editar Contas e Valores</>}
        </button>
      </div>

      {/* Valuation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={64} /></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Valuation (Múltiplo EBITDA)</p>
          <div className="flex items-end gap-2 mb-2">
            <h3 className="text-3xl font-black text-gray-900">{formatCurrency(valuationEbitda)}</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Múltiplo aplicado:</span>
            {isEditing ? (
              <input 
                type="number" step="0.1" value={ebitdaMultiple} onChange={e => setEbitdaMultiple(parseFloat(e.target.value) || 0)}
                className="w-16 border border-gray-300 rounded px-1 text-center"
              />
            ) : (
              <span className="font-bold text-gray-700">{ebitdaMultiple}x</span>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={64} /></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Valuation (Múltiplo Receita)</p>
          <div className="flex items-end gap-2 mb-2">
            <h3 className="text-3xl font-black text-gray-900">{formatCurrency(valuationRevenue)}</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Múltiplo aplicado:</span>
            {isEditing ? (
              <input 
                type="number" step="0.1" value={revenueMultiple} onChange={e => setRevenueMultiple(parseFloat(e.target.value) || 0)}
                className="w-16 border border-gray-300 rounded px-1 text-center"
              />
            ) : (
              <span className="font-bold text-gray-700">{revenueMultiple}x</span>
            )}
          </div>
        </div>

        <div className="bg-bordeaux text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Calculator size={64} /></div>
          <p className="text-sm font-bold text-white/80 uppercase tracking-wider mb-1">Valor de Mercado Estimado (Média)</p>
          <div className="flex items-end gap-2 mt-4">
            <h3 className="text-4xl font-black">{formatCurrency(averageValuation)}</h3>
          </div>
          <p className="text-sm text-white/80 mt-2">Baseado no ano de {valuationYear}</p>
        </div>
      </div>

      {/* Historical DRE Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">DRE Histórico Comparativo</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300"></span>
            <span>2026 é calculado automaticamente</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-black tracking-wider">
              <tr>
                <th className="py-4 px-4 w-1/4">Indicador / Conta</th>
                {years.map(year => (
                  <th key={year} className={`py-4 px-4 text-right ${year === 2026 ? 'text-emerald-700 bg-emerald-50/50' : ''}`}>
                    {year} {year === 2026 && '(Atual)'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {/* Receita Bruta */}
              <tr><td colSpan={years.length + 1} className="py-2 px-4 font-bold text-gray-800 bg-gray-50">Receita Operacional Bruta</td></tr>
              {renderCategoryRows(['RECEITA_BRUTA_CAIXA', 'RECEITA_BRUTA_COMPETENCIA'])}
              {renderSubtotalRow('Total Receita Bruta', 'grossRevenue')}

              {/* Deduções */}
              <tr><td colSpan={years.length + 1} className="py-2 px-4 font-bold text-gray-800 bg-gray-50">(-) Deduções da Receita Bruta</td></tr>
              {renderCategoryRows(['TRIBUTOS'])}
              {renderSubtotalRow('(=) Receita Operacional Líquida', 'netRevenue', true)}

              {/* Custos */}
              <tr><td colSpan={years.length + 1} className="py-2 px-4 font-bold text-gray-800 bg-gray-50">(-) Custos (CMV/CSP)</td></tr>
              {renderCategoryRows(['CUSTO_DIRETO_PESSOAL', 'CUSTO_DIRETO_OPERACIONAL'])}
              {renderSubtotalRow('(=) Lucro Bruto', 'grossProfit', true)}

              {/* Despesas */}
              <tr><td colSpan={years.length + 1} className="py-2 px-4 font-bold text-gray-800 bg-gray-50">(-) Despesas Operacionais (OpEx)</td></tr>
              {renderCategoryRows(['DESPESAS_FIXAS', 'DESPESAS_ADMINISTRATIVAS'])}
              {renderSubtotalRow('(=) EBITDA', 'ebitda', true)}

              {/* Depreciação */}
              <tr><td colSpan={years.length + 1} className="py-2 px-4 font-bold text-gray-800 bg-gray-50">(-) Depreciação e Amortização</td></tr>
              {renderCategoryRows(['DEPRECIACAO'])}
              {renderSubtotalRow('(=) EBIT (Lucro Operacional)', 'ebit', true)}

              {/* Resultado Financeiro */}
              <tr><td colSpan={years.length + 1} className="py-2 px-4 font-bold text-gray-800 bg-gray-50">(+/-) Resultado Financeiro</td></tr>
              {renderCategoryRows(['RESULTADO_FINANCEIRO'])}
              
              {/* Impostos */}
              <tr><td colSpan={years.length + 1} className="py-2 px-4 font-bold text-gray-800 bg-gray-50">(-) IR e CSLL</td></tr>
              {renderCategoryRows(['IMPOSTOS_LUCRO'])}
              {renderSubtotalRow('(=) Lucro Líquido do Exercício', 'netIncome', true)}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="py-4 px-4 text-sm font-bold text-gray-600">Margem EBITDA</td>
                {years.map(year => (
                  <td key={`margin-ebitda-${year}`} className={`py-4 px-4 text-right text-sm font-bold ${year === 2026 ? 'bg-emerald-50/50' : ''} text-emerald-600`}>
                    {dreByYear[year].netRevenue ? formatPercent(dreByYear[year].ebitda / dreByYear[year].netRevenue) : '0%'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-4 text-sm font-bold text-gray-600">Margem Líquida</td>
                {years.map(year => (
                  <td key={`margin-net-${year}`} className={`py-4 px-4 text-right text-sm font-bold ${year === 2026 ? 'bg-emerald-50/50' : ''} text-blue-600`}>
                    {dreByYear[year].netRevenue ? formatPercent(dreByYear[year].netIncome / dreByYear[year].netRevenue) : '0%'}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {isEditing && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <h4 className="font-bold text-gray-800 mb-4">Adicionar Nova Conta</h4>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Nome da Conta (ex: Receita de Armazenagem)" 
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-bordeaux focus:border-transparent"
              />
              <select 
                value={newCategoryGroup}
                onChange={e => setNewCategoryGroup(e.target.value)}
                className="w-64 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-bordeaux focus:border-transparent"
              >
                <option value="">Selecione o Grupo...</option>
                <option value="RECEITA_BRUTA_CAIXA">Receita Bruta</option>
                <option value="TRIBUTOS">Deduções (Tributos)</option>
                <option value="CUSTO_DIRETO_OPERACIONAL">Custos Operacionais</option>
                <option value="CUSTO_DIRETO_PESSOAL">Custos com Pessoal</option>
                <option value="DESPESAS_FIXAS">Despesas Fixas</option>
                <option value="DESPESAS_ADMINISTRATIVAS">Despesas Administrativas</option>
                <option value="DEPRECIACAO">Depreciação e Amortização</option>
                <option value="RESULTADO_FINANCEIRO">Resultado Financeiro</option>
                <option value="IMPOSTOS_LUCRO">IRPJ e CSLL</option>
              </select>
              <button 
                onClick={handleAddCategory}
                disabled={!newCategoryName || !newCategoryGroup}
                className="flex items-center gap-2 px-6 py-2 bg-bordeaux text-white rounded-lg font-bold hover:bg-bordeaux/90 disabled:opacity-50"
              >
                <Plus size={18} /> Adicionar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyValuation;
