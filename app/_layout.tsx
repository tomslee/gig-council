import { Stack } from 'expo-router';
import { UserContextProvider } from '@/contexts/UserContext';
import { StatisticsProvider } from '@/contexts/StatisticsContext';

export default function RootLayout() {
  return (
    <UserContextProvider>
      <StatisticsProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal_gig_challenge" // Name should match the file name (without .tsx)
            options={{
              presentation: 'modal',
              headerShown: false, // Optional: hide header for a truly full-screen experience
            }}
          />
          <Stack.Screen
            name="modal_text_report" // Name should match the file name (without .tsx)
            options={{
              presentation: 'modal',
              headerShown: false, // Optional: hide header for a truly full-screen experience
            }}
          />
          <Stack.Screen
            name="modal_assignment" // Name should match the file name (without .tsx)
            options={{
              presentation: 'modal',
              headerShown: false, // Optional: hide header for a truly full-screen experience
            }}
          />
        </Stack>
      </StatisticsProvider>
    </UserContextProvider >
  );
}
