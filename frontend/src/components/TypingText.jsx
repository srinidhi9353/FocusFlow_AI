import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function TypingText({ text, speed = 15 }) {
    const [displayedText, setDisplayedText] = useState("");
    const [isMuted, setIsMuted] = useState(false);
    const index = useRef(0);
    const utteranceRef = useRef(null);
    const hasStarted = useRef(false);

    useEffect(() => {
        setDisplayedText("");
        index.current = 0;
        hasStarted.current = false;
        
        // Initial Speech Start
        if (!isMuted) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.05; // slightly faster to match decent reading speed
            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
            hasStarted.current = true;
        }

        const intervalId = setInterval(() => {
            if (index.current < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index.current));
                index.current += 1;
            } else {
                clearInterval(intervalId);
            }
        }, speed);

        return () => {
            clearInterval(intervalId);
            window.speechSynthesis.cancel();
        };
    }, [text]); // re-run if text changes

    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        if (nextMuted) {
            window.speechSynthesis.cancel();
        } else {
            // Unmuting: speak from the remaining text
            const remaining = text.substring(index.current);
            if (remaining.length > 0) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(remaining);
                utterance.rate = 1.05;
                utteranceRef.current = utterance;
                window.speechSynthesis.speak(utterance);
            }
        }
    };

    return (
        <div className="relative pt-4">
            <div className="flex justify-end mb-4 absolute -top-8 right-0">
                <button 
                    onClick={toggleMute}
                    className="flex items-center gap-2 text-sm px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition border border-slate-700 hover:border-slate-600"
                >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    {isMuted ? "Unmute Voice" : "Mute Voice"}
                </button>
            </div>
            <div className="prose prose-invert max-w-none prose-lg min-h-[150px]">
                {displayedText.split('\n\n').map((para, idx) => (
                    <p key={idx} className="text-slate-300 leading-relaxed font-light">{para}</p>
                ))}
                {index.current < text.length && (
                    <span className="inline-block w-2 h-5 bg-primary-500 animate-pulse ml-1 align-middle"></span>
                )}
            </div>
        </div>
    );
}
