'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 ring-1 ring-white/10">
        {/* Wifi Off Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="url(#grad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f8ef7" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" fill="url(#grad)" stroke="none" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
        You're offline
      </h1>
      <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
        It looks like you've lost your internet connection. Check your network and try again.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 active:scale-95 transition-all"
      >
        Try again
      </button>

      <p className="mt-6 text-xs text-muted-foreground/60">
        SpeakWise • Pages you've visited before may still be available
      </p>
    </div>
  )
}
