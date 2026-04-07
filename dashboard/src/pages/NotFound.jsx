import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ix-bg flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <h1 className="text-7xl font-bold bg-gradient-to-r from-ix-blue to-ix-purple bg-clip-text text-transparent mb-4">404</h1>
        <p className="text-lg text-ix-muted mb-6">Page not found</p>
        <Link
          to="/home"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-ix-blue to-ix-purple text-white text-sm font-bold hover:opacity-90 transition-all"
        >
          <Home size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
