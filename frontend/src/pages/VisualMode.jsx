import { useState, useEffect } from 'react';
import { useLearning } from '../context/LearningContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, ArrowLeft, Headphones, FileText, CheckCircle2 } from 'lucide-react';
import TypingText from '../components/TypingText';

export default function VisualMode() {
    const { session, updateSession } = useLearning();
    const navigate = useNavigate();

    const [videoId, setVideoId] = useState("");
    const [visualContent, setVisualContent] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!session.topic) {
            navigate('/dashboard');
            return;
        }

        const fetchVideoAndVisuals = async () => {
            try {
                // Fetch YouTube Video
                const url = `http://localhost:5000/api/youtube/search?topic=${encodeURIComponent(session.topic)}`;
                const vidRes = await fetch(url);
                const vidData = await vidRes.json();
                
                if (vidRes.ok && vidData.videoId) {
                    setVideoId(vidData.videoId);
                } else {
                    setVideoId("dQw4w9WgXcQ");
                }

                // Fetch AI Visual Text
                const aiRes = await fetch('http://localhost:5000/api/ai/visual', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: session.topic })
                });
                const aiData = await aiRes.json();
                
                if (aiRes.ok && aiData.content) {
                    setVisualContent(aiData.content);
                } else {
                    setVisualContent("Watch the video above carefully. It breaks down the complex parts using visual analogies.");
                }
            } catch (error) {
                console.error("Failed to fetch visual details", error);
                setVideoId("dQw4w9WgXcQ");
                setVisualContent("Watch the video carefully and identify the flow of information.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideoAndVisuals();
    }, [session.topic, navigate]);

    const handleReturn = () => {
        updateSession({ mode: 'text' });
        navigate('/focus');
    };

    const handleReadyForQuiz = () => {
        navigate('/quiz');
    };

    return (
        <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen py-8 px-4 flex flex-col">
            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={handleReturn}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Text Mode
                    </button>

                    <div className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-sm font-medium flex items-center gap-2">
                        <Video className="w-4 h-4" /> Visual Learning Active
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                    {/* Main Video Area */}
                    <div className="col-span-1 lg:col-span-2 flex flex-col">
                        <div className="bg-black rounded-3xl overflow-hidden aspect-video shadow-2xl relative border border-slate-800 flex-shrink-0 flex items-center justify-center">
                            {isLoading ? (
                                <div className="text-slate-400 flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
                                    <span className="text-sm font-medium tracking-wide">Finding relevant visual lesson...</span>
                                </div>
                            ) : (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&hl=en`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="absolute inset-0"
                                ></iframe>
                            )}
                        </div>

                        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex-1">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-primary-400" />
                                Visual Concept Breakdown
                            </h2>
                            
                            {!isLoading && visualContent && (
                                <TypingText text={visualContent} speed={20} />
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="col-span-1 border border-slate-800 bg-slate-900 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-6">Why this mode?</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                Your previous quiz performance showed that a text-only approach wasn't fully cementing the concepts. Visuals and voiceovers dramatically improve retention for complex structural topics.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-800 border-l-4 border-l-primary-500">
                                    <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-primary-400" /></div>
                                    <p className="text-sm text-slate-300">Watch the entire diagram derivation.</p>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-800 border-l-4 border-l-blue-500">
                                    <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                                    <p className="text-sm text-slate-300">Pause and reflect when a new term is introduced.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-800">
                            <p className="text-sm text-slate-500 mb-4 text-center">Ready to test your knowledge again?</p>
                            <button
                                onClick={handleReadyForQuiz}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20"
                            >
                                I'm Ready for the Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
