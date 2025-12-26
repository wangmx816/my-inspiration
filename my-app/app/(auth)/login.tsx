import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Github } from 'lucide-react-native';
import { useAuth } from '~/contexts/authContext';
import { toast } from 'sonner-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error('请输入邮箱和密码');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('登录成功');
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMessage = error.message || error.toString() || '登录失败';
      console.log('Login error:', errorMessage); // 调试用
      
      // 检查是否是网络错误
      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('ERR_NAME_NOT_RESOLVED') ||
        errorMessage.includes('network') ||
        errorMessage.includes('NetworkError')
      ) {
        toast.error('网络连接失败，请检查：\n1. 网络连接是否正常\n2. InsForge 服务器是否可访问\n3. 防火墙设置');
        return;
      }
      
      // 检查是否是邮箱验证相关的错误
      const isVerificationError = 
        errorMessage.includes('verification') || 
        errorMessage.includes('验证') || 
        errorMessage.includes('confirm') || 
        errorMessage.includes('Email verification') ||
        (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('confirm'));
      
      if (isVerificationError) {
        toast.error('请先验证您的邮箱地址');
        // 延迟跳转，让用户看到错误提示
        setTimeout(() => {
          router.replace({
            pathname: '/(auth)/verify-email',
            params: { email },
          });
        }, 1000);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      await signInWithOAuth(provider);
      // OAuth 会打开浏览器，完成后会自动返回
    } catch (error: any) {
      toast.error(error.message || 'OAuth 登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="flex-1 justify-center px-6 py-12">
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <Text className="text-gray-900 text-3xl font-bold mb-2">Welcome Back</Text>
          <Text className="text-gray-500 text-sm mb-8">Login to your account</Text>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm mb-2">Email</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-4">
              <Mail size={20} color="#666" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3 py-3 text-gray-900"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-700 text-sm">Password</Text>
              <TouchableOpacity>
                <Text className="text-pink-400 text-sm">Forget Password?</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-4">
              <Lock size={20} color="#666" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                className="flex-1 ml-3 py-3 text-gray-900"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className="bg-gray-900 py-4 rounded-lg mb-6"
          >
            <Text className="text-white text-center font-semibold text-base">
              {loading ? '登录中...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mb-6">
            <Text className="text-gray-500 text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-pink-400 font-semibold text-sm">Sign Up Now</Text>
            </TouchableOpacity>
          </View>

          {/* Separator */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-500 text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Social Login Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleOAuth('github')}
              disabled={loading}
              className="flex-1 bg-white border border-gray-200 py-3 rounded-lg flex-row items-center justify-center"
            >
              <Github size={20} color="#000" />
              <Text className="ml-2 text-gray-900 font-semibold">GitHub</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleOAuth('google')}
              disabled={loading}
              className="flex-1 bg-white border border-gray-200 py-3 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-gray-900 font-semibold">Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-8 items-center">
            <Text className="text-gray-400 text-xs">Secured by</Text>
            <Text className="text-gray-600 font-semibold mt-1">InsForge</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

