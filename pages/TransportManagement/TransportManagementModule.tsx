import React, { useState } from 'react';
import { Load, User } from '../../App';
import { Search, MapPin, Truck, FileText, MessageSquare, Paperclip, Send, CheckCircle, Clock, Navigation, Download, ExternalLink, X } from 'lucide-react';

interface TransportManagementModuleProps {
  loads: Load[];
  updateLoad: (updatedLoad: Load) => void;
  currentUser: User;
}

const TransportManagementModule: React.FC<TransportManagementModuleProps> = ({ loads, updateLoad, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState('');
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newLocation, setNewLocation] = useState('');

  // Get unique clients for the filter dropdown
  const uniqueClients = Array.from(new Set(loads.map(l => l.customer))).sort();

  // Filter loads based on role
  const visibleLoads = loads.filter(l => {
    if (currentUser.role === 'Cliente') {
      return l.customer === currentUser.name; // Assuming customer name matches user name for simplicity
    }
    if (selectedClientFilter && l.customer !== selectedClientFilter) {
      return false;
    }
    return true; // Admin, Operacional, Comercial see all
  }).filter(l => 
    l.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.cteNumber && l.cteNumber.includes(searchTerm))
  );

  const handleSendMessage = () => {
    if (!selectedLoad || !newMessage.trim()) return;

    const message = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    updateLoad({
      ...selectedLoad,
      messages: [...(selectedLoad.messages || []), message]
    });
    setNewMessage('');
    
    // Update local state to reflect immediately
    setSelectedLoad(prev => prev ? {
      ...prev,
      messages: [...(prev.messages || []), message]
    } : null);
  };

  const handleAddTracking = () => {
    if (!selectedLoad || !newStatus || !newLocation) return;

    const update = {
      id: Math.random().toString(36).substr(2, 9),
      status: newStatus,
      location: newLocation,
      description: `Atualização de status: ${newStatus} em ${newLocation}`,
      timestamp: new Date().toISOString()
    };

    updateLoad({
      ...selectedLoad,
      trackingHistory: [...(selectedLoad.trackingHistory || []), update]
    });
    setNewStatus('');
    setNewLocation('');

    // Update local state to reflect immediately
    setSelectedLoad(prev => prev ? {
      ...prev,
      trackingHistory: [...(prev.trackingHistory || []), update]
    } : null);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const DocumentLink = ({ title, url, fieldName }: { title: string, url?: string, fieldName?: string }) => {
    const isClient = currentUser.role === 'Cliente';
    
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && fieldName && selectedLoad) {
        const file = e.target.files[0];
        const updated = {
          ...selectedLoad,
          [fieldName]: file.name // Simulating upload by saving file name
        };
        updateLoad(updated);
        setSelectedLoad(updated);
      }
    };

    if (!url) {
      if (isClient || !fieldName) return null;
      return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg text-gray-400">
              <FileText size={20} />
            </div>
            <span className="font-bold text-sm text-gray-500">{title}</span>
          </div>
          <label className="cursor-pointer bg-white border border-gray-200 px-3 py-1 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Anexar
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      );
    }

    return (
      <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-bordeaux/30 hover:bg-bordeaux/5 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm text-bordeaux">
            <FileText size={20} />
          </div>
          <span className="font-bold text-sm text-gray-700 group-hover:text-bordeaux transition-colors">{title}</span>
        </div>
        <Download size={18} className="text-gray-400 group-hover:text-bordeaux transition-colors" />
      </a>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      <div className="bg-white border-b border-gray-200 p-6 shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Gestão de Transportes</h2>
            <p className="text-sm text-gray-500 mt-1">Acompanhamento e comunicação com o cliente</p>
          </div>
          <div className="flex items-center gap-4">
          {currentUser.role !== 'Cliente' && (
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="px-4 py-3 bg-gray-100 border-none rounded-xl font-medium text-sm focus:ring-2 focus:ring-bordeaux/20 outline-none transition-all cursor-pointer"
            >
              <option value="">Todos os Clientes</option>
              {uniqueClients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          )}
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por cliente, origem, destino ou CTE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-xl font-medium text-sm focus:ring-2 focus:ring-bordeaux/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Lista de Cargas */}
        <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-700 uppercase tracking-wider text-xs">Transportes Ativos ({visibleLoads.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {visibleLoads.map(load => (
              <div 
                key={load.id}
                onClick={() => setSelectedLoad(load)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedLoad?.id === load.id 
                    ? 'border-bordeaux bg-bordeaux/5' 
                    : 'border-gray-100 hover:border-bordeaux/30 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <h4 className="font-bold text-gray-900">{load.customer}</h4>
                    {load.cteNumber && <span className="text-[10px] font-bold text-bordeaux uppercase tracking-tighter mt-0.5">CTE: {load.cteNumber}</span>}
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                    load.status === 'ENTREGUE' ? 'bg-emerald-100 text-emerald-700' :
                    load.status === 'EM TRÂNSITO' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {load.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-gray-400"/> {load.origin} <span className="text-gray-300">→</span> {load.destination}</p>
                </div>
              </div>
            ))}
            {visibleLoads.length === 0 && (
              <div className="text-center p-8 text-gray-400">
                <Truck size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum transporte encontrado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detalhes do Transporte */}
        <div className="flex-1 flex flex-col bg-gray-50/30 overflow-hidden">
          {selectedLoad ? (
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 max-w-5xl mx-auto space-y-8">
                
                {/* Header do Transporte */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedLoad(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                      title="Voltar para a lista"
                    >
                      <X size={24} />
                    </button>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{selectedLoad.customer}</h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><MapPin size={16} className="text-bordeaux"/> {selectedLoad.origin}</span>
                        <span className="text-gray-300">→</span>
                        <span className="flex items-center gap-1"><MapPin size={16} className="text-bordeaux"/> {selectedLoad.destination}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 font-medium">Status Atual</div>
                    <div className={`text-lg font-black uppercase tracking-tight ${
                      selectedLoad.status === 'ENTREGUE' ? 'text-emerald-600' :
                      selectedLoad.status === 'EM TRÂNSITO' ? 'text-blue-600' :
                      'text-amber-600'
                    }`}>
                      {selectedLoad.status}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Coluna Esquerda: Tracking e Documentos */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Tracking History */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Navigation size={20} className="text-bordeaux" />
                          Rastreamento
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                          {selectedLoad.trackingHistory?.map((update, index) => (
                            <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-bordeaux text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <CheckCircle size={16} />
                              </div>
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-bold text-gray-900">{update.status}</div>
                                  <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{formatDate(update.timestamp)}</div>
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                                  <MapPin size={14} className="text-gray-400" /> {update.location}
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!selectedLoad.trackingHistory || selectedLoad.trackingHistory.length === 0) && (
                            <div className="text-center py-8 text-gray-400 italic">
                              Nenhuma atualização de rastreamento ainda.
                            </div>
                          )}
                        </div>

                        {/* Add Tracking (Only for internal users) */}
                        {currentUser.role !== 'Cliente' && (
                          <div className="mt-8 pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-700 mb-4">Nova Atualização</h4>
                            <div className="flex gap-4">
                              <input 
                                type="text" 
                                placeholder="Status (ex: Em trânsito, Parada, etc)"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-bordeaux/20"
                              />
                              <input 
                                type="text" 
                                placeholder="Localização atual"
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-bordeaux/20"
                              />
                              <button 
                                onClick={handleAddTracking}
                                disabled={!newStatus || !newLocation}
                                className="bg-bordeaux text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-bordeaux/90 transition-colors disabled:opacity-50"
                              >
                                Atualizar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Documentos */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Paperclip size={20} className="text-bordeaux" />
                          Documentos do Transporte
                        </h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DocumentLink title="CTE" url={selectedLoad.cteUrl} fieldName="cteUrl" />
                        <DocumentLink title="Manifesto" url={selectedLoad.manifestUrl} fieldName="manifestUrl" />
                        <DocumentLink title="Nota Fiscal" url={selectedLoad.invoiceUrl} fieldName="invoiceUrl" />
                        <DocumentLink title="GNRE" url={selectedLoad.gnreUrl} fieldName="gnreUrl" />
                        <DocumentLink title="Boleto" url={selectedLoad.boletoUrl} fieldName="boletoUrl" />
                        <DocumentLink title="CIOT" url={selectedLoad.ciotUrl} fieldName="ciotUrl" />
                      </div>
                    </div>

                  </div>

                  {/* Coluna Direita: Chat */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare size={20} className="text-bordeaux" />
                        Comunicação
                      </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                      {selectedLoad.messages?.map(msg => {
                        const isMe = msg.senderName === currentUser.name;
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xs font-bold text-gray-700">{msg.senderName}</span>
                              <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                              isMe 
                                ? 'bg-bordeaux text-white rounded-tr-none' 
                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                            }`}>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                          </div>
                        );
                      })}
                      {(!selectedLoad.messages || selectedLoad.messages.length === 0) && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                          <MessageSquare size={32} className="opacity-20" />
                          <p className="text-sm">Nenhuma mensagem ainda.</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-white">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Digite sua mensagem..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-bordeaux/20"
                        />
                        <button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="bg-bordeaux text-white p-3 rounded-xl hover:bg-bordeaux/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Navigation size={40} className="text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Selecione um Transporte</h3>
              <p className="text-center max-w-md">
                Escolha uma carga na lista lateral para visualizar o rastreamento, documentos e trocar mensagens.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportManagementModule;
