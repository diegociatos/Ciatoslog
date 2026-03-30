import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Navigation,
  CalendarDays,
  User,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Percent,
  Calendar,
  Target
} from 'lucide-react';
import { Load, Driver, User as UserType, CommissionRule } from '../../App';

interface ProgrammerDashboardProps {
  loads: Load[];
  drivers: Driver[];
  currentUser: UserType;
  goToProgramming: () => void;
  commissionRules: CommissionRule[];
}

const ProgrammerDashboard: React.FC<ProgrammerDashboardProps> = ({ loads, drivers, currentUser, goToProgramming, commissionRules }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const years = Array.from({ length: 10 }, (_, i) => (currentYear - 2 + i).toString());

  const months = [
    { value: 'all', label: 'Ano Todo' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  // Filtros para o programador
  const filteredLoads = useMemo(() => {
    return loads.filter(l => {
      const loadDate = new Date(l.date);
      const loadYear = loadDate.getFullYear().toString();
      const loadMonth = (loadDate.getMonth() + 1).toString().padStart(2, '0');

      if (loadYear !== selectedYear) return false;
      if (selectedMonth !== 'all' && loadMonth !== selectedMonth) return false;

      return true;
    });
  }, [loads, selectedYear, selectedMonth]);

  const pendingLoads = filteredLoads.filter(l => {
    if (l.status !== 'AGUARDANDO PROGRAMAÇÃO' && l.status !== 'EM_PROGRAMACAO' && l.status !== 'PRONTO_PROGRAMAR') return false;
    if (currentUser.role === 'Comercial') {
      return l.assignedProgrammer === 'Comercial' && l.commercialRep === currentUser.name;
    }
    if (currentUser.role === 'Operacional') {
      return l.assignedProgrammer !== 'Comercial';
    }
    return true;
  });

  const inTransitLoads = filteredLoads.filter(l => {
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

  // Minhas programações (Custo vs Faturamento)
  const myProgrammedLoads = filteredLoads.filter(l => 
    l.assignedProgrammer === currentUser.name && 
    l.status !== 'AGUARDANDO PROGRAMAÇÃO' && 
    l.status !== 'PRONTO_PROGRAMAR' &&
    l.status !== 'PERDIDO' &&
    l.status !== 'PROSPECTO' &&
    l.status !== 'PROPOSTA_APRESENTADA'
  );
  const totalValue = myProgrammedLoads.reduce((acc, l) => acc + (l.value || 0), 0);
  const totalCost = myProgrammedLoads.reduce((acc, l) => acc + (l.cost || 0), 0);
  const costRatio = totalValue > 0 ? (totalCost / totalValue) * 100 : 0;
  const isBelow60 = costRatio < 60 && totalValue > 0;

  // Cargas perdidas pelo programador
  const lostLoads = filteredLoads.filter(l => l.status === 'PERDIDO' && l.lostBy === 'Operacional');

  // Comissões e Metas Extras
  const commissionData = useMemo(() => {
    let earnedBonus = 0;
    let potentialBonus = 0;

    const myRules = commissionRules.filter(r => r.role === 'Operacional');
    
    // Regras de Meta Extra
    const extraRules = myRules.filter(r => r.type === 'Meta_Extra');

    for (const rule of extraRules) {
      const maxCost = rule.maxCostPercentage || 100;
      const bonus = rule.bonusAmount || 0;

      if (totalValue > 0 && costRatio <= maxCost) {
        earnedBonus += bonus;
      } else if (totalValue > 0 && costRatio > maxCost) {
        potentialBonus += bonus;
      }
    }

    return {
      earnedBonus,
      potentialBonus,
      currentCostPercentage: costRatio
    };
  }, [totalValue, costRatio, commissionRules]);

  return (
    <div className="flex flex-col w-full space-y-10 animate-in fade-in duration-500 pb-12" style={{ fontFamily: '"Book Antiqua", serif' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard Operacional</h2>
          <p className="text-gray-500 mt-1 italic">
            Visão do Programador — <span className="text-[#6D0019] font-bold">{currentUser.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 px-3 border-r border-gray-100">
              <Calendar size={18} className="text-gray-400" />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="px-3">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-gray-600">
            <Clock size={14} className="text-gray-500" />
            Sincronizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* BLOCO 1 — MINHAS PROGRAMAÇÕES (Destaque) */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Minhas Programações ({selectedMonth === 'all' ? selectedYear : months.find(m => m.value === selectedMonth)?.label})
        </h3>
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Faturado vs Custo Carreteiro</p>
              <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${isBelow60 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {isBelow60 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {costRatio.toFixed(1)}% Custo
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Total Faturado</p>
                <div className="text-3xl font-bold text-gray-900">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
              </div>
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Custo Carreteiro</p>
                <div className="text-3xl font-bold text-gray-900">{totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-64 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center h-full">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Status da Meta (&lt; 60%)</p>
            {isBelow60 ? (
              <div className="text-emerald-600 flex flex-col items-center">
                <CheckCircle2 size={48} className="mb-2" />
                <p className="font-bold text-sm">Meta Atingida</p>
                <p className="text-xs text-emerald-600/70 mt-1">Excelente trabalho!</p>
              </div>
            ) : (
              <div className="text-red-600 flex flex-col items-center">
                <AlertCircle size={48} className="mb-2" />
                <p className="font-bold text-sm">Acima da Meta</p>
                <p className="text-xs text-red-600/70 mt-1">Atenção aos custos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BLOCO 1.5 - BÔNUS E METAS EXTRAS */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Bônus e Metas Extras
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600"><Percent size={24} /></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Bônus Conquistado</p>
            </div>
            <h4 className="text-4xl font-bold text-blue-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commissionData.earnedBonus)}
            </h4>
            <p className="text-xs text-gray-500 mt-2">Bônus por manter o custo abaixo da meta</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-amber-50 text-amber-600"><Target size={24} /></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Bônus Potencial</p>
            </div>
            <h4 className="text-4xl font-bold text-amber-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commissionData.potentialBonus)}
            </h4>
            <p className="text-xs text-gray-500 mt-2">Valor a receber se atingir as metas de custo</p>
          </div>
        </div>
      </div>

      {/* BLOCO 2 — INDICADORES OPERACIONAIS */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Indicadores Operacionais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600"><Clock size={24} /></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Aguardando Programação</p>
            </div>
            <h4 className="text-5xl font-bold text-gray-900">{pendingLoads.length}</h4>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-indigo-50 text-indigo-600"><Navigation size={24} /></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Em Trânsito</p>
            </div>
            <h4 className="text-5xl font-bold text-gray-900">{inTransitLoads.length}</h4>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-emerald-50 text-emerald-600"><Truck size={24} /></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Motoristas Disponíveis</p>
            </div>
            <h4 className="text-5xl font-bold text-gray-900">{availableDrivers.length}</h4>
          </div>
        </div>
      </div>

      {/* BLOCO 3 — LISTAGENS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Minhas Cargas Recentes */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Minhas Cargas Recentes</h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">ÚLTIMAS 10</span>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2">
            {myProgrammedLoads.slice(0, 10).map((load) => (
              <div key={load.id} className="flex flex-col gap-3 p-5 rounded-2xl bg-gray-50/50 border border-gray-100/50 hover:border-gray-200 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#6D0019] shadow-sm">
                      <Truck size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{load.origin} → {load.destination}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{load.customer}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    load.status === 'CONCLUÍDA' ? 'bg-emerald-100 text-emerald-700' :
                    load.status === 'EM TRÂNSITO' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {load.status}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100/50">
                  <div className="text-xs text-gray-500">
                    <span className="font-bold text-gray-700">Motorista:</span> {load.driverName || 'Não atribuído'}
                  </div>
                  <div className="text-xs font-bold text-gray-900">
                    {load.value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                  </div>
                </div>
              </div>
            ))}
            {myProgrammedLoads.length === 0 && (
              <div className="text-center text-gray-400 py-10 text-sm">Nenhuma carga programada.</div>
            )}
          </div>
        </div>

        {/* Cargas Urgentes / Aguardando */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aguardando Programação</h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">URGENTES</span>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2">
            {pendingLoads.slice(0, 10).map((load) => (
              <div key={load.id} className="flex flex-col gap-3 p-5 rounded-2xl bg-gray-50/50 border border-gray-100/50 hover:border-gray-200 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#6D0019] shadow-sm">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{load.origin} → {load.destination}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{load.customer}</p>
                    </div>
                  </div>
                  <button 
                    onClick={goToProgramming}
                    className="px-4 py-2 bg-white text-[#6D0019] border border-[#6D0019]/20 rounded-xl text-xs font-bold hover:bg-[#6D0019] hover:text-white transition-colors"
                  >
                    Programar
                  </button>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100/50">
                  <div className="text-xs text-gray-500">
                    <span className="font-bold text-gray-700">Veículo:</span> {load.vehicleTypeRequired}
                  </div>
                  <div className="text-xs font-bold text-gray-900">
                    {load.value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                  </div>
                </div>
              </div>
            ))}
            {pendingLoads.length === 0 && (
              <div className="text-center text-gray-400 py-10 text-sm">Nenhuma carga aguardando.</div>
            )}
          </div>
        </div>

        {/* Motoristas Disponíveis */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-[500px] lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Motoristas Disponíveis</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">LIVRES</span>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2">
            {availableDrivers.map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50/50 border border-gray-100/50 hover:border-gray-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{driver.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{driver.vehicleType} • {driver.plate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">{driver.city}/{driver.state}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Localização Atual</p>
                </div>
              </div>
            ))}
            {availableDrivers.length === 0 && (
              <div className="text-center text-gray-400 py-10 text-sm">Nenhum motorista disponível no momento.</div>
            )}
          </div>
        </div>
      </div>

      {/* Gestão de Perdas de Chances */}
      <div className="mt-6 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <AlertCircle size={20} className="text-red-600" />
          Cargas Não Programadas (Perdas)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Data</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Cliente</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Rota</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Valor Proposto</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Motivo da Perda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lostLoads.map(load => (
                <tr key={load.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {new Date(load.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 text-sm">{load.customer}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{load.origin} → {load.destination}</td>
                  <td className="py-3 px-4 font-medium text-red-600 text-sm">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(load.value)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {load.lostReason || 'Motivo não informado'}
                  </td>
                </tr>
              ))}
              {lostLoads.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Nenhuma perda de chance registrada no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgrammerDashboard;
