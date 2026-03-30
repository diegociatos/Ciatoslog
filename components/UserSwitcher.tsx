import React, { useState } from 'react';
import { Users, ChevronDown, Shield, Truck, Briefcase, DollarSign, User as UserIcon } from 'lucide-react';
import { User } from '../App';

interface UserSwitcherProps {
  currentUser: User | null;
  onSwitch: (user: User) => void;
}

const testUsers: User[] = [
  { id: 'diegociatos@gmail.com', name: 'Administrador Dev', email: 'diegociatos@gmail.com', role: 'Administrador', status: 'Ativo', ownerId: 'GLOBAL', password: '123456' },
  { id: 'ivaldo@ciatos.com.br', name: 'Ivaldo', email: 'ivaldo@ciatos.com.br', role: 'Administrador', status: 'Ativo', ownerId: 'GLOBAL', password: '123456' },
  { id: 'gestor@ciatos.com.br', name: 'Gestor Teste', email: 'gestor@ciatos.com.br', role: 'Gestor', status: 'Ativo', ownerId: 'LOG', password: '123456' },
  { id: 'cliente@ciatos.com.br', name: 'Cliente Teste', email: 'cliente@ciatos.com.br', role: 'Cliente', status: 'Ativo', ownerId: 'LOG', password: '123456' },
  { id: 'sandro@ciatos.com.br', name: 'Sandro', email: 'sandro@ciatos.com.br', role: 'Operacional', status: 'Ativo', ownerId: 'LOG', password: '123456' },
  { id: 'gabriela@ciatos.com.br', name: 'Gabriela', email: 'gabriela@ciatos.com.br', role: 'Comercial', status: 'Ativo', ownerId: 'BD', password: '123456' },
  { id: 'ismael@ciatos.com.br', name: 'Ismael', email: 'ismael@ciatos.com.br', role: 'Financeiro', status: 'Ativo', ownerId: 'LOG', password: '123456' },
];

const UserSwitcher: React.FC<UserSwitcherProps> = ({ currentUser, onSwitch }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Administrador': return <Shield size={14} />;
      case 'Operacional': return <Truck size={14} />;
      case 'Comercial': return <Briefcase size={14} />;
      case 'Financeiro': return <DollarSign size={14} />;
      default: return <UserIcon size={14} />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-bordeaux text-white px-4 py-3 rounded-full shadow-2xl hover:bg-bordeaux/90 transition-all border-2 border-white/20"
        >
          <Users size={20} />
          <span className="text-sm font-bold hidden sm:inline">Alternar Usuário (Dev)</span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-4 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Simular Visão de:</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {testUsers.map((user) => (
                <button
                  key={user.email}
                  onClick={() => {
                    onSwitch(user);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${currentUser?.email === user.email ? 'bg-bordeaux/5 border-l-4 border-l-bordeaux' : ''}`}
                >
                  <div className={`p-2 rounded-lg ${currentUser?.email === user.email ? 'bg-bordeaux text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {getRoleIcon(user.role)}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${currentUser?.email === user.email ? 'text-bordeaux' : 'text-gray-700'}`}>
                      {user.name}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-medium tracking-tighter">
                      {user.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSwitcher;
