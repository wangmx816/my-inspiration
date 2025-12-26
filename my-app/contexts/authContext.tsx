import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { insforge } from '~/lib/insforge';

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<{ needsVerification: boolean }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  resendVerificationEmail: (email: string, type?: 'link' | 'code') => Promise<void>;
  verifyEmail: (token: string, email?: string) => Promise<void>;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查当前用户会话
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error) {
        console.error('Auth error:', error);
        setUser(null);
      } else if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name,
          avatarUrl: data.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to check user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Auth error:', error); // 调试用
        // 检查是否是邮箱未验证的错误
        const errorMessage = error.message || error.toString() || '';
        if (
          errorMessage.includes('verification') ||
          errorMessage.includes('Email verification') ||
          errorMessage.includes('email') && errorMessage.includes('confirm')
        ) {
          throw new Error('Email verification required');
        }
        throw error;
      }

      // 检查邮箱是否已验证
      if (data?.user && !data.user.email_confirmed_at) {
        throw new Error('Email verification required');
      }

      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name,
          avatarUrl: data.user.user_metadata?.avatar_url,
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        options: {
          data: name ? { name } : undefined,
          emailRedirectTo: `${process.env.EXPO_PUBLIC_INSFORGE_BASE_URL}/auth/verify-email`,
        },
      });

      if (error) throw error;

      // 检查是否需要邮箱验证
      // 如果用户存在但没有 session，或者邮箱未确认，需要验证
      const needsVerification = 
        (!data?.session && data?.user) || 
        (data?.user && !data.user.email_confirmed_at);

      if (data?.user && data?.session && data.user.email_confirmed_at) {
        // 如果已有 session 且邮箱已验证，直接设置用户
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || name,
          avatarUrl: data.user.user_metadata?.avatar_url,
        });
      }

      return { needsVerification };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string, type: 'link' | 'code' = 'link') => {
    try {
      if (type === 'code') {
        // 发送 OTP 验证码
        const { error } = await insforge.auth.resend({
          type: 'signup',
          email,
          options: {
            shouldCreateUser: false,
          },
        });
        if (error) throw error;
      } else {
        // 发送验证链接
        const { error } = await insforge.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${process.env.EXPO_PUBLIC_INSFORGE_BASE_URL}/auth/verify-email`,
          },
        });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Resend verification email error:', error);
      throw error;
    }
  };

  const verifyEmail = async (tokenOrCode: string, email?: string) => {
    try {
      // InsForge SDK 使用 verifyEmail 方法
      // 根据文档：
      // - 代码验证：需要 email 和 otp (6位数字)
      // - 链接验证：只需要 otp (64字符token)
      
      const userEmail = email || user?.email;
      
      // 判断是验证码还是链接token
      // 验证码通常是6位数字，链接token通常是64字符的十六进制
      const isCode = /^\d{6}$/.test(tokenOrCode);
      const isToken = /^[a-f0-9]{64}$/i.test(tokenOrCode);
      
      let request: any;
      
      if (isCode) {
        // 6位数字验证码
        if (!userEmail) {
          throw new Error('验证码验证需要邮箱地址');
        }
        request = {
          email: userEmail,
          otp: tokenOrCode,
        };
      } else if (isToken) {
        // 64字符token（链接验证）
        request = {
          otp: tokenOrCode,
        };
      } else {
        // 尝试作为验证码
        if (userEmail) {
          request = {
            email: userEmail,
            otp: tokenOrCode,
          };
        } else {
          request = {
            otp: tokenOrCode,
          };
        }
      }
      
      const { data, error } = await insforge.auth.verifyEmail(request);

      if (error) throw error;

      if (data?.user || data?.session) {
        await checkUser(); // 重新检查用户状态
      }
    } catch (error: any) {
      console.error('Verify email error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await insforge.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.EXPO_PUBLIC_INSFORGE_BASE_URL}/auth/callback`,
        },
      });

      if (error) throw error;
      // OAuth 会重定向，这里不需要设置用户
    } catch (error) {
      console.error('OAuth sign in error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
        resendVerificationEmail,
        verifyEmail,
        checkUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

