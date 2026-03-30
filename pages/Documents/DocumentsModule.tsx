import React, { useState, useMemo } from 'react';
import { FileText, Search, Folder } from 'lucide-react';
import { CteRecord } from '../../App';

interface DocumentsModuleProps {
  ctes: CteRecord[];
  currentUser: any;
}

const DocumentsModule: React.FC<DocumentsModuleProps> = ({ ctes, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCtes = useMemo(() => {
    return ctes.filter(cte => {
      const matchesSearch = 
        cte.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cte.invoiceNumber && cte.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by client if the user is a client
      const matchesClient = currentUser.role !== 'Cliente' || cte.clientName === currentUser.name;
      
      return matchesSearch && matchesClient;
    });
  }, [ctes, searchTerm, currentUser]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Folder className="text-bordeaux" /> Documentos
      </h2>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por CTE ou Nota Fiscal..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bordeaux"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredCtes.map(cte => (
          <div key={cte.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">CTE: {cte.id}</h3>
              <span className="text-sm text-gray-500">Nota Fiscal: {cte.invoiceNumber || 'N/A'}</span>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">Documentos da Carga:</h4>
              <ul className="space-y-2">
                {/* Assuming documents are stored in cte.documents or similar */}
                {cte.documents && cte.documents.length > 0 ? (
                  cte.documents.map((doc, index) => (
                    <li key={index} className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer">
                      <FileText size={16} /> {doc.name}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-sm">Nenhum documento encontrado.</li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsModule;
