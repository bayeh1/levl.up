import { useEffect, useRef, useState } from 'react'

interface Props { count: number }

export function StreakCounter({ count }: Props) {
  const [pop, setPop] = useState(false)
  const prevCount = useRef(count)

  useEffect(() => {
    if (count !== prevCount.current) {
      prevCount.current = count
      setPop(true)
      const t = setTimeout(() => setPop(false), 400)
      return () => clearTimeout(t)
    }
  }, [count])

  return (
    <div className="flex flex-col items-center py-8">
      <span className="text-5xl">🔥</span>
      <span className={`text-7xl font-black text-[#ffd200] leading-none mt-2 transition-transform duration-300 ${pop ? 'scale-125' : 'scale-100'}`}>
        {count}
      </span>
      <span className="text-xs text-[#8b949e] tracking-widest mt-2 uppercase">Day Streak</span>
    </div>
  )
}
