
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CalendarDays, 
  User, 
  CreditCard, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle,
  X,
  Search,
  ArrowRight,
  Star,
  Sparkles,
  ChevronDown,
  Navigation,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Flag
} from 'lucide-react';
import { Load, Driver } from '../../App';

interface ProgrammingModuleProps {
  loads: Load[];
  updateLoad: (updatedLoad: Load) => void;
  drivers: Driver[];
}

const ProgrammingModule: React.FC<ProgrammingModuleProps> = ({ loads, updateLoad, drivers }) => {
  const [activeTab, setActiveTab] = useState<'Aguardando' | 'EmTransito'>('Aguardando');
  const [programmingLoad, setProgrammingLoad] = useState<Load | null>(null);
  const [showDriverSelect, setShowDriverSelect] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    driverId: '',
    driver: '',
    plate: '',
    advance: '',
    balance: '',
    pix: ''
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowDriverSelect(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const waitingLoads = loads.filter(l => l.status === 'AGUARDANDO PROGRAMAÇÃO');
  const transitLoads = loads.filter(l => l.status === 'EM TRÂNSITO');

  // IA de Recomendação Aprimorada - Prompt 5.3 Logic
  const recommendations = useMemo(() => {
    if (!programmingLoad) return [];
    
    return drivers
      .filter(d => 
        d.status === 'Disponível' && 
        d.vehicleType === (programmingLoad.vehicleTypeRequired || 'Truck') &&
        !d.docsExpired
      )
      .map(d => {
        let score = 0;
        const currentRouteStr = `${programmingLoad.origin} → ${programmingLoad.destination}`;
        
        // Match exato (Automático)
        const autoMatches = d.historyRoutes.filter(r => r.type === 'Automático' && `${r.origin} → ${r.destination}` === currentRouteStr);
        if (autoMatches.length > 0) score += 100 + (autoMatches.length * 5); // Base 100 + 5 por viagem
        
        // Match manual (Configurado)
        const manualMatch = d.historyRoutes.find(r => r.type === 'Manual' && `${r.origin} → ${r.destination}` === currentRouteStr);
        if (manualMatch) {
          score += manualMatch.frequency === 'Sempre' ? 50 : 20;
        }

        // Performance
        score += d.rating * 5;
        score += d.completedTrips / 20;

        let reason = 'Motorista disponível';
        if (autoMatches.length > 0) reason = `⭐ Especialista: ${autoMatches.length} viagens nesta rota.`;
        else if (manualMatch) reason = `Habilitado manualmente (${manualMatch.frequency}).`;

        return { ...d, aiScore: score, reason };
      })
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 3);
  }, [programmingLoad, drivers]);

  const otherDrivers = drivers.filter(d => {
    const isRecommended = recommendations.some(r => r.id === d.id);
    const matchesSearch = d.name.toLowerCase().includes(driverSearch.toLowerCase()) || 
                         d.plate.includes(driverSearch.toUpperCase());
    return d.status === 'Disponível' && !isRecommended && matchesSearch;
  });

  const handleOpenProgram = (load: Load) => {
    setProgrammingLoad(load);
    setFormData({
      driverId: '', driver: '', plate: '', advance: '0', 
      balance: load.value.toString(), pix: ''
    });
    setDriverSearch('');
  };

  const selectDriver = (driver: Driver) => {
    const suggestedAdvance = Math.floor(programmingLoad!.value * 0.4);
    setFormData({
      ...formData,
      driverId: driver.id,
      driver: driver.name,
      plate: driver.plate,
      pix: driver.pix,
      advance: suggestedAdvance.toString(),
      balance: (programmingLoad!.value - suggestedAdvance).toString()
    });
    setShowDriverSelect(false);
  };

  const handleConfirmProgramming = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programmingLoad || !formData.driverId) return;

    updateLoad({
      ...programmingLoad,
      status: 'EM TRÂNSITO',
      driverId: formData.driverId,
      driver: formData.driver,
      plate: formData.plate,
      advance: Number(formData.advance),
      balance: Number(formData.balance)
    });
    setProgrammingLoad(null);
  };

  const handleFinalizeDelivery = (load: Load) => {
    if (window.confirm(`Confirmar entrega da carga #${load.id}? Isso atualizará o histórico do motorista.`)) {
      updateLoad({ ...load, status: 'ENTREGUE' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Gestão da Programação</h2>
          <p className="text-gray-500 italic">Expedição assistida e monitoramento de trânsito em tempo real.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
           <button 
             onClick={() => setActiveTab('Aguardando')}
             className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'Aguardando' ? 'bg-bordeaux text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
           >Pendentes ({waitingLoads.length})</button>
           <button 
             onClick={() => setActiveTab('EmTransito')}
             className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'EmTransito' ? 'bg-bordeaux text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
           >Em Trânsito ({transitLoads.length})</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        {activeTab === 'Aguardando' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-6">ID / Emissão</th>
                  <th className="px-8 py-6">Embarcador</th>
                  <th className="px-8 py-6">Rota Operacional</th>
                  <th className="px-8 py-6 text-center">Tipo Requerido</th>
                  <th className="px-8 py-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {waitingLoads.map(load => (
                  <tr key={load.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-6 font-black text-gray-800">#{load.id}</td>
                    <td className="px-8 py-6 font-bold text-gray-700">{load.customer}</td>
                    <td className="px-8 py-6 text-sm font-black text-gray-800">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-bordeaux"/> {load.origin} <ArrowRight size={14} className="text-gray-300"/> {load.destination}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="bg-bordeaux/5 text-bordeaux px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-bordeaux/10">
                        {load.vehicleTypeRequired}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => handleOpenProgram(load)} className="bg-bordeaux text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-bordeaux/10 hover:scale-105 transition-all">Programar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-6">Carga / Motorista</th>
                  <th className="px-8 py-6">Trecho</th>
                  <th className="px-8 py-6">Valores (R$)</th>
                  <th className="px-8 py-6">Monitoramento</th>
                  <th className="px-8 py-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transitLoads.map(load => (
                  <tr key={load.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-800">#{load.id}</span>
                        <span className="text-[10px] font-black uppercase text-bordeaux">{load.driver} • {load.plate}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-600 italic">
                      {load.origin} <ChevronRight size={12} className="inline mx-1"/> {load.destination}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                         <span className="text-sm font-black text-emerald-600">Ad: {load.advance?.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>
                         <span className="text-[10px] font-black text-gray-400 uppercase italic">Saldo: {load.balance?.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase text-emerald-600">Em Trânsito Normal</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleFinalizeDelivery(load)}
                        className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 ml-auto shadow-md shadow-emerald-200"
                      >
                        <Flag size={14}/> Entregue
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Programação */}
      {programmingLoad && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-bordeaux text-white p-10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/10 rounded-3xl border border-white/20"><Truck size={32} /></div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Escala de Veículo</h3>
                  <p className="text-white/60 text-xs italic">#{programmingLoad.id} • {programmingLoad.origin.split('/')[0]} → {programmingLoad.destination.split('/')[0]}</p>
                </div>
              </div>
              <button onClick={() => setProgrammingLoad(null)} className="p-2 hover:bg-white/10 rounded-xl"><X size={32} /></button>
            </div>

            <form onSubmit={handleConfirmProgramming} className="p-10 space-y-8 bg-gray-50/50">
              {/* Select Inteligente */}
              <div className="space-y-3 relative" ref={selectRef}>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-2">Motorista Sugerido (IA de Rota)</label>
                <div 
                  onClick={() => setShowDriverSelect(!showDriverSelect)}
                  className={`w-full px-7 py-5 bg-white border rounded-3xl flex items-center justify-between cursor-pointer hover:border-bordeaux/30 transition-all ${formData.driver ? 'border-bordeaux/20 shadow-md' : 'border-gray-200'}`}
                >
                  {formData.driver ? (
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-bordeaux text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-sm">{formData.driver.charAt(0)}</div>
                      <div>
                        <p className="font-black text-gray-800 text-lg leading-none mb-1">{formData.driver}</p>
                        <p className="text-[10px] font-black text-bordeaux uppercase tracking-widest">{formData.plate}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-gray-400 italic font-bold"><User size={20}/> Escolha um motorista...</div>
                  )}
                  <ChevronDown className={`text-gray-400 transition-transform ${showDriverSelect ? 'rotate-180' : ''}`} />
                </div>

                {showDriverSelect && (
                  <div className="absolute top-[105%] left-0 right-0 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 z-50 overflow-hidden ring-4 ring-black/5 animate-in slide-in-from-top-4">
                    <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                       <Search size={18} className="text-gray-400"/>
                       <input 
                         autoFocus
                         placeholder="Filtrar parceiros..." 
                         className="w-full bg-transparent outline-none font-black text-gray-800"
                         value={driverSearch}
                         onChange={e => setDriverSearch(e.target.value)}
                       />
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                       {/* Recomendados */}
                       {recommendations.map(d => (
                         <button key={d.id} type="button" onClick={() => selectDriver(d)} className="w-full p-5 bg-indigo-50/30 hover:bg-indigo-50 border-b border-indigo-100/50 flex items-center justify-between text-left group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm"><Star size={18} className="fill-current"/></div>
                               <div>
                                 <p className="font-black text-gray-800 text-sm leading-none mb-1">{d.name} <span className="text-[10px] text-indigo-400 font-black ml-1">({d.plate})</span></p>
                                 <p className="text-[10px] text-indigo-600 font-black uppercase italic">{d.reason}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <span className="text-[10px] font-black text-gray-400 uppercase">Score IA: {d.aiScore}</span>
                            </div>
                         </button>
                       ))}
                       {/* Outros */}
                       {otherDrivers.map(d => (
                         <button key={d.id} type="button" onClick={() => selectDriver(d)} className="w-full p-5 hover:bg-gray-50 border-b border-gray-50 flex items-center justify-between text-left group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-black group-hover:bg-bordeaux group-hover:text-white transition-all">{d.name.charAt(0)}</div>
                               <div>
                                 <p className="font-black text-gray-800 text-sm leading-none mb-1">{d.name}</p>
                                 <p className="text-[10px] text-gray-400 font-black uppercase">{d.plate} • {d.vehicleType}</p>
                               </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-200" />
                         </button>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 italic">Adiantamento (R$)</label>
                  <input required type="number" value={formData.advance} onChange={e => setFormData({...formData, advance: e.target.value})} className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl font-black text-emerald-600 focus:ring-4 focus:ring-emerald-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 italic">Saldo Final (R$)</label>
                  <input required type="number" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl font-black text-gray-700" />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setProgrammingLoad(null)} className="flex-1 py-4 border-2 border-gray-100 text-gray-400 font-black rounded-2xl hover:bg-gray-50 uppercase text-xs tracking-widest">Desistir</button>
                <button type="submit" disabled={!formData.driverId} className="flex-[2] py-4 bg-bordeaux text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all uppercase text-xs tracking-widest disabled:opacity-30 disabled:grayscale">Escalar Parceiro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammingModule;
