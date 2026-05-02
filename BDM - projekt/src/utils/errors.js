const USER_REJECTED_CODES = new Set(['ACTION_REJECTED', 4001])

export function getUserFriendlyError(error, fallbackMessage = 'Something went wrong. Please try again.') {
  if (!error) return fallbackMessage

  const code = error.code
  const message = String(error.reason || error.shortMessage || error.message || '').toLowerCase()

  if (USER_REJECTED_CODES.has(code)) {
    return 'Action was cancelled in wallet.'
  }

  if (code === 'INSUFFICIENT_FUNDS' || message.includes('insufficient funds')) {
    return 'Insufficient funds to complete this transaction.'
  }

  if (message.includes('wrong network') || message.includes('chain')) {
    return 'Wrong network selected in MetaMask.'
  }

  if (message.includes('missing') && message.includes('metamask')) {
    return 'MetaMask was not found. Please install it first.'
  }

  if (message.includes('execution reverted') || message.includes('reverted')) {
    return 'Transaction was reverted by the contract. Please check event status and permissions.'
  }

  if (message.includes('nonce')) {
    return 'Transaction nonce issue detected. Please retry once wallet catches up.'
  }

  return fallbackMessage
}

export function toAppError(error, fallbackMessage) {
  return new Error(getUserFriendlyError(error, fallbackMessage))
}
