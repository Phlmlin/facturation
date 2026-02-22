"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
    id: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    // On pourrait appeler un endpoint /me mais ici on va juste considérer qu'on est loggé
                    // si on a un profil entreprise accessible
                    const res = await api.get('/company');
                    setUser({ id: res.data.user_id, email: res.data.email });
                } catch (err) {
                    console.error('Initial auth check failed', err);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        // On re-check pour charger les infos
        api.get('/company').then(res => {
            setUser({ id: res.data.user_id, email: res.data.email });
            router.push('/');
        }).catch(() => {
            router.push('/settings'); // Si pas de profil entreprise
        });
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
