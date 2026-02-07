import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types/auth';
import apiClient from '@/lib/apiClient';

interface AuthContextType {
    user: User | null;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserInfo = async () => {
        // OPTIMIZATION: Check if we are even logged in before calling API
        const isAuth = localStorage.getItem('isAuthenticated');
        if (!isAuth) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiClient.get('/users/me');
            const userData = response.data;
            setUser({
                ...userData,
                displayName: `${userData.firstName} ${userData.lastName}`.trim() || userData.email
            });
            // Ensure flag is set if it was missing but call succeeded
            localStorage.setItem('isAuthenticated', 'true');
        } catch (error: any) {
            // If 401, it just means not logged in.
            if (error.response?.status !== 401) {
                console.error('Failed to fetch user info', error);
            }
            setUser(null);
            localStorage.removeItem('isAuthenticated'); // Clear invalid flag
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchUserInfo();
    }, []);

    const logout = async () => {
        try {
            await apiClient.post('/authentication/logout');
        } catch (error) {
            console.error('Logout API call failed', error);
        } finally {
            localStorage.removeItem('isAuthenticated');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, logout, refreshUser: fetchUserInfo, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
