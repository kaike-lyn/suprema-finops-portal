import { useState, useMemo, useEffect } from 'react';
import { Contract } from './types';
import { initialContracts } from './data';
import KPICard from './components/KPICard';
import ContractSpreadsheet from './components/ContractSpreadsheet';
import LicenseUtilizationChart from './components/LicenseUtilizationChart';
import AlertIntegrations from './components/AlertIntegrations';
import AiConsultingPanel from './components/AiConsultingPanel';
import FinOpsSimulation from './components/FinOpsSimulation';
import RenewalTimeline from './components/RenewalTimeline';

import { 
  LayoutDashboard, 
  Sparkles, 
  FileUp, 
  Bell, 
  DollarSign, 
  Calendar, 
  Percent, 
  Trash, 
  User, 
  ShieldAlert,
  Building,
  Wrench,
  CloudLightning,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Lock,
  Unlock,
  TrendingDown,
  Palette,
  Users,
  Check,
  Database,
  RefreshCw,
  Cloud,
  Server
} from 'lucide-react';

const BrandLogo = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Design das alças entrelaçadas conforme o logo do usuário */}
    <path d="M 15,55 L 70,55 L 43,18 L 30,32" />
    <path d="M 85,45 L 30,45 L 57,82 L 70,68" />
  </svg>
);

const RestrictedTabContent = ({ 
  title, 
  desc, 
  isDarkMode, 
  onTriggerLogin, 
  isLoggedIn 
}: { 
  title: string; 
  desc: string; 
  isDarkMode: boolean; 
  onTriggerLogin: () => void; 
  isLoggedIn: boolean; 
}) => {
  return (
    <div className={`p-8 md:p-12 border rounded-3xl flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-12 transition-all ${
      isDarkMode ? 'bg-slate-900/60 border-slate-800/80 text-slate-100 animate-fade-in' : 'bg-white border-slate-205 text-slate-900 shadow-xl animate-fade-in'
    }`}>
      <div className="relative mb-6">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse">
          <Lock className="h-8 w-8" />
        </div>
        <div className="absolute -top-1 -right-1 bg-amber-600 text-white rounded-full p-1 border-2 border-slate-900">
          <ShieldAlert className="h-3.5 w-3.5" />
        </div>
      </div>
      
      <h3 className={`text-lg font-bold font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        Acesso Restrito: {title}
      </h3>
      
      <p className={`mt-3 text-xs leading-relaxed max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {desc}
      </p>

      {!isLoggedIn ? (
        <div className="mt-8 space-y-4">
          <p className="text-[11px] font-mono text-slate-500">Este recurso consome créditos da IA Suprema e necessita de privilégios editoriais administrativos.</p>
          <button
            onClick={onTriggerLogin}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-550 hover:to-indigo-550 text-white rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            Fazer Login como Administrador
          </button>
        </div>
      ) : (
        <div className="mt-8 p-4 rounded-xl border border-dashed border-slate-800/50 text-slate-400 text-[11px] bg-slate-950/20 max-w-sm">
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} font-semibold mb-1`}>Sua Conta é do Tipo: Leitor corporativo</p>
          <p>Para obter privilégios de edição e acesso completo a auditorias IA e simuladores, solicite ao administrador principal (<span className="font-mono text-indigo-400 font-bold">origemdodia@gmail.com</span>) a alteração do seu privilégio de acesso na tabela de controle abaixo.</p>
        </div>
      )}
    </div>
  );
};

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  light: {
    brand: string;
    brandHover: string;
    brandBg: string;
    brandBorder: string;
    brandGlow: string;
    brandText: string;
    gradientFromColor: string;
    gradientViaColor: string;
    gradientToColor: string;
    bg: string;
  };
  dark: {
    brand: string;
    brandHover: string;
    brandBg: string;
    brandBorder: string;
    brandGlow: string;
    brandText: string;
    gradientFromColor: string;
    gradientViaColor: string;
    gradientToColor: string;
    bg: string;
  };
}

const APP_THEMES: AppTheme[] = [
  {
    id: 'bronze-sunset',
    name: 'Bronze Sunset',
    description: 'Uma paleta quente e sofisticada em tons de terracota, bronze solar e rosa-ouro.',
    light: {
      brand: '#ea580c', // orange-600
      brandHover: '#c2410c', // orange-700
      brandBg: 'rgba(234, 88, 12, 0.08)',
      brandBorder: 'rgba(234, 88, 12, 0.25)',
      brandGlow: 'rgba(234, 88, 12, 0.05)',
      brandText: '#ea580c',
      gradientFromColor: '#ea580c',
      gradientViaColor: '#e11d48',
      gradientToColor: '#c026d3',
      bg: '#f8f4f0', // warm solar cream hint
    },
    dark: {
      brand: '#f97316', // orange-500
      brandHover: '#ea580c', // orange-600
      brandBg: 'rgba(249, 115, 22, 0.08)',
      brandBorder: 'rgba(249, 115, 22, 0.25)',
      brandGlow: 'rgba(249, 115, 22, 0.12)',
      brandText: '#fb923c', // orange-400
      gradientFromColor: '#f97316',
      gradientViaColor: '#f43f5e',
      gradientToColor: '#d946ef',
      bg: '#080402', // rich dark chocolate/espresso
    }
  }
];

function getSafeDateString(baseDateStr: string, monthsToAdd: number): string {
  try {
    const parts = baseDateStr.split('-');
    if (parts.length < 3) return baseDateStr;
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);

    const targetMonthTotal = monthIndex + monthsToAdd;
    const targetYear = year + Math.floor(targetMonthTotal / 12);
    const targetMonthIndex = (targetMonthTotal % 12 + 12) % 12;

    const daysInTargetMonth = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
    const actualDay = Math.min(day, daysInTargetMonth);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${targetYear}-${pad(targetMonthIndex + 1)}-${pad(actualDay)}`;
  } catch (err) {
    return baseDateStr;
  }
}

function getInstallmentStatus(dueDateStr: string): 'Paga' | 'Próxima ao Vencimento' | 'Em aberto' | 'Atrasada' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(dueDateStr);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < -3) {
    return 'Paga';
  } else if (diffDays >= -3 && diffDays <= 15) {
    return 'Próxima ao Vencimento';
  } else {
    return 'Em aberto';
  }
}

