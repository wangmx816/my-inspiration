import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail, CheckCircle, RefreshCw, Key } from 'lucide-react-native';
import { useAuth } from '~/contexts/authContext';
import { insforge } from '~/lib/insforge';
import { toast } from 'sonner-native';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { resendVerificationEmail, checkUser, user, verifyEmail } = useAuth();
  const email = (params.email as string) || user?.email || '';
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'link' | 'code'>('code');
  
  // 如果没有邮箱，返回登录页
  useEffect(() => {
    if (!email) {
      router.replace('/(auth)/login');
    }
  }, [email]);
  
  // 页面加载时自动发送验证邮件（如果还没有发送）
  useEffect(() => {
    if (email && !user?.email) {
      // 用户刚注册，自动发送验证邮件提示
      console.log('User needs to verify email:', email);
    }
  }, [email, user]);

  useEffect(() => {
    // 倒计时
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      toast.error('邮箱地址无效');
      return;
    }

    if (cooldown > 0) {
      toast.error(`请等待 ${cooldown} 秒后再试`);
      return;
    }

    setResending(true);
    try {
      await resendVerificationEmail(email, verificationMethod);
      toast.success(
        verificationMethod === 'code'
          ? '验证码已重新发送到您的邮箱'
          : '验证邮件已重新发送'
      );
      setCooldown(60); // 60秒冷却时间
    } catch (error: any) {
      toast.error(error.message || '发送失败，请稍后重试');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otpCode || otpCode.length < 6) {
      toast.error('请输入6位验证码');
      return;
    }

    setVerifying(true);
    try {
      await verifyEmail(otpCode, email);
      toast.success('邮箱已验证，正在跳转...');
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } catch (error: any) {
      console.error('Verify code error:', error);
      toast.error(error.message || '验证码错误，请重新输入');
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      await checkUser();
      // 等待一下让状态更新
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 重新获取用户状态
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error) {
        throw error;
      }
      
      if (data?.user?.email_confirmed_at) {
        toast.success('邮箱已验证，正在跳转...');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 500);
      } else {
        toast.error('邮箱尚未验证，请检查您的邮箱并点击验证链接');
      }
    } catch (error: any) {
      console.error('Check verification error:', error);
      toast.error('邮箱尚未验证，请检查您的邮箱并点击验证链接');
    } finally {
      setChecking(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="flex-1 justify-center px-6 py-12">
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-4">
              <Mail size={40} color="#3b82f6" />
            </View>
            <Text className="text-gray-900 text-2xl font-bold mb-2">验证您的邮箱</Text>
            <Text className="text-gray-500 text-sm text-center">
              我们已向以下邮箱发送了验证链接：
            </Text>
            <Text className="text-gray-900 font-semibold mt-2">{email}</Text>
          </View>

          {/* 验证方式切换 */}
          <View className="flex-row mb-4 bg-gray-50 rounded-lg p-1">
            <TouchableOpacity
              onPress={() => setVerificationMethod('code')}
              className={`flex-1 py-2 rounded-lg ${
                verificationMethod === 'code' ? 'bg-gray-900' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold text-sm ${
                  verificationMethod === 'code' ? 'text-white' : 'text-gray-600'
                }`}
              >
                输入验证码
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setVerificationMethod('link')}
              className={`flex-1 py-2 rounded-lg ${
                verificationMethod === 'link' ? 'bg-gray-900' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold text-sm ${
                  verificationMethod === 'link' ? 'text-white' : 'text-gray-600'
                }`}
              >
                点击链接
              </Text>
            </TouchableOpacity>
          </View>

          {verificationMethod === 'code' ? (
            <>
              {/* 验证码输入 */}
              <View className="mb-4">
                <Text className="text-gray-700 text-sm mb-2">验证码</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-4">
                  <Key size={20} color="#666" />
                  <TextInput
                    value={otpCode}
                    onChangeText={setOtpCode}
                    placeholder="请输入6位验证码"
                    keyboardType="number-pad"
                    maxLength={6}
                    className="flex-1 ml-3 py-3 text-gray-900 text-lg font-semibold tracking-widest"
                    autoFocus
                  />
                </View>
                <Text className="text-gray-500 text-xs mt-2">
                  验证码已发送到您的邮箱，请输入6位数字验证码
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleVerifyCode}
                disabled={verifying || !otpCode || otpCode.length < 6}
                className={`py-4 rounded-lg mb-4 ${
                  verifying || !otpCode || otpCode.length < 6
                    ? 'bg-gray-300'
                    : 'bg-gray-900'
                }`}
              >
                <Text className="text-white text-center font-semibold text-base">
                  {verifying ? '验证中...' : '验证邮箱'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <View className="flex-row items-start">
                  <CheckCircle size={20} color="#3b82f6" style={{ marginTop: 2, marginRight: 8 }} />
                  <View className="flex-1">
                    <Text className="text-blue-900 text-sm font-semibold mb-1">请检查您的邮箱</Text>
                    <Text className="text-blue-700 text-xs">
                      1. 打开您的邮箱收件箱{'\n'}
                      2. 查找来自 InsForge 的验证邮件{'\n'}
                      3. 点击邮件中的验证链接{'\n'}
                      4. 验证完成后返回应用
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleCheckVerification}
                disabled={checking}
                className="bg-gray-900 py-4 rounded-lg mb-4"
              >
                <Text className="text-white text-center font-semibold text-base">
                  {checking ? '检查中...' : '我已验证邮箱'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View className="flex-row items-center justify-center mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-500 text-sm">或</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <TouchableOpacity
            onPress={handleResend}
            disabled={resending || cooldown > 0}
            className="bg-white border border-gray-300 py-4 rounded-lg flex-row items-center justify-center"
          >
            <RefreshCw
              size={20}
              color={resending || cooldown > 0 ? '#999' : '#666'}
              style={{ marginRight: 8 }}
            />
            <Text
              className={`font-semibold text-base ${
                resending || cooldown > 0 ? 'text-gray-400' : 'text-gray-900'
              }`}
            >
              {resending
                ? '发送中...'
                : cooldown > 0
                ? `重新发送 (${cooldown}s)`
                : '重新发送验证邮件'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6"
          >
            <Text className="text-gray-500 text-center text-sm">
              返回注册页面
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

