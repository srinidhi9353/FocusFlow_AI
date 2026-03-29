import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearning } from '../context/LearningContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, Play, Pause, RotateCcw, MonitorPlay, ArrowRight, Video, X, CheckCircle, HelpCircle, ChevronLeft } from 'lucide-react';
import TypingText from '../components/TypingText';

export default function FocusMode() {
    const { session, updateSession } = useLearning();
    const { updateProgress } = useAuth();
    const navigate = useNavigate();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [timerTime, setTimerTime] = useState(0); 
    const [isPlayingTimer, setIsPlayingTimer] = useState(true);
    
    const timerRef = useRef(null);

    const [fullContent, setFullContent] = useState(session?.content || "");
    
    // Quiz States
    const [quiz, setQuiz] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

    // YouTube States
    const [showVideo, setShowVideo] = useState(false);
    const [videoId, setVideoId] = useState("");
    const [isLoadingVideo, setIsLoadingVideo] = useState(false);

    useEffect(() => {
        if (session?.content) setFullContent(session.content);
    }, [session?.content]);


    useEffect(() => {
        if (!session?.topic) {
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

    const fetchQuiz = async () => {
        if (!session?.topic || quiz) return;
        setIsLoadingQuiz(true);
        try {
            const res = await fetch('http://localhost:5000/api/ai/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: session.topic })
            });
            const data = await res.json();
            setQuiz(data);
        } catch (err) {
            console.error("Quiz fetch failed", err);
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    const handleQuizSubmit = async () => {
        let correctCount = 0;
        quiz.questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.answer) correctCount++;
        });

        const calculatedScore = Math.round((correctCount / quiz.questions.length) * 100);
        setScore(calculatedScore);
        
        // Adaptive Routing Engine
        setTimeout(async () => {
            if (calculatedScore >= 80) {
                navigate('/revision');
            } else if (calculatedScore >= 50) {
                // RETEACH MODE: Fetch a new explanation with different style
                alert("Good effort! Let's try looking at this from a different perspective to clear things up.");
                setShowQuiz(false);
                setScore(null);
                setSelectedAnswers({});
                
                try {
                    const res = await fetch('http://localhost:5000/api/ai/explain', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ topic: session.topic, style: 'reteach' })
                    });
                    const data = await res.json();
                    if (data.content) setFullContent(data.content);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } catch (e) {
                    console.error("Reteach failed", e);
                }
            } else if (calculatedScore >= 35) {
                alert("This topic is tricky. Let's break it down into smaller points.");
                updateSession({ mode: 'revision' });
                navigate('/revision');
            } else {
                alert("Let's try a visual approach to make this clearer.");
                updateSession({ mode: 'visual' });
                navigate('/visual');
            }
        }, 1500);
    };

    const fetchYouTubeVideo = async () => {
        setIsLoadingVideo(true);
        try {
            const res = await fetch(`http://localhost:5000/api/youtube/search?topic=${encodeURIComponent(session.topic)}`);
            const data = await res.json();
            if (data.videoId) {
                setVideoId(data.videoId);
                setShowVideo(true);
            }
        } catch (err) {
            console.error("Video fetch failed", err);
        } finally {
            setIsLoadingVideo(false);
        }
    };

    return (
        <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col min-h-screen relative p-4 md:p-8">

            {/* Top Bar - Minimalist */}
            <div className="flex justify-between items-center mb-12 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                        title="Back to Dashboard"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1 block">
                            Focus Mode
                        </span>
                        <h1 className="text-2xl font-light text-slate-200">
                            {session?.topic || 'Loading Topic...'}
                        </h1>
                    </div>
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
                className="flex-1 max-w-4xl w-full mx-auto pb-20"
            >
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <TypingText text={fullContent} />

                    <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-4">
                            <button
                                onClick={fetchYouTubeVideo}
                                disabled={isLoadingVideo}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50"
                            >
                                <Video className="w-5 h-5" />
                                {isLoadingVideo ? "Finding Video..." : "Watch Video Explanation"}
                            </button>
                        </div>

                        {!showQuiz && (
                            <button
                                onClick={() => { setShowQuiz(true); fetchQuiz(); }}
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors"
                            >
                                <HelpCircle className="w-5 h-5" />
                                Knowledge Check
                            </button>
                        )}
                    </div>

                    {/* Integrated Quiz Section */}
                    {showQuiz && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-12 space-y-8 pt-12 border-t border-slate-800"
                        >
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <HelpCircle className="w-6 h-6 text-emerald-400" />
                                Practice Quiz
                            </h2>

                            {isLoadingQuiz ? (
                                <div className="py-10 text-center animate-pulse text-slate-500">Generating quiz...</div>
                            ) : (
                                <>
                                    <div className="space-y-6">
                                        {quiz?.questions?.map((q, qIdx) => (
                                            <div key={qIdx} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                                <p className="font-medium text-slate-200 mb-4">{qIdx + 1}. {q.question}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt, oIdx) => (
                                                        <button
                                                            key={oIdx}
                                                            onClick={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: opt }))}
                                                            className={`text-left p-3 rounded-xl border transition-all ${
                                                                selectedAnswers[qIdx] === opt 
                                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                                            }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-center pt-6">
                                        {score !== null ? (
                                            <div className="text-center p-6 bg-slate-800 rounded-3xl border-2 border-emerald-500 w-full animate-bounce">
                                                <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-1">Your Score</p>
                                                <p className="text-4xl font-extrabold text-emerald-400">{score}%</p>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={handleQuizSubmit}
                                                disabled={Object.keys(selectedAnswers).length < (quiz?.questions?.length || 0)}
                                                className="px-10 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-lg hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-slate-100/5"
                                            >
                                                Submit Answers
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* YouTube Overlay Modal */}
            {showVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-5xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
                    >
                        <div className="p-4 flex justify-between items-center border-b border-slate-800">
                            <h3 className="font-bold flex items-center gap-2">
                                <Video className="w-5 h-5 text-indigo-400" /> Lesson Support Video
                            </h3>
                            <button onClick={() => setShowVideo(false)} className="p-2 hover:bg-slate-800 rounded-full transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="aspect-video bg-black">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
                                title="Educational Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="p-6 text-center text-slate-400 text-sm">
                            Watching this video helps clarify the concepts visually while maintaining your focus.
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
