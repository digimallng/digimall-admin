'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Something went wrong!</h2>
            <button onClick={() => reset()} className="rounded bg-blue-600 px-4 py-2 text-white">
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
