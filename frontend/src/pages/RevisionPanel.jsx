import { useState, useEffect } from 'react';
import { useLearning } from '../context/LearningContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckCircle2, ArrowRight, PlayCircle, RefreshCcw, ChevronLeft } from 'lucide-react';

export default function RevisionPanel() {
    const { session, updateSession } = useLearning();
    const navigate = useNavigate();

    const [revisionNotes, setRevisionNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!session.topic) {
                navigate('/dashboard');
                return;
            }
            try {
                const res = await fetch('http://localhost:5000/api/ai/summary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: session.topic })
                });
                const data = await res.json();
                if (res.ok && data.summary) {
                    setRevisionNotes(data.summary);
                } else {
                    setRevisionNotes(["Error generating summary. Please try again."]);
                }
            } catch (err) {
                console.error(err);
                setRevisionNotes(["Failed to connect to backend."]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSummary();
    }, [session.topic, navigate]);

    const handleRetake = () => {
        updateSession({ mode: 'quiz', score: null });
        navigate('/quiz');
    };

    const handleFinish = () => {
        navigate('/dashboard');
    };

    return (
        <div className="flex-1 bg-slate-50 min-h-screen py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                            title="Back to Dashboard"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Revision Summary</h1>
                            <p className="text-slate-500 mt-1">Key takeaways for {session?.topic || 'your recent lesson'}</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center space-y-4 py-12">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-medium">Generating structured summary...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-800">Quick Notes:</h2>
                            <ul className="space-y-4">
                                {revisionNotes.map((note, i) => (
                                    <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                                            {i + 1}
                                        </span>
                                        <p className="text-slate-700 pt-1 leading-relaxed">{note}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-end">
                        <button
                            onClick={handleRetake}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 transition"
                        >
                            <RefreshCcw className="w-5 h-5" /> Retake Quiz
                        </button>
                        <button
                            onClick={handleFinish}
                            className="px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2 transition shadow-md"
                        >
                            <LayoutDashboard className="w-5 h-5" /> Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
