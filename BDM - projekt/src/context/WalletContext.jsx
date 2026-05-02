import { useCallback, useEffect, useMemo, useState } from 'react'
import { Contract } from 'ethers'
import { connectWallet, detectMetaMask, getProvider } from '../blockchain/provider'
import { ADMIN_ADDRESS, CONTRACT_ABI, CONTRACT_ADDRESS, EXPECTED_CHAIN_ID } from '../blockchain/config'
import { getUserFriendlyError } from '../utils/errors'
import { WalletContext } from './walletContextCore'

export function WalletProvider({ children }) {
  const configuredAdmin = ADMIN_ADDRESS.trim().toLowerCase()
  const [hasMetaMask, setHasMetaMask] = useState(detectMetaMask())
  const [account, setAccount] = useState('')
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletError, setWalletError] = useState('')
  const [sessionKey, setSessionKey] = useState(0)
  const [adminAddress, setAdminAddress] = useState(() => {
    if (configuredAdmin) return configuredAdmin
    return localStorage.getItem('ticketDappAdminAddress')?.toLowerCase() || ''
  })

  const expectedChain = EXPECTED_CHAIN_ID ? Number(EXPECTED_CHAIN_ID) : null
  const isWrongNetwork = expectedChain ? Number(chainId) !== expectedChain : false

  const registerAdminAddress = useCallback(
    (nextAccount) => {
      if (!nextAccount || configuredAdmin) return

      const normalized = nextAccount.toLowerCase()
      setAdminAddress((current) => {
        if (current) return current
        localStorage.setItem('ticketDappAdminAddress', normalized)
        return normalized
      })
    },
    [configuredAdmin]
  )

  const discoverAdminAddress = useCallback(
    async (provider) => {
      if (configuredAdmin || adminAddress || !CONTRACT_ADDRESS) return

      try {
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
        const count = Number(await contract.eventCount())

        if (count > 0) {
          const firstEvent = await contract.eventsData(1)
          const organizer = (firstEvent.organizer ?? firstEvent[0] ?? '').toLowerCase()

          if (organizer) {
            localStorage.setItem('ticketDappAdminAddress', organizer)
            setAdminAddress(organizer)
          }
        }
      } catch {
        // Ignore discovery errors and fall back to first creator account registration.
      }
    },
    [adminAddress, configuredAdmin]
  )

  const resetState = useCallback(() => {
    setWalletError('')
    setSessionKey((prev) => prev + 1)
  }, [])

  const refreshConnectedAccount = useCallback(async () => {
    if (!detectMetaMask()) {
      setHasMetaMask(false)
      return
    }

    try {
      const provider = getProvider()
      const accounts = await provider.send('eth_accounts', [])
      const network = await provider.getNetwork()
      const activeAccount = accounts?.[0] || ''
      await discoverAdminAddress(provider)
      setHasMetaMask(true)
      setAccount(activeAccount)
      setChainId(Number(network.chainId))
      registerAdminAddress(activeAccount)
    } catch (error) {
      setWalletError(getUserFriendlyError(error, 'Failed to detect wallet state.'))
    }
  }, [discoverAdminAddress, registerAdminAddress])

  const connect = useCallback(async () => {
    setIsConnecting(true)
    setWalletError('')

    try {
      const result = await connectWallet()
      await discoverAdminAddress(result.provider)
      setHasMetaMask(true)
      setAccount(result.account)
      setChainId(result.chainId)
      registerAdminAddress(result.account)
      resetState()
    } catch (error) {
      setWalletError(getUserFriendlyError(error, 'Wallet connection failed.'))
    } finally {
      setIsConnecting(false)
    }
  }, [discoverAdminAddress, registerAdminAddress, resetState])

  useEffect(() => {
    refreshConnectedAccount()

    if (!detectMetaMask()) return undefined

    const handleAccountsChanged = (accounts) => {
      const activeAccount = accounts?.[0] || ''
      setAccount(activeAccount)
      registerAdminAddress(activeAccount)
      resetState()
    }

    const handleChainChanged = (newChainIdHex) => {
      setChainId(Number(newChainIdHex))
      setAccount('')
      resetState()
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      if (!window.ethereum?.removeListener) return
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [refreshConnectedAccount, registerAdminAddress, resetState])

  const normalizedAccount = account.toLowerCase()
  const isAdmin = Boolean(normalizedAccount && adminAddress && normalizedAccount === adminAddress)
  const isUser = Boolean(account) && !isAdmin

  const value = useMemo(
    () => ({
      hasMetaMask,
      account,
      chainId,
      isConnecting,
      walletError,
      isWrongNetwork,
      expectedChain,
      sessionKey,
      adminAddress,
      isAdmin,
      isUser,
      connect,
      refreshConnectedAccount
    }),
    [
      hasMetaMask,
      account,
      chainId,
      isConnecting,
      walletError,
      isWrongNetwork,
      expectedChain,
      sessionKey,
      adminAddress,
      isAdmin,
      isUser,
      connect,
      refreshConnectedAccount
    ]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
