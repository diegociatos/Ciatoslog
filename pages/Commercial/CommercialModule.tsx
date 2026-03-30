
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, ChevronRight, CheckCircle2, AlertCircle,
  MapPin, X, Users, Package, ShieldAlert, MapPinned, Layers, FileSearch,
  Paperclip, Trash2, Eye, FileUp, ArrowUpRight, DollarSign, AlertTriangle,
  Receipt, FileCheck, TrendingUp, MinusCircle, Truck, Calendar, Layout,
  Copy, ArrowRightLeft, Sparkles, History, Navigation, Trophy, UserCheck,
  Building2, UserPlus
} from 'lucide-react';
import { Load, Client, LoadStatus, Driver, useCompany, PricingConfig, User } from '../../App';

interface CommercialModuleProps {
  loads: Load[];
  addLoad: (newLoad: Omit<Load, 'id' | 'date' | 'ownerId'>) => void;
  updateLoad: (updatedLoad: Load) => void;
  deleteLoad: (loadId: string) => void;
  clients: Client[];
  drivers: Driver[];
  users: User[];
  goToProgramming: () => void;
  goToClients: () => void;
  pricingConfigs: PricingConfig[];
  currentUser: User;
}

type MainTab = 'Minhas Cargas' | 'Kanban';
type FormTab = 'Cliente' | 'Endereços' | 'Carga' | 'Precificação' | 'Financeiro';

interface ExtraExpense {
  id: string;
  description: string;
  value: number;
}

const SOUTH_SOUTHEAST_EXCEPT_ES = ['PR', 'SC', 'RS', 'SP', 'RJ', 'MG'];
const NORTH_NORTHEAST_MIDWEST_ES = ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO', 'AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE', 'DF', 'GO', 'MT', 'MS', 'ES'];

const ICMS_MATRIX: { [key: string]: { [key: string]: number } } = {
  'AC': { 'AC': 19, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'AL': { 'AC': 12, 'AL': 19, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'AM': { 'AC': 12, 'AL': 12, 'AM': 20, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'AP': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 18, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'BA': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 20.5, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'CE': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 20, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'DF': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 20, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'ES': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 17, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'GO': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 19, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'MA': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 22, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'MT': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 17, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'MS': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 17, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'MG': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 18, 'PA': 7, 'PB': 7, 'PR': 12, 'PE': 7, 'PI': 7, 'RN': 7, 'RS': 12, 'RJ': 12, 'RO': 7, 'RR': 7, 'SC': 12, 'SP': 7, 'SE': 7, 'TO': 7, 'IM': 4 },
  'PA': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 19, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'PB': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 20, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'PR': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 7, 'PA': 7, 'PB': 7, 'PR': 19.5, 'PE': 7, 'PI': 7, 'RN': 7, 'RS': 12, 'RJ': 12, 'RO': 7, 'RR': 7, 'SC': 12, 'SP': 7, 'SE': 7, 'TO': 7, 'IM': 4 },
  'PE': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 20.5, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'PI': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 22.5, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'RN': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 18, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'RS': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 7, 'PA': 7, 'PB': 7, 'PR': 12, 'PE': 7, 'PI': 7, 'RN': 7, 'RS': 17, 'RJ': 12, 'RO': 7, 'RR': 7, 'SC': 12, 'SP': 7, 'SE': 7, 'TO': 7, 'IM': 4 },
  'RJ': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 7, 'PA': 7, 'PB': 7, 'PR': 12, 'PE': 7, 'PI': 7, 'RN': 7, 'RS': 12, 'RJ': 20, 'RO': 7, 'RR': 7, 'SC': 12, 'SP': 7, 'SE': 7, 'TO': 7, 'IM': 4 },
  'RO': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 19.5, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'RR': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 20, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 12, 'IM': 4 },
  'SC': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 7, 'PA': 7, 'PB': 7, 'PR': 12, 'PE': 7, 'PI': 7, 'RN': 7, 'RS': 12, 'RJ': 12, 'RO': 7, 'RR': 7, 'SC': 17, 'SP': 7, 'SE': 7, 'TO': 7, 'IM': 4 },
  'SP': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 7, 'PA': 7, 'PB': 7, 'PR': 12, 'PE': 7, 'PI': 7, 'RN': 7, 'RS': 12, 'RJ': 12, 'RO': 7, 'RR': 7, 'SC': 12, 'SP': 18, 'SE': 7, 'TO': 7, 'IM': 4 },
  'SE': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 19, 'TO': 12, 'IM': 4 },
  'TO': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 12, 'PA': 12, 'PB': 12, 'PR': 12, 'PE': 12, 'PI': 12, 'RN': 12, 'RS': 12, 'RJ': 12, 'RO': 12, 'RR': 12, 'SC': 12, 'SP': 12, 'SE': 12, 'TO': 20, 'IM': 4 }
};

const calculateICMS = (origin: string, destination: string, companyId: string, pricingConfigs: PricingConfig[]): number => {
  if (!origin || !destination) return 12;

  // Regra BD: Se origem é MG, usa o percentual configurado na precificação (Simples Nacional)
  if (companyId === 'BD' && origin === 'MG') {
    const config = pricingConfigs.find(c => c.ownerId === 'BD');
    return config ? config.icms : 12;
  }

  // Caso contrário, usa a matriz
  return ICMS_MATRIX[origin]?.[destination] || 12;
};

