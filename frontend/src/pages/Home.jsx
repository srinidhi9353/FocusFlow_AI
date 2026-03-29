import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { motion } from 'framer-motion';
import { Sparkles, UploadCloud, Search, ArrowRight, BookOpen } from 'lucide-react';

export default function Home() {
    const [searchTopic, setSearchTopic] = useState('');
    const [isHoveringUpload, setIsHoveringUpload] = useState(false);
    const { user } = useAuth();
    const { startSession } = useLearning();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTopic.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/ai/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: searchTopic })
            });
            const data = await response.json();

            if (response.ok) {
                startSession(data.topic, data.content, data.mode);
                if (!user) navigate('/auth');
                else navigate('/focus');
            } else {
                alert(data.error || 'Failed to generate lesson');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to backend');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                startSession(data.topic, data.content, data.mode);
                if (!user) navigate('/auth');
                else navigate('/focus');
            } else {
                alert(data.error || 'Failed to process document');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to backend for parsing');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-200/50 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-200/50 rounded-full blur-[120px] pointer-events-none" />

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-5xl mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center w-full max-w-3xl mx-auto mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <span className="text-sm font-medium text-slate-700">Adaptive AI Tutor</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 shadow-sm">
                        Master any topic with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">
                            Laser Focus
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        FocusFlow dynamically adapts to your learning style. Upload your notes or search a topic, and we'll guide you through it distraction-free.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl"
                >
                    {/* AI Search Card */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between hover:border-primary-200 transition-colors group">
                        <div>
                            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Search className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Learn anything</h2>
                            <p className="text-slate-500 mb-6">Enter a topic and our AI will generate a personalized, step-by-step lesson plan.</p>
                        </div>

                        <form onSubmit={handleSearch} className="relative mt-auto">
                            <input
                                type="text"
                                value={searchTopic}
                                onChange={(e) => setSearchTopic(e.target.value)}
                                placeholder="E.g., Quantum Entanglement"
                                className="w-full pl-5 pr-14 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-slate-700 font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!searchTopic.trim() || isLoading}
                                className="absolute right-2 top-2 bottom-2 aspect-square bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <ArrowRight className="w-5 h-5" />
                                )}
                            </button>
                        </form>
                    </div>

                    {/* File Upload Card */}
                    <div
                        className={`bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border-2 border-dashed transition-all relative overflow-hidden flex flex-col justify-center items-center text-center cursor-pointer ${isHoveringUpload ? 'border-primary-400 bg-primary-50/50' : 'border-slate-200 hover:border-primary-300'}`}
                        onDragOver={(e) => { e.preventDefault(); setIsHoveringUpload(true); }}
                        onDragLeave={() => setIsHoveringUpload(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsHoveringUpload(false);
                            const file = e.dataTransfer.files[0];
                            if (file) handleFileUpload({ target: { files: [file] } });
                        }}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileUpload}
                        />
                        {/* Background Icon */}
                        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-5 pointer-events-none">
                            <BookOpen className="w-64 h-64 text-primary-900" />
                        </div>

                        <div className="h-16 w-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-4 mx-auto z-10 relative">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2 z-10 relative">Upload Materials</h2>
                        <p className="text-slate-500 mb-6 max-w-[250px] z-10 relative">
                            Drag & drop your PDF, Word, or Text notes to start learning.
                        </p>
                        <div className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium shadow-md opacity-90 group-hover:opacity-100 z-10 relative pointer-events-none">
                            Browse Files
                        </div>
                    </div>
                </motion.div>

                {/* Features banner below */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-400"
                >
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Distraction-Free UI</div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Adaptive Quizzes</div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Text & Visual Explanations</div>
                </motion.div>
            </main>
        </div>
    );
}
