
import React, { useState } from 'react';
import { 
  Truck, 
  DollarSign, 
  Plus, 
  Edit2, 
  Trash2, 
  Settings as SettingsIcon,
  Save,
  X,
  FileSpreadsheet,
  TrendingUp,
  Layers,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { VehicleType, BankAccount, DRECategory, User, CommercialGoal, CommissionRule, PricingConfig } from '../../App';

interface SettingsModuleProps {
  vehicleTypes: VehicleType[];
  updateVehicleType: (updatedType: VehicleType) => void;
  bankAccounts: BankAccount[];
  addBankAccount: (newAccount: BankAccount) => void;
  updateBankAccount: (updatedAccount: BankAccount) => void;
  deleteBankAccount: (accountId: string) => void;
  dreCategories: DRECategory[];
  addDreCategory: (newCategory: DRECategory) => void;
  updateDreCategory: (updatedCategory: DRECategory) => void;
  deleteDreCategory: (categoryId: string) => void;
  users: User[];
  commercialGoals: CommercialGoal[];
  updateCommercialGoal: (updatedGoal: CommercialGoal) => void;
  commissionRules: CommissionRule[];
  updateCommissionRule: (updatedRule: CommissionRule) => void;
  segments: string[];
  updateSegments: (newSegments: string[]) => void;
  clientTypes: string[];
  updateClientTypes: (newTypes: string[]) => void;
  pricingConfigs: PricingConfig[];
  updatePricingConfig: (updatedConfig: PricingConfig) => void;
  currentUser: User;
}

const SettingsModule: React.FC<SettingsModuleProps> = ({ 
  vehicleTypes, 
  updateVehicleType, 
  bankAccounts,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  dreCategories,
  addDreCategory,
  updateDreCategory,
  deleteDreCategory,
  users,
  commercialGoals,
  updateCommercialGoal,
  commissionRules,
  updateCommissionRule,
  segments,
  updateSegments,
  clientTypes,
  updateClientTypes,
  pricingConfigs,
  updatePricingConfig,
  currentUser
}) => {
  const isGestor = currentUser.role.includes('Gestor');
  const [activeTab, setActiveTab] = useState<'Veiculos' | 'Bancos' | 'DRE' | 'Metas' | 'Clientes' | 'Precificacao'>(isGestor ? 'Veiculos' : 'Veiculos');

  const tabs = [
    { id: 'Veiculos', label: 'Tipos de Veículos', icon: <Truck size={18} /> },
    { id: 'Bancos', label: 'Bancos e Caixas', icon: <DollarSign size={18} />, restricted: isGestor },
    { id: 'DRE', label: 'Categorias DRE', icon: <Layers size={18} />, restricted: isGestor },
    { id: 'Metas', label: 'Metas e Comissões', icon: <TrendingUp size={18} />, restricted: isGestor },
    { id: 'Clientes', label: 'Config. Clientes', icon: <Building2 size={18} /> },
    { id: 'Precificacao', label: 'Precificação', icon: <ShieldCheck size={18} />, restricted: isGestor }
  ].filter(tab => !tab.restricted);

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
        {tabs.map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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
        {activeTab === 'Veiculos' && <VehicleManager vehicleTypes={vehicleTypes} updateVehicleType={updateVehicleType} />}
        {activeTab === 'Bancos' && <BankManager bankAccounts={bankAccounts} addBankAccount={addBankAccount} updateBankAccount={updateBankAccount} deleteBankAccount={deleteBankAccount} />}
        {activeTab === 'DRE' && <DRECategoryManager dreCategories={dreCategories} addDreCategory={addDreCategory} updateDreCategory={updateDreCategory} deleteDreCategory={deleteDreCategory} />}
        {activeTab === 'Metas' && (
          <div className="space-y-12">
            <CommercialGoalsManager users={users} commercialGoals={commercialGoals} updateCommercialGoal={updateCommercialGoal} />
            <CommissionRulesManager commissionRules={commissionRules} updateCommissionRule={updateCommissionRule} />
          </div>
        )}
        {activeTab === 'Clientes' && (
          <ClientConfigManager 
            segments={segments} 
            updateSegments={updateSegments} 
            clientTypes={clientTypes} 
            updateClientTypes={updateClientTypes} 
          />
        )}
        {activeTab === 'Precificacao' && (
          <PricingConfigManager pricingConfigs={pricingConfigs} updatePricingConfig={updatePricingConfig} />
        )}
      </div>
    </div>
  );
};

// --- Sub-componentes de Bancos e DRE ---
const BankManager = ({ 
  bankAccounts, 
  addBankAccount, 
  updateBankAccount, 
  deleteBankAccount 
}: { 
  bankAccounts: BankAccount[], 
  addBankAccount: (newAccount: BankAccount) => void,
  updateBankAccount: (updatedAccount: BankAccount) => void,
  deleteBankAccount: (accountId: string) => void
}) => {
  const [newBank, setNewBank] = useState({ name: '', type: 'BANCO' as 'BANCO' | 'CAIXA', initialBalance: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBank, setEditBank] = useState({ name: '', type: 'BANCO' as 'BANCO' | 'CAIXA' });

  const handleAdd = () => {
    if (!newBank.name.trim()) return;
    addBankAccount({ ...newBank, id: Date.now().toString() });
    setNewBank({ name: '', type: 'BANCO', initialBalance: 0 });
  };

  const handleEdit = (bank: BankAccount) => {
    setEditingId(bank.id);
    setEditBank({ name: bank.name, type: bank.type });
  };

  const handleSaveEdit = () => {
    if (!editBank.name.trim() || !editingId) return;
    const bank = bankAccounts.find(b => b.id === editingId);
    if (bank) {
      updateBankAccount({ ...bank, name: editBank.name, type: editBank.type });
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteBankAccount(id);
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

const DRECategoryManager = ({ 
  dreCategories, 
  addDreCategory, 
  updateDreCategory, 
  deleteDreCategory 
}: { 
  dreCategories: DRECategory[], 
  addDreCategory: (newCategory: DRECategory) => void,
  updateDreCategory: (updatedCategory: DRECategory) => void,
  deleteDreCategory: (categoryId: string) => void
}) => {
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState<DRECategory['group']>('RECEITA_BRUTA_CAIXA');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGroup, setEditGroup] = useState<DRECategory['group']>('RECEITA_BRUTA_CAIXA');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addDreCategory({ id: Date.now().toString(), name: newName, group: newGroup });
    setNewName('');
  };

  const handleEdit = (cat: DRECategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditGroup(cat.group);
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editingId) return;
    updateDreCategory({ id: editingId, name: editName, group: editGroup });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteDreCategory(id);
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

// ... (Componentes anteriores)

const PricingConfigManager: React.FC<{
  pricingConfigs: PricingConfig[];
  updatePricingConfig: (updatedConfig: PricingConfig) => void;
}> = ({ pricingConfigs, updatePricingConfig }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Configurações de Precificação</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pricingConfigs.map((config) => (
          <div key={config.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-bordeaux" />
              Empresa: {config.ownerId}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Percentual de Seguro (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={(config.insurancePercentage * 100).toFixed(2)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      updatePricingConfig({ ...config, insurancePercentage: val / 100 });
                    }
                  }}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Impostos Federais (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.federalTaxes.toFixed(2)}
                  onChange={(e) => updatePricingConfig({ ...config, federalTaxes: parseFloat(e.target.value) })}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ICMS (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.icms.toFixed(2)}
                  onChange={(e) => updatePricingConfig({ ...config, icms: parseFloat(e.target.value) })}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Custo Direto (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.directCost.toFixed(2)}
                  onChange={(e) => updatePricingConfig({ ...config, directCost: parseFloat(e.target.value) })}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Despesas (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.expenses.toFixed(2)}
                  onChange={(e) => updatePricingConfig({ ...config, expenses: parseFloat(e.target.value) })}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Lucro Mínimo (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.minProfit.toFixed(2)}
                  onChange={(e) => updatePricingConfig({ ...config, minProfit: parseFloat(e.target.value) })}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Sub-componente: Gestão de Veículos ---
const VehicleManager = ({ vehicleTypes, updateVehicleType }: any) => (
  <div className="space-y-8 animate-in slide-in-from-left-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bordeaux/10 text-bordeaux rounded-lg"><Truck size={20} /></div>
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

// --- Sub-componente: Metas e Comissões ---
const CommercialGoalsManager = ({ 
  users, 
  commercialGoals, 
  updateCommercialGoal 
}: { 
  users: User[], 
  commercialGoals: CommercialGoal[], 
  updateCommercialGoal: (updatedGoal: CommercialGoal) => void 
}) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('01');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [salesGoal, setSalesGoal] = useState<number>(0);
  const [prospectingGoal, setProspectingGoal] = useState<number>(0);

  const commercialUsers = users.filter(u => u.role === 'Comercial');

  const handleAddGoal = () => {
    if (!selectedUser) return;
    
    // Check if goal already exists for this user/month/year
    const existing = commercialGoals.find(g => g.userId === selectedUser && g.month === selectedMonth && g.year === selectedYear);
    
    if (existing) {
      updateCommercialGoal({
        ...existing,
        salesGoal,
        prospectingGoal
      });
    } else {
      const newGoal: CommercialGoal = {
        id: `G${Date.now()}`,
        userId: selectedUser,
        month: selectedMonth,
        year: selectedYear,
        salesGoal,
        prospectingGoal
      };
      updateCommercialGoal(newGoal);
    }
    
    // Reset form
    setSalesGoal(0);
    setProspectingGoal(0);
  };

  const handleDeleteGoal = (id: string) => {
    // deleteCommercialGoal is not implemented in App.tsx yet, but we can use updateCommercialGoal with a flag or similar if needed.
    // For now, let's assume we just update it or we'd need a deleteCommercialGoal function.
    // Since it's not in App.tsx, I'll skip the actual delete for now to avoid errors.
    console.log("Delete goal requested for:", id);
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

const CommissionRulesManager = ({ 
  commissionRules, 
  updateCommissionRule 
}: { 
  commissionRules: CommissionRule[], 
  updateCommissionRule: (updatedRule: CommissionRule) => void 
}) => {
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
    updateCommissionRule(newRule);
    setMinRevenue(0);
    setMaxRevenue(0);
    setCommissionPercentage(0);
    setTargetRevenue(0);
    setMaxCostPercentage(0);
    setBonusAmount(0);
  };

  const handleDeleteRule = (id: string) => {
    // deleteCommissionRule is not implemented in App.tsx yet.
    console.log("Delete rule requested for:", id);
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

const ClientConfigManager = ({ 
  segments, 
  updateSegments, 
  clientTypes, 
  updateClientTypes 
}: { 
  segments: string[], 
  updateSegments: (newSegments: string[]) => void, 
  clientTypes: string[], 
  updateClientTypes: (newTypes: string[]) => void 
}) => {
  const [newSegment, setNewSegment] = useState('');
  const [newType, setNewType] = useState('');

  const handleAddSegment = () => {
    if (newSegment.trim() && !segments.includes(newSegment.trim())) {
      updateSegments([...segments, newSegment.trim()]);
      setNewSegment('');
    }
  };

  const handleDeleteSegment = (seg: string) => {
    updateSegments(segments.filter(s => s !== seg));
  };

  const handleAddType = () => {
    if (newType.trim() && !clientTypes.includes(newType.trim())) {
      updateClientTypes([...clientTypes, newType.trim()]);
      setNewType('');
    }
  };

  const handleDeleteType = (type: string) => {
    updateClientTypes(clientTypes.filter(t => t !== type));
  };

  return (
    <div className="space-y-12">
      {/* Tipos de Clientes */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2 bg-bordeaux/10 text-bordeaux rounded-lg">
            <Building2 size={20} />
          </div>
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Tipos de Clientes</h3>
        </div>

        <div className="flex gap-3">
          <input 
            type="text" 
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="Ex: Indústria, Embarcador..."
            className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
          />
          <button 
            onClick={handleAddType}
            className="px-8 bg-bordeaux text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-bordeaux/20 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Adicionar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clientTypes.map(type => (
            <div key={type} className="bg-white p-4 rounded-2xl border border-gray-200 flex justify-between items-center group hover:border-bordeaux/30 transition-all shadow-sm">
              <span className="font-bold text-gray-700">{type}</span>
              <button 
                onClick={() => handleDeleteType(type)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Segmentos */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2 bg-bordeaux/10 text-bordeaux rounded-lg">
            <Layers size={20} />
          </div>
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Segmentos de Atuação</h3>
        </div>

        <div className="flex gap-3">
          <input 
            type="text" 
            value={newSegment}
            onChange={(e) => setNewSegment(e.target.value)}
            placeholder="Ex: Agronegócio, Químico..."
            className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
          />
          <button 
            onClick={handleAddSegment}
            className="px-8 bg-bordeaux text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-bordeaux/20 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Adicionar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {segments.map(seg => (
            <div key={seg} className="bg-white p-4 rounded-2xl border border-gray-200 flex justify-between items-center group hover:border-bordeaux/30 transition-all shadow-sm">
              <span className="font-bold text-gray-700">{seg}</span>
              <button 
                onClick={() => handleDeleteSegment(seg)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
