interface Props { health: number }  // 0–1

export function HealthBar({ health }: Props) {
  const pct = Math.round(health * 100)
  const color = health > 0.5 ? '#3fb950' : health > 0.25 ? '#ffd200' : '#f85149'
  return (
    <div className="px-6 pb-4">
      <div className="flex justify-between text-xs text-[#8b949e] mb-1">
        <span>Streak health</span>
        <span>{pct}%</span>
      </div>
      <div className="bg-[#21262d] rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
