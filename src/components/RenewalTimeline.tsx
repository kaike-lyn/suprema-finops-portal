import React, { useState, useMemo } from 'react';
import { Contract } from '../types';
import { 
  Calendar, 
  Clock, 
  Download, 
  Check, 
  HelpCircle, 
  AlertTriangle, 
  ChevronRight, 
  Filter,
  User,
  ExternalLink,
  ShieldAlert,
  BellRing
} from 'lucide-react';
import { motion } from 'motion/react';

interface RenewalTimelineProps {
  contracts: Contract[];
  isDarkMode?: boolean;
}

export default function RenewalTimeline({ contracts, isDarkMode = true }: RenewalTimelineProps) {
  const [selectedMonthGroup, setSelectedMonthGroup] = useState<string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');

  // Parse dates and group contracts by expiry month
  const contractsWithCalculatedDates = useMemo(() => {
    const today = new Date('2026-05-29'); // Fixed date corresponding to our environment's current local time
    
    return contracts.map(c => {
      const endDate = new Date(c.endDate);
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Get human readable Month Year
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const monthIdx = endDate.getMonth();
      const year = endDate.getFullYear();
      const monthYearLabel = `${monthNames[monthIdx]} ${year}`;
      const sortKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;

      // Calculate priority based on notice windows (usually 30 or 60 days notice)
      let timelinePriority: 'CRITICAL' | 'WARNING' | 'STABLE' = 'STABLE';
      if (diffDays <= 30) {
        timelinePriority = 'CRITICAL';
      } else if (diffDays <= 90) {
        timelinePriority = 'WARNING';
      }

      return {
        ...c,
        daysRemaining: diffDays,
        monthYearLabel,
        sortKey,
        timelinePriority
      };
    }).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [contracts]);

  // Aggregate available expiration months for filters
  const uniqueMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    contractsWithCalculatedDates.forEach(c => {
      monthsSet.add(c.monthYearLabel);
    });
    return Array.from(monthsSet);
  }, [contractsWithCalculatedDates]);

  // Filtered timeline data
  const filteredTimelineContracts = useMemo(() => {
    return contractsWithCalculatedDates.filter(c => {
      const matchMonth = selectedMonthGroup === 'all' || c.monthYearLabel === selectedMonthGroup;
      const matchCrit = criticalityFilter === 'all' || 
                       (criticalityFilter === 'critical' && c.timelinePriority === 'CRITICAL') ||
                       (criticalityFilter === 'warning' && c.timelinePriority === 'WARNING') ||
                       (criticalityFilter === 'stable' && c.timelinePriority === 'STABLE');
      return matchMonth && matchCrit;
    });
  }, [contractsWithCalculatedDates, selectedMonthGroup, criticalityFilter]);

  // Real .ICS Calendar Invite Creator and Downloader
  const downloadIcsInvite = (contract: any) => {
    const title = `🚨 Renegociação FinOps: ${contract.name}`;
    const cleanNotes = contract.negotiationNotes ? contract.negotiationNotes.replace(/[\n\r]/g, " ") : "";
    const description = `Prazo Limite de Cancelamento / Negociação para o contrato ${contract.name} (${contract.provider}).\\n\\nSponsor Responsável: ${contract.sponsor}\\nE-mail: ${contract.sponsorEmail || "Governança"}\\n\\nNotas FinOps:\\n${cleanNotes}\\nArquivo do Contrato: ${contract.contractLink}`;
    
    // Set renegotiation warning event to happen 30 days before end date
    const expiryDate = new Date(contract.endDate);
    const renegotiationDate = new Date(expiryDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Format to ICS standard (YYYYMMDDTHHMMSSZ)
    const formattedDate = renegotiationDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const eventUid = `contract-reneg-${contract.id}-${renegotiationDate.getTime()}@suprema`;
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Suprema FinOps Portal//PT_BR
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART;VALUE=DATE:${formattedDate.substring(0, 8)}
DTEND;VALUE=DATE:${formattedDate.substring(0, 8)}
SUMMARY:${title}
DESCRIPTION:${description}
UID:${eventUid}
LOCATION:Painel de Admin: ${contract.adminPanelLink || "Interno"}
SEQUENCE:0
STATUS:CONFIRMED
TRANSP:TRANSPARENT
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alerta_renovacao_${contract.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`w-full p-6 border rounded-2xl shadow-2xl backdrop-blur-md space-y-8 font-sans ${
      isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-md'
    }`}>
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono text-brand font-bold uppercase tracking-wider bg-brand/10 px-2.5 py-0.5 rounded border border-brand/20">Sugestão 4 Incorporada</span>
          <h2 className={`text-xl font-bold tracking-tight mt-1 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Calendar className="h-5 w-5 text-brand" />
            Cronograma de Renovações & Alertas de Reclame
          </h2>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Estrutura cronológica de expirações de contratos. Baixe arquivos de calendário (.ics) automáticos para agendar alertas de notice period.
          </p>
        </div>

        {/* Counter Indicators */}
        <div className="flex gap-2 shrink-0">
          <div className={`p-2.5 px-4 rounded-xl text-center border ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-205'
          }`}>
            <span className="block text-[9px] uppercase font-mono tracking-wider text-slate-500">Expira em &lt; 30d</span>
            <strong className="text-base font-black font-mono text-rose-500">
              {contractsWithCalculatedDates.filter(c => c.daysRemaining <= 30 && c.daysRemaining > 0).length}
            </strong>
          </div>
          <div className={`p-2.5 px-4 rounded-xl text-center border ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-205'
          }`}>
            <span className="block text-[9px] uppercase font-mono tracking-wider text-slate-500">Entre 30d e 90d</span>
            <strong className="text-base font-black font-mono text-amber-500">
              {contractsWithCalculatedDates.filter(c => c.daysRemaining > 30 && c.daysRemaining <= 90).length}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className={`p-3.5 rounded-xl border flex flex-col md:flex-row gap-4 justify-between items-center ${
        isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center space-x-2 shrink-0 text-xs font-mono font-bold uppercase text-slate-400">
          <Filter className="h-4 w-4 text-brand" />
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-605'}>Filtros do Cronograma:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Group Month Selector */}
          <div className="flex-1 sm:w-48 text-xs">
            <select
              value={selectedMonthGroup}
              onChange={(e) => setSelectedMonthGroup(e.target.value)}
              className={`w-full p-2 border rounded-lg focus:outline-none ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-300 focus:ring-1 focus:ring-brand' 
                  : 'bg-white border-slate-200 text-slate-700 focus:ring-1 focus:ring-brand'
              }`}
            >
              <option value="all">🗓️ Todos os Meses</option>
              {uniqueMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Priority State Selector */}
          <div className="flex-1 sm:w-48 text-xs">
            <select
              value={criticalityFilter}
              onChange={(e) => setCriticalityFilter(e.target.value)}
              className={`w-full p-2 border rounded-lg focus:outline-none ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-300 focus:ring-1 focus:ring-brand' 
                  : 'bg-white border-slate-200 text-slate-700 focus:ring-1 focus:ring-brand'
              }`}
            >
              <option value="all">⚡ Todos os Prazos</option>
              <option value="critical">🔴 Prazo Crítico (&lt; 30 dias)</option>
              <option value="warning">🟡 Atenção Reclame (30-90 dias)</option>
              <option value="stable">🟢 Estabilidade (&gt; 90 dias)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vertical Timeline List */}
      <div className={`relative border-l ml-4 md:ml-6 pl-6 md:pl-8 space-y-8 pb-3 ${
        isDarkMode ? 'border-slate-800/85' : 'border-slate-200'
      }`}>
        
        {filteredTimelineContracts.length === 0 ? (
          <div className={`p-8 text-center rounded-xl border text-xs ${
            isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'
          }`}>
            Nenhum contrato corresponde aos filtros selecionados para o cronograma de renovação.
          </div>
        ) : (
          filteredTimelineContracts.map((c, idx) => {
            const isExpirado = c.daysRemaining <= 0;
            const daysLabel = isExpirado 
              ? 'Expirado' 
              : c.daysRemaining === 1 
                ? 'Expira Amanhã' 
                : `Expira em ${c.daysRemaining} dias`;

            return (
              <motion.div 
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative"
              >
                {/* Timeline Ball Node */}
                <span className={`absolute -left-[31px] md:-left-[39px] top-1.5 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full border shadow-inner ${
                  isExpirado 
                    ? isDarkMode ? 'bg-rose-950 border-rose-500 text-rose-450' : 'bg-rose-50 border-rose-350 text-rose-700' 
                    : c.timelinePriority === 'CRITICAL' 
                      ? isDarkMode ? 'bg-rose-950 border-rose-500 text-rose-450 animate-pulse' : 'bg-rose-550/10 border-rose-400 text-rose-700 animate-pulse'
                      : c.timelinePriority === 'WARNING' 
                        ? isDarkMode ? 'bg-amber-950 border-amber-500 text-amber-450' : 'bg-amber-50 border-amber-350 text-amber-800' 
                        : isDarkMode ? 'bg-emerald-950 border-emerald-500 text-emerald-450' : 'bg-emerald-50 border-emerald-350 text-emerald-700'
                }`}>
                  <span className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full ${
                    isExpirado || c.timelinePriority === 'CRITICAL' ? 'bg-rose-500' :
                    c.timelinePriority === 'WARNING' ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`} />
                </span>

                {/* Main Node Card */}
                <div className={`p-4 md:p-5 rounded-2xl border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950/95' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-md'
                }`}>
                  
                  {/* Card Header Info */}
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b ${
                    isDarkMode ? 'border-slate-800/60' : 'border-slate-200'
                  }`}>
                    <div>
                      <span className="text-[10px] font-mono text-brand uppercase tracking-widest">{c.id} • {c.category}</span>
                      <h3 className={`text-sm font-extrabold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        {c.name}
                        {c.adminPanelLink && (
                          <a href={c.adminPanelLink} target="_blank" rel="noreferrer" title="Acessar painel do provedor">
                            <ExternalLink className="h-3 w-3 text-slate-550 hover:text-brand transition-colors" />
                          </a>
                        )}
                      </h3>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Provedor principal: <strong className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{c.provider}</strong>
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      {/* Expiration warning badge */}
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10.5px] font-mono border font-extrabold shadow-sm ${
                        isExpirado 
                          ? isDarkMode ? 'bg-rose-950/50 border-rose-900/60 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700' :
                        c.timelinePriority === 'CRITICAL' 
                          ? isDarkMode ? 'bg-rose-950/80 border-rose-500/50 text-rose-300' : 'bg-rose-100 border-rose-200 text-rose-700' :
                        c.timelinePriority === 'WARNING' 
                          ? isDarkMode ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' : 'bg-amber-100 border-amber-200 text-amber-800' :
                        isDarkMode ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-emerald-100 border-emerald-250 text-emerald-800'
                      }`}>
                        <Clock className={`h-3 w-3 ${c.timelinePriority === 'CRITICAL' ? 'animate-spin-slow' : ''}`} />
                        <span>{daysLabel}</span>
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1 font-sans">
                        Data limite: <strong className={`font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{new Date(c.endDate).toLocaleDateString('pt-BR')}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3.5 items-start">
                    
                    {/* Notes & context */}
                    <div className={`md:col-span-8 text-xs font-sans space-y-2 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className={`flex items-start space-x-1.5 p-2 rounded-lg ${
                        isDarkMode ? 'bg-slate-900/35' : 'bg-slate-100 border border-slate-200/60'
                      }`}>
                        <User className="h-3.5 w-3.5 text-slate-500 mt-0.5" />
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-mono block leading-none">Dono Responsável (Sponsor)</span>
                          <strong className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{c.sponsor}</strong>
                          {c.sponsorEmail && (
                            <span className="text-[10px] text-slate-500 block font-mono">{c.sponsorEmail}</span>
                          )}
                        </div>
                      </div>

                      <div className={`p-2.5 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-orange-500/5 border-orange-500/10 text-slate-300' 
                          : 'bg-amber-50 border-amber-200 text-slate-700'
                      }`}>
                        <span className={`font-semibold font-mono block text-[9.5px] uppercase tracking-wider mb-0.5 ${
                          isDarkMode ? 'text-amber-400' : 'text-amber-800'
                        }`}>Janela de Negociação Ativa</span>
                        {c.negotiationNotes || 'Nenhuma nota de negociação cadastrada.'}
                      </div>
                    </div>

                    {/* Financial details & Action to calendar */}
                    <div className={`md:col-span-4 flex flex-col justify-between h-full space-y-3 p-3 rounded-xl border ${
                      isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/60 border-slate-205'
                    }`}>
                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Investimento mensal corrente</span>
                        <strong className={`text-sm font-black font-mono ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.monthlyValue)}<span className="text-xs font-sans font-normal text-slate-550"> /mês</span>
                        </strong>
                      </div>

                      {/* Download ICS reminders */}
                      <button
                        type="button"
                        onClick={() => downloadIcsInvite(c)}
                        className={`w-full py-2 px-3 text-[10.5px] font-sans font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                          isDarkMode 
                            ? 'bg-brand/10 border-brand/35 text-brand-text hover:bg-brand/20 shadow-md' 
                            : 'bg-brand-bg border-brand-border text-brand hover:bg-brand/10'
                        }`}
                      >
                        <Download className="h-3 w-3" />
                        <span>Notificar Outlook / Calendar</span>
                      </button>

                      <span className="text-[9px] text-slate-500 text-center block font-sans">
                        Baixa um convite de alerta de Termo t-30d
                      </span>
                    </div>

                  </div>

                </div>
              </motion.div>
            );
          })
        )}

      </div>

    </div>
  );
}
