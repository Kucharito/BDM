import { shortenAddress } from '../utils/format'
import { useWallet } from '../hooks/useWallet'

export default function WalletStatus() {
  const {
    hasMetaMask,
    account,
    connect,
    isConnecting,
    isWrongNetwork,
    expectedChain,
    isAdmin
  } = useWallet()

  if (!hasMetaMask) {
    return <div className="wallet-warning">MetaMask is not installed. Please install it to use this app.</div>
  }

  if (!account) {
    return (
      <button className="btn" onClick={connect} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    )
  }

  return (
    <div className="wallet-connected">
      <span>{shortenAddress(account)}</span>
      <small className="wallet-role-label">{isAdmin ? 'Admin account' : 'Buyer account'}</small>
      {isWrongNetwork ? (
        <small className="wallet-warning-inline">Wrong network (expected chain {expectedChain})</small>
      ) : null}
    </div>
  )
}
