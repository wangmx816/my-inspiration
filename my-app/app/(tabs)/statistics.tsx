import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { BarChart } from 'react-native-gifted-charts';
import { useTransactionStore } from '~/store/useTransactionStore';
import { useAccountStore } from '~/store/useAccountStore';
import { TransactionItem } from '~/components/TransactionItem';
import { formatAmount } from '~/utils/format';
import { startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

type PeriodType = 'week' | 'month' | 'year';
type ViewType = 'total' | 'income' | 'expense';

export default function StatisticsScreen() {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [viewType, setViewType] = useState<ViewType>('total');
  const { transactions, loadTransactions, getTotalIncome, getTotalExpense } = useTransactionStore();
  const { accounts, loadAccounts, getTotalBalance } = useAccountStore();

  // 页面聚焦时重新加载数据，确保数据是最新的
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await loadTransactions();
        await loadAccounts(); // 加载账户数据以计算总贮存量
      };
      init();
    }, [loadTransactions, loadAccounts])
  );

  const getDateRange = () => {
    const now = new Date();
    let start: Date, end: Date;

    switch (period) {
      case 'week':
        start = startOfWeek(now, { locale: zhCN });
        end = endOfWeek(now, { locale: zhCN });
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
    }

    return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
  };

  const { start, end } = getDateRange();
  
  // 调试日志
  console.log('[Statistics] 数据状态:', {
    transactionsCount: transactions.length,
    dateRange: { start, end },
    viewType,
    period,
    sampleDates: transactions.slice(0, 3).map(t => ({ date: t.date, type: t.type, amount: t.amount })),
  });
  
  // 按日期排序，最新的在前
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date); // 日期降序
    }
    // 如果日期相同，按创建时间降序
    return (b.created_at || '').localeCompare(a.created_at || '');
  });
  
  // 过滤日期范围内的交易
  // 注意：如果日期格式不一致可能导致过滤失败，所以先尝试过滤，如果结果为空且总记录不为空，显示所有记录
  let filteredTransactions = sortedTransactions.filter(
    (t) => {
      const transactionDate = t.date || '';
      const inRange = transactionDate >= start && transactionDate <= end;
      if (!inRange && transactions.length > 0) {
        console.log('[Statistics] 交易日期不在范围内:', {
          transactionDate,
          range: `${start} - ${end}`,
          type: t.type,
          amount: t.amount,
        });
      }
      return inRange;
    }
  );
  
  // 如果过滤后没有记录，但总记录不为空，可能是日期格式问题
  // 先尝试显示所有记录（不按日期过滤），让用户能看到数据
  if (filteredTransactions.length === 0 && sortedTransactions.length > 0) {
    console.warn('[Statistics] 日期过滤后无记录，显示所有记录（不按日期过滤）');
    // 暂时显示所有记录，以便调试
    filteredTransactions = sortedTransactions;
  }
  
  console.log('[Statistics] 过滤后的交易数量:', {
    filtered: filteredTransactions.length,
    total: sortedTransactions.length,
    income: filteredTransactions.filter(t => t.type === 'income').length,
    expense: filteredTransactions.filter(t => t.type === 'expense').length,
  });

  const getChartData = () => {
    const data = filteredTransactions.map((t, index) => {
      let value = 0;
      if (viewType === 'total') {
        value = t.type === 'income' ? t.amount : -t.amount;
      } else if (viewType === 'income' && t.type === 'income') {
        value = t.amount;
      } else if (viewType === 'expense' && t.type === 'expense') {
        value = t.amount;
      }

      return {
        value: Math.abs(value),
        label: format(new Date(t.date), 'MM/dd'),
        frontColor: viewType === 'expense' ? '#f472b6' : '#38bdf8',
      };
    });

    return data.slice(0, 10); // Limit to 10 data points
  };

  const chartData = getChartData();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-4 px-4 bg-white">
        <Text className="text-gray-900 text-2xl font-bold">统计</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View className="flex-row px-4 mb-4">
          {(['week', 'month', 'year'] as PeriodType[]).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              className={`flex-1 mx-1 py-2 rounded-lg ${
                period === p ? 'bg-primary-400' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  period === p ? 'text-white' : 'text-gray-900'
                }`}
              >
                {p === 'week' ? '每周' : p === 'month' ? '每月' : '每年'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* View Type Selector */}
        <View className="flex-row px-4 mb-4">
          {(['total', 'income', 'expense'] as ViewType[]).map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => setViewType(v)}
              className={`flex-1 mx-1 py-2 rounded-lg ${
                viewType === v ? 'bg-secondary-400' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  viewType === v ? 'text-white' : 'text-gray-900'
                }`}
              >
                {v === 'total' ? '总贮存量' : v === 'income' ? '转入' : '转出'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        {chartData.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mx-4 mb-4">
            <BarChart
              data={chartData}
              width={300}
              height={200}
              barWidth={20}
              spacing={10}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: '#666', fontSize: 10 }}
              noOfSections={4}
              maxValue={Math.max(...chartData.map((d) => d.value), 1)}
            />
          </View>
        )}

        {/* Summary - 根据选择的类型显示对应的统计结果 */}
        {viewType === 'total' && (
          <View className="px-4 mb-4">
            <View className="bg-white rounded-xl p-4">
              <Text className="text-gray-500 text-sm mb-1">总贮存量</Text>
              <Text className="text-gray-900 text-2xl font-bold">
                {formatAmount(getTotalBalance())} 吨
              </Text>
              {/* 调试信息 */}
              {__DEV__ && (
                <Text className="text-gray-400 text-xs mt-1">
                  账户数: {accounts.length}, 总余额: {getTotalBalance()}
                </Text>
              )}
            </View>
          </View>
        )}
        {viewType === 'income' && (
          <View className="px-4 mb-4">
            <View className="bg-white rounded-xl p-4">
              <Text className="text-gray-500 text-sm mb-1">转入</Text>
              <Text className="text-sky-400 text-2xl font-bold">
                {formatAmount(
                  filteredTransactions
                    .filter((t) => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}{' '}
                吨
              </Text>
            </View>
          </View>
        )}
        {viewType === 'expense' && (
          <View className="px-4 mb-4">
            <View className="bg-white rounded-xl p-4">
              <Text className="text-gray-500 text-sm mb-1">转出</Text>
              <Text className="text-pink-400 text-2xl font-bold">
                {formatAmount(
                  filteredTransactions
                    .filter((t) => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}{' '}
                吨
              </Text>
            </View>
          </View>
        )}

        {/* Transaction List - 根据选择的类型过滤显示 */}
        <View className="px-4 mb-4">
          <Text className="text-gray-900 text-lg font-bold mb-3">明细列表</Text>
          {(() => {
            // 根据viewType过滤交易记录
            // viewType === 'total' 时显示所有记录（转入+转出）
            let displayTransactions = filteredTransactions;
            if (viewType === 'income') {
              displayTransactions = filteredTransactions.filter((t) => t.type === 'income');
            } else if (viewType === 'expense') {
              displayTransactions = filteredTransactions.filter((t) => t.type === 'expense');
            }
            // viewType === 'total' 时，displayTransactions 已经是所有记录

            console.log('[Statistics] 明细列表:', {
              viewType,
              filteredCount: filteredTransactions.length,
              displayCount: displayTransactions.length,
              incomeCount: filteredTransactions.filter((t) => t.type === 'income').length,
              expenseCount: filteredTransactions.filter((t) => t.type === 'expense').length,
            });

            if (displayTransactions.length === 0) {
              // 如果没有过滤后的记录，检查是否有所有记录
              if (transactions.length === 0) {
                return (
                  <View className="items-center justify-center py-12">
                    <Text className="text-gray-400 text-sm">暂无交易记录</Text>
                    <Text className="text-gray-400 text-xs mt-2">请先添加交易记录</Text>
                  </View>
                );
              }
              // 如果有交易记录但不在当前日期范围内
              return (
                <View className="items-center justify-center py-12">
                  <Text className="text-gray-400 text-sm">当前时间段内暂无记录</Text>
                  <Text className="text-gray-400 text-xs mt-2">
                    时间段：{start} 至 {end}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">
                    总记录数：{transactions.length}
                  </Text>
                </View>
              );
            }
            return displayTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ));
          })()}
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}


