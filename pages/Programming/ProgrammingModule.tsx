
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
                  <td className="px-8 py-6 text-right"><button className="bg-bordeaux text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition-all">Programar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center italic text-gray-300 font-bold">Monitoramento multi-empresa em tempo real...</div>
        )}
      </div>
    </div>
  );
};

export default ProgrammingModule;
