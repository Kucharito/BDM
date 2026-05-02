import { useEffect, useMemo, useState } from 'react'
import AlertBanner from '../components/AlertBanner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import EventCard from '../components/EventCard'
import FilterBar from '../components/FilterBar'
import Loader from '../components/Loader'
import { useEventData } from '../hooks/useEventData'
import { useWallet } from '../hooks/useWallet'
import { EVENT_STATUS, getEventStatus } from '../utils/eventStatus'

export default function Home() {
  const { isAdmin } = useWallet()
  const { events, loading, error, refresh, lastEventMessage, setLastEventMessage } = useEventData({ autoRefresh: true })
  const [organizerFilter, setOrganizerFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')

  useEffect(() => {
    refresh()
  }, [refresh])

  const filteredEvents = useMemo(() => {
    const activeEvents = events.filter((eventItem) => getEventStatus(eventItem) === EVENT_STATUS.ACTIVE)

    const byOrganizer = organizerFilter
      ? activeEvents.filter((eventItem) =>
          eventItem.organizer.toLowerCase().includes(organizerFilter.trim().toLowerCase())
        )
      : activeEvents

    return [...byOrganizer].sort((a, b) => {
      if (sortOrder === 'oldest') {
        return a.eventTimestamp - b.eventTimestamp
      }

      return b.eventTimestamp - a.eventTimestamp
    })
  }, [events, organizerFilter, sortOrder])

  return (
    <section className="page-section">
      <h2>Active Events</h2>
      <p className="page-subtitle">
        {isAdmin ? 'Review active events and manage events created by your wallet.' : 'Browse open events and buy tickets using ETH.'}
      </p>

      <AlertBanner type="info" message={lastEventMessage} onClose={() => setLastEventMessage('')} />
      <ErrorMessage message={error} onRetry={refresh} />

      <FilterBar
        organizerFilter={organizerFilter}
        setOrganizerFilter={setOrganizerFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {loading ? <Loader text="Loading events from blockchain..." /> : null}

      {!loading && filteredEvents.length === 0 ? (
        <EmptyState title="No active events" text="No active events match the current filter." />
      ) : null}

      <div className="grid">
        {filteredEvents.map((eventItem) => (
          <EventCard key={eventItem.id} eventItem={eventItem} />
        ))}
      </div>
    </section>
  )
}
