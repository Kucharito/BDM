export const EVENT_STATUS = {
  ACTIVE: 'active',
  SOLD_OUT: 'sold_out',
  ENDED: 'ended',
  CANCELLED: 'cancelled'
}

export function getEventStatus(eventItem, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!eventItem) return EVENT_STATUS.ACTIVE

  const soldTickets = Number(eventItem.soldTickets || 0)
  const totalTickets = Number(eventItem.totalTickets || 0)
  const salesDeadline = Number(eventItem.salesDeadline || 0)

  if (eventItem.isCancelled) {
    return EVENT_STATUS.CANCELLED
  }

  if (soldTickets >= totalTickets && totalTickets > 0) {
    return EVENT_STATUS.SOLD_OUT
  }

  if (nowSeconds > salesDeadline) {
    return EVENT_STATUS.ENDED
  }

  return EVENT_STATUS.ACTIVE
}

export function statusLabel(status) {
  switch (status) {
    case EVENT_STATUS.CANCELLED:
      return 'Cancelled'
    case EVENT_STATUS.SOLD_OUT:
      return 'Sold Out'
    case EVENT_STATUS.ENDED:
      return 'Ended'
    default:
      return 'Active'
  }
}
