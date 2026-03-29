import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearning } from '../context/LearningContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, Play, Pause, RotateCcw, MonitorPlay, ArrowRight } from 'lucide-react';
import TypingText from '../components/TypingText';

export default function FocusMode() {
    const { session, updateSession } = useLearning();
    const { updateProgress } = useAuth();
    const navigate = useNavigate();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [timerTime, setTimerTime] = useState(0); // in seconds
    const [isPlayingTimer, setIsPlayingTimer] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const timerRef = useRef(null);

    // Mock content generation if empty
    const [mockContent] = useState(
        session.content ||
        `This is a dynamically generated explanation for the topic: "${session.topic}".\n\nIn this lesson, we will cover the core principles and fundamental concepts. Ensure you read through carefully before proceeding to the quiz section.`
    );

    useEffect(() => {
        if (!session.topic) {
            navigate('/dashboard'); // Kick out if no active session
            return;
        }

        // Save last topic to Auth
        updateProgress({
            lastTopic: session.topic,
            lastLearningMode: 'text'
        });
    }, [session.topic, navigate, updateProgress]);

    // Timer logic
    useEffect(() => {
        if (isPlayingTimer) {
            timerRef.current = setInterval(() => {
                setTimerTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isPlayingTimer]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error("Error attempting to enable fullscreen:", err);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const finishTopic = () => {
        navigate('/quiz');
    };

    return (
        <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col min-h-screen relative p-4 md:p-8">

            {/* Top Bar - Minimalist */}
            <div className="flex justify-between items-center mb-12 max-w-4xl mx-auto w-full">
                <div>
                    <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1 block">
                        Focus Mode
                    </span>
                    <h1 className="text-2xl font-light text-slate-200">
                        {session.topic || 'Untitled Topic'}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-900 rounded-full px-4 py-2 border border-slate-800">
                        <span className="font-mono text-slate-300 mr-3">{formatTime(timerTime)}</span>
                        <button onClick={() => setIsPlayingTimer(!isPlayingTimer)} className="text-slate-400 hover:text-white transition">
                            {isPlayingTimer ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setTimerTime(0)} className="text-slate-400 hover:text-white transition ml-3">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                    <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white transition bg-slate-900 p-2.5 rounded-full border border-slate-800">
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 max-w-4xl w-full mx-auto"
            >
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">

                    <TypingText text={mockContent} />

                    <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-4">
                            <button
                                onClick={() => { updateSession({ mode: 'visual' }); navigate('/visual'); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border-slate-700 border text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors"
                            >
                                <MonitorPlay className="w-5 h-5" />
                                Switch to Visual
                            </button>
                        </div>

                        <button
                            onClick={finishTopic}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-white transition-colors"
                        >
                            Take Quiz
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
