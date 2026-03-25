import React from 'react';
import { Load, User } from '../../App';
import { Package, Truck, CheckCircle, Clock, MapPin, Navigation, ArrowRight, FileText } from 'lucide-react';

interface ClientDashboardProps {
  loads: Load[];
  currentUser: User;
  goToTransportManagement: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ loads, currentUser, goToTransportManagement }) => {
  // Filter loads for the current client
  const clientLoads = loads.filter(l => l.customer === currentUser.name);

  const activeLoads = clientLoads.filter(l => ['AGUARDANDO PROGRAMAÇÃO', 'AGUARDANDO EMISSÃO', 'EM TRÂNSITO'].includes(l.status));
  const completedLoads = clientLoads.filter(l => l.status === 'ENTREGUE');
  
  const totalSpent = clientLoads.reduce((sum, load) => sum + (load.value || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Painel do Cliente</h1>
          <p className="text-gray-500 mt-2 text-lg">Bem-vindo(a), <span className="font-bold text-bordeaux">{currentUser.name}</span>. Acompanhe seus transportes.</p>
        </div>
        <button 
          onClick={goToTransportManagement}
          className="flex items-center gap-2 bg-bordeaux text-white px-6 py-3 rounded-xl font-bold hover:bg-bordeaux/90 transition-colors shadow-lg shadow-bordeaux/20"
        >
          <Navigation size={20} />
          Rastrear Cargas
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Truck size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Em Andamento</p>
            <p className="text-3xl font-black text-gray-900">{activeLoads.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Concluídos</p>
            <p className="text-3xl font-black text-gray-900">{completedLoads.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Package size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total de Cargas</p>
            <p className="text-3xl font-black text-gray-900">{clientLoads.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Transports */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <Clock size={20} className="text-bordeaux" />
              Transportes Ativos
            </h2>
            <button 
              onClick={goToTransportManagement}
              className="text-sm font-bold text-bordeaux hover:text-bordeaux/80 flex items-center gap-1"
            >
              Ver todos <ArrowRight size={16} />
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {activeLoads.length > 0 ? (
              <div className="space-y-4">
                {activeLoads.slice(0, 5).map(load => (
                  <div key={load.id} className="p-4 rounded-xl border border-gray-100 hover:border-bordeaux/30 transition-colors bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                          load.status === 'EM TRÂNSITO' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {load.status}
                        </span>
                        {load.cteNumber && <p className="text-xs font-bold text-gray-500 mt-2">CTE: {load.cteNumber}</p>}
                      </div>
                      <span className="text-xs font-bold text-gray-400">{new Date(load.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                      <div className="flex items-center gap-1"><MapPin size={16} className="text-gray-400"/> {load.origin}</div>
                      <span className="text-gray-300">→</span>
                      <div className="flex items-center gap-1"><MapPin size={16} className="text-gray-400"/> {load.destination}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Truck size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum transporte ativo no momento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-600" />
              Últimas Entregas
            </h2>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {completedLoads.length > 0 ? (
              <div className="space-y-4">
                {completedLoads.slice(0, 5).map(load => (
                  <div key={load.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-emerald-100 text-emerald-700">
                          ENTREGUE
                        </span>
                        {load.cteNumber && <p className="text-xs font-bold text-gray-500 mt-2">CTE: {load.cteNumber}</p>}
                      </div>
                      <span className="text-xs font-bold text-gray-400">{new Date(load.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                      <div className="flex items-center gap-1"><MapPin size={16} className="text-gray-400"/> {load.origin}</div>
                      <span className="text-gray-300">→</span>
                      <div className="flex items-center gap-1"><MapPin size={16} className="text-gray-400"/> {load.destination}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Package size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhuma entrega recente.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
