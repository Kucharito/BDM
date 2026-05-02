import { BrowserProvider, Contract } from 'ethers'
import { CONTRACT_ABI, CONTRACT_ADDRESS, CONTRACT_EVENTS } from './config'
import { toAppError } from '../utils/errors'

function assertContractConfig() {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address is missing. Add VITE_CONTRACT_ADDRESS in your .env file.')
  }

  if (!Array.isArray(CONTRACT_ABI) || CONTRACT_ABI.length === 0) {
    throw new Error('Contract ABI is missing or invalid.')
  }
}

export function detectMetaMask() {
  return typeof window !== 'undefined' && !!window.ethereum
}

export function getProvider() {
  if (!detectMetaMask()) {
    throw new Error('MetaMask is missing.')
  }

  return new BrowserProvider(window.ethereum)
}

export async function connectWallet() {
  try {
    const provider = getProvider()
    const accounts = await provider.send('eth_requestAccounts', [])

    if (!accounts?.length) {
      throw new Error('No wallet account was returned.')
    }

    const network = await provider.getNetwork()

    return {
      provider,
      account: accounts[0],
      chainId: Number(network.chainId)
    }
  } catch (error) {
    throw toAppError(error, 'Failed to connect wallet. Please try again.')
  }
}

export async function getSigner() {
  try {
    const provider = getProvider()
    return provider.getSigner()
  } catch (error) {
    throw toAppError(error, 'Unable to access wallet signer.')
  }
}

export async function getContractInstance({ withSigner = false } = {}) {
  try {
    assertContractConfig()

    if (withSigner) {
      const signer = await getSigner()
      return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
    }

    const provider = getProvider()
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
  } catch (error) {
    throw toAppError(error, 'Unable to initialize smart contract connection.')
  }
}

export async function listenToContractEvents(onEvent) {
  const contract = await getContractInstance({ withSigner: false })
  const listeners = []

  CONTRACT_EVENTS.forEach((eventName) => {
    const listener = (...args) => onEvent?.(eventName, args)
    contract.on(eventName, listener)
    listeners.push({ eventName, listener })
  })

  return () => {
    listeners.forEach(({ eventName, listener }) => {
      contract.off(eventName, listener)
    })
  }
}
