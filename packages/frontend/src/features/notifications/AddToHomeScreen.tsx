import { useEffect, useState } from 'react'

export function AddToHomeScreen() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const dismissed = localStorage.getItem('a2hs-dismissed')
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (isIOS && !isStandalone && !dismissed) setShow(true)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-[#161b22] border border-[#ffd200] rounded-xl p-4 z-50 shadow-xl">
      <button
        onClick={() => { setShow(false); localStorage.setItem('a2hs-dismissed', '1') }}
        className="absolute top-2 right-3 text-[#8b949e] text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
      <p className="text-sm font-semibold mb-1">Install Levl.up on your iPhone</p>
      <p className="text-xs text-[#8b949e]">
        Tap <strong className="text-[#e6edf3]">Share</strong> then{' '}
        <strong className="text-[#e6edf3]">"Add to Home Screen"</strong> to get push
        notifications and the full app experience.
      </p>
    </div>
  )
}
