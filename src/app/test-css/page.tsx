export default function TestCSSPage() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-blue-600">CSS Test Page</h1>
        <p className="mt-4 text-gray-600">If you can see this styled correctly, CSS is working.</p>
        <div className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded text-white">
          Gradient test
        </div>
      </div>
    </div>
  );
}