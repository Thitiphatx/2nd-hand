import React, { createContext, useCallback, useContext, useState } from 'react';
import apiClient from '../libs/axios/axios';
import type { ILoginValues, IUser } from '../pages/auth/interface';

interface IAuthContext {
    userData: IUser | undefined;
    handleLogin: (values: ILoginValues) => Promise<boolean>;
    handleLogout: () => void;
    handleUpdateUserData: (user: IUser) => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userData, setUserData] = useState<IUser | undefined>(() => {
        const localUser = localStorage.getItem("user");
        if (localUser) {
            try {
                return JSON.parse(localUser) as IUser;
            } catch {
                localStorage.removeItem("user");
                return undefined;
            }
        }
        return undefined;
    });

    const handleUpdateUserData = useCallback((user: IUser) => {
        setUserData(user);
        localStorage.setItem('user', JSON.stringify(user));
    }, []);

    const handleLogin = useCallback(async (values: ILoginValues) => {
        try {
            const { data } = await apiClient.post('/auth/login', values);
            setUserData(data);
            localStorage.setItem('user', JSON.stringify(data));
            return true;
        } catch {
            // Handle in interceptor
            return false;
        }
    }, [])

    const handleLogout = useCallback(() => {
        localStorage.removeItem("user");
        setUserData(undefined);
    }, [])

    return (
        <AuthContext.Provider value={{ userData, handleLogin, handleLogout, handleUpdateUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};
