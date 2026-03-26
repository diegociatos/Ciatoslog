import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Shield, User, Building2, Key } from 'lucide-react';
import { User as UserType } from '../../App';
import { useCompany } from '../../App';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { db, getSecondaryAuth } from '../../firebase';

interface UsersModuleProps {
  users: UserType[];
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
}

const UsersModule: React.FC<UsersModuleProps> = ({ users, setUsers }) => {
  const { activeCompany, getCompanyBadge } = useCompany();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const [formData, setFormData] = useState<Partial<UserType>>({
    name: '',
    email: '',
    role: 'Operacional',
    status: 'Ativo',
    ownerId: 'GLOBAL'
  });
  const [password, setPassword] = useState('');

  // Filter users based on active company context and search term
  const filteredUsers = users.filter(user => {
    const matchesCompany = activeCompany === 'GLOBAL' || user.ownerId === activeCompany || user.ownerId === 'GLOBAL';
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCompany && matchesSearch;
  });

  const handleOpenModal = (user?: UserType) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'Operacional',
        status: 'Ativo',
        ownerId: activeCompany === 'GLOBAL' ? 'GLOBAL' : activeCompany
      });
    }
    setPassword('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updatedUser = { ...formData, id: editingUser.id } as UserType;
        await setDoc(doc(db, 'users', updatedUser.email), updatedUser);
      } else {
        if (!formData.email) return;
        if (!password || password.length < 6) {
          alert('A senha deve ter pelo menos 6 caracteres.');
          return;
        }
        // Create Firebase Auth account using secondary app (keeps admin logged in)
        const secondaryAuth = getSecondaryAuth();
        await createUserWithEmailAndPassword(secondaryAuth, formData.email, password);
        await firebaseSignOut(secondaryAuth);

        // Save user profile in Firestore
        const newUser: UserType = {
          ...formData,
          id: formData.email,
        } as UserType;
        await setDoc(doc(db, 'users', newUser.email), newUser);
      }
      setShowModal(false);
    } catch (error: any) {
      console.error("Error saving user:", error);
      const code = error?.code || '';
      if (code === 'auth/email-already-in-use') {
        alert('Este e-mail já possui uma conta cadastrada.');
      } else if (code === 'auth/weak-password') {
        alert('A senha é muito fraca. Use pelo menos 6 caracteres.');
      } else {
        alert('Erro ao salvar usuário.');
      }
    }
  };

  const toggleStatus = async (user: UserType) => {
    try {
      const updatedUser = { ...user, status: user.status === 'Ativo' ? 'Inativo' : 'Ativo' };
      await setDoc(doc(db, 'users', user.email), updatedUser);
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Erro ao alterar status do usuário.");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Administrador': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Shield size={10} /> Admin</span>;
      case 'Financeiro': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Financeiro</span>;
      case 'Comercial': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Comercial</span>;
      case 'Motorista': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Motorista</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Operacional</span>;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col bg-gray-50/50">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Gestão de Usuários
            {getCompanyBadge(activeCompany)}
          </h1>
          <p className="text-gray-500 mt-1">Gerencie os acessos e permissões do sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-bordeaux text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-bordeaux/20 hover:bg-bordeaux/90 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar usuários por nome ou email..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {filteredUsers.length} usuário(s) encontrado(s)
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr className="text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="p-4 font-bold">Usuário</th>
                <th className="p-4 font-bold">E-mail</th>
                <th className="p-4 font-bold">Perfil de Acesso</th>
                <th className="p-4 font-bold">Unidade</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-400">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      user.ownerId === 'BD' ? 'bg-amber-100 text-amber-700' : 
                      user.ownerId === 'LOG' ? 'bg-bordeaux/10 text-bordeaux' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.ownerId}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-gray-400 hover:text-bordeaux hover:bg-bordeaux/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => toggleStatus(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === 'Ativo' 
                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                            : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={user.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                      >
                        {user.status === 'Ativo' ? <Trash2 size={18} /> : <User size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo/Editar Usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
                <input 
                  type="email" 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required
                  disabled={!!editingUser}
                  placeholder="joao@empresa.com.br"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                    <Key size={12} /> Senha de Acesso
                  </label>
                  <input 
                    type="password" 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Perfil de Acesso</label>
                  <select 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value as UserType['role']})} 
                    required
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Operacional">Operacional</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Motorista">Motorista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidade (Empresa)</label>
                  <select 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
                    value={formData.ownerId} 
                    onChange={e => setFormData({...formData, ownerId: e.target.value as UserType['ownerId']})} 
                    required
                  >
                    <option value="GLOBAL">Global (Todas)</option>
                    <option value="LOG">Ciatoslog</option>
                    <option value="BD">BD Transportes</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-bordeaux text-white rounded-xl font-bold shadow-lg shadow-bordeaux/20 hover:bg-bordeaux/90 transition-all"
                >
                  {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersModule;
