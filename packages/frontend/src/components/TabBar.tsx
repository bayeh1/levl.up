import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Today', icon: '🔥' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { to: '/finance', label: 'Finance', icon: '💰' },
  { to: '/settings', label: 'Settings', icon: '⚙️' }
]

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#161b22] border-t border-[#30363d] flex justify-around pb-safe z-40">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-4 text-xs ${isActive ? 'text-[#ffd200]' : 'text-[#8b949e]'}`
          }
        >
          <span className="text-xl">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
