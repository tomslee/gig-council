/*
 * User Context holds the UserData structure and makes it available to various screens. 
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "@/lib/firebase";
import * as SecureStore from 'expo-secure-store';
import CrossPlatformStorage from '@/components/CrossPlatformStorage';

export interface UserName {
  username: string,
  previousUsername: string,
};

export interface UserData {
  sessionID: string,
  assignmentID: string,
};

interface UserContextType {
  userName: UserName | null;
  userData: UserData | null;
  loadUserName: () => Promise<void>;
  loadUserData: () => Promise<void>;
  saveUserName: (userName: UserName) => Promise<void>;
  saveUserData: (userData: UserData) => Promise<void>;
  updateUserName: (updates: Partial<UserName>) => Promise<void>;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
  clearUserName: () => Promise<void>;
  clearUserData: () => Promise<void>;
  isLoadingUser: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
}

export const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
  const [userName, setUserName] = useState<UserName | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const loadUserName = async () => {
    /*
     * On first App Start, there should no username or previousUsername.
     * On later App Start:
     * - if the user logged out and then closed the app, there should be a 
     *   previousUsername, but not a username.
     * - if the user closed the app without logging out, there may be a 
     *   previousUsername and a username.
     */
    try {
      const storedPreviousUsername = await CrossPlatformStorage.getItem("_previousUsername");
      const storedUsername = await CrossPlatformStorage.getItem("_username");
      // we are logged in. set the userName for use elsewhere.
      const userName: UserName = {
        username: storedUsername ? storedUsername : '',
        previousUsername: storedPreviousUsername ? storedPreviousUsername : "",
      }
      setUserName(userName);
    } catch (error) {
      console.error('Error loading userName:', error);
    } finally {
      setIsLoadingUser(false);
    };
  };

  const loadUserData = async () => {
    try {
      const storedSessionID = await CrossPlatformStorage.getItem("_sessionID");
      const storedAssignmentID = await CrossPlatformStorage.getItem("_assignmentID");
      const userData: UserData = {
        sessionID: storedSessionID ? storedSessionID : "",
        assignmentID: storedAssignmentID ? storedAssignmentID : "",
      }
      setUserData(userData);
    } catch (error) {
      console.error('Error loading userData:', error);
    }
  };

  const saveUserName = async (newUserName: UserName) => {
    try {
      await CrossPlatformStorage.setItem('_username', newUserName.username);
      await CrossPlatformStorage.setItem('_previousUsername', newUserName.previousUsername);
      setUserName(newUserName);
    } catch (error) {
      console.error('Error saving userName:', error);
    }
  };


  const saveUserData = async (newUserData: UserData) => {
    try {
      await CrossPlatformStorage.setItem('_sessionID', newUserData.sessionID);
      await CrossPlatformStorage.setItem('_assignmentID', newUserData.assignmentID);
      setUserData(newUserData);
    } catch (error) {
      console.error('Error saving userData:', error);
    }
  };

  const updateUserName = async (updates: Partial<UserName>): Promise<void> => {
    if (!userName) {
      throw new Error('No user name to update');
    }
    const updatedName: UserName = { ...userName, ...updates };
    await saveUserName(updatedName);
    setUserName(updatedName);
  };

  const updateUserData = async (updates: Partial<UserData>): Promise<void> => {
    if (!userData) {
      throw new Error('No user data to update');
    }
    const updatedData: UserData = { ...userData, ...updates };
    await saveUserData(updatedData);
    setUserData(updatedData);
  };

  const clearUserName = async () => {
    try {
      await SecureStore.deleteItemAsync('_username');
      await SecureStore.deleteItemAsync('_previousUsername');
      setUserName(null);
    } catch (error) {
      console.error('Error clearing userName:', error);
    }
  };

  const clearUserData = async () => {
    try {
      await SecureStore.deleteItemAsync('_sessionID');
      await SecureStore.deleteItemAsync('_assignmentID');
      setUserData(null);
    } catch (error) {
      console.error('Error clearing userData:', error);
    }
  };

  const value: UserContextType = {
    userName,
    loadUserName,
    userData,
    loadUserData,
    saveUserName,
    saveUserData,
    updateUserName,
    updateUserData,
    clearUserName,
    clearUserData,
    isLoadingUser,
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