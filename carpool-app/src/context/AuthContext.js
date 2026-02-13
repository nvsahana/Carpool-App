import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../Routes/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth status on mount and validate token
    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        try {
            // Validate token by fetching current user
            const userData = await getCurrentUser();
            if (userData) {
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                // Token invalid - clear it
                localStorage.removeItem('access_token');
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            // Token expired or invalid - clear it
            localStorage.removeItem('access_token');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Login function - store token and update state
    const login = useCallback((token, userData = null) => {
        localStorage.setItem('access_token', token);
        setIsAuthenticated(true);
        if (userData) {
            setUser(userData);
        } else {
            // Fetch user data if not provided
            checkAuth();
        }
    }, [checkAuth]);

    // Logout function - clear token and state
    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    // Refresh user data (call after profile updates)
    const refreshUser = useCallback(async () => {
        try {
            const userData = await getCurrentUser();
            if (userData) {
                setUser(userData);
            }
        } catch (err) {
            console.error('Failed to refresh user:', err);
        }
    }, []);

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