const fetchAddressByZip = async (zip: string, setFormData: React.Dispatch<React.SetStateAction<any>>, type: 'origin' | 'destination') => {
    const cleanZip = zip.replace(/\D/g, '');
    if (cleanZip.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            street: data.logradouro,
            city: data.localidade,
            state: data.uf
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

const CommercialModule: React.FC<CommercialModuleProps> = ({ 
  loads, addLoad, updateLoad, deleteLoad, clients, drivers, users, goToProgramming, goToClients, pricingConfigs, currentUser 
}) => {
  const { getCompanyBadge } = useCompany();
  const [activeTab, setActiveTab] = useState<MainTab>('Kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<FormTab>('Cliente');
  const [draggedLoadId, setDraggedLoadId] = useState<string | null>(null);
  const [lostReasonModal, setLostReasonModal] = useState<{ isOpen: boolean; loadId: string; reason: string }>({ isOpen: false, loadId: '', reason: '' });
  
  // Menu de ações
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Form States
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingLoadId, setEditingLoadId] = useState<string | null>(null);

  const programmers = useMemo(() => {
    return users.filter(u => u.role === 'Operacional' || u.role === 'Administrador');
  }, [users]);

  const [formData, setFormData] = useState({
    status: 'PROSPECTO' as LoadStatus,
    collectionDate: '',
    commercialNotes: '',
    origin: { name: '', cnpj: '', street: '', number: '', neighborhood: '', city: '', state: '', zip: '', contact: '', phone: '' },
    destination: { name: '', cnpj: '', street: '', number: '', neighborhood: '', city: '', state: '', zip: '', contact: '', phone: '' },
    cargo: { type: 'Carga Geral', loadType: 'Dedicada' as 'Fracionada' | 'Dedicada', weight: '', volume: '', qty: '', value: '', insuranceType: 'RCTR-C', policy: '', insuredValue: '', insuranceCost: 0 },
    pricing: {
      programmingNumber: `LOG ${String(loads.length + 1).padStart(3, '0')}`,
      freightAgreed: 0,
      freightConditions: 'frete+icms+seguro' as 'frete+icms+seguro' | 'frete+icms' | 'frete+seguro',
      merchandiseValue: 0,
      icmsValue: 0,
      issqnValue: 0,
      tollValue: 0,
      insuranceValue: 0,
      clientRecoversICMS: false,
      icmsDeferred: false,
      noInsurance: false,
      driverCost: 0
    },
    finance: { 
      freightBruto: 0, taxPercent: 5, driverFreight: 0, driverType: 'PF' as 'PF' | 'PJ',
      selectedDriverId: '', acceptsRetention: true, retentionPercent: 11.65, advance: 0, extraExpenses: [] as ExtraExpense[]
    },
    assignedProgrammer: 'Setor'
  });

  const { activeCompany } = useCompany();

  const dynamicICMS = useMemo(() => {
    return calculateICMS(formData.origin.state, formData.destination.state, activeCompany, pricingConfigs);
  }, [formData.origin.state, formData.destination.state, activeCompany, pricingConfigs]);

  const columns: { id: LoadStatus; label: string; color: string }[] = [
    { id: 'PROSPECTO', label: 'PROSPECÇÃO', color: 'border-gray-300' },
    { id: 'PROPOSTA_APRESENTADA', label: 'PROPOSTA APRESENTADA', color: 'border-blue-300' },
    { id: 'NEGOCIACAO', label: 'NEGOCIAÇÃO', color: 'border-amber-400' },
    { id: 'DOCUMENTACAO', label: 'AGUARDANDO DOCUMENTAÇÃO', color: 'border-blue-400' },
    { id: 'PRONTO_PROGRAMAR', label: 'PRONTO PARA PROGRAMAR', color: 'border-emerald-400' },
    { id: 'AGUARDANDO PROGRAMAÇÃO', label: 'AGUARDANDO PROGRAMAÇÃO', color: 'border-purple-400' },
    { id: 'EM_PROGRAMACAO', label: 'EM PROGRAMAÇÃO', color: 'border-indigo-400' },
    { id: 'EM TRÂNSITO', label: 'EM TRÂNSITO', color: 'border-blue-600' },
    { id: 'ENTREGUE', label: 'FINALIZADA / ENTREGUE', color: 'border-gray-400' },
    { id: 'PERDIDO', label: 'PERDIDO', color: 'border-red-400' },
  ];

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLoadId(id);
    e.dataTransfer.setData('loadId', id);
  };

  const onDrop = (e: React.DragEvent, newStatus: LoadStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('loadId');
    const loadToUpdate = loads.find(l => l.id === id);
    if (loadToUpdate && loadToUpdate.status !== newStatus) {
      if (newStatus === 'PERDIDO') {
        setLostReasonModal({ isOpen: true, loadId: id, reason: '' });
      } else {
        updateLoad({ ...loadToUpdate, status: newStatus });
      }
    }
  };

  const pricingAnalysis = useMemo(() => {
    const config = pricingConfigs.find(c => c.ownerId === (activeCompany === 'GLOBAL' ? 'LOG' : activeCompany));
    if (!config) return null;

    const { freightAgreed, merchandiseValue, tollValue, driverCost, noInsurance } = formData.pricing;
    const insuranceValue = noInsurance ? 0 : merchandiseValue * ((config.insurancePercentage || 0) / 100);
    
    // ICMS calculation
    const icmsRate = calculateICMS(formData.origin.state, formData.destination.state, activeCompany, pricingConfigs);
    let icmsValue = (freightAgreed * (icmsRate / 100));
    if (formData.pricing.clientRecoversICMS) icmsValue = 0; // If client recovers, it's not a cost
    if (formData.pricing.icmsDeferred) icmsValue = 0; // If deferred, it's zero

    // ISSQN (percentage of sales value)
    const issqnValue = (freightAgreed * 0.05); // Assuming 5% for now

    const totalCost = (driverCost || 0) + (tollValue || 0) + insuranceValue + icmsValue + issqnValue;
    const viability = freightAgreed - totalCost;

    const totalPercentage = (config.federalTaxes || 0) + 
                            (config.directCost || 0) + 
                            (config.expenses || 0) + 
                            (config.minProfit || 0);
    
    let minSellingPrice = 0;
    if (totalPercentage < 100) {
      minSellingPrice = totalCost / (1 - totalPercentage / 100);
    }

    const isDriverCostWithinMeta = freightAgreed > 0 ? (driverCost / freightAgreed) <= 0.6 : false;

    return { 
      viability, 
      minSellingPrice, 
      totalCost, 
      insuranceValue, 
      icmsValue, 
      issqnValue, 
      insurancePercentage: config.insurancePercentage || 0,
      isDriverCostWithinMeta 
    };
  }, [formData.pricing, activeCompany, pricingConfigs, formData.origin.state, formData.destination.state]);

  const handleLostReasonSubmit = () => {
    const loadToUpdate = loads.find(l => l.id === lostReasonModal.loadId);
    if (loadToUpdate) {
      updateLoad({ ...loadToUpdate, status: 'PERDIDO', lostReason: lostReasonModal.reason, lostBy: 'Comercial' });
    }
    setLostReasonModal({ isOpen: false, loadId: '', reason: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    // Calcular o preço mínimo sugerido antes de salvar
    const despesasExtrasTotal = formData.finance.extraExpenses.reduce((acc, curr) => acc + curr.value, 0);
    const companyToUse = activeCompany === 'GLOBAL' ? 'LOG' : activeCompany;
    const config = pricingConfigs.find(c => c.ownerId === companyToUse);
    
    let minSellingPrice = 0;
    if (config && formData.finance.driverFreight > 0) {
      const totalPercentage = (config.federalTaxes || 0) + 
                              (dynamicICMS || 0) + 
                              (config.directCost || 0) + 
                              (config.expenses || 0) + 
                              (config.minProfit || 0);
      
      if (totalPercentage < 100) {
        const costBase = formData.finance.driverFreight + despesasExtrasTotal;
        minSellingPrice = costBase / (1 - totalPercentage / 100);
      }
    }

    // Validar se o frete bruto é menor que o preço mínimo sugerido (apenas se não for prospecto)
    if (formData.status !== 'PROSPECTO' && minSellingPrice > 0 && formData.finance.freightBruto < minSellingPrice) {
      alert(`O frete bruto (${formData.finance.freightBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) não pode ser menor que o preço mínimo sugerido (${minSellingPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}).`);
      return;
    }

    const selectedDriver = drivers.find(d => d.id === formData.finance.selectedDriverId);
    const existing = editingLoadId ? loads.find(l => l.id === editingLoadId) : null;
    
    const payload: Omit<Load, 'id' | 'ownerId' | 'date'> = {
      customer: selectedClient.name,
      value: formData.finance.freightBruto,
      cost: formData.finance.driverFreight + despesasExtrasTotal,
      provisionalDriverCost: formData.finance.driverFreight,
      capturingCommercialUserId: currentUser.id,
      isDriverCostEffective: false,
      origin: `${formData.origin.city}/${formData.origin.state}`,
      destination: `${formData.destination.city}/${formData.destination.state}`,
      originAddress: `${formData.origin.street}, ${formData.origin.number} - ${formData.origin.neighborhood}`,
      destinationAddress: `${formData.destination.street}, ${formData.destination.number} - ${formData.destination.neighborhood}`,
      vehicleTypeRequired: selectedDriver?.vehicleType || 'Truck',
      commercialRep: selectedClient.commercialRep,
      assignedProgrammer: formData.assignedProgrammer,
      driverId: selectedDriver?.id,
      driver: selectedDriver?.name,
      plate: selectedDriver?.plate,
      loadType: formData.cargo.loadType,
      status: formData.status,
      collectionDate: formData.collectionDate,
      commercialNotes: formData.commercialNotes,
      merchandise: formData.cargo.type,
      weight: Number(formData.cargo.weight),
      volume: Number(formData.cargo.volume),
      targetDriverFreight: formData.finance.driverFreight,
      otherCosts: despesasExtrasTotal,
      proposalNumber: (formData.status === 'PROPOSTA_APRESENTADA' || formData.status === 'AGUARDANDO PROGRAMAÇÃO') && !existing?.proposalNumber
        ? `PROP-${Math.floor(1000 + Math.random() * 9000)}`
        : existing?.proposalNumber,
      internalNumber: (formData.status === 'AGUARDANDO PROGRAMAÇÃO' || formData.status === 'EM_PROGRAMACAO') && !existing?.internalNumber
        ? `${activeCompany === 'GLOBAL' ? 'LOG' : activeCompany}-${Math.floor(100 + Math.random() * 900)}`
        : existing?.internalNumber
    };

    if (existing) {
      updateLoad({ ...existing, ...payload });
    } else {
      addLoad(payload);
    }
    setShowForm(false);
    
    // Se o comercial definiu que ele mesmo vai programar, redireciona para a aba de programação
    if (formData.assignedProgrammer === 'Comercial' && formData.status === 'AGUARDANDO PROGRAMAÇÃO') {
      goToProgramming();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-10" style={{ fontFamily: 'Book Antiqua, serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Comercial & Operacional</h2>
          <p className="text-gray-500 italic">Gestão multi-empresa: <span className="text-bordeaux font-black">{activeCompany}</span></p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={goToClients}
            className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 hover:scale-105 transition-all text-xs uppercase tracking-widest"
          >
            <UserPlus size={16} />
            Novo Lead
          </button>
          <button onClick={() => setShowForm(true)} className="bg-bordeaux text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-bordeaux/20 hover:scale-105 transition-all flex items-center gap-3 uppercase tracking-widest text-xs">
            <Plus size={20} /> Nova Carga
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 bg-white rounded-t-3xl shadow-sm px-6 justify-between items-center">
        <div className="flex">
          {(['Minhas Cargas', 'Kanban'] as MainTab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-5 font-black text-xs uppercase tracking-widest transition-all border-b-4 ${activeTab === tab ? 'border-bordeaux text-bordeaux bg-bordeaux/5' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>
        {(activeTab === 'Minhas Cargas' || activeTab === 'Kanban') && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar cliente, origem, CTE..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-bordeaux/20 outline-none transition-all"
            />
          </div>
        )}
      </div>

      <div className="bg-[#F9F9F9] rounded-b-3xl shadow-sm border border-gray-100 min-h-[700px] overflow-hidden p-6">
        {activeTab === 'Kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4 h-full scrollbar-thin scrollbar-thumb-bordeaux/20">
            {columns.map(col => {
              const columnLoads = loads.filter(l => 
                l.status === col.id && 
                (l.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 l.origin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 l.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 (l.cteNumber && l.cteNumber.includes(searchTerm)))
              );
              return (
                <div key={col.id} className="flex flex-col min-w-[300px] w-[300px] bg-gray-50 rounded-3xl border border-gray-200" onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, col.id)}>
                  <div className="bg-bordeaux text-white p-4 rounded-t-3xl flex justify-between items-center shadow-md">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">{col.label}</h4>
                    <span className="text-xs font-black">{columnLoads.length}</span>
                  </div>
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[600px]">
                    {columnLoads.map(load => (
                      <div key={load.id} draggable onDragStart={e => onDragStart(e, load.id)} className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 ${col.color} hover:shadow-xl transition-all cursor-grab active:cursor-grabbing`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-bordeaux opacity-50 uppercase">#{load.id} {getCompanyBadge(load.ownerId)}</span>
                          <button className="p-1 text-gray-300 hover:text-bordeaux"><MoreVertical size={16}/></button>
                        </div>
                        <h5 className="font-black text-gray-800 text-sm leading-tight mb-2">{load.customer}</h5>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold mb-3 italic">
                           <MapPin size={10} className="text-bordeaux"/> {load.origin.split('/')[0]} <ChevronRight size={8}/> {load.destination.split('/')[0]}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                           <p className="text-xs font-black text-gray-800">{load.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                           <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-bordeaux/5 text-bordeaux">{load.loadType || 'Dedicada'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeTab === 'Minhas Cargas' ? (
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Emissão</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente / ID</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trajeto (Origem → Destino)</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Bruto</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loads.filter(l => 
                    l.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    l.origin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    l.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (l.cteNumber && l.cteNumber.includes(searchTerm))
                  ).length > 0 ? (
                    loads.filter(l => 
                      l.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      l.origin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      l.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (l.cteNumber && l.cteNumber.includes(searchTerm))
                    ).map((load) => (
                      <tr key={load.id} className="hover:bg-bordeaux/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-gray-700">{new Date(load.date).toLocaleDateString('pt-BR')}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">#{load.id}</span>
                            {load.cteNumber && <span className="text-[9px] font-bold text-bordeaux uppercase tracking-tighter">CTE: {load.cteNumber}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-gray-800 group-hover:text-bordeaux transition-colors">{load.customer}</span>
                              {getCompanyBadge(load.ownerId)}
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{load.loadType || 'Dedicada'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-gray-700">{load.origin.split('/')[0]}</span>
                              <span className="text-[8px] font-bold text-gray-400 uppercase">{load.origin.split('/')[1]}</span>
                            </div>
                            <ArrowRightLeft size={12} className="text-bordeaux opacity-30" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-gray-700">{load.destination.split('/')[0]}</span>
                              <span className="text-[8px] font-bold text-gray-400 uppercase">{load.destination.split('/')[1]}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-black text-emerald-600">
                            {load.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            load.status === 'NEGOCIACAO' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            load.status === 'DOCUMENTACAO' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            load.status === 'PRONTO_PROGRAMAR' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            load.status === 'AGUARDANDO PROGRAMAÇÃO' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                            load.status === 'EM TRÂNSITO' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                            load.status === 'ENTREGUE' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                            'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            {load.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 text-gray-300 hover:text-bordeaux hover:bg-bordeaux/5 rounded-xl transition-all">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <Package size={48} className="text-bordeaux" />
                          <p className="text-sm font-black uppercase tracking-widest text-bordeaux">Nenhuma carga encontrada</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[500px] text-gray-300 italic font-bold">Módulo em desenvolvimento...</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-bordeaux text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Formalização de Nova Carga</h3>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Módulo Comercial & Operacional</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-100 bg-gray-50/50 px-8">
              {(['Cliente', 'Endereços', 'Carga', 'Precificação', 'Financeiro'] as FormTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFormTab(tab)}
                  className={`px-8 py-5 font-black text-[10px] uppercase tracking-widest transition-all border-b-4 ${
                    activeFormTab === tab
                      ? 'border-bordeaux text-bordeaux bg-white'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 bg-white">
              {activeFormTab === 'Cliente' && (
                <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Users size={14} className="text-bordeaux" /> Selecionar Cliente CRM
                      </label>
                      <select
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl font-black text-gray-700 focus:ring-2 focus:ring-bordeaux/20 outline-none transition-all"
                        value={selectedClient?.id || ''}
                        onChange={(e) => setSelectedClient(clients.find((c) => c.id === e.target.value) || null)}
                      >
                        <option value="">Buscar no CRM...</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {getCompanyBadge(c.ownerId) ? `(${c.ownerId})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedClient && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Status da Carga */}
                      <div className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 space-y-6">
                        <h4 className="text-xs font-black text-bordeaux uppercase tracking-widest border-b border-bordeaux/10 pb-3">Status da Carga</h4>
                        <div className="space-y-4">
                          <select
                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-3xl font-black text-gray-700 focus:ring-2 focus:ring-bordeaux/20 outline-none transition-all"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as LoadStatus })}
                          >
                            <option value="PROSPECTO">PROSPECÇÃO (Apenas Prospecto)</option>
                            <option value="PROPOSTA_APRESENTADA">PROPOSTA APRESENTADA</option>
                            <option value="NEGOCIACAO">NEGOCIAÇÃO</option>
                            <option value="DOCUMENTACAO">AGUARDANDO DOCUMENTAÇÃO</option>
                            <option value="PRONTO_PROGRAMAR">PRONTO PARA PROGRAMAR</option>
                            <option value="AGUARDANDO PROGRAMAÇÃO">AGUARDANDO PROGRAMAÇÃO</option>
                          </select>
                          <p className="text-[9px] font-bold text-gray-400 uppercase italic">
                            {formData.status === 'PROSPECTO' ? 'A carga ficará na coluna de prospecção no Kanban.' : 
                             formData.status === 'PROPOSTA_APRESENTADA' ? 'Gera número de proposta automaticamente.' :
                             formData.status === 'AGUARDANDO PROGRAMAÇÃO' ? 'A carga será enviada para o setor de programação.' : ''}
                          </p>
                        </div>

                        {/* Atribuição de Programador */}
                        {(formData.status === 'PRONTO_PROGRAMAR' || formData.status === 'AGUARDANDO PROGRAMAÇÃO') && (
                          <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Atribuir Programador</h4>
                            <select
                              className="w-full px-6 py-4 bg-white border border-gray-100 rounded-3xl font-black text-gray-700 focus:ring-2 focus:ring-bordeaux/20 outline-none transition-all"
                              value={formData.assignedProgrammer || 'Setor'}
                              onChange={(e) => setFormData({ ...formData, assignedProgrammer: e.target.value })}
                            >
                              <option value="Setor">SETOR (Aparece para todos)</option>
                              <option value="Comercial">COMERCIAL (Eu mesmo programo)</option>
                              {programmers.map(p => (
                                <option key={p.id} value={p.name}>{p.name.toUpperCase()}</option>
                              ))}
                            </select>
                            <p className="text-[9px] font-bold text-gray-400 uppercase italic">
                              {formData.assignedProgrammer === 'Setor' ? 'A carga ficará disponível para qualquer programador assumir.' : 
                               formData.assignedProgrammer === 'Comercial' ? 'A carga ficará na sua fila de programação.' : 
                               `A carga será direcionada especificamente para ${formData.assignedProgrammer}.`}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Dados Fiscais */}
                      <div className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 space-y-6">
                        <h4 className="text-xs font-black text-bordeaux uppercase tracking-widest border-b border-bordeaux/10 pb-3">Dados Fiscais</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-gray-400 uppercase">CNPJ</p>
                            <p className="font-black text-sm text-gray-700">{selectedClient.cnpj}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Inscrição Estadual</p>
                            <p className="font-black text-sm text-gray-700">{selectedClient.stateRegistration || 'ISENTO'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Regime Tributário</p>
                            <p className="font-black text-sm text-gray-700">{selectedClient.taxRegime}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Contribuinte ICMS</p>
                            <p className="font-black text-sm text-gray-700">{selectedClient.icmsContributor}</p>
                          </div>
                        </div>
                      </div>

                      {/* Dados de Cobrança */}
                      <div className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 space-y-6">
                        <h4 className="text-xs font-black text-bordeaux uppercase tracking-widest border-b border-bordeaux/10 pb-3">Dados de Cobrança</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-xl shadow-sm"><Receipt size={16} className="text-bordeaux" /></div>
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase">Responsável Financeiro</p>
                              <p className="font-black text-sm text-gray-700">{selectedClient.financeContact || 'Não informado'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-xl shadow-sm"><AlertCircle size={16} className="text-bordeaux" /></div>
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase">E-mail Financeiro</p>
                              <p className="font-black text-sm text-gray-700">{selectedClient.financeEmail || 'Não informado'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-xl shadow-sm"><Truck size={16} className="text-bordeaux" /></div>
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase">Telefone Financeiro</p>
                              <p className="font-black text-sm text-gray-700">{selectedClient.financePhone || 'Não informado'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeFormTab === 'Endereços' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-right-4 duration-300">
                  {/* Remetente */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-bordeaux/10 p-2 rounded-xl"><ArrowUpRight size={18} className="text-bordeaux" /></div>
                      <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">Remetente (Origem)</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <input
                          placeholder="Nome / Razão Social"
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                          value={formData.origin.name}
                          onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, name: e.target.value } })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            placeholder="CNPJ / CPF"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                            value={formData.origin.cnpj}
                            onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, cnpj: e.target.value } })}
                          />
                          <input
                            placeholder="Telefone"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                            value={formData.origin.phone}
                            onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, phone: e.target.value } })}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <input
                            placeholder="CEP"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm col-span-1"
                            value={formData.origin.zip}
                            onChange={(e) => {
                              const newZip = e.target.value;
                              setFormData({ ...formData, origin: { ...formData.origin, zip: newZip } });
                              fetchAddressByZip(newZip, setFormData, 'origin');
                            }}
                          />
                          <input
                            placeholder="Logradouro"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm col-span-2"
                            value={formData.origin.street}
                            onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, street: e.target.value } })}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <input
                            placeholder="Número"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                            value={formData.origin.number}
                            onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, number: e.target.value } })}
                          />
                          <input
                            placeholder="Cidade"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                            value={formData.origin.city}
                            onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, city: e.target.value } })}
                          />
                          <input
                            placeholder="UF"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm uppercase"
                            maxLength={2}
                            value={formData.origin.state}
                            onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, state: e.target.value.toUpperCase() } })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Destinatário */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-bordeaux/10 p-2 rounded-xl"><ArrowUpRight size={18} className="text-bordeaux rotate-90" /></div>
                      <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">Destinatário (Destino)</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <input
                          placeholder="Nome / Razão Social"
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                          value={formData.destination.name}
                          onChange={(e) => setFormData({ ...formData, destination: { ...formData.destination, name: e.target.value } })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            placeholder="CNPJ / CPF"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                            value={formData.destination.cnpj}
                            onChange={(e) => setFormData({ ...formData, destination: { ...formData.destination, cnpj: e.target.value } })}
                          />
                          <input
                            placeholder="Telefone"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                            value={formData.destination.phone}
                            onChange={(e) => setFormData({ ...formData, destination: { ...formData.destination, phone: e.target.value } })}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <input
                            placeholder="CEP"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm col-span-1"
                            value={formData.destination.zip}
                            onChange={(e) => {
                              const newZip = e.target.value;
                              setFormData({ ...formData, destination: { ...formData.destination, zip: newZip } });
                              fetchAddressByZip(newZip, setFormData, 'destination');
                            }}
                          />
                          <input
                            placeholder="Logradouro"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm col-span-2"
                            value={formData.destination.street}
                            onChange={(e) => setFormData({ ...formData, destination: { ...formData.destination, street: e.target.value } })}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <input
                            placeholder="Número"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                            value={formData.destination.number}
                            onChange={(e) => setFormData({ ...formData, destination: { ...formData.destination, number: e.target.value } })}
                          />
                          <input
                            placeholder="Cidade"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                            value={formData.destination.city}
                            onChange={(e) => setFormData({ ...formData, destination: { ...formData.destination, city: e.target.value } })}
                          />
                          <input
                            placeholder="UF"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm uppercase"
                            maxLength={2}
                            value={formData.destination.state}
                            onChange={(e) => setFormData({ ...formData, destination: { ...formData.destination, state: e.target.value.toUpperCase() } })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'Carga' && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Especificações */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-bordeaux/10 p-2 rounded-xl"><Package size={18} className="text-bordeaux" /></div>
                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">Especificações da Mercadoria</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data da Coleta</label>
                            <input
                              type="date"
                              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                              value={formData.collectionDate}
                              onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Mercadoria</label>
                            <select 
                              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-bordeaux/20"
                              value={formData.cargo.type}
                              onChange={(e) => setFormData({ ...formData, cargo: { ...formData.cargo, type: e.target.value } })}
                            >
                              <option value="Carga Geral">Carga Geral</option>
                              <option value="Alimentos">Alimentos</option>
                              <option value="Eletrônicos">Eletrônicos</option>
                              <option value="Químicos">Químicos</option>
                              <option value="Maquinário">Maquinário</option>
                              <option value="Construção">Construção</option>
                              <option value="Outros">Outros</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Volumes</label>
                            <input
                              type="number"
                              placeholder="Ex: 10"
                              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                              value={formData.cargo.qty}
                              onChange={(e) => setFormData({ ...formData, cargo: { ...formData.cargo, qty: e.target.value } })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Peso Total (kg)</label>
                            <input
                              type="number"
                              placeholder="Ex: 1500"
                              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                              value={formData.cargo.weight}
                              onChange={(e) => setFormData({ ...formData, cargo: { ...formData.cargo, weight: e.target.value } })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cubagem (m³)</label>
                            <input
                              type="number"
                              placeholder="Ex: 4.5"
                              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                              value={formData.cargo.volume}
                              onChange={(e) => setFormData({ ...formData, cargo: { ...formData.cargo, volume: e.target.value } })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor da NF (R$)</label>
                            <input
                              type="number"
                              placeholder="Ex: 50000"
                              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                              value={formData.cargo.value}
                              onChange={(e) => setFormData({ ...formData, cargo: { ...formData.cargo, value: e.target.value } })}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações Comerciais</label>
                          <textarea
                            placeholder="Observações sobre a coleta, entrega ou particularidades da carga..."
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm h-24 resize-none"
                            value={formData.commercialNotes}
                            onChange={(e) => setFormData({ ...formData, commercialNotes: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Operação e Seguro */}
                    <div className="space-y-8">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-bordeaux/10 p-2 rounded-xl"><Truck size={18} className="text-bordeaux" /></div>
                          <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">Operação Logística</h4>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Operação</label>
                          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
                            <button 
                              onClick={() => setFormData({ ...formData, cargo: { ...formData.cargo, loadType: 'Dedicada' } })}
                              className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.cargo.loadType === 'Dedicada' ? 'bg-white text-bordeaux shadow-sm' : 'text-gray-400'}`}
                            >
                              Dedicada
                            </button>
                            <button 
                              onClick={() => setFormData({ ...formData, cargo: { ...formData.cargo, loadType: 'Fracionada' } })}
                              className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.cargo.loadType === 'Fracionada' ? 'bg-white text-bordeaux shadow-sm' : 'text-gray-400'}`}
                            >
                              Fracionada
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-bordeaux/10 p-2 rounded-xl"><ShieldAlert size={18} className="text-bordeaux" /></div>
                          <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">Seguro da Carga</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Apólice</label>
                            <select 
                              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-bordeaux/20"
                              value={formData.cargo.insuranceType}
                              onChange={(e) => setFormData({ ...formData, cargo: { ...formData.cargo, insuranceType: e.target.value } })}
                            >
                              <option value="RCTR-C">RCTR-C (Acidentes)</option>
                              <option value="RCF-DC">RCF-DC (Roubo/Desvio)</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Número da Apólice</label>
                              <input
                                placeholder="Nº Apólice"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                                value={formData.cargo.policy}
                                onChange={(e) => setFormData({ ...formData, cargo: { ...formData.cargo, policy: e.target.value } })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor Segurado (LMG)</label>
                              <input
                                type="number"
                                placeholder="LMG (R$)"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                                value={formData.cargo.insuredValue}
                                onChange={(e) => setFormData({ ...formData, cargo: { ...formData.cargo, insuredValue: e.target.value } })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'Precificação' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Número da Programação</label>
                      <input
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                        value={formData.pricing.programmingNumber || ''}
                        readOnly
                        placeholder="Gerado automaticamente"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Empresa de Processamento</label>
                      <select
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                        value={activeCompany}
                        onChange={(e) => {
                          // This would require a way to update the active company context
                          // For now, we assume the user can select for comparison
                        }}
                      >
                        <option value="CIATOSLOG">Ciatoslog</option>
                        <option value="BD">BD</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor da Mercadoria (R$)</label>
                      <input
                        type="number"
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                        value={formData.pricing.merchandiseValue || ''}
                        onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, merchandiseValue: Number(e.target.value) } })}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pedágio (R$)</label>
                      <input
                        type="number"
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                        value={formData.pricing.tollValue || ''}
                        onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, tollValue: Number(e.target.value) } })}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Custo Carreteiro (R$)</label>
                      <input
                        type="number"
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                        value={formData.pricing.driverCost || ''}
                        onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, driverCost: Number(e.target.value) } })}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Condições do Frete</label>
                      <select
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                        value={formData.pricing.freightConditions}
                        onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, freightConditions: e.target.value as any } })}
                      >
                        <option value="frete+icms+seguro">Frete + ICMS + Seguro</option>
                        <option value="frete+icms">Frete + ICMS</option>
                        <option value="frete+seguro">Frete + Seguro</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.pricing.noInsurance}
                          onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, noInsurance: e.target.checked } })}
                        />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente possui seguro próprio</span>
                      </label>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.pricing.clientRecoversICMS}
                          onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, clientRecoversICMS: e.target.checked } })}
                        />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente recupera ICMS</span>
                      </label>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.pricing.icmsDeferred}
                          onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, icmsDeferred: e.target.checked } })}
                        />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ICMS Diferido</span>
                      </label>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Frete Acordado (R$)</label>
                      <input
                        type="number"
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm"
                        value={formData.pricing.freightAgreed || ''}
                        onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, freightAgreed: Number(e.target.value) } })}
                      />
                    </div>
                  </div>
                  
                  {pricingAnalysis && (
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Análise de Viabilidade</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="p-4 bg-white rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Viabilidade</p>
                          <p className={`text-lg font-black ${pricingAnalysis.viability >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {pricingAnalysis.viability.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Preço Mínimo Sugerido</p>
                          <p className="text-lg font-black text-bordeaux">
                            {pricingAnalysis.minSellingPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Seguro ({pricingAnalysis.insurancePercentage}%)</p>
                          <p className="text-lg font-black text-gray-800">
                            {pricingAnalysis.insuranceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-bold text-gray-400 uppercase">ICMS</p>
                          <p className="text-lg font-black text-gray-800">
                            {pricingAnalysis.icmsValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Meta Carreteiro (60%)</p>
                          <p className={`text-lg font-black ${pricingAnalysis.isDriverCostWithinMeta ? 'text-emerald-600' : 'text-red-600'}`}>
                            {pricingAnalysis.isDriverCostWithinMeta ? 'Dentro' : 'Fora'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeFormTab === 'Financeiro' && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Coluna 1: Receita e Custo */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Receita */}
                        <div className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100 space-y-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-emerald-100 p-2 rounded-xl"><DollarSign size={18} className="text-emerald-600" /></div>
                            <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">Receita (Agenciamento)</h4>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Frete Bruto (R$)</label>
                              <input
                                type="number"
                                placeholder="0,00"
                                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl font-black text-sm text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                value={formData.finance.freightBruto || ''}
                                onChange={(e) => setFormData({ ...formData, finance: { ...formData.finance, freightBruto: Number(e.target.value) } })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Impostos (%)</label>
                              <input
                                type="number"
                                placeholder="5"
                                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl font-black text-sm"
                                value={formData.finance.taxPercent || ''}
                                onChange={(e) => setFormData({ ...formData, finance: { ...formData.finance, taxPercent: Number(e.target.value) } })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ICMS Automático (%)</label>
                              <div className="w-full px-5 py-3.5 bg-gray-100 border border-gray-200 rounded-2xl font-black text-sm text-gray-500 flex items-center justify-between">
                                <span>{dynamicICMS}%</span>
                                <span className="text-[8px] font-bold opacity-50 italic">Regra Origem/Destino</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Custo Motorista - Only for non-Comercial */}
                        {currentUser.role !== 'Comercial' && (
                          <div className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-bordeaux/10 p-2 rounded-xl"><Truck size={18} className="text-bordeaux" /></div>
                              <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">Custo Motorista</h4>
                            </div>
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Frete Motorista (Provisório) (R$)</label>
                                <input
                                  type="number"
                                  placeholder="0,00"
                                  className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl font-black text-sm text-bordeaux focus:ring-2 focus:ring-bordeaux/20 outline-none"
                                  value={formData.finance.driverFreight || ''}
                                  onChange={(e) => setFormData({ ...formData, finance: { ...formData.finance, driverFreight: Number(e.target.value) } })}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo</label>
                                  <select 
                                    className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-2xl font-black text-xs"
                                    value={formData.finance.driverType}
                                    onChange={(e) => setFormData({ ...formData, finance: { ...formData.finance, driverType: e.target.value as 'PF' | 'PJ' } })}
                                  >
                                    <option value="PF">Pessoa Física</option>
                                    <option value="PJ">Pessoa Jurídica</option>
                                  </select>
                                </div>
                                {formData.finance.driverType === 'PF' && (
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Retenção (%)</label>
                                    <input
                                      type="number"
                                      className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-2xl font-black text-xs"
                                      value={formData.finance.retentionPercent || ''}
                                      onChange={(e) => setFormData({ ...formData, finance: { ...formData.finance, retentionPercent: Number(e.target.value) } })}
                                    />
                                  </div>
                                )}
                              </div>
                              {formData.finance.driverType === 'PF' && (
                                <label className="flex items-center gap-3 cursor-pointer group">
                                  <div className="relative">
                                    <input 
                                      type="checkbox" 
                                      className="sr-only" 
                                      checked={formData.finance.acceptsRetention}
                                      onChange={(e) => setFormData({ ...formData, finance: { ...formData.finance, acceptsRetention: e.target.checked } })}
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${formData.finance.acceptsRetention ? 'bg-bordeaux' : 'bg-gray-200'}`}></div>
                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${formData.finance.acceptsRetention ? 'translate-x-5' : ''}`}></div>
                                  </div>
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-bordeaux transition-colors">Aplicar Retenção</span>
                                </label>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Despesas Extras - Only for non-Comercial */}
                      {currentUser.role !== 'Comercial' && (
                        <div className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 space-y-6">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="bg-amber-100 p-2 rounded-xl"><Plus size={18} className="text-amber-600" /></div>
                              <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">Despesas Extras (Pedágio, Balsa, etc)</h4>
                            </div>
                            <button 
                              onClick={() => {
                                const newExpense: ExtraExpense = { id: Math.random().toString(36).substr(2, 9), description: '', value: 0 };
                                setFormData({ ...formData, finance: { ...formData.finance, extraExpenses: [...formData.finance.extraExpenses, newExpense] } });
                              }}
                              className="bg-bordeaux text-white p-2 rounded-xl hover:scale-110 transition-all shadow-lg shadow-bordeaux/20"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {formData.finance.extraExpenses.map((expense, idx) => (
                              <div key={expense.id} className="flex gap-4 animate-in slide-in-from-top-2">
                                <input
                                  placeholder="Descrição da despesa..."
                                  className="flex-1 px-5 py-3 bg-white border border-gray-100 rounded-2xl font-black text-xs"
                                  value={expense.description}
                                  onChange={(e) => {
                                    const newList = [...formData.finance.extraExpenses];
                                    newList[idx].description = e.target.value;
                                    setFormData({ ...formData, finance: { ...formData.finance, extraExpenses: newList } });
                                  }}
                                />
                                <input
                                  type="number"
                                  placeholder="Valor (R$)"
                                  className="w-32 px-5 py-3 bg-white border border-gray-100 rounded-2xl font-black text-xs"
                                  value={expense.value || ''}
                                  onChange={(e) => {
                                    const newList = [...formData.finance.extraExpenses];
                                    newList[idx].value = Number(e.target.value);
                                    setFormData({ ...formData, finance: { ...formData.finance, extraExpenses: newList } });
                                  }}
                                />
                                <button 
                                  onClick={() => {
                                    const newList = formData.finance.extraExpenses.filter((_, i) => i !== idx);
                                    setFormData({ ...formData, finance: { ...formData.finance, extraExpenses: newList } });
                                  }}
                                  className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ))}
                            {formData.finance.extraExpenses.length === 0 && (
                              <p className="text-center py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Nenhuma despesa extra adicionada</p>
                            )}
                          </div>
                        </div>
                      )}

                      </div>
                    
                    {/* Coluna 2: Resumo e Indicadores */}
                    <div className="space-y-6">
                      <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl space-y-8 sticky top-0">
                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-4">Resumo Financeiro</h4>
                        
                        {/* Cálculos */}
                        {(() => {
                          const impostoValor = (formData.finance.freightBruto * (formData.finance.taxPercent / 100));
                          const retencaoValor = (formData.finance.driverType === 'PF' && formData.finance.acceptsRetention) 
                            ? (formData.finance.driverFreight * (formData.finance.retentionPercent / 100)) 
                            : 0;
                          const despesasExtrasTotal = formData.finance.extraExpenses.reduce((acc, curr) => acc + curr.value, 0);
                          const custoTotal = formData.finance.driverFreight + impostoValor + retencaoValor + despesasExtrasTotal;
                          const bonusIndex = formData.finance.freightBruto > 0 ? (custoTotal / formData.finance.freightBruto) * 100 : 0;
                          const margemLiquida = formData.finance.freightBruto - custoTotal;

                          // Cálculo do preço mínimo sugerido baseado nas configurações de precificação
                          const companyToUse = activeCompany === 'GLOBAL' ? 'LOG' : activeCompany;
                          const config = pricingConfigs.find(c => c.ownerId === companyToUse);
                          
                          let minSellingPrice = 0;
                          if (config && formData.finance.driverFreight > 0) {
                            const totalPercentage = (config.federalTaxes || 0) + 
                                                    (config.icms || 0) + 
                                                    (config.directCost || 0) + 
                                                    (config.expenses || 0) + 
                                                    (config.minProfit || 0);
                            
                            if (totalPercentage < 100) {
                              const costBase = formData.finance.driverFreight + despesasExtrasTotal;
                              minSellingPrice = costBase / (1 - totalPercentage / 100);
                            }
                          }

                          return (
                            <div className="space-y-6">
                              <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                  <span>Frete Bruto</span>
                                  <span className="text-gray-800">{formData.finance.freightBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                  <span>Impostos ({formData.finance.taxPercent}%)</span>
                                  <span className="text-red-400">- {impostoValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                                {currentUser.role !== 'Comercial' && (
                                  <>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                      <span>Frete Motorista</span>
                                      <span className="text-red-400">- {formData.finance.driverFreight.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                    </div>
                                    {retencaoValor > 0 && (
                                      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                        <span>Retenção ({formData.finance.retentionPercent}%)</span>
                                        <span className="text-red-400">- {retencaoValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                      <span>Despesas Extras</span>
                                      <span className="text-red-400">- {despesasExtrasTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                    </div>
                                    {minSellingPrice > 0 && (
                                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-1">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Preço Mínimo Sugerido</p>
                                        <p className="text-lg font-black text-emerald-700">
                                          {minSellingPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                        <p className="text-[8px] font-bold text-emerald-500 uppercase italic leading-tight">
                                          Valor calculado para cobrir impostos, custos e margem mínima.
                                        </p>
                                      </div>
                                    )}
                                    <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                                      <span className="text-xs font-black text-gray-800 uppercase">Margem Líquida</span>
                                      <span className={`text-lg font-black ${margemLiquida >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {margemLiquida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>

                              {currentUser.role !== 'Comercial' && (
                                /* Card de Bonificação */
                                <div className={`p-6 rounded-3xl border-2 transition-all ${bonusIndex <= 60 && bonusIndex > 0 ? 'border-emerald-500 bg-emerald-50/30' : 'border-amber-500 bg-amber-50/30'}`}>
                                  <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Índice de Bonificação</p>
                                      <h5 className="text-3xl font-black text-gray-800">{bonusIndex.toFixed(1)}%</h5>
                                    </div>
                                    <div className={`p-2 rounded-xl ${bonusIndex <= 60 && bonusIndex > 0 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                      <Trophy size={20} />
                                    </div>
                                  </div>
                                  {bonusIndex <= 60 && bonusIndex > 0 ? (
                                    <div className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1.5 rounded-full w-fit">
                                      <Sparkles size={12} />
                                      <span className="text-[9px] font-black uppercase tracking-widest">Dentro da Meta</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-full w-fit">
                                      <AlertTriangle size={12} />
                                      <span className="text-[9px] font-black uppercase tracking-widest">Revisar Margem</span>
                                    </div>
                                  )}
                                  <p className="mt-4 text-[9px] font-bold text-gray-400 uppercase leading-relaxed italic">
                                    O bônus comercial é calculado sobre a eficiência da negociação entre frete bruto e custo total.
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <div className="flex gap-2">
                {activeFormTab !== 'Cliente' && (
                  <button
                    onClick={() => {
                      const tabs: FormTab[] = ['Cliente', 'Endereços', 'Carga', 'Financeiro'];
                      const idx = tabs.indexOf(activeFormTab);
                      setActiveFormTab(tabs[idx - 1]);
                    }}
                    className="px-8 py-3.5 font-black text-gray-400 uppercase text-xs hover:text-bordeaux transition-colors"
                  >
                    Voltar
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowForm(false)} className="px-8 py-3.5 font-black text-gray-400 uppercase text-xs">Cancelar</button>
                {activeFormTab !== 'Financeiro' ? (
                  <button
                    onClick={() => {
                      const tabs: FormTab[] = ['Cliente', 'Endereços', 'Carga', 'Financeiro'];
                      const idx = tabs.indexOf(activeFormTab);
                      setActiveFormTab(tabs[idx + 1]);
                    }}
                    className="px-12 py-3.5 bg-bordeaux text-white font-black rounded-2xl shadow-xl uppercase text-xs hover:scale-105 transition-all"
                  >
                    Próximo Passo
                  </button>
                ) : (
                  <button onClick={handleSubmit} className="px-12 py-3.5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl uppercase text-xs hover:scale-105 transition-all">
                    Efetivar Carga
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Motivo de Perda */}
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
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Por que essa proposta foi perdida?</label>
                <textarea
                  value={lostReasonModal.reason}
                  onChange={(e) => setLostReasonModal({ ...lostReasonModal, reason: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all resize-none h-32"
                  placeholder="Ex: Preço alto, cliente fechou com concorrente, etc..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setLostReasonModal({ isOpen: false, loadId: '', reason: '' })}
                  className="px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLostReasonSubmit}
                  disabled={!lostReasonModal.reason.trim()}
                  className="px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default CommercialModule;
