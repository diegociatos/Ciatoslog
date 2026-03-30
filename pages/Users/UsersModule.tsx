import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Shield, User, Building2, UserX, Power, Camera } from 'lucide-react';
import { User as UserType, Client } from '../../App';
import { useCompany } from '../../App';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

interface UsersModuleProps {
  users: UserType[];
  addUser: (newUser: UserType) => void;
  updateUser: (updatedUser: UserType) => void;
  deleteUser: (userEmail: string) => void;
  clients: Client[];
  currentUser: UserType;
}

const UsersModule: React.FC<UsersModuleProps> = ({ users, addUser, updateUser, deleteUser, clients, currentUser }) => {
  const { activeCompany, getCompanyBadge } = useCompany();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

  const [formData, setFormData] = useState<Partial<UserType>>({
    name: '',
    email: '',
    password: '',
    role: 'Operacional',
    status: 'Ativo',
    ownerId: 'GLOBAL',
    photoURL: ''
  });

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
        password: '',
        role: 'Operacional',
        status: 'Ativo',
        ownerId: activeCompany === 'GLOBAL' ? 'GLOBAL' : activeCompany,
        photoURL: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    try {
      if (editingUser) {
        const updatedUser = { ...formData, id: editingUser.id, email: formData.email?.toLowerCase().trim() } as UserType;
        if (!updatedUser.password) {
          updatedUser.password = editingUser.password;
        }
        console.log("Updating existing user:", updatedUser);
        updateUser(updatedUser);
        console.log("User update requested.");
      } else {
        if (!formData.email || !formData.password) {
          alert("E-mail e senha são obrigatórios para novos usuários.");
          return;
        }
        const email = formData.email.toLowerCase().trim();
        console.log("Creating new user:", email);

        // Check if user already exists in Firestore
        const userCheck = await getDoc(doc(db, 'users', email));
        if (userCheck.exists()) {
          alert("Este e-mail já está cadastrado no banco de dados. Se deseja alterar os dados, use a opção de editar o usuário existente.");
          return;
        }

        // Create in Firebase Auth using a secondary app instance
        const secondaryAppName = "Secondary-" + Date.now();
        console.log("Initializing secondary app:", secondaryAppName);
        
        if (!firebaseConfig || !firebaseConfig.apiKey) {
          console.error("Firebase config is invalid or missing:", firebaseConfig);
          alert("Erro crítico: Configuração do Firebase não encontrada.");
          return;
        }

        let secondaryApp;
        try {
          secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
          const secondaryAuth = getAuth(secondaryApp);
          
          console.log("Creating user in secondary auth:", email);
          await createUserWithEmailAndPassword(secondaryAuth, email, formData.password || '');
          console.log("User created in secondary auth successfully.");
        } catch (authError: any) {
          // If user already exists in Auth, we just continue to create Firestore record
          if (authError.code === 'auth/email-already-in-use') {
            console.log("User already exists in Auth (handled), proceeding to create Firestore record.");
          } else {
            console.error("Auth creation error:", authError);
            alert("Erro ao criar usuário no sistema de autenticação: " + authError.message);
            throw authError;
          }
        } finally {
          if (secondaryApp) {
            try {
              await deleteApp(secondaryApp);
            } catch (delError) {
              console.error("Error deleting secondary app:", delError);
            }
          }
        }

        const newUser: UserType = {
          ...formData,
          email: email,
          id: email, // Use email as ID
          isFirstLogin: true, // New users must change password on first login
        } as UserType;
        
        console.log("Saving new user:", newUser);
        addUser(newUser);
        console.log("User creation requested.");
      }
      setShowModal(false);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      const errorMessage = error.message || "Erro desconhecido";
      if (error.code === 'auth/operation-not-allowed') {
        alert("O login com E-mail/Senha não está habilitado no Firebase Console. Por favor, habilite-o em Authentication > Sign-in method.");
      } else if (error.code === 'auth/weak-password') {
        alert("A senha deve ter pelo menos 6 caracteres.");
      } else if (error.code === 'auth/invalid-email') {
        alert("E-mail inválido.");
      } else if (error.message?.includes('permission-denied') || error.code === 'permission-denied') {
        alert("Erro de permissão: Você não tem autorização para realizar esta operação no banco de dados.");
      } else {
        alert("Erro ao salvar usuário: " + errorMessage);
      }
    }
  };

  const toggleStatus = async (user: UserType) => {
    try {
      const updatedStatus = user.status === 'Ativo' ? 'Inativo' : 'Ativo';
      const updatedUser = { ...user, status: updatedStatus as 'Ativo' | 'Inativo' };
      console.log("Toggling user status:", updatedUser.email, "to", updatedStatus);
      updateUser(updatedUser);
      console.log("User status update requested.");
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      alert("Erro ao alterar status do usuário: " + (error.message || "Erro desconhecido"));
    }
  };

  const handleDeleteUser = async (user: UserType) => {
    try {
      console.log("Deleting user:", user.email);
      deleteUser(user.email);
      console.log("User deletion requested.");
      setUserToDelete(null);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert("Erro ao excluir usuário: " + (error.message || "Erro desconhecido"));
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Administrador': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Shield size={10} /> Admin</span>;
      case 'Gestor': return <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Gestor</span>;
      case 'Financeiro': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Financeiro</span>;
      case 'Comercial': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Comercial</span>;
      case 'Motorista': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Motorista</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Operacional</span>;
    }
  };

  const canManageUsers = currentUser?.role === 'Administrador' || currentUser?.role === 'Gestor';

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
        {canManageUsers && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-bordeaux text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-bordeaux/20 hover:bg-bordeaux/90 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Usuário
          </button>
        )}
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
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden border border-gray-200">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
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
                    {canManageUsers && (
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
                              ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' 
                              : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                        >
                          {user.status === 'Ativo' ? <Power size={18} /> : <Power size={18} className="rotate-180" />}
                        </button>
                        <button 
                          onClick={() => setUserToDelete(user)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
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

      {/* Modal Confirmação de Exclusão */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Excluir Usuário?</h3>
              <p className="text-gray-500 mb-6">
                Tem certeza que deseja excluir permanentemente o usuário <span className="font-bold text-gray-900">{userToDelete.name}</span>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleDeleteUser(userToDelete)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  placeholder="joao@empresa.com.br"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Foto do Usuário</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden border-2 border-dashed border-gray-200">
                    {formData.photoURL ? (
                      <img src={formData.photoURL} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 500000) { // 500KB limit
                            alert("A imagem é muito grande. Por favor, escolha uma imagem menor que 500KB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({...formData, photoURL: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-bordeaux/10 file:text-bordeaux hover:file:bg-bordeaux/20 cursor-pointer"
                    />
                    <p className="text-[10px] text-gray-400 italic">Formatos aceitos: PNG, JPG. Máximo 500KB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ou URL da Foto</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
                  value={formData.photoURL} 
                  onChange={e => setFormData({...formData, photoURL: e.target.value})} 
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Senha (Simulação)</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required={!editingUser}
                  placeholder={editingUser ? "Deixe em branco para manter" : "Defina uma senha"}
                />
              </div>

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
                    <option value="Gestor">Gestor</option>
                    <option value="Operacional">Operacional</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Motorista">Motorista</option>
                    <option value="Cliente">Cliente</option>
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

              {formData.role === 'Cliente' && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vincular ao Cliente</label>
                  <select 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bordeaux focus:border-transparent outline-none transition-all"
                    value={formData.customerId || ''} 
                    onChange={e => setFormData({...formData, customerId: e.target.value})} 
                    required
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name} ({client.cnpj})</option>
                    ))}
                  </select>
                </div>
              )}

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
