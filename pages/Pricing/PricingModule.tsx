import React, { useState, useEffect } from 'react';
import { PricingConfig, User } from '../../App';
import { Save, Building2, Percent, DollarSign, TrendingUp, Briefcase, ShieldAlert } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface PricingModuleProps {
  pricingConfigs: PricingConfig[];
  setPricingConfigs: React.Dispatch<React.SetStateAction<PricingConfig[]>>;
  currentUser: User;
}

const PricingModule: React.FC<PricingModuleProps> = ({ pricingConfigs, setPricingConfigs, currentUser }) => {
  const [configs, setConfigs] = useState<PricingConfig[]>(pricingConfigs);
  const isAdmin = currentUser.role === 'Administrador';

  useEffect(() => {
    setConfigs(pricingConfigs);
  }, [pricingConfigs]);

  const handleSave = async () => {
    if (!isAdmin) return;
    try {
      for (const config of configs) {
        await setDoc(doc(db, 'pricingConfigs', config.id), config);
      }
      alert('Configurações de precificação salvas com sucesso!');
    } catch (error) {
      console.error("Error saving pricing configs:", error);
      alert("Erro ao salvar configurações de precificação.");
    }
  };

  const updateConfig = (id: string, field: keyof PricingConfig, value: number) => {
    if (!isAdmin) return;
    setConfigs(configs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Precificação</h2>
          <p className="text-gray-500 italic">
            {isAdmin 
              ? "Configure as variantes de precificação para garantir a margem líquida."
              : "Visualize as variantes de precificação configuradas pelo administrador."}
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={handleSave}
            className="bg-bordeaux text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Save size={20} />
            Salvar Configurações
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800">
          <ShieldAlert size={20} />
          <p className="text-sm font-medium">Você está em modo de visualização. Somente administradores podem alterar estes valores.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {configs.map(config => (
          <div key={config.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className={`p-6 border-b border-gray-100 flex items-center gap-4 ${config.ownerId === 'BD' ? 'bg-blue-50/50' : 'bg-emerald-50/50'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.ownerId === 'BD' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-800">
                  {config.ownerId === 'BD' ? 'BD Transportes' : 'LOG Logística'}
                </h3>
                <p className="text-sm text-gray-500 font-medium">Parâmetros de cálculo</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                      <Percent size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Tributos Federais/Simples</p>
                      <p className="text-sm font-bold text-gray-700">Percentual aplicado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={config.federalTaxes}
                      onChange={(e) => updateConfig(config.id, 'federalTaxes', parseFloat(e.target.value) || 0)}
                      className={`w-24 px-4 py-2 border border-gray-200 rounded-xl font-black text-gray-800 text-right focus:ring-2 focus:ring-bordeaux/20 ${!isAdmin && 'bg-gray-100 cursor-not-allowed'}`}
                      step="0.01"
                      disabled={!isAdmin}
                    />
                    <span className="text-gray-400 font-bold">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                      <Percent size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider">ICMS Base</p>
                      <p className="text-[10px] text-gray-400 font-medium italic">Calculado automaticamente no Comercial</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={config.icms}
                      onChange={(e) => updateConfig(config.id, 'icms', parseFloat(e.target.value) || 0)}
                      className={`w-24 px-4 py-2 border border-gray-200 rounded-xl font-black text-gray-800 text-right focus:ring-2 focus:ring-bordeaux/20 ${!isAdmin && 'bg-gray-100 cursor-not-allowed'}`}
                      step="0.01"
                      disabled={!isAdmin}
                    />
                    <span className="text-gray-400 font-bold">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Custo Direto</p>
                      <p className="text-sm font-bold text-gray-700">Percentual aplicado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={config.directCost}
                      onChange={(e) => updateConfig(config.id, 'directCost', parseFloat(e.target.value) || 0)}
                      className={`w-24 px-4 py-2 border border-gray-200 rounded-xl font-black text-gray-800 text-right focus:ring-2 focus:ring-bordeaux/20 ${!isAdmin && 'bg-gray-100 cursor-not-allowed'}`}
                      step="0.01"
                      disabled={!isAdmin}
                    />
                    <span className="text-gray-400 font-bold">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Despesas</p>
                      <p className="text-sm font-bold text-gray-700">Percentual aplicado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={config.expenses}
                      onChange={(e) => updateConfig(config.id, 'expenses', parseFloat(e.target.value) || 0)}
                      className={`w-24 px-4 py-2 border border-gray-200 rounded-xl font-black text-gray-800 text-right focus:ring-2 focus:ring-bordeaux/20 ${!isAdmin && 'bg-gray-100 cursor-not-allowed'}`}
                      step="0.01"
                      disabled={!isAdmin}
                    />
                    <span className="text-gray-400 font-bold">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-bordeaux/5 rounded-2xl border border-bordeaux/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-bordeaux shadow-sm">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-bordeaux uppercase tracking-wider">Lucro Mínimo Esperado</p>
                      <p className="text-sm font-bold text-gray-700">Margem líquida alvo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={config.minProfit}
                      onChange={(e) => updateConfig(config.id, 'minProfit', parseFloat(e.target.value) || 0)}
                      className={`w-24 px-4 py-2 border border-gray-200 rounded-xl font-black text-bordeaux text-right focus:ring-2 focus:ring-bordeaux/20 bg-white ${!isAdmin && 'bg-gray-100 cursor-not-allowed'}`}
                      step="0.01"
                      disabled={!isAdmin}
                    />
                    <span className="text-bordeaux font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingModule;
