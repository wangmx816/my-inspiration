import { create } from 'zustand';
import type { Account } from '~/db/sqlite/schema';
// 使用 InsForge 云端数据库
import * as db from '~/db/supabase/database';
// 如果需要使用本地 SQLite，取消下面的注释并注释掉上面的导入
// import * as db from '~/db/sqlite/database';

interface AccountStore {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadAccounts: () => Promise<void>;
  addAccount: (account: Omit<Account, 'created_at'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Omit<Account, 'id' | 'created_at'>>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  // Computed
  getTotalBalance: () => number;
  getAccountById: (id: string) => Account | undefined;
}

export const useAccountStore = create<AccountStore>((set, get) => ({
  accounts: [],
  isLoading: false,
  error: null,
  
  loadAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('[AccountStore] Loading accounts...');
      const accounts = await db.getAccounts();
      console.log('[AccountStore] Accounts loaded:', {
        count: accounts.length,
        accounts: accounts.map(acc => ({ name: acc.name, balance: acc.balance })),
        totalBalance: accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0),
      });
      set({ accounts, isLoading: false });
    } catch (error) {
      console.error('[AccountStore] Error loading accounts:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load accounts',
        isLoading: false 
      });
    }
  },
  
  addAccount: async (account) => {
    try {
      console.log('[Store] Adding account:', account);
      const newAccount = await db.createAccount(account);
      console.log('[Store] Account added successfully:', newAccount);
      set((state) => ({
        accounts: [newAccount, ...state.accounts],
      }));
    } catch (error: any) {
      console.error('[Store] Error adding account:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to add account';
      set({ 
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },
  
  updateAccount: async (id, updates) => {
    try {
      await db.updateAccount(id, updates);
      set((state) => ({
        accounts: state.accounts.map((acc) =>
          acc.id === id ? { ...acc, ...updates } : acc
        ),
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update account',
      });
      throw error;
    }
  },
  
  deleteAccount: async (id) => {
    try {
      await db.deleteAccount(id);
      set((state) => ({
        accounts: state.accounts.filter((acc) => acc.id !== id),
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete account',
      });
      throw error;
    }
  },
  
  getTotalBalance: () => {
    const { accounts } = get();
    // 计算总贮存量：所有贮存场所的贮存量之和
    const total = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    console.log('[AccountStore] getTotalBalance:', {
      accountsCount: accounts.length,
      accounts: accounts.map(acc => ({ name: acc.name, balance: acc.balance })),
      total,
    });
    return total;
  },
  
  getAccountById: (id) => {
    const { accounts } = get();
    return accounts.find((acc) => acc.id === id);
  },
}));

