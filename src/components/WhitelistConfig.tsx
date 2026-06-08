import { useState, useEffect } from 'react';
import { 
  Users, 
  Database, 
  Trash, 
  UserPlus, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  RefreshCw,
  Mail
} from 'lucide-react';

interface AllowedEmail {
  email: string;
  role: 'admin' | 'reader';
  createdAt?: string;
}

interface WhitelistConfigProps {
  isDarkMode: boolean;
  themeStyles: any;
  userRole: 'admin' | 'reader';
}

export default function WhitelistConfig({ isDarkMode, themeStyles, userRole }: WhitelistConfigProps) {
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [dbStatus, setDbStatus] = useState<{ configured: boolean; provider: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [adding, setAdding] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Form state
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<'admin' | 'reader'>('reader');

  const isAdmin = userRole === 'admin';

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Get database status
      const statusRes = await fetch('/api/database/status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setDbStatus(statusData);
      }

      // 2. Load whitelist
      const emailsRes = await fetch('/api/auth/allowed-emails');
      if (emailsRes.ok) {
        const emailsData = await emailsRes.json();
        setEmails(emailsData);
      } else {
        throw new Error('Falha ao ler whitelist de e-mails.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível conectar ao servidor para ler a lista de controle de acessos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToTrim = newEmail.trim().toLowerCase();
    if (!emailToTrim) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }

    if (!isAdmin) {
      setError('Apenas usuários com nível de acesso Administrador podem autorizar novos e-mails.');
      return;
    }

    setAdding(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/allowed-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToTrim, role: newRole })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(`E-mail ${emailToTrim} autorizado com sucesso.`);
        setNewEmail('');
        setNewRole('reader');
        loadData();
      } else {
        setError(data.error || 'Falha ao autorizar e-mail no servidor.');
      }
    } catch (err: any) {
      setError('Erro de rede ao tentar adicionar o e-mail: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteEmail = async (emailToDelete: string) => {
    if (!isAdmin) {
      setError('Apenas administradores podem gerenciar acessos.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja desautorizar o e-mail ${emailToDelete}?`)) {
      setError('');
      setSuccess('');
      try {
        const response = await fetch(`/api/auth/allowed-emails/${encodeURIComponent(emailToDelete)}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setSuccess(`Autorização do e-mail ${emailToDelete} revogada.`);
          loadData();
        } else {
          const data = await response.json();
          setError(data.error || 'Falha ao excluir e-mail.');
        }
      } catch (err: any) {
        setError('Erro de rede ao tentar remover e-mail: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-sm" id="whitelist-panel">
      
      {/* DB Connection Status Widget */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
        isDarkMode 
          ? 'bg-slate-800/60 border-slate-700/80' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className={`p-2.5 rounded-xl ${
            dbStatus?.configured 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`font-bold tracking-tight text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Estatuto do Banco de Dados Postgres Vercel/Neon
            </h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {dbStatus?.configured 
                ? `Conectado com sucesso ao serviço Serverless PostgreSQL (${dbStatus?.provider}).`
                : 'Rodando em modo Simulador em Memória (Sem DATABASE_URL nos Segredos).'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide uppercase ${
            dbStatus?.configured 
              ? 'bg-emerald-950/25 border-emerald-900/30 text-emerald-400' 
              : 'bg-amber-950/25 border-amber-900/30 text-amber-400'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${dbStatus?.configured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{dbStatus?.configured ? 'Ativo (Vercel Neon Live)' : 'Modo Demonstração'}</span>
          </div>

          <button 
            onClick={loadData}
            aria-label="Atualizar status" 
            title="Atualizar dados"
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300' 
                : 'bg-slate-50 border-slate-250 hover:bg-slate-100 text-slate-750'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {dbStatus && !dbStatus.configured && (
        <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
          isDarkMode ? 'bg-indigo-950/20 border-indigo-900/45 text-indigo-300' : 'bg-indigo-50 border-indigo-150 text-indigo-900'
        }`}>
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-indigo-500" />
          <div className="space-y-1">
            <h4 className="font-bold">Como salvar de forma permanente no banco de dados Postgres?</h4>
            <p className="text-xs leading-relaxed">
              Para salvar e-mails corporativos e contratos de forma robusta e definitiva no Neon Postgres, basta criar um banco de dados relacional grátis na sua conta <strong>Vercel (Storage &gt; Postgres / Neon)</strong> e copiar a variável <strong>DATABASE_URL</strong> para o painel de variáveis de ambiente do seu projeto no Vercel ou na área de customização do painel local. O sistema detectará automaticamente a conexão sem precisar reinstalar nada!
            </p>
          </div>
        </div>
      )}

      {/* Grid container: Add e-mail + allowed email list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Adicionar autorização panel (Left/Form) */}
        <div className="lg:col-span-5 h-fit">
          <div className={`p-5 rounded-2xl border ${
            isDarkMode 
              ? 'bg-slate-800/40 border-slate-700/60' 
              : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center space-x-2.5 mb-4">
              <UserPlus className="h-4.5 w-4.5 text-brand" style={{ color: themeStyles.brand }} />
              <h4 className={`font-bold text-base tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                Autorizar Novo E-mail
              </h4>
            </div>

            <form onSubmit={handleAddEmail} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  E-mail Oficial Corporativo
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-3 h-4 w-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    required
                    disabled={!isAdmin || adding}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="colaborador@suaempresa.com.br"
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border shadow-sm transition-all outline-none ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-700 focus:border-slate-500 text-white' 
                        : 'bg-slate-50 border-slate-250 focus:border-slate-400 text-black'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Nível de Privilégio
                </label>
                <select
                  disabled={!isAdmin || adding}
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'reader')}
                  className={`w-full px-3 py-2 text-sm rounded-xl border shadow-sm transition-all focus:outline-none ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-700 focus:border-slate-500 text-white' 
                      : 'bg-slate-50 border-slate-250 focus:border-slate-400 text-black'
                  }`}
                >
                  <option value="reader">Leitor (Apenas Visualização de Faturas/Contracts)</option>
                  <option value="admin">Administrador (Total permissão de edição e faturamento)</option>
                </select>
              </div>

              {error && (
                <div className="px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                  {error}
                </div>
              )}

              {success && (
                <div className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-450 text-xs font-medium border border-emerald-500/20">
                  {success}
                </div>
              )}

              {!isAdmin ? (
                <div className={`p-3 rounded-lg border text-xs flex gap-2 ${
                  isDarkMode ? 'bg-amber-500/5 border-amber-500/10 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-850'
                }`}>
                  <Lock className="h-4 w-4 shrink-0 text-amber-550" />
                  <span>Seu perfil é de <strong>Leitor</strong>. Apenas administradores do sistema podem registrar novos e-mails.</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={adding || !newEmail}
                  className="w-full font-bold text-white px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-md text-xs tracking-wider uppercase text-center"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${themeStyles.gradientFromColor}, ${themeStyles.gradientToColor})`,
                    boxShadow: `0 4px 12px ${themeStyles.brand}25`
                  }}
                >
                  {adding ? 'Registrando...' : 'Autorizar e Adicionar Whitelist'}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* whitelist email table (Right/List) */}
        <div className="lg:col-span-7">
          <div className={`p-5 rounded-2xl border ${
            isDarkMode 
              ? 'bg-slate-800/40 border-slate-700/60' 
              : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <Users className="h-4.5 w-4.5 text-brand" style={{ color: themeStyles.brand }} />
                <h4 className={`font-bold text-base tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                  Membros Corporativos Autorizados ({emails.length})
                </h4>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin text-brand" style={{ color: themeStyles.brand }} />
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Lendo Whitelist do Postgres...</span>
              </div>
            ) : emails.length === 0 ? (
              <div className={`text-center py-12 rounded-xl border border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-250 text-slate-400'}`}>
                Não há membros autorizados registrados.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-transparent">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-xs font-bold tracking-wider uppercase ${
                      isDarkMode ? 'border-slate-700/80 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}>
                      <th className="py-2.5 px-3">E-mail Autorizado</th>
                      <th className="py-2.5 px-3">Privilégio</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/20 dark:divide-slate-700/40">
                    {emails.map((e) => (
                      <tr key={e.email} className={`text-xs hover:bg-slate-500/5 ${
                        isDarkMode ? 'text-slate-200' : 'text-slate-800'
                      }`}>
                        <td className="py-3 px-3 font-medium flex items-center space-x-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[180px] sm:max-w-xs">{e.email}</span>
                          {e.email === 'origemdodia@gmail.com' && (
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 py-0.5 rounded-md">Vercel Admin</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            e.role === 'admin' 
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {e.role === 'admin' ? 'Administrador' : 'Leitor'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {e.email !== 'origemdodia@gmail.com' && e.email !== 'admin@suprema.io' && isAdmin ? (
                            <button
                              onClick={() => handleDeleteEmail(e.email)}
                              className="p-1 px-1.5 rounded-md hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-all cursor-pointer border border-transparent hover:border-rose-500/20"
                              title="Remover acesso"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500 italic block pr-2">Protegido</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
