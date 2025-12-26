import { Tabs } from 'expo-router';
import React from 'react';
import { House, BarChart3, Wallet, User } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#f472b6' : '#f472b6',
        tabBarInactiveTintColor: isDark ? '#666' : '#999',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1a1a1a' : '#fff',
          borderTopColor: isDark ? '#333' : '#e5e5e5',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: '统计',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: '贮存场所',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '个人资料',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
