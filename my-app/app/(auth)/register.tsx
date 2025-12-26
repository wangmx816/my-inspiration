import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Github } from 'lucide-react-native';
import { useAuth } from '~/contexts/authContext';
import { toast } from 'sonner-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, signInWithOAuth, resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error('请输入邮箱和密码');
      return;
    }

    if (password.length < 6) {
      toast.error('密码至少需要6个字符');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email, password, name || undefined);
      console.log('Sign up result:', result); // 调试用
      
      if (result.needsVerification) {
        // 需要邮箱验证，跳转到验证页面
        toast.success('注册成功！请检查您的邮箱进行验证');
        router.replace({
          pathname: '/(auth)/verify-email',
          params: { email },
        });
      } else {
        // 不需要验证或已验证，直接进入应用
        toast.success('注册成功');
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Sign up error:', error); // 调试用
      
      // 检查是否是网络错误
      const errorMessage = error.message || error.toString() || '注册失败';
      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('ERR_NAME_NOT_RESOLVED') ||
        errorMessage.includes('network') ||
        errorMessage.includes('NetworkError')
      ) {
        toast.error('网络连接失败，请检查：\n1. 网络连接是否正常\n2. InsForge 服务器是否可访问\n3. 防火墙设置');
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
          <Text className="text-gray-900 text-3xl font-bold mb-2">Get Started</Text>
          <Text className="text-gray-500 text-sm mb-8">Create your account</Text>

          {/* Name Input (Optional) */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm mb-2">Name (Optional)</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-4">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                className="flex-1 py-3 text-gray-900"
              />
            </View>
          </View>

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
            <Text className="text-gray-700 text-sm mb-2">Password</Text>
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

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            className="bg-gray-900 py-4 rounded-lg mb-6"
          >
            <Text className="text-white text-center font-semibold text-base">
              {loading ? '注册中...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mb-6">
            <Text className="text-gray-500 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-pink-400 font-semibold text-sm">Login Now</Text>
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

