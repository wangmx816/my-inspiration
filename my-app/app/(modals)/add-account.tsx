import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Wallet } from 'lucide-react-native';
import { useAccountStore } from '~/store/useAccountStore';
import { useAuth } from '~/contexts/authContext';
import { toast } from 'sonner-native';

export default function AddAccountScreen() {
  const router = useRouter();
  const { addAccount } = useAccountStore();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('0');

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('请输入贮存场所名称');
      return;
    }

    // 检查用户是否已登录
    if (!user) {
      toast.error('请先登录');
      router.replace('/(auth)/login');
      return;
    }

    try {
      console.log('[AddAccount] Submitting account:', { 
        name: name.trim(), 
        balance: parseFloat(balance) || 0,
        userId: user.id 
      });
      await addAccount({
        id: '', // 让数据库自动生成 UUID
        name: name.trim(),
        balance: parseFloat(balance) || 0,
        icon: 'wallet',
        user_id: user.id, // 明确传递用户 ID
      });
      toast.success('添加成功');
      router.back();
    } catch (error: any) {
      console.error('[AddAccount] Error:', error);
      const errorMessage = error?.message || error?.toString() || '添加失败';
      toast.error(errorMessage);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Icon Preview */}
        <View className="items-center my-6">
          <View className="w-20 h-20 rounded-full bg-primary-400/20 items-center justify-center">
            <Wallet size={40} color="#f472b6" />
          </View>
        </View>

        {/* Name Input */}
        <View className="px-4 mb-4">
          <Text className="text-gray-500 text-sm mb-2">贮存场所名称</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="请输入贮存场所名称"
            className="bg-gray-100 p-4 rounded-lg text-gray-900"
          />
        </View>

        {/* Initial Balance Input */}
        <View className="px-4 mb-4">
          <Text className="text-gray-500 text-sm mb-2">初始贮存量（吨）</Text>
          <TextInput
            value={balance}
            onChangeText={setBalance}
            placeholder="0"
            keyboardType="decimal-pad"
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
    </View>
  );
}

