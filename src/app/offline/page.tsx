"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-background text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl">📵</div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">You&apos;re offline</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          No internet connection. Your previously viewed pages are still available.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium"
      >
        Try again
      </button>
    </div>
  );
}
