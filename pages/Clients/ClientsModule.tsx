
import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  AlertTriangle, 
  UserPlus, 
  Trash2, 
  Mail, 
  MessageSquare,
  Globe,
  MapPin,
  X,
  Phone,
  BarChart4,
  History,
  Target,
  FileSpreadsheet,
  DollarSign,
  UserCheck,
  FileText,
  Edit2,
  Lock,
  Unlock,
  Loader2
} from 'lucide-react';
import { Client, Load, User as UserType, CompanyId } from '../../App';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

interface ClientsModuleProps {
  activeCompany: CompanyId;
  clients: Client[];
  addClient: (newClient: Omit<Client, 'id'>) => void;
  updateClient: (updatedClient: Client) => void;
  deleteClient: (clientId: string) => void;
  segments: string[];
  clientTypes: string[];
  loads: Load[];
  currentUser: UserType;
  users: UserType[];
  addUser: (newUser: UserType) => void;
  updateUser: (updatedUser: UserType) => void;
  deleteUser: (userEmail: string) => void;
}

const ClientsModule: React.FC<ClientsModuleProps> = ({ 
  activeCompany, 
  clients, 
  addClient, 
  updateClient, 
  deleteClient, 
  segments, 
  clientTypes, 
  loads, 
  currentUser, 
  users, 
  addUser, 
  updateUser, 
  deleteUser 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'Dados' | 'Cobranca' | 'Decisores' | 'CRM' | 'Historico' | 'Acesso'>('Dados');
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const [createAccess, setCreateAccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);

  const handleFetchCnpj = async () => {
    const cnpj = formData.cnpj?.replace(/\D/g, '');
    if (!cnpj || cnpj.length !== 14) {
      alert("Por favor, insira um CNPJ válido (14 dígitos).");
      return;
    }

    setIsFetchingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!response.ok) throw new Error("CNPJ não encontrado ou erro na API.");
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        name: data.razao_social || data.nome_fantasia || prev.name,
        city: data.municipio || prev.city,
        state: data.uf || prev.state,
        taxRegime: data.opcao_pelo_simples ? 'Simples Nacional' : prev.taxRegime
      }));
      
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      alert("Não foi possível buscar os dados do CNPJ. Verifique se o número está correto.");
    } finally {
      setIsFetchingCnpj(false);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    cnpj: '',
    type: 'Indústria',
    segment: '',
    city: '',
    state: '',
    commercialRep: '',
    status: 'Prospecção',
    decisionMakers: [],
    history: [],
    icmsContributor: 'Não',
    stateRegistration: '',
    taxRegime: 'Simples Nacional',
    financeEmail: '',
    financeEmail2: '',
    financeContact: '',
    financePhone: '',
    financePhone2: ''
  });

  const [newDecisor, setNewDecisor] = useState({
    name: '',
    position: 'Logística',
    phone: '',
    email: '',
    influence: 50
  });

  const handleAddDecisor = () => {
    if (!newDecisor.name) return;
    setFormData({
      ...formData,
      decisionMakers: [...(formData.decisionMakers || []), newDecisor]
    });
    setNewDecisor({ name: '', position: 'Logística', phone: '', email: '', influence: 50 });
  };

  const handleSaveClient = async () => {
    try {
      if (selectedClientId) {
        updateClient({ ...formData as Client, id: selectedClientId });
      } else {
        addClient({
          ...formData as Client,
          ownerId: activeCompany === 'GLOBAL' ? 'LOG' : activeCompany
        });
      }

      setShowModal(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving client:", error);
      alert("Erro ao salvar cliente.");
    }
  };

  const handleCreateUser = async () => {
    if (!userEmail || !userPassword || !newUserName || !selectedClientId) {
      alert("Preencha todos os campos para criar o acesso.");
      return;
    }

    try {
      // Create in Firebase Auth using a secondary app instance
      const secondaryApp = initializeApp(firebaseConfig, `Secondary-${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);
      try {
        await createUserWithEmailAndPassword(secondaryAuth, userEmail, userPassword);
      } catch (authError: any) {
        if (authError.code !== 'auth/email-already-in-use') {
          throw authError;
        }
      } finally {
        await deleteApp(secondaryApp);
      }

      const newUser: UserType = {
        id: userEmail,
        name: newUserName,
        email: userEmail,
        password: userPassword,
        role: 'Cliente',
        status: 'Ativo',
        ownerId: currentUser.id || 'GLOBAL',
        customerId: selectedClientId,
        isFirstLogin: true
      };
      addUser(newUser);
      
      setUserEmail('');
      setUserPassword('');
      setNewUserName('');
      alert(`Acesso criado com sucesso para ${userEmail}`);
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.code === 'auth/operation-not-allowed') {
        alert("O login com E-mail/Senha não está habilitado no Firebase Console.");
      } else {
        alert("Erro ao criar acesso.");
      }
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (window.confirm(`Excluir acesso do usuário ${email}?`)) {
      deleteUser(email);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Excluir cliente?')) {
      deleteClient(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', cnpj: '', type: 'Indústria', segment: '', city: '', state: '',
      commercialRep: '', status: 'Prospecção', decisionMakers: [], history: [],
      icmsContributor: 'Não', stateRegistration: '', taxRegime: 'Simples Nacional',
      financeEmail: '', financeEmail2: '', financeContact: '', financePhone: '', financePhone2: ''
    });
    setModalTab('Dados');
    setCreateAccess(false);
    setUserEmail('');
    setUserPassword('');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Ativo': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Prospecção': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Negociação Travada': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Inativo': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cnpj.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestão de Carteira & CRM</h2>
          <p className="text-gray-500 italic">Governança institucional sobre clientes e decisores estratégicos.</p>
        </div>
        <button 
          onClick={() => { setShowModal(true); resetForm(); }}
          className="bg-bordeaux text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por Nome, CNPJ ou Cidade..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bordeaux/20 font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-500 font-bold hover:bg-white transition-all">
            <Filter size={18} /> Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Empresa / CNPJ</th>
                <th className="px-6 py-4">Tipo / Segmento</th>
                <th className="px-6 py-4">Cidade / UF</th>
                <th className="px-6 py-4">Rep. Comercial</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{client.name}</span>
                      <span className="text-[10px] text-gray-400 font-bold">{client.cnpj}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">{client.type}</span>
                      <span className="text-[10px] text-gray-400 italic">{client.segment}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-300" />
                      {client.city} / {client.state}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-bordeaux/10 flex items-center justify-center text-[10px] font-bold text-bordeaux">
                        {client.commercialRep.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{client.commercialRep}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={() => setOpenMenuId(openMenuId === client.id ? null : client.id)} className="p-2 text-gray-400 hover:text-bordeaux hover:bg-bordeaux/5 rounded-lg transition-all">
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === client.id && (
                      <div ref={menuRef} className="absolute right-10 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in zoom-in-95">
                        <button onClick={() => { setSelectedClientId(client.id); setFormData(client); setShowModal(true); setOpenMenuId(null); }} className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors group">
                          <Edit2 size={16} className="text-gray-400 group-hover:text-bordeaux" /><span className="text-xs font-black uppercase text-gray-600 tracking-widest">Editar Cadastro</span>
                        </button>
                        <button onClick={() => { updateClient({...client, status: client.status === 'Inativo' ? 'Ativo' : 'Inativo'}); setOpenMenuId(null); }} className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors group">
                          {client.status === 'Inativo' ? <><Unlock size={16} className="text-emerald-500" /><span className="text-xs font-black uppercase text-emerald-600 tracking-widest">Ativar</span></> : <><Lock size={16} className="text-red-500" /><span className="text-xs font-black uppercase text-red-600 tracking-widest">Inativar</span></>}
                        </button>
                        <div className="h-[1px] bg-gray-100 w-full"></div>
                        {currentUser.role === 'Administrador' && (
                          <button onClick={() => { handleDeleteClient(client.id); setOpenMenuId(null); }} className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-red-50 transition-colors group">
                            <Trash2 size={16} className="text-red-400" /><span className="text-xs font-black uppercase text-red-600 tracking-widest">Excluir Cliente</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro de Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-bordeaux text-white p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Building2 size={24} />
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Cadastro Institucional de Cliente</h3>
                  <p className="text-white/60 text-xs italic">Preencha todos os campos para a governança da carteira</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="hover:bg-white/10 p-1 rounded-lg">
                <X size={24} />
              </button>
            </div>

            {/* Tabs do Modal */}
            <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0 overflow-x-auto">
              {(['Dados', 'Cobranca', 'Decisores', 'CRM', 'Historico', 'Acesso'] as const).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setModalTab(tab)}
                  className={`px-8 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                    modalTab === tab ? 'border-bordeaux text-bordeaux bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'Dados' && <div className="flex items-center gap-2"><Building2 size={16}/> Informações da Empresa</div>}
                  {tab === 'Cobranca' && <div className="flex items-center gap-2"><DollarSign size={16}/> Dados para Cobrança</div>}
                  {tab === 'Decisores' && <div className="flex items-center gap-2"><UserPlus size={16}/> Matriz de Decisores</div>}
                  {tab === 'CRM' && <div className="flex items-center gap-2"><Target size={16}/> Inteligência Comercial</div>}
                  {tab === 'Historico' && <div className="flex items-center gap-2"><FileText size={16}/> Histórico de Transportes</div>}
                  {tab === 'Acesso' && <div className="flex items-center gap-2"><Lock size={16}/> Acesso do Cliente</div>}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {modalTab === 'Dados' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-left-4">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-1">Identificação & Tributário</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">CNPJ</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="00.000.000/0000-00"
                            value={formData.cnpj}
                            onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                            disabled={!!selectedClientId}
                            className={`flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                          />
                          <button 
                            type="button" 
                            onClick={handleFetchCnpj}
                            disabled={!!selectedClientId || isFetchingCnpj} 
                            className={`px-3 bg-gray-100 text-gray-500 rounded-xl transition-colors ${selectedClientId || isFetchingCnpj ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                            title="Buscar dados na Receita Federal"
                          >
                            {isFetchingCnpj ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Razão Social / Nome Fantasia</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          disabled={!!selectedClientId}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase">Contribuinte de ICMS</label>
                          <select 
                            value={formData.icmsContributor}
                            onChange={(e) => setFormData({...formData, icmsContributor: e.target.value as any})}
                            disabled={!!selectedClientId}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                          >
                            <option>Sim</option>
                            <option>Não</option>
                            <option>Isento</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase">Inscrição Estadual</label>
                          <input 
                            type="text" 
                            disabled={formData.icmsContributor !== 'Sim' || !!selectedClientId}
                            value={formData.stateRegistration}
                            onChange={(e) => setFormData({...formData, stateRegistration: e.target.value})}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${(formData.icmsContributor !== 'Sim' || selectedClientId) ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50' : ''}`}
                            placeholder="Apenas números"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Regime de Tributação</label>
                        <select 
                          value={formData.taxRegime}
                          onChange={(e) => setFormData({...formData, taxRegime: e.target.value as any})}
                          disabled={!!selectedClientId}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                        >
                          <option>Simples Nacional</option>
                          <option>Lucro Presumido</option>
                          <option>Lucro Real</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-1">Segmentação e Localização</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Tipo</label>
                        <select 
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          disabled={!!selectedClientId}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                        >
                          <option value="">Selecione...</option>
                          {clientTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Segmento</label>
                        <select 
                          value={formData.segment}
                          onChange={(e) => setFormData({...formData, segment: e.target.value})}
                          disabled={!!selectedClientId}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                        >
                          <option value="">Selecione...</option>
                          {segments.map(seg => <option key={seg} value={seg}>{seg}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase">Cidade</label>
                        <input 
                          type="text" 
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          disabled={!!selectedClientId}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">UF</label>
                        <input 
                          type="text" 
                          maxLength={2}
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})}
                          disabled={!!selectedClientId}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold text-center ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase">Site Institucional</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'Cobranca' && (
                <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-left-4">
                  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                    <h4 className="text-sm font-black text-bordeaux uppercase tracking-tighter flex items-center gap-2 mb-4">
                      <FileSpreadsheet size={18}/> Parametrização para Faturamento
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">E-mail para envio de Faturas/Boletos</label>
                          <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="email" 
                              placeholder="financeiro@empresa.com.br"
                              value={formData.financeEmail}
                              onChange={(e) => setFormData({...formData, financeEmail: e.target.value})}
                              disabled={!!selectedClientId}
                              className={`w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">E-mail Adicional</label>
                          <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="email" 
                              placeholder="outro@empresa.com.br"
                              value={formData.financeEmail2 || ''}
                              onChange={(e) => setFormData({...formData, financeEmail2: e.target.value})}
                              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Responsável Financeiro</label>
                          <div className="relative">
                            <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="Nome do contato"
                              value={formData.financeContact}
                              onChange={(e) => setFormData({...formData, financeContact: e.target.value})}
                              disabled={!!selectedClientId}
                              className={`w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Telefone / WhatsApp Financeiro</label>
                          <div className="relative">
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="(00) 00000-0000"
                              value={formData.financePhone}
                              onChange={(e) => setFormData({...formData, financePhone: e.target.value})}
                              disabled={!!selectedClientId}
                              className={`w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Telefone Adicional</label>
                          <div className="relative">
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="(00) 00000-0000"
                              value={formData.financePhone2 || ''}
                              onChange={(e) => setFormData({...formData, financePhone2: e.target.value})}
                              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-bordeaux/5 rounded-2xl border border-bordeaux/10 flex gap-3">
                      <AlertTriangle className="text-bordeaux shrink-0" size={20} />
                      <p className="text-[11px] text-gray-600 font-medium italic leading-relaxed">
                        Estes dados serão utilizados para as notificações automáticas de emissão de faturas e cobranças de inadimplência.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'Decisores' && (
                <div className="space-y-6 animate-in slide-in-from-left-4">
                  <div className={`bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 ${selectedClientId ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <UserPlus size={18} className="text-bordeaux" /> Adicionar Decisor Estratégico
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <input 
                        type="text" 
                        placeholder="Nome do Decisor"
                        value={newDecisor.name}
                        onChange={(e) => setNewDecisor({...newDecisor, name: e.target.value})}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bordeaux/20 text-sm font-bold" 
                      />
                      <select 
                        value={newDecisor.position}
                        onChange={(e) => setNewDecisor({...newDecisor, position: e.target.value})}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bordeaux/20 text-sm font-bold"
                      >
                        <option>Logística</option>
                        <option>Compras</option>
                        <option>Diretoria</option>
                        <option>Financeiro</option>
                        <option>Expedição</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="WhatsApp" 
                        value={newDecisor.phone}
                        onChange={(e) => setNewDecisor({...newDecisor, phone: e.target.value})}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bordeaux/20 text-sm font-bold" 
                      />
                      <button 
                        type="button"
                        onClick={handleAddDecisor}
                        className="bg-bordeaux text-white rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={16} /> Adicionar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-1">Mapeamento de Influência</h4>
                    {formData.decisionMakers?.map((dm: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{dm.name}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-400 font-bold uppercase">
                              <span>{dm.position}</span>
                              <span className="flex items-center gap-1"><Mail size={12}/> {dm.email || 'N/A'}</span>
                              <span className="flex items-center gap-1 text-emerald-600"><MessageSquare size={12}/> {dm.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                             <p className="text-[10px] font-black text-gray-400 uppercase">Influência</p>
                             <div className="flex items-center gap-2">
                               <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                 <div className="bg-bordeaux h-full" style={{ width: `${dm.influence}%` }}></div>
                               </div>
                               <span className="text-xs font-black text-bordeaux">{dm.influence}%</span>
                             </div>
                           </div>
                           <button 
                             onClick={() => {
                               if (currentUser.role === 'Administrador' || !selectedClientId) {
                                 setFormData({
                                   ...formData,
                                   decisionMakers: formData.decisionMakers.filter((_: any, i: number) => i !== idx)
                                 });
                               }
                             }}
                             className={`p-2 transition-all ${currentUser.role === 'Administrador' || !selectedClientId ? 'text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100' : 'text-gray-200 cursor-not-allowed'}`}
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                    ))}
                    {(!formData.decisionMakers || formData.decisionMakers.length === 0) && (
                      <p className="text-center py-8 text-gray-400 italic text-sm">Nenhum decisor mapeado para este cliente ainda.</p>
                    )}
                  </div>
                </div>
              )}

              {modalTab === 'CRM' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-left-4">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-1">Status de Negociação</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Responsável Comercial</label>
                        <input 
                          type="text" 
                          value={formData.commercialRep}
                          onChange={(e) => setFormData({...formData, commercialRep: e.target.value})}
                          disabled={!!selectedClientId}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Status do Funil</label>
                        <select 
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                          disabled={!!selectedClientId}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${selectedClientId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                        >
                          <option>Prospecção</option>
                          <option>Ativo</option>
                          <option>Negociação Travada</option>
                          <option>Inativo</option>
                          <option>Ex-cliente</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase">Probabilidade de Fechamento</label>
                      <input type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-bordeaux" />
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mt-1">
                        <span>Frio (0%)</span>
                        <span>Quente (100%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-1">Perfil Transacional</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Volume Mensal (Cargas)</label>
                        <input type="number" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Ticket Médio (R$)</label>
                        <input type="number" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold text-emerald-600" placeholder="0,00" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase">Anotações Estratégicas</label>
                      <textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-medium text-sm" rows={4} placeholder="Pontos de dor do cliente, concorrência, etc..."></textarea>
                    </div>
                  </div>
                </div>
              )}
              {modalTab === 'Historico' && (
                <div className="space-y-6 animate-in slide-in-from-left-4">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <FileText size={18} className="text-bordeaux" /> Histórico de Transportes
                    </h4>
                    {formData.name ? (
                      <div className="space-y-4">
                        {(() => {
                          const clientLoads = loads.filter(l => l.customer === formData.name);
                          if (clientLoads.length === 0) {
                            return <div className="text-center py-8 text-gray-400 italic">Nenhum transporte encontrado para este cliente.</div>;
                          }

                          // Group by month/year
                          const groupedLoads = clientLoads.reduce((acc, load) => {
                            const date = new Date(load.date);
                            const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                            if (!acc[monthYear]) acc[monthYear] = [];
                            acc[monthYear].push(load);
                            return acc;
                          }, {} as Record<string, Load[]>);

                          return Object.entries(groupedLoads).map(([monthYear, monthLoads]) => (
                            <div key={monthYear} className="border border-gray-100 rounded-xl overflow-hidden">
                              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                <h5 className="font-bold text-gray-700 capitalize">{monthYear}</h5>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{(monthLoads as Load[]).length} transportes</span>
                              </div>
                              <div className="divide-y divide-gray-50">
                                {(monthLoads as Load[]).map(load => (
                                  <div key={load.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                    <div>
                                      <div className="font-bold text-gray-800 flex items-center gap-2">
                                        {load.origin} <span className="text-gray-300">→</span> {load.destination}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                                        <span>{new Date(load.date).toLocaleDateString('pt-BR')}</span>
                                        {load.cteNumber && <span className="font-medium text-gray-600">CTE: {load.cteNumber}</span>}
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                          load.status === 'ENTREGUE' ? 'bg-emerald-100 text-emerald-700' :
                                          load.status === 'EM TRÂNSITO' ? 'bg-blue-100 text-blue-700' :
                                          'bg-amber-100 text-amber-700'
                                        }`}>
                                          {load.status}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-gray-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(load.value)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 italic">
                        Salve o cliente primeiro para visualizar o histórico.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {modalTab === 'Acesso' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-left-4">
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-bordeaux/10 rounded-2xl text-bordeaux">
                          <Lock size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">Novo Acesso</h4>
                          <p className="text-xs text-gray-500 italic">Crie um login para que o cliente acompanhe suas cargas</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Nome do Usuário</label>
                          <input 
                            type="text" 
                            placeholder="Nome completo"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">E-mail de Login</label>
                          <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="email" 
                              placeholder="cliente@email.com"
                              value={userEmail}
                              onChange={(e) => setUserEmail(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Senha Provisória</label>
                          <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="Defina uma senha"
                              value={userPassword}
                              onChange={(e) => setUserPassword(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
                            />
                          </div>
                        </div>
                        <button 
                          onClick={handleCreateUser}
                          disabled={!selectedClientId}
                          className="w-full py-3 bg-bordeaux text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Plus size={18} /> Criar Acesso
                        </button>
                        {!selectedClientId && (
                          <p className="text-[10px] text-red-500 font-bold text-center">Salve o cliente primeiro para criar acessos.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-1">Usuários com Acesso</h4>
                    <div className="space-y-3">
                      {users.filter(u => u.customerId === selectedClientId).map(user => (
                        <div key={user.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-bordeaux border border-gray-100">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{user.name}</p>
                              <p className="text-[10px] text-gray-400">{user.email}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteUser(user.email)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {users.filter(u => u.customerId === selectedClientId).length === 0 && (
                        <p className="text-center py-8 text-gray-400 italic text-sm">Nenhum usuário cadastrado para este cliente.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-white transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveClient}
                className="px-10 py-3 bg-bordeaux text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Finalizar Cadastro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsModule;
