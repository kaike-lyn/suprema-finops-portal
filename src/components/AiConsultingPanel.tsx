import React, { useState } from 'react';
import { Contract } from '../types';
import { Sparkles, RefreshCw, AlertTriangle, HelpCircle, FileText, CheckCircle2, Terminal } from 'lucide-react';
import Markdown from 'react-markdown';

interface AiConsultingPanelProps {
  contracts: Contract[];
}

export default function AiConsultingPanel({ contracts }: AiConsultingPanelProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const generateReport = async () => {
    setLoading(true);
    setInsights(null);
    setWarning(null);
    
    const steps = [
      "Mapeando inventário de contratos e ociosidades...",
      "Consolidando volumetria de licenças por Sponsor...",
      "Analisando overlaps funcionais (Ex: Slack x MS Teams)...",
      "Consultando inteligência artificial sênior para auditoria...",
      "Gerando proposta de cortes e margens FinOps..."
    ];

    // Animate loader steps
    steps.forEach((step, index) => {
      setTimeout(() => {
        if (loading) {
          setLoadingStep(step);
        }
      }, index * 800);
    });

    try {
      const response = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contracts }),
      });

      const data = await response.json();
      setInsights(data.result);
      if (data.warning) {
        setWarning(data.warning);
      }
    } catch (err: any) {
      console.error(err);
      setInsights(`⚠️ **Falha na conexão com o servidor de IA:** ${err.message || 'Erro interno.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/20">Auditoria FinOps com Gemini</span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-cyan-400 animate-pulse-slow" />
            Consultoria de Custos por Inteligência Artificial
          </h2>
          <p className="text-xs text-slate-400 mt-1">Gere recomendações customizadas com base no seu portfólio de contratos, sponsoring e taxas de ociosidade.</p>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="flex items-center space-x-2 py-2 px-5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl text-xs font-semibold tracking-wide shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 transition-all border border-cyan-500/10 shrink-0"
        >
          {loading ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Gerando Auditoria...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Rodar Diagnóstico IA</span>
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="bg-slate-950/60 rounded-xl p-8 border border-slate-800/80 flex flex-col items-center justify-center min-h-[300px] text-center space-y-4 animate-pulse-slow">
          <Terminal className="h-10 w-10 text-cyan-400 animate-bounce" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-200">Consultoria Inteligente em Execução</h4>
            <p className="text-xs text-cyan-400 font-mono">{loadingStep || 'Mapeando contratos ativos...'}</p>
          </div>
          <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full w-2/3 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {!loading && !insights && (
        <div className="bg-slate-950/20 border border-slate-800/40 rounded-xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Sparkles className="h-12 w-12 text-slate-700" />
          <h3 className="text-sm font-semibold text-slate-300">Auditoria Completa Disponível</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Clique no botão <strong>"Rodar Diagnóstico IA"</strong> no topo para que o Gemini processe a sua planilha atual de contratos e elabore sugestões de transição tecnológica, consolidação de licenças, overlap funcional e renegociações oportunas.
          </p>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Secrets Warning Banner if falls back */}
          {warning && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start space-x-3 text-xs text-amber-400 leading-normal font-sans">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Demonstração Inteligente Ativa (Chave Inativa)</p>
                <p className="text-slate-300 mt-0.5">
                  Não foi detectada uma chave <strong>GEMINI_API_KEY</strong> real no seu painel de Segredos (Secrets), portanto habilitamos a simulação inteligente FinOps com base nos seus dados atuais para fins de validação UX/UI e lógica SaaS.
                </p>
                <p className="mt-1 font-semibold text-amber-300">Como conectar o Gemini real: Vá em Settings (ícone de engrenagem) &gt; Secrets, adicione a chave GEMINI_API_KEY e recarregue a página!</p>
              </div>
            </div>
          )}

          {/* AI Output Card */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-6 shadow-inner text-slate-200">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-semibold mb-4 pb-2 border-b border-slate-900">
              <FileText className="h-4 w-4" />
              <span>RELATÓRIO DE AUDITORIA FINOPS GERADO</span>
            </div>

            {/* Markdown Body styled beautifully */}
            <div className="markdown-body prose prose-invert max-w-none text-xs sm:text-sm font-sans leading-relaxed space-y-4 prose-headings:text-slate-100 prose-p:text-slate-300 prose-a:text-cyan-400 prose-hr:border-slate-800">
              <Markdown>{insights}</Markdown>
            </div>
          </div>

          <div className="bg-cyan-950/20 border border-cyan-800/20 p-3.5 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <p className="text-slate-300">
              Estes insights foram compilados considerando os sponsors, as datas de vencimento reais e a volumetria de licenças tabuladas na sua planilha ativa.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
