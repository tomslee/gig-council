// DataContext.js
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UserData {
    username: string,
    storedUsername: string,
    sessionID: string,
    isOnAssignment: boolean,
}
interface UserContextType {
    userData: UserData;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}
const UserContext = createContext<UserContextType | undefined>(undefined); // Or provide a default value

interface UserContextProviderProps {
    children: ReactNode;
}

export const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
    const [userData, setUserData] = useState({
        username: '',
        storedUsername: '',
        sessionID: "",
        isOnAssignment: false,
    });
    const contextValue: UserContextType = {
    userData,
    setUserData,
  };


    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
