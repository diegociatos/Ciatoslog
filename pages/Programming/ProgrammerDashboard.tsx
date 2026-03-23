import React from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Navigation,
  CalendarDays,
  User
} from 'lucide-react';
import { Load, Driver, User as UserType } from '../../App';

interface ProgrammerDashboardProps {
  loads: Load[];
  drivers: Driver[];
  currentUser: UserType;
  goToProgramming: () => void;
}

const ProgrammerDashboard: React.FC<ProgrammerDashboardProps> = ({ loads, drivers, currentUser, goToProgramming }) => {
  // Filtros para o programador
  const pendingLoads = loads.filter(l => {
    if (l.status !== 'AGUARDANDO PROGRAMAÇÃO') return false;
    if (currentUser.role === 'Comercial') {
      return l.assignedProgrammer === 'Comercial' && l.commercialRep === currentUser.name;
    }
    if (currentUser.role === 'Operacional') {
      return l.assignedProgrammer !== 'Comercial';
    }
    return true;
  });

  const inTransitLoads = loads.filter(l => {
    if (l.status !== 'EM TRÂNSITO') return false;
    if (currentUser.role === 'Comercial') {
      return l.assignedProgrammer === 'Comercial' && l.commercialRep === currentUser.name;
    }
    if (currentUser.role === 'Operacional') {
      return l.assignedProgrammer !== 'Comercial';
    }
    return true;
  });
  const availableDrivers = drivers.filter(d => d.status === 'Disponível');
  const blockedDrivers = drivers.filter(d => d.status === 'Bloqueado');

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50/50">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Olá, {currentUser.name.split(' ')[0]}! 🚛
        </h1>
        <p className="text-gray-500 mt-1">Aqui está o resumo da sua operação hoje.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Clock size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Aguardando Programação</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{pendingLoads.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Navigation size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Em Trânsito</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{inTransitLoads.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <Truck size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Motoristas Disponíveis</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{availableDrivers.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <AlertCircle size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 font-medium text-sm mb-1">Motoristas Bloqueados</h3>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{blockedDrivers.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cargas Urgentes / Aguardando */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CalendarDays size={20} className="text-bordeaux" />
            Cargas Aguardando Programação
          </h3>
          <div className="space-y-4">
            {pendingLoads.slice(0, 5).map(load => (
              <div key={load.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{load.customer}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin size={12} /> {load.origin} → {load.destination}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-semibold">Veículo:</span> {load.vehicleTypeRequired}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={goToProgramming}
                  className="px-3 py-1.5 bg-white text-bordeaux border border-bordeaux/20 rounded-lg text-xs font-bold hover:bg-bordeaux hover:text-white transition-colors"
                >
                  Programar
                </button>
              </div>
            ))}
            {pendingLoads.length === 0 && (
              <div className="text-center text-gray-500 italic py-4">Nenhuma carga aguardando.</div>
            )}
          </div>
        </div>

        {/* Motoristas Disponíveis */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User size={20} className="text-bordeaux" />
            Motoristas Disponíveis
          </h3>
          <div className="space-y-4">
            {availableDrivers.slice(0, 5).map(driver => (
              <div key={driver.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                    <Truck size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{driver.name}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin size={12} /> {driver.city}/{driver.state}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-semibold">Veículo:</span> {driver.vehicleType} ({driver.plate})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase">
                    Disponível
                  </div>
                </div>
              </div>
            ))}
            {availableDrivers.length === 0 && (
              <div className="text-center text-gray-500 italic py-4">Nenhum motorista disponível no momento.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgrammerDashboard;
