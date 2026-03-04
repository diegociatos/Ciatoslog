
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CalendarDays, User, CreditCard, Truck, MapPin, Clock, CheckCircle,
  X, Search, ArrowRight, Star, Sparkles, ChevronDown, Navigation,
  DollarSign, AlertCircle, ShieldCheck, ShieldAlert, ChevronRight,
  Flag, FileText, Weight, Layers, ArrowRightLeft, Trophy, History,
  MinusCircle, PlusCircle, Receipt, Scale, Package, Info, Edit3, RefreshCcw
} from 'lucide-react';
import { Load, Driver, useCompany } from '../../App';

interface ProgrammingModuleProps {
  loads: Load[];
  updateLoad: (updatedLoad: Load) => void;
  drivers: Driver[];
}

const ProgrammingModule: React.FC<ProgrammingModuleProps> = ({ loads, updateLoad, drivers }) => {
  const { activeCompany, getCompanyBadge } = useCompany();
  const [activeTab, setActiveTab] = useState<'Aguardando' | 'EmTransito'>('Aguardando');
  const [programmingLoad, setProgrammingLoad] = useState<Load | null>(null);
  
  const waitingLoads = loads.filter(l => l.status === 'AGUARDANDO PROGRAMAÇÃO');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10" style={{ fontFamily: 'Book Antiqua, serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Gestão da Programação</h2>
          <p className="text-gray-500 italic">Multi-empresa Ativa: <span className="text-bordeaux font-black">{activeCompany}</span></p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
           <button onClick={() => setActiveTab('Aguardando')} className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${activeTab === 'Aguardando' ? 'bg-bordeaux text-white shadow-lg' : 'text-gray-400'}`}>Pendentes</button>
           <button onClick={() => setActiveTab('EmTransito')} className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${activeTab === 'EmTransito' ? 'bg-bordeaux text-white shadow-lg' : 'text-gray-400'}`}>Em Trânsito</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        {activeTab === 'Aguardando' ? (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-8 py-6">ID / Carga / Empresa</th>
                <th className="px-8 py-6">Rota</th>
                <th className="px-8 py-6">Requisito</th>
                <th className="px-8 py-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {waitingLoads.map(load => (
                <tr key={load.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 font-black text-gray-800">
                    <div className="flex items-center">
                      #{load.id} {getCompanyBadge(load.ownerId)}
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase block mt-1">{load.merchandise}</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-black">{load.origin} <ArrowRight size={14} className="inline mx-2 text-gray-300"/> {load.destination}</td>
                  <td className="px-8 py-6"><span className="bg-bordeaux/5 text-bordeaux px-3 py-1 rounded-lg text-[10px] font-black uppercase">{load.vehicleTypeRequired}</span></td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setProgrammingLoad(load)}
                      className="bg-bordeaux text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition-all"
                    >
                      Programar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center italic text-gray-300 font-bold">Monitoramento multi-empresa em tempo real...</div>
        )}
      </div>

      {/* Modal de Programação */}
      {programmingLoad && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-bordeaux text-white p-8 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="bg-white/20 p-4 rounded-2xl shadow-inner">
                  <Truck size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-3xl font-black uppercase tracking-tight">Programação de Carga</h3>
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">#{programmingLoad.id}</span>
                    {getCompanyBadge(programmingLoad.ownerId)}
                  </div>
                  <p className="text-xs font-bold opacity-70 uppercase tracking-widest flex items-center gap-2">
                    <Navigation size={12} /> {programmingLoad.origin} <ArrowRight size={10} /> {programmingLoad.destination}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setProgrammingLoad(null)} 
                className="p-3 hover:bg-white/10 rounded-full transition-all hover:rotate-90"
              >
                <X size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-12 bg-white space-y-10">
              {/* Resumo da Carga */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente / Tomador</p>
                  <p className="font-black text-gray-800 text-lg">{programmingLoad.customer}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mercadoria / Peso</p>
                  <p className="font-black text-gray-800 text-lg">{programmingLoad.merchandise || 'Carga Geral'} — {programmingLoad.weight || 0}kg</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Veículo Requerido</p>
                  <span className="inline-block bg-bordeaux/10 text-bordeaux px-4 py-1.5 rounded-xl text-xs font-black uppercase mt-1">
                    {programmingLoad.vehicleTypeRequired}
                  </span>
                </div>
              </div>

              {/* Seleção de Motorista (Placeholder Visual) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h4 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                    <User className="text-bordeaux" /> Selecionar Motorista
                  </h4>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar por nome, placa ou CPF..." 
                      className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm w-80 focus:ring-2 focus:ring-bordeaux/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {drivers.slice(0, 3).map(driver => (
                    <div key={driver.id} className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-bordeaux/30 hover:shadow-xl transition-all cursor-pointer">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-bordeaux/10 group-hover:text-bordeaux transition-colors">
                          <User size={32} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h5 className="font-black text-gray-800 uppercase">{driver.name}</h5>
                            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">{driver.status}</span>
                            {getCompanyBadge(driver.ownerId)}
                          </div>
                          <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                            <span className="flex items-center gap-1"><Truck size={12} /> {driver.vehicleType}</span>
                            <span className="flex items-center gap-1"><CreditCard size={12} /> {driver.plate}</span>
                            <span className="flex items-center gap-1 text-amber-500"><Star size={12} fill="currentColor" /> {driver.rating}</span>
                          </div>
                        </div>
                      </div>
                      <button className="px-8 py-3 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-xl group-hover:bg-bordeaux group-hover:text-white transition-all">
                        Selecionar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
              <button 
                onClick={() => setProgrammingLoad(null)} 
                className="px-10 py-4 font-black text-gray-400 uppercase text-xs tracking-widest hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button 
                disabled
                className="px-14 py-4 bg-gray-200 text-gray-400 font-black rounded-2xl uppercase text-xs tracking-widest cursor-not-allowed"
              >
                Confirmar Programação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammingModule;
