import { useState } from 'react'
import { useDisplayMode } from './useDisplayMode'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
}

interface Props {
  deferredPrompt: BeforeInstallPromptEvent | null
}

export function InstallBanner({ deferredPrompt }: Props) {
  const { isBrowser, isIOS } = useDisplayMode()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('install-banner-dismissed') === '1')

  if (!isBrowser || isIOS || dismissed) return null

  function handleDismiss() {
    localStorage.setItem('install-banner-dismissed', '1')
    setDismissed(true)
  }

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      handleDismiss()
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 py-2">
      <span className="text-xs text-[#e6edf3]">Install Levl.up for the best experience</span>
      <div className="flex items-center gap-2">
        {deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="text-xs bg-[#ffd200] text-[#0d1117] px-3 py-1 rounded-lg font-medium"
          >
            Install
          </button>
        ) : (
          <span className="text-xs text-[#58a6ff]">Open in browser menu to install</span>
        )}
        <button
          onClick={handleDismiss}
          className="text-[#8b949e] text-sm leading-none px-1"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
