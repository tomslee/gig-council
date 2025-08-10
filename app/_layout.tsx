import { useEffect, useRef } from 'react';
import { Stack, router } from 'expo-router';
import { UserContextProvider } from '@/contexts/UserContext';
import { StatisticsProvider } from '@/contexts/StatisticsContext';
import { ModalProvider } from '@/contexts/ModalContext';
import * as Notifications from 'expo-notifications';
import { EventSubscription } from 'expo-notifications';

export default function RootLayout() {
  const notificationListener = useRef<EventSubscription>();
  const responseListener = useRef<EventSubscription>();

  useEffect(() => {
    // Listen for notifications received while app is running
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);

      const { screen, params } = response.notification.request.content.data;

      if (screen) {
        // Use Expo Router's router.push() or router.navigate()
        if (params) {
          router.push({
            pathname: screen,
            params: {}
          });
        } else {
          router.push(screen);
        }
      }
    });
    // Check if app was launched by tapping a notification
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        const { screen, params } = response.notification.request.content.data;
        if (screen) {
          // Small delay to ensure router is ready
          setTimeout(() => {
            if (params) {
              router.push({ pathname: screen, params });
            } else {
              router.push(screen);
            }
          }, 1000);
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        // Notifications.removeNotificationSubscription(notificationListener.current);
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        //Notifications.removeNotificationSubscription(responseListener.current);
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <UserContextProvider>
      <StatisticsProvider>
        <ModalProvider>
          <Stack>
            <Stack.Screen name="(tabs)"
              options={{
                headerShown: false
              }}
            />
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
        </ModalProvider>
      </StatisticsProvider>
    </UserContextProvider >
  );
}
