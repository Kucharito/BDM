import { useEffect, useMemo } from 'react'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import EventCard from '../components/EventCard'
import Loader from '../components/Loader'
import { useEventData } from '../hooks/useEventData'
import { useWallet } from '../hooks/useWallet'
import { multiplyWei, weiToEth } from '../utils/format'

export default function MyEvents() {
  const { account } = useWallet()
  const { events, loading, error, refresh } = useEventData({ autoRefresh: true })

  useEffect(() => {
    refresh()
  }, [refresh])

  const myEvents = useMemo(() => {
    if (!account) return []

    return events.filter((eventItem) => eventItem.organizer.toLowerCase() === account.toLowerCase())
  }, [events, account])

  const salesSummary = useMemo(() => {
    return myEvents.reduce(
      (summary, eventItem) => ({
        eventsCount: summary.eventsCount + 1,
        ticketsSold: summary.ticketsSold + eventItem.soldTickets,
        revenueWei: summary.revenueWei + multiplyWei(eventItem.ticketPrice, eventItem.soldTickets)
      }),
      { eventsCount: 0, ticketsSold: 0, revenueWei: 0n }
    )
  }, [myEvents])

  return (
    <section className="page-section">
      <h2>My Created Events</h2>
      <p className="page-subtitle">Events where your wallet is organizer.</p>

      {!account ? <ErrorMessage message="Connect wallet to view your events." /> : null}
      <ErrorMessage message={error} onRetry={refresh} />
      {loading ? <Loader text="Loading your events..." /> : null}

      {!loading && account && myEvents.length === 0 ? (
        <EmptyState title="No organizer events" text="Create your first event to see it here." />
      ) : null}

      {account && myEvents.length > 0 ? (
        <div className="stats-grid">
          <div className="stat-box">
            <span>Created events</span>
            <strong>{salesSummary.eventsCount}</strong>
          </div>
          <div className="stat-box">
            <span>Tickets sold</span>
            <strong>{salesSummary.ticketsSold}</strong>
          </div>
          <div className="stat-box">
            <span>Total revenue</span>
            <strong>{weiToEth(salesSummary.revenueWei)} ETH</strong>
          </div>
        </div>
      ) : null}

      <div className="grid">
        {myEvents.map((eventItem) => (
          <EventCard key={eventItem.id} eventItem={eventItem} />
        ))}
      </div>
    </section>
  )
}
