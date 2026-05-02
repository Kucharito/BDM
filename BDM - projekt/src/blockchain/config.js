import { ticketingAbi } from './contractAbi'

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''
export const EXPECTED_CHAIN_ID = import.meta.env.VITE_CHAIN_ID || ''
export const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS || ''
export const CONTRACT_ABI = ticketingAbi

export const CONTRACT_EVENTS = [
  'EventCreated',
  'TicketsBought',
  'EventCancelled',
  'FundsWithdrawn',
  'Refunded'
]
