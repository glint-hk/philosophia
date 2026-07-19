import { useEffect } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return
    const node = ref.current
    const focusable = () => Array.from(node.querySelectorAll(FOCUSABLE))

    const first = focusable()[0]
    first?.focus()

    function onKeyDown(e) {
      if (e.key !== 'Tab') return
      const els = focusable()
      if (!els.length) return
      const firstEl = els[0]
      const lastEl = els[els.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => node.removeEventListener('keydown', onKeyDown)
  }, [ref, active])
}
