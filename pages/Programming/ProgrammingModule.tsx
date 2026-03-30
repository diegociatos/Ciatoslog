
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CalendarDays, User, CreditCard, Truck, MapPin, Clock, CheckCircle,
  X, Search, ArrowRight, Star, Sparkles, ChevronDown, Navigation,
  DollarSign, AlertCircle, ShieldCheck, ShieldAlert, ChevronRight,
  Flag, FileText, Weight, Layers, ArrowRightLeft, Trophy, History,
  MinusCircle, PlusCircle, Receipt, Scale, Package, Info, Edit3, RefreshCcw,
  Building2, Target, ClipboardList, Phone, UserCheck, Briefcase, HardDrive, Paperclip, Upload
} from 'lucide-react';
import { Load, Driver, useCompany, Transaction, User as UserType, LoadStatus } from '../../App';

interface ProgrammingModuleProps {
  loads: Load[];
  updateLoad: (updatedLoad: Load) => void;
  drivers: Driver[];
  addDriver: (newDriver: Omit<Driver, 'id' | 'ownerId'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'ownerId'>, specificOwnerId?: 'BD' | 'LOG') => void;
  currentUser: UserType;
}

const ProgrammingModule: React.FC<ProgrammingModuleProps> = ({ loads, updateLoad, drivers, addDriver, addTransaction, currentUser }) => {
  const { activeCompany, getCompanyBadge } = useCompany();
  const [activeTab, setActiveTab] = useState<'Aguardando' | 'EmTransito'>('Aguardando');
  const [searchLoadTerm, setSearchLoadTerm] = useState('');
  const [programmingLoad, setProgrammingLoad] = useState<Load | null>(null);
  
  // Estados de Negociação
  const [selectionStep, setSelectionStep] = useState<1 | 2>(1);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [freightValue, setFreightValue] = useState<number>(0);
  const [hasTaxes, setHasTaxes] = useState<boolean>(false);
  const [taxesValue, setTaxesValue] = useState<number>(0);
  const [extraExpenses, setExtraExpenses] = useState<{description: string, value: number}[]>([]);
  const [advanceValue, setAdvanceValue] = useState<number>(0);

  // Estados de Cadastro Rápido de Motorista
  const [isRegisteringDriver, setIsRegisteringDriver] = useState(false);
  const [newDriverData, setNewDriverData] = useState({
    name: '',
    cnpj_cpf: '',
    type: 'PF' as 'PF' | 'PJ',
    phone: '',
    vehicleType: '',
    plate: '',
    pix: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Estados de Anexo de Documentos
  const [uploadingDocsLoad, setUploadingDocsLoad] = useState<Load | null>(null);
  const [docs, setDocs] = useState<{ cte: File | null, ciot: File | null, contract: File | null, nf: File | null }>({ cte: null, ciot: null, contract: null, nf: null });

  const [lostReasonModal, setLostReasonModal] = useState<{ isOpen: boolean; loadId: string; reason: string }>({ isOpen: false, loadId: '', reason: '' });

  const allDrivers = useMemo(() => {
    const combined = [...drivers];
    if (!searchTerm) return combined;
    const term = searchTerm.toLowerCase();
    return combined.filter(d => 
      d.name.toLowerCase().includes(term) || 
      d.cnpj_cpf.toLowerCase().includes(term) || 
      d.plate.toLowerCase().includes(term)
    );
  }, [drivers, searchTerm]);

  // Resetar estados ao fechar ou mudar de carga
  useEffect(() => {
    if (!programmingLoad) {
      setSelectionStep(1);
      setSelectedDriver(null);
      setFreightValue(0);
      setHasTaxes(false);
      setTaxesValue(0);
      setExtraExpenses([]);
      setAdvanceValue(0);
      setIsRegisteringDriver(false);
      setSearchTerm('');
    } else if (programmingLoad.targetDriverFreight) {
      setFreightValue(programmingLoad.targetDriverFreight);
    }
  }, [programmingLoad]);

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setSelectionStep(2);
  };

  const handleSaveNewDriver = () => {
    if (!newDriverData.name || !newDriverData.cnpj_cpf || !newDriverData.plate) return;

    const newDriver = {
      name: newDriverData.name,
      cnpj_cpf: newDriverData.cnpj_cpf,
      type: newDriverData.type,
      phone: newDriverData.phone,
      vehicleType: newDriverData.vehicleType,
      plate: newDriverData.plate,
      pixKey: newDriverData.pix,
      antt: '',
      completedTrips: 0,
      historyRoutes: [],
      status: 'Disponível',
      rating: 5.0
    } as any;

    addDriver(newDriver);
    setIsRegisteringDriver(false);
    setNewDriverData({
      name: '',
      cnpj_cpf: '',
      type: 'PF',
      phone: '',
      vehicleType: '',
      plate: '',
      pix: ''
    });
    setIsRegisteringDriver(false);
    handleSelectDriver(newDriver);
  };

  const addExpense = () => {
    setExtraExpenses([...extraExpenses, { description: '', value: 0 }]);
  };

  const updateExpense = (index: number, field: 'description' | 'value', value: any) => {
    const newExpenses = [...extraExpenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setExtraExpenses(newExpenses);
  };

  const removeExpense = (index: number) => {
    setExtraExpenses(extraExpenses.filter((_, i) => i !== index));
  };

  const extraExpensesSum = extraExpenses.reduce((acc, curr) => acc + curr.value, 0);
  const totalCusto = freightValue + (!hasTaxes ? taxesValue : 0) + extraExpensesSum;
  const saldoFinal = freightValue + extraExpensesSum - advanceValue - (hasTaxes ? taxesValue : 0);
  const bonusIndex = (programmingLoad?.value && programmingLoad.value > 0) ? (totalCusto / programmingLoad.value) * 100 : 0;

  const handleLostReasonSubmit = () => {
    const loadToUpdate = loads.find(l => l.id === lostReasonModal.loadId);
    if (loadToUpdate) {
      updateLoad({ ...loadToUpdate, status: 'PERDIDO', lostReason: lostReasonModal.reason, lostBy: 'Operacional' });
    }
    setLostReasonModal({ isOpen: false, loadId: '', reason: '' });
  };

  const handleEfetivar = () => {
    if (!programmingLoad || !selectedDriver) return;

    const updatedLoad: Load = {
      ...programmingLoad,
      status: 'AGUARDANDO EMISSÃO',
      driverId: selectedDriver.id,
      driver: selectedDriver.name,
      plate: selectedDriver.plate,
      cost: totalCusto,
      effectiveDriverCost: totalCusto,
      isDriverCostEffective: true,
      advance: advanceValue,
      balance: saldoFinal,
      hasTaxes: hasTaxes,
      taxesValue: taxesValue,
      taxesRetained: hasTaxes ? taxesValue : 0,
      nfUrl: docs.nf ? docs.nf.name : programmingLoad.nfUrl
    };

    updateLoad(updatedLoad);

    // Lançamento no contas a pagar (Ordem de Pagamento)
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      desc: `Pagamento Motorista - Carga #${programmingLoad.id} (${selectedDriver.name})`,
      type: 'SAIDA',
      value: saldoFinal + advanceValue, // Valor total pago ao motorista
      cat: '5', // ID for 'Carreteiro'
      status: 'PENDENTE'
    }, programmingLoad.ownerId);

    if (hasTaxes && taxesValue > 0) {
      addTransaction({
        date: new Date().toISOString().split('T')[0],
        desc: `Tributos - Carga #${programmingLoad.id} (${selectedDriver.name})`,
        type: 'SAIDA',
        value: taxesValue,
        cat: '5', // ID for 'Carreteiro'
        carreteiroType: 'Tributos sobre frete',
        status: 'PENDENTE'
      }, programmingLoad.ownerId);
    }

    setProgrammingLoad(null);
  };

  const waitingLoads = loads.filter(l => {
    if (l.status !== 'AGUARDANDO PROGRAMAÇÃO' && l.status !== 'EM_PROGRAMACAO' && l.status !== 'PRONTO_PROGRAMAR') return false;
    
    if (currentUser.role === 'Comercial') {
      if (l.capturingCommercialUserId !== currentUser.id) return false;
    }
    
    if (currentUser.role === 'Operacional') {
      // Se for operacional, vê o que está atribuído a ele ou ao "Setor"
      if (l.assignedProgrammer === 'Comercial') return false;
      if (l.assignedProgrammer !== 'Setor' && l.assignedProgrammer !== currentUser.name) return false;
    }

    if (searchLoadTerm) {
      const term = searchLoadTerm.toLowerCase();
      return l.customer.toLowerCase().includes(term) || 
             l.origin.toLowerCase().includes(term) || 
             l.destination.toLowerCase().includes(term) ||
             (l.cteNumber && l.cteNumber.includes(searchLoadTerm));
    }
    return true; // Admin/Financeiro vê tudo
  });

  const inTransitLoads = loads.filter(l => {
    if (l.status !== 'EM TRÂNSITO') return false;
    if (currentUser.role === 'Comercial') {
      if (l.assignedProgrammer !== 'Comercial' || l.commercialRep !== currentUser.name) return false;
    }
    if (currentUser.role === 'Operacional') {
      if (l.assignedProgrammer === 'Comercial') return false;
    }
    if (searchLoadTerm) {
      const term = searchLoadTerm.toLowerCase();
      return l.customer.toLowerCase().includes(term) || 
             l.origin.toLowerCase().includes(term) || 
             l.destination.toLowerCase().includes(term) ||
             (l.cteNumber && l.cteNumber.includes(searchLoadTerm));
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10" style={{ fontFamily: 'Book Antiqua, serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Gestão da Programação</h2>
          <p className="text-gray-500 italic">Multi-empresa Ativa: <span className="text-bordeaux font-black">{activeCompany}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar cliente, origem, CTE..." 
              value={searchLoadTerm}
              onChange={(e) => setSearchLoadTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-bordeaux/20 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
             <button onClick={() => setActiveTab('Aguardando')} className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${activeTab === 'Aguardando' ? 'bg-bordeaux text-white shadow-lg' : 'text-gray-400'}`}>Pendentes</button>
             <button onClick={() => setActiveTab('EmTransito')} className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${activeTab === 'EmTransito' ? 'bg-bordeaux text-white shadow-lg' : 'text-gray-400'}`}>Em Trânsito</button>
          </div>
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
                  <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setLostReasonModal({ isOpen: true, loadId: load.id, reason: '' })}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl font-black text-xs uppercase transition-all"
                    >
                      Informar Perda
                    </button>
                    <button 
                      onClick={() => {
                        // Se a carga estiver no "Setor", ao clicar em programar ela assume o programador logado
                        if (load.assignedProgrammer === 'Setor' && currentUser.role === 'Operacional') {
                          const updatedLoad = {
                            ...load,
                            assignedProgrammer: currentUser.name,
                            status: 'EM_PROGRAMACAO' as LoadStatus
                          };
                          updateLoad(updatedLoad);
                          setProgrammingLoad(updatedLoad);
                        } else {
                          setProgrammingLoad(load);
                        }
                      }}
                      className="bg-bordeaux text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition-all"
                    >
                      {load.status === 'EM_PROGRAMACAO' ? 'Continuar' : 'Programar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-8 py-6">ID / Carga / Empresa</th>
                <th className="px-8 py-6">Motorista / Placa</th>
                <th className="px-8 py-6">Documentos Anexados</th>
                <th className="px-8 py-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inTransitLoads.map(load => (
                <tr key={load.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 font-black text-gray-800">
                    <div className="flex items-center">
                      #{load.id} {getCompanyBadge(load.ownerId)}
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase block mt-1">{load.merchandise}</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-black">
                    {load.driver}
                    <span className="text-[10px] text-gray-400 uppercase block mt-1">{load.plate}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${load.cteUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>CTe</span>
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${load.ciotUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>CIOT</span>
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${load.contractUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>Contrato</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => {
                        setUploadingDocsLoad(load);
                        setDocs({
                          cte: null,
                          ciot: null,
                          contract: null
                        });
                      }}
                      className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-sm hover:bg-gray-200 transition-all flex items-center gap-2 ml-auto"
                    >
                      <Paperclip size={14} /> Anexar Docs
                    </button>
                  </td>
                </tr>
              ))}
              {inTransitLoads.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center italic text-gray-300 font-bold">Nenhuma carga em trânsito no momento...</td>
                </tr>
              )}
            </tbody>
          </table>
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

            {/* Content Container */}
            <div className="flex-1 overflow-hidden flex">
              {/* Sidebar: Dossiê da Carga */}
              <aside className="w-96 bg-gray-50 border-r border-gray-100 overflow-y-auto p-8 space-y-8 animate-in slide-in-from-left-4 duration-500">
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-bordeaux uppercase tracking-widest flex items-center gap-2">
                    <ClipboardList size={18} /> Dossiê da Carga
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight">Informações completas para suporte à operação e programação.</p>
                </div>

                {/* Controle de Status/Programador */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-800">
                    <RefreshCcw size={16} className="text-bordeaux" />
                    <span className="text-xs font-black uppercase tracking-tight font-serif">Status & Atribuição</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status Atual</label>
                      <select 
                        value={programmingLoad.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as LoadStatus;
                          updateLoad({ ...programmingLoad, status: newStatus });
                          setProgrammingLoad({ ...programmingLoad, status: newStatus });
                        }}
                        className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-bordeaux/20"
                      >
                        <option value="AGUARDANDO PROGRAMAÇÃO">Aguardando Programação</option>
                        <option value="EM_PROGRAMACAO">Em Programação</option>
                        <option value="PERDIDO">Perdido</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Atribuído a</label>
                      <select 
                        value={programmingLoad.assignedProgrammer}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          updateLoad({ ...programmingLoad, assignedProgrammer: newVal });
                          setProgrammingLoad({ ...programmingLoad, assignedProgrammer: newVal });
                        }}
                        className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-bordeaux/20"
                      >
                        <option value="Setor">Setor (Todos)</option>
                        <option value="Comercial">Comercial (Próprio)</option>
                        <option value={currentUser.name}>{currentUser.name} (Eu)</option>
                        {/* Aqui poderiam vir outros programadores se tivéssemos a lista */}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Seção: Dados do Cliente */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Building2 size={16} className="text-bordeaux" />
                    <span className="text-xs font-black uppercase tracking-tight font-serif">Dados do Cliente</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nome Fantasia / Razão Social</p>
                      <p className="text-xs font-black text-gray-800 uppercase">{programmingLoad.customer}</p>
                      <p className="text-[10px] font-bold text-gray-400 italic">LOGÍSTICA E TRANSPORTES LTDA</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CNPJ</p>
                      <p className="text-xs font-bold text-gray-700">00.000.000/0001-00</p>
                    </div>
                    <div className="pt-3 border-t border-gray-50">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Briefcase size={10} /> Comercial Responsável
                      </p>
                      <p className="text-xs font-black text-bordeaux uppercase mt-1">{programmingLoad.commercialRep || 'Setor Comercial'}</p>
                    </div>
                  </div>
                </div>

                {/* Seção: Logística de Rota */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-800">
                    <MapPin size={16} className="text-bordeaux" />
                    <span className="text-xs font-black uppercase tracking-tight font-serif">Logística de Rota</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Coleta (Origem)
                      </p>
                      <p className="text-[11px] font-bold text-gray-700 leading-relaxed">
                        {programmingLoad.originAddress || programmingLoad.origin}, Nº 123, Bairro Industrial, {programmingLoad.origin}, CEP: 00000-000
                      </p>
                      <div className="flex items-center gap-4 pt-1">
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase">
                          <UserCheck size={12} className="text-emerald-500" /> Sr. José
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase">
                          <Phone size={12} className="text-emerald-500" /> (11) 99999-9999
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-50 pt-4 space-y-2">
                      <p className="text-[9px] font-black text-bordeaux uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-bordeaux rounded-full" /> Entrega (Destino)
                      </p>
                      <p className="text-[11px] font-bold text-gray-700 leading-relaxed">
                        {programmingLoad.destinationAddress || programmingLoad.destination}, Nº 456, Centro, {programmingLoad.destination}, CEP: 00000-000
                      </p>
                      <div className="flex items-center gap-4 pt-1">
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase">
                          <UserCheck size={12} className="text-bordeaux" /> Dra. Maria
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase">
                          <Phone size={12} className="text-bordeaux" /> (11) 88888-8888
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção: Detalhes da Carga */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Package size={16} className="text-bordeaux" />
                    <span className="text-xs font-black uppercase tracking-tight font-serif">Detalhes da Carga</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mercadoria Exata</p>
                      <p className="text-xs font-black text-gray-800 uppercase">{programmingLoad.merchandise || 'Carga Geral'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Peso Real</p>
                        <p className="text-xs font-bold text-gray-700">{programmingLoad.weight || 0} kg</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cubagem</p>
                        <p className="text-xs font-bold text-gray-700">{programmingLoad.volume || 0} m³</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Volumes</p>
                        <p className="text-xs font-bold text-gray-700">12 Paletes</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Valor da NF</p>
                        <p className="text-xs font-black text-emerald-600">R$ 125.400,00</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção: Requisitos do Veículo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Truck size={16} className="text-bordeaux" />
                    <span className="text-xs font-black uppercase tracking-tight font-serif">Requisitos do Veículo</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tipo Exigido</p>
                        <p className="text-xs font-black text-gray-800 uppercase">{programmingLoad.vehicleTypeRequired}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Carroceria</p>
                        <p className="text-xs font-black text-gray-800 uppercase">Sider / Baú</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção: Financeiro de Suporte */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-800">
                    <DollarSign size={16} className="text-bordeaux" />
                    <span className="text-xs font-black uppercase tracking-tight font-serif">Financeiro de Suporte</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Frete Bruto Cliente</p>
                      <p className="text-xs font-black text-gray-800">R$ {(programmingLoad.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-50">
                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                        <Target size={10} /> Teto de Negociação
                      </p>
                      <p className="text-xl font-black text-gray-800">R$ {(programmingLoad.targetDriverFreight || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>

                {/* Seção: Observações do Comercial */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <FileText size={12} /> Observações do Comercial
                  </p>
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-inner">
                    <p className="text-[10px] font-bold text-amber-900 italic leading-relaxed">
                      {programmingLoad.commercialNotes || "Nenhuma observação adicional registrada pelo comercial."}
                    </p>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-12 bg-white space-y-10">
                {selectionStep === 1 ? (
                  <>
                    {/* Resumo da Carga (Simplificado pois agora temos o Dossiê) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status da Carga</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                          <p className="font-black text-gray-800 text-lg uppercase tracking-tight">Aguardando</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Previsão de Saída</p>
                        <p className="font-black text-gray-800 text-lg">{new Date().toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Veículo Requerido</p>
                        <span className="inline-block bg-bordeaux/10 text-bordeaux px-4 py-1.5 rounded-xl text-xs font-black uppercase mt-1">
                          {programmingLoad.vehicleTypeRequired}
                        </span>
                      </div>
                    </div>

                  {/* Seleção de Motorista */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <h4 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                        <User className="text-bordeaux" /> Selecionar Motorista
                      </h4>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setIsRegisteringDriver(true)}
                          className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                        >
                          <PlusCircle size={16} /> Cadastrar Novo Motorista
                        </button>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            type="text" 
                            placeholder="Buscar por nome, placa ou CPF..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm w-80 focus:ring-2 focus:ring-bordeaux/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {isRegisteringDriver ? (
                      <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-200 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between mb-8">
                          <h5 className="text-lg font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                            <Edit3 className="text-emerald-500" /> Cadastro Rápido de Motorista
                          </h5>
                          <button onClick={() => setIsRegisteringDriver(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                            <input 
                              type="text"
                              value={newDriverData.name}
                              onChange={(e) => setNewDriverData({...newDriverData, name: e.target.value})}
                              className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CPF / CNPJ</label>
                            <input 
                              type="text"
                              value={newDriverData.cnpj_cpf}
                              onChange={(e) => setNewDriverData({...newDriverData, cnpj_cpf: e.target.value})}
                              className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo</label>
                            <select 
                              value={newDriverData.type}
                              onChange={(e) => setNewDriverData({...newDriverData, type: e.target.value as 'PF' | 'PJ'})}
                              className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                              <option value="PF">Pessoa Física (PF)</option>
                              <option value="PJ">Pessoa Jurídica (PJ)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp</label>
                            <input 
                              type="text"
                              value={newDriverData.phone}
                              onChange={(e) => setNewDriverData({...newDriverData, phone: e.target.value})}
                              className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Veículo</label>
                            <input 
                              type="text"
                              value={newDriverData.vehicleType}
                              onChange={(e) => setNewDriverData({...newDriverData, vehicleType: e.target.value})}
                              className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                              placeholder="Ex: Truck, Carreta"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Placa</label>
                            <input 
                              type="text"
                              value={newDriverData.plate}
                              onChange={(e) => setNewDriverData({...newDriverData, plate: e.target.value})}
                              className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chave PIX</label>
                            <input 
                              type="text"
                              value={newDriverData.pix}
                              onChange={(e) => setNewDriverData({...newDriverData, pix: e.target.value})}
                              className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div className="flex items-end">
                            <button 
                              onClick={handleSaveNewDriver}
                              className="w-full py-3 bg-emerald-500 text-white font-black rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                            >
                              Salvar e Selecionar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {allDrivers.length > 0 ? (
                          allDrivers.map(driver => (
                            <div 
                              key={driver.id} 
                              onClick={() => handleSelectDriver(driver)}
                              className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-bordeaux/30 hover:shadow-xl transition-all cursor-pointer"
                            >
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
                          ))
                        ) : (
                          <div className="py-20 text-center space-y-4 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 mx-auto shadow-sm">
                              <User size={32} />
                            </div>
                            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest italic">Nenhum motorista encontrado para "{searchTerm}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  {/* Motorista Selecionado */}
                  <div className="bg-bordeaux/5 p-8 rounded-[32px] border border-bordeaux/10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-bordeaux text-white rounded-2xl flex items-center justify-center shadow-lg shadow-bordeaux/20">
                        <User size={40} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-bordeaux uppercase tracking-widest mb-1">Motorista Selecionado</p>
                        <h4 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{selectedDriver?.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Truck size={14} /> {selectedDriver?.vehicleType}</span>
                          <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><CreditCard size={14} /> {selectedDriver?.plate}</span>
                          <span className="bg-bordeaux/10 text-bordeaux px-2 py-0.5 rounded text-[10px] font-black">{selectedDriver?.type}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectionStep(1)}
                      className="flex items-center gap-2 text-bordeaux font-black text-[10px] uppercase tracking-widest hover:underline"
                    >
                      <RefreshCcw size={14} /> Trocar Motorista
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Lado Esquerdo: Valores */}
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor do Frete Motorista (R$)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-bordeaux" size={18} />
                            <input 
                              type="number" 
                              value={freightValue}
                              onChange={(e) => setFreightValue(Number(e.target.value))}
                              className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-bordeaux/20 transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adiantamento (R$)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                            <input 
                              type="number" 
                              value={advanceValue}
                              onChange={(e) => setAdvanceValue(Number(e.target.value))}
                              className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-bordeaux/10 p-2 rounded-lg text-bordeaux">
                              <Scale size={20} />
                            </div>
                            <div>
                              <h5 className="font-black text-gray-800 text-sm uppercase tracking-tight">Tributos</h5>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Valor dos impostos da operação</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor dos Tributos (R$)</label>
                            <div className="relative">
                              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-bordeaux" size={18} />
                              <input 
                                type="number" 
                                value={taxesValue}
                                onChange={(e) => setTaxesValue(Number(e.target.value))}
                                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-bordeaux/20 transition-all"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100">
                            <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Reter do Motorista?</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={hasTaxes}
                                onChange={(e) => setHasTaxes(e.target.checked)}
                                className="sr-only peer" 
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bordeaux"></div>
                            </label>
                          </div>
                        </div>

                        {!hasTaxes && taxesValue > 0 && (
                          <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-700 animate-in fade-in">
                            <AlertCircle size={20} className="shrink-0" />
                            <p className="text-[10px] font-black uppercase leading-tight">Atenção: Como não há retenção, o valor de {taxesValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} será acrescido ao custo da carga para a empresa.</p>
                          </div>
                        )}
                      </div>

                      {/* Despesas Extras */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                            <Receipt size={18} className="text-bordeaux" /> Despesas Extras
                          </h5>
                          <button 
                            onClick={addExpense}
                            className="text-bordeaux hover:bg-bordeaux/5 p-2 rounded-lg transition-all"
                          >
                            <PlusCircle size={20} />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {extraExpenses.map((expense, idx) => (
                            <div key={idx} className="flex gap-4 animate-in slide-in-from-top-2">
                              <input 
                                placeholder="Descrição (ex: Pedágio)"
                                value={expense.description}
                                onChange={(e) => updateExpense(idx, 'description', e.target.value)}
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-bordeaux/20"
                              />
                              <input 
                                type="number"
                                placeholder="Valor"
                                value={expense.value}
                                onChange={(e) => updateExpense(idx, 'value', Number(e.target.value))}
                                className="w-32 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-bordeaux/20"
                              />
                              <button 
                                onClick={() => removeExpense(idx)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <MinusCircle size={20} />
                              </button>
                            </div>
                          ))}
                          {extraExpenses.length === 0 && (
                            <p className="text-center py-4 text-[10px] font-bold text-gray-300 uppercase italic">Nenhuma despesa extra adicionada</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lado Direito: Resumo Financeiro */}
                    <div className="space-y-8">
                      <div className="bg-gray-900 rounded-[32px] p-8 text-white space-y-8 shadow-2xl shadow-gray-900/20">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                          <div className="bg-white/10 p-3 rounded-2xl">
                            <Trophy size={24} className="text-amber-400" />
                          </div>
                          <div>
                            <h5 className="text-xs font-black uppercase tracking-widest opacity-50">Resumo da Programação</h5>
                            <p className="text-lg font-black uppercase tracking-tight">Viagem #{programmingLoad.id}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold opacity-60 uppercase tracking-widest text-[10px]">Custo Total da Operação</span>
                            <span className="font-black">R$ {totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold opacity-60 uppercase tracking-widest text-[10px]">Adiantamento Programado</span>
                            <span className="font-black text-amber-400">- R$ {advanceValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Saldo Final a Pagar</p>
                              <p className="text-3xl font-black text-emerald-400">R$ {saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Bonificação Comercial</p>
                              <div className={`px-3 py-1 rounded-lg font-black text-xs inline-block ${bonusIndex <= 60 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {bonusIndex.toFixed(1)}% {bonusIndex <= 60 ? '— DENTRO DA META' : '— ACIMA DA META'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
                        <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                          <Info size={20} />
                        </div>
                        <div className="space-y-1">
                          <h6 className="text-xs font-black text-amber-800 uppercase tracking-tight">Atenção na Efetivação</h6>
                          <p className="text-[10px] font-bold text-amber-700/70 leading-relaxed uppercase">
                            Ao efetivar, o status da carga mudará para <span className="font-black text-amber-800">AGUARDANDO EMISSÃO</span>. 
                            O motorista será notificado e o financeiro receberá a programação para pagamento do adiantamento.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              {selectionStep === 2 && (
                <button 
                  onClick={handleEfetivar}
                  className="px-14 py-4 bg-bordeaux text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-bordeaux/20 hover:scale-105 transition-all flex items-center gap-3"
                >
                  <CheckCircle size={18} /> Efetivar Programação
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal de Anexo de Documentos */}
      {uploadingDocsLoad && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="bg-bordeaux text-white p-8 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="bg-white/20 p-4 rounded-2xl shadow-inner">
                  <Paperclip size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Anexar Documentos</h3>
                  <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Carga #{uploadingDocsLoad.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setUploadingDocsLoad(null)} 
                className="text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-xl"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                  <input 
                    type="file" 
                    id="cteDocProg" 
                    className="hidden" 
                    onChange={(e) => setDocs({...docs, cte: e.target.files?.[0] || null})}
                  />
                  <label htmlFor="cteDocProg" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={24} className={docs.cte ? "text-emerald-500" : "text-gray-400"} />
                    <span className="text-sm font-bold text-gray-700">Anexar CTE</span>
                    <span className="text-xs text-gray-500">{docs.cte ? docs.cte.name : 'Nenhum arquivo'}</span>
                  </label>
                </div>

                <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                  <input 
                    type="file" 
                    id="ciotDocProg" 
                    className="hidden" 
                    onChange={(e) => setDocs({...docs, ciot: e.target.files?.[0] || null})}
                  />
                  <label htmlFor="ciotDocProg" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={24} className={docs.ciot ? "text-emerald-500" : "text-gray-400"} />
                    <span className="text-sm font-bold text-gray-700">Anexar CIOT</span>
                    <span className="text-xs text-gray-500">{docs.ciot ? docs.ciot.name : 'Nenhum arquivo'}</span>
                  </label>
                </div>

                <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                  <input 
                    type="file" 
                    id="contractDocProg" 
                    className="hidden" 
                    onChange={(e) => setDocs({...docs, contract: e.target.files?.[0] || null})}
                  />
                  <label htmlFor="contractDocProg" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={24} className={docs.contract ? "text-emerald-500" : "text-gray-400"} />
                    <span className="text-sm font-bold text-gray-700">Contrato de Frete</span>
                    <span className="text-xs text-gray-500">{docs.contract ? docs.contract.name : 'Nenhum arquivo'}</span>
                  </label>
                </div>

                <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                  <input 
                    type="file" 
                    id="nfDocProg" 
                    className="hidden" 
                    onChange={(e) => setDocs({...docs, nf: e.target.files?.[0] || null})}
                  />
                  <label htmlFor="nfDocProg" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={24} className={docs.nf ? "text-emerald-500" : "text-gray-400"} />
                    <span className="text-sm font-bold text-gray-700">Anexar NF</span>
                    <span className="text-xs text-gray-500">{docs.nf ? docs.nf.name : 'Nenhum arquivo'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
              <button 
                onClick={() => setUploadingDocsLoad(null)} 
                className="px-8 py-3 font-black text-gray-400 uppercase text-xs tracking-widest hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  updateLoad({
                    ...uploadingDocsLoad,
                    cteUrl: docs.cte ? docs.cte.name : uploadingDocsLoad.cteUrl,
                    ciotUrl: docs.ciot ? docs.ciot.name : uploadingDocsLoad.ciotUrl,
                    contractUrl: docs.contract ? docs.contract.name : uploadingDocsLoad.contractUrl,
                    nfUrl: docs.nf ? docs.nf.name : uploadingDocsLoad.nfUrl
                  });
                  setUploadingDocsLoad(null);
                }}
                className="px-8 py-3 bg-bordeaux text-white font-black rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-bordeaux/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <CheckCircle size={16} /> Salvar Documentos
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Motivo da Perda */}
      {lostReasonModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <AlertCircle size={24} className="text-red-600" />
                Motivo da Perda
              </h2>
              <button onClick={() => setLostReasonModal({ isOpen: false, loadId: '', reason: '' })} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Por que a carga não foi programada?
                  </label>
                  <textarea
                    value={lostReasonModal.reason}
                    onChange={(e) => setLostReasonModal({ ...lostReasonModal, reason: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none h-32"
                    placeholder="Ex: Falta de veículo na região, valor do frete incompatível com o mercado..."
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                  <AlertCircle size={20} className="text-amber-600 shrink-0" />
                  <p className="text-xs font-bold text-amber-800 leading-relaxed">
                    Ao confirmar, esta carga será marcada como <span className="font-black">PERDIDA</span> e o comercial será notificado sobre o motivo.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setLostReasonModal({ isOpen: false, loadId: '', reason: '' })}
                  className="flex-1 px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLostReasonSubmit}
                  disabled={!lostReasonModal.reason.trim()}
                  className="flex-1 px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Perda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProgrammingModule;
