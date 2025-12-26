import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '~/contexts/authContext';
import { View, Text, ActivityIndicator } from 'react-native';

export default function AuthIndex() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading]);

  return (
    <View className="flex-1 items-center justify-center bg-gray-900">
      <ActivityIndicator size="large" color="#f472b6" />
      <Text className="text-white mt-4">加载中...</Text>
    </View>
  );
}




