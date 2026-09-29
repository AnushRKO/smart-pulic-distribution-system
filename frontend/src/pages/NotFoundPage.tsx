import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={36} className="text-primary-600"/>
        </div>
        <h1 className="text-6xl font-extrabold text-primary-800 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist or you don't have permission to view it.</p>
        <div className="flex justify-center gap-3">
          <Link to="/" className="btn-secondary">← Back to Home</Link>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
