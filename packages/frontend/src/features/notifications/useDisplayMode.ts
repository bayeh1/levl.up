export function useDisplayMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  return { isStandalone, isIOS, isBrowser: !isStandalone }
}
