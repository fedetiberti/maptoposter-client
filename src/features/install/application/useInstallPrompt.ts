import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const SNOOZE_KEY = 'mtp.install.snoozedUntil'

export function useInstallPrompt(): {
  canInstall: boolean
  install: () => Promise<void>
  snooze: () => void
} {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const snoozedUntil = Number(window.localStorage.getItem(SNOOZE_KEY) ?? 0)
    if (snoozedUntil > Date.now()) return
    const handler = (e: Event) => {
      e.preventDefault()
      setEvt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return {
    canInstall,
    install: async () => {
      if (!evt) return
      await evt.prompt()
      await evt.userChoice
      setEvt(null)
      setCanInstall(false)
    },
    snooze: () => {
      window.localStorage.setItem(
        SNOOZE_KEY,
        String(Date.now() + 7 * 24 * 60 * 60 * 1000),
      )
      setCanInstall(false)
    },
  }
}
