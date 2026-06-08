import pg from "pg";
const { Pool } = pg;
import { initialContracts } from "../data";

export interface SimpleQueryResult {
  rows: any[];
}

export interface SimpleDbPool {
  query: (text: string, params?: any[]) => Promise<SimpleQueryResult>;
}

let dbPool: pg.Pool | null = null;
let databaseIsOnline = false;

export function getDbPool(): pg.Pool {
  if (dbPool) return dbPool;

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("O segredo DATABASE_URL ou POSTGRES_URL não está configurado nas variáveis de ambiente.");
  }

  // Configurações otimizadas para ambiente Serverless (Vercel) e alta robustez (Supabase / Neon)
  dbPool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1") ? false : {
      rejectUnauthorized: false
    },
    max: 8, // Limite conservador para evitar fadiga de sockets em serverless
    idleTimeoutMillis: 10000, // Fecha conexões ociosas em 10s
    connectionTimeoutMillis: 3000, // Tempo limite rápido de 3s para falhar graciosamente se offline
  });

  // Captura erros assíncronos no Pool para evitar que o Node quebre (crash involuntário)
  dbPool.on("error", (err) => {
    console.error("🚨 [Postgres Pool Error Async] Um erro ocorreu ociosamente no pool do banco de dados:", err);
  });

  return dbPool;
}

export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return !!(url && url !== "" && !url.includes("placeholder"));
}

export function isDbActive(): boolean {
  return isDbConfigured() && databaseIsOnline;
}

export function getDbProvider(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return "Desconhecido";
  if (url.includes("supabase.co") || url.includes("supabase.com") || url.includes("supabase.net") || url.includes("supabase")) {
    return "Supabase Database";
  }
  if (url.includes("neon") || url.includes("neondatabase")) {
    return "Neon Serverless";
  }
  if (url.includes("vercel-storage") || url.includes("vercel-postgres")) {
    return "Vercel Postgres";
  }
  return "PostgreSQL (Provedor Externo)";
}

export async function initDatabase() {
  if (!isDbConfigured()) {
    console.warn("⚠️ [Postgres] DATABASE_URL não definido ou inválido. O portal usará modo de demonstração em memória.");
    databaseIsOnline = false;
    return;
  }

  console.log(`🔄 [Postgres] Conectando ao provedor: ${getDbProvider()}...`);
  const pool = getDbPool();

  try {
    // Teste inicial rápido com timeout estrito de 2.5s para evitar que a Vercel trave totalmente
    const checkPromise = pool.query("SELECT 1");
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout de conexão esgotado (2.5s).")), 2500)
    );

    await Promise.race([checkPromise, timeoutPromise]);
    console.log(`📶 [Postgres] Teste de conectividade bem-sucedido com ${getDbProvider()}!`);
    databaseIsOnline = true;
  } catch (error: any) {
    console.error(`❌ [Postgres Offline] Falha de conexão inicial ao banco de dados Postgres (${getDbProvider()}):`, error.message || error);
    console.warn("⚠️ O portal continuará rodando com o MODO DEMONSTRAÇÃO EM MEMÓRIA ativo para manter o serviço Vercel estável.");
    databaseIsOnline = false;
    return; // Interrompe para não lançar erros fatais
  }

  // Agora que sabemos que o banco está online, podemos rodar as queries DDL criadoras de tabela
  try {
    // 1. Criar tabela de e-mails autorizados (Whitelist)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS allowed_emails (
        email VARCHAR(255) PRIMARY KEY,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Criar tabela de contratos em formato JSONB
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id VARCHAR(150) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contract_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Semear e-mails permitidos iniciais se a tabela estiver vazia
    const allowedRes = await pool.query("SELECT COUNT(*) FROM allowed_emails");
    const countVal = allowedRes.rows && allowedRes.rows[0] ? (allowedRes.rows[0].count || allowedRes.rows[0].COUNT || 0) : 0;
    
    if (parseInt(String(countVal), 10) === 0) {
      console.log("🌱 [Postgres] Semeando e-mails corporativos autorizados...");
      
      const defaultEmails = [
        ["origemdodia@gmail.com", "admin"],
        ["admin@suprema.io", "admin"],
        ["diretoria@suprema.io", "admin"],
        ["auditor@suprema.io", "reader"],
        ["colaborador@suprema.io", "reader"]
      ];

      for (const [email, role] of defaultEmails) {
        await pool.query(
          "INSERT INTO allowed_emails (email, role) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
          [email, role]
        );
      }
    }

    // 4. Semear contratos se a tabela estiver vazia
    const contractsRes = await pool.query("SELECT COUNT(*) FROM contracts");
    const contractsCount = contractsRes.rows && contractsRes.rows[0] ? (contractsRes.rows[0].count || contractsRes.rows[0].COUNT || 0) : 0;
    
    if (parseInt(String(contractsCount), 10) === 0) {
      console.log("🌱 [Postgres] Semeando contratos iniciais do sistema...");
      for (const contract of initialContracts) {
        await pool.query(
          "INSERT INTO contracts (id, name, contract_data) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
          [contract.id, contract.name, JSON.stringify(contract)]
        );
      }
    }

    console.log(`✅ [Postgres] Banco de dados inicializado com sucesso no ${getDbProvider()}.`);
  } catch (error: any) {
    console.error("❌ [Postgres Schema Error] Falha ao criar tabelas ou semear registros:", error);
    // Não quebramos de propósito, para o portal rodar em memória tolerando o erro
    databaseIsOnline = false;
  }
}
