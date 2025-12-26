import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Search } from 'lucide-react-native';
import { BalanceCard } from '~/components/BalanceCard';
import { TransactionItem } from '~/components/TransactionItem';
import { FloatingActionButton } from '~/components/FloatingActionButton';
import { useAccountStore } from '~/store/useAccountStore';
import { useTransactionStore } from '~/store/useTransactionStore';
import { useAuth } from '~/contexts/authContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { accounts, loadAccounts, getTotalBalance } = useAccountStore();
  const { transactions, loadTransactions, getTotalIncome, getTotalExpense } = useTransactionStore();

  useEffect(() => {
    // 如果未登录，跳转到登录页
    if (!loading && !user) {
      router.replace('/(auth)/login');
      return;
    }
  }, [user, loading, router]);

  // 页面聚焦时重新加载数据，确保总贮存量与贮存场所页面一致
  useFocusEffect(
    useCallback(() => {
      if (user) {
        const init = async () => {
          await loadAccounts();
          await loadTransactions();
        };
        init();
      }
    }, [user, loadAccounts, loadTransactions])
  );

  const totalBalance = getTotalBalance();
  const recentTransactions = transactions.slice(0, 10);
  
  // 调试日志
  console.log('[Home] 账户数据:', {
    accountsCount: accounts.length,
    accounts: accounts.map(acc => ({ name: acc.name, balance: acc.balance })),
    totalBalance,
  });
  
  // 基于最近显示的明细计算统计，确保统计和明细一致
  const totalIncome = recentTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = recentTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pt-12 bg-white">
        <View>
          <Text className="text-gray-500 text-sm">欢迎回来</Text>
          <Text className="text-gray-900 text-xl font-bold">
            {user?.email || '危废转移联单'}
          </Text>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
          <Search size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <BalanceCard
          totalBalance={totalBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
        />

        {/* Recent Transactions */}
        <View className="mt-2">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-gray-900 text-lg font-bold">最近记录</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/statistics')}>
              <Text className="text-pink-400 text-sm">查看全部</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-gray-400 text-sm">暂无记录</Text>
            </View>
          ) : (
            recentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onPress={() => {
                  // TODO: Navigate to transaction detail
                }}
              />
            ))
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onAddTransaction={() => router.push('/(modals)/add-transaction')}
        onTextInput={() => router.push('/(modals)/recognize-input?type=text')}
        onVoiceInput={() => router.push('/(modals)/recognize-input?type=voice')}
        onCameraInput={() => router.push('/(modals)/recognize-input?type=camera')}
      />
    </View>
  );
}
