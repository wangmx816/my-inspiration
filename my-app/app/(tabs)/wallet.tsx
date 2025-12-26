import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { AccountItem } from '~/components/AccountItem';
import { useAccountStore } from '~/store/useAccountStore';
import { formatAmount } from '~/utils/format';
import { useCallback } from 'react';

export default function WalletScreen() {
  const router = useRouter();
  const { accounts, loadAccounts, getTotalBalance } = useAccountStore();

  // 页面聚焦时重新加载数据，确保显示最新的总贮存量
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await loadAccounts();
      };
      init();
    }, [loadAccounts])
  );

  // 计算总贮存量（所有贮存场所的贮存量之和）
  const totalBalance = getTotalBalance();
  
  // 验证：总贮存量应该等于各贮存场所的贮存量之和
  // getTotalBalance() 已经实现了这个逻辑：accounts.reduce((total, acc) => total + acc.balance, 0)

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-4 px-4 bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-900 text-2xl font-bold">危废贮存场所</Text>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/add-account')}
            className="w-10 h-10 rounded-full bg-primary-400 items-center justify-center"
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-xl p-4">
          <Text className="text-gray-900/60 text-sm mb-1">总贮存量</Text>
          <Text className="text-gray-900 text-3xl font-bold">
            {formatAmount(totalBalance)} 吨
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {accounts.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-900/40 text-sm mb-4">暂无贮存场所</Text>
            <TouchableOpacity
              onPress={() => router.push('/(modals)/add-account')}
              className="bg-primary-400 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">添加贮存场所</Text>
            </TouchableOpacity>
          </View>
        ) : (
          accounts.map((account) => (
            <AccountItem
              key={account.id}
              account={account}
              onPress={() => {
                // TODO: Navigate to account detail
              }}
            />
          ))
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

