import pg from "pg";
const { Pool } = pg;
import { initialContracts } from "../data";

let dbPool: pg.Pool | null = null;

export function getDbPool(): pg.Pool {
  if (dbPool) return dbPool;

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("O segredo DATABASE_URL ou POSTGRES_URL não está configurado nas variáveis de ambiente.");
  }

  // Neon requer SSL ativo para conexões TCP robustas fora da rede interna
  dbPool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
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
    if (parseInt(allowedRes.rows[0].count, 10) === 0) {
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
    if (parseInt(contractsRes.rows[0].count, 10) === 0) {
      console.log("🌱 [Postgres] Semeando contratos iniciais do sistema...");
      for (const contract of initialContracts) {
        await pool.query(
          "INSERT INTO contracts (id, name, contract_data) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
          [contract.id, contract.name, JSON.stringify(contract)]
        );
      }
    }

    console.log("✅ [Postgres] Tabelas criadas e alimentadas com sucesso no Neon.");
  } catch (error) {
    console.error("❌ [Postgres] Erro ao inicializar tabelas ou semear dados no Postgres Neon:", error);
  }
}