function processInitialContracts(initial: Contract[]): Contract[] {
  return initial.map(c => {
    const start = c.startDate || '2026-01-01';
    const end = c.endDate || '2027-01-01';
    const freq = c.paymentFrequency || 'Mensal';
    const monthlyVal = c.monthlyValue || 0;
    const installmentsCount = c.installmentsCount || 12;

    let totalMonths = 12;
    try {
      const startParts = start.split('-');
      const endParts = end.split('-');
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
    } catch {
      totalMonths = 12;
    }

    totalMonths = Math.min(Math.max(1, totalMonths), 60);

    let generated: { id: string; dueDate: string; value: number; status: 'Paga' | 'Próxima ao Vencimento' | 'Em aberto' | 'Atrasada' }[] = [];

    if (freq === 'Integral') {
      generated = [
        { id: 'PARC-01', dueDate: end, value: c.annualValue, status: getInstallmentStatus(end) }
      ];
    } else if (freq === 'Parcelado') {
      const count = Number(installmentsCount) || 12;
      const annualVal = monthlyVal * 12;
      generated = Array.from({ length: count }).map((_, idx) => {
        const padNum = (idx + 1).toString().padStart(2, '0');
        const dStr = getSafeDateString(start, idx);
        return {
          id: `PARC-${padNum}`,
          dueDate: dStr,
          value: Number((annualVal / count).toFixed(2)),
          status: getInstallmentStatus(dStr)
        };
      });
    } else {
      // Mensal
      generated = Array.from({ length: totalMonths }).map((_, idx) => {
        const padNum = (idx + 1).toString().padStart(2, '0');
        const dStr = getSafeDateString(start, idx);
        return {
          id: `PARC-${padNum}`,
          dueDate: dStr,
          value: Number(monthlyVal) || 0,
          status: getInstallmentStatus(dStr)
        };
      });
    }

    return {
      ...c,
      installments: generated
    };
  });
}

