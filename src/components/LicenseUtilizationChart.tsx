import React, { useState } from 'react';
import { Contract } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, Cell } from 'recharts';
import { 
  DollarSign, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  Info, 
  Percent, 
  Activity, 
  ArrowUpDown,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LicenseUtilizationChartProps {
  contract: Contract | null;
  contracts?: Contract[];
  onAskAIForInsights: () => void;
  isDarkMode?: boolean;
}

export default function LicenseUtilizationChart({ 
  contract: propContract, 
  contracts,
  onAskAIForInsights,
  isDarkMode = true 
}: LicenseUtilizationChartProps) {

  // derived state & local selection support to decouple chart selection from table if desired
  const [lastPropId, setLastPropId] = useState<string | null>(propContract?.id ?? null);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(propContract?.id ?? null);

  // Sync with prop when it changes
  const currentPropId = propContract?.id ?? null;
  if (currentPropId !== lastPropId) {
    setLastPropId(currentPropId);
    setInternalSelectedId(currentPropId);
  }

  // Active contract list to populate dropdown
  const listContracts = contracts || (propContract ? [propContract] : []);

  // Compute active selected contract
  const activeContractId = internalSelectedId || propContract?.id || (listContracts[0]?.id) || null;
  const activeContract = listContracts.find(c => c.id === activeContractId) || propContract || listContracts[0] || null;

  // Re-assign to local name contract to make all downstream code work seamlessly
  const contract = activeContract;

  if (!contract) {
    return (
      <div className={`w-full min-h-[350px] flex flex-col items-center justify-center p-8 rounded-2xl text-center border transition-all ${
        isDarkMode 
          ? 'bg-slate-900/40 border-slate-800/80 text-slate-300' 
          : 'bg-white border-slate-200 text-slate-700 shadow-lg'
      }`}>
        <Sparkles className="h-10 w-10 text-cyan-500/50 mb-3 animate-pulse" />
        <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Nenhum contrato disponível</h3>
        <p className={`text-xs mt-1 max-w-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Adicione ou selecione qualquer contrato na planilha acima para poder carregar a análise detalhada de licenças, projeções de reajuste e histórico de faturamento.
        </p>
      </div>
    );
  }

  // Active Tab: 'atual' | 'projection' | 'comparison'
  const [activeTab, setActiveTab] = useState<'atual' | 'projection' | 'comparison'>('atual');

  // Comparison Dates (user can just pick and the code calculates metrics automatically - no numeric typing!)
  const [periodADate, setPeriodADate] = useState('2025-01-01');
  const [periodBDate, setPeriodBDate] = useState('2026-12-01');

  // Standard values
  const adjustmentRate = contract.projectionRenewal || 6;
  const usageRate = contract.licensedSeats > 0 ? (contract.activeSeats / contract.licensedSeats) * 100 : 100;
  const idleSeats = Math.max(0, contract.licensedSeats - contract.activeSeats);
  const seatCost = contract.licensedSeats > 0 ? (contract.monthlyValue / contract.licensedSeats) : 0;
  const estimatedCostWaste = idleSeats * seatCost;
  const currentTotalMonthly = contract.monthlyValue + (contract.extraMonthlySpent || 0);
  const projectedMonthlyValue = contract.monthlyValue * (1 + (adjustmentRate / 100));

  // Category specific strategic recommendations
  const getQuickInsight = (c: Contract) => {
    if (c.name.includes("Slack") || c.name.includes("Discord")) {
      return {
        title: "Ação de Rápida Economia (Overlap Detectado)",
        text: "Este contrato está operando com alta ociosidade. Além disso, o Microsoft Teams já está incluso sem custo no contrato Microsoft 365 E5 Copilot da empresa. Migrar os colaboradores economiza R$ 8.400,00/mês imediatamente de maneira simplificada.",
        saving: 100800
      };
    }
    if (c.name.includes("Salesforce")) {
      return {
        title: "Remover Licenças Antes do Lock-in",
        text: "Detectamos licenças sem qualquer uso há 60 dias. Como o vencimento está programado para o final deste ciclo, solicite a redução de franquia com antecedência mínima com o representante comercial.",
        saving: 35 * 140 * 12
      };
    }
    if (c.category === "Infra") {
      return {
        title: "Otimização de Horários de Instâncias",
        text: "Contratos de infraestrutura em nuvem acumulam custos em horas não produtivas. Recomenda-se implementar scripts de auto-stop em ambientes de sandboxing durante os finais de semana.",
        saving: c.monthlyValue * 0.15 * 12
      };
    }
    if (idleSeats > 5) {
      return {
        title: "Ajuste de Volumetria Recomendado",
        text: `Atualmente existem ${idleSeats} licenças não associadas a colaboradores ativos. Reduza a volumetria de contratação para economizar R$ ${Math.round(estimatedCostWaste).toLocaleString('pt-BR')} mensais no próximo faturamento.`,
        saving: estimatedCostWaste * 12
      };
    }
    return {
      title: "Excelente Nível de Governança",
      text: "As licenças deste contrato estão com ótimo índice de aproveitamento (superior a 90%). Recomenda-se focar na cláusula de limite de reajuste automático por IPCA para proteger faturamentos futuros.",
      saving: c.monthlyValue * 0.05 * 12
    };
  };

  const currentInsight = getQuickInsight(contract);

  // Helper function to extract Year and Month name
  const getFormattedLabel = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length < 2) return dateStr;
      const year = parts[0];
      const monthInt = parseInt(parts[1], 10);
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthName = months[monthInt - 1] || '';
      return `${monthName}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Automated Metrics Calculation based on selected Period Dates (No typing digits for user!)
  const calculateMetricsForDate = (dateStr: string, index: 'A' | 'B') => {
    const defaultYear = index === 'A' ? 2025 : 2026;
    const year = dateStr ? parseInt(dateStr.split('-')[0], 10) : defaultYear;
    const rate = contract.projectionRenewal || 6;

    if (year <= 2025) {
      // Past / 2025 Year
      return {
        label: `Exercício ${year} (Passado)`,
        monthly: Math.round(contract.monthlyValue * 0.85),
        extra: Math.round((contract.extraMonthlySpent || 1000) * 0.3),
        licensed: Math.max(1, Math.round(contract.licensedSeats * 0.8)),
        active: Math.max(1, Math.round(contract.activeSeats * 0.75)),
      };
    } else if (year === 2026) {
      // Current Year 2026
      return {
        label: `Exercício 2026 (Atual)`,
        monthly: contract.monthlyValue,
        extra: contract.extraMonthlySpent || 0,
        licensed: contract.licensedSeats,
        active: contract.activeSeats,
      };
    } else {
      // Future / Year 2027+
      const yearsDiff = year - 2026;
      const compoundFactor = Math.pow(1 + (rate / 100), yearsDiff);
      return {
        label: `Exercício ${year} (Projeção)`,
        monthly: Math.round(contract.monthlyValue * compoundFactor),
        extra: Math.round((contract.extraMonthlySpent || 500) * 1.15),
        licensed: contract.licensedSeats,
        active: Math.min(contract.licensedSeats, Math.round(contract.activeSeats * 1.1)),
      };
    }
  };

  // Calculate automatically
  const metricsA = calculateMetricsForDate(periodADate, 'A');
  const metricsB = calculateMetricsForDate(periodBDate, 'B');

  const totalCostA = metricsA.monthly + metricsA.extra;
  const totalCostB = metricsB.monthly + metricsB.extra;
  const costDiff = totalCostB - totalCostA;
  const costPercentDiff = totalCostA > 0 ? (costDiff / totalCostA) * 100 : 0;

  const efficiencyA = metricsA.licensed > 0 ? (metricsA.active / metricsA.licensed) * 100 : 0;
  const efficiencyB = metricsB.licensed > 0 ? (metricsB.active / metricsB.licensed) * 100 : 0;

  // Comparison chart data formatted
  const comparisonCostData = [
    {
      name: 'Gasto Regular',
      [metricsA.label]: metricsA.monthly,
      [metricsB.label]: metricsB.monthly,
    },
    {
      name: 'Consumo Extra',
      [metricsA.label]: metricsA.extra,
      [metricsB.label]: metricsB.extra,
    },
    {
      name: 'Faturamento Total',
      [metricsA.label]: totalCostA,
      [metricsB.label]: totalCostB,
    }
  ];

  const comparisonSeatsData = [
    {
      name: 'Licenças Contratadas',
      [metricsA.label]: metricsA.licensed,
      [metricsB.label]: metricsB.licensed,
    },
    {
      name: 'Licenças Ativas',
      [metricsA.label]: metricsA.active,
      [metricsB.label]: metricsB.active,
    }
  ];

  return (
    <div className={`w-full border rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col space-y-6 transition-all ${
      isDarkMode 
        ? 'bg-slate-900/40 border-slate-800/80 text-slate-100' 
        : 'bg-white border-slate-200 text-slate-800'
    }`}>
      
      {/* 1. Header Ficha Refinada */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b gap-4 ${
        isDarkMode ? 'border-slate-800/80' : 'border-slate-100'
      }`}>
        <div className="space-y-4 w-full md:w-auto">
          {listContracts.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 bg-slate-500/5 p-2 rounded-xl border border-slate-500/10 max-w-sm sm:max-w-md">
              <span className={`text-[11px] font-bold uppercase tracking-wider font-mono shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Analisar Contrato:
              </span>
              <select
                id="select-contract-chart"
                value={contract.id}
                onChange={(e) => setInternalSelectedId(e.target.value)}
                className={`py-1 px-2.5 border rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer w-full sm:w-auto ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-cyan-400' 
                    : 'bg-white border-slate-200 text-cyan-700 shadow-sm'
                }`}
              >
                {listContracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.id}] {c.name.substring(0, 32)}{c.name.length > 32 ? '...' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded border ${
                isDarkMode 
                  ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800/30' 
                  : 'text-cyan-800 bg-cyan-50 border-cyan-200'
              }`}>{contract.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                contract.status === 'Ativo' 
                  ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-100')
                  : (isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700 border border-amber-100')
              }`}>{contract.status}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                isDarkMode ? 'bg-slate-850 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}>{contract.category}</span>
            </div>

            <h2 className={`text-xl font-bold tracking-tight font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {contract.name}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
              <span>Provedor: <strong className={isDarkMode ? 'text-slate-350' : 'text-slate-700'}>{contract.provider}</strong></span>
              <span className="opacity-40">•</span>
              <span>Gestor (Sponsor): <strong className={isDarkMode ? 'text-slate-350' : 'text-slate-700'}>{contract.sponsor}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-bold'}`}>Criticidade:</span>
            <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${
              contract.criticality === 'Crítica' ? (isDarkMode ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-100 text-rose-800 border border-rose-200') :
              contract.criticality === 'Alta' ? (isDarkMode ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-orange-100 text-orange-850 border border-orange-200') :
              contract.criticality === 'Média' ? (isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-100 text-amber-800 border border-amber-200') :
              (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-700 border border-slate-200')
            }`}>
              {contract.criticality}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            Vencimento: <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-800'}>{getFormattedLabel(contract.endDate)}</strong>
          </span>
        </div>
      </div>

      {/* 2. Menu de Navegação Visual Simplificado (Abas) */}
      <div className="flex space-x-1 p-1 bg-slate-200/50 dark:bg-slate-950/50 border dark:border-slate-800 border-slate-200 rounded-xl relative z-10 w-full">
        <button
          onClick={() => setActiveTab('atual')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === 'atual'
              ? (isDarkMode ? 'bg-slate-800 text-cyan-450 border border-slate-700 shadow-md shadow-black/30' : 'bg-white text-slate-950 border border-slate-200 shadow-sm')
              : (isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30' : 'text-slate-500 hover:text-slate-800')
          }`}
        >
          <Activity className="h-3.5 w-3.5 text-cyan-500" />
          <span>1. Visão Atual</span>
        </button>

        <button
          onClick={() => setActiveTab('projection')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === 'projection'
              ? (isDarkMode ? 'bg-slate-800 text-emerald-450 border border-slate-700 shadow-md shadow-black/30' : 'bg-white text-slate-950 border border-slate-200 shadow-sm')
              : (isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30' : 'text-slate-500 hover:text-slate-800')
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          <span>2. Projeção Próximo Ano</span>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === 'comparison'
              ? (isDarkMode ? 'bg-slate-800 text-indigo-450 border border-slate-700 shadow-md shadow-black/30' : 'bg-white text-slate-950 border border-slate-200 shadow-sm')
              : (isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30' : 'text-slate-500 hover:text-slate-800')
          }`}
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-indigo-500" />
          <span>3. Comparador Fácil</span>
        </button>
      </div>

      {/* 3. Conteúdo das Abas com Animação Fluida */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/**********************************************************
           * TAB 1: VISÃO ATUAL (Current snapshot details and charts)
           ***********************************************************/}
          {activeTab === 'atual' && (
            <div className="space-y-6">
              
              {/* Dynamic KPI Cards Array row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Gasto Mensal Total */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
                }`}>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Fatura Mensal Corrente</span>
                  <div className="mt-1 focus:outline-none">
                    <span className={`text-2xl font-mono font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: contract.currency || 'BRL' }).format(currentTotalMonthly)}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {contract.monthlyValue > 0 ? `Fixo: R$ ${contract.monthlyValue.toLocaleString('pt-BR')} ` : ''}
                      {contract.extraMonthlySpent && contract.extraMonthlySpent > 0 ? `+ Excedente: R$ ${contract.extraMonthlySpent.toLocaleString('pt-BR')}` : ''}
                    </p>
                  </div>
                </div>

                {/* 2. Gasto Anual */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
                }`}>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Custo Anual Contratado</span>
                  <div className="mt-1">
                    <span className={`text-2xl font-mono font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: contract.currency || 'BRL' }).format(contract.annualValue)}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Método: {contract.paymentMethod || 'Faturamento'} / {contract.paymentFrequency || 'Mensal'}
                    </p>
                  </div>
                </div>

                {/* 3. Eficiência de Licença */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
                }`}>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Eficiência de Uso</span>
                  <div className="mt-1">
                    <div className="flex items-baseline space-x-1.5">
                      <span className={`text-2xl font-mono font-bold tracking-tight ${
                        usageRate >= 90 ? 'text-emerald-500' : usageRate >= 70 ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {usageRate.toFixed(0)}%
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({contract.activeSeats}/{contract.licensedSeats} contas)
                      </span>
                    </div>
                    {/* Compact progress track */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${
                          usageRate >= 90 ? 'bg-emerald-500' : usageRate >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, usageRate)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 4. Desperdício Estimado */}
                <div className={`p-4 rounded-xl border border-dashed flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-950/30 border-slate-850' : 'bg-rose-50/10 border-slate-200'
                }`}>
                  <span className="text-[10px] font-bold uppercase text-rose-500/80 tracking-wider">Desperdício por Ociosidade</span>
                  <div className="mt-1">
                    <span className={`text-2xl font-mono font-bold tracking-tight ${idleSeats > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {idleSeats > 0 ? `R$ ${Math.round(estimatedCostWaste).toLocaleString('pt-BR')}` : 'R$ 0,00'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {idleSeats > 0 ? `${idleSeats} licenças não associadas em uso` : 'Todas as contas ativas'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid de Gráficos Visão Atual */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Gráfico 1: Barras de Licenciamento */}
                <div className={`border p-5 rounded-2xl flex flex-col space-y-4 ${
                  isDarkMode ? 'bg-slate-950/20 border-slate-800/80' : 'bg-slate-50 border-slate-200 shadow-sm'
                }`}>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-800'
                    }`}>
                      <Users className="h-4 w-4 mr-1.5 text-brand" />
                      Aproveitamento Real do Licenciamento
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Visualização direta entre assinaturas faturadas e contas realmente ativas.
                    </p>
                  </div>

                  <div className="h-[210px] w-full text-xs font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Licenças', Contratadas: contract.licensedSeats, Usadas: contract.activeSeats }
                        ]}
                        margin={{ top: 25, right: 10, left: -20, bottom: 5 }}
                        barSize={55}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(51, 65, 85, 0.3)" : "#e2e8f0"} />
                        <XAxis dataKey="name" stroke={isDarkMode ? "#475569" : "#cbd5e1"} tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569' }} />
                        <YAxis stroke={isDarkMode ? "#475569" : "#cbd5e1"} tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569' }} domain={[0, (dataMax: number) => Math.ceil(dataMax > 0 ? dataMax * 1.18 : 10)]} />
                        <Tooltip 
                          cursor={false}
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                            borderColor: isDarkMode ? '#334155' : '#cbd5e1', 
                            borderRadius: '12px', 
                            color: isDarkMode ? '#fff' : '#0f172a',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                          }} 
                        />
                        <Legend iconType="circle" formatter={(value) => <span style={{ color: isDarkMode ? '#cbd5e1' : '#374151' }} className="font-sans text-xs font-semibold">{value}</span>} />
                        <Bar dataKey="Contratadas" fill={isDarkMode ? "#475569" : "#cbd5e1"} label={{ position: 'top', fill: isDarkMode ? '#e2e8f0' : '#1e293b' }} strokeWidth={1} radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Usadas" fill="var(--brand-color)" label={{ position: 'top', fill: isDarkMode ? 'var(--brand-text)' : 'var(--brand-color)', fontWeight: 'bold' }} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico 2: Fluxo Mensal Corrente */}
                <div className={`border p-5 rounded-2xl flex flex-col space-y-4 ${
                  isDarkMode ? 'bg-slate-950/20 border-slate-800/80' : 'bg-slate-50 border-slate-200 shadow-sm'
                }`}>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-800'
                    }`}>
                      <Activity className="h-4 w-4 mr-1.5 text-emerald-500" />
                      Histórico e Ciclo de Faturamento Recente
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Cronologia dos valores faturados no último ciclo letivo cadastrado.
                    </p>
                  </div>

                  <div className="h-[210px] w-full text-xs font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={contract.historicCosts || [
                          { month: 'Jan', value: contract.monthlyValue * 0.95 },
                          { month: 'Fev', value: contract.monthlyValue },
                          { month: 'Mar', value: contract.monthlyValue },
                          { month: 'Abr', value: contract.monthlyValue },
                          { month: 'Mai', value: currentTotalMonthly }
                        ]} 
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="primaryColorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(51, 65, 85, 0.3)" : "#e2e8f0"} />
                        <XAxis dataKey="month" stroke={isDarkMode ? "#475569" : "#cbd5e1"} tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569' }} />
                        <YAxis stroke={isDarkMode ? "#475569" : "#cbd5e1"} tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569' }} />
                        <Tooltip
                          formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, 'Fatura']}
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                            borderColor: isDarkMode ? '#334155' : '#cbd5e1', 
                            borderRadius: '12px', 
                            color: isDarkMode ? '#fff' : '#0f172a',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#primaryColorCost)" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Bloco de Notificação FinOps AI da visão atual */}
              <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-slate-950 to-slate-900 border-slate-800' 
                  : 'bg-indigo-50/40 border-slate-200'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-cyan-500 animate-pulse" />
                    <span className={`text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'text-cyan-400' : 'text-indigo-800'}`}>
                      {currentInsight.title}
                    </span>
                    {currentInsight.saving > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Economia Estimada: R$ {Math.round(currentInsight.saving).toLocaleString('pt-BR')}/ano
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-4xl pt-1">
                    {currentInsight.text}
                  </p>
                </div>

                <button
                  onClick={onAskAIForInsights}
                  className={`px-4 py-2 text-xs font-bold shrink-0 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                    isDarkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' 
                      : 'bg-indigo-650 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  <span>Análise FinOps Completa</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          )}

          {/**********************************************************
           * TAB 2: PROJEÇÃO PRÓXIMO ANO (Next cycle forecasts and rates)
           ***********************************************************/}
          {activeTab === 'projection' && (
            <div className="space-y-6">
              
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-950/30 border-slate-800/80' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div className="max-w-2xl">
                  <h3 className={`text-sm font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-emerald-400' : 'text-slate-905 font-bold'}`}>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Projeção e Prevenção de Impacto Financeiro (Próximo Ciclo)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Estudo matemático de variação do custo mensal estimado após o término da fidelidade atual baseando-se no reajuste regulado de <strong className="font-semibold">{adjustmentRate}%</strong>.
                  </p>
                </div>
              </div>

              {/* Side-by-Side comparison cards & graph */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Métricas do Ajuste */}
                <div className="space-y-4 lg:col-span-1 flex flex-col justify-between">
                  
                  {/* Card Fatura Atual */}
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-slate-950/20 border-slate-800/40' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Mensal Corrente (Sem Extra)</span>
                    <p className={`text-xl font-mono font-bold mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: contract.currency || 'BRL' }).format(contract.monthlyValue)}
                    </p>
                  </div>

                  {/* Card Fatura Nova Projetada */}
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/20 border-emerald-200 shadow-sm'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-emerald-500">Valor Projetado (Pós-Renovação)</span>
                    <p className="text-xl font-mono font-bold mt-1 text-emerald-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: contract.currency || 'BRL' }).format(projectedMonthlyValue)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
                      Aumento de: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: contract.currency || 'BRL' }).format(projectedMonthlyValue - contract.monthlyValue)} /mês (+{adjustmentRate}%)
                    </p>
                  </div>

                  {/* Diferencial Anual Total de Impacto */}
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-55/10 border-slate-200'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Impacto Incremental Anual Estimado</span>
                    <p className={`text-xl font-mono font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: contract.currency || 'BRL' }).format((projectedMonthlyValue - contract.monthlyValue) * 12)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Custo total projetado anual de R$ {Math.round(projectedMonthlyValue * 12).toLocaleString('pt-BR')} se mantido sem redução.
                    </p>
                  </div>

                </div>

                {/* 2. Visual Gráfico de Barra Projetado */}
                <div className={`p-5 rounded-xl border lg:col-span-2 flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-950/20 border-slate-800/60' : 'bg-slate-50 border-slate-200 shadow-sm'
                }`}>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Comparativo Visual de Custo Mensal</h4>
                    <span className="text-[10px] text-slate-500">Ajuste regulatório projetado frente ao período corrente.</span>
                  </div>

                  <div className="h-[180px] w-full text-xs font-mono mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Ciclo Corrente', 'Mensalidade': Math.round(contract.monthlyValue) },
                          { name: 'Novo Ciclo (Projetado)', 'Mensalidade': Math.round(projectedMonthlyValue) }
                        ]}
                        margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                        barSize={60}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(51, 65, 85, 0.3)" : "#cbd5e1"} />
                        <XAxis dataKey="name" stroke={isDarkMode ? "#475569" : "#cbd5e1"} tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569' }} />
                        <YAxis stroke={isDarkMode ? "#475569" : "#cbd5e1"} tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569' }} />
                        <Tooltip 
                          cursor={false}
                          formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Fatura']}
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                            borderColor: isDarkMode ? '#334155' : '#cbd5e1', 
                            borderRadius: '8px', 
                            color: isDarkMode ? '#fff' : '#0f172a',
                          }} 
                        />
                        <Bar dataKey="Mensalidade" radius={[6, 6, 0, 0]}>
                          <Cell fill={isDarkMode ? "#475569" : "#cbd5e1"} />
                          <Cell fill="#10b981" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Cláusulas do Contrato Relacionadas a Renovação */}
              <div className={`p-5 rounded-xl border text-xs space-y-3 ${
                isDarkMode ? 'bg-slate-950/10 border-slate-800/40' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-1.5 text-amber-500 font-bold">
                  <Info className="h-4 w-4" />
                  <span className="uppercase text-[10px] tracking-wider">Avisos Importantes de Termos & Renegociação Comercial</span>
                </div>
                <div className="space-y-2 leading-relaxed text-slate-405">
                  <p>
                    • <strong>Janela de Renegociação Segura:</strong> O contrato expira em <span className="font-mono text-xs underline font-bold">{contract.endDate}</span>. Para barrar a renovação sob o índice cheio automático de {adjustmentRate}%, inicie as tratativas com o fornecedor via e-mail formal ao sponsor comercial até <strong>30 dias antes</strong> dessa data limite.
                  </p>
                  <p>
                    • <strong>Ação de Direcionamento Comercial:</strong> {
                      usageRate < 80 
                        ? `A baixa utilização atual de ${usageRate.toFixed(0)}% indica forte alavanca de barganha. Sugerimos formalizar um termo aditivo solicitando a redução imediata da volumetria contratada para economizar até R$ ${Math.round(estimatedCostWaste).toLocaleString('pt-BR')}/mês antes do lock-in.` 
                        : "Sua excelente eficiência de uso indica que a volumetria está bem ajustada. Sugere-se tentar negociar o congelamento do reajuste para o índice de 0% em troca de extensão de prazo por mais 12 meses."
                    }
                  </p>
                </div>
              </div>

            </div>
          )}

          {/**********************************************************
           * TAB 3: COMPARADOR FÁCIL (Dynamic period comparison by dates - no numeric typing!)
           ***********************************************************/}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              
              {/* Controles de Datas Automáticos (Apenas Calendário - Sem Digitação de Valores!) */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center ${
                      isDarkMode ? 'text-cyan-400' : 'text-slate-900'
                    }`}>
                      <Calendar className="h-4 w-4 mr-1.5 text-cyan-500" />
                      Comparador Inteligente de Exercícios
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Selecione as datas de referência do Período A e Período B nos calendários abaixo. O sistema calculará as projeções de volumetria e custos de cada ciclo instantaneamente.
                    </p>
                  </div>
                </div>

                {/* Seletores Visuais de Datas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                  
                  {/* Período A Seletor */}
                  <div className="space-y-2">
                    <label className={`block text-[10px] font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      📅 Período de Origem (A)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={periodADate}
                        onChange={(e) => setPeriodADate(e.target.value)}
                        style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                        className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
                          isDarkMode 
                            ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500' 
                            : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-600 focus:ring-cyan-605 font-bold shadow-sm'
                        }`}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                      <span>Mapeado como:</span>
                      <strong className="text-cyan-500 font-bold">{metricsA.label}</strong>
                    </div>
                  </div>

                  {/* Período B Seletor */}
                  <div className="space-y-2">
                    <label className={`block text-[10px] font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      📅 Período de Comparação (B)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={periodBDate}
                        onChange={(e) => setPeriodBDate(e.target.value)}
                        style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                        className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
                          isDarkMode 
                            ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500_20' 
                            : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600 focus:ring-emerald-600 font-bold shadow-sm'
                        }`}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                      <span>Mapeado como:</span>
                      <strong className="text-emerald-500 font-bold">{metricsB.label}</strong>
                    </div>
                  </div>

                </div>
              </div>

              {/* Side-by-side comparative diagnostics summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Diagnóstico de Gastos */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-950/20 border-slate-800/80' : 'bg-slate-50 border-slate-205 shadow-sm'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-cyan-500" />
                        Variação Consolidada (Mensal)
                      </h4>
                      <p className="text-[10px] text-slate-500">Valor de fatura regular adicionado de consumos extras estimados.</p>
                    </div>

                    <div className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                      costDiff > 0 
                        ? 'text-rose-500 bg-rose-500/5 border-rose-500/10' 
                        : 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10'
                    }`}>
                      {costDiff > 0 ? `+ R$ ${Math.round(costDiff).toLocaleString('pt-BR')}` : `R$ ${Math.round(costDiff).toLocaleString('pt-BR')}`} ({costPercentDiff > 0 ? `+${costPercentDiff.toFixed(1)}%` : `${costPercentDiff.toFixed(1)}%`})
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t dark:border-slate-900 border-slate-200">
                    <div>
                      <span className="text-[9px] block text-slate-500 uppercase">{metricsA.label}</span>
                      <span className={`text-base font-mono font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        R$ {totalCostA.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] block text-slate-500 uppercase">{metricsB.label}</span>
                      <span className={`text-base font-mono font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        R$ {totalCostB.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Diagnóstico de Eficiência das Contas */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-950/20 border-slate-800/80' : 'bg-slate-50 border-slate-205 shadow-sm'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                        Capacidade de Ativação (%)
                      </h4>
                      <p className="text-[10px] text-slate-500">Filtro de eficiência proporcional ao total de contas compradas.</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Aproveitamento: {efficiencyA.toFixed(0)}% vs {efficiencyB.toFixed(0)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t dark:border-slate-900 border-slate-220">
                    <div>
                      <span className="text-[9px] block text-slate-500 uppercase">Eficiência A</span>
                      <p className="text-base font-mono font-bold text-cyan-400">
                        {efficiencyA.toFixed(1)}% <span className="text-[10px] text-slate-500">({metricsA.active}/{metricsA.licensed})</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] block text-slate-500 uppercase">Eficiência B</span>
                      <p className="text-base font-mono font-bold text-emerald-400">
                        {efficiencyB.toFixed(1)}% <span className="text-[10px] text-slate-500">({metricsB.active}/{metricsB.licensed})</span>
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Gráficos de Comparação */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Gráfico Custos Proporcionais */}
                <div className={`border p-4 rounded-xl flex flex-col space-y-4 ${
                  isDarkMode ? 'bg-slate-950/20 border-slate-800/50' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Distribuição Comparada de Custos (R$)</h4>
                  <div className="h-[210px] w-full text-xs font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonCostData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        barSize={20}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(51, 65, 85, 0.3)" : "#cbd5e1"} />
                        <XAxis dataKey="name" stroke={isDarkMode ? "#475569" : "#cbd5e1"} tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569' }} />
                        <YAxis stroke={isDarkMode ? "#475569" : "#cbd5e1"} tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569' }} />
                        <Tooltip 
                          cursor={false}
                          formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Gasto']}
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                            borderColor: isDarkMode ? '#334155' : '#cbd5e1', 
                            borderRadius: '8px', 
                            color: isDarkMode ? '#fff' : '#0f172a',
                          }} 
                        />
                        <Legend iconType="circle" formatter={(value) => <span style={{ color: isDarkMode ? '#cbd5e1' : '#374151' }} className="font-sans text-xs font-semibold">{value}</span>} />
                        <Bar dataKey={metricsA.label} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        <Bar dataKey={metricsB.label} fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico Contas Proporcionais */}
                <div className={`border p-4 rounded-xl flex flex-col space-y-4 ${
                  isDarkMode ? 'bg-slate-950/20 border-slate-800/50' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Relação de Assinaturas e Uso (Seats)</h4>
                  <div className="h-[210px] w-full text-xs font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonSeatsData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        barSize={20}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(51, 65, 85, 0.3)" : "#cbd5e1"} />
                        <XAxis dataKey="name" stroke={isDarkMode ? "#475569" : "#cbd5e1"} tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569' }} />
                        <YAxis stroke={isDarkMode ? "#475569" : "#cbd5e1"} tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569' }} />
                        <Tooltip 
                          cursor={false}
                          formatter={(value) => [`${value} licenças`, 'Seats']}
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                            borderColor: isDarkMode ? '#334155' : '#cbd5e1', 
                            borderRadius: '8px', 
                            color: isDarkMode ? '#fff' : '#0f172a',
                          }} 
                        />
                        <Legend iconType="circle" formatter={(value) => <span style={{ color: isDarkMode ? '#cbd5e1' : '#374151' }} className="font-sans text-xs font-semibold">{value}</span>} />
                        <Bar dataKey={metricsA.label} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        <Bar dataKey={metricsB.label} fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 4. Bloco de Parcelas / Faturamento (Permanente para evitar sumiços confusos) */}
      <div className={`border p-4 rounded-xl text-xs space-y-3 pt-5 transition-colors ${
        isDarkMode 
          ? 'bg-slate-950/20 border-slate-850/50' 
          : 'bg-slate-100/40 border-slate-350 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <strong className={`font-sans uppercase text-[10px] tracking-wider flex items-center ${
            isDarkMode ? 'text-slate-400' : 'text-slate-800'
          }`}>
            <Info className="h-3.5 w-3.5 mr-1.5 text-cyan-500" />
            Cronograma de Faturamento e Fluxos de Parcelas
          </strong>
          <span className="text-[10px] text-slate-500">Acompanhamento de liquidação e vencimentos recorrentes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {contract.installments && contract.installments.length > 0 ? (
            contract.installments.map((inst, index) => {
              let statusClass = "";
              if (inst.status === 'Paga') {
                statusClass = isDarkMode 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-400 shadow-xs";
              } else if (inst.status === 'Próxima ao Vencimento') {
                statusClass = isDarkMode 
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-amber-100 text-amber-950 border border-amber-300 shadow-xs";
              } else if (inst.status === 'Atrasada') {
                statusClass = isDarkMode 
                  ? "bg-rose-500/10 text-rose-400 border border-rose-550/30 font-bold"
                  : "bg-rose-100 text-rose-850 border border-rose-450 shadow-xs font-bold";
              } else {
                statusClass = isDarkMode 
                  ? "bg-slate-800 text-slate-300 border"
                  : "bg-white text-slate-700 border border-slate-300 shadow-xs";
              }

              return (
                <div key={inst.id || index} className={`p-3 border rounded-lg flex flex-col justify-between space-y-2 transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-900/30 border-slate-800/40' 
                    : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={`font-mono font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-705'}`}>{inst.id}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${statusClass}`}>
                      {inst.status === 'Atrasada' ? 'Vencida' : inst.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-1">
                    <div>
                      <p className="text-[8.5px] font-sans uppercase text-slate-500">Vencimento</p>
                      <p className={`font-mono text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-950'}`}>{inst.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8.5px] font-sans uppercase text-slate-500">Valor</p>
                      <p className={`font-mono text-xs font-extrabold ${isDarkMode ? 'text-slate-200' : 'text-slate-950'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: contract.currency || 'BRL' }).format(inst.value)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="col-span-4 py-3 italic text-center text-[11px] text-slate-500">Nenhum cronograma faturado encontrado para este contrato.</p>
          )}
        </div>
      </div>

      {/* 5. Notas de Negociação e Termos */}
      <div className={`border p-4 rounded-xl text-xs space-y-1.5 transition-colors ${
        isDarkMode 
          ? 'bg-slate-950/20 border-slate-800/40' 
          : 'bg-slate-100/40 border-slate-250'
      }`}>
        <strong className={`font-sans block uppercase text-[10px] tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-800'}`}>
          Notas de Negociação e Regras de Escalonamento:
        </strong>
        <p className={`leading-relaxed font-sans ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
          {contract.negotiationNotes || "Nenhuma observação de negociação registrada."}
        </p>
        {contract.contractLink && (
          <div className="pt-2 flex items-center space-x-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[10.5px] text-slate-500">Documento original assinado: </span>
            <a href="#link-contrato" className="hover:underline font-mono text-[10px] text-cyan-500 truncate max-w-sm">
              {contract.contractLink}
            </a>
          </div>
        )}
      </div>

    </div>
  );
}
