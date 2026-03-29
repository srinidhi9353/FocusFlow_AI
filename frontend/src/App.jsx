import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FloatingChatbot from './components/FloatingChatbot';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import FocusMode from './pages/FocusMode';
import QuizPanel from './pages/QuizPanel';
import VisualMode from './pages/VisualMode';
import RevisionPanel from './pages/RevisionPanel';
import Auth from './pages/Auth';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/focus" element={<ProtectedRoute><FocusMode /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><QuizPanel /></ProtectedRoute>} />
            <Route path="/visual" element={<ProtectedRoute><VisualMode /></ProtectedRoute>} />
            <Route path="/revision" element={<ProtectedRoute><RevisionPanel /></ProtectedRoute>} />
          </Routes>
        </main>
        <FloatingChatbot />
      </div>
    </BrowserRouter>
  );
}

export default App;
