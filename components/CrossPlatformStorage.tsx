import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Cross-platform secure storage utility
class CrossPlatformStorage {
    /**
     * Store a value securely
     * @param key - The key to store the value under
     * @param value - The value to store (will be converted to string)
     */
    static async setItem(key: string, value: string): Promise<void> {
        try {
            if (Platform.OS === 'web') {
                // On web, use localStorage (less secure but functional)
                localStorage.setItem(key, value);
                return;
            } else {
                // On mobile, use SecureStore
                await SecureStore.setItemAsync(key, value);
            }
        } catch (error) {
            console.error('Error storing data:', error);
            throw error;
        }
    }

    /**
     * Retrieve a stored value
     * @param key - The key to retrieve the value for
     * @returns The stored value or null if not found
     */
    static async getItem(key: string): Promise<string | null> {
        try {
            if (Platform.OS === 'web') {
                // On web, use localStorage
                return localStorage.getItem(key);
            } else {
                // On mobile, use SecureStore
                return await SecureStore.getItemAsync(key);
            }
        } catch (error) {
            console.error('Error retrieving data:', error);
            return null;
        }
    }

    /**
     * Remove a stored value
     * @param key - The key to remove
     */
    static async removeItem(key: string): Promise<void> {
        try {
            if (Platform.OS === 'web') {
                localStorage.removeItem(key);
                return;
            } else {
                await SecureStore.deleteItemAsync(key);
            }
        } catch (error) {
            console.error('Error removing data:', error);
            throw error;
        }
    }

    /**
     * Get all stored keys (web only)
     * @returns Array of keys (empty array on mobile as SecureStore doesn't support this)
     */
    static async getAllKeys(): Promise<string[]> {
        try {
            if (Platform.OS === 'web') {
                return Object.keys(localStorage);
            } else {
                // SecureStore doesn't have a getAllKeys method
                // You'll need to track keys manually or use AsyncStorage for key management
                console.warn('getAllKeys not supported with SecureStore on mobile');
                return [];
            }
        } catch (error) {
            console.error('Error getting all keys:', error);
            return [];
        }
    }

    /**
     * Store an object as JSON
     * @param key - The key to store the object under
     * @param obj - The object to store
     */
    static async setObject<T>(key: string, obj: T): Promise<void> {
        try {
            const jsonString = JSON.stringify(obj);
            await this.setItem(key, jsonString);
        } catch (error) {
            console.error('Error storing object:', error);
            throw error;
        }
    }

    /**
     * Retrieve and parse a stored object
     * @param key - The key to retrieve the object for
     * @returns The parsed object or null if not found or invalid JSON
     */
    static async getObject<T>(key: string): Promise<T | null> {
        try {
            const jsonString = await this.getItem(key);
            if (!jsonString) {
                return null;
            }
            return JSON.parse(jsonString) as T;
        } catch (error) {
            console.error('Error retrieving object:', error);
            return null;
        }
    }
}

// Type definitions for common use cases
export interface UserData {
    id: string;
    username: string;
    email: string;
    token?: string;
    // Add other user properties as needed
}

export interface AppSettings {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
    // Add other settings as needed
}

// Usage examples with TypeScript types:

/*
// Storing and retrieving strings:
await CrossPlatformStorage.setItem('authToken', 'your-jwt-token');
const token = await CrossPlatformStorage.getItem('authToken');

// Storing and retrieving objects with type safety:
const userData: UserData = {
  id: '123',
  username: 'john_doe',
  email: 'john@example.com',
  token: 'jwt-token'
};

await CrossPlatformStorage.setObject('userData', userData);
const retrievedUser = await CrossPlatformStorage.getObject<UserData>('userData');

// Storing app settings:
const settings: AppSettings = {
  theme: 'dark',
  notifications: true,
  language: 'en'
};

await CrossPlatformStorage.setObject('appSettings', settings);
const retrievedSettings = await CrossPlatformStorage.getObject<AppSettings>('appSettings');

// Removing data:
await CrossPlatformStorage.removeItem('userData');
*/

export default CrossPlatformStorage;