import { Link } from 'react-router-dom'
import { weiToEth, formatTimestamp, shortenAddress } from '../utils/format'
import { getEventStatus, statusLabel } from '../utils/eventStatus'

export default function EventCard({ eventItem, purchasedCount = 0 }) {
  const status = getEventStatus(eventItem)

  return (
    <article className="event-card">
      <img
        src={eventItem.imageUrl || 'https://placehold.co/600x400?text=Event'}
        alt={eventItem.title}
        className="event-image"
      />

      <div className="event-card-body">
        <div className="event-card-head">
          <h3>{eventItem.title}</h3>
          <span className={`status status-${status}`}>{statusLabel(status)}</span>
        </div>

        <p className="event-description">{eventItem.description}</p>

        <div className="event-meta-grid">
          <span>Price: {weiToEth(eventItem.ticketPrice)} ETH</span>
          <span>Sold: {eventItem.soldTickets}/{eventItem.totalTickets}</span>
          <span>Deadline: {formatTimestamp(eventItem.salesDeadline)}</span>
          <span>Organizer: {shortenAddress(eventItem.organizer)}</span>
        </div>

        {purchasedCount > 0 ? <p className="small-note">Your tickets: {purchasedCount}</p> : null}

        <Link className="btn" to={`/events/${eventItem.id}`}>
          View Details
        </Link>
      </div>
    </article>
  )
}
