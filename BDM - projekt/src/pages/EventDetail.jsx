import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import AlertBanner from '../components/AlertBanner'
import ErrorMessage from '../components/ErrorMessage'
import Loader from '../components/Loader'
import {
  buyTickets,
  cancelEvent,
  claimRefund,
  getEventById,
  getPurchasedTicketsForUser,
  withdrawFunds
} from '../blockchain/ticketService'
import { CONTRACT_ADDRESS } from '../blockchain/config'
import { useContractEvents } from '../hooks/useContractEvents'
import { useWallet } from '../hooks/useWallet'
import { getEventStatus, EVENT_STATUS, statusLabel } from '../utils/eventStatus'
import { formatTimestamp, multiplyWei, shortenAddress, weiToEth } from '../utils/format'

export default function EventDetail() {
  const { eventId } = useParams()
  const { account, sessionKey, isAdmin, isUser } = useWallet()

  const [eventItem, setEventItem] = useState(null)
  const [purchasedCount, setPurchasedCount] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const selectedEvent = await getEventById(eventId)
      setEventItem(selectedEvent)

      if (account) {
        const purchases = await getPurchasedTicketsForUser(account)
        const selectedPurchase = purchases.find((item) => String(item.eventId) === String(selectedEvent.id))
        setPurchasedCount(selectedPurchase?.quantity || 0)
      } else {
        setPurchasedCount(0)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [eventId, account])

  useEffect(() => {
    refresh()
  }, [refresh, sessionKey])

  useContractEvents(
    (name) => {
      setStatusMessage(`Blockchain update: ${name}`)
      refresh()
    },
    true
  )

  const eventStatus = useMemo(() => getEventStatus(eventItem), [eventItem])

  const isOrganizer = useMemo(() => {
    if (!eventItem || !account) return false
    return eventItem.organizer.toLowerCase() === account.toLowerCase()
  }, [eventItem, account])

  const canBuy = account && isUser && eventStatus === EVENT_STATUS.ACTIVE
  const canCancel = isAdmin && isOrganizer && eventStatus === EVENT_STATUS.ACTIVE
  const canWithdraw =
    isAdmin &&
    isOrganizer &&
    (eventStatus === EVENT_STATUS.ENDED || eventStatus === EVENT_STATUS.SOLD_OUT) &&
    !eventItem?.fundsWithdrawn
  const canClaimRefund = isUser && eventStatus === EVENT_STATUS.CANCELLED && purchasedCount > 0
  const eventRevenueWei = useMemo(() => multiplyWei(eventItem?.ticketPrice, eventItem?.soldTickets), [eventItem])
  const ticketProof = useMemo(() => {
    if (!eventItem || !account || purchasedCount <= 0) return ''

    return [
      `TicketMarketplace proof`,
      `Contract: ${CONTRACT_ADDRESS}`,
      `Event ID: ${eventItem.id}`,
      `Wallet: ${account}`,
      `Tickets: ${purchasedCount}`
    ].join('\n')
  }, [eventItem, account, purchasedCount])

  const runAction = async (action, successMessage) => {
    if (actionLoading) return

    setActionLoading(true)
    setError('')

    try {
      await action()
      setStatusMessage(successMessage)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBuy = async () => {
    if (!eventItem) return

    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty < 1) {
      setError('Invalid quantity. Enter at least 1 ticket.')
      return
    }

    await runAction(
      () => buyTickets(eventItem.id, qty, eventItem.ticketPrice),
      'Tickets purchased successfully.'
    )
  }

  if (loading) return <Loader text="Loading event details..." />
  if (!eventItem) return <ErrorMessage message={error || 'Event was not found.'} onRetry={refresh} />

  return (
    <section className="page-section">
      <h2>{eventItem.title}</h2>

      <AlertBanner type="info" message={statusMessage} onClose={() => setStatusMessage('')} />
      <ErrorMessage message={error} onRetry={refresh} />

      <div className="detail-layout">
        <img
          className="detail-image"
          src={eventItem.imageUrl || 'https://placehold.co/900x600?text=Event'}
          alt={eventItem.title}
        />

        <div className="detail-panel">
          <p>{eventItem.description}</p>
          <p><strong>Status:</strong> {statusLabel(eventStatus)}</p>
          <p><strong>Price:</strong> {weiToEth(eventItem.ticketPrice)} ETH</p>
          <p><strong>Sold:</strong> {eventItem.soldTickets}/{eventItem.totalTickets}</p>
          {isAdmin ? <p><strong>Revenue:</strong> {weiToEth(eventRevenueWei)} ETH</p> : null}
          <p><strong>Sales deadline:</strong> {formatTimestamp(eventItem.salesDeadline)}</p>
          <p><strong>Event date:</strong> {formatTimestamp(eventItem.eventTimestamp)}</p>
          <p><strong>Organizer:</strong> {shortenAddress(eventItem.organizer)}</p>
          <p><strong>Your purchased tickets:</strong> {purchasedCount}</p>
          {isAdmin && !isOrganizer ? (
            <p className="small-note">Admin actions are available only for the wallet that created this event.</p>
          ) : null}

          <div className="action-group">
            {isUser ? (
              <>
                <label>
                  Quantity
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={actionLoading || !canBuy}
                  />
                </label>

                <button className="btn" onClick={handleBuy} disabled={!canBuy || actionLoading}>
                  {actionLoading && canBuy ? 'Processing...' : 'Buy Tickets'}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => runAction(() => claimRefund(eventItem.id), 'Refund claimed successfully.')}
                  disabled={!canClaimRefund || actionLoading}
                >
                  Claim Refund
                </button>
              </>
            ) : null}

            {isAdmin ? (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => runAction(() => withdrawFunds(eventItem.id), 'Funds withdrawn successfully.')}
                  disabled={!canWithdraw || actionLoading}
                >
                  Withdraw Funds
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => runAction(() => cancelEvent(eventItem.id), 'Event cancelled successfully.')}
                  disabled={!canCancel || actionLoading}
                >
                  Cancel Event
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {isUser && purchasedCount > 0 ? (
        <div className="proof-panel">
          <div>
            <h3>Ticket Proof</h3>
            <p>
              Show this together with the connected wallet. The organizer can verify it by checking
              `ticketsOf(eventId, wallet)` on the deployed contract.
            </p>
          </div>

          <div className="proof-grid">
            <span>Event ID</span>
            <strong>{eventItem.id}</strong>
            <span>Wallet</span>
            <strong>{shortenAddress(account, 6)}</strong>
            <span>Paid tickets</span>
            <strong>{purchasedCount}</strong>
            <span>Contract</span>
            <strong>{shortenAddress(CONTRACT_ADDRESS, 6)}</strong>
          </div>

          <pre className="proof-code">{ticketProof}</pre>

          <a
            className="btn btn-secondary"
            href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}#readContract`}
            target="_blank"
            rel="noreferrer"
          >
            Verify on Sepolia Etherscan
          </a>
        </div>
      ) : null}
    </section>
  )
}
