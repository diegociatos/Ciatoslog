
import React, { useState } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Calculator, 
  Download, 
  Calendar,
  TrendingUp,
  Scale,
  FileSpreadsheet,
  Plus
} from 'lucide-react';

type FinanceTab = 'Fluxo de Caixa' | 'DRE Individual' | 'DRE Consolidado';

interface FinanceModuleProps {
  unit: string;
}

const FinanceModule: React.FC<FinanceModuleProps> = ({ unit }) => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('Fluxo de Caixa');

  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Mock Data para Fluxo de Caixa
  const cashFlowData = [
    { id: 1, date: '2023-11-10', desc: 'Faturamento Cliente AgroForte', type: 'ENTRADA', value: 15200.50, cat: 'Frete' },
    { id: 2, date: '2023-11-11', desc: 'Abastecimento Frota - Posto Shell', type: 'SAIDA', value: 4850.20, cat: 'Combustível' },
    { id: 3, date: '2023-11-11', desc: 'Manutenção Caminhão ABC-1234', type: 'SAIDA', value: 1200.00, cat: 'Manutenção' },
    { id: 4, date: '2023-11-12', desc: 'Faturamento Indústrias Brasil', type: 'ENTRADA', value: 8900.00, cat: 'Frete' },
    { id: 5, date: '2023-11-13', desc: 'Pedágio Rota SP-RJ', type: 'SAIDA', value: 450.80, cat: 'Operacional' },
    { id: 6, date: '2023-11-14', desc: 'Pagamento Motoristas Quinzena', type: 'SAIDA', value: 22000.00, cat: 'Pessoal' },
  ];

  const totalIn = cashFlowData.filter(i => i.type === 'ENTRADA').reduce((a, b) => a + b.value, 0);
  const totalOut = cashFlowData.filter(i => i.type === 'SAIDA').reduce((a, b) => a + b.value, 0);

  // Lógica de Renderização das Abas
  const renderContent = () => {
    switch (activeTab) {
      case 'Fluxo de Caixa':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard title="Entradas" value={totalIn} type="in" icon={<ArrowUpCircle />} />
              <SummaryCard title="Saídas" value={totalOut} type="out" icon={<ArrowDownCircle />} />
              <SummaryCard title="Saldo Final" value={totalIn - totalOut} type="balance" icon={<Wallet />} />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-lg">Lançamentos Recentes</h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-bordeaux text-white rounded-lg text-sm font-bold shadow-md hover:opacity-90">
                    <Plus size={16} /> Novo Lançamento
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
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Descrição</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4">Valor</th>
                      <th className="px-6 py-4 text-center">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cashFlowData.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500 italic">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 font-bold text-gray-800">{item.desc}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] px-2 py-1 bg-gray-100 rounded-full text-gray-500 font-bold uppercase tracking-widest">{item.cat}</span>
                        </td>
                        <td className={`px-6 py-4 font-bold ${item.type === 'ENTRADA' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.type === 'SAIDA' ? '-' : '+'} {formatCurrency(item.value)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex p-1.5 rounded-full ${item.type === 'ENTRADA' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {item.type === 'ENTRADA' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'DRE Individual':
        return <DRETable unitName={unit} data={mockDREData.ciatos} />;

      case 'DRE Consolidado':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DRETable unitName="BD Transportes" data={mockDREData.bd} isCompact />
              <DRETable unitName="Ciatoslog" data={mockDREData.ciatos} isCompact />
            </div>
            <DRETable unitName="Visão Consolidada (Holding)" data={mockDREData.consolidated} isMain />
          </div>
        );
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

      <div className="flex border-b border-gray-200">
        {['Fluxo de Caixa', 'DRE Individual', 'DRE Consolidado'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as FinanceTab)}
            className={`px-8 py-4 font-bold text-sm transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-bordeaux text-bordeaux' 
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="py-4">
        {renderContent()}
      </div>
    </div>
  );
};

// Componente para Cartões de Resumo
const SummaryCard = ({ title, value, type, icon }: { title: string, value: number, type: 'in' | 'out' | 'balance', icon: any }) => {
  const colors = {
    in: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    out: 'text-red-600 bg-red-50 border-red-100',
    balance: 'text-bordeaux bg-white border-bordeaux shadow-md'
  };
  
  return (
    <div className={`p-6 rounded-2xl border ${colors[type]} transition-all flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold uppercase text-xs tracking-tighter opacity-70">{title}</span>
        <div className="p-2 rounded-lg bg-current bg-opacity-10">{icon}</div>
      </div>
      <h4 className="text-2xl font-black">{value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h4>
    </div>
  );
};

// Componente para a Tabela DRE
const DRETable = ({ unitName, data, isCompact, isMain }: { unitName: string, data: any, isCompact?: boolean, isMain?: boolean }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${isMain ? 'ring-2 ring-bordeaux ring-opacity-10' : ''}`}>
    <div className={`p-6 flex items-center justify-between ${isMain ? 'bg-bordeaux text-white' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-3">
        <FileSpreadsheet size={isCompact ? 18 : 22} />
        <h3 className={`${isCompact ? 'text-base' : 'text-xl'} font-bold`}>{unitName}</h3>
      </div>
      {!isCompact && (
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${isMain ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>
          Novembro 2023
        </span>
      )}
    </div>
    
    <div className="p-2 md:p-6 space-y-1">
      <DRERow label="Receita Operacional Bruta" value={data.bruta} isHeader />
      <DRERow label="(-) Impostos e Deduções" value={-data.impostos} />
      <DRERow label="(=) Receita Operacional Líquida" value={data.liquida} isSubtotal />
      
      <div className="h-4"></div>
      
      <DRERow label="(-) Custos Operacionais (Diretos)" value={-data.custosDir} />
      <DRERow label="   • Fretes de Terceiros" value={-data.fretesTerc} isIndent />
      <DRERow label="   • Combustíveis & Pedágios" value={-data.combustivel} isIndent />
      <DRERow label="(=) Margem de Contribuição" value={data.margem} isSubtotal />
      
      <div className="h-4"></div>
      
      <DRERow label="(-) Despesas Administrativas Fixas" value={-data.fixas} />
      <DRERow label="(-) Outras Despesas / Receitas" value={data.outras} />
      
      <div className="h-6 border-b border-gray-100"></div>
      
      <div className={`flex items-center justify-between p-4 rounded-xl mt-4 ${data.lucro >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
        <div className="flex items-center gap-2">
          {data.lucro >= 0 ? <TrendingUp className="text-emerald-600" /> : <Scale className="text-red-600" />}
          <span className="font-black text-gray-800 uppercase tracking-tighter">Lucro Líquido Final</span>
        </div>
        <span className={`text-2xl font-black ${data.lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {data.lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>
    </div>
  </div>
);

const DRERow = ({ label, value, isHeader, isSubtotal, isIndent }: any) => (
  <div className={`flex justify-between items-center px-4 py-2.5 rounded transition-colors hover:bg-gray-50/50 ${isHeader ? 'bg-gray-50/50 font-black text-gray-800' : 'text-gray-600'} ${isSubtotal ? 'border-b-2 border-gray-100 font-bold bg-gray-50/20' : ''}`}>
    <span className={`${isIndent ? 'pl-8 text-xs italic' : 'text-sm font-medium'}`}>{label}</span>
    <span className={`text-sm font-bold ${value < 0 ? 'text-red-500' : (isSubtotal || isHeader ? 'text-gray-900' : 'text-gray-700')}`}>
      {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
    </span>
  </div>
);

// Mock Data DRE
const mockDREData = {
  bd: {
    bruta: 1200000,
    impostos: 180000,
    liquida: 1020000,
    custosDir: 650000,
    fretesTerc: 400000,
    combustivel: 250000,
    margem: 370000,
    fixas: 120000,
    outras: -5000,
    lucro: 245000
  },
  ciatos: {
    bruta: 850000,
    impostos: 127500,
    liquida: 722500,
    custosDir: 450000,
    fretesTerc: 300000,
    combustivel: 150000,
    margem: 272500,
    fixas: 80000,
    outras: 15000,
    lucro: 177500
  },
  consolidated: {
    bruta: 2050000,
    impostos: 307500,
    liquida: 1742500,
    custosDir: 1100000,
    fretesTerc: 700000,
    combustivel: 400000,
    margem: 642500,
    fixas: 200000,
    outras: 10000,
    lucro: 422500
  }
};

export default FinanceModule;
