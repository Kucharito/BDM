import { NavLink } from 'react-router-dom'
import WalletStatus from './WalletStatus'
import { useWallet } from '../hooks/useWallet'

export default function Navbar() {
  const { isAdmin } = useWallet()
  const navLinks = isAdmin
    ? [
        { to: '/', label: 'Events' },
        { to: '/create', label: 'Create Event' },
        { to: '/my-events', label: 'My Events' },
        { to: '/ended-events', label: 'Ended Events' }
      ]
    : [
        { to: '/', label: 'Buy Tickets' },
        { to: '/my-tickets', label: 'My Tickets' },
        { to: '/ended-events', label: 'Ended Events' }
      ]

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <h1 className="brand">ETH Ticket DApp</h1>
        <nav className="nav-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <WalletStatus />
      </div>
    </header>
  )
}
