import { useEffect, useMemo } from 'react'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import EventCard from '../components/EventCard'
import Loader from '../components/Loader'
import { useEventData } from '../hooks/useEventData'
import { EVENT_STATUS, getEventStatus } from '../utils/eventStatus'

export default function EndedEvents() {
  const { events, loading, error, refresh } = useEventData({ autoRefresh: true })

  useEffect(() => {
    refresh()
  }, [refresh])

  const { ended, cancelled } = useMemo(() => {
    const endedEvents = []
    const cancelledEvents = []

    events.forEach((eventItem) => {
      const status = getEventStatus(eventItem)

      if (status === EVENT_STATUS.CANCELLED) {
        cancelledEvents.push(eventItem)
        return
      }

      if (status === EVENT_STATUS.ENDED || status === EVENT_STATUS.SOLD_OUT) {
        endedEvents.push(eventItem)
      }
    })

    return { ended: endedEvents, cancelled: cancelledEvents }
  }, [events])

  return (
    <section className="page-section">
      <h2>Ended and Cancelled Events</h2>
      <ErrorMessage message={error} onRetry={refresh} />
      {loading ? <Loader text="Loading ended events..." /> : null}

      {!loading && ended.length === 0 && cancelled.length === 0 ? (
        <EmptyState title="No ended events" text="Ended and cancelled events will appear here." />
      ) : null}

      <h3 className="section-title">Ended / Sold Out</h3>
      <div className="grid">
        {ended.map((eventItem) => (
          <EventCard key={eventItem.id} eventItem={eventItem} />
        ))}
      </div>

      <h3 className="section-title">Cancelled</h3>
      <div className="grid">
        {cancelled.map((eventItem) => (
          <EventCard key={eventItem.id} eventItem={eventItem} />
        ))}
      </div>
    </section>
  )
}
