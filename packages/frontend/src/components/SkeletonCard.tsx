export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div aria-hidden="true" className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-[#21262d] animate-pulse"
          style={{ width: i === 0 ? '60%' : '40%' }} />
      ))}
    </div>
  )
}
