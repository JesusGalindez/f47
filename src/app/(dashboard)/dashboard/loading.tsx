export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="hud-text text-sm text-[var(--cyan-reactive)] animate-pulse">
          ESTABLISHING SECURE DATALINK
        </div>
        <div className="flex justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[var(--cyan-reactive)] rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
