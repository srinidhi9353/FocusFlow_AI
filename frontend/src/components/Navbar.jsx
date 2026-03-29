import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="h-8 w-8 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-lg flex items-center justify-center shadow-sm">
                                <Brain className="text-white w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-800">FocusFlow AI</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">
                                    Dashboard
                                </Link>
                                <div className="h-6 w-px bg-slate-200 mx-2" />
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200">
                                        <UserIcon className="w-4 h-4 text-primary-700" />
                                    </div>
                                    <span className="font-medium hidden sm:block">{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/auth"
                                className="bg-primary-600 text-white px-5 py-2 rounded-full font-medium tracking-wide text-sm hover:bg-primary-700 transition"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
