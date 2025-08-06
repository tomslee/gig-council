/*
 * User Context holds the UserData structure and makes it available to various screens. 
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_EMAIL, FIREBASE_PASSWORD } from "@env";
import { FIREBASE_AUTH } from "@/lib/firebase";
import * as SecureStore from 'expo-secure-store';
import CrossPlatformStorage from '@/components/CrossPlatformStorage';

export interface UserData {
  username: string,
  defaultUsername: string,
  sessionID: string,
  isOnAssignment: boolean,
};

interface UserContextType {
  userData: UserData | null;
  loadUserData: () => Promise<void>;
  saveUserData: (data: UserData) => Promise<void>;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
  clearUserData: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
}

export const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // SignIn to Firebase and load userData on app start
  useEffect(() => {
    const signIn = async () => {
      console.log("Signing in to Firebase on app start.");
      await signInWithEmailAndPassword(FIREBASE_AUTH, FIREBASE_EMAIL, FIREBASE_PASSWORD)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log("Firebase sign-in succeeded: user UID:", user.uid);
          // You can now use the 'user' object for further operations
        })
        .catch((error) => {
          // Handle errors during sign-in
          console.error("Firebase sign-in failed:", error);
        });
      loadUserData();
    };
    signIn();
  }, []);

  const loadUserData = async () => {
    try {
      console.log("Loading userData on app start.")
      const storedUsername = "";
      /*
      const storedDefaultUsername = await SecureStore.getItemAsync("_defaultUsername");
      const storedSessionID = await SecureStore.getItemAsync("_sessionID");
      const storedIsOnAssignment = (SecureStore.getItem("_isOnAssignment") === "true");
      */
      const storedDefaultUsername = await CrossPlatformStorage.getItem("_defaultUsername");
      const storedSessionID = await CrossPlatformStorage.getItem("_sessionID");
      const storedIsOnAssignment = (await CrossPlatformStorage.getItem("_isOnAssignment") === "true");
      const storedUserData: UserData = {
        username: storedDefaultUsername ? storedDefaultUsername : "",
        defaultUsername: storedDefaultUsername ? storedDefaultUsername : "",
        sessionID: storedSessionID ? storedSessionID : "",
        isOnAssignment: storedIsOnAssignment,
      }
      if (storedUserData) {
        setUserData(storedUserData);
        console.log("UserContext:loadUserData: setting storedUserData", storedUserData);
      };
    } catch (error) {
      console.error('Error loading userData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async (newUserData: UserData) => {
    try {
      /*
      await SecureStore.setItemAsync('_username', newUserData.username);
      await SecureStore.setItemAsync('_defaultUsername', newUserData.defaultUsername);
      await SecureStore.setItemAsync('_sessionID', newUserData.sessionID);
      await SecureStore.setItemAsync('_isOnAssignment', newUserData.isOnAssignment.toString());
      */
      await CrossPlatformStorage.setItem('_username', newUserData.username);
      await CrossPlatformStorage.setItem('_defaultUsername', newUserData.defaultUsername);
      await CrossPlatformStorage.setItem('_sessionID', newUserData.sessionID);
      await CrossPlatformStorage.setItem('_isOnAssignment', newUserData.isOnAssignment.toString());

      setUserData(newUserData);
    } catch (error) {
      console.error('Error saving username:', error);
    }
  };

  const updateUserData = async (updates: Partial<UserData>): Promise<void> => {
    if (!userData) {
      throw new Error('No user data to update');
    }
    const updatedData: UserData = { ...userData, ...updates };
    await saveUserData(updatedData);
    setUserData(updatedData);
  };

  const clearUserData = async () => {
    try {
      await SecureStore.deleteItemAsync('_username');
      await SecureStore.deleteItemAsync('_defaultUsername');
      await SecureStore.deleteItemAsync('_sessionID');
      await SecureStore.deleteItemAsync('_isOnAssignment');
      setUserData(null);
    } catch (error) {
      console.error('Error clearing userData:', error);
    }
  };

  const value: UserContextType = {
    userData,
    loadUserData,
    saveUserData,
    updateUserData,
    clearUserData,
    isLoading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};