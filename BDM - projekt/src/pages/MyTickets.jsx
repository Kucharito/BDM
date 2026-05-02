import { useCallback, useEffect, useMemo, useState } from 'react'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import EventCard from '../components/EventCard'
import Loader from '../components/Loader'
import { getAllEvents, getPurchasedTicketsForUser } from '../blockchain/ticketService'
import { useWallet } from '../hooks/useWallet'
import { useContractEvents } from '../hooks/useContractEvents'

export default function MyTickets() {
  const { account, sessionKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ticketMap, setTicketMap] = useState({})
  const [events, setEvents] = useState([])

  const refresh = useCallback(async () => {
    if (!account) {
      setEvents([])
      setTicketMap({})
      return
    }

    setLoading(true)
    setError('')

    try {
      const [allEvents, purchases] = await Promise.all([
        getAllEvents(),
        getPurchasedTicketsForUser(account)
      ])

      const purchaseLookup = purchases.reduce((acc, item) => {
        if (item.quantity > 0) {
          acc[item.eventId] = item.quantity
        }
        return acc
      }, {})

      const ownedEvents = allEvents.filter((eventItem) => purchaseLookup[eventItem.id] > 0)

      setTicketMap(purchaseLookup)
      setEvents(ownedEvents)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [account])

  useEffect(() => {
    refresh()
  }, [refresh, sessionKey])

  useContractEvents(() => {
    refresh()
  }, !!account)

  const totalTickets = useMemo(
    () => Object.values(ticketMap).reduce((sum, value) => sum + Number(value), 0),
    [ticketMap]
  )

  return (
    <section className="page-section">
      <h2>My Tickets</h2>
      <p className="page-subtitle">Tickets purchased by your connected wallet: {totalTickets}</p>

      {!account ? <ErrorMessage message="Connect wallet to view purchased tickets." /> : null}
      <ErrorMessage message={error} onRetry={refresh} />
      {loading ? <Loader text="Loading purchased tickets..." /> : null}

      {!loading && account && events.length === 0 ? (
        <EmptyState title="No purchased tickets" text="Buy tickets from active events to see them here." />
      ) : null}

      <div className="grid">
        {events.map((eventItem) => (
          <EventCard key={eventItem.id} eventItem={eventItem} purchasedCount={ticketMap[eventItem.id] || 0} />
        ))}
      </div>
    </section>
  )
}
