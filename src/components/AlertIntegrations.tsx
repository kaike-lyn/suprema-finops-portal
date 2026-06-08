import React, { useState } from 'react';
import { Bell, HelpCircle, Mail, Server, Check, ArrowRight, CornerDownRight, Play, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AlertIntegrations() {
  const [activeChannel, setActiveChannel] = useState<'teams' | 'email'>('teams');
  const [webhookUrl, setWebhookUrl] = useState('https://m365corp.webhook.office.com/webhookb2/XXXXXXXX-XXXX/IncomingWebhook/...');
  const [alertType, setAlertType] = useState<'vencimento' | 'desperdicio'>('vencimento');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  // Simulated Webhook JSON Payload
  const getPayload = () => {
    if (alertType === 'vencimento') {
      return {
        text: "🚨 *Aviso de Governança de TI: Vencimento Iminente de Contrato!*",
        attachments: [
          {
            color: "#f59e0b",
            title: "Salesforce Sales Cloud Pro (ID: CONTR-2026-001)",
            title_link: "https://exemplo-infra.com/contracts/salesforce_signed_2025.pdf",
            fields: [
              { title: "Sponsor / Dono", value: "Aline Souza (Sales VP)", short: true },
              { title: "Data de Vencimento", value: "15 de Junho de 2026", short: true },
              { title: "Valor Mensal", value: "R$ 12.500,00", short: true },
              { title: "Ociosidade de Contas", value: "35 licenças sem uso (Aproveitamento de 71%)", short: false }
            ],
            text: "⚠️ *Ação Recomendada:* Entrar em contato com Aline Souza para renegociar o volume de chaves ativas do Salesforce e remover as 35 licenças ociosas antes do fechamento do ciclo, evitando renovação compulsória.",
            actions: [
              { type: "button", text: "Abrir Link do PDF", url: "https://exemplo-infra.com/contracts/salesforce_signed_2025.pdf" },
              { type: "button", text: "Solicitar Aditivo FinOps", style: "primary" }
            ]
          }
        ]
      };
    } else {
      return {
        text: "📉 *Alerta FinOps: Desperdício de Recursos de TI Detectado!*",
        attachments: [
          {
            color: "#ef4444",
            title: "Slack Enterprise Grid (ID: CONTR-2026-004)",
            fields: [
              { title: "Sponsor", value: "Mariana Luz (RH)", short: true },
              { title: "Contas Ociosas", value: "190 licenças inativas de 400 contratadas (47.5% de ociosidade)", short: false },
              { title: "Desperdício Estimado", value: "R$ 3.990,00 por mês", short: true },
              { title: "Duplicidade Reconhecida", value: "Microsoft Teams já incluído na assinatura M365 E5", short: true }
            ],
            text: "🚨 *Recomendação FinOps:* O contrato do Slack expirou recentemente e o time está sendo cobrado por faturamento de transição direta. Migre os utilizadores remanescentes para o Microsoft Teams imediatamente.",
            actions: [
              { type: "button", text: "Iniciar Migração para Teams", style: "primary" }
            ]
          }
        ]
      };
    }
  };

  const fireTestWebhook = () => {
    setIsSending(true);
    setSendSuccess(false);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
    }, 1200);
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-8 font-sans">
      
      {/* Title block */}
      <div>
        <span className="text-xs font-mono text-brand font-bold uppercase tracking-wider bg-brand/10 px-2 py-0.5 rounded border border-brand/20">CIDEM - Arquitetura Integrada</span>
        <h2 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-brand animate-pulse-slow" />
          Alertas Automáticos & Canais Integrados
        </h2>
        <p className="text-xs text-slate-400 mt-1">Estrutura de automação baseada em gatilhos para evitar renovações compulsórias indesejadas e licenças ociosas.</p>
      </div>

      {/* Grid: Left - Architectural flow / Right - Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Architectural Flow: 5 Columns */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-mono font-semibold uppercase text-slate-350 tracking-wider">Como Estruturar a Arquitetura (Gatilhos)</h3>
          
          <div className="space-y-3">
            
            {/* Step 1: Trigger CRON */}
            <div className="bg-slate-950/25 border border-slate-800/60 p-4 rounded-xl relative">
              <span className="absolute right-3 top-3 text-[10px] font-mono text-brand bg-brand/10 px-1 py-0.5 rounded">PASSO 1</span>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded bg-slate-800 shrink-0 text-slate-300">
                  <Server className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Gatilho Periódico (CRON Node)</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    Um script agendado roda diariamente (ex: via Google Cloud Scheduler) lendo a nossa planilha/banco de dados de contratos.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Evaluation rules */}
            <div className="bg-slate-950/25 border border-slate-800/60 p-4 rounded-xl relative">
              <span className="absolute right-3 top-3 text-[10px] font-mono text-amber-500 bg-amber-950/30 px-1 py-0.5 rounded">PASSO 2</span>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded bg-slate-800 shrink-0 text-slate-300">
                  <Bell className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Camada de Regras Regressivas</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    O validador verifica contratos sob t-90, t-60 e t-30 dias da expiração, ou quando a taxa de aproveitamento cai abaixo de 75%.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Payload Routing */}
            <div className="bg-slate-950/25 border border-slate-800/60 p-4 rounded-xl relative">
              <span className="absolute right-3 top-3 text-[10px] font-mono text-emerald-500 bg-emerald-950/30 px-1 py-0.5 rounded">PASSO 3</span>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded bg-slate-800 shrink-0 text-slate-300">
                  <Mail className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Disparo de Webhook / API</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    Geração do JSON de alerta e envio para webhook do Microsoft Teams ou por e-mail automatizado de Governança corporativa.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-brand/10 border border-brand/20 p-3 rounded-xl text-xs flex items-start space-x-2">
            <HelpCircle className="h-4 w-4 text-brand shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>Dica de Integração:</strong> No Microsoft Teams, configure botões de ação interativos diretamente no chat para que os Sponsors possam marcar contratos como "Aprovados para renovação" com 1 clique!
            </p>
          </div>
        </div>

        {/* Webhook Test Simulator: 7 Columns */}
        <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
            <h3 className="text-xs font-mono font-semibold uppercase text-slate-350 tracking-wider">Simulador de Disparos de Alerta</h3>
            <span className="text-[10px] text-slate-500 font-mono">Feedback de Entrada Visual</span>
          </div>

          {/* Tab Selector: Teams, Email */}
          <div className="flex space-x-2">
            <button
              id="tab-teams-alert"
              onClick={() => { setActiveChannel('teams'); setWebhookUrl('https://m365corp.webhook.office.com/webhookb2/XXXXXXXX-XXXX/IncomingWebhook/...'); }}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                activeChannel === 'teams' 
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-md shadow-blue-950/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="h-3.5 w-3.5 text-blue-400" />
              <span>MS Teams Webhook</span>
            </button>
            <button
              id="tab-email-alert"
              onClick={() => { setActiveChannel('email'); setWebhookUrl('governanca-contratos@suaempresa.com.br'); }}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                activeChannel === 'email' 
                  ? 'bg-brand/10 border-brand/20 text-brand-text shadow-md shadow-brand/10' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>E-mail Corporativo</span>
            </button>
          </div>

          {/* Parameters Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-400 font-mono mb-1">
                {activeChannel === 'email' ? 'Destinatários de Alerta (Sponsors + FinOps Guard):' : 'Destino da Integração (Webhook Service URL):'}
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 rounded-lg p-2 focus:ring-1 focus:ring-brand focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 font-mono mb-1">Tipo de Alerta FinOps:</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value as 'vencimento' | 'desperdicio')}
                  className="w-full bg-slate-950 text-xs text-slate-300 border border-slate-800 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="vencimento">Aviso de Vencimento de Termo</option>
                  <option value="desperdicio">Aviso de Desperdício e Inatividade</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  id="btn-fire-alert"
                  type="button"
                  onClick={fireTestWebhook}
                  disabled={isSending}
                  style={{ backgroundImage: 'linear-gradient(to right, var(--brand-color), var(--brand-color-hover))' }}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 disabled:opacity-50 text-white rounded-lg text-xs font-semibold font-sans tracking-wide shadow transition-all border border-brand/20 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <Server className="h-3.5 w-3.5 animate-spin text-brand" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Disparar Alerta Teste</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Output Area */}
          <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950/80 flex flex-col min-h-[220px]">
            {/* Header of Simulated Platform */}
            <div className="bg-slate-900 border-b border-slate-850 px-3.5 py-2 flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-400 font-mono pl-1">
                  {activeChannel === 'teams' ? 'Faturamento & FinOps (Teams Channel)' : 'Notificação de Alerta Enviada'}
                </span>
              </div>
              <button
                id="btn-toggle-payload"
                onClick={() => setShowPayload(!showPayload)}
                className="text-[10px] text-cyan-400 hover:underline flex items-center cursor-pointer"
              >
                <Eye className="h-3 w-3 mr-1" />
                {showPayload ? 'Ver Visual Card' : 'Ver Payload JSON'}
              </button>
            </div>

            {/* Simulated Chat Message Display */}
            <div className="p-4 flex-1 flex flex-col justify-between text-xs font-sans">
              <AnimatePresence mode="wait">
                {showPayload ? (
                  <motion.pre
                    key="payload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-slate-950 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-[160px] leading-relaxed"
                  >
                    {JSON.stringify(getPayload(), null, 2)}
                  </motion.pre>
                ) : (
                  <motion.div
                    key="visual"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {/* Alerta trigger feedback banner */}
                    {sendSuccess && (
                      <div className="bg-slate-900 border border-emerald-500/20 p-2 rounded text-[10px] text-emerald-400 text-center animate-fade-in font-medium">
                        ✓ Disparo realizado com sucesso! Alerta roteado para: {webhookUrl}
                      </div>
                    )}

                    {/* Channel Layout Card */}
                    <div className="flex items-start space-x-2.5">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shrink-0 flex items-center justify-center font-mono font-bold text-white text-[10px] select-none shadow-inner">
                        BOT
                      </div>
                      
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center space-x-1.5">
                          <strong className="text-slate-200">Guardião_FinOps</strong>
                          <span className="bg-blue-950 border border-blue-900/40 text-[9px] text-blue-300 px-1 rounded">MS TEAMS</span>
                          <span className="text-[10px] text-slate-500">14:03</span>
                        </div>

                        {/* Title of Teams Message */}
                        <p className="text-slate-300 font-sans">
                          {alertType === 'vencimento' ? '🚨 **Aviso de Governança de TI: Vencimento de Contrato Iminente!**' : '📉 **Alerta FinOps: Desperdício de Recursos de TI Detectado!**'}
                        </p>

                        {/* Attachments Section */}
                        <div className={`p-3 rounded-lg border-l-4 font-sans space-y-2 ${
                          alertType === 'vencimento' ? 'bg-amber-950/20 border-amber-500' : 'bg-rose-950/20 border-rose-500'
                        }`}>
                          <strong className="text-slate-200 block text-xs underline decoration-dotted">
                            {alertType === 'vencimento' ? 'Salesforce Sales Cloud Pro (ID: CONTR-2026-001)' : 'Slack Enterprise Grid (ID: CONTR-2026-004)'}
                          </strong>

                          {/* Detail Grid */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] leading-normal pt-1 text-slate-300">
                            {alertType === 'vencimento' ? (
                              <>
                                <div><span className="text-slate-500">Sponsor:</span> Aline Souza (VP)</div>
                                <div><span className="text-slate-500">Vencimento:</span> 15 de Junho de 2026</div>
                                <div className="col-span-2 text-rose-300">⚠️ 35 licenças inativas acumulando R$ 3.645/mês de desperdício</div>
                              </>
                            ) : (
                              <>
                                <div><span className="text-slate-500">Sponsor:</span> Mariana Luz (RH)</div>
                                <div><span className="text-slate-500">Ociosidade:</span> 190 licenças sem uso (47.5%)</div>
                                <div className="col-span-2 text-rose-300">🚨 Solução duplicada com Teams. Economize R$ 100.800/ano descontinuando.</div>
                              </>
                            )}
                          </div>

                          {/* Action Button Simulators */}
                          <div className="flex space-x-2 pt-1">
                            <button className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-[10px] rounded text-white font-medium select-none cursor-pointer transition-colors border border-cyan-500/20 shadow">
                              {alertType === 'vencimento' ? 'Solicitar Redução de Licenças' : 'Iniciar Migração para Teams'}
                            </button>
                            <button className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-[10px] rounded text-slate-400 select-none cursor-pointer transition-colors border border-slate-700/60">
                              Visualizar PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
