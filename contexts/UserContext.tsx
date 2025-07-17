/*
 * User Context holds the 
 */
export interface UserData {
  username: string,
  defaultUsername: string,
  sessionID: string,
  isOnAssignment: boolean,
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

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

  // Load userData on app start
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUsername = "";
      const storedDefaultUsername = await SecureStore.getItemAsync("_defaultUsername");
      const storedSessionID = await SecureStore.getItemAsync("_sessionID");
      const storedIsOnAssignment = (SecureStore.getItem("_isOnAssignment") === "true");
      const storedUserData: UserData = {
        username: storedUsername ? storedUsername : "",
        defaultUsername: storedDefaultUsername ? storedDefaultUsername : "",
        sessionID: storedSessionID ? storedSessionID : "",
        isOnAssignment: storedIsOnAssignment,
      }
      if (storedUserData) {
        setUserData(storedUserData);
        console.log("Setting storedUserData in loadUserData", storedUserData);
      };
    } catch (error) {
      console.error('Error loading userData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async (newUserData: UserData) => {
    try {
      await SecureStore.setItemAsync('_username', newUserData.username);
      await SecureStore.setItemAsync('_defaultUsername', newUserData.defaultUsername);
      await SecureStore.setItemAsync('_sessionID', newUserData.sessionID);
      await SecureStore.setItemAsync('_isOnAssignment', newUserData.isOnAssignment.toString());
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