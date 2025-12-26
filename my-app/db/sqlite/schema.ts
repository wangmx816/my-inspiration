export interface Account {
  id: string;
  name: string;
  balance: number;
  icon: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense'; // income = 转入, expense = 转出
  amount: number;
  category: string; // 危废类别 (HW01-HW49)
  account_id: string;
  date: string;
  description?: string;
  source?: string; // 危废来源
  created_at: string;
}

export const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 0,
    icon TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    account_id TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    source TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
`;





