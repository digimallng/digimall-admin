export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">404 - Page Not Found</h2>
        <p className="mb-8 text-gray-600">The page you're looking for doesn't exist.</p>
        <a
          href="/dashboard"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
