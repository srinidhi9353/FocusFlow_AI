import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, User, Brain } from 'lucide-react';
import { useLearning } from '../context/LearningContext';

export default function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', text: 'Hello! I am your FocusFlow assistant. How can I help you today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const { session } = useLearning();
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [chatHistory, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = { role: 'user', text: message };
        setChatHistory(prev => [...prev, userMsg]);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsg.text,
                    context: session?.topic || ''
                })
            });
            const data = await response.json();
            setChatHistory(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "Sorry, I'm offline right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-500 rounded-xl">
                                    <Brain size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">FocusFlow AI</h3>
                                    <p className="text-[10px] text-slate-400">Always active assistant</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-800 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Window */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-primary-600 text-white rounded-tr-none' 
                                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Footer */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={session?.topic ? `Ask about ${session.topic}...` : "Ask anything..."}
                                    className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isLoading}
                                    className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-slate-900 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-center gap-2">
                    {!isOpen && <span className="font-bold text-sm pl-2">Ask AI anything</span>}
                    {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                </div>
            </motion.button>
        </div>
    );
}
