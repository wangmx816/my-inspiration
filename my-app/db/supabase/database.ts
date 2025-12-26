import { insforge } from '~/lib/insforge';
import type { Account, Transaction } from '../sqlite/schema';

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await insforge.auth.getCurrentUser();
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

// Account CRUD operations
export async function createAccount(account: Omit<Account, 'created_at' | 'user_id'> & { user_id?: string }): Promise<Account> {
  try {
    const userId = account.user_id || await getCurrentUserId();
    console.log('[DB] Creating account with userId:', userId);
    
    // 如果提供了 ID，使用它；否则让数据库自动生成 UUID
    const accountData: any = {
      name: account.name,
      balance: account.balance || 0,
      icon: account.icon,
      // 设置 user_id：如果提供了就使用，否则使用当前用户 ID，如果都没有则设为 null（允许匿名访问）
      user_id: account.user_id || userId || null,
    };
    
    // 如果 ID 是有效的 UUID 格式，使用它；否则让数据库生成（空字符串或无效格式都会让数据库生成）
    if (account.id && account.id.trim() !== '' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(account.id)) {
      accountData.id = account.id;
    }

    console.log('[DB] Inserting account data:', accountData);

    const { data, error } = await insforge.database
      .from('accounts')
      .insert([accountData])
      .select()
      .single();

    if (error) {
      console.error('[DB] Error creating account:', error);
      throw error;
    }
    if (!data) {
      console.error('[DB] No data returned from insert');
      throw new Error('Failed to create account: No data returned');
    }

    console.log('[DB] Account created successfully:', data);

    return {
      id: data.id,
      name: data.name,
      balance: data.balance,
      icon: data.icon,
      created_at: data.created_at,
    } as Account;
  } catch (error: any) {
    console.error('[DB] createAccount error:', error);
    throw error;
  }
}

export async function getAccounts(userId?: string): Promise<Account[]> {
  const currentUserId = userId || await getCurrentUserId();
  let query = insforge.database.from('accounts').select('*');

  if (currentUserId) {
    query = query.eq('user_id', currentUserId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    balance: item.balance,
    icon: item.icon,
    created_at: item.created_at,
  })) as Account[];
}

export async function getAccountById(id: string): Promise<Account | null> {
  const { data, error } = await insforge.database
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    balance: data.balance,
    icon: data.icon,
    created_at: data.created_at,
  } as Account;
}

export async function updateAccount(
  id: string,
  updates: Partial<Omit<Account, 'id' | 'created_at' | 'user_id'>>
): Promise<void> {
  const { error } = await insforge.database
    .from('accounts')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAccount(id: string): Promise<void> {
  const { error } = await insforge.database
    .from('accounts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Transaction CRUD operations
export async function createTransaction(
  transaction: Omit<Transaction, 'created_at' | 'user_id'> & { user_id?: string }
): Promise<Transaction> {
  const userId = transaction.user_id || await getCurrentUserId();
  // 如果提供了 ID，使用它；否则让数据库自动生成 UUID
  const transactionData: any = {
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    account_id: transaction.account_id,
    date: transaction.date,
    description: transaction.description || null,
    source: transaction.source || null,
    user_id: userId,
  };
  
  // 如果 ID 是有效的 UUID 格式，使用它；否则让数据库生成（空字符串或无效格式都会让数据库生成）
  if (transaction.id && transaction.id.trim() !== '' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(transaction.id)) {
    transactionData.id = transaction.id;
  }

  const { data, error } = await insforge.database
    .from('transactions')
    .insert([transactionData])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create transaction');

  // Update account balance
  const account = await getAccountById(transaction.account_id);
  if (account) {
    const newBalance =
      transaction.type === 'income'
        ? account.balance + transaction.amount
        : account.balance - transaction.amount;
    await updateAccount(transaction.account_id, { balance: newBalance });
  }

  return {
    id: data.id,
    type: data.type,
    amount: data.amount,
    category: data.category,
    account_id: data.account_id,
    date: data.date,
    description: data.description,
    source: data.source,
    created_at: data.created_at,
  } as Transaction;
}

export async function getTransactions(filters?: {
  accountId?: string;
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  userId?: string;
}): Promise<Transaction[]> {
  const currentUserId = filters?.userId || await getCurrentUserId();
  let query = insforge.database.from('transactions').select('*');

  if (filters?.accountId) {
    query = query.eq('account_id', filters.accountId);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }
  if (currentUserId) {
    query = query.eq('user_id', currentUserId);
  }

  const { data, error } = await query
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((item) => ({
    id: item.id,
    type: item.type,
    amount: item.amount,
    category: item.category,
    account_id: item.account_id,
    date: item.date,
    description: item.description,
    source: item.source,
    created_at: item.created_at,
  })) as Transaction[];
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const { data, error } = await insforge.database
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    type: data.type,
    amount: data.amount,
    category: data.category,
    account_id: data.account_id,
    date: data.date,
    description: data.description,
    source: data.source,
    created_at: data.created_at,
  } as Transaction;
}

export async function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'user_id'>>
): Promise<void> {
  // Get old transaction to update account balance
  const oldTransaction = await getTransactionById(id);
  if (!oldTransaction) return;

  const { error } = await insforge.database
    .from('transactions')
    .update(updates)
    .eq('id', id);

  if (error) throw error;

  // Update account balances if amount or type changed
  if (updates.amount !== undefined || updates.type !== undefined || updates.account_id !== undefined) {
    // Revert old transaction effect
    const oldAccount = await getAccountById(oldTransaction.account_id);
    if (oldAccount) {
      const revertedBalance =
        oldTransaction.type === 'income'
          ? oldAccount.balance - oldTransaction.amount
          : oldAccount.balance + oldTransaction.amount;
      await updateAccount(oldTransaction.account_id, { balance: revertedBalance });
    }

    // Apply new transaction effect
    const newTransaction = await getTransactionById(id);
    if (newTransaction) {
      const newAccount = await getAccountById(newTransaction.account_id);
      if (newAccount) {
        const newBalance =
          newTransaction.type === 'income'
            ? newAccount.balance + newTransaction.amount
            : newAccount.balance - newTransaction.amount;
        await updateAccount(newTransaction.account_id, { balance: newBalance });
      }
    }
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  // Get transaction to revert account balance
  const transaction = await getTransactionById(id);
  if (transaction) {
    const account = await getAccountById(transaction.account_id);
    if (account) {
      const newBalance =
        transaction.type === 'income'
          ? account.balance - transaction.amount
          : account.balance + transaction.amount;
      await updateAccount(transaction.account_id, { balance: newBalance });
    }
  }

  const { error } = await insforge.database
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

