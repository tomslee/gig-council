import { Stack } from 'expo-router';
import { UserContextProvider } from '../contexts/UserContext';

export default function RootLayout() {
  return (
    <UserContextProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </UserContextProvider>
  );
}
