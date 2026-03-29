import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, BarChart3, BookOpen, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const progress = user?.progress || {
        lastTopic: '',
        lastLearningMode: 'text',
        completedTopics: []
    };

    const hasHistory = progress.lastTopic !== '';
    const mockCompleted = progress.completedTopics.length > 0 ? progress.completedTopics : [
        { title: 'Photosynthesis Basics', score: 85, date: '2 days ago' },
        { title: 'Intro to Quantum Computing', score: 92, date: '1 week ago' },
    ];

    return (
        <div className="bg-slate-50 flex-1 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                            Hello, {user?.name.split(' ')[0]} 👋
                        </h1>
                        <p className="text-slate-500 mt-1">Ready to dive back into learning?</p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(hasHistory ? '/focus' : '/')}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-accent px-6 py-3 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        {hasHistory ? 'Resume Session' : 'Start New Session'}
                    </motion.button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Learning Time</p>
                            <p className="text-2xl font-bold text-slate-800">4.5 hrs</p>
                            <p className="text-xs text-green-600 font-medium mt-1">+1.2 hrs this week</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Completed Topics</p>
                            <p className="text-2xl font-bold text-slate-800">{mockCompleted.length}</p>
                            <p className="text-xs text-slate-400 font-medium mt-1">Across 3 subjects</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Average Score</p>
                            <p className="text-2xl font-bold text-slate-800">88%</p>
                            <p className="text-xs text-green-600 font-medium mt-1">Top 15% of users</p>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout for Resume and History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Active / Resume Context */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-500" /> Current Focus
                        </h2>

                        {hasHistory ? (
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Brain className="w-32 h-32" />
                                </div>
                                <div className="relative z-10 w-full md:w-3/4">
                                    <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                                        In Progress
                                    </span>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                        {progress.lastTopic}
                                    </h3>
                                    <p className="text-slate-500 mb-6 leading-relaxed">
                                        You were last learning using the <span className="font-semibold text-slate-700">{progress.lastLearningMode}</span> mode. Ready to pick up where you left off?
                                    </p>
                                    <button
                                        onClick={() => navigate('/focus')}
                                        className="flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition"
                                    >
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-100/50 rounded-2xl p-8 border border-dashed border-slate-300 text-center flex flex-col items-center justify-center min-h-[200px]">
                                <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium mb-4">No active sessions.</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-4 py-2 bg-white text-slate-700 font-medium rounded-lg text-sm border border-slate-200 shadow-sm hover:bg-slate-50 transition"
                                >
                                    Find a topic
                                </button>
                            </div>
                        )}
                    </div>

                    {/* History Sidebar */}
                    <div className="col-span-1 space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-500" /> History
                        </h2>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="divide-y divide-slate-100">
                                {mockCompleted.map((topic, i) => (
                                    <div key={i} className="p-4 hover:bg-slate-50 transition flex items-start justify-between group cursor-pointer">
                                        <div>
                                            <h4 className="font-semibold text-sm text-slate-800 group-hover:text-primary-600 transition">
                                                {topic.title}
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1">{topic.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${topic.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {topic.score}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full p-3 text-sm text-center font-medium text-slate-500 hover:text-slate-700 transition hover:bg-slate-50 border-t border-slate-100">
                                View All History
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Arrow icon for the inline button
function ArrowRight(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}
