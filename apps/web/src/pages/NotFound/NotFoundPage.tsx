import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="card p-8 max-w-md text-center space-y-3">
        <h1 className="text-3xl font-bold text-[#212121]">Page Not Found</h1>
        <p className="text-sm text-[#616161]">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-[#43A047] text-white hover:bg-[#2E7D32]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
