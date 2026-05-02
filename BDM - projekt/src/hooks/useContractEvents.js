import { useEffect } from 'react'
import { listenToContractEvents } from '../blockchain/provider'

export function useContractEvents(onContractEvent, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined

    let unsubscribe = null

    const start = async () => {
      try {
        unsubscribe = await listenToContractEvents(onContractEvent)
      } catch {
        unsubscribe = null
      }
    }

    start()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [onContractEvent, enabled])
}
