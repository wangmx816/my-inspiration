import { View, Text, TouchableOpacity } from 'react-native';
import { formatAmount, formatDateShort } from '~/utils/format';
import { getCategoryByCode } from '~/utils/categories';
import type { Transaction } from '~/db/sqlite/schema';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const category = getCategoryByCode(transaction.category);
  const Icon = category?.icon || ArrowUpCircle;
  const isIncome = transaction.type === 'income';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white flex-row items-center p-4 mx-4 mb-2 rounded-xl border border-gray-200"
      activeOpacity={0.7}
    >
      <View
        className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
          isIncome ? 'bg-blue-100' : 'bg-pink-100'
        }`}
      >
        {isIncome ? (
          <ArrowUpCircle size={24} color="#38bdf8" />
        ) : (
          <ArrowDownCircle size={24} color="#f472b6" />
        )}
      </View>
      
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base">
          {category?.name || transaction.category}
        </Text>
        <Text className="text-gray-600 text-sm mt-1">
          {transaction.source || '未指定来源'}
        </Text>
        <Text className="text-gray-400 text-xs mt-1">
          {formatDateShort(transaction.date)}
        </Text>
      </View>
      
      <View className="items-end">
        <Text
          className={`text-lg font-bold ${
            isIncome ? 'text-sky-400' : 'text-pink-400'
          }`}
        >
          {isIncome ? '+' : '-'}{formatAmount(transaction.amount)} 吨
        </Text>
        {transaction.description && (
          <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
            {transaction.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}


