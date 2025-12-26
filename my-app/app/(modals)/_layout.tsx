import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="add-transaction"
        options={{
          title: '添加记录',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add-account"
        options={{
          title: '添加贮存场所',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="recognize-input"
        options={{
          title: '智能识别',
          headerShown: false,
        }}
      />
    </Stack>
  );
}


