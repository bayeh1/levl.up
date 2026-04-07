interface Props { count: number }

export function StreakCounter({ count }: Props) {
  return (
    <div className="flex flex-col items-center py-8">
      <span className="text-5xl">🔥</span>
      <span className="text-7xl font-black text-[#ffd200] leading-none mt-2">{count}</span>
      <span className="text-xs text-[#8b949e] tracking-widest mt-2 uppercase">Day Streak</span>
    </div>
  )
}
