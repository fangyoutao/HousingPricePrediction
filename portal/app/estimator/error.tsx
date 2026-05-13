"use client";

export default function EstimatorError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
      <h2 className="mb-2 text-xl font-semibold text-red-800">Estimator Error</h2>
      <p className="mb-4 text-sm text-red-600">{error.message}</p>
      <button
        onClick={() => unstable_retry()}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
}
