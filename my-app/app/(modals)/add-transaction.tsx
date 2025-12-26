import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactionStore } from '~/store/useTransactionStore';
import { useAccountStore } from '~/store/useAccountStore';
import { CategoryPicker } from '~/components/CategoryPicker';
import { WASTE_SOURCES } from '~/utils/categories';
import { formatDateShort } from '~/utils/format';
import { toast } from 'sonner-native';
import type { RecognizedTransaction } from '~/services/aiRecognition';

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ prefill?: string }>();
  const { accounts } = useAccountStore();
  const { addTransaction } = useTransactionStore();

  const [type, setType] = useState<'income' | 'expense'>('income');
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);

  // 处理预填数据
  useEffect(() => {
    if (params.prefill) {
      try {
        const prefillData: RecognizedTransaction = JSON.parse(decodeURIComponent(params.prefill));
        
        if (prefillData.type) {
          setType(prefillData.type);
        }
        if (prefillData.amount) {
          setAmount(String(prefillData.amount));
        }
        if (prefillData.category) {
          setCategory(prefillData.category);
        }
        if (prefillData.source) {
          setSource(prefillData.source);
        }
        if (prefillData.description) {
          setDescription(prefillData.description);
        }
        if (prefillData.date) {
          setDate(new Date(prefillData.date));
        }
        
        toast.success('已自动填充识别结果，请确认');
      } catch (error) {
        console.error('Failed to parse prefill data:', error);
      }
    }
  }, [params.prefill]);

  const handleSubmit = async () => {
    if (!accountId) {
      toast.error('请选择危废贮存场所');
      return;
    }
    if (!category) {
      toast.error('请选择危废类别');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('请输入有效的危废量');
      return;
    }

    try {
      await addTransaction({
        id: '', // 让数据库自动生成 UUID
        type,
        account_id: accountId,
        category,
        amount: parseFloat(amount),
        date: formatDateShort(date),
        description: description || undefined,
        source: source || undefined,
      });
      toast.success('添加成功');
      router.back();
    } catch (error) {
      toast.error('添加失败');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Type Selector */}
        <View className="flex-row px-4 my-4">
          <TouchableOpacity
            onPress={() => setType('income')}
            className={`flex-1 py-3 rounded-lg mr-2 ${
              type === 'income' ? 'bg-sky-400' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                type === 'income' ? 'text-white' : 'text-gray-900'
              }`}
            >
              转入
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setType('expense')}
            className={`flex-1 py-3 rounded-lg ml-2 ${
              type === 'expense' ? 'bg-pink-400' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                type === 'expense' ? 'text-white' : 'text-gray-900'
              }`}
            >
              转出
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Selector */}
        <View className="px-4 mb-4">
          <Text className="text-gray-500 text-sm mb-2">危废贮存场所</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => setAccountId(acc.id)}
                className={`px-4 py-2 rounded-lg mr-2 ${
                  accountId === acc.id ? 'bg-primary-400' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    accountId === acc.id ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {acc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category Picker */}
        <View className="px-4 mb-4">
          <Text className="text-gray-500 text-sm mb-2">危废类别</Text>
          <TouchableOpacity
            onPress={() => setShowCategoryPicker(true)}
            className="bg-gray-100 p-4 rounded-lg"
          >
            <Text className="text-gray-900">
              {category || '请选择危废类别'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Source Picker */}
        <View className="px-4 mb-4">
          <Text className="text-gray-500 text-sm mb-2">危废来源</Text>
          <TouchableOpacity
            onPress={() => setShowSourcePicker(true)}
            className="bg-gray-100 p-4 rounded-lg"
          >
            <Text className="text-gray-900">{source || '请选择危废来源'}</Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        <View className="px-4 mb-4">
          <Text className="text-gray-500 text-sm mb-2">日期</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-gray-100 p-4 rounded-lg flex-row items-center"
          >
            <Calendar size={20} color="#666" style={{ marginRight: 8 }} />
            <Text className="text-gray-900">{formatDateShort(date)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </View>

        {/* Amount Input */}
        <View className="px-4 mb-4">
          <Text className="text-gray-500 text-sm mb-2">危废量（吨）</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="请输入危废量"
            keyboardType="decimal-pad"
            className="bg-gray-100 p-4 rounded-lg text-gray-900"
          />
        </View>

        {/* Description Input */}
        <View className="px-4 mb-4">
          <Text className="text-gray-500 text-sm mb-2">描述（可选）</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="请输入描述"
            multiline
            numberOfLines={4}
            className="bg-gray-100 p-4 rounded-lg text-gray-900"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="mx-4 mb-8 bg-primary-400 py-4 rounded-lg"
        >
          <Text className="text-white text-center font-bold text-lg">提交</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Picker Modal */}
      <CategoryPicker
        visible={showCategoryPicker}
        selectedCategory={category}
        onSelect={setCategory}
        onClose={() => setShowCategoryPicker(false)}
      />

      {/* Source Picker Modal */}
      {showSourcePicker && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[50%]">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-gray-900 text-xl font-bold">选择危废来源</Text>
            </View>
            <ScrollView>
              {WASTE_SOURCES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    setSource(s);
                    setShowSourcePicker(false);
                  }}
                  className="p-4 border-b border-gray-100"
                >
                  <Text className="text-gray-900">{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

