
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, ChevronRight, CheckCircle2, AlertCircle,
  MapPin, X, Users, Package, ShieldAlert, MapPinned, Layers, FileSearch,
  Paperclip, Trash2, Eye, FileUp, ArrowUpRight, DollarSign, AlertTriangle,
  Receipt, FileCheck, TrendingUp, MinusCircle, Truck, Calendar, Layout,
  Copy, ArrowRightLeft, Sparkles, History, Navigation, Trophy, UserCheck
} from 'lucide-react';
import { Load, Client, LoadStatus, Driver, useCompany } from '../../App';

interface CommercialModuleProps {
  loads: Load[];
  addLoad: (newLoad: Omit<Load, 'id' | 'date' | 'ownerId'>) => void;
  updateLoad: (updatedLoad: Load) => void;
  deleteLoad: (loadId: string) => void;
  clients: Client[];
  drivers: Driver[];
}

type MainTab = 'Minhas Cargas' | 'Kanban' | 'Radar de Leads';
type FormTab = 'Cliente' | 'Endereços' | 'Carga' | 'Financeiro';

interface ExtraExpense {
  id: string;
  description: string;
  value: number;
}

const CommercialModule: React.FC<CommercialModuleProps> = ({ loads, addLoad, updateLoad, deleteLoad, clients, drivers }) => {
  const { activeCompany, getCompanyBadge } = useCompany();
  const [activeTab, setActiveTab] = useState<MainTab>('Kanban');
  const [showForm, setShowForm] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<FormTab>('Cliente');
  const [draggedLoadId, setDraggedLoadId] = useState<string | null>(null);
  
  // Menu de ações
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Form States
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingLoadId, setEditingLoadId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    origin: { name: '', cnpj: '', street: '', number: '', neighborhood: '', city: '', state: '', zip: '', contact: '', phone: '' },
    destination: { name: '', cnpj: '', street: '', number: '', neighborhood: '', city: '', state: '', zip: '', contact: '', phone: '' },
    cargo: { type: 'Carga Geral', loadType: 'Dedicada' as 'Fracionada' | 'Dedicada', weight: '', volume: '', qty: '', value: '', insuranceType: 'RCTR-C', policy: '', insuredValue: '', insuranceCost: 0 },
    finance: { 
      freightBruto: 0, taxPercent: 5, driverFreight: 0, driverType: 'PF' as 'PF' | 'PJ',
      selectedDriverId: '', acceptsRetention: true, advance: 0, extraExpenses: [] as ExtraExpense[]
    },
    programming: { choice: 'Setor' as 'Comercial' | 'Setor' | 'Especifico', assignedProgrammer: '' }
  });

  const columns: { id: LoadStatus; label: string; color: string }[] = [
    { id: 'NEGOCIACAO', label: 'PROPOSTA / NEGOCIAÇÃO', color: 'border-amber-400' },
    { id: 'DOCUMENTACAO', label: 'AGUARDANDO DOCUMENTAÇÃO', color: 'border-blue-400' },
    { id: 'PRONTO_PROGRAMAR', label: 'PRONTO PARA PROGRAMAR', color: 'border-emerald-400' },
    { id: 'AGUARDANDO PROGRAMAÇÃO', label: 'EM PROGRAMAÇÃO', color: 'border-purple-400' },
    { id: 'EM TRÂNSITO', label: 'PROGRAMADA / EM TRÂNSITO', color: 'border-indigo-400' },
    { id: 'ENTREGUE', label: 'FINALIZADA / ENTREGUE', color: 'border-gray-400' },
  ];

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLoadId(id);
    e.dataTransfer.setData('loadId', id);
  };

  const onDrop = (e: React.DragEvent, newStatus: LoadStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('loadId');
    const loadToUpdate = loads.find(l => l.id === id);
    if (loadToUpdate && loadToUpdate.status !== newStatus) {
      updateLoad({ ...loadToUpdate, status: newStatus });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    const selectedDriver = drivers.find(d => d.id === formData.finance.selectedDriverId);
    let targetStatus: LoadStatus = 'AGUARDANDO PROGRAMAÇÃO';
    if (formData.programming.choice === 'Comercial') targetStatus = 'EM TRÂNSITO';

    const payload = {
      customer: selectedClient.name,
      value: formData.finance.freightBruto,
      cost: formData.finance.driverFreight + 500, // Custo simbólico
      origin: `${formData.origin.city}/${formData.origin.state}`,
      destination: `${formData.destination.city}/${formData.destination.state}`,
      vehicleTypeRequired: selectedDriver?.vehicleType || 'Truck',
      commercialRep: selectedClient.commercialRep,
      driverId: selectedDriver?.id,
      driver: selectedDriver?.name,
      plate: selectedDriver?.plate,
      loadType: formData.cargo.loadType,
      status: targetStatus
    };

    if (editingLoadId) {
      const existing = loads.find(l => l.id === editingLoadId);
      if (existing) updateLoad({ ...existing, ...payload });
    } else {
      addLoad(payload);
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-10" style={{ fontFamily: 'Book Antiqua, serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Comercial & Operacional</h2>
          <p className="text-gray-500 italic">Gestão multi-empresa: <span className="text-bordeaux font-black">{activeCompany}</span></p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-bordeaux text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-bordeaux/20 hover:scale-105 transition-all flex items-center gap-3 uppercase tracking-widest text-xs">
          <Plus size={20} /> Nova Carga
        </button>
      </div>

      <div className="flex border-b border-gray-200 bg-white rounded-t-3xl shadow-sm px-6">
        {(['Minhas Cargas', 'Kanban', 'Radar de Leads'] as MainTab[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-5 font-black text-xs uppercase tracking-widest transition-all border-b-4 ${activeTab === tab ? 'border-bordeaux text-bordeaux bg-bordeaux/5' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-[#F9F9F9] rounded-b-3xl shadow-sm border border-gray-100 min-h-[700px] overflow-hidden p-6">
        {activeTab === 'Kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4 h-full scrollbar-thin scrollbar-thumb-bordeaux/20">
            {columns.map(col => {
              const columnLoads = loads.filter(l => l.status === col.id);
              return (
                <div key={col.id} className="flex flex-col min-w-[300px] w-[300px] bg-gray-50 rounded-3xl border border-gray-200" onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, col.id)}>
                  <div className="bg-bordeaux text-white p-4 rounded-t-3xl flex justify-between items-center shadow-md">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">{col.label}</h4>
                    <span className="text-xs font-black">{columnLoads.length}</span>
                  </div>
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[600px]">
                    {columnLoads.map(load => (
                      <div key={load.id} draggable onDragStart={e => onDragStart(e, load.id)} className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 ${col.color} hover:shadow-xl transition-all cursor-grab active:cursor-grabbing`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-bordeaux opacity-50 uppercase">#{load.id} {getCompanyBadge(load.ownerId)}</span>
                          <button className="p-1 text-gray-300 hover:text-bordeaux"><MoreVertical size={16}/></button>
                        </div>
                        <h5 className="font-black text-gray-800 text-sm leading-tight mb-2">{load.customer}</h5>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold mb-3 italic">
                           <MapPin size={10} className="text-bordeaux"/> {load.origin.split('/')[0]} <ChevronRight size={8}/> {load.destination.split('/')[0]}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                           <p className="text-xs font-black text-gray-800">{load.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                           <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-bordeaux/5 text-bordeaux">{load.loadType || 'Dedicada'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[500px] text-gray-300 italic font-bold">Módulo em desenvolvimento...</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
             <div className="bg-bordeaux text-white p-6 flex justify-between items-center">
                <h3 className="text-2xl font-black uppercase">Formalização Comercial</h3>
                <button onClick={() => setShowForm(false)} className="p-2"><X size={24}/></button>
             </div>
             <div className="p-10 overflow-y-auto space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selecionar Cliente CRM</label>
                  <select className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl font-black" onChange={e => setSelectedClient(clients.find(c => c.id === e.target.value) || null)}>
                    <option value="">Buscar no CRM...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} {getCompanyBadge(c.ownerId) ? `(${c.ownerId})` : ''}</option>)}
                  </select>
                </div>
                {/* Outros campos simplificados para este exemplo */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase italic">Frete Bruto (R$)</label>
                    <input type="number" className="w-full px-5 py-3.5 border rounded-2xl font-black" value={formData.finance.freightBruto} onChange={e => setFormData({...formData, finance: {...formData.finance, freightBruto: Number(e.target.value)}})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase italic">Lotação</label>
                    <select className="w-full px-5 py-3.5 border rounded-2xl font-black" value={formData.cargo.loadType} onChange={e => setFormData({...formData, cargo: {...formData.cargo, loadType: e.target.value as any}})}>
                      <option value="Dedicada">Dedicada</option>
                      <option value="Fracionada">Fracionada</option>
                    </select>
                  </div>
                </div>
             </div>
             <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
                <button onClick={() => setShowForm(false)} className="px-8 py-3.5 font-black text-gray-400 uppercase text-xs">Cancelar</button>
                <button onClick={handleSubmit} className="px-12 py-3.5 bg-bordeaux text-white font-black rounded-2xl shadow-xl uppercase text-xs">Efetivar Carga</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommercialModule;
