import { View, Text, TouchableOpacity } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { formatAmount } from '~/utils/format';
import type { Account } from '~/db/sqlite/schema';

interface AccountItemProps {
  account: Account;
  onPress?: () => void;
}

export function AccountItem({ account, onPress }: AccountItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white flex-row items-center p-4 mx-4 mb-3 rounded-xl border border-gray-200"
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-full bg-pink-100 items-center justify-center mr-4">
        <Wallet size={24} color="#f472b6" />
      </View>
      
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base">
          {account.name}
        </Text>
        <Text className="text-gray-600 text-sm mt-1">
          贮存场所
        </Text>
      </View>
      
      <View className="items-end">
        <Text className="text-gray-900 text-lg font-bold">
          {formatAmount(account.balance)} 吨
        </Text>
      </View>
    </TouchableOpacity>
  );
}


