import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function TypingText({ text, speed = 30 }) {
    const [displayedText, setDisplayedText] = useState("");
    const [isMuted, setIsMuted] = useState(false);
    const index = useRef(0);
    const utteranceRef = useRef(null);

    // Typing Effect
    // Typing Effect
    useEffect(() => {
        setDisplayedText("");
        index.current = 0;
        
        if (!text) return; // 🛡️ Early exit if no text

        const intervalId = setInterval(() => {
            if (text && index.current < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index.current));
                index.current += 1;
            } else {
                clearInterval(intervalId);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed]);

    // Voice Sync Effect
    useEffect(() => {
        if (!text || isMuted) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utteranceRef.current = utterance;
        
        window.speechSynthesis.speak(utterance);

        return () => window.speechSynthesis.cancel();
    }, [text, isMuted]);

    const toggleMute = () => {
        setIsMuted(prev => !prev);
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
                {text && index.current < text.length && (
                    <span className="inline-block w-2 h-5 bg-primary-500 animate-pulse ml-1 align-middle"></span>
                )}
            </div>
        </div>
    );
}
