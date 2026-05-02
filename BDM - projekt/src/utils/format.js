import { formatEther, parseEther } from 'ethers'

export function weiToEth(valueWei) {
  if (valueWei === null || valueWei === undefined) return '0'
  return formatEther(valueWei)
}

export function multiplyWei(valueWei, amount) {
  if (valueWei === null || valueWei === undefined) return 0n
  return BigInt(valueWei) * BigInt(Number(amount) || 0)
}

export function ethToWei(valueEth) {
  if (!valueEth || Number(valueEth) <= 0) {
    throw new Error('ETH value must be greater than 0.')
  }

  return parseEther(String(valueEth).trim())
}

export function formatTimestamp(timestampSeconds) {
  if (!timestampSeconds) return '-'

  const date = new Date(Number(timestampSeconds) * 1000)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleString()
}

export function shortenAddress(address, size = 4) {
  if (!address) return '-'
  if (address.length <= size * 2 + 2) return address
  return `${address.slice(0, size + 2)}...${address.slice(-size)}`
}

export function toUnixTimestamp(datetimeValue) {
  const date = new Date(datetimeValue)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date input.')
  }

  return Math.floor(date.getTime() / 1000)
}
