import { verifyMessage } from 'ethers'
import { getSigner } from './provider'

export function buildTicketProofMessage({
  contractAddress,
  eventId,
  eventTitle,
  walletAddress,
  ticketCount,
  signedAt
}) {
  return [
    'TicketMarketplace ownership proof',
    `Contract: ${contractAddress}`,
    `Event ID: ${eventId}`,
    `Event title: ${eventTitle}`,
    `Wallet: ${walletAddress}`,
    `Tickets: ${ticketCount}`,
    `Signed at: ${signedAt}`
  ].join('\n')
}

export function parseTicketProofMessage(message) {
  const lines = String(message || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const getValue = (prefix) => lines.find((line) => line.startsWith(prefix))?.slice(prefix.length).trim() || ''

  return {
    contractAddress: getValue('Contract:'),
    eventId: Number(getValue('Event ID:')),
    eventTitle: getValue('Event title:'),
    walletAddress: getValue('Wallet:'),
    ticketCount: Number(getValue('Tickets:')),
    signedAt: getValue('Signed at:')
  }
}

export async function signTicketProofMessage(message) {
  const signer = await getSigner()
  return signer.signMessage(message)
}

export function recoverTicketProofSigner(message, signature) {
  return verifyMessage(message, signature)
}
