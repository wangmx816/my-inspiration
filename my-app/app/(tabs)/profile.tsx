import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { User, Settings, FileText, LogOut, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/contexts/authContext';
import { toast } from 'sonner-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-6 px-4 bg-white">
        <Text className="text-gray-900 text-2xl font-bold">个人资料</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-pink-100 items-center justify-center mb-4">
            <User size={48} color="#f472b6" />
          </View>
          <View className="flex-row items-center">
            <Mail size={16} color="#666" style={{ marginRight: 8 }} />
            <Text className="text-gray-900 text-lg">{user?.email || '未登录'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-4">
          <TouchableOpacity
            className="flex-row items-center bg-white p-4 rounded-xl mb-3 border border-gray-200"
            onPress={() => {
              // TODO: Navigate to edit profile
            }}
          >
            <Settings size={24} color="#666" style={{ marginRight: 16 }} />
            <Text className="text-gray-900 text-base flex-1">编辑资料</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-white p-4 rounded-xl mb-3 border border-gray-200"
            onPress={() => {
              // TODO: Navigate to settings
            }}
          >
            <Settings size={24} color="#666" style={{ marginRight: 16 }} />
            <Text className="text-gray-900 text-base flex-1">界面设置</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-white p-4 rounded-xl mb-3 border border-gray-200"
            onPress={() => {
              // TODO: Navigate to privacy policy
            }}
          >
            <FileText size={24} color="#666" style={{ marginRight: 16 }} />
            <Text className="text-gray-900 text-base flex-1">隐私政策</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-white p-4 rounded-xl mb-3 border border-gray-200"
            onPress={async () => {
              try {
                await signOut();
                toast.success('已登出');
                router.replace('/(auth)/login');
              } catch (error) {
                toast.error('登出失败');
              }
            }}
          >
            <LogOut size={24} color="#f472b6" style={{ marginRight: 16 }} />
            <Text className="text-pink-400 text-base flex-1">登出</Text>
          </TouchableOpacity>
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}


