import { getContractInstance } from './provider'
import { toAppError } from '../utils/errors'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeEvent(rawEvent) {
  if (!rawEvent) return null

  return {
    id: toNumber(rawEvent.id ?? rawEvent[0]),
    organizer: rawEvent.organizer ?? rawEvent[1],
    title: rawEvent.title ?? rawEvent.name ?? rawEvent[2],
    description: rawEvent.description ?? rawEvent[3],
    imageUrl: rawEvent.imageUrl ?? rawEvent[4],
    ticketPrice: rawEvent.ticketPrice ?? rawEvent.price ?? rawEvent[5],
    totalTickets: toNumber(rawEvent.totalTickets ?? rawEvent[6]),
    soldTickets: toNumber(rawEvent.soldTickets ?? rawEvent[7]),
    salesDeadline: toNumber(rawEvent.salesDeadline ?? rawEvent.saleDeadline ?? rawEvent[8]),
    eventTimestamp: toNumber(rawEvent.eventTimestamp ?? rawEvent.eventDate ?? rawEvent[9]),
    isCancelled: Boolean(rawEvent.isCancelled ?? rawEvent.cancelled ?? rawEvent[10]),
    fundsWithdrawn: Boolean(rawEvent.fundsWithdrawn ?? rawEvent.withdrawn ?? rawEvent[11])
  }
}

function normalizeContractEvent(eventId, rawEvent) {
  return normalizeEvent({
    id: eventId,
    organizer: rawEvent.organizer ?? rawEvent[0],
    name: rawEvent.name ?? rawEvent[1],
    description: rawEvent.description ?? rawEvent[2],
    imageUrl: rawEvent.imageUrl ?? rawEvent[3],
    price: rawEvent.price ?? rawEvent[4],
    totalTickets: rawEvent.totalTickets ?? rawEvent[5],
    soldTickets: rawEvent.soldTickets ?? rawEvent[6],
    saleDeadline: rawEvent.saleDeadline ?? rawEvent[7],
    eventDate: rawEvent.eventDate ?? rawEvent[8],
    cancelled: rawEvent.cancelled ?? rawEvent[9],
    withdrawn: rawEvent.withdrawn ?? rawEvent[10]
  })
}

export async function getAllEvents() {
  try {
    const contract = await getContractInstance({ withSigner: false })
    const count = toNumber(await contract.eventCount())
    const eventIds = Array.from({ length: count }, (_, index) => index + 1)
    const events = await Promise.all(
      eventIds.map(async (eventId) => normalizeContractEvent(eventId, await contract.eventsData(eventId)))
    )

    return events.filter(Boolean)
  } catch (error) {
    throw toAppError(error, 'Failed to load events from blockchain.')
  }
}

export async function getEventById(eventId) {
  try {
    const contract = await getContractInstance({ withSigner: false })
    const eventItem = await contract.eventsData(eventId)
    return normalizeContractEvent(eventId, eventItem)
  } catch (error) {
    throw toAppError(error, 'Failed to load selected event.')
  }
}

export async function createEvent(payload) {
  try {
    const contract = await getContractInstance({ withSigner: true })

    const tx = await contract.createEvent(
      payload.title,
      payload.description,
      payload.imageUrl,
      payload.ticketPrice,
      payload.totalTickets,
      payload.salesDeadline,
      payload.eventTimestamp
    )

    return tx.wait()
  } catch (error) {
    throw toAppError(error, 'Failed to create event. Please check values and try again.')
  }
}

export async function buyTickets(eventId, quantity, ticketPriceWei) {
  if (!quantity || Number(quantity) <= 0) {
    throw new Error('Ticket quantity must be at least 1.')
  }

  try {
    const contract = await getContractInstance({ withSigner: true })
    const totalValue = ticketPriceWei * BigInt(quantity)

    const tx = await contract.buyTickets(eventId, quantity, {
      value: totalValue
    })

    return tx.wait()
  } catch (error) {
    throw toAppError(error, 'Failed to buy tickets. Check event status, quantity, and wallet balance.')
  }
}

export async function withdrawFunds(eventId) {
  try {
    const contract = await getContractInstance({ withSigner: true })
    const tx = await contract.withdraw(eventId)
    return tx.wait()
  } catch (error) {
    throw toAppError(error, 'Failed to withdraw funds. This action is organizer-only and available only when eligible.')
  }
}

export async function cancelEvent(eventId) {
  try {
    const contract = await getContractInstance({ withSigner: true })
    const tx = await contract.cancelEvent(eventId)
    return tx.wait()
  } catch (error) {
    throw toAppError(error, 'Failed to cancel event. Only organizer can cancel an active event.')
  }
}

export async function claimRefund(eventId) {
  try {
    const contract = await getContractInstance({ withSigner: true })
    const tx = await contract.refund(eventId)
    return tx.wait()
  } catch (error) {
    throw toAppError(error, 'Failed to claim refund. Refund is available only for cancelled events with purchased tickets.')
  }
}

export async function getPurchasedTicketsForUser(userAddress) {
  if (!userAddress) return []

  try {
    const contract = await getContractInstance({ withSigner: false })
    const count = toNumber(await contract.eventCount())
    const eventIds = Array.from({ length: count }, (_, index) => index + 1)
    const purchases = await Promise.all(
      eventIds.map(async (eventId) => ({
        eventId,
        quantity: toNumber(await contract.ticketsOf(eventId, userAddress))
      }))
    )

    return purchases.filter((purchase) => purchase.quantity > 0)
  } catch (error) {
    throw toAppError(error, 'Failed to load purchased tickets for connected wallet.')
  }
}
