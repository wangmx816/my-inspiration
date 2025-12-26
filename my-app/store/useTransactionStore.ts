import { create } from 'zustand';
import type { Transaction } from '~/db/sqlite/schema';
// 使用 InsForge 云端数据库
import * as db from '~/db/supabase/database';
// 如果需要使用本地 SQLite，取消下面的注释并注释掉上面的导入
// import * as db from '~/db/sqlite/database';

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTransactions: (filters?: {
    accountId?: string;
    type?: 'income' | 'expense';
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Computed
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getTransactionsByAccount: (accountId: string) => Transaction[];
  getTransactionsByType: (type: 'income' | 'expense') => Transaction[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  
  loadTransactions: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await db.getTransactions(filters);
      set({ transactions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load transactions',
        isLoading: false 
      });
    }
  },
  
  addTransaction: async (transaction) => {
    try {
      const newTransaction = await db.createTransaction(transaction);
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
      }));
      // Reload accounts to update balances
      const { useAccountStore } = await import('./useAccountStore');
      useAccountStore.getState().loadAccounts();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add transaction',
      });
      throw error;
    }
  },
  
  updateTransaction: async (id, updates) => {
    try {
      await db.updateTransaction(id, updates);
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }));
      // Reload accounts to update balances
      const { useAccountStore } = await import('./useAccountStore');
      useAccountStore.getState().loadAccounts();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update transaction',
      });
      throw error;
    }
  },
  
  deleteTransaction: async (id) => {
    try {
      await db.deleteTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
      // Reload accounts to update balances
      const { useAccountStore } = await import('./useAccountStore');
      useAccountStore.getState().loadAccounts();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete transaction',
      });
      throw error;
    }
  },
  
  getTotalIncome: () => {
    const { transactions } = get();
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);
  },
  
  getTotalExpense: () => {
    const { transactions } = get();
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);
  },
  
  getTransactionsByAccount: (accountId) => {
    const { transactions } = get();
    return transactions.filter((t) => t.account_id === accountId);
  },
  
  getTransactionsByType: (type) => {
    const { transactions } = get();
    return transactions.filter((t) => t.type === type);
  },
  
  getTransactionsByDateRange: (startDate, endDate) => {
    const { transactions } = get();
    return transactions.filter(
      (t) => t.date >= startDate && t.date <= endDate
    );
  },
}));

