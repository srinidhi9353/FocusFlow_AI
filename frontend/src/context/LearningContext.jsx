import { createContext, useContext, useState, useEffect } from 'react';

const LearningContext = createContext();

export function LearningProvider({ children }) {
    // Current session state with initial hydration from localStorage
    const [session, setSession] = useState(() => {
        const saved = localStorage.getItem('focusflow_session');
        return saved ? JSON.parse(saved) : {
            topic: '',
            content: '',
            mode: 'text',
            score: null,
            history: []
        };
    });

    // Automatically sync with localStorage whenever session changes
    useEffect(() => {
        localStorage.setItem('focusflow_session', JSON.stringify(session));
    }, [session]);

    const startSession = (topic, content = '', mode = 'text') => {
        setSession({
            topic,
            content,
            mode,
            score: null,
            history: []
        });
    };

    const updateSession = (updates) => {
        setSession(prev => ({ ...prev, ...updates }));
    };

    const endSession = () => {
        const reset = {
            topic: '',
            content: '',
            mode: 'text',
            score: null,
            history: []
        };
        setSession(reset);
        localStorage.removeItem('focusflow_session');
    };

    return (
        <LearningContext.Provider value={{ session, startSession, updateSession, endSession }}>
            {children}
        </LearningContext.Provider>
    );
}

export function useLearning() {
    return useContext(LearningContext);
}
