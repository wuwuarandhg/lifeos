export default function AppLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-md bg-surface-2 animate-pulse" />
        <div className="h-4 w-32 rounded-md bg-surface-2 animate-pulse" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-surface-2 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-5 w-10 rounded bg-surface-2 animate-pulse" />
              <div className="h-3 w-16 rounded bg-surface-2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Content cards skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="card space-y-3">
            <div className="h-5 w-24 rounded bg-surface-2 animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-8 w-full rounded bg-surface-2 animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
