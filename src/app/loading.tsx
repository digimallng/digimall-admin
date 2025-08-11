export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
