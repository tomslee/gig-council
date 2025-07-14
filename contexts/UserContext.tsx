// DataContext.js
import React, { createContext, useState, useContext } from 'react';

export const UserContext = createContext({});

export const UserContextProvider = ({ children }) => {
    const [sharedUserData, setSharedUserData] = useState({ "username": "" });

    return (
        <UserContext.Provider value={{ sharedUserData, setSharedUserData }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);