import React, { useState, useMemo } from 'react';
import { Contract } from '../types';
import { 
  TrendingDown, 
  Settings2, 
  Check, 
  HelpCircle, 
  DollarSign, 
  ShieldCheck,
  ChevronRight, 
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FinOpsSimulationProps {
  contracts: Contract[];
  onUpdateContract: (updated: Contract) => void;
  isDarkMode?: boolean;
}

export default function FinOpsSimulation({ contracts, onUpdateContract, isDarkMode = true }: FinOpsSimulationProps) {
  // Select active contracts only for simulation (exclude those with monthly value of 0 or expired)
  const simulatedContractsOptions = useMemo(() => {
    return contracts.filter(c => c.status !== 'Expirado');
  }, [contracts]);

  const [selectedId, setSelectedId] = useState<string>(simulatedContractsOptions[0]?.id || '');
  
  // Find current active contract being simulated
  const currentContract = useMemo(() => {
    return contracts.find(c => c.id === selectedId) || null;
  }, [contracts, selectedId]);

  // Reset parameters when contract changes
  const [cutIdleSeatsPercentage, setCutIdleSeatsPercentage] = useState<number>(100);
  const [applyAnnualDiscount, setApplyAnnualDiscount] = useState<boolean>(false);
  const [extraNegotiatedDiscount, setExtraNegotiatedDiscount] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  React.useEffect(() => {
    setCutIdleSeatsPercentage(100);
    setApplyAnnualDiscount(false);
    setExtraNegotiatedDiscount(0);
    setNotification(null);
  }, [selectedId]);

  // Helper variables
  const maxIdleSeats = useMemo(() => {
    if (!currentContract) return 0;
    return Math.max(0, currentContract.licensedSeats - currentContract.activeSeats);
  }, [currentContract]);

  const seatCost = useMemo(() => {
    if (!currentContract || currentContract.licensedSeats <= 0) return 0;
    return currentContract.monthlyValue / currentContract.licensedSeats;
  }, [currentContract]);

  // Dynamic scenario simulation values
  const simulationResults = useMemo(() => {
    if (!currentContract) return { currentCost: 0, newCost: 0, monthlySavings: 0, annualSavings: 0, seatsSaved: 0, newLicensedSeats: 0 };

    const currentCost = currentContract.monthlyValue;
    
    // 1. Calculate seats cut
    const seatsToCut = Math.round(maxIdleSeats * (cutIdleSeatsPercentage / 100));
    const newLicensedSeats = Math.max(currentContract.activeSeats, currentContract.licensedSeats - seatsToCut);
    
    // Cost after seats cut
    let baseCost = currentContract.licensedSeats > 0 
      ? newLicensedSeats * seatCost 
      : currentContract.monthlyValue;

    // 2. Apply annual conversion check (simulates standard 15% discount)
    if (applyAnnualDiscount) {
      baseCost = baseCost * 0.85; // 15% discount
    }

    // 3. Apply manual extra discount negotiated percentage
    if (extraNegotiatedDiscount > 0) {
      baseCost = baseCost * (1 - (extraNegotiatedDiscount / 100));
    }

    const newCost = Math.max(0, baseCost);
    const monthlySavings = Math.max(0, currentCost - newCost);
    const annualSavings = monthlySavings * 12;

    return {
      currentCost,
      newCost,
      monthlySavings,
      annualSavings,
      seatsSaved: seatsToCut,
      newLicensedSeats
    };
  }, [currentContract, maxIdleSeats, cutIdleSeatsPercentage, applyAnnualDiscount, extraNegotiatedDiscount, seatCost]);

  // Apply optimizations to the actual spreadsheet for real functionality
  const handleApplyToSpreadsheet = () => {
    if (!currentContract) return;

    const updatedContract: Contract = {
      ...currentContract,
      licensedSeats: simulationResults.newLicensedSeats,
      monthlyValue: Math.round(simulationResults.newCost),
      annualValue: Math.round(simulationResults.newCost * 12),
      negotiationNotes: currentContract.negotiationNotes + 
        `\n[Otimização FinOps Aplicada]: Licenças de assentos ociosos reduzidas por ${cutIdleSeatsPercentage}%. ` +
        (applyAnnualDiscount ? 'Plano Anual Conversão simulado (15% desc). ' : '') +
        (extraNegotiatedDiscount > 0 ? `Desconto extra de ${extraNegotiatedDiscount}% renegociado.` : '')
    };

    onUpdateContract(updatedContract);
    
    setNotification(
      `Sucesso! O contrato "${currentContract.name}" foi otimizado com economia de ` +
      `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulationResults.monthlySavings)}/mês diretamente na planilha de origem.`
    );

    // Fade out notification
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  if (simulatedContractsOptions.length === 0) {
    return (
      <div className={`p-8 text-center rounded-2xl border ${
        isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <p className="text-slate-400">Não existem contratos válidos para simulação.</p>
      </div>
    );
  }

  // Calculate cumulative summary across all contracts to show potential platform-wide savings
  const globalOptimizeStats = useMemo(() => {
    let totalCurrent = 0;
    let totalWaste = 0;
    contracts.forEach(c => {
      if (c.status !== 'Expirado') {
        totalCurrent += c.monthlyValue;
        if (c.licensedSeats > 0 && c.activeSeats < c.licensedSeats) {
          const idle = c.licensedSeats - c.activeSeats;
          const costOfSeat = c.monthlyValue / c.licensedSeats;
          totalWaste += (idle * costOfSeat);
        }
      }
    });
    return { totalCurrent, totalWaste };
  }, [contracts]);

  return (
    <div className={`w-full p-6 border rounded-2xl shadow-2xl backdrop-blur-md space-y-8 font-sans ${
      isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-md'
    }`}>
      
      {/* Title */}
      <div>
        <span className="text-xs font-mono text-brand font-bold uppercase tracking-wider bg-brand/10 px-2.5 py-0.5 rounded border border-brand/20">Sugestão 1 Incorporada</span>
        <h2 className={`text-xl font-bold tracking-tight mt-1 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <TrendingDown className="h-5 w-5 text-brand animate-pulse-slow" />
          Simulador FinOps & Análise de Oportunidades "What-If"
        </h2>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Simule descontinuações, cortes de ociosidade ou alteração de faturamento anual para quantificar o valor de economia potencial corporativa.
        </p>
      </div>

      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-xl text-xs font-sans flex items-center justify-between border ${
            isDarkMode 
              ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-400' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs font-bold font-mono opacity-60 hover:opacity-100">✕</button>
        </motion.div>
      )}

      {/* Grid: Core controls & outcomes simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Controls & Selector (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Contract Selector */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className={`text-xs uppercase font-mono font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                1. Escolher Contrato para Simular Otimização:
              </label>
              <span className="text-[10px] font-mono text-brand font-semibold uppercase">Real-time Hook</span>
            </div>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-xs font-sans font-semibold border ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-1 focus:ring-brand/80 focus:outline-none'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-1 focus:ring-brand/80 focus:outline-none'
              }`}
            >
              {simulatedContractsOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - Sponsor: {c.sponsor.split(' ')[0]} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(c.monthlyValue)}/mês)
                </option>
              ))}
            </select>
          </div>

          {currentContract && (
            <div className={`p-4 rounded-xl border space-y-2.5 leading-relaxed text-xs transition-colors ${
              isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <div className={`flex justify-between items-center text-[10px] uppercase font-mono tracking-wider pb-1.5 border-b ${
                isDarkMode ? 'border-slate-800/40 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                <span>Metadados Atuais do Contrato</span>
                <span className={`px-1.5 rounded-md ${
                  currentContract.criticality === 'Crítica' ? 'bg-rose-500/10 text-rose-400' :
                  currentContract.criticality === 'Alta' ? 'bg-amber-500/10 text-amber-450' :
                  currentContract.criticality === 'Média' ? 'bg-blue-500/10 text-blue-450' :
                  'bg-slate-500/10 text-slate-400'
                }`}>Criticidade: {currentContract.criticality}</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-sans">
                <div>
                  <span className={`block opacity-80 text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Sponsor / Dono:</span>
                  <strong className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{currentContract.sponsor}</strong>
                </div>
                <div>
                  <span className={`block opacity-80 text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Chaves Contratadas:</span>
                  <strong className={`font-mono text-[11.5px] ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{currentContract.licensedSeats} licenças</strong>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className={`block opacity-80 text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Chaves em Atividade:</span>
                  <strong className={`${maxIdleSeats > 0 ? (isDarkMode ? 'text-amber-400' : 'text-amber-700') : (isDarkMode ? 'text-slate-200' : 'text-slate-900')} font-semibold font-mono text-[11.5px]`}>
                    {currentContract.activeSeats} activas ({currentContract.licensedSeats > 0 ? Math.round((currentContract.activeSeats / currentContract.licensedSeats) * 105) : 100}%)
                  </strong>
                </div>
              </div>
              
              {maxIdleSeats > 0 ? (
                <p className={`text-[10px] leading-relaxed font-sans p-2 rounded-lg border flex items-start gap-1 ${
                  isDarkMode 
                    ? 'text-amber-400 bg-amber-500/5 border-amber-500/10' 
                    : 'text-amber-800 bg-amber-50 border-amber-200'
                }`}>
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                  <span>
                    Identificamos <strong>{maxIdleSeats} licenças ociosas</strong> inativas neste contrato. O custo unitário estimado por licença é de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(seatCost)}/mês</strong>.
                  </span>
                </p>
              ) : (
                <p className={`text-[10px] leading-relaxed font-sans p-2 rounded-lg flex items-start gap-1 ${
                  isDarkMode ? 'text-slate-400 bg-slate-900/60' : 'text-slate-500 bg-slate-100'
                }`}>
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-500" />
                  <span>Excelente! Aproveitamento total das licenças. Não há assentos sobressalentes ociosos para redução.</span>
                </p>
              )}
            </div>
          )}

          {/* Parameters Controls Block */}
          <div className="space-y-5">
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              2. Definir Parâmetros de Redução:
            </h3>

            {/* Slider 1: Redução de Chaves Ociosas */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className={`flex items-center font-sans font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Reduzir Licenças Ociosas:
                </span>
                <span className={`font-semibold font-mono text-sm ${isDarkMode ? 'text-brand' : 'text-brand-text'}`}>
                  {cutIdleSeatsPercentage}% ({simulationResults.seatsSaved} licenças removidas)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={cutIdleSeatsPercentage}
                disabled={maxIdleSeats === 0}
                onChange={(e) => setCutIdleSeatsPercentage(Number(e.target.value))}
                className="w-full accent-brand cursor-pointer disabled:opacity-40"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-sans leading-none pt-0.5">
                <span>Manter todas ociosas (0%)</span>
                <span>Cortar metade (50%)</span>
                <span>Corte total (100%)</span>
              </div>
            </div>

            {/* Checkbox 2: Plano Anual */}
            <div className={`p-3.5 rounded-xl border flex items-start space-x-3 transition-all ${
              applyAnnualDiscount 
                ? isDarkMode ? 'bg-brand/10 border-brand/30' : 'bg-brand-bg/50 border-brand-border'
                : isDarkMode ? 'bg-slate-950/30 border-slate-800' : 'bg-slate-50 border-slate-205'
            }`}>
              <input
                type="checkbox"
                id="checkbox-annual-discount"
                checked={applyAnnualDiscount}
                onChange={(e) => setApplyAnnualDiscount(e.target.checked)}
                className="mt-1 h-4 w-4 accent-brand rounded cursor-pointer"
              />
              <div className="space-y-0.5">
                <label htmlFor="checkbox-annual-discount" className={`block text-xs font-sans font-bold cursor-pointer ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  Simular Conversão de Contrato Mensal para Ciclo Anual
                </label>
                <span className={`block text-[10px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Aplica automaticamente uma redução padrão de <strong>15% de desconto</strong>, negociado tradicionalmente ao consolidar o faturamento adiantado de 1 ano.
                </span>
              </div>
            </div>

            {/* Config 3: Extra Discount Negotiated Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className={`flex items-center font-sans font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Margem de Desconto Adicional por Negociação (Custom):
                </span>
                <span className={`font-semibold font-mono text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {extraNegotiatedDiscount}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={extraNegotiatedDiscount}
                onChange={(e) => setExtraNegotiatedDiscount(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-sans leading-none pt-0.5">
                <span>Sem desconto extra (0%)</span>
                <span>Desconto corporativo médio (25%)</span>
                <span>Teto de negociação agressivo (50%)</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Simulation Outputs & Action Panel (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          <div className="space-y-5">
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider pb-2 border-b ${isDarkMode ? 'text-slate-300 border-slate-800' : 'text-slate-700 border-slate-200'}`}>
              3. Resultados da Simulação:
            </h3>

            {/* Financial comparison columns */}
            <div className={`p-5 rounded-2xl border space-y-5 ${
              isDarkMode ? 'bg-slate-950/70 border-slate-850' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              
              {/* Cost Before and Cost After */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Mensalidade Atual:</span>
                  <span className={`text-sm font-semibold font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulationResults.currentCost)}
                  </span>
                </div>

                <div className={`flex justify-between items-center pb-3 border-b ${isDarkMode ? 'border-slate-800/40' : 'border-slate-200'}`}>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Nova Mensalidade Simulada:</span>
                  <span className={`text-base font-bold font-mono ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulationResults.newCost)}
                  </span>
                </div>

                <div className="flex justify-between items-start pt-1">
                  <div>
                    <span className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Redução de Custos Mensal:</span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Economia no orçamento do departamento</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-extrabold font-mono block ${isDarkMode ? 'text-brand' : 'text-brand-text'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulationResults.monthlySavings)}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${isDarkMode ? 'bg-brand/10 text-brand' : 'bg-brand-bg text-brand-text border border-brand-border'}`}>
                      -{simulationResults.currentCost > 0 ? Math.round((simulationResults.monthlySavings / simulationResults.currentCost) * 100) : 0}% /mês
                    </span>
                  </div>
                </div>

                <div className={`flex justify-between items-center p-3 rounded-lg mt-2 border ${
                  isDarkMode 
                    ? 'bg-emerald-500/5 border-emerald-500/10' 
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-emerald-950'}`}>Economia Anual Projetada:</span>
                  <span className={`text-base font-black font-mono ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulationResults.annualSavings)}
                  </span>
                </div>
              </div>

              {/* Graphical Visual Comparison using CSS bar */}
              <div className="space-y-2 pt-1">
                <span className={`text-[10px] uppercase font-mono tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Comparação de Escopo de Gastos</span>
                
                {/* Bar Stack */}
                <div className={`w-full rounded-lg h-5 overflow-hidden flex relative border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  {/* optimized cost */}
                  <div 
                    style={{ width: `${simulationResults.currentCost > 0 ? (simulationResults.newCost / simulationResults.currentCost) * 100 : 0}%` }}
                    className="bg-emerald-500 h-full flex items-center justify-center text-[9px] text-white font-bold font-mono"
                  >
                    {simulationResults.currentCost > 0 && simulationResults.newCost / simulationResults.currentCost > 0.2 && `${Math.round((simulationResults.newCost / simulationResults.currentCost) * 100)}%`}
                  </div>
                  {/* savings */}
                  <div 
                    style={{ width: `${simulationResults.currentCost > 0 ? (simulationResults.monthlySavings / simulationResults.currentCost) * 100 : 0}%` }}
                    className={`h-full flex items-center justify-center text-[10px] font-bold font-mono animate-pulse ${
                      isDarkMode ? 'bg-brand/30 text-brand' : 'bg-brand/20 text-brand-text'
                    }`}
                  >
                    {simulationResults.currentCost > 0 && simulationResults.monthlySavings / simulationResults.currentCost > 0.2 && `Poupa ${Math.round((simulationResults.monthlySavings / simulationResults.currentCost) * 100)}%`}
                  </div>
                </div>
              </div>

              <div className={`text-[10px] leading-relaxed italic ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                💡 Nota FinOps: Ao remover licenças ociosas e requerer aditivos no contrato vigente antes da renovação compulsória, as economias podem ser reinvestidas em cotas de créditos corporativos ou capacitações.
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-3 pt-4">
            
            <button
              id="btn-aplicar-otimizacao"
              disabled={simulationResults.monthlySavings <= 0}
              style={{ backgroundImage: 'linear-gradient(to right, var(--brand-color), var(--brand-color-hover))' }}
              onClick={handleApplyToSpreadsheet}
              className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 disabled:opacity-40 text-white font-extrabold rounded-xl text-xs sm:text-sm font-sans tracking-wide shadow-lg cursor-pointer transform hover:scale-[1.01] transition-all border border-brand/20 shadow-brand/20"
            >
              <Check className="h-4 w-4 stroke-[3px]" />
              <span>Gravar Otimizações na Planilha Principal (Persistir)</span>
            </button>
            
            <div className={`p-3 rounded-lg text-[10.5px] leading-relaxed flex items-start space-x-2 border ${
              isDarkMode ? 'text-slate-400 bg-slate-900/40 border-slate-800' : 'text-slate-600 bg-slate-50 border-slate-200'
            }`}>
              <Settings2 className={`h-4 w-4 shrink-0 mt-0.5 ${isDarkMode ? 'text-brand' : 'text-brand-text'}`} />
              <span>
                <strong>Ação Real:</strong> Ao clicar no botão acima, a planilha interativa no "Painel Geral" será atualizada com a nova volumetria de licenças e valores mensais recalculados, atualizando as estatísticas globais FinOps na mesma hora!
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
