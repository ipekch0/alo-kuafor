import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../api/aiApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const savedToken = localStorage.getItem('token');


            if (savedToken) {
                try {

                    const response = await fetch(`${API_URL}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${savedToken}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.user);
                        setToken(savedToken);
                    } else {
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                } catch (error) {
                    console.error('Kimlik doğrulama kontrolü başarısız:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
            }

            if (!response.ok) {
                // If verification required, return specific object without throwing generic error
                if (data.requireVerification) {
                    return {
                        success: false,
                        requireVerification: true,
                        email: data.email,
                        error: data.error
                    };
                }
                throw new Error(data.error || 'Giriş başarısız');
            }

            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (name, email, password, phone, role = 'customer', salonDetails = null) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, phone, role, salonDetails })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Kayıt başarısız');
            }

            if (data.requireVerification) {
                return { success: true, requireVerification: true, email: data.email };
            }

            // Normal login if no verification needed
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Profil güncelleme başarısız');
            }

            setUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!token,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
