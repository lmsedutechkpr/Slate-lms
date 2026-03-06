'use client';

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-50 p-6">
      <div className="text-6xl mb-2">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
      <p className="text-gray-500 text-sm max-w-md text-center">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="mt-4 px-6 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
      >
        Try again
      </button>
    </div>
  );
}
