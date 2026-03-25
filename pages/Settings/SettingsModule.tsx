
import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Settings as SettingsIcon,
  ChevronRight,
  Route,
  Save,
  CheckCircle,
  AlertCircle,
  Layers,
  Percent,
  Target,
  X,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react';
import { VehicleType, RouteConfig, BankAccount, DRECategory, User, CommercialGoal, CommissionRule } from '../../App';

interface SettingsModuleProps {
  vehicleTypes: VehicleType[];
  setVehicleTypes: React.Dispatch<React.SetStateAction<VehicleType[]>>;
  routes: RouteConfig[];
  setRoutes: React.Dispatch<React.SetStateAction<RouteConfig[]>>;
  segments: string[];
  setSegments: React.Dispatch<React.SetStateAction<string[]>>;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  dreCategories: DRECategory[];
  setDreCategories: React.Dispatch<React.SetStateAction<DRECategory[]>>;
  users: User[];
  commercialGoals: CommercialGoal[];
  setCommercialGoals: React.Dispatch<React.SetStateAction<CommercialGoal[]>>;
  commissionRules: CommissionRule[];
  setCommissionRules: React.Dispatch<React.SetStateAction<CommissionRule[]>>;
}

const SettingsModule: React.FC<SettingsModuleProps> = ({ 
  vehicleTypes, 
  setVehicleTypes, 
  routes, 
  setRoutes,
  segments,
  setSegments,
  bankAccounts,
  setBankAccounts,
  dreCategories,
  setDreCategories,
  users,
  commercialGoals,
  setCommercialGoals,
  commissionRules,
  setCommissionRules
}) => {
  const [activeTab, setActiveTab] = useState<'Veiculos' | 'Segmentos' | 'Agenciamento' | 'Usuarios' | 'Bancos' | 'DRE' | 'Metas'>('Veiculos');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header do Módulo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Parametrização do Sistema</h2>
          <p className="text-gray-500 italic">Configure as bases técnicas que alimentam a inteligência logística e comercial.</p>
        </div>
        <div className="bg-bordeaux text-white p-4 rounded-2xl shadow-lg shadow-bordeaux/20">
          <SettingsIcon size={28} />
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-3xl shadow-sm px-6 overflow-x-auto">
        {[
          { id: 'Veiculos', label: 'Tipos de Veículos', icon: <Truck size={18} /> },
          { id: 'Segmentos', label: 'Segmentos de Mercado', icon: <Target size={18} /> },
          { id: 'Agenciamento', label: 'Regras de Agenciamento', icon: <Percent size={18} /> },
          { id: 'Usuarios', label: 'Segurança & Acessos', icon: <Users size={18} /> },
          { id: 'Bancos', label: 'Bancos e Caixas', icon: <DollarSign size={18} /> },
          { id: 'DRE', label: 'Categorias DRE', icon: <Layers size={18} /> },
          { id: 'Metas', label: 'Metas e Comissões', icon: <TrendingUp size={18} /> }
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-5 font-black text-xs uppercase tracking-widest transition-all border-b-4 flex items-center gap-3 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-bordeaux text-bordeaux bg-bordeaux/5' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Abas */}
      <div className="bg-white rounded-b-3xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
        {activeTab === 'Veiculos' && <VehicleManager vehicleTypes={vehicleTypes} setVehicleTypes={setVehicleTypes} />}
        {activeTab === 'Segmentos' && <SegmentManager segments={segments} setSegments={setSegments} />}
        {activeTab === 'Agenciamento' && <AgencyManager />}
        {activeTab === 'Usuarios' && <UserManager />}
        {activeTab === 'Bancos' && <BankManager bankAccounts={bankAccounts} setBankAccounts={setBankAccounts} />}
        {activeTab === 'DRE' && <DRECategoryManager dreCategories={dreCategories} setDreCategories={setDreCategories} />}
        {activeTab === 'Metas' && (
          <div className="space-y-12">
            <CommercialGoalsManager users={users} commercialGoals={commercialGoals} setCommercialGoals={setCommercialGoals} />
            <CommissionRulesManager commissionRules={commissionRules} setCommissionRules={setCommissionRules} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sub-componentes de Bancos e DRE ---
const BankManager = ({ bankAccounts, setBankAccounts }: { bankAccounts: BankAccount[], setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>> }) => {
  const [newBank, setNewBank] = useState({ name: '', type: 'BANCO' as 'BANCO' | 'CAIXA', initialBalance: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBank, setEditBank] = useState({ name: '', type: 'BANCO' as 'BANCO' | 'CAIXA' });

  const handleAdd = () => {
    if (!newBank.name.trim()) return;
    setBankAccounts([...bankAccounts, { ...newBank, id: Date.now().toString() }]);
    setNewBank({ name: '', type: 'BANCO', initialBalance: 0 });
  };

  const handleEdit = (bank: BankAccount) => {
    setEditingId(bank.id);
    setEditBank({ name: bank.name, type: bank.type });
  };

  const handleSaveEdit = () => {
    if (!editBank.name.trim() || !editingId) return;
    setBankAccounts(bankAccounts.map(b => b.id === editingId ? { ...b, name: editBank.name, type: editBank.type } : b));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setBankAccounts(bankAccounts.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
        <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-4">Novo Banco/Caixa</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nome da Conta"
            value={newBank.name}
            onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
            className="col-span-2 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-bordeaux/20"
          />
          <select
            value={newBank.type}
            onChange={(e) => setNewBank({ ...newBank, type: e.target.value as 'BANCO' | 'CAIXA' })}
            className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-bordeaux/20"
          >
            <option value="BANCO">Banco</option>
            <option value="CAIXA">Caixa Físico</option>
          </select>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 bg-bordeaux text-white px-6 py-3 rounded-xl font-bold hover:bg-bordeaux/90 transition-colors"
          >
            <Plus size={18} /> Adicionar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankAccounts.map(bank => (
          <div key={bank.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            {editingId === bank.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editBank.name}
                  onChange={(e) => setEditBank({ ...editBank, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-bordeaux/20"
                />
                <select
                  value={editBank.type}
                  onChange={(e) => setEditBank({ ...editBank, type: e.target.value as 'BANCO' | 'CAIXA' })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-bordeaux/20"
                >
                  <option value="BANCO">Banco</option>
                  <option value="CAIXA">Caixa Físico</option>
                </select>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-lg">
                    <X size={18} />
                  </button>
                  <button onClick={handleSaveEdit} className="p-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-lg">
                    <Save size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-gray-800 text-lg">{bank.name}</h4>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${bank.type === 'BANCO' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {bank.type}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => handleEdit(bank)} className="text-gray-400 hover:text-bordeaux p-2 bg-gray-50 rounded-lg">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(bank.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const DRECategoryManager = ({ dreCategories, setDreCategories }: { dreCategories: DRECategory[], setDreCategories: React.Dispatch<React.SetStateAction<DRECategory[]>> }) => {
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState<DRECategory['group']>('RECEITA_BRUTA_CAIXA');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGroup, setEditGroup] = useState<DRECategory['group']>('RECEITA_BRUTA_CAIXA');

  const handleAdd = () => {
    if (!newName.trim()) return;
    setDreCategories([...dreCategories, { id: Date.now().toString(), name: newName, group: newGroup }]);
    setNewName('');
  };

  const handleEdit = (cat: DRECategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditGroup(cat.group);
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editingId) return;
    setDreCategories(dreCategories.map(c => c.id === editingId ? { ...c, name: editName, group: editGroup } : c));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setDreCategories(dreCategories.filter(c => c.id !== id));
  };

  const groups = [
    { id: 'RECEITA_BRUTA_COMPETENCIA', label: 'RECEITA OPERACIONAL POR COMPETÊNCIA' },
    { id: 'RECEITA_BRUTA_CAIXA', label: 'RECEITA OPERACIONAL BRUTA' },
    { id: 'TRIBUTOS', label: 'TRIBUTOS' },
    { id: 'CUSTO_DIRETO_PESSOAL', label: 'CUSTO DIRETO PESSOAL' },
    { id: 'CUSTO_DIRETO_OPERACIONAL', label: 'CUSTO DIRETO' },
    { id: 'DESPESAS_COMERCIAIS', label: 'DESPESAS COMERCIAIS' },
    { id: 'DESPESAS_ADMINISTRATIVAS', label: 'DESPESAS ADMINISTRATIVAS' },
    { id: 'DESPESAS_FINANCEIRAS', label: 'DESPESAS FINANCEIRAS' },
    { id: 'INVESTIMENTOS', label: 'INVESTIMENTOS' }
  ];

  const renderGroup = (groupId: string, label: string, styleClass: string) => {
    const groupCats = dreCategories.filter(c => c.group === groupId);

    return (
      <React.Fragment key={groupId}>
        <div className={`flex border-b border-gray-200 ${styleClass}`}>
          <div className="flex-1 px-2 py-1.5 text-xs border-r border-gray-200 flex items-center font-bold">
            {label}
          </div>
          <div className="w-32 flex-shrink-0 px-2 py-1.5 text-xs flex items-center justify-center font-bold">
            -
          </div>
        </div>
        
        {groupCats.map((cat, index) => (
          <div key={cat.id} className={`flex border-b border-gray-200 ${index % 2 === 0 ? 'bg-white text-black' : 'bg-gray-50 text-black'}`}>
            <div className="flex-1 px-2 py-1.5 text-xs border-r border-gray-200 flex items-center">
              {editingId === cat.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 rounded border border-gray-300 outline-none focus:ring-1 focus:ring-bordeaux/50 text-xs text-black"
                    placeholder="Nome da Conta"
                  />
                  <select
                    value={editGroup}
                    onChange={(e) => setEditGroup(e.target.value as DRECategory['group'])}
                    className="px-2 py-1 rounded border border-gray-300 outline-none focus:ring-1 focus:ring-bordeaux/50 text-xs text-black"
                  >
                    {groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                </div>
              ) : (
                <span className="text-gray-800">{cat.name}</span>
              )}
            </div>
            <div className="w-32 flex-shrink-0 px-2 py-1.5 text-xs flex items-center justify-center gap-2">
              {editingId === cat.id ? (
                <>
                  <button onClick={handleSaveEdit} className="p-1 text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded">
                    <Save size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-600 bg-gray-100 rounded">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEdit(cat)} className="text-gray-400 hover:text-blue-600 p-1">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </React.Fragment>
    );
  };

  const renderCalculatedRow = (label: string, styleClass: string) => (
    <div className={`flex border-b border-gray-200 ${styleClass}`}>
      <div className="flex-1 px-2 py-1.5 text-xs border-r border-gray-200 flex items-center font-bold">
        {label}
      </div>
      <div className="w-32 flex-shrink-0 px-2 py-1.5 text-xs flex items-center justify-center font-bold">
        -
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Nova Conta DRE</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Nome da Conta (ex: Salário)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-bordeaux/20 text-sm"
          />
          <select
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value as DRECategory['group'])}
            className="w-64 px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-bordeaux/20 text-sm"
          >
            {groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 bg-bordeaux text-white px-6 py-2 rounded-lg font-bold hover:bg-bordeaux/90 transition-colors text-sm"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="p-4 bg-gray-100 border-b border-gray-200 flex items-center gap-3">
          <FileSpreadsheet size={20} className="text-gray-700" />
          <h3 className="text-lg font-bold text-gray-800">
            Estrutura do DRE
          </h3>
        </div>
        
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex bg-black text-white font-bold text-xs">
            <div className="flex-1 px-2 py-2 border-r border-gray-700 flex items-center justify-center">
              CONTA
            </div>
            <div className="w-32 flex-shrink-0 px-2 py-2 border-r border-gray-700 flex items-center justify-center text-center">
              AÇÕES
            </div>
          </div>

          {renderGroup('RECEITA_BRUTA_COMPETENCIA', 'RECEITA OPERACIONAL POR COMPETÊNCIA', 'bg-black text-white')}
          {renderGroup('RECEITA_BRUTA_CAIXA', 'RECEITA OPERACIONAL BRUTA', 'bg-black text-white')}
          {renderGroup('TRIBUTOS', 'TRIBUTOS', 'bg-[#c00000] text-white')}
          
          {renderCalculatedRow('RECEITA OPERACIONAL LÍQUIDA', 'bg-black text-white')}
          
          {renderCalculatedRow('CUSTO DIRETO TOTAL', 'bg-[#c00000] text-white')}
          
          {renderGroup('CUSTO_DIRETO_PESSOAL', 'CUSTO DIRETO PESSOAL', 'bg-[#c00000] text-white')}
          {renderGroup('CUSTO_DIRETO_OPERACIONAL', 'CUSTO DIRETO', 'bg-[#c00000] text-white')}
          
          {renderCalculatedRow('LUCRO BRUTO', 'bg-black text-white')}
          
          {renderCalculatedRow('DESPESAS OPERACIONAIS', 'bg-[#c00000] text-white')}
          
          {renderGroup('DESPESAS_COMERCIAIS', 'DESPESAS COMERCIAIS', 'bg-white text-[#c00000]')}
          {renderGroup('DESPESAS_ADMINISTRATIVAS', 'DESPESAS ADMINISTRATIVAS', 'bg-white text-[#c00000]')}
          {renderGroup('DESPESAS_FINANCEIRAS', 'DESPESAS FINANCEIRAS', 'bg-white text-[#c00000]')}
          
          {renderCalculatedRow('LUCRO LÍQUIDO', 'bg-[#1f497d] text-white')}
          
          {renderGroup('INVESTIMENTOS', 'INVESTIMENTOS', 'bg-[#c00000] text-white')}
          
          {renderCalculatedRow('RESULTADO DO EXERCÍCIO', 'bg-[#1f497d] text-white')}
        </div>
      </div>
    </div>
  );
};

// --- Sub-componente: Gestão de Segmentos ---
const SegmentManager = ({ segments, setSegments }: { segments: string[], setSegments: React.Dispatch<React.SetStateAction<string[]>> }) => {
  const [newSegment, setNewSegment] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (!newSegment.trim()) return;
    if (segments.includes(newSegment.trim())) return;
    setSegments([...segments, newSegment.trim()]);
    setNewSegment('');
  };

  const handleRemove = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(segments[index]);
  };

  const saveEdit = () => {
    if (!editValue.trim() || editingIndex === null) return;
    const updated = [...segments];
    updated[editingIndex] = editValue.trim();
    setSegments(updated);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bordeaux/10 text-bordeaux rounded-lg"><Target size={20} /></div>
          <h4 className="text-lg font-bold text-gray-800">Verticalização de Mercado</h4>
        </div>
      </div>

      {/* Input de Adição */}
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex gap-4 max-w-2xl shadow-sm">
        <input 
          type="text" 
          placeholder="Ex: Indústria Automobilística..."
          className="flex-1 px-5 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-bordeaux/5 outline-none font-bold"
          value={newSegment}
          onChange={(e) => setNewSegment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button 
          onClick={handleAdd}
          className="bg-bordeaux text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-bordeaux/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Cadastrar
        </button>
      </div>

      {/* Lista de Segmentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm group hover:border-bordeaux/20 transition-all">
            {editingIndex === index ? (
              <div className="flex-1 flex gap-2">
                <input 
                  autoFocus
                  className="flex-1 px-3 py-1 border-b-2 border-bordeaux outline-none font-bold text-gray-700"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                />
                <button onClick={saveEdit} className="text-emerald-500 hover:bg-emerald-50 p-1 rounded-lg"><CheckCircle size={20}/></button>
                <button onClick={() => setEditingIndex(null)} className="text-gray-400 hover:bg-gray-50 p-1 rounded-lg"><X size={20}/></button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-bordeaux shadow-sm"></div>
                  <span className="font-bold text-gray-700">{segment}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(index)} className="p-2 text-gray-400 hover:text-bordeaux hover:bg-bordeaux/5 rounded-xl"><Edit2 size={16}/></button>
                  <button onClick={() => handleRemove(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={16}/></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {segments.length === 0 && (
        <div className="py-20 text-center italic text-gray-400 border-2 border-dashed border-gray-50 rounded-3xl">
          Nenhum segmento cadastrado. Defina os setores econômicos da sua carteira.
        </div>
      )}
    </div>
  );
};

// --- Sub-componente: Gestão de Veículos ---
const VehicleManager = ({ vehicleTypes, setVehicleTypes }: any) => (
  <div className="space-y-8 animate-in slide-in-from-left-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-bordeaux/10 text-bordeaux rounded-lg"><Layers size={20} /></div>
        <h4 className="text-lg font-bold text-gray-800">Catálogo de Frotas Sacrificiais</h4>
      </div>
      <button className="bg-bordeaux text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:opacity-90 flex items-center gap-2 uppercase tracking-wider">
        <Plus size={16} /> Cadastrar Novo Tipo
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicleTypes.map((v: any) => (
        <div key={v.id} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 group hover:border-bordeaux/30 transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white text-bordeaux rounded-2xl shadow-sm"><Truck size={24} /></div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-gray-400 hover:text-bordeaux"><Edit2 size={16} /></button>
              <button className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
          <h5 className="text-xl font-black text-gray-800 mb-1">{v.name}</h5>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Status: Ativo na Programação</p>
          
          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase">Capacidade Nominal</p>
              <p className="text-sm font-black text-gray-700">{v.capacity} Toneladas</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase">Cubagem Padrão</p>
              <p className="text-sm font-black text-gray-700">{v.volume} m³</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- Sub-componente: Gestão de Rotas ---
const RouteManager = ({ routes, setRoutes }: any) => (
  <div className="space-y-8 animate-in slide-in-from-left-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-bordeaux/10 text-bordeaux rounded-lg"><MapPin size={20} /></div>
        <h4 className="text-lg font-bold text-gray-800">Tabela de Custos por Trecho</h4>
      </div>
      <button className="bg-bordeaux text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md uppercase tracking-wider">
        <Plus size={16} /> Mapear Nova Rota
      </button>
    </div>

    <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
          <tr>
            <th className="px-8 py-5">Trecho Principal (Origem → Destino)</th>
            <th className="px-8 py-5">Distância / Tempo</th>
            <th className="px-8 py-5">Pedágio Médio</th>
            <th className="px-8 py-5">Diesel Estimado</th>
            <th className="px-8 py-5 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {routes.map((r: any) => (
            <tr key={r.id} className="hover:bg-gray-50/80 transition-all group">
              <td className="px-8 py-5">
                <div className="flex items-center gap-3 font-black text-gray-800">
                   <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-bordeaux"><MapPin size={14}/></div>
                   {r.origin} <ChevronRight size={14} className="text-gray-300"/> {r.destination}
                </div>
              </td>
              <td className="px-8 py-5">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-700">{r.distance} KM</span>
                  <span className="text-[10px] text-gray-400 font-bold italic">~ {r.time} Horas</span>
                </div>
              </td>
              <td className="px-8 py-5 font-black text-indigo-600">
                {r.toll.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
              <td className="px-8 py-5 font-black text-gray-600">
                {r.fuel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
              <td className="px-8 py-5 text-right">
                <button className="p-2 text-gray-400 hover:text-bordeaux"><Edit2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- Sub-componente: Gestão de Agenciamento ---
const AgencyManager = () => (
  <div className="space-y-8 animate-in slide-in-from-left-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-bordeaux/10 text-bordeaux rounded-lg"><DollarSign size={20} /></div>
      <h4 className="text-lg font-bold text-gray-800">Política de Comissionamento e Agenciamento</h4>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
        <h5 className="text-sm font-black text-bordeaux uppercase tracking-widest mb-6 border-b border-bordeaux/10 pb-4">Comissão por Tipologia de Carga</h5>
        <div className="space-y-4">
          <CommissionRow label="Carga Geral / Sider" percent="8.5%" />
          <CommissionRow label="Carga Perigosa (MOPP)" percent="12.0%" />
          <CommissionRow label="Granel Agrícola" percent="6.0%" />
          <CommissionRow label="E-commerce / Fracionado" percent="15.0%" />
        </div>
      </div>

      <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
        <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-200 pb-4">Bonificações e Prêmios</h5>
        <div className="space-y-4">
          <CommissionRow label="Cliente Estratégico (Volume)" percent="+2.5%" isBonus />
          <CommissionRow label="Rota de Alta Performance" percent="+1.0%" isBonus />
          <CommissionRow label="Selo Ciatos de Qualidade" percent="+3.0%" isBonus />
        </div>
      </div>
    </div>

    <div className="p-6 bg-bordeaux text-white rounded-3xl flex items-center justify-between">
      <div className="flex items-center gap-4">
        <AlertCircle size={24} />
        <div>
          <p className="font-bold">Regra de Travamento de Margem</p>
          <p className="text-xs text-white/70">O sistema impede a aprovação automática de cargas com margem líquida inferior a <span className="font-black">15%</span>.</p>
        </div>
      </div>
      <button className="px-6 py-2 bg-white text-bordeaux rounded-xl font-bold text-sm shadow-xl">Configurar Trava</button>
    </div>
  </div>
);

const CommissionRow = ({ label, percent, isBonus }: { label: string, percent: string, isBonus?: boolean }) => (
  <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
    <span className="text-sm font-bold text-gray-700">{label}</span>
    <div className="flex items-center gap-3">
      <span className={`text-sm font-black px-4 py-1.5 rounded-xl ${isBonus ? 'bg-indigo-50 text-indigo-600' : 'bg-bordeaux text-white'}`}>
        {percent}
      </span>
      <button className="p-1.5 text-gray-300 hover:text-bordeaux"><Edit2 size={14}/></button>
    </div>
  </div>
);

// --- Sub-componente: Gestão de Usuários (Mock) ---
const UserManager = () => (
  <div className="space-y-8 animate-in slide-in-from-left-4">
    <div className="flex justify-between items-center">
      <h4 className="text-lg font-bold text-gray-800">Controle de Acessos Institucionais</h4>
      <button className="bg-bordeaux text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider">
        Convocar Usuário
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UserCard name="Marcos Oliveira" role="Gestor Comercial" email="marcos@ciatoslog.com" status="active" />
      <UserCard name="Ana Beatriz" role="Diretoria Financeira" email="ana.beatriz@ciatos.com" status="active" />
      <UserCard name="Carlos Silva" role="Programador Logístico" email="carlos.log@ciatos.com" status="active" />
    </div>
  </div>
);

const UserCard = ({ name, role, email, status }: any) => (
  <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center gap-4">
    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-bold uppercase">
      {name.charAt(0)}
    </div>
    <div>
      <p className="font-bold text-gray-800 leading-none mb-1">{name}</p>
      <p className="text-[10px] text-bordeaux font-black uppercase tracking-widest">{role}</p>
      <p className="text-xs text-gray-400 mt-1">{email}</p>
    </div>
  </div>
);

const CommercialGoalsManager = ({ users, commercialGoals, setCommercialGoals }: { users: User[], commercialGoals: CommercialGoal[], setCommercialGoals: React.Dispatch<React.SetStateAction<CommercialGoal[]>> }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('01');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [salesGoal, setSalesGoal] = useState<number>(0);
  const [prospectingGoal, setProspectingGoal] = useState<number>(0);

  const commercialUsers = users.filter(u => u.role === 'Comercial');

  const handleAddGoal = () => {
    if (!selectedUser) return;
    
    // Check if goal already exists for this user/month/year
    const existingIndex = commercialGoals.findIndex(g => g.userId === selectedUser && g.month === selectedMonth && g.year === selectedYear);
    
    if (existingIndex >= 0) {
      const updatedGoals = [...commercialGoals];
      updatedGoals[existingIndex] = {
        ...updatedGoals[existingIndex],
        salesGoal,
        prospectingGoal
      };
      setCommercialGoals(updatedGoals);
    } else {
      const newGoal: CommercialGoal = {
        id: `G${Date.now()}`,
        userId: selectedUser,
        month: selectedMonth,
        year: selectedYear,
        salesGoal,
        prospectingGoal
      };
      setCommercialGoals([...commercialGoals, newGoal]);
    }
    
    // Reset form
    setSalesGoal(0);
    setProspectingGoal(0);
  };

  const handleDeleteGoal = (id: string) => {
    setCommercialGoals(commercialGoals.filter(g => g.id !== id));
  };

  const months = [
    { value: '01', label: 'Janeiro' }, { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' }, { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' }, { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' }, { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' }, { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - 2 + i).toString());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Metas do Comercial</h2>
          <p className="text-sm text-gray-500">Defina metas de faturamento e prospecção por mês para cada usuário comercial.</p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Comercial</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
            >
              <option value="">Selecione...</option>
              {commercialUsers.map(u => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Mês</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Ano</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Meta Faturamento (R$)</label>
            <input
              type="number"
              value={salesGoal || ''}
              onChange={(e) => setSalesGoal(Number(e.target.value))}
              placeholder="Ex: 50000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Meta Prospecção (Qtd)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={prospectingGoal || ''}
                onChange={(e) => setProspectingGoal(Number(e.target.value))}
                placeholder="Ex: 10"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
              />
              <button
                onClick={handleAddGoal}
                disabled={!selectedUser || salesGoal <= 0 || prospectingGoal <= 0}
                className="bg-bordeaux text-white p-3 rounded-xl hover:bg-bordeaux-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Comercial</th>
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Período</th>
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Meta Faturamento</th>
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Meta Prospecção</th>
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {commercialGoals.map((goal) => (
              <tr key={goal.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6">
                  <span className="font-medium text-gray-900">{goal.userId}</span>
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {months.find(m => m.value === goal.month)?.label} / {goal.year}
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.salesGoal)}
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {goal.prospectingGoal} clientes
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {commercialGoals.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Nenhuma meta cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CommissionRulesManager = ({ commissionRules, setCommissionRules }: { commissionRules: CommissionRule[], setCommissionRules: React.Dispatch<React.SetStateAction<CommissionRule[]>> }) => {
  const [role, setRole] = useState<'Comercial' | 'Operacional'>('Comercial');
  const [type, setType] = useState<'Comissao_Faturamento' | 'Meta_Extra'>('Comissao_Faturamento');
  const [minRevenue, setMinRevenue] = useState<number>(0);
  const [maxRevenue, setMaxRevenue] = useState<number>(0);
  const [commissionPercentage, setCommissionPercentage] = useState<number>(0);
  const [targetRevenue, setTargetRevenue] = useState<number>(0);
  const [maxCostPercentage, setMaxCostPercentage] = useState<number>(0);
  const [bonusAmount, setBonusAmount] = useState<number>(0);

  const handleAddRule = () => {
    const newRule: CommissionRule = {
      id: `CR${Date.now()}`,
      role,
      type,
      minRevenue: type === 'Comissao_Faturamento' ? minRevenue : undefined,
      maxRevenue: type === 'Comissao_Faturamento' ? maxRevenue : undefined,
      commissionPercentage: type === 'Comissao_Faturamento' ? commissionPercentage : undefined,
      targetRevenue: type === 'Meta_Extra' && role === 'Comercial' ? targetRevenue : undefined,
      maxCostPercentage: type === 'Meta_Extra' ? maxCostPercentage : undefined,
      bonusAmount: type === 'Meta_Extra' ? bonusAmount : undefined,
    };
    setCommissionRules([...commissionRules, newRule]);
    setMinRevenue(0);
    setMaxRevenue(0);
    setCommissionPercentage(0);
    setTargetRevenue(0);
    setMaxCostPercentage(0);
    setBonusAmount(0);
  };

  const handleDeleteRule = (id: string) => {
    setCommissionRules(commissionRules.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 pt-10 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Regras de Comissionamento e Metas Extras</h2>
          <p className="text-sm text-gray-500">Defina regras de comissão sobre faturamento e bônus por redução de custo.</p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Perfil</label>
            <select 
              value={role} 
              onChange={(e) => {
                setRole(e.target.value as 'Comercial' | 'Operacional');
                if (e.target.value === 'Operacional') setType('Meta_Extra');
              }}
              className="w-full p-3 border border-gray-200 rounded-xl bg-white"
            >
              <option value="Comercial">Comercial</option>
              <option value="Operacional">Operacional (Programador)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Regra</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as 'Comissao_Faturamento' | 'Meta_Extra')}
              className="w-full p-3 border border-gray-200 rounded-xl bg-white"
              disabled={role === 'Operacional'}
            >
              {role === 'Comercial' && <option value="Comissao_Faturamento">Comissão sobre Faturamento</option>}
              <option value="Meta_Extra">Meta Extra (Bônus)</option>
            </select>
          </div>
        </div>

        {type === 'Comissao_Faturamento' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Faturamento Mínimo (R$)</label>
              <input type="number" value={minRevenue} onChange={(e) => setMinRevenue(Number(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Faturamento Máximo (R$)</label>
              <input type="number" value={maxRevenue} onChange={(e) => setMaxRevenue(Number(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Comissão (%)</label>
              <input type="number" value={commissionPercentage} onChange={(e) => setCommissionPercentage(Number(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl" />
            </div>
          </div>
        )}

        {type === 'Meta_Extra' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {role === 'Comercial' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Faturamento Alvo (R$)</label>
                <input type="number" value={targetRevenue} onChange={(e) => setTargetRevenue(Number(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custo Máximo (%)</label>
              <input type="number" value={maxCostPercentage} onChange={(e) => setMaxCostPercentage(Number(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bônus Fixo (R$)</label>
              <input type="number" value={bonusAmount} onChange={(e) => setBonusAmount(Number(e.target.value))} className="w-full p-3 border border-gray-200 rounded-xl" />
            </div>
          </div>
        )}

        <button 
          onClick={handleAddRule}
          className="bg-bordeaux text-white px-6 py-3 rounded-xl font-bold hover:bg-bordeaux/90 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Adicionar Regra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commissionRules.map(rule => (
          <div key={rule.id} className="bg-white p-5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${rule.role === 'Comercial' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                  {rule.role}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-gray-100 text-gray-600">
                  {rule.type === 'Comissao_Faturamento' ? 'Comissão' : 'Bônus Extra'}
                </span>
              </div>
              {rule.type === 'Comissao_Faturamento' ? (
                <p className="text-sm font-bold text-gray-800">
                  {rule.minRevenue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} a {rule.maxRevenue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} <br/>
                  <span className="text-bordeaux text-lg">{rule.commissionPercentage}%</span> sobre faturamento
                </p>
              ) : (
                <p className="text-sm font-bold text-gray-800">
                  {rule.role === 'Comercial' && `Faturamento >= ${rule.targetRevenue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} e `}
                  Custo &lt;= {rule.maxCostPercentage}% <br/>
                  <span className="text-emerald-600 text-lg">+{rule.bonusAmount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </p>
              )}
            </div>
            <button onClick={() => handleDeleteRule(rule.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {commissionRules.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400 text-sm">Nenhuma regra cadastrada.</div>
        )}
      </div>
    </div>
  );
};

export default SettingsModule;
