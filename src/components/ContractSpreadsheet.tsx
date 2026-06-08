import React, { useState, useMemo } from 'react';
import { Contract, CategoriaContrato, CriticidadeContrato, StatusContrato } from '../types';
import { Search, Plus, Filter, AlertTriangle, Trash2, Edit3, X, FileSpreadsheet, CreditCard, Landmark, Percent, Calendar, Activity, ExternalLink, FileText, CheckCircle2, Coins, Users, ShieldAlert, Award, ArrowUpDown } from 'lucide-react';

interface ContractSpreadsheetProps {
  contracts: Contract[];
  selectedContract: Contract | null;
  onSelectContract: (contract: Contract) => void;
  onAddContract: (contract: Contract) => void;
  onUpdateContract: (contract: Contract) => void;
  onDeleteContract: (contractId: string) => void;
  onResetData: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onTriggerLogin: () => void;
  isDarkMode?: boolean;
  activeKpiFilter?: 'alertas' | 'desperdicio' | 'aproveitamento' | 'custo' | null;
  onChangeKpiFilter?: (filter: 'alertas' | 'desperdicio' | 'aproveitamento' | 'custo' | null) => void;
}

export default function ContractSpreadsheet({
  contracts,
  selectedContract,
  onSelectContract,
  onAddContract,
  onUpdateContract,
  onDeleteContract,
  onResetData,
  isLoggedIn,
  isAdmin,
  onTriggerLogin,
  isDarkMode = true,
  activeKpiFilter = null,
  onChangeKpiFilter
}: ContractSpreadsheetProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoriaContrato | 'Todas'>('Todas');
  const [criticalityFilter, setCriticalityFilter] = useState<CriticidadeContrato | 'Todas'>('Todas');

  // Sorting state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Modals / Form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailContract, setDetailContract] = useState<Contract | null>(null);

  // Form states for creating/editing contracts
  const [formName, setFormName] = useState('');
  const [formProvider, setFormProvider] = useState('');
  const [formCategory, setFormCategory] = useState<CategoriaContrato>('SaaS');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<StatusContrato>('Ativo');
  const [formMonthlyValue, setFormMonthlyValue] = useState(0);
  const [formExtraMonthlySpent, setFormExtraMonthlySpent] = useState(0);
  const [formCurrency, setFormCurrency] = useState('BRL');
  const [formLicensedSeats, setFormLicensedSeats] = useState(1);
  const [formActiveSeats, setFormActiveSeats] = useState(1);
  const [formExcessCost, setFormExcessCost] = useState(0);
  const [formSponsor, setFormSponsor] = useState('');
  const [formSponsorEmail, setFormSponsorEmail] = useState('');
  const [formAdminPanelLink, setFormAdminPanelLink] = useState('');
  const [formCriticality, setFormCriticality] = useState<CriticidadeContrato>('Média');
  const [formLink, setFormLink] = useState('');
  const [formNotes, setFormNotes] = useState('');
  
  // New billing/installments fields
  const [formPaymentFrequency, setFormPaymentFrequency] = useState<'Mensal' | 'Integral' | 'Parcelado'>('Mensal');
  const [formInstallmentsCount, setFormInstallmentsCount] = useState<number>(12);
  const [formPaymentMethod, setFormPaymentMethod] = useState<'Faturamento' | 'Cartão de Crédito'>('Faturamento');
  const [formCardHolder, setFormCardHolder] = useState<string>('');

  const openAddModal = () => {
    if (isLoggedIn && !isAdmin) {
      setErrorMessage("Sua conta possui perfil somente de leitura para os contratos da nuvem. Para adicionar novos contratos, solicite permissão editorial ao administrador do sistema (origemdodia@gmail.com).");
      return;
    }
    setFormName('');
    setFormProvider('');
    setFormCategory('SaaS');
    setFormStartDate('2026-01-01');
    setFormEndDate('2027-01-01');
    setFormStatus('Ativo');
    setFormMonthlyValue(5000);
    setFormExtraMonthlySpent(0);
    setFormCurrency('BRL');
    setFormLicensedSeats(50);
    setFormActiveSeats(45);
    setFormExcessCost(120);
    setFormSponsor('');
    setFormSponsorEmail('');
    setFormAdminPanelLink('');
    setFormCriticality('Média');
    setFormLink('');
    setFormNotes('');
    setFormPaymentFrequency('Mensal');
    setFormInstallmentsCount(12);
    setFormPaymentMethod('Faturamento');
    setFormCardHolder('');
    setIsAddOpen(true);
  };

  const openEditModal = (contract: Contract) => {
    if (isLoggedIn && !isAdmin) {
      setErrorMessage("Sua conta possui perfil somente de leitura para os contratos da nuvem. Para editar valores, datas ou faturamentos deste contrato, solicite permissão editorial ao administrador do sistema (origemdodia@gmail.com).");
      return;
    }
    setEditingContract(contract);
    setFormName(contract.name);
    setFormProvider(contract.provider);
    setFormCategory(contract.category);
    setFormStartDate(contract.startDate);
    setFormEndDate(contract.endDate);
    setFormStatus(contract.status);
    setFormMonthlyValue(contract.monthlyValue);
    setFormExtraMonthlySpent(contract.extraMonthlySpent || 0);
    setFormCurrency(contract.currency || 'BRL');
    setFormLicensedSeats(contract.licensedSeats);
    setFormActiveSeats(contract.activeSeats);
    setFormExcessCost(contract.excessLicenseCost);
    setFormSponsor(contract.sponsor);
    setFormSponsorEmail(contract.sponsorEmail || '');
    setFormAdminPanelLink(contract.adminPanelLink || '');
    setFormCriticality(contract.criticality);
    setFormLink(contract.contractLink);
    setFormNotes(contract.negotiationNotes);
    
    // load extra fields
    setFormPaymentFrequency(contract.paymentFrequency || 'Mensal');
    setFormInstallmentsCount(contract.installmentsCount || 12);
    setFormPaymentMethod(contract.paymentMethod || 'Faturamento');
    setFormCardHolder(contract.cardHolder || '');
    setIsEditOpen(true);
  };

  // Auxiliar robusto para gerar parcelas de forma organizada e cronológica real
  const generateDynamicInstallments = (
    start: string,
    end: string,
    frequency: 'Mensal' | 'Integral' | 'Parcelado',
    installmentsCount: number,
    monthlyVal: number
  ) => {
    const startDateStr = start || '2026-01-01';
    const endDateStr = end || '2027-01-01';
    const annualVal = monthlyVal * 12;

    const getSafeDateString = (baseDateStr: string, monthsToAdd: number): string => {
      try {
        const parts = baseDateStr.split('-');
        if (parts.length < 3) return baseDateStr;
        const year = parseInt(parts[0], 10);
        const monthIndex = parseInt(parts[1], 10) - 1; // 0-indexed
        const day = parseInt(parts[2], 10);

        const targetMonthTotal = monthIndex + monthsToAdd;
        const targetYear = year + Math.floor(targetMonthTotal / 12);
        const targetMonthIndex = (targetMonthTotal % 12 + 12) % 12;

        // Limita o dia ao número real de dias daquele mês específico do ano
        const daysInTargetMonth = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
        const actualDay = Math.min(day, daysInTargetMonth);

        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${targetYear}-${pad(targetMonthIndex + 1)}-${pad(actualDay)}`;
      } catch (err) {
        return baseDateStr;
      }
    };

    const getStatus = (dueDateStr: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dueDate = new Date(dueDateStr);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < -3) {
        return 'Paga' as const;
      } else if (diffDays >= -3 && diffDays <= 15) {
        return 'Próxima ao Vencimento' as const;
      } else {
        return 'Em aberto' as const;
      }
    };

    if (frequency === 'Integral') {
      return [
        { id: 'PARC-01', dueDate: endDateStr, value: annualVal, status: getStatus(endDateStr) }
      ];
    } else if (frequency === 'Parcelado') {
      const count = Number(installmentsCount) || 12;
      return Array.from({ length: count }).map((_, idx) => {
        const padNum = (idx + 1).toString().padStart(2, '0');
        const dStr = getSafeDateString(startDateStr, idx);
        return {
          id: `PARC-${padNum}`,
          dueDate: dStr,
          value: Number((annualVal / count).toFixed(2)),
          status: getStatus(dStr)
        };
      });
    } else {
      // Faturamento Mensal real baseado nas datas de Início e de Fim do contrato
      let totalMonths = 12;
      try {
        const startParts = startDateStr.split('-');
        const endParts = endDateStr.split('-');
        if (startParts.length === 3 && endParts.length === 3) {
          const startYr = parseInt(startParts[0], 10);
          const startM = parseInt(startParts[1], 10);
          const endYr = parseInt(endParts[0], 10);
          const endM = parseInt(endParts[1], 10);
          const calculated = (endYr - startYr) * 12 + (endM - startM);
          if (calculated > 0) {
            totalMonths = calculated;
          }
        }
      } catch (e) {
        totalMonths = 12;
      }

      // Previne overflow de memória se inserido data arbitrária demais
      totalMonths = Math.min(Math.max(1, totalMonths), 60);

      return Array.from({ length: totalMonths }).map((_, idx) => {
        const padNum = (idx + 1).toString().padStart(2, '0');
        const dStr = getSafeDateString(startDateStr, idx);
        return {
          id: `PARC-${padNum}`,
          dueDate: dStr,
          value: Number(monthlyVal) || 0,
          status: getStatus(dStr)
        };
      });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const annualVal = formMonthlyValue * 12;

    const calculatedInstallments = generateDynamicInstallments(
      formStartDate,
      formEndDate,
      formPaymentFrequency,
      formInstallmentsCount,
      formMonthlyValue
    );

    // Geração sequencial de ID do contrato baseada na lista real dos contratos existentes
    let maxSeq = 5;
    contracts.forEach(c => {
      if (c.id && c.id.startsWith('CONTR-')) {
        const parts = c.id.split('-');
        const lastPart = parts[parts.length - 1];
        const num = parseInt(lastPart, 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });
    const nextSeqStr = (maxSeq + 1).toString().padStart(3, '0');
    const seqContractId = `CONTR-2026-${nextSeqStr}`;

    const newContractObj: Contract = {
      id: seqContractId,
      name: formName || 'Novo Serviço',
      provider: formProvider || 'Provedor Geral',
      category: formCategory,
      startDate: formStartDate || '2026-01-01',
      endDate: formEndDate || '2027-01-01',
      status: formStatus,
      monthlyValue: Number(formMonthlyValue) || 0,
      extraMonthlySpent: Number(formExtraMonthlySpent) || 0,
      annualValue: annualVal,
      currency: formCurrency,
      licensedSeats: Number(formLicensedSeats) || 1,
      activeSeats: Number(formActiveSeats) || 0,
      excessLicenseCost: Number(formExcessCost) || 0,
      sponsor: formSponsor || 'Sponsor Indefinido',
      sponsorEmail: formSponsorEmail || '',
      adminPanelLink: formAdminPanelLink || '',
      criticality: formCriticality,
      contractLink: formLink || 'https://exemplo-infra.com/contracts/github_enterprise_contract_2026.pdf',
      negotiationNotes: formNotes || '',
      historicCosts: [
        { month: 'Mar', value: Number(formMonthlyValue) },
        { month: 'Abr', value: Number(formMonthlyValue) },
        { month: 'Mai', value: Number(formMonthlyValue) }
      ],
      projectionRenewal: 6,
      paymentFrequency: formPaymentFrequency,
      installmentsCount: formPaymentFrequency === 'Parcelado' ? Number(formInstallmentsCount) : undefined,
      paymentMethod: formPaymentMethod,
      cardHolder: formPaymentMethod === 'Cartão de Crédito' ? formCardHolder : undefined,
      installments: calculatedInstallments
    };

    onAddContract(newContractObj);
    setIsAddOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;
    const annualVal = formMonthlyValue * 12;

    let updatedInsts = editingContract.installments || [];
    if (
      editingContract.paymentFrequency !== formPaymentFrequency || 
      editingContract.installmentsCount !== formInstallmentsCount || 
      editingContract.monthlyValue !== formMonthlyValue ||
      editingContract.startDate !== formStartDate ||
      editingContract.endDate !== formEndDate
    ) {
      updatedInsts = generateDynamicInstallments(
        formStartDate,
        formEndDate,
        formPaymentFrequency,
        formInstallmentsCount,
        formMonthlyValue
      );
    }

    const updatedObj: Contract = {
      ...editingContract,
      name: formName,
      provider: formProvider,
      category: formCategory,
      startDate: formStartDate,
      endDate: formEndDate,
      status: formStatus,
      monthlyValue: Number(formMonthlyValue) || 0,
      extraMonthlySpent: Number(formExtraMonthlySpent) || 0,
      annualValue: annualVal,
      currency: formCurrency,
      licensedSeats: Number(formLicensedSeats) || 0,
      activeSeats: Number(formActiveSeats) || 0,
      excessLicenseCost: Number(formExcessCost) || 0,
      sponsor: formSponsor,
      sponsorEmail: formSponsorEmail,
      adminPanelLink: formAdminPanelLink,
      criticality: formCriticality,
      contractLink: formLink,
      negotiationNotes: formNotes,
      paymentFrequency: formPaymentFrequency,
      installmentsCount: formPaymentFrequency === 'Parcelado' ? Number(formInstallmentsCount) : undefined,
      paymentMethod: formPaymentMethod,
      cardHolder: formPaymentMethod === 'Cartão de Crédito' ? formCardHolder : undefined,
      installments: updatedInsts
    };
    onUpdateContract(updatedObj);
    if (detailContract && detailContract.id === updatedObj.id) {
      setDetailContract(updatedObj);
    }
    setIsEditOpen(false);
  };

  // Filter logic
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sponsor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.sponsorEmail && c.sponsorEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.cardHolder && c.cardHolder.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'Todas' || c.category === categoryFilter;
    const matchesCriticality = criticalityFilter === 'Todas' || c.criticality === criticalityFilter;

    let matchesKpi = true;
    if (activeKpiFilter === 'alertas') {
      matchesKpi = c.status === 'Próximo do Vencimento';
    } else if (activeKpiFilter === 'desperdicio') {
      matchesKpi = c.licensedSeats > 0 && c.activeSeats < c.licensedSeats;
    } else if (activeKpiFilter === 'aproveitamento') {
      matchesKpi = c.category === 'SaaS' && c.licensedSeats > 5;
    } else if (activeKpiFilter === 'custo') {
      // Show currently active contracts that generate monthly / annual costs
      matchesKpi = c.status !== 'Expirado';
    }

    return matchesSearch && matchesCategory && matchesCriticality && matchesKpi;
  });

  // Sorting logic based on selected column
  const sortedContracts = useMemo(() => {
    if (!sortField) return filteredContracts;

    return [...filteredContracts].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'id') {
        valA = a.id;
        valB = b.id;
      } else if (sortField === 'name_provider') {
        valA = `${a.name} ${a.provider}`.toLowerCase();
        valB = `${b.name} ${b.provider}`.toLowerCase();
      } else if (sortField === 'category') {
        valA = a.category;
        valB = b.category;
      } else if (sortField === 'criticality') {
        const order: Record<string, number> = { 'Baixa': 0, 'Média': 1, 'Alta': 2, 'Crítica': 3 };
        valA = order[a.criticality] ?? 0;
        valB = order[b.criticality] ?? 0;
      } else if (sortField === 'status') {
        const order: Record<string, number> = { 'Expirado': 0, 'Próximo do Vencimento': 1, 'Ativo': 2 };
        valA = order[a.status] ?? 0;
        valB = order[b.status] ?? 0;
      } else if (sortField === 'endDate') {
        valA = a.endDate;
        valB = b.endDate;
      } else if (sortField === 'payment_installments') {
        const aTotal = a.installments?.length || 0;
        const bTotal = b.installments?.length || 0;
        valA = a.paymentFrequency + String(aTotal);
        valB = b.paymentFrequency + String(bTotal);
      } else if (sortField === 'monthlyValue') {
        valA = a.monthlyValue;
        valB = b.monthlyValue;
      } else if (sortField === 'extraMonthlySpent') {
        valA = a.extraMonthlySpent || 0;
        valB = b.extraMonthlySpent || 0;
      } else if (sortField === 'annualValue') {
        valA = a.annualValue;
        valB = b.annualValue;
      } else if (sortField === 'paymentMethod') {
        valA = a.paymentMethod;
        valB = b.paymentMethod;
      } else if (sortField === 'license_seats') {
        valA = a.licensedSeats > 0 ? (a.activeSeats / a.licensedSeats) : 0;
        valB = b.licensedSeats > 0 ? (b.activeSeats / b.licensedSeats) : 0;
      } else if (sortField === 'idle_seats') {
        valA = Math.max(0, a.licensedSeats - a.activeSeats);
        valB = Math.max(0, b.licensedSeats - b.activeSeats);
      } else if (sortField === 'sponsor') {
        valA = a.sponsor;
        valB = b.sponsor;
      } else {
        valA = a[sortField as keyof Contract];
        valB = b[sortField as keyof Contract];
      }

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredContracts, sortField, sortDirection]);

  return (
    <div className={`w-full border rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6 transition-all ${
      isDarkMode 
        ? 'bg-slate-900/40 border-slate-800/80 text-slate-100' 
        : 'bg-white border-slate-205 text-slate-900'
    }`}>
      
      {/* Search and Filters Strip */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, ID, provedor ou responsável cartão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 transition-all font-sans ${
                isDarkMode 
                  ? 'bg-slate-950/60 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm'
              }`}
            />
          </div>

          {/* Category selection */}
          <div className={`flex items-center space-x-2 border rounded-xl px-3 py-1.5 transition-colors ${
            isDarkMode ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-300 shadow-sm'
          }`}>
            <Filter className="h-4 w-4 text-cyan-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoriaContrato | 'Todas')}
              className={`bg-transparent text-xs focus:outline-none w-full cursor-pointer font-semibold font-sans ${
                isDarkMode ? 'text-slate-300' : 'text-slate-750'
              }`}
            >
              <option value="Todas" className={isDarkMode ? "bg-slate-900" : "bg-white text-slate-900"}>Todas Categorias</option>
              <option value="SaaS" className={isDarkMode ? "bg-slate-900" : "bg-white text-slate-900"}>SaaS (Software como Serviço)</option>
              <option value="Infra" className={isDarkMode ? "bg-slate-900" : "bg-white text-slate-900"}>Infra (Nuvem, Servidores)</option>
              <option value="Suporte" className={isDarkMode ? "bg-slate-900" : "bg-white text-slate-900"}>Suporte técnico</option>
              <option value="Assinatura de IA" className={isDarkMode ? "bg-slate-900" : "bg-white text-slate-900"}>Assinatura de IA</option>
            </select>
          </div>

          {/* Criticality selection */}
          <div className={`flex items-center space-x-2 border rounded-xl px-3 py-1.5 transition-colors ${
            isDarkMode ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-300 shadow-sm'
          }`}>
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <select
              value={criticalityFilter}
              onChange={(e) => setCriticalityFilter(e.target.value as CriticidadeContrato | 'Todas')}
              className={`bg-transparent text-xs focus:outline-none w-full cursor-pointer font-semibold font-sans ${
                isDarkMode ? 'text-slate-300' : 'text-slate-750'
              }`}
            >
              <option value="Todas" className={isDarkMode ? "bg-slate-900" : "bg-white text-slate-900"}>Todas Criticidades</option>
              <option value="Crítica" className={isDarkMode ? "bg-slate-900" : "bg-white text-slate-900"}>Crítica</option>
              <option value="Alta" className={isDarkMode ? "bg-slate-900" : "bg-white text-slate-900"}>Alta</option>
              <option value="Média" className={isDarkMode ? "bg-slate-900" : "bg-white text-slate-900"}>Média</option>
              <option value="Baixa" className={isDarkMode ? "bg-slate-900" : "bg-white text-slate-900"}>Baixa</option>
            </select>
          </div>
        </div>

        {/* Action Button Group - Note: Reset Button is completely removed here as requested */}
        <div className="flex space-x-2 shrink-0 items-center">
          <button
            id="btn-adicionar-contrato"
            onClick={openAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold font-sans tracking-wide shadow-lg hover:shadow-cyan-500/20 transition-all border border-cyan-500/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Contrato</span>
          </button>
        </div>
      </div>

      {/* KPI Active Filter Notification Box */}
      {activeKpiFilter && (
        <div className={`p-3.5 rounded-xl text-xs flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between font-sans shadow-md border ${
          isDarkMode 
            ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-200' 
            : 'bg-cyan-50 border-cyan-250 text-cyan-800'
        }`}>
          <div className="flex items-center space-x-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span>
              Filtro ativo por KPI: <strong className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{
                activeKpiFilter === 'alertas' ? 'Alertas de Vencimento (Pronto para renovação / renegociação)' :
                activeKpiFilter === 'desperdicio' ? 'Margem de Desperdício (Licenças contratadas x ativas)' :
                activeKpiFilter === 'aproveitamento' ? 'Minimização de Ociosidade em SaaS Globais' :
                'Custo Mensal Ativo Corporativo'
              }</strong>. Exibindo apenas atendimentos que correspondem a essa métrica.
            </span>
          </div>
          <button
            id="btn-limpar-kpi-filter"
            onClick={() => onChangeKpiFilter?.(null)}
            className={`p-1.5 px-3 leading-none rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-850/50' 
                : 'bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-800 border border-cyan-200/50'
            }`}
          >
            Ver Todos Contratos
          </button>
        </div>
      )}

      {/* Spreadsheet / Table Container - Font size is slightly increased using text-[13.5px] as requested */}
      <div className={`overflow-x-auto rounded-xl border transition-colors ${
        isDarkMode 
          ? 'border-slate-800/60 bg-slate-950/20' 
          : 'border-slate-300 bg-slate-50/50 shadow-inner'
      }`}>
        <table id="tabela-contratos" className="w-full min-w-[1250px] text-left border-collapse font-sans">
          <thead>
            <tr className={`border-b font-semibold text-[11px] uppercase tracking-wider font-mono transition-colors ${
              isDarkMode 
                ? 'border-slate-800 bg-slate-950/70 text-slate-400' 
                : 'border-slate-300 bg-slate-150/90 text-slate-650'
            }`}>
              {/* Column: ID */}
              <th 
                onClick={() => handleSort('id')} 
                title="Clique para ordenar por Código / ID"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Código / ID</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'id' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: Nome do Serviço / Provedor */}
              <th 
                onClick={() => handleSort('name_provider')} 
                title="Clique para ordenar por Nome / Provedor"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Nome do Serviço / Provedor</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'name_provider' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: Categoria */}
              <th 
                onClick={() => handleSort('category')} 
                title="Clique para ordenar por Categoria"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Categoria</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'category' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: Criticidade */}
              <th 
                onClick={() => handleSort('criticality')} 
                title="Clique para ordenar por Criticidade"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Criticidade</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'criticality' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: Status */}
              <th 
                onClick={() => handleSort('status')} 
                title="Clique para ordenar por Status"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group text-center"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span>Status</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'status' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: Vencimento */}
              <th 
                onClick={() => handleSort('endDate')} 
                title="Clique para ordenar por Data de Vencimento"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Vencimento</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'endDate' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: Faturamento / Parcelas */}
              <th 
                onClick={() => handleSort('payment_installments')} 
                title="Clique para ordenar por Faturamento / Parcelas"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group text-center"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span>Faturamento / Parcelas</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'payment_installments' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: R$ Mensal */}
              <th 
                onClick={() => handleSort('monthlyValue')} 
                title="Clique para ordenar por Custo Mensal"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group text-right"
              >
                <div className="flex items-center justify-end space-x-1.5">
                  <span>R$ Mensal</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'monthlyValue' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: R$ Consumo Extra */}
              <th 
                onClick={() => handleSort('extraMonthlySpent')} 
                title="Clique para ordenar por Consumo Extra (IA/Uso)"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group text-right text-amber-550 dark:text-amber-400"
              >
                <div className="flex items-center justify-end space-x-1.5">
                  <span>R$ Consumo Extra (IA/Uso)</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'extraMonthlySpent' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: R$ Anual */}
              <th 
                onClick={() => handleSort('annualValue')} 
                title="Clique para ordenar por Custo Anual"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group text-right"
              >
                <div className="flex items-center justify-end space-x-1.5">
                  <span>R$ Anual</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'annualValue' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: Método / Cartão */}
              <th 
                onClick={() => handleSort('paymentMethod')} 
                title="Clique para ordenar por Método de Pagamento"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group text-center"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span>Método / Cartão</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'paymentMethod' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: Licenças (Uso) */}
              <th 
                onClick={() => handleSort('license_seats')} 
                title="Clique para ordenar por Taxa de Uso de Licenças"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group text-center"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span>Licenças (Uso)</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'license_seats' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: Licenças Ociosas */}
              <th 
                onClick={() => handleSort('idle_seats')} 
                title="Clique para ordenar por Licenças Ociosas"
                className="py-3 px-4 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group text-center text-rose-500 dark:text-rose-400"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span>Licenças Ociosas</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'idle_seats' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: Sponsor */}
              <th 
                onClick={() => handleSort('sponsor')} 
                title="Clique para ordenar por Sponsor Responsável"
                className="py-3 px-3 cursor-pointer hover:bg-slate-500/10 transition-colors select-none group"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Sponsor</span>
                  <ArrowUpDown className={`h-3 w-3 shrink-0 transition-opacity ${sortField === 'sponsor' ? 'text-cyan-500 opacity-100' : 'opacity-0 group-hover:opacity-60 text-slate-400'}`} />
                </div>
              </th>

              {/* Column: Ações (Non-sortable) */}
              <th className="py-3 px-4 text-center select-none text-slate-400">Ações</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-[13px] transition-colors ${
            isDarkMode 
              ? 'divide-slate-800/70 text-slate-300' 
              : 'divide-slate-300 text-slate-800'
          }`}>
            {sortedContracts.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-12 text-center text-slate-500 font-sans">
                  <div className="flex flex-col items-center space-y-2">
                    <FileSpreadsheet className="h-8 w-8 text-slate-400" />
                    <p>Nenhum contrato encontrado correspondente aos filtros.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedContracts.map((contract) => {
                const isSelected = selectedContract?.id === contract.id;
                
                // Expiry colors
                let statusBadge;
                if (contract.status === 'Ativo') {
                  statusBadge = (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold select-none ${
                      isDarkMode 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm'
                    }`}>
                      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ativo
                    </span>
                  );
                } else if (contract.status === 'Próximo do Vencimento') {
                  statusBadge = (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold select-none ${
                      isDarkMode 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-amber-50 text-amber-800 border border-amber-300 shadow-sm'
                    }`}>
                      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500/80 animate-pulse" />
                      Atenção
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold select-none ${
                      isDarkMode 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : 'bg-rose-50 text-rose-750 border border-rose-300 shadow-sm'
                    }`}>
                      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500" />
                      Expirado
                    </span>
                  );
                }

                // Criticality badge colors
                let criticalityTag;
                if (contract.criticality === 'Crítica') {
                  criticalityTag = (
                    <span className={`inline-block px-1.5 py-0.5 text-[9.5px] rounded font-bold uppercase tracking-wider ${
                      isDarkMode ? 'bg-rose-500/15 text-rose-400 border border-rose-505/20' : 'bg-rose-50 text-rose-750 border border-rose-250 shadow-xs'
                    }`}>Crítica</span>
                  );
                } else if (contract.criticality === 'Alta') {
                  criticalityTag = (
                    <span className={`inline-block px-1.5 py-0.5 text-[9.5px] rounded font-bold uppercase tracking-wider ${
                      isDarkMode ? 'bg-orange-500/15 text-orange-400 border border-orange-505/20' : 'bg-orange-50 text-orange-750 border border-orange-250 shadow-xs'
                    }`}>Alta</span>
                  );
                } else if (contract.criticality === 'Média') {
                  criticalityTag = (
                    <span className={`inline-block px-1.5 py-0.5 text-[9.5px] rounded font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'bg-amber-500/15 text-amber-400 border border-amber-505/20' : 'bg-amber-50 text-amber-800 border border-amber-250 shadow-xs'
                    }`}>Média</span>
                  );
                } else {
                  criticalityTag = (
                    <span className={`inline-block px-1.5 py-0.5 text-[9.5px] rounded font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600 border border-slate-205'
                    }`}>Baixa</span>
                  );
                }

                const idleSeats = Math.max(0, contract.licensedSeats - contract.activeSeats);
                const idlePct = contract.licensedSeats > 0 ? (idleSeats / contract.licensedSeats) * 100 : 0;
                const idleColor = idleSeats > 20 
                  ? 'text-rose-500 font-bold' 
                  : idleSeats > 0 
                    ? isDarkMode ? 'text-amber-400 font-semibold' : 'text-amber-600 font-semibold'
                    : 'text-slate-400';

                return (
                  <tr
                    key={contract.id}
                    onClick={() => {
                      onSelectContract(contract);
                    }}
                    onDoubleClick={() => {
                      setDetailContract(contract);
                      setIsDetailOpen(true);
                    }}
                    title="Ficha do Contrato: 1 clique para selecionar na planilha • Duplo clique para abrir detalhes completos"
                    className={`cursor-pointer transition-all hover:scale-[1.002] ${
                      isDarkMode 
                        ? isSelected 
                          ? 'bg-cyan-500/10 border-l-2 border-cyan-500 text-white font-medium' 
                          : 'hover:bg-slate-800/40 text-slate-300'
                        : isSelected 
                          ? 'bg-cyan-50/70 border-l-2 border-cyan-600 text-slate-950 font-semibold shadow-sm' 
                          : 'hover:bg-slate-100/70 bg-white text-slate-800'
                    }`}
                  >
                    {/* ID */}
                    <td className={`py-3.5 px-4 font-mono font-semibold text-[11.5px] ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-550'
                    }`}>
                      {contract.id}
                    </td>

                    {/* Name / Provider */}
                    <td className="py-3.5 px-4">
                      <div className={`font-bold tracking-tight max-w-[210px] truncate ${
                        isDarkMode ? 'text-slate-100' : 'text-slate-900'
                      }`}>
                        {contract.name}
                      </div>
                      <div className={`text-[10px] ${isDarkMode ? 'text-slate-550' : 'text-slate-500'}`}>
                        {contract.provider}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] rounded font-semibold border ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-800 text-slate-300' 
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        {contract.category}
                      </span>
                    </td>

                    {/* Criticality */}
                    <td className="py-3.5 px-4">
                      {criticalityTag}
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4 text-center">
                      {statusBadge}
                    </td>

                    {/* Expiration date */}
                    <td className={`py-3.5 px-4 font-mono text-[11.5px] ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-705'
                    }`}>
                      {contract.endDate}
                    </td>

                    {/* Payment frequency details / Installments */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <span className={`text-[11px] font-bold ${
                          isDarkMode ? 'text-slate-350' : 'text-slate-700'
                        }`}>
                          {contract.paymentFrequency === 'Parcelado' 
                            ? `Parcelado (${contract.installmentsCount || 12}x)`
                            : contract.paymentFrequency === 'Integral'
                              ? 'Único / Integral'
                              : 'Mensal'
                          }
                        </span>
                        
                        {contract.installments && contract.installments.length > 0 && (
                          <div className="flex flex-col items-center space-y-0.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                              contract.installments.some(i => i.status === 'Atrasada')
                                ? 'bg-rose-500/15 text-rose-520 dark:text-rose-400 animate-pulse'
                                : contract.installments.some(i => i.status === 'Próxima ao Vencimento')
                                  ? 'bg-amber-500/15 text-amber-620 dark:text-amber-400'
                                  : isDarkMode ? 'bg-slate-900 border border-slate-800 text-cyan-400' : 'bg-cyan-50 text-cyan-850 border border-cyan-200'
                            }`}>
                              {(() => {
                                const total = contract.installments.length;
                                const pagas = contract.installments.filter(i => i.status === 'Paga').length;
                                const atrasadas = contract.installments.filter(i => i.status === 'Atrasada').length;
                                if (atrasadas > 0) return `${atrasadas} em atraso 🚨`;
                                return `${pagas}/${total} Pagas`;
                              })()}
                            </span>
                            <span className={`text-[9.5px] font-sans font-medium leading-none ${isDarkMode ? 'text-slate-500' : 'text-slate-550'}`}>
                              {(() => {
                                const total = contract.installments.length;
                                const pagas = contract.contractLink === 'dummy' ? 0 : contract.installments.filter(i => i.status === 'Paga').length;
                                const actualPagas = contract.installments.filter(i => i.status === 'Paga').length;
                                const faltam = total - actualPagas;
                                return `Faltam: ${faltam} • Fim: ${contract.endDate}`;
                              })()}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Monthly Value */}
                    <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                      isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
                    }`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: contract.currency || 'BRL' }).format(contract.monthlyValue)}
                    </td>

                    {/* Extra Monthly Spent */}
                    <td className="py-3.5 px-4 text-right font-mono text-[13px]">
                      {contract.extraMonthlySpent && contract.extraMonthlySpent > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                            +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: contract.currency || 'BRL' }).format(contract.extraMonthlySpent)}
                          </span>
                          <span className="text-[9.5px] text-amber-600 dark:text-amber-500 font-sans leading-none mt-0.5">Excesso Consumo</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Annual Value */}
                    <td className={`py-3.5 px-4 text-right font-mono text-[11px] ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: contract.currency || 'BRL' }).format(contract.annualValue)}
                    </td>

                    {/* Credit Card / Payment Method Column */}
                    <td className="py-3.5 px-4 text-center">
                      {contract.paymentMethod === 'Cartão de Crédito' ? (
                        <div className="flex flex-col items-center leading-tight">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-1.5 rounded-md ${
                            isDarkMode 
                              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' 
                              : 'bg-indigo-50 text-indigo-750 border border-indigo-200 shadow-sm'
                          }`}>
                            <CreditCard className="h-3 w-3 shrink-0" />
                            <span>Cartão Corp.</span>
                          </span>
                          {contract.cardHolder && (
                            <span className={`text-[9.5px] mt-0.5 font-sans font-medium line-clamp-1 max-w-[100px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} title={contract.cardHolder}>
                              Resp: {contract.cardHolder}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold py-0.5 px-1.5 rounded-md ${
                          isDarkMode 
                            ? 'bg-slate-800 text-slate-400' 
                            : 'bg-slate-100 text-slate-600 border border-slate-205'
                        }`}>
                          <Landmark className="h-3 w-3 shrink-0 text-slate-400" />
                          <span>Faturamento</span>
                        </span>
                      )}
                    </td>

                    {/* Licensed seats / Usage */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-mono text-[11px]">
                        <span className={`${isDarkMode ? 'text-cyan-400' : 'text-cyan-705'} font-bold`}>{contract.activeSeats}</span>
                        <span className="text-slate-500"> / </span>
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-700'}>{contract.licensedSeats}</span>
                      </div>
                      <div className={`w-14 h-1 rounded-full mx-auto mt-1 overflow-hidden pointer-events-none ${
                        isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
                      }`}>
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, (contract.activeSeats / (contract.licensedSeats || 1)) * 100))}%` }}
                        />
                      </div>
                    </td>

                    {/* Idle Count */}
                    <td className={`py-3.5 px-4 text-center font-mono text-[11px] ${idleColor}`}>
                      {idleSeats > 0 ? (
                        <span>
                          {idleSeats} <span className="text-[9.5px] opacity-80">({Math.round(idlePct)}%)</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Sponsor (Owner) */}
                    <td className={`py-3.5 px-3 text-[11px] max-w-[150px] truncate ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-650'
                    }`}>
                      {contract.sponsor}
                    </td>

                    {/* Edit Actions */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openEditModal(contract)}
                          title="Editar Ficha"
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-cyan-400' : 'hover:bg-slate-200 text-slate-600 hover:text-indigo-650'
                          }`}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (isLoggedIn && !isAdmin) {
                              setErrorMessage("Sua conta possui perfil somente de leitura para os contratos da nuvem. Para excluir contratos da base de dados, solicite permissão editorial ao administrador do sistema (origemdodia@gmail.com).");
                            } else {
                              onDeleteContract(contract.id);
                            }
                          }}
                          title="Excluir Contrato"
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-rose-400' : 'hover:bg-rose-100 text-slate-600 hover:text-rose-600'
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className={`flex justify-between items-center text-xs pt-2 border-t ${
        isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-250 text-slate-600'
      }`}>
        <p>Visualizando <span className={`${isDarkMode ? 'text-cyan-400' : 'text-indigo-600'} font-semibold font-mono`}>{filteredContracts.length}</span> de <span className={`font-semibold font-mono ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{contracts.length}</span> contratos mapeados</p>
        <span className="font-mono text-[10px] text-slate-500">Logado no Painel de FinOps • Alterações salvas instantaneamente</span>
      </div>

      {/* MODAL: CONTRACT DETAILED VIEWER */}
      {isDetailOpen && detailContract && (
        <div className="fixed inset-0 wrongs-prevented z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-3xl rounded-2xl p-0 shadow-2xl relative max-h-[92vh] overflow-y-auto border transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white shadow-black/60' : 'bg-white border-slate-205 text-slate-900'
          }`}>
            
            {/* Header with color bands based on criticality */}
            <div className={`p-6 rounded-t-2xl border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
              detailContract.criticality === 'Crítica'
                ? (isDarkMode ? 'bg-gradient-to-r from-rose-950/40 to-slate-900 border-rose-500/20' : 'bg-gradient-to-r from-rose-50 to-white border-rose-200')
                : detailContract.criticality === 'Alta'
                  ? (isDarkMode ? 'bg-gradient-to-r from-orange-950/40 to-slate-900 border-orange-500/20' : 'bg-gradient-to-r from-orange-50 to-white border-orange-200')
                  : detailContract.criticality === 'Média'
                    ? (isDarkMode ? 'bg-gradient-to-r from-amber-950/40 to-slate-900 border-amber-500/20' : 'bg-gradient-to-r from-amber-50 to-white border-amber-200')
                    : (isDarkMode ? 'bg-gradient-to-r from-cyan-950/40 to-slate-900 border-slate-800' : 'bg-gradient-to-r from-slate-50 to-white border-slate-200')
            }`}>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-[9.5px] font-mono font-bold rounded uppercase tracking-wider ${
                    detailContract.criticality === 'Crítica'
                      ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                      : detailContract.criticality === 'Alta'
                        ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                        : detailContract.criticality === 'Média'
                          ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    Criticidade {detailContract.criticality}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    detailContract.status === 'Ativo'
                      ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-250')
                      : detailContract.status === 'Próximo do Vencimento'
                        ? (isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-250')
                        : (isDarkMode ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-700 border border-rose-250')
                  }`}>
                    <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${detailContract.status === 'Ativo' ? 'bg-emerald-500 animate-pulse' : detailContract.status === 'Próximo do Vencimento' ? 'bg-amber-400 animate-pulse' : 'bg-rose-500'}`} />
                    {detailContract.status}
                  </span>
                  <span className="text-[10.5px] font-mono text-slate-400 font-semibold">{detailContract.id}</span>
                </div>
                
                <h3 className="text-xl font-bold font-sans tracking-tight leading-tight">
                  {detailContract.name}
                </h3>
                <p className={`text-xs font-medium font-sans mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Fornecido por: <span className="font-semibold">{detailContract.provider}</span>
                </p>
              </div>

              {/* Close Button top-right */}
              <button
                onClick={() => setIsDetailOpen(false)}
                className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900 border'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body Grid */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Column 1: Geral & Scope */}
                <div className={`p-4 rounded-xl border space-y-3.5 ${isDarkMode ? 'bg-slate-950/30 border-slate-800/80' : 'bg-slate-50/50 border-slate-200'}`}>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Geral do Escopo</span>
                  </h4>
                  
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Sponsor / Responsável:</span>
                      <strong className={`flex items-center gap-1 font-medium text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                        <Award className="h-3 w-3 text-cyan-400" />
                        {detailContract.sponsor}
                      </strong>
                    </div>

                    {detailContract.sponsorEmail && (
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">E-mail do Sponsor:</span>
                        <a
                          href={`mailto:${detailContract.sponsorEmail}`}
                          className="font-mono text-[11px] block text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer select-all"
                        >
                          {detailContract.sponsorEmail}
                        </a>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Categoria do Item:</span>
                      <strong className="text-xs font-mono">{detailContract.category}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Vigência e Termos:</span>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] mt-0.5">
                        <span>{detailContract.startDate}</span>
                        <span className="text-slate-500">→</span>
                        <strong>{detailContract.endDate}</strong>
                      </div>
                    </div>

                    {detailContract.contractLink && (
                      <div className="pt-1.5 flex flex-col gap-2">
                        <a
                          href={detailContract.contractLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11.5px] text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Ver Termo Assinado (PDF)</span>
                        </a>
                      </div>
                    )}

                    {detailContract.adminPanelLink && (
                      <div className="pt-1.5">
                        <a
                          id="btn-link-admin-panel"
                          href={detailContract.adminPanelLink.startsWith('http') ? detailContract.adminPanelLink : `https://${detailContract.adminPanelLink}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 text-[11px] text-indigo-400 hover:text-indigo-300 hover:scale-[1.02] active:scale-95 font-bold bg-indigo-500/10 hover:bg-indigo-500/15 p-2 rounded-xl border border-indigo-500/30 transition-all cursor-pointer shadow-md shadow-indigo-950/25"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Abrir Painel de Admin</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Financeiro */}
                <div className={`p-4 rounded-xl border space-y-3.5 ${isDarkMode ? 'bg-slate-950/30 border-slate-800/80' : 'bg-slate-50/50 border-slate-200'}`}>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5" />
                    <span>Dimensão Financeira</span>
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Mensalidade Base:</span>
                      <strong className={`text-sm ${isDarkMode ? 'text-cyan-455' : 'text-cyan-705'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: detailContract.currency || 'BRL' }).format(detailContract.monthlyValue)}
                      </strong>
                      <span className="text-[10px] text-slate-500 font-mono block">Frequência: {detailContract.paymentFrequency || 'Mensal'}</span>
                    </div>

                    {detailContract.extraMonthlySpent ? (
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Gasto Extra Estimado (IA/Uso):</span>
                        <strong className="text-xs text-amber-500 animate-pulse">
                          +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: detailContract.currency || 'BRL' }).format(detailContract.extraMonthlySpent)}
                        </strong>
                      </div>
                    ) : null}

                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Gasto Projetado Anualizado:</span>
                      <strong className="text-xs font-mono">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: detailContract.currency || 'BRL' }).format(detailContract.annualValue)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Método de Faturamento:</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {detailContract.paymentMethod === 'Cartão de Crédito' ? (
                          <>
                            <CreditCard className="h-3.5 w-3.5 text-pink-500" />
                            <span className="text-xs font-medium text-slate-300 dark:text-slate-100">Cartão Corp (Portador: {detailContract.cardHolder || 'Corporativo'})</span>
                          </>
                        ) : (
                          <>
                            <Landmark className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs text-slate-305 dark:text-slate-200">Boleto / Faturamento Direto</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Eficiência */}
                <div className={`p-4 rounded-xl border space-y-3.5 ${isDarkMode ? 'bg-slate-950/30 border-slate-800/80' : 'bg-slate-50/50 border-slate-200'}`}>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" />
                    <span>Licenciamento FinOps</span>
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Licenças em Utilização:</span>
                      <div className="flex items-center justify-between font-mono font-bold text-xs mt-0.5">
                        <span>{detailContract.activeSeats} Ativas</span>
                        <span className="text-slate-400">/ {detailContract.licensedSeats} Contratadas</span>
                      </div>
                      
                      {/* Percent bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 bg-slate-200 dark:bg-slate-800">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, (detailContract.activeSeats / (detailContract.licensedSeats || 1)) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {detailContract.licensedSeats > detailContract.activeSeats ? (
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Capacidade Ociosa (Desperdício):</span>
                        <span className={`text-xs font-bold font-mono inline-flex items-center gap-1 ${
                          (detailContract.licensedSeats - detailContract.activeSeats) > 20 ? 'text-rose-500' : 'text-amber-500'
                        }`}>
                          <ShieldAlert className="h-3.5 w-3.5 animate-pulse" />
                          <span>{detailContract.licensedSeats - detailContract.activeSeats} ociosas ({Math.round(((detailContract.licensedSeats - detailContract.activeSeats) / detailContract.licensedSeats) * 105)}%)</span>
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Aproveitamento de Chaves:</span>
                        <strong className="text-emerald-500 flex items-center gap-1 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>100% de Eficiência de Uso</span>
                        </strong>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Custo Unitário de Licença Excedente:</span>
                      <strong className="text-xs font-mono text-slate-300">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: detailContract.currency || 'BRL' }).format(detailContract.excessLicenseCost || 0)} /licença
                      </strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Installments Breakdown Section if present */}
              {detailContract.installments && detailContract.installments.length > 0 && (
                <div className={`p-4 rounded-xl border space-y-3 ${isDarkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50/30 border-slate-200'}`}>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                    <span>Cronograma de Parcelas & Vencimentos do Contrato</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {detailContract.installments.map((inst) => {
                      let instBadge;
                      if (inst.status === 'Paga') {
                        instBadge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                      } else if (inst.status === 'Próxima ao Vencimento') {
                        instBadge = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                      } else if (inst.status === 'Atrasada') {
                        instBadge = 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse';
                      } else {
                        instBadge = 'bg-slate-800 text-slate-400 border border-slate-700';
                      }

                      return (
                        <div key={inst.id} className={`p-2.5 rounded-lg border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-205 shadow-xs'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9.5px] text-slate-400 font-semibold">{inst.id}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-bold ${instBadge}`}>{inst.status}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-slate-500 text-[9px] block">Vencimento:</span>
                            <strong className="font-mono text-[11px] text-slate-305 dark:text-slate-250">{inst.dueDate}</strong>
                          </div>
                          <div className="mt-1">
                            <span className="text-slate-500 text-[9px] block">Valor:</span>
                            <strong className="font-mono text-[11px] text-cyan-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: detailContract.currency || 'BRL' }).format(inst.value)}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Negotiation & Notes Section */}
              <div className={`p-4 rounded-xl border space-y-2 ${isDarkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-100/50 border-slate-205'}`}>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Notas de Negociação & Observações</h4>
                <p className={`text-xs leading-relaxed italic border-l-2 pl-3 py-1 ${
                  detailContract.negotiationNotes 
                    ? (isDarkMode ? 'text-slate-300 border-indigo-500/70 bg-indigo-950/5' : 'text-slate-700 border-indigo-600 bg-indigo-50/10')
                    : 'text-slate-500 border-slate-600'
                }`}>
                  {detailContract.negotiationNotes || "Nenhuma nota corporativa foi cadastrada para este contrato."}
                </p>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className={`p-4 rounded-b-2xl border-t flex items-center justify-between bg-slate-950/40 border-slate-850 gap-3`}>
              <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
                Contrato {detailContract.id} • FinOps Inteligência de Custo
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Edit Button in Details Popup */}
                <button
                  id="btn-edit-from-detail"
                  onClick={() => {
                    setIsDetailOpen(false);
                    openEditModal(detailContract);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer border-slate-800 hover:border-slate-700 bg-slate-850 text-slate-200 hover:bg-slate-750 flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Editar Contrato</span>
                </button>
                
                {/* Close Button */}
                <button
                  id="btn-close-detail"
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-all bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg cursor-pointer w-full sm:w-auto text-center"
                >
                  <span>Fechar Visualização</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: ACCESS DENIED */}
      {errorMessage && (
        <div className="fixed inset-0 wrongs-prevented z-[150] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className={`w-full max-w-sm border rounded-2xl p-6 shadow-2xl transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-205 text-slate-900'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-sm">Acesso Restrito - FinOps</h3>
                <p className="text-[11px] text-slate-400 font-mono">Modo Somente Leitura</p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-300">
              {errorMessage}
            </p>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="py-2 px-4 rounded-xl text-xs font-sans font-semibold bg-amber-600 hover:bg-amber-550 text-white transition-all cursor-pointer shadow-lg shadow-amber-600/10"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CONTRACT */}
      {isAddOpen && (
        <div className="fixed inset-0 wrongs-prevented z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-205 text-slate-900'
          }`}>
            <button
              onClick={() => setIsAddOpen(false)}
              className={`absolute right-4 top-4 transition-colors cursor-pointer ${
                isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-bold mb-1 font-sans flex items-center">
              <Plus className="h-5 w-5 mr-1.5 text-cyan-500" />
              Inserir Novo Contrato na Planilha
            </h3>
            <p className={`text-xs mb-6 font-sans ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Cadastre os parâmetros básicos, frequência de pagamento, parcelamento e método de pagamento (boleto ou cartão com responsável).
            </p>

            <form onSubmit={handleCreate} className="space-y-4 font-sans text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nome do Serviço (ex: OpenAI API)</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:ring-1 focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white focus:ring-cyan-500 focus:border-cyan-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Provedor / Razão Social</label>
                  <input
                    type="text"
                    required
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:ring-1 focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white focus:ring-cyan-500 focus:border-cyan-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CategoriaContrato)}
                    className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white focus:ring-1 focus:ring-cyan-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-1 focus:ring-indigo-505'
                    }`}
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="Infra">Infra</option>
                    <option value="Suporte">Suporte</option>
                    <option value="Assinatura de IA">Assinatura de IA</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Criticidade do Escopo</label>
                  <select
                    value={formCriticality}
                    onChange={(e) => setFormCriticality(e.target.value as CriticidadeContrato)}
                    className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white focus:ring-1 focus:ring-cyan-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-1 focus:ring-indigo-505'
                    }`}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status Contratual</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as StatusContrato)}
                    className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white' 
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Próximo do Vencimento">Próximo do Vencimento</option>
                    <option value="Expirado">Expirado</option>
                  </select>
                </div>
              </div>

              {/* OPÇÕES DE PARCELAMENTO & METODO DE PAGAMENTO */}
              <div className={`p-4 rounded-xl border space-y-4 ${
                isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-205 shadow-inner'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs mb-1 font-bold ${isDarkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
                      Frequência de Pagamento / Parcelas
                    </label>
                    <select
                      value={formPaymentFrequency}
                      onChange={(e) => setFormPaymentFrequency(e.target.value as 'Mensal' | 'Integral' | 'Parcelado')}
                      className={`w-full border rounded-lg p-2 text-xs focus:outline-none font-semibold ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-850 text-white focus:ring-cyan-500' 
                          : 'bg-white border-slate-300 text-slate-900 focus:ring-indigo-500'
                      }`}
                    >
                      <option value="Mensal">Cobrança Mensal (Mensalmente)</option>
                      <option value="Integral">Integral / Pagamento Único / Anual</option>
                      <option value="Parcelado">Customizado em Vezes (X Parcelas)</option>
                    </select>
                  </div>

                  {formPaymentFrequency === 'Parcelado' && (
                    <div>
                      <label className={`block text-xs mb-1 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Em quantas parcelas foi feito (X)?
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={48}
                        value={formInstallmentsCount}
                        onChange={(e) => setFormInstallmentsCount(Number(e.target.value))}
                        className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${
                          isDarkMode 
                            ? 'bg-slate-900 border-slate-850 text-white focus:ring-cyan-500' 
                            : 'bg-white border-slate-300 text-slate-900 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs mb-1 font-bold ${isDarkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
                      Meio de Pagamento
                    </label>
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => {
                        setFormPaymentMethod(e.target.value as 'Faturamento' | 'Cartão de Crédito');
                        if (e.target.value === 'Faturamento') setFormCardHolder('');
                      }}
                      className={`w-full border rounded-lg p-2 text-xs focus:outline-none font-semibold ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-850 text-white focus:ring-cyan-500' 
                          : 'bg-white border-slate-300 text-slate-900 focus:ring-indigo-500'
                      }`}
                    >
                      <option value="Faturamento">Faturamento Direto / Boleto / Transferência</option>
                      <option value="Cartão de Crédito">Cartão de Crédito Corporativo</option>
                    </select>
                  </div>

                  {formPaymentMethod === 'Cartão de Crédito' && (
                    <div>
                      <label className={`block text-xs mb-1 font-bold text-red-500`}>
                        Responsável pelo Cartão de Crédito
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nome do responsável (ex: Aline TI ou Tiago CTO)"
                        value={formCardHolder}
                        onChange={(e) => setFormCardHolder(e.target.value)}
                        className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                          isDarkMode 
                            ? 'bg-slate-900 border-slate-850 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs mb-1 font-bold ${isDarkMode ? 'text-cyan-400' : 'text-indigo-650'}`}>Custo Mensal Regular da Licença (BRL R$)</label>
                  <input
                    type="number"
                    required
                    value={formMonthlyValue}
                    onChange={(e) => setFormMonthlyValue(Number(e.target.value))}
                    className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white' 
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-bold text-amber-500">Gasto Extra / Excedente de Consumo (BRL R$)</label>
                  <input
                    type="number"
                    value={formExtraMonthlySpent}
                    onChange={(e) => setFormExtraMonthlySpent(Number(e.target.value))}
                    placeholder="Ex: estouro de tokens de IA, nuvem sob demanda"
                    className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white focus:ring-amber-500 focus:border-amber-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-amber-500 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Data de Início</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs font-mono ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white' 
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs font-mono ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white' 
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={`flex items-end h-auto md:h-8 pb-1 text-xs font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Moeda</label>
                  <input
                    type="text"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`flex items-end h-auto md:h-8 pb-1 text-xs font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Licenças Compradas</label>
                  <input
                    type="number"
                    value={formLicensedSeats}
                    onChange={(e) => setFormLicensedSeats(Number(e.target.value))}
                    className={`w-full border rounded-lg p-2 text-xs font-mono ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`flex items-end h-auto md:h-8 pb-1 text-xs font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Licenças Ativas</label>
                  <input
                    type="number"
                    value={formActiveSeats}
                    onChange={(e) => setFormActiveSeats(Number(e.target.value))}
                    className={`w-full border rounded-lg p-2 text-xs font-mono ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`flex items-end h-auto md:h-8 pb-1 text-xs font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Custo Exc. Unitário (R$)</label>
                  <input
                    type="number"
                    value={formExcessCost}
                    onChange={(e) => setFormExcessCost(Number(e.target.value))}
                    className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label id="lbl-add-sponsor" className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dono do Contrato (Sponsor)</label>
                  <input
                    id="input-add-sponsor"
                    type="text"
                    required
                    value={formSponsor}
                    placeholder="Nome do Dono (ex: Aline Souza (VP))"
                    onChange={(e) => setFormSponsor(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label id="lbl-add-sponsor-email" className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>E-mail do Dono do Contrato</label>
                  <input
                    id="input-add-sponsor-email"
                    type="email"
                    value={formSponsorEmail}
                    placeholder="exemplo@suaempresa.com.br"
                    onChange={(e) => setFormSponsorEmail(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label id="lbl-add-contract-link" className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Link de Acesso (PDF no Drive/Cloud)</label>
                  <input
                    id="input-add-contract-link"
                    type="text"
                    value={formLink}
                    placeholder="https://exemplo-infra.com/contracts/github.pdf"
                    onChange={(e) => setFormLink(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label id="lbl-add-admin-link" className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Link do Painel de Admin do Sistema</label>
                  <input
                    id="input-add-admin-link"
                    type="text"
                    value={formAdminPanelLink}
                    placeholder="https://admin.salesforce.com ou https://console.aws.amazon.com"
                    onChange={(e) => setFormAdminPanelLink(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Observações / Notas para Renovação</label>
                <textarea
                  value={formNotes}
                  rows={3}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className={`w-full border rounded-lg p-2 text-xs focus:outline-none font-sans ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  placeholder="Instruções de reajuste, limites de devolução de chaves, créditos vigentes..."
                />
              </div>

              <div className={`flex justify-end space-x-3 pt-4 border-t ${
                isDarkMode ? 'border-slate-800' : 'border-slate-205'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className={`px-4 py-2 text-xs rounded-lg transition-all cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-750 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-gradient-to-r from-cyan-600 to-indigo-650 hover:from-cyan-500 hover:to-indigo-550 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CONTRACT */}
      {isEditOpen && (
        <div className="fixed inset-0 wrongs-prevented z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-205 text-slate-900'
          }`}>
            <button
              onClick={() => setIsEditOpen(false)}
              className={`absolute right-4 top-4 transition-colors cursor-pointer ${
                isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-bold mb-1 font-sans flex items-center">
              <Edit3 className="h-5 w-5 mr-1.5 text-cyan-500" />
              Editar Ficha: {editingContract?.id}
            </h3>
            <p className={`text-xs mb-6 font-sans ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Atualize as informações reais do contrato de TI, forma e meio de pagamento. Os indicadores atualizarão em tempo real.
            </p>

            <form onSubmit={handleUpdate} className="space-y-4 font-sans text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nome do Serviço</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:ring-1 focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white focus:ring-cyan-500 focus:border-cyan-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500 focus:border-indigo-505'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Provedor</label>
                  <input
                    type="text"
                    required
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:ring-1 focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white' 
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CategoriaContrato)}
                    className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="Infra">Infra</option>
                    <option value="Suporte">Suporte</option>
                    <option value="Assinatura de IA">Assinatura de IA</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Criticidade</label>
                  <select
                    value={formCriticality}
                    onChange={(e) => setFormCriticality(e.target.value as CriticidadeContrato)}
                    className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status Contratual</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as StatusContrato)}
                    className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Próximo do Vencimento">Próximo do Vencimento</option>
                    <option value="Expirado">Expirado</option>
                  </select>
                </div>
              </div>

              {/* OPÇÕES DE PARCELAMENTO & METODO DE PAGAMENTO */}
              <div className={`p-4 rounded-xl border space-y-4 ${
                isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-205 shadow-inner'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs mb-1 font-bold ${isDarkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
                      Frequência de Pagamento / Parcelas
                    </label>
                    <select
                      value={formPaymentFrequency}
                      onChange={(e) => setFormPaymentFrequency(e.target.value as 'Mensal' | 'Integral' | 'Parcelado')}
                      className={`w-full border rounded-lg p-2 text-xs focus:outline-none font-semibold ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-850 text-white focus:ring-cyan-500' 
                          : 'bg-white border-slate-300 text-slate-900 focus:ring-indigo-500'
                      }`}
                    >
                      <option value="Mensal">Cobrança Mensal (Mensalmente)</option>
                      <option value="Integral">Integral / Pagamento Único / Anual</option>
                      <option value="Parcelado">Customizado em Vezes (X Parcelas)</option>
                    </select>
                  </div>

                  {formPaymentFrequency === 'Parcelado' && (
                    <div>
                      <label className={`block text-xs mb-1 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Em quantas parcelas foi feito (X)?
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={48}
                        value={formInstallmentsCount}
                        onChange={(e) => setFormInstallmentsCount(Number(e.target.value))}
                        className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${
                          isDarkMode 
                            ? 'bg-slate-900 border-slate-850 text-white focus:ring-cyan-500' 
                            : 'bg-white border-slate-300 text-slate-900 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs mb-1 font-bold ${isDarkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
                      Meio de Pagamento
                    </label>
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => {
                        setFormPaymentMethod(e.target.value as 'Faturamento' | 'Cartão de Crédito');
                        if (e.target.value === 'Faturamento') setFormCardHolder('');
                      }}
                      className={`w-full border rounded-lg p-2 text-xs focus:outline-none font-semibold ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-850 text-white' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="Faturamento">Faturamento Direto / Boleto / Transferência</option>
                      <option value="Cartão de Crédito">Cartão de Crédito Corporativo</option>
                    </select>
                  </div>

                  {formPaymentMethod === 'Cartão de Crédito' && (
                    <div>
                      <label className="block text-xs mb-1 font-bold text-red-500">
                        Responsável pelo Cartão de Crédito
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nome do responsável (ex: Aline TI ou Tiago CTO)"
                        value={formCardHolder}
                        onChange={(e) => setFormCardHolder(e.target.value)}
                        className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                          isDarkMode 
                            ? 'bg-slate-900 border-slate-850 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs mb-1 font-bold ${isDarkMode ? 'text-cyan-400' : 'text-indigo-650'}`}>Custo Mensal Regular da Licença (BRL R$)</label>
                  <input
                    type="number"
                    required
                    value={formMonthlyValue}
                    onChange={(e) => setFormMonthlyValue(Number(e.target.value))}
                    className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white' 
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-bold text-amber-500">Gasto Extra / Excedente de Consumo (BRL R$)</label>
                  <input
                    type="number"
                    value={formExtraMonthlySpent}
                    onChange={(e) => setFormExtraMonthlySpent(Number(e.target.value))}
                    placeholder="Ex: estouro de tokens de IA, nuvem sob demanda"
                    className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white focus:ring-amber-500 focus:border-amber-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-amber-500 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Data de Início</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={`flex items-end h-auto md:h-8 pb-1 text-xs font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Moeda</label>
                  <input
                    type="text"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:ring-1 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`flex items-end h-auto md:h-8 pb-1 text-xs font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Licenças Compradas</label>
                  <input
                    type="number"
                    value={formLicensedSeats}
                    onChange={(e) => setFormLicensedSeats(Number(e.target.value))}
                    className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`flex items-end h-auto md:h-8 pb-1 text-xs font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Licenças Ativas</label>
                  <input
                    type="number"
                    value={formActiveSeats}
                    onChange={(e) => setFormActiveSeats(Number(e.target.value))}
                    className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`flex items-end h-auto md:h-8 pb-1 text-xs font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Custo Exc. Unitário (R$)</label>
                  <input
                    type="number"
                    value={formExcessCost}
                    onChange={(e) => setFormExcessCost(Number(e.target.value))}
                    className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label id="lbl-edit-sponsor" className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dono do Contrato (Sponsor)</label>
                  <input
                    id="input-edit-sponsor"
                    type="text"
                    required
                    value={formSponsor}
                    onChange={(e) => setFormSponsor(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:ring-1 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label id="lbl-edit-sponsor-email" className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>E-mail do Dono do Contrato</label>
                  <input
                    id="input-edit-sponsor-email"
                    type="email"
                    value={formSponsorEmail}
                    placeholder="exemplo@suaempresa.com.br"
                    onChange={(e) => setFormSponsorEmail(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:ring-1 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label id="lbl-edit-contract-link" className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Link para PDF do Contrato</label>
                  <input
                    id="input-edit-contract-link"
                    type="text"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:ring-1 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label id="lbl-edit-admin-link" className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Link do Painel de Admin do Sistema</label>
                  <input
                    id="input-edit-admin-link"
                    type="text"
                    value={formAdminPanelLink}
                    placeholder="https://admin.salesforce.com ou https://console.aws.amazon.com"
                    onChange={(e) => setFormAdminPanelLink(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-xs focus:ring-1 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs mb-1 font-semibold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Observações de Negociação</label>
                <textarea
                  value={formNotes}
                  rows={3}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className={`w-full border rounded-lg p-2 text-xs font-sans focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className={`flex justify-end space-x-3 pt-4 border-t ${
                isDarkMode ? 'border-slate-800' : 'border-slate-205'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className={`px-4 py-2 text-xs rounded-lg transition-all cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-750 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-gradient-to-r from-cyan-600 to-indigo-650 hover:from-cyan-500 hover:to-indigo-550 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
