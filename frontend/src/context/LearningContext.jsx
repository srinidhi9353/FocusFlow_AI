import { createContext, useContext, useState } from 'react';

const LearningContext = createContext();

export function LearningProvider({ children }) {
    // Current session state
    const [session, setSession] = useState({
        topic: '',
        content: '',
        mode: 'text', // 'text', 'visual', 'quiz', 'revision'
        score: null,
        history: []
    });

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
        setSession({
            topic: '',
            content: '',
            mode: 'text',
            score: null,
            history: []
        });
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
