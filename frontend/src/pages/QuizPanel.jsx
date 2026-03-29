import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearning } from '../context/LearningContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ChevronRight, HelpCircle } from 'lucide-react';

export default function QuizPanel() {
    const { session, updateSession } = useLearning();
    const { updateProgress, user } = useAuth();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/ai/quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: session.topic })
                });
                const data = await res.json();
                if (res.ok && Array.isArray(data)) {
                    setQuestions(data);
                } else {
                    throw new Error(data.error || "Invalid response format");
                }
            } catch (err) {
                console.error("Error fetching quiz, using fallback:", err);
                // Fallback mock questions in case API fails or timeout
                setQuestions([
                    {
                        question: `What is the primary function of ${session.topic}?`,
                        options: ['To act as a central processing unit', 'To store long-term data reliably', 'To provide a fundamental structure or basis', 'To increase processing speed via caching'],
                        answer: 'To provide a fundamental structure or basis'
                    },
                    {
                        question: `Which scenario best applies to the principles of ${session.topic}?`,
                        options: ['When absolute precision is required in mathematical modeling', 'During the initial phase of system design planning', 'When deploying scalable microservices', 'Replacing legacy state management'],
                        answer: 'During the initial phase of system design planning'
                    },
                    {
                        question: `A common misconception about ${session.topic} is that it:`,
                        options: ['Requires extensive boilerplate', 'Is only applicable to large enterprises', 'Cannot be tested properly', 'All of the above'],
                        answer: 'All of the above'
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        if (session.topic) {
            fetchQuiz();
        } else {
            navigate('/dashboard');
        }
    }, [session.topic, navigate]);

    const handleSelect = (idx) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({ ...prev, [currentQ]: idx }));
    };

    const handleNext = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(prev => prev + 1);
        } else {
            evaluateQuiz();
        }
    };

    const evaluateQuiz = () => {
        let correctCount = 0;
        questions.forEach((q, idx) => {
            const selectedText = q.options[selectedAnswers[idx]];
            if (selectedText === q.answer) correctCount++;
        });

        const percentage = Math.round((correctCount / questions.length) * 100);
        setScore(percentage);
        setIsSubmitted(true);

        updateSession({ score: percentage });

        if (user) {
            const updatedMockHistory = [...(user.progress?.completedTopics || []), {
                title: session.topic || 'Unknown Topic',
                score: percentage,
                date: new Date().toLocaleDateString()
            }];
            updateProgress({ completedTopics: updatedMockHistory });
        }
    };

    const handleAdaptiveRouting = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/ai/adapt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score })
            });
            const data = await res.json();

            if (data.mode === 'revision') {
                navigate('/revision');
            } else if (data.mode === 'reteach') {
                updateSession({ mode: 'reteach' });
                navigate('/focus');
            } else if (data.mode === 'chunks') {
                updateSession({ mode: 'chunks' });
                navigate('/focus');
            } else {
                updateSession({ mode: 'visual' });
                navigate('/visual');
            }
        } catch (error) {
            // Fallback
            if (score >= 75) navigate('/revision');
            else if (score >= 50) { updateSession({ mode: 'reteach' }); navigate('/focus'); }
            else if (score >= 35) { updateSession({ mode: 'chunks' }); navigate('/focus'); }
            else { updateSession({ mode: 'visual' }); navigate('/visual'); }
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Generating your personalized quiz...</p>
                </div>
            </div>
        );
    }

    const currentQuestionData = questions[currentQ];

    return (
        <div className="flex-1 bg-slate-50 min-h-screen py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">Knowledge Check</h1>
                    <p className="text-slate-500 mt-2">Let's see what you remember about {session.topic}</p>
                </div>

                <motion.div
                    key={isSubmitted ? 'results' : currentQ}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 overflow-hidden relative"
                >
                    {!isSubmitted && (
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
                            <div
                                className="h-full bg-primary-500 transition-all duration-300"
                                style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                            />
                        </div>
                    )}

                    {!isSubmitted ? (
                        <>
                            <div className="mb-8">
                                <span className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-2 block">
                                    Question {currentQ + 1} of {questions.length}
                                </span>
                                <h2 className="text-2xl font-semibold text-slate-800 leading-snug">
                                    {currentQuestionData.question}
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {currentQuestionData.options.map((opt, idx) => {
                                    const isSelected = selectedAnswers[currentQ] === idx;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelect(idx)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                                                ? 'border-primary-500 bg-primary-50 text-slate-900 shadow-sm'
                                                : 'border-slate-100 hover:border-slate-300 text-slate-600 bg-slate-50/50 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium ${isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-slate-300 text-slate-400'
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className="font-medium">{opt}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-10 flex border-t border-slate-100 pt-6 justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={selectedAnswers[currentQ] === undefined}
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 transition-all"
                                >
                                    {currentQ === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="mb-6 relative inline-block">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle className="text-slate-100" strokeWidth="12" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                    <circle
                                        className={`${score >= 75 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}
                                        strokeWidth="12"
                                        strokeDasharray={364}
                                        strokeDashoffset={364 - (score / 100) * 364}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="58" cx="64" cy="64"
                                    />
                                </svg>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <span className="text-3xl font-bold text-slate-800">{score}%</span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                {score >= 75 ? 'Great Job!' : score >= 50 ? 'Almost There' : 'Let\'s try a different approach'}
                            </h2>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                                {score >= 75
                                    ? "You've grasped the core concepts well. Let's do a quick revision."
                                    : score >= 50
                                        ? "You understand some parts, but we'll review the trickier concepts again."
                                        : score >= 35
                                            ? "This topic is dense. We'll break it down into smaller, manageable chunks."
                                            : "We're going to switch to a visual representation to help cement these ideas."
                                }
                            </p>

                            <button
                                onClick={handleAdaptiveRouting}
                                className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all w-full sm:w-auto"
                            >
                                Proceed to Next Step <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
