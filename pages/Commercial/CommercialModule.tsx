
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  X,
  Users,
  Package,
  ShieldAlert,
  MapPinned,
  Layers,
  FileSearch,
  Paperclip,
  Trash2,
  Eye,
  FileUp,
  ArrowUpRight,
  DollarSign,
  AlertTriangle,
  Receipt,
  FileCheck,
  TrendingUp,
  MinusCircle,
  Truck,
  Calendar,
  Layout
} from 'lucide-react';
import { Load, Client, LoadStatus } from '../../App';

interface CommercialModuleProps {
  loads: Load[];
  addLoad: (newLoad: Omit<Load, 'id' | 'date' | 'status'>) => void;
  updateLoad: (updatedLoad: Load) => void;
  clients: Client[];
}

type MainTab = 'Minhas Cargas' | 'Kanban' | 'Radar de Leads';
type FormTab = 'Cliente' | 'Endereços' | 'Carga' | 'Financeiro';

interface ExtraExpense {
  id: string;
  description: string;
  value: number;
}

const CommercialModule: React.FC<CommercialModuleProps> = ({ loads, addLoad, updateLoad, clients }) => {
  const [activeTab, setActiveTab] = useState<MainTab>('Kanban');
  const [showForm, setShowForm] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<FormTab>('Cliente');
  const [draggedLoadId, setDraggedLoadId] = useState<string | null>(null);
  
  // Form States
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const [formData, setFormData] = useState({
    origin: { name: '', cnpj: '', street: '', number: '', neighborhood: '', city: '', state: '', zip: '', contact: '', phone: '' },
    destination: { name: '', cnpj: '', street: '', number: '', neighborhood: '', city: '', state: '', zip: '', contact: '', phone: '' },
    cargo: { type: 'Carga Geral', weight: '', volume: '', qty: '', value: '', insuranceType: 'RCTR-C', policy: '', insuredValue: '' },
    finance: { 
      freightBruto: 0, 
      taxPercent: 5, 
      driverFreight: 0,
      driverType: 'PF' as 'PF' | 'PJ',
      acceptsRetention: true,
      advance: 0,
      extraExpenses: [] as ExtraExpense[],
      checklist: {
        cte: false,
        ciot: false,
        gnre: false,
        contract: false,
        nfAttached: false
      }
    }
  });

  // Kanban Columns Mapping
  const columns: { id: LoadStatus; label: string; color: string }[] = [
    { id: 'NEGOCIACAO', label: 'PROPOSTA / NEGOCIAÇÃO', color: 'border-amber-400' },
    { id: 'DOCUMENTACAO', label: 'AGUARDANDO DOCUMENTAÇÃO', color: 'border-blue-400' },
    { id: 'PRONTO_PROGRAMAR', label: 'PRONTO PARA PROGRAMAR', color: 'border-emerald-400' },
    { id: 'AGUARDANDO PROGRAMAÇÃO', label: 'EM PROGRAMAÇÃO', color: 'border-purple-400' },
    { id: 'EM TRÂNSITO', label: 'PROGRAMADA / EM TRÂNSITO', color: 'border-indigo-400' },
    { id: 'ENTREGUE', label: 'FINALIZADA / ENTREGUE', color: 'border-gray-400' },
  ];

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLoadId(id);
    e.dataTransfer.setData('loadId', id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, newStatus: LoadStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('loadId');
    const loadToUpdate = loads.find(l => l.id === id);
    if (loadToUpdate && loadToUpdate.status !== newStatus) {
      updateLoad({ ...loadToUpdate, status: newStatus });
    }
    setDraggedLoadId(null);
  };

  // Cálculos Financeiros Dinâmicos
  const liquidoReceita = formData.finance.freightBruto * (1 - formData.finance.taxPercent / 100);
  const retencaoValor = formData.finance.driverType === 'PF' && formData.finance.acceptsRetention 
    ? formData.finance.driverFreight * 0.1165 
    : 0;
  const liquidoMotorista = formData.finance.driverFreight - retencaoValor;
  const custoRealPF = formData.finance.driverType === 'PF' && !formData.finance.acceptsRetention
    ? formData.finance.driverFreight * 1.1165
    : formData.finance.driverFreight;
  
  const totalExtra = formData.finance.extraExpenses.reduce((acc, curr) => acc + curr.value, 0);
  const custoTotal = (formData.finance.driverType === 'PF' && !formData.finance.acceptsRetention ? custoRealPF : formData.finance.driverFreight) + totalExtra;
  
  const margemValor = liquidoReceita - custoTotal;
  const margemPercent = formData.finance.freightBruto > 0 ? (margemValor / formData.finance.freightBruto) * 100 : 0;
  const saldoMotorista = liquidoMotorista - formData.finance.advance;

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId) || null;
    setSelectedClient(client);
  };

  const addExtraExpense = () => {
    const newExpense: ExtraExpense = { id: Math.random().toString(36).substr(2, 5), description: '', value: 0 };
    setFormData({
      ...formData,
      finance: { ...formData.finance, extraExpenses: [...formData.finance.extraExpenses, newExpense] }
    });
  };

  const removeExtraExpense = (id: string) => {
    setFormData({
      ...formData,
      finance: { ...formData.finance, extraExpenses: formData.finance.extraExpenses.filter(e => e.id !== id) }
    });
  };

  const updateExtraExpense = (id: string, field: keyof ExtraExpense, value: any) => {
    setFormData({
      ...formData,
      finance: {
        ...formData.finance,
        extraExpenses: formData.finance.extraExpenses.map(e => e.id === id ? { ...e, [field]: value } : e)
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    addLoad({
      customer: selectedClient.name,
      value: formData.finance.freightBruto,
      cost: custoTotal,
      origin: `${formData.origin.city}/${formData.origin.state}`,
      destination: `${formData.destination.city}/${formData.destination.state}`,
      vehicleTypeRequired: 'Carreta LS (Lonada)',
      commercialRep: selectedClient.commercialRep
    });
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedClient(null);
    setActiveFormTab('Cliente');
    setFormData({
      origin: { name: '', cnpj: '', street: '', number: '', neighborhood: '', city: '', state: '', zip: '', contact: '', phone: '' },
      destination: { name: '', cnpj: '', street: '', number: '', neighborhood: '', city: '', state: '', zip: '', contact: '', phone: '' },
      cargo: { type: 'Carga Geral', weight: '', volume: '', qty: '', value: '', insuranceType: 'RCTR-C', policy: '', insuredValue: '' },
      finance: { 
        freightBruto: 0, taxPercent: 5, driverFreight: 0, driverType: 'PF', acceptsRetention: true, advance: 0, extraExpenses: [],
        checklist: { cte: false, ciot: false, gnre: false, contract: false, nfAttached: false }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-10" style={{ fontFamily: 'Book Antiqua, serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Comercial & Operacional</h2>
          <p className="text-gray-500 italic">Gestão de propostas, formalização e inteligência de margem.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-bordeaux text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-bordeaux/20 hover:scale-105 transition-all flex items-center gap-3 uppercase tracking-widest text-xs"
        >
          <Plus size={20} /> Nova Carga
        </button>
      </div>

      <div className="flex border-b border-gray-200 bg-white rounded-t-3xl shadow-sm px-6 overflow-x-auto shrink-0">
        {(['Minhas Cargas', 'Kanban', 'Radar de Leads'] as MainTab[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-5 font-black text-xs uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${activeTab === tab ? 'border-bordeaux text-bordeaux bg-bordeaux/5' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {tab === 'Kanban' && <Layout size={16} className="inline mr-2" />}
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-[#F9F9F9] rounded-b-3xl shadow-sm border border-gray-100 min-h-[700px] overflow-hidden">
        {activeTab === 'Kanban' ? (
          <div className="flex gap-4 p-6 overflow-x-auto h-full min-h-[650px] scrollbar-thin scrollbar-thumb-bordeaux/20">
            {columns.map(col => {
              const columnLoads = loads.filter(l => l.status === col.id);
              const totalValue = columnLoads.reduce((acc, curr) => acc + curr.value, 0);
              
              return (
                <div 
                  key={col.id} 
                  className="flex flex-col min-w-[300px] w-[300px] bg-gray-50 rounded-3xl border border-gray-200 shadow-sm"
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, col.id)}
                >
                  <div className="bg-bordeaux text-white p-4 rounded-t-3xl flex flex-col gap-1 shadow-md shrink-0">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">{col.label}</h4>
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black">{columnLoads.length} Cargas</span>
                      <span className="text-sm font-black">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[580px]">
                    {columnLoads.map(load => {
                      const margin = load.value > 0 ? ((load.value - load.cost) / load.value) * 100 : 0;
                      return (
                        <div 
                          key={load.id} 
                          draggable 
                          onDragStart={(e) => onDragStart(e, load.id)}
                          className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 ${col.color} hover:shadow-xl hover:scale-[1.02] transition-all cursor-grab active:cursor-grabbing group`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-bordeaux uppercase tracking-widest opacity-50">#{load.id}</span>
                            <button className="text-gray-300 group-hover:text-gray-600 transition-colors"><MoreVertical size={14}/></button>
                          </div>
                          
                          <h5 className="font-black text-gray-800 text-sm mb-1 leading-tight">{load.customer}</h5>
                          
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold mb-3 italic">
                             <MapPin size={10} className="text-bordeaux"/> {load.origin.split('/')[0]} <ChevronRight size={8}/> {load.destination.split('/')[0]}
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                             <div className="flex flex-col">
                               <p className="text-[9px] font-black text-gray-400 uppercase">Frete</p>
                               <p className="text-xs font-black text-gray-800">{load.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                             </div>
                             <div className="text-right">
                               <p className="text-[9px] font-black text-gray-400 uppercase">Margem</p>
                               <p className={`text-xs font-black ${margin > 15 ? 'text-bordeaux' : margin < 10 ? 'text-orange-500' : 'text-emerald-600'}`}>
                                 {margin.toFixed(1)}%
                               </p>
                             </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-3">
                             <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase">
                               <Calendar size={10}/> {new Date(load.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                             </div>
                             <div className="w-6 h-6 rounded-full bg-bordeaux/10 flex items-center justify-center text-[9px] font-black text-bordeaux border border-bordeaux/20" title={load.commercialRep}>
                                {load.commercialRep?.charAt(0)}
                             </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeTab === 'Minhas Cargas' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-widest text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-6">Emissão</th>
                  <th className="px-8 py-6">Cliente / ID</th>
                  <th className="px-8 py-6">Trajeto</th>
                  <th className="px-8 py-6 text-right">Valor Bruto</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loads.map((load) => (
                  <tr key={load.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6 text-xs font-bold text-gray-400 italic">{new Date(load.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-800 text-sm">{load.customer}</span>
                        <span className="text-[10px] text-bordeaux font-black uppercase tracking-widest opacity-60">#{load.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3 text-sm font-black text-gray-600">
                        <MapPin size={16} className="text-bordeaux" />
                        <span>{load.origin}</span>
                        <ChevronRight size={14} className="text-gray-300" />
                        <span>{load.destination}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-bordeaux">{load.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${load.status === 'ENTREGUE' ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{load.status}</span></td>
                    <td className="px-8 py-6 text-right"><button className="p-2 text-gray-400 hover:text-bordeaux hover:bg-bordeaux/5 rounded-xl transition-all"><MoreVertical size={20} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-gray-300 italic">
             <Package size={64} className="mb-4 opacity-20" />
             <p className="font-black uppercase tracking-widest text-xs">Módulo {activeTab} em processamento</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl h-full max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="bg-bordeaux text-white p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-inner"><Package size={28} /></div>
                <div><h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">Formalização de Carga</h3><p className="text-white/60 font-medium italic text-xs">Dossiê Financeiro & Fiscal Completo</p></div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={28} /></button>
            </div>

            <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0">
              {(['Cliente', 'Endereços', 'Carga', 'Financeiro'] as FormTab[]).map(tab => (
                <button key={tab} onClick={() => setActiveFormTab(tab)} className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-2 ${activeFormTab === tab ? 'border-bordeaux text-bordeaux bg-white shadow-sm' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{tab}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-white">
              {activeFormTab === 'Cliente' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-left-4">
                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Selecionar Cliente CRM</label>
                    <select className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl font-black text-gray-800 outline-none appearance-none" onChange={(e) => handleClientSelect(e.target.value)} value={selectedClient?.id || ''}>
                      <option value="">Buscar no CRM...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {selectedClient && (
                      <div className="p-8 bg-bordeaux/5 rounded-[32px] border border-bordeaux/10 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-bordeaux font-black text-xl shadow-sm">{selectedClient.name.charAt(0)}</div>
                          <div><p className="text-lg font-black text-gray-800">{selectedClient.name}</p><p className="text-[10px] text-bordeaux font-bold uppercase tracking-widest">{selectedClient.segment}</p></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2 italic"><ShieldAlert size={14}/> Dados Tributários (Leitura)</h4>
                    <ReadOnlyField label="CNPJ" value={selectedClient?.cnpj} />
                    <ReadOnlyField label="Inscrição Estadual" value={selectedClient?.stateRegistration} />
                    <ReadOnlyField label="Regime" value={selectedClient?.taxRegime} />
                  </div>
                </div>
              )}

              {activeFormTab === 'Endereços' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-left-4">
                  <AddressForm title="Unidade Remetente" data={formData.origin} update={(val: any) => setFormData({...formData, origin: val})} />
                  <AddressForm title="Unidade Destinatária" data={formData.destination} update={(val: any) => setFormData({...formData, destination: val})} />
                </div>
              )}

              {activeFormTab === 'Carga' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-left-4">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase border-b pb-2">Especificações</h4>
                    <Input label="Valor NF (R$)" type="number" value={formData.cargo.value} onChange={(e: any) => setFormData({...formData, cargo: {...formData.cargo, value: e.target.value}})} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Peso (KG)" type="number" value={formData.cargo.weight} onChange={(e: any) => setFormData({...formData, cargo: {...formData.cargo, weight: e.target.value}})} />
                      <Input label="Volumes" type="number" value={formData.cargo.qty} onChange={(e: any) => setFormData({...formData, cargo: {...formData.cargo, qty: e.target.value}})} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase border-b pb-2">Seguro</h4>
                    <ReadOnlyField label="Tipo Apólice" value={formData.cargo.insuranceType} />
                    <Input label="Número Apólice" value={formData.cargo.policy} onChange={(e: any) => setFormData({...formData, cargo: {...formData.cargo, policy: e.target.value}})} />
                  </div>
                </div>
              )}

              {activeFormTab === 'Financeiro' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-left-4 pb-20">
                  <div className="space-y-6">
                    <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 space-y-5">
                      <h4 className="text-[11px] font-black text-bordeaux uppercase tracking-widest flex items-center gap-2 mb-2"><ArrowUpRight size={16} /> Receita do Cliente</h4>
                      <div className="space-y-4">
                        <Input label="Frete Bruto (R$)" type="number" value={formData.finance.freightBruto} onChange={(e: any) => setFormData({...formData, finance: {...formData.finance, freightBruto: Number(e.target.value)}})} />
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Impostos (%)" type="number" value={formData.finance.taxPercent} onChange={(e: any) => setFormData({...formData, finance: {...formData.finance, taxPercent: Number(e.target.value)}})} />
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase pl-1">Frete Líquido (R$)</label>
                            <div className="px-4 py-3 bg-white border border-gray-200 rounded-xl font-black text-gray-400 text-sm">{liquidoReceita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 space-y-5">
                      <h4 className="text-[11px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-2"><DollarSign size={16} /> Programação Motorista</h4>
                      <div className="space-y-4">
                        <Input label="Adiantamento (R$)" type="number" value={formData.finance.advance} onChange={(e: any) => setFormData({...formData, finance: {...formData.finance, advance: Number(e.target.value)}})} />
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase pl-1">Saldo Final (R$)</label>
                          <div className="px-4 py-3 bg-white border border-gray-200 rounded-xl font-black text-bordeaux text-lg">{saldoMotorista.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 space-y-5">
                      <h4 className="text-[11px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-2"><Truck size={16} /> Custo do Motorista</h4>
                      <div className="space-y-4">
                        <Input label="Frete Motorista (R$)" type="number" value={formData.finance.driverFreight} onChange={(e: any) => setFormData({...formData, finance: {...formData.finance, driverFreight: Number(e.target.value)}})} />
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase pl-1">Tipo de Motorista</label>
                          <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-black text-gray-700 outline-none" value={formData.finance.driverType} onChange={(e: any) => setFormData({...formData, finance: {...formData.finance, driverType: e.target.value}})}>
                            <option value="PF">Pessoa Física (PF)</option>
                            <option value="PJ">Pessoa Jurídica (PJ)</option>
                          </select>
                        </div>
                        {formData.finance.driverType === 'PF' && (
                          <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 accent-bordeaux" checked={formData.finance.acceptsRetention} onChange={(e) => setFormData({...formData, finance: {...formData.finance, acceptsRetention: e.target.checked}})}/>
                            <span className="text-[11px] font-black text-gray-600 uppercase">Aceita Retenção (11,65%)</span>
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-[11px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2"><Receipt size={16} /> Despesas Extras</h4>
                        <button onClick={addExtraExpense} className="p-1.5 text-bordeaux hover:bg-white rounded-lg transition-all"><Plus size={18}/></button>
                      </div>
                      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                        {formData.finance.extraExpenses.map(expense => (
                          <div key={expense.id} className="flex gap-2 items-center">
                            <input placeholder="Descrição" value={expense.description} onChange={(e) => updateExtraExpense(expense.id, 'description', e.target.value)} className="flex-[2] px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none" />
                            <input type="number" placeholder="R$" value={expense.value || ''} onChange={(e) => updateExtraExpense(expense.id, 'value', Number(e.target.value))} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-right outline-none" />
                            <button onClick={() => removeExtraExpense(expense.id)} className="p-1.5 text-red-300 hover:text-red-500"><MinusCircle size={16}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className={`p-8 rounded-[3rem] border-4 transition-all shadow-2xl ${margemValor >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                      <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 mb-6">{margemValor >= 0 ? <TrendingUp size={20} className="text-emerald-600"/> : <AlertTriangle size={20} className="text-red-600"/>} Resultado Líquido</h4>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Margem Bruta (R$)</p>
                          <h5 className={`text-4xl font-black ${margemValor >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{margemValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h5>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 space-y-4">
                      <h4 className="text-[11px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-2"><FileCheck size={16} /> Checklist Fiscal</h4>
                      <div className="space-y-2">
                        <CheckItem label="Emissão CT-e" checked={formData.finance.checklist.cte} onChange={(val) => setFormData({...formData, finance: {...formData.finance, checklist: {...formData.finance.checklist, cte: val}}})} />
                        <CheckItem label="CIOT Representa" checked={formData.finance.checklist.ciot} onChange={(val) => setFormData({...formData, finance: {...formData.finance, checklist: {...formData.finance.checklist, ciot: val}}})} />
                        <CheckItem label="NF Produto Anexada" checked={formData.finance.checklist.nfAttached} onChange={(val) => setFormData({...formData, finance: {...formData.finance, checklist: {...formData.finance.checklist, nfAttached: val}}})} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shrink-0">
               <button onClick={() => setShowForm(false)} className="px-8 py-4 border-2 border-gray-200 text-gray-400 font-black rounded-2xl hover:bg-white transition-all uppercase text-xs tracking-widest">Desistir</button>
               <button onClick={handleSubmit} disabled={!selectedClient || margemValor < 0} className="px-12 py-4 bg-bordeaux text-white font-black rounded-2xl shadow-2xl shadow-bordeaux/30 hover:scale-[1.03] transition-all uppercase text-xs tracking-widest disabled:opacity-30">Formalizar Carga</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componentes Utilitários
const CheckItem = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <label className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-all">
    <input type="checkbox" className="w-4 h-4 accent-bordeaux" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
  </label>
);

const ReadOnlyField = ({ label, value }: { label: string, value?: string }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-gray-400 uppercase pl-1">{label}</p>
    <div className="w-full px-5 py-3 bg-gray-100/50 border border-gray-200 rounded-xl font-bold text-gray-500 text-sm italic">{value || 'N/A'}</div>
  </div>
);

const Input = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-gray-500 uppercase block pl-2 italic tracking-widest">{label}</label>
    <input type={type} value={value} onChange={onChange} className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl font-black text-gray-800 focus:ring-4 focus:ring-bordeaux/5 outline-none transition-all shadow-sm" />
  </div>
);

const AddressForm = ({ title, data, update }: any) => (
  <div className="space-y-6">
    <h4 className="text-[11px] font-black text-bordeaux uppercase border-b pb-2">{title}</h4>
    <Input label="Empresa" value={data.name} onChange={(e: any) => update({...data, name: e.target.value})} />
    <div className="grid grid-cols-2 gap-4">
      <Input label="CNPJ" value={data.cnpj} onChange={(e: any) => update({...data, cnpj: e.target.value})} />
      <Input label="CEP" value={data.zip} onChange={(e: any) => update({...data, zip: e.target.value})} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input label="Cidade" value={data.city} onChange={(e: any) => update({...data, city: e.target.value})} />
      <Input label="UF" value={data.state} onChange={(e: any) => update({...data, state: e.target.value.toUpperCase()})} />
    </div>
  </div>
);

export default CommercialModule;
