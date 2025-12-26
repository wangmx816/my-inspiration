import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { formatAmount } from '~/utils/format';

interface BalanceCardProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export function BalanceCard({ totalBalance, totalIncome, totalExpense }: BalanceCardProps) {
  return (
    <View className="bg-white rounded-2xl p-6 mx-4 my-4 shadow-lg">
      <Text className="text-gray-500 text-sm mb-2">总贮存量</Text>
      <Text className="text-gray-900 text-3xl font-bold mb-6">
        {formatAmount(totalBalance)} 吨
      </Text>
      
      <View className="flex-row justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className="mr-1">
              <TrendingUp size={16} color="#38bdf8" />
            </View>
            <Text className="text-gray-500 text-xs">转入</Text>
          </View>
          <Text className="text-sky-400 text-lg font-semibold">
            {formatAmount(totalIncome)} 吨
          </Text>
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className="mr-1">
              <TrendingDown size={16} color="#f472b6" />
            </View>
            <Text className="text-gray-500 text-xs">转出</Text>
          </View>
          <Text className="text-pink-400 text-lg font-semibold">
            {formatAmount(totalExpense)} 吨
          </Text>
        </View>
      </View>
    </View>
  );
}


