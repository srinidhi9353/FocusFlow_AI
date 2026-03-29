import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('focusflow_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Invalid user data in localStorage', e);
            }
        }
        setLoading(false);
    }, []);

    const login = (name, email) => {
        // Mock login logic
        const userData = {
            id: Date.now().toString(),
            name,
            email,
            progress: {
                lastTopic: '',
                lastLearningMode: 'text',
                completedTopics: []
            }
        };
        setUser(userData);
        localStorage.setItem('focusflow_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('focusflow_user');
    };

    const updateProgress = (updates) => {
        setUser(prev => {
            if (!prev) return null;
            const updatedUser = {
                ...prev,
                progress: {
                    ...prev.progress,
                    ...updates
                }
            };
            localStorage.setItem('focusflow_user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateProgress }}>
            {!loading && children}
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
