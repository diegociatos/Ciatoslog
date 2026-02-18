
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Search, Filter, Contact2, Star, Truck, CheckCircle2, AlertTriangle, 
  X, MoreVertical, MapPin, History, CreditCard, Building2, FileText, 
  Phone, Mail, ShieldCheck, Calendar, Wallet, Users, Edit2, Lock, 
  Unlock, Trash2, ChevronRight, Globe, TrendingUp, Sparkles, MapPinned
} from 'lucide-react';
import { Driver, VehicleType, RouteEntry } from '../../App';

interface DriversModuleProps {
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  vehicleTypes: VehicleType[];
}

const DriversModule: React.FC<DriversModuleProps> = ({ drivers, setDrivers, vehicleTypes }) => {
  const [showModal, setShowModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Partial<Driver>>({
    type: 'PF', status: 'Disponível', rating: 5.0, completedTrips: 0, historyRoutes: []
  });

  // Novos campos para cadastro manual de rota
  const [manualRoute, setManualRoute] = useState<Partial<RouteEntry>>({
    origin: '', destination: '', frequency: 'Ocasionalmente'
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusBadge = (status: Driver['status']) => {
    switch (status) {
      case 'Disponível': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Em Viagem': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Bloqueado': return 'bg-red-50 text-red-600 border-red-100';
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.cnpj_cpf.includes(searchTerm) || 
    d.plate.includes(searchTerm.toUpperCase())
  );

  const handleSave = () => {
    if (selectedDriverId) {
      setDrivers(drivers.map(d => d.id === selectedDriverId ? { ...d, ...formData as Driver } : d));
    } else {
      const newDriver: Driver = {
        ...formData as Driver,
        id: `D${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      };
      setDrivers([...drivers, newDriver]);
    }
    setShowModal(false);
    resetForm();
  };

  const handleOpenRouteManager = (driver: Driver) => {
    setSelectedDriverId(driver.id);
    setFormData(driver);
    setManualRoute({ origin: '', destination: '', frequency: 'Ocasionalmente' });
    setShowRouteModal(true);
    setOpenMenuId(null);
  };

  const handleAddManualRoute = () => {
    if (!manualRoute.origin || !manualRoute.destination || !selectedDriverId) return;
    
    setDrivers(prev => prev.map(d => {
      if (d.id === selectedDriverId) {
        return {
          ...d,
          historyRoutes: [
            ...d.historyRoutes,
            { ...manualRoute as RouteEntry, type: 'Manual' }
          ]
        };
      }
      return d;
    }));
    setManualRoute({ ...manualRoute, origin: '', destination: '' });
  };

  const handleRemoveRoute = (route: RouteEntry) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === selectedDriverId) {
        return {
          ...d,
          historyRoutes: d.historyRoutes.filter(r => r !== route)
        };
      }
      return d;
    }));
  };

  const resetForm = () => {
    setFormData({ type: 'PF', status: 'Disponível', rating: 5.0, completedTrips: 0, historyRoutes: [] });
    setSelectedDriverId(null);
  };

  // Helper para contar rotas frequentes
  const getRouteSummary = (routes: RouteEntry[]) => {
    const counts: Record<string, number> = {};
    routes.forEach(r => {
      const key = `${r.origin.split('/')[0]}→${r.destination.split('/')[0]}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, val]) => `${key} (${val}x)`)
      .join(', ');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Base de Motoristas</h2>
          <p className="text-gray-500 italic">Inteligência de frota e histórico de performance operacional.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-bordeaux text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-bordeaux/20 hover:scale-105 transition-all text-xs uppercase tracking-widest"
        >
          <Plus size={20} className="inline mr-2" /> Novo Parceiro
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar motorista, placa ou documento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bordeaux/5 font-bold text-gray-700 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 border border-gray-200 rounded-2xl text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-sm">
            <Filter size={18} /> Filtros de Qualificação
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">Parceiro / Rotas Frequentes</th>
                <th className="px-8 py-5">Veículo / Placa</th>
                <th className="px-8 py-5">Experiência</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDrivers.map(driver => (
                <tr key={driver.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-bordeaux/10 flex items-center justify-center text-bordeaux font-black text-lg shadow-sm border border-bordeaux/5">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-800 text-base leading-none mb-1">{driver.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{driver.cnpj_cpf}</span>
                          {driver.historyRoutes.length > 0 && (
                            <span className="text-[10px] font-bold text-bordeaux bg-bordeaux/5 px-2 py-0.5 rounded flex items-center gap-1 italic">
                              <Sparkles size={10}/> {getRouteSummary(driver.historyRoutes)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-700">{driver.vehicleType}</span>
                      <span className="inline-flex mt-1 px-3 py-0.5 bg-white text-[11px] font-black uppercase text-bordeaux rounded-lg border border-bordeaux/20 shadow-sm w-fit tracking-widest">
                        {driver.plate}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                       <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                         <Star size={14} className="fill-current"/> {driver.rating.toFixed(1)}
                       </div>
                       <span className="text-[10px] font-black text-gray-400 uppercase">{driver.completedTrips} Viagens Realizadas</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${getStatusBadge(driver.status)}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <button onClick={() => setOpenMenuId(openMenuId === driver.id ? null : driver.id)} className="p-2.5 text-gray-400 hover:text-bordeaux hover:bg-bordeaux/5 rounded-xl transition-all"><MoreVertical size={20} /></button>
                    {openMenuId === driver.id && (
                      <div ref={menuRef} className="absolute right-10 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in zoom-in-95">
                        <button onClick={() => { setSelectedDriverId(driver.id); setFormData(driver); setShowModal(true); setOpenMenuId(null); }} className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors group">
                          <Edit2 size={16} className="text-gray-400 group-hover:text-bordeaux" /><span className="text-xs font-black uppercase text-gray-600 tracking-widest">Editar Cadastro</span>
                        </button>
                        <button onClick={() => handleOpenRouteManager(driver)} className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors group">
                          <MapPinned size={16} className="text-gray-400 group-hover:text-bordeaux" /><span className="text-xs font-black uppercase text-gray-600 tracking-widest">Gerenciar Rotas</span>
                        </button>
                        <button onClick={() => { setDrivers(drivers.map(d => d.id === driver.id ? {...d, status: d.status === 'Bloqueado' ? 'Disponível' : 'Bloqueado'} : d)); setOpenMenuId(null); }} className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors group">
                          {driver.status === 'Bloqueado' ? <><Unlock size={16} className="text-emerald-500" /><span className="text-xs font-black uppercase text-emerald-600 tracking-widest">Desbloquear</span></> : <><Lock size={16} className="text-red-500" /><span className="text-xs font-black uppercase text-red-600 tracking-widest">Bloquear Operador</span></>}
                        </button>
                        <div className="h-[1px] bg-gray-100 w-full"></div>
                        <button onClick={() => { if(window.confirm('Excluir parceiro?')) setDrivers(drivers.filter(d => d.id !== driver.id)); setOpenMenuId(null); }} className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-red-50 transition-colors group">
                          <Trash2 size={16} className="text-red-400" /><span className="text-xs font-black uppercase text-red-600 tracking-widest">Excluir Parceiro</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Rotas Habilitadas - Prompt 5.3 Implementação */}
      {showRouteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-bordeaux text-white p-10 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/10 rounded-3xl border border-white/20"><Globe size={32} /></div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Inteligência de Rotas</h3>
                  <p className="text-white/60 text-xs italic">Parceiro: {drivers.find(d => d.id === selectedDriverId)?.name}</p>
                </div>
              </div>
              <button onClick={() => setShowRouteModal(false)} className="p-2 hover:bg-white/10 rounded-xl"><X size={32} /></button>
            </div>

            <div className="p-10 space-y-10">
              {/* Cadastro Manual */}
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">Habilitar Nova Rota Manualmente</h4>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-500 uppercase pl-2 italic">Origem (Cidade/UF)</label>
                     <input value={manualRoute.origin} onChange={e => setManualRoute({...manualRoute, origin: e.target.value})} placeholder="São Paulo/SP" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl font-black text-gray-800 focus:ring-4 focus:ring-bordeaux/5 outline-none transition-all shadow-sm"/>
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-500 uppercase pl-2 italic">Destino (Cidade/UF)</label>
                     <input value={manualRoute.destination} onChange={e => setManualRoute({...manualRoute, destination: e.target.value})} placeholder="Cuiabá/MT" className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl font-black text-gray-800 focus:ring-4 focus:ring-bordeaux/5 outline-none transition-all shadow-sm"/>
                   </div>
                </div>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase pl-2 italic">Frequência da Operação</label>
                    <select value={manualRoute.frequency} onChange={e => setManualRoute({...manualRoute, frequency: e.target.value as any})} className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl font-black text-gray-800 outline-none appearance-none cursor-pointer shadow-sm">
                      <option value="Sempre">Habilitado: Sempre (Prioritário)</option>
                      <option value="Ocasionalmente">Habilitado: Ocasionalmente</option>
                    </select>
                  </div>
                  <button onClick={handleAddManualRoute} className="bg-bordeaux text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-bordeaux/20 hover:scale-105 transition-all flex items-center gap-2">
                    <Plus size={20}/> Adicionar
                  </button>
                </div>
              </div>

              {/* Lista Consolidada */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <History size={14}/> Histórico Consolidado (IA + Manual)
                </h4>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                   {drivers.find(d => d.id === selectedDriverId)?.historyRoutes.map((route, idx) => (
                     <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md group ${route.type === 'Automático' ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${route.type === 'Automático' ? 'bg-indigo-200 text-indigo-700 shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                            {route.type === 'Automático' ? <TrendingUp size={18}/> : <Contact2 size={18}/>}
                          </div>
                          <div>
                            <p className="font-black text-gray-800 text-sm leading-none mb-1">{route.origin} → {route.destination}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">
                              {route.type === 'Automático' ? `Automático: Carga #${route.loadId}` : `Manual: Frequência ${route.frequency}`}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveRoute(route)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                           <Trash2 size={16}/>
                        </button>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
               <button onClick={() => setShowRouteModal(false)} className="px-10 py-4 bg-bordeaux text-white rounded-2xl font-black shadow-xl shadow-bordeaux/20 hover:scale-105 transition-all uppercase text-xs tracking-widest">Concluir Gerenciamento</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Motorista (Padrão) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
             <div className="bg-bordeaux text-white p-10 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-white/10 rounded-3xl border border-white/20"><Contact2 size={32} /></div>
                   <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">{selectedDriverId ? 'Editar Credenciamento' : 'Novo Credenciamento'}</h3>
                     <p className="text-white/60 font-medium italic text-sm">Governança institucional sobre parceiros terceiros.</p>
                   </div>
                </div>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-white/10 rounded-xl"><X size={32} /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-12 bg-gray-50/30 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 italic">Identificação Básica</h4>
                      <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                            <button onClick={() => setFormData({...formData, type: 'PF'})} className={`py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === 'PF' ? 'bg-white text-bordeaux shadow-sm' : 'text-gray-400'}`}>Pessoa Física</button>
                            <button onClick={() => setFormData({...formData, type: 'PJ'})} className={`py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === 'PJ' ? 'bg-white text-bordeaux shadow-sm' : 'text-gray-400'}`}>Pessoa Jurídica</button>
                         </div>
                         <Input label="Nome Completo / Razão" value={formData.name || ''} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
                         <Input label="CPF / CNPJ" value={formData.cnpj_cpf || ''} onChange={(e:any) => setFormData({...formData, cnpj_cpf: e.target.value})} />
                         <Input label="Celular / WhatsApp" value={formData.phone || ''} onChange={(e:any) => setFormData({...formData, phone: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 italic">Frota & Financeiro</h4>
                      <div className="space-y-4">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase block pl-1">Tipo de Veículo</label>
                            <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl font-black text-gray-800 outline-none">
                               <option value="">Selecione...</option>
                               {vehicleTypes.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                            </select>
                         </div>
                         <Input label="Placa" value={formData.plate || ''} onChange={(e:any) => setFormData({...formData, plate: e.target.value.toUpperCase()})} />
                         <Input label="ANTT (RNTRC)" value={formData.antt || ''} onChange={(e:any) => setFormData({...formData, antt: e.target.value})} />
                         <Input label="Chave PIX para Pagamentos" value={formData.pix || ''} onChange={(e:any) => setFormData({...formData, pix: e.target.value})} />
                      </div>
                   </div>
                </div>
             </div>
             <div className="p-8 bg-white border-t border-gray-100 flex justify-end gap-4">
                <button onClick={() => { setShowModal(false); resetForm(); }} className="px-8 py-3.5 border-2 border-gray-100 text-gray-400 font-black rounded-xl hover:bg-gray-50 uppercase text-[10px] tracking-widest">Cancelar</button>
                <button onClick={handleSave} className="px-12 py-3.5 bg-bordeaux text-white font-black rounded-xl shadow-xl shadow-bordeaux/20 hover:scale-105 transition-all uppercase text-[10px] tracking-widest">Finalizar Cadastro</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, value, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-gray-500 uppercase block pl-1">{label}</label>
    <input value={value} onChange={onChange} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl font-black text-gray-800 focus:ring-4 focus:ring-bordeaux/5 outline-none transition-all shadow-sm" />
  </div>
);

export default DriversModule;
