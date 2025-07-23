import { Stack } from 'expo-router';
import { UserContextProvider } from '../contexts/UserContext';

export default function RootLayout() {
  return (
    <UserContextProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal_gig_challenge" // Name should match the file name (without .tsx)
          options={{
            presentation: 'modal',
            headerShown: false, // Optional: hide header for a truly full-screen experience
          }}
        />
      </Stack>
    </UserContextProvider>
  );
}
