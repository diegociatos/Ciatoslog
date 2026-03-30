import React, { useState } from 'react';
import { Load, User as UserType, CteRecord } from '../../App';
import { Search, FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface CteEmissionModuleProps {
  loads: Load[];
  updateLoad: (updatedLoad: Load) => void;
  currentUser: UserType;
  ctes: CteRecord[];
  addCte: (newCte: CteRecord) => void;
}

const CteEmissionModule: React.FC<CteEmissionModuleProps> = ({ loads, updateLoad, currentUser, ctes, addCte }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [cteNumber, setCteNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Simulated file uploads
  const [cteDoc, setCteDoc] = useState<File | string | null>(null);
  const [manifestDoc, setManifestDoc] = useState<File | string | null>(null);
  const [ciotDoc, setCiotDoc] = useState<File | string | null>(null);
  const [contractDoc, setContractDoc] = useState<File | string | null>(null);
  const [invoiceDoc, setInvoiceDoc] = useState<File | string | null>(null);
  const [otherDocs, setOtherDocs] = useState<File | string | null>(null);

  const pendingEmissionLoads = loads.filter(l => {
    if (l.status !== 'AGUARDANDO EMISSÃO') return false;
    if (currentUser.role === 'Comercial') {
      return l.assignedProgrammer === 'Comercial' && l.commercialRep === currentUser.name;
    }
    if (currentUser.role === 'Operacional') {
      return l.assignedProgrammer !== 'Comercial';
    }
    return true; // Admin/Financeiro vê tudo
  }).filter(l => 
    l.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.cteNumber && l.cteNumber.includes(searchTerm))
  );

  const handleSelectLoad = (load: Load) => {
    setSelectedLoad(load);
    setCteNumber(load.cteNumber || '');
    setDueDate('');
    setCteDoc(load.cteUrl || null);
    setManifestDoc(load.manifestUrl || null);
    setCiotDoc(load.ciotUrl || null);
    setContractDoc(load.contractUrl || null);
    setInvoiceDoc(load.invoiceUrl || null);
    setOtherDocs(load.otherDocsUrl || null);
  };

  const handleEmitir = () => {
    if (!selectedLoad) return;
    
    if (!cteNumber) {
      alert('Por favor, informe o número do CTE.');
      return;
    }

    if (!dueDate) {
      alert('Por favor, informe a data de vencimento da cobrança.');
      return;
    }

    const updatedLoad: Load = {
      ...selectedLoad,
      status: 'EM TRÂNSITO',
      cteNumber,
      cteUrl: cteDoc ? (typeof cteDoc === 'string' ? cteDoc : cteDoc.name) : selectedLoad.cteUrl,
      manifestUrl: manifestDoc ? (typeof manifestDoc === 'string' ? manifestDoc : manifestDoc.name) : selectedLoad.manifestUrl,
      ciotUrl: ciotDoc ? (typeof ciotDoc === 'string' ? ciotDoc : ciotDoc.name) : selectedLoad.ciotUrl,
      contractUrl: contractDoc ? (typeof contractDoc === 'string' ? contractDoc : contractDoc.name) : selectedLoad.contractUrl,
      invoiceUrl: invoiceDoc ? (typeof invoiceDoc === 'string' ? invoiceDoc : invoiceDoc.name) : selectedLoad.invoiceUrl,
      otherDocsUrl: otherDocs ? (typeof otherDocs === 'string' ? otherDocs : otherDocs.name) : selectedLoad.otherDocsUrl,
    };

    // Create a new CTE record in Gestão de CTE
    const newCteRecord: CteRecord = {
      id: Math.random().toString(36).substr(2, 9),
      loadId: selectedLoad.id,
      cteNumber,
      emissionDate: new Date().toISOString().split('T')[0],
      customer: selectedLoad.customer,
      origin: selectedLoad.origin,
      destination: selectedLoad.destination,
      cteValue: selectedLoad.value,
      driverName: selectedLoad.driver || '',
      driverCpf: '', // Not available in Load, to be filled by Operacional
      driverFreight: selectedLoad.cost,
      advanceValue: selectedLoad.advance || 0,
      advanceDate: '',
      balanceValue: selectedLoad.balance || 0,
      balanceDate: '',
      extraValue: 0,
      extraReference: '',
      tollValue: 0,
      taxesRetained: selectedLoad.taxesRetained || 0,
      hasTaxes: selectedLoad.hasTaxes,
      taxesValue: selectedLoad.taxesValue || 0,
      status: 'ATIVO',
      financeConfirmed: false,
      financeRejected: false,
      dueDate: dueDate,
      isPaid: false
    };

    addCte(newCteRecord);
    updateLoad(updatedLoad);
    setSelectedLoad(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10" style={{ fontFamily: 'Book Antiqua, serif' }}>
      <div>
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Emissão de CTE</h2>
        <p className="text-gray-500 italic">Anexe os documentos e informe o número do CTE para liberar a carga.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Cargas Aguardando Emissão */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar cargas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none"
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {pendingEmissionLoads.map(load => (
              <div 
                key={load.id}
                onClick={() => handleSelectLoad(load)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedLoad?.id === load.id 
                    ? 'border-bordeaux bg-bordeaux/5' 
                    : 'border-gray-100 hover:border-bordeaux/30 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900">{load.customer}</h4>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                    Aguardando
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Origem:</span> {load.origin}</p>
                  <p><span className="font-medium">Destino:</span> {load.destination}</p>
                  <p><span className="font-medium">Motorista:</span> {load.driver}</p>
                </div>
              </div>
            ))}
            {pendingEmissionLoads.length === 0 && (
              <div className="text-center py-10 text-gray-500 italic">
                Nenhuma carga aguardando emissão.
              </div>
            )}
          </div>
        </div>

        {/* Área de Emissão */}
        <div className="lg:col-span-2">
          {selectedLoad ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-bordeaux/10 flex items-center justify-center text-bordeaux">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Documentação da Carga</h3>
                  <p className="text-sm text-gray-500">Cliente: {selectedLoad.customer}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
                <div>
                  <span className="text-gray-500 block">Origem</span>
                  <span className="font-bold text-gray-900">{selectedLoad.origin}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Destino</span>
                  <span className="font-bold text-gray-900">{selectedLoad.destination}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Motorista</span>
                  <span className="font-bold text-gray-900">{selectedLoad.driver}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Placa</span>
                  <span className="font-bold text-gray-900">{selectedLoad.plate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Valor do Frete (Venda)</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(selectedLoad.value)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Custo Motorista</span>
                  <span className="font-bold text-red-600">{formatCurrency(selectedLoad.cost)}</span>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Número do CTE *</label>
                    <input 
                      type="text" 
                      value={cteNumber}
                      onChange={(e) => setCteNumber(e.target.value)}
                      placeholder="Ex: 12345"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Data de Vencimento da Cobrança *</label>
                    <input 
                      type="date" 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <input 
                      type="file" 
                      id="cteDoc" 
                      className="hidden" 
                      onChange={(e) => setCteDoc(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="cteDoc" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload size={24} className={cteDoc ? "text-emerald-500" : "text-gray-400"} />
                      <span className="text-sm font-bold text-gray-700">Anexar CTE</span>
                      <span className="text-xs text-gray-500">{cteDoc ? (typeof cteDoc === 'string' ? cteDoc : cteDoc.name) : 'Nenhum arquivo'}</span>
                    </label>
                  </div>

                  <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <input 
                      type="file" 
                      id="manifestDoc" 
                      className="hidden" 
                      onChange={(e) => setManifestDoc(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="manifestDoc" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload size={24} className={manifestDoc ? "text-emerald-500" : "text-gray-400"} />
                      <span className="text-sm font-bold text-gray-700">Manifesto de Carga</span>
                      <span className="text-xs text-gray-500">{manifestDoc ? (typeof manifestDoc === 'string' ? manifestDoc : manifestDoc.name) : 'Nenhum arquivo'}</span>
                    </label>
                  </div>

                  <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <input 
                      type="file" 
                      id="ciotDoc" 
                      className="hidden" 
                      onChange={(e) => setCiotDoc(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="ciotDoc" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload size={24} className={ciotDoc ? "text-emerald-500" : "text-gray-400"} />
                      <span className="text-sm font-bold text-gray-700">CIOT</span>
                      <span className="text-xs text-gray-500">{ciotDoc ? (typeof ciotDoc === 'string' ? ciotDoc : ciotDoc.name) : 'Nenhum arquivo'}</span>
                    </label>
                  </div>

                  <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <input 
                      type="file" 
                      id="contractDoc" 
                      className="hidden" 
                      onChange={(e) => setContractDoc(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="contractDoc" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload size={24} className={contractDoc ? "text-emerald-500" : "text-gray-400"} />
                      <span className="text-sm font-bold text-gray-700">Contrato de Frete</span>
                      <span className="text-xs text-gray-500">{contractDoc ? (typeof contractDoc === 'string' ? contractDoc : contractDoc.name) : 'Nenhum arquivo'}</span>
                    </label>
                  </div>

                  <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <input 
                      type="file" 
                      id="invoiceDoc" 
                      className="hidden" 
                      onChange={(e) => setInvoiceDoc(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="invoiceDoc" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload size={24} className={invoiceDoc ? "text-emerald-500" : "text-gray-400"} />
                      <span className="text-sm font-bold text-gray-700">Nota Fiscal</span>
                      <span className="text-xs text-gray-500">{invoiceDoc ? (typeof invoiceDoc === 'string' ? invoiceDoc : invoiceDoc.name) : 'Nenhum arquivo'}</span>
                    </label>
                  </div>

                  <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                    <input 
                      type="file" 
                      id="otherDocs" 
                      className="hidden" 
                      multiple
                      onChange={(e) => setOtherDocs(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="otherDocs" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload size={24} className={otherDocs ? "text-emerald-500" : "text-gray-400"} />
                      <span className="text-sm font-bold text-gray-700">Outros (Fotos/Docs)</span>
                      <span className="text-xs text-gray-500">{otherDocs ? (typeof otherDocs === 'string' ? otherDocs : otherDocs.name) : 'Nenhum arquivo'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={handleEmitir}
                  disabled={!cteNumber}
                  className="bg-bordeaux text-white px-8 py-3 rounded-xl font-bold hover:bg-bordeaux/90 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={20} />
                  Confirmar Emissão e Liberar Carga
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FileText size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma carga selecionada</h3>
              <p className="text-gray-500 max-w-md">
                Selecione uma carga na lista ao lado para informar o número do CTE e anexar os documentos necessários.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CteEmissionModule;