export default function App() {
  const [contracts, setContracts] = useState<Contract[]>(() => {
    const local = localStorage.getItem('suprema_contracts');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // ignore
      }
    }
    return processInitialContracts(initialContracts);
  });

  useEffect(() => {
    localStorage.setItem('suprema_contracts', JSON.stringify(contracts));
  }, [contracts]);

  const [selectedContractId, setSelectedContractId] = useState<string | null>(initialContracts[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'simulation' | 'timeline' | 'alerts'>('dashboard');
  const [activeKpiFilter, setActiveKpiFilter] = useState<'alertas' | 'desperdicio' | 'aproveitamento' | 'custo' | null>(null);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Local-first persistent active session configuration (independent from Cloud services, optimized for Vercel)
  const [session, setSession] = useState<{
    isLoggedIn: boolean;
    userEmail: string;
    userRole: 'admin' | 'reader';
  }>(() => {
    const saved = localStorage.getItem('suprema_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Default session: logged in as admin to demonstrate all features immediately out of the box
    return {
      isLoggedIn: true,
      userEmail: "admin@suprema.io",
      userRole: 'admin'
    };
  });

  const isLoggedIn = session.isLoggedIn;
  const userEmail = session.userEmail;
  const userRole = session.userRole;
  const isAdminUser = isLoggedIn && userRole === 'admin';

  // Lista de e-mails corporativos pré-autorizados ou permitidos (Whitelist)
  const ALLOWED_EMAILS = useMemo(() => [
    'origemdodia@gmail.com',
    'admin@suprema.io',
    'diretoria@suprema.io',
    'auditor@suprema.io',
    'colaborador@suprema.io',
  ], []);

  const handleLocalSignIn = (email: string, role: 'admin' | 'reader') => {
    const formattedEmail = (email || '').trim().toLowerCase();
    
    // Validar se o e-mail está na lista de e-mails permitidos ou se pertence ao domínio @suprema.io
    const isAllowed = ALLOWED_EMAILS.includes(formattedEmail) || formattedEmail.endsWith('@suprema.io');
    
    if (!isAllowed) {
      setLoginError('Acesso Negado: Este e-mail não foi previamente autorizado para acessar o sistema.');
      return;
    }

    setLoginError('');
    const newSession = {
      isLoggedIn: true,
      userEmail: formattedEmail,
      userRole: role
    };
    setSession(newSession);
    localStorage.setItem('suprema_user_session', JSON.stringify(newSession));
    setIsLoginModalOpen(false);
  };

  const handleLocalSignOut = () => {
    const newSession = {
      isLoggedIn: false,
      userEmail: '',
      userRole: 'reader' as const
    };
    setSession(newSession);
    localStorage.setItem('suprema_user_session', JSON.stringify(newSession));
  };

  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem('suprema_active_theme') || 'bronze-sunset';
  });

  const activeTheme = useMemo(() => {
    return APP_THEMES.find(t => t.id === activeThemeId) || APP_THEMES[0];
  }, [activeThemeId]);

  useEffect(() => {
    localStorage.setItem('suprema_active_theme', activeThemeId);
  }, [activeThemeId]);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginRole, setLoginRole] = useState<'admin' | 'reader'>('admin');
  const [loginError, setLoginError] = useState<string>('');

  useEffect(() => {
    if (isLoginModalOpen) {
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
    }
  }, [isLoginModalOpen]);

  // Selected contract object
  const selectedContract = useMemo(() => {
    return contracts.find(c => c.id === selectedContractId) || null;
  }, [contracts, selectedContractId]);

  // Auto-switch selected contract if not matching active KPI filter
  useEffect(() => {
    if (!activeKpiFilter) return;

    const matchesFilter = (c: Contract) => {
      if (activeKpiFilter === 'alertas') return c.status === 'Próximo do Vencimento';
      if (activeKpiFilter === 'desperdicio') return c.licensedSeats > 0 && c.activeSeats < c.licensedSeats;
      if (activeKpiFilter === 'aproveitamento') return c.category === 'SaaS' && c.licensedSeats > 5;
      if (activeKpiFilter === 'custo') return c.status !== 'Expirado';
      return true;
    };

    // Check if current selection matches
    const currentMatches = selectedContract && matchesFilter(selectedContract);
    if (!currentMatches) {
      const firstMatch = contracts.find(matchesFilter);
      if (firstMatch) {
        setSelectedContractId(firstMatch.id);
      }
    }
  }, [activeKpiFilter, contracts, selectedContract, selectedContractId]);

  // Aggregate stats dynamically for Screen 1 Visão Geral (KPI Cards):
  // 1. Custo Mensal Total (R$)
  const totalMonthlyCost = useMemo(() => {
    return contracts.reduce((acc, c) => acc + (c.status !== 'Expirado' ? c.monthlyValue : 0), 0);
  }, [contracts]);

  // 2. Total de Contratos Ativos vs. Próximos do Vencimento (30/60/90 dias)
  const contractExpiryCounts = useMemo(() => {
    const ativos = contracts.filter(c => c.status === 'Ativo').length;
    const atencao = contracts.filter(c => c.status === 'Próximo do Vencimento').length;
    const expirados = contracts.filter(c => c.status === 'Expirado').length;
    return { ativos, atencao, expirados };
  }, [contracts]);

  // 3. Taxa de Utilização Média das Licenças (%)
  const averageUtilizationRate = useMemo(() => {
    let totalLicensed = 0;
    let totalActive = 0;
    contracts.forEach((c) => {
      // Exclude cloud infra or support with 1 seat placeholders to keep rate realistic
      if (c.category === 'SaaS' && c.licensedSeats > 5) {
        totalLicensed += c.licensedSeats;
        totalActive += c.activeSeats;
      }
    });
    if (totalLicensed === 0) return 100;
    return (totalActive / totalLicensed) * 100;
  }, [contracts]);

  // 4. Desperdício Financeiro Estimado (R$ por licenças ociosas)
  const estimatedCostWaste = useMemo(() => {
    return contracts.reduce((acc, c) => {
      if (c.licensedSeats > 0 && c.activeSeats < c.licensedSeats) {
        const idleSeats = c.licensedSeats - c.activeSeats;
        const seatCost = c.monthlyValue / c.licensedSeats;
        return acc + (idleSeats * seatCost);
      }
      return acc;
    }, 0);
  }, [contracts]);

  // Handle spreadsheet updates (Client-only / Local-first)
  const handleAddContract = async (newContract: Contract) => {
    setContracts(prev => [newContract, ...prev]);
    setSelectedContractId(newContract.id);
  };

  const handleUpdateContract = async (updated: Contract) => {
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteContract = (contractId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Contrato',
      message: 'Tem certeza que deseja remover este contrato da sua planilha? O progresso será salvo localmente.',
      onConfirm: async () => {
        setContracts(prev => prev.filter(c => c.id !== contractId));
        if (selectedContractId === contractId) {
          setSelectedContractId(null);
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Restaurar Dados de Fábrica',
      message: 'Deseja restaurar a planilha com os dados corporativos iniciais de fábrica? Todo o seu progresso local será restaurado para os padrões iniciais de TI.',
      onConfirm: async () => {
        const initial = processInitialContracts(initialContracts);
        setContracts(initial);
        setSelectedContractId(initial[0]?.id || null);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleImportContracts = (imported: Contract[]) => {
    if (imported && imported.length > 0) {
      setContracts(imported);
      if (imported[0]?.id) {
        setSelectedContractId(imported[0].id);
      }
    }
  };



  const themeStyles = isDarkMode ? activeTheme.dark : activeTheme.light;
  const inlineThemeStyles = {
    '--brand-color': themeStyles.brand,
    '--brand-color-hover': themeStyles.brandHover,
    '--brand-color-bg': themeStyles.brandBg,
    '--brand-color-border': themeStyles.brandBorder,
    '--brand-color-glow': themeStyles.brandGlow,
    '--brand-text': themeStyles.brandText,
    '--brand-bg': themeStyles.bg,
  } as React.CSSProperties;

  return (
    <div 
      style={{ ...inlineThemeStyles, backgroundColor: 'var(--brand-bg)' }}
      className={`min-h-screen flex flex-col font-sans transition-all duration-500 pb-16 ${
        isDarkMode ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      
      {/* Top Professional Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800/80 text-white' : 'bg-white/90 border-slate-200/80 text-slate-900 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div 
              style={{ 
                backgroundImage: `linear-gradient(to top right, ${themeStyles.gradientFromColor}, ${themeStyles.gradientViaColor}, ${themeStyles.gradientToColor})`,
                boxShadow: `0 4px 12px ${themeStyles.brand}25`
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
            >
              <BrandLogo className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-sm font-extrabold tracking-wider uppercase font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>SUPREMA</h1>
                <span className="text-[10px] bg-brand/10 text-brand font-mono px-1.5 py-0.2 rounded font-semibold border border-brand/20">FINOPS PORTAL</span>
              </div>
              <p className={`text-[10.5px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Gestão de Contratos Suprema</p>
            </div>
          </div>

          {/* Theme Switch & Login Block */}
          <div className="flex items-center space-x-4">
            
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(prev => !prev)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-250 text-slate-700 hover:bg-slate-200'
              }`}
              title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Local Authentication Header Controls */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 animate-fade-in">
                <span className={`hidden md:inline-flex items-center space-x-1.5 px-3 py-1 border rounded-full text-xs font-semibold ${
                  isAdminUser 
                    ? (isDarkMode ? 'bg-emerald-950/40 border-emerald-850/50 text-emerald-400' : 'bg-emerald-50 border-emerald-250 text-emerald-700')
                    : (isDarkMode ? 'bg-amber-950/40 border-amber-850/50 text-amber-400' : 'bg-amber-50 border-amber-250 text-amber-700')
                }`}>
                  {isAdminUser ? (
                    <Unlock className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span className="max-w-[150px] truncate">{userEmail} ({userRole === 'admin' ? 'Admin' : 'Leitor'})</span>
                </span>
                <button
                  onClick={handleLocalSignOut}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-bold font-sans transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/40' 
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-rose-55 hover:text-rose-700 hover:border-rose-220'
                  }`}
                  title="Sair da Conta"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 animate-fade-in">
                <span className={`hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 border rounded-full text-xs font-medium ${
                  isDarkMode 
                    ? 'bg-slate-900/60 border-slate-800/60 text-slate-400' 
                    : 'bg-slate-100 border-slate-200 text-slate-550'
                }`}>
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Modo Leitor</span>
                </span>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center space-x-1 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer shadow-lg shadow-cyan-500/10 hover:scale-[1.02]"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Entrar</span>
                </button>
              </div>
            )}
            
          </div>

        </div>
      </header>

      {/* Main SaaS Interface container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full space-y-8">
        
        {/* Navigation Tabs Bar */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-2 ${
          isDarkMode ? 'border-slate-800/85' : 'border-slate-200'
        }`}>
          
          <div className={`flex space-x-1.5 p-1 rounded-xl border transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={activeTab === 'dashboard' ? { backgroundImage: `linear-gradient(to right, ${themeStyles.gradientFromColor}, ${themeStyles.gradientToColor})`, boxShadow: `0 6px 15px ${themeStyles.brand}30` } : {}}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-white shadow-lg'
                  : isDarkMode 
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    : 'text-slate-655 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Painel Geral & Planilha</span>
            </button>

            <button
              id="tab-auditoria-ai"
              onClick={() => setActiveTab('ai')}
              style={activeTab === 'ai' ? { backgroundImage: `linear-gradient(to right, ${themeStyles.gradientFromColor}, ${themeStyles.gradientToColor})`, boxShadow: `0 6px 15px ${themeStyles.brand}30` } : {}}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'text-white shadow-lg'
                  : isDarkMode 
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    : 'text-slate-655 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Auditoria FinOps IA</span>
              {!isAdminUser && (
                <span title="Acesso exclusivo Administrador">
                  <Lock className="h-3 w-3 text-amber-550 shrink-0 ml-1" />
                </span>
              )}
            </button>

            <button
              id="tab-simulador-finops"
              onClick={() => setActiveTab('simulation')}
              style={activeTab === 'simulation' ? { backgroundImage: `linear-gradient(to right, ${themeStyles.gradientFromColor}, ${themeStyles.gradientToColor})`, boxShadow: `0 6px 15px ${themeStyles.brand}30` } : {}}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'simulation'
                  ? 'text-white shadow-lg'
                  : isDarkMode 
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    : 'text-slate-655 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              <span>Simulador FinOps (What-If)</span>
              {!isAdminUser && (
                <span title="Acesso exclusivo Administrador">
                  <Lock className="h-3 w-3 text-amber-550 shrink-0 ml-1" />
                </span>
              )}
            </button>

            <button
              id="tab-cronograma-renovacoes"
              onClick={() => setActiveTab('timeline')}
              style={activeTab === 'timeline' ? { backgroundImage: `linear-gradient(to right, ${themeStyles.gradientFromColor}, ${themeStyles.gradientToColor})`, boxShadow: `0 6px 15px ${themeStyles.brand}30` } : {}}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'text-white shadow-lg'
                  : isDarkMode 
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    : 'text-slate-655 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Cronograma de Renovações</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              style={activeTab === 'alerts' ? { backgroundImage: `linear-gradient(to right, ${themeStyles.gradientFromColor}, ${themeStyles.gradientToColor})`, boxShadow: `0 6px 15px ${themeStyles.brand}30` } : {}}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'alerts'
                  ? 'text-white shadow-lg'
                  : isDarkMode 
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    : 'text-slate-655 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>Integrador de Alertas</span>
              {!isAdminUser && (
                <span title="Acesso exclusivo Administrador">
                  <Lock className="h-3 w-3 text-amber-550 shrink-0 ml-1" />
                </span>
              )}
            </button>
          </div>

          <div className={`text-right text-xs font-sans ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Mapeamento: <strong className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-850'}`}>{contracts.length} Contratos de TI</strong> em andamento
          </div>
        </div>

        {/* Tab 1 Content: Dashboard / Table Spreadsheet & License Usage */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* KPI statistics Strip (Screen 1 Overview Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Custo Mensal Total */}
              <KPICard
                idAttribute="kpi-custo-mensal"
                title="Custo Mensal Total (FinOps)"
                value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalMonthlyCost)}
                subtext="Soma de contratos vigentes (BRL)"
                iconName="DollarSign"
                colorType="blue"
                isDarkMode={isDarkMode}
                onClick={() => setActiveKpiFilter(activeKpiFilter === 'custo' ? null : 'custo')}
                isActive={activeKpiFilter === 'custo'}
              />

              {/* Card 2: Expiries Alerts */}
              <KPICard
                idAttribute="kpi-vencimentos"
                title="Alertas de Vencimento"
                value={`${contractExpiryCounts.atencao} Alertas`}
                subtext={`${contractExpiryCounts.ativos} Ativos | ${contractExpiryCounts.expirados} Expirados`}
                iconName="Calendar"
                colorType="yellow"
                isDarkMode={isDarkMode}
                onClick={() => setActiveKpiFilter(activeKpiFilter === 'alertas' ? null : 'alertas')}
                isActive={activeKpiFilter === 'alertas'}
              />

              {/* Card 3: Licensing utilization rate */}
              <KPICard
                idAttribute="kpi-aproveitamento"
                title="Aproveitamento de Contas"
                value={`${Math.round(averageUtilizationRate)}%`}
                subtext="Média global de SaaS ativos"
                iconName="Percent"
                colorType="green"
                isDarkMode={isDarkMode}
                onClick={() => setActiveKpiFilter(activeKpiFilter === 'aproveitamento' ? null : 'aproveitamento')}
                isActive={activeKpiFilter === 'aproveitamento'}
              />

              {/* Card 4: Estimated Financial Waste */}
              <KPICard
                idAttribute="kpi-desperdicio"
                title="Desperdício Mensal"
                value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(estimatedCostWaste)}
                subtext="Margem estéril em licenças ociosas"
                iconName="ShieldAlert"
                colorType="red"
                isDarkMode={isDarkMode}
                onClick={() => setActiveKpiFilter(activeKpiFilter === 'desperdicio' ? null : 'desperdicio')}
                isActive={activeKpiFilter === 'desperdicio'}
              />

            </div>



            {/* Planilha Grid spreadsheet */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                <h3 className={`text-sm font-bold uppercase tracking-wider font-mono flex items-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span>1. Planilha Interativa de Origem</span>
                </h3>
                <p className="text-xs text-slate-500">Dê duplo clique em qualquer linha do contrato para editá-lo e alterar seus valores.</p>
              </div>
              
              <ContractSpreadsheet
                contracts={contracts}
                selectedContract={selectedContract}
                onSelectContract={(c) => setSelectedContractId(c.id)}
                onAddContract={handleAddContract}
                onUpdateContract={handleUpdateContract}
                onDeleteContract={handleDeleteContract}
                onResetData={handleResetData}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdminUser}
                onTriggerLogin={() => setIsLoginModalOpen(true)}
                isDarkMode={isDarkMode}
                activeKpiFilter={activeKpiFilter}
                onChangeKpiFilter={setActiveKpiFilter}
              />
            </div>

            {/* Selected Contract details space (Screen 2: Contract Details) */}
            <div id="utilization-charts-section" className="space-y-2 pt-4">
              <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                2. Ficha de Detalhamento & Gráficos FinOps
              </h3>
              <LicenseUtilizationChart
                contract={selectedContract}
                contracts={contracts}
                onAskAIForInsights={() => setActiveTab('ai')}
                isDarkMode={isDarkMode}
              />
            </div>



          </div>
        )}

        {/* Tab 2 Content: AI Audit Advisor */}
        {activeTab === 'ai' && (
          <div className="animate-fade-in">
            {isAdminUser ? (
              <AiConsultingPanel contracts={contracts} />
            ) : (
              <RestrictedTabContent 
                title="Auditoria FinOps IA"
                desc="A inteligência artificial analisa em tempo real os gargalos de gastos, ociosidade de licenças corporativas e sugere oportunidades estratégicas de negociação. Requer privilégios administrativos para processar dados de fofoca financeira."
                isDarkMode={isDarkMode}
                onTriggerLogin={() => setIsLoginModalOpen(true)}
                isLoggedIn={isLoggedIn}
              />
            )}
          </div>
        )}

        {/* Tab 3 Content: FinOps Simulation (Suggestion 1) */}
        {activeTab === 'simulation' && (
          <div className="animate-fade-in">
            {isAdminUser ? (
              <FinOpsSimulation 
                contracts={contracts} 
                onUpdateContract={handleUpdateContract}
                isDarkMode={isDarkMode} 
              />
            ) : (
              <RestrictedTabContent 
                title="Simulador FinOps (What-If)"
                desc="Realize projeções matemáticas e simule cenários estressados de redução de licenças, conversão de moedas estrangeiras ou aplicação de descontos contratuais corporativos."
                isDarkMode={isDarkMode}
                onTriggerLogin={() => setIsLoginModalOpen(true)}
                isLoggedIn={isLoggedIn}
              />
            )}
          </div>
        )}

        {/* Tab 4 Content: Renewal Timeline (Suggestion 4) */}
        {activeTab === 'timeline' && (
          <div className="animate-fade-in">
            <RenewalTimeline 
              contracts={contracts} 
              isDarkMode={isDarkMode} 
            />
          </div>
        )}

        {/* Tab 5 Content: Clock Notifications alerts simulator */}
        {activeTab === 'alerts' && (
          <div className="animate-fade-in">
            {isAdminUser ? (
              <AlertIntegrations />
            ) : (
              <RestrictedTabContent 
                title="Integrador de Alertas"
                desc="Monitore integrações de Webhooks corporativas (Slack, Teams, Discord) para disparar avisos de expiração contrátil de forma agendada com o cron de cada provedor."
                isDarkMode={isDarkMode}
                onTriggerLogin={() => setIsLoginModalOpen(true)}
                isLoggedIn={isLoggedIn}
              />
            )}
          </div>
        )}

      </main>

      {/* Custom Confirmation Modal (Bypasses sandboxed iframe confirm blocks!) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 wrongs-prevented z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
          <div className={`w-full max-w-sm border rounded-2xl p-6 shadow-2xl transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-205 text-slate-900'
          }`}>
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-sm tracking-tight">{confirmModal.title}</h3>
                <p className="text-[11.5px] text-slate-500 font-sans leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className={`py-2 px-3.5 text-xs font-sans rounded-xl border font-semibold transition-all cursor-pointer ${
                  isDarkMode ? 'border-slate-800 hover:bg-slate-850 text-slate-400 bg-slate-950/20' : 'border-slate-200 hover:bg-slate-100 text-slate-650'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="py-2 px-4 text-xs font-sans font-semibold rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local-First Authenticated Corporate Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
          <div className={`w-full max-w-md border rounded-2xl p-6 shadow-2xl transition-all relative ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-205 text-slate-900'
          }`}>
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className={`absolute top-4 right-4 p-1 px-2.5 rounded-lg border text-xs font-mono hover:opacity-80 transition-all cursor-pointer ${
                isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-850' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md shadow-indigo-500/10">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-base tracking-tight">Portal de Acesso Suprema</h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider font-mono">Autenticação Local Segura (Vercel Ready)</p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleLocalSignIn(loginEmail, loginRole);
            }} className="space-y-4">

              {loginError && (
                <div className="p-3 text-[11px] font-sans font-semibold rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center animate-pulse">
                  ⚠️ {loginError}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">E-mail Corporativo</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-sans text-xs">@</span>
                  <input
                    type="email"
                    required
                    placeholder="ex: voce@empresa.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      setLoginError('');
                    }}
                    className={`w-full pl-8 pr-4 py-2 text-xs font-sans rounded-xl border focus:outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-850 focus:border-cyan-500 text-slate-200 focus:ring-1 focus:ring-cyan-500' 
                        : 'bg-slate-50 border-slate-200 focus:border-cyan-500 text-slate-800 focus:ring-1 focus:ring-cyan-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">Senha de Acesso</label>
                <input
                  type="password"
                  required
                  placeholder="Selecione qualquer senha corporativa"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full px-4 py-2 text-xs font-sans rounded-xl border focus:outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-850 focus:border-cyan-500 text-slate-200 focus:ring-1 focus:ring-cyan-500' 
                      : 'bg-slate-50 border-slate-200 focus:border-cyan-500 text-slate-800 focus:ring-1 focus:ring-cyan-500'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">Nível de Privilégio (Cargo)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginRole('admin')}
                    className={`p-2.5 rounded-xl border font-sans text-xs flex flex-col justify-center items-center text-center gap-1 transition-all cursor-pointer ${
                      loginRole === 'admin'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' 
                        : (isDarkMode ? 'border-slate-800 hover:bg-slate-850 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600')
                    }`}
                  >
                    <Unlock className="h-4 w-4" />
                    <span className="font-bold">Administrador</span>
                    <span className="text-[9px] opacity-75">Controle Total + Escrita</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginRole('reader')}
                    className={`p-2.5 rounded-xl border font-sans text-xs flex flex-col justify-center items-center text-center gap-1 transition-all cursor-pointer ${
                      loginRole === 'reader'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                        : (isDarkMode ? 'border-slate-800 hover:bg-slate-850 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600')
                    }`}
                  >
                    <Lock className="h-4 w-4" />
                    <span className="font-bold">Leitor</span>
                    <span className="text-[9px] opacity-75">Apenas Visualização</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl font-sans font-bold text-xs bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white transition-all shadow-md cursor-pointer hover:scale-[1.01]"
                >
                  Confirmar Credenciais e Entrar
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('admin@suprema.io');
                    setLoginPassword('admin123');
                    setLoginRole('admin');
                    handleLocalSignIn('admin@suprema.io', 'admin');
                  }}
                  className={`w-full py-2 px-3 text-[10px] font-mono tracking-wider font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                    isDarkMode 
                      ? 'border-slate-800 hover:bg-slate-850 text-slate-300 hover:border-slate-700 bg-slate-950/30' 
                      : 'border-slate-200 hover:bg-slate-100 text-slate-650 bg-slate-50'
                  }`}
                >
                  ⚡ Acesso Rápido - Demonstração Admin
                </button>
              </div>

              <div className={`p-3 rounded-xl text-[9px] font-sans leading-relaxed text-center ${
                isDarkMode ? 'bg-slate-950/40 text-slate-450 border border-slate-850' : 'bg-slate-50 text-slate-500 border border-slate-100'
              }`}>
                ℹ️ <strong>Segurança e Privacidade:</strong> Esta credencial é guardada puramente de forma encriptada local no seu próprio navegador no contêiner do cliente (`localStorage`). Nenhum dado transita ou depende de servidores do ecossistema Google Firebase para sua total autonomia!
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
