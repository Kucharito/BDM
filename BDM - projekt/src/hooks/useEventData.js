import { useCallback, useState } from 'react'
import { getAllEvents } from '../blockchain/ticketService'
import { useContractEvents } from './useContractEvents'

export function useEventData({ autoRefresh = true } = {}) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastEventMessage, setLastEventMessage] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getAllEvents()
      setEvents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleContractEvent = useCallback(
    (eventName) => {
      setLastEventMessage(`Blockchain update: ${eventName}`)
      refresh()
    },
    [refresh]
  )

  useContractEvents(handleContractEvent, autoRefresh)

  return {
    events,
    loading,
    error,
    lastEventMessage,
    setLastEventMessage,
    refresh
  }
}
