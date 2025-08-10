// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    const hasPermission = await this.requestPermissions();
    if (hasPermission) {
      await this.setupAndroidChannel();
      this.isInitialized = true;
    }
    return hasPermission;
  }

  private async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  private async setupAndroidChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  }

  async scheduleReminder(
    title: string = "Reminder!",
    body: string = "Don't forget to check back in!",
    reminderDate: Date = new Date(),
    screenPath?: string,
    params?: Record<string, any>,
  ): Promise<string | null> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }
    try {
      console.log("scheduleReminder: body=", body);
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'reminder',
            scheduledAt: new Date().toISOString(),
            screen: screenPath,
            params: params || {},
          },
        },
        trigger: <Notifications.NotificationTriggerInput>{
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          // seconds: delayMinutes * 60,
          date: reminderDate,
        },
      });
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const notificationService = NotificationService.getInstance();

// Also export individual functions if you prefer that approach
export { Notifications };
