import { neon } from "@neondatabase/serverless";
import { initialContracts } from "../data";

// Interface simplificada que imita o comportamento básico do pg Pool para o restante da aplicação.
// Isso evita a necessidade de abrir conexões WebSocket ou TCP persistentes no ambiente Serverless da Vercel,
// eliminando por completo problemas de "FUNCTION_INVOCATION_FAILED" causados por limites de sockets/cold starts.
export interface SimpleQueryResult {
  rows: any[];
}

export interface SimpleDbPool {
  query: (text: string, params?: any[]) => Promise<SimpleQueryResult>;
}

let dbPool: SimpleDbPool | null = null;

export function getDbPool(): SimpleDbPool {
  if (dbPool) return dbPool;

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("O segredo DATABASE_URL ou POSTGRES_URL não está configurado nas variáveis de ambiente.");
  }

  // Neon HTTP/fetch client
  const sql = neon(connectionString);

  dbPool = {
    query: async (text: string, params?: any[]) => {
      try {
        const rows = await (sql as any)(text, params || []);
        return { rows: Array.isArray(rows) ? rows : [] };
      } catch (err: any) {
        console.error("❌ [DbPool Error] Falha ao executar query HTTP no Neon:", err);
        throw err;
      }
    }
  };

  return dbPool;
}

export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return !!(url && url !== "" && !url.includes("placeholder"));
}

export async function initDatabase() {
  if (!isDbConfigured()) {
    console.warn("⚠️ [Postgres] DATABASE_URL não definido ou inválido. O portal usará modo de demonstração em memória.");
    return;
  }

  console.log("🔄 [Postgres] Inicializando banco de dados Neon/Vercel...");
  const pool = getDbPool();

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

    console.log("✅ [Postgres] Tabelas criadas e alimentadas com sucesso no Neon via HTTPS.");
  } catch (error) {
    console.error("❌ [Postgres] Erro ao inicializar tabelas ou semear dados no Postgres Neon:", error);
  }
}

