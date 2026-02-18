
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
  UserCheck
} from 'lucide-react';
import { Client } from '../../App';

interface ClientsModuleProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  segments: string[];
}

const ClientsModule: React.FC<ClientsModuleProps> = ({ clients, setClients, segments }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'Dados' | 'Cobranca' | 'Decisores' | 'CRM'>('Dados');
  const [searchTerm, setSearchTerm] = useState('');

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
    financeContact: '',
    financePhone: ''
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

  const handleSaveClient = () => {
    const newClient: Client = {
      ...formData as Client,
      id: Math.random().toString(36).substr(2, 5).toUpperCase(),
    };
    setClients([newClient, ...clients]);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '', cnpj: '', type: 'Indústria', segment: '', city: '', state: '',
      commercialRep: '', status: 'Prospecção', decisionMakers: [], history: [],
      icmsContributor: 'Não', stateRegistration: '', taxRegime: 'Simples Nacional',
      financeEmail: '', financeContact: '', financePhone: ''
    });
    setModalTab('Dados');
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
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-bordeaux hover:bg-bordeaux/5 rounded-lg transition-all">
                      <MoreVertical size={18} />
                    </button>
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
            <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0">
              {(['Dados', 'Cobranca', 'Decisores', 'CRM'] as const).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setModalTab(tab)}
                  className={`px-8 py-4 text-sm font-bold transition-all border-b-2 ${
                    modalTab === tab ? 'border-bordeaux text-bordeaux bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'Dados' && <div className="flex items-center gap-2"><Building2 size={16}/> Informações da Empresa</div>}
                  {tab === 'Cobranca' && <div className="flex items-center gap-2"><DollarSign size={16}/> Dados para Cobrança</div>}
                  {tab === 'Decisores' && <div className="flex items-center gap-2"><UserPlus size={16}/> Matriz de Decisores</div>}
                  {tab === 'CRM' && <div className="flex items-center gap-2"><Target size={16}/> Inteligência Comercial</div>}
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
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
                          />
                          <button type="button" className="px-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors">
                            <Globe size={18} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Razão Social / Nome Fantasia</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase">Contribuinte de ICMS</label>
                          <select 
                            value={formData.icmsContributor}
                            onChange={(e) => setFormData({...formData, icmsContributor: e.target.value as any})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
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
                            disabled={formData.icmsContributor !== 'Sim'}
                            value={formData.stateRegistration}
                            onChange={(e) => setFormData({...formData, stateRegistration: e.target.value})}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold ${formData.icmsContributor !== 'Sim' ? 'bg-gray-50 cursor-not-allowed opacity-50' : ''}`}
                            placeholder="Apenas números"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Regime de Tributação</label>
                        <select 
                          value={formData.taxRegime}
                          onChange={(e) => setFormData({...formData, taxRegime: e.target.value as any})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
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
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
                        >
                          <option>Indústria</option>
                          <option>Embarcador</option>
                          <option>Transportador</option>
                          <option>Logística</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Segmento</label>
                        <select 
                          value={formData.segment}
                          onChange={(e) => setFormData({...formData, segment: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
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
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">UF</label>
                        <input 
                          type="text" 
                          maxLength={2}
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold text-center"
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
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">E-mail para envio de Faturas/Boletos</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="email" 
                            placeholder="financeiro@empresa.com.br"
                            value={formData.financeEmail}
                            onChange={(e) => setFormData({...formData, financeEmail: e.target.value})}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Responsável Financeiro</label>
                          <div className="relative">
                            <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="Nome do contato"
                              value={formData.financeContact}
                              onChange={(e) => setFormData({...formData, financeContact: e.target.value})}
                              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
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
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
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
                           <button className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
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
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Status do Funil</label>
                        <select 
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux/20 font-bold"
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
