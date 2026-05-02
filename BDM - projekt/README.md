# Ethereum Ticket Selling DApp Frontend

Frontend-only decentralized ticket platform using React, Vite, ethers.js, React Router, and MetaMask.

## Features

- Wallet connection with MetaMask detection and account/chain change handling
- Organizer flow: create events, cancel events, withdraw funds
- Buyer flow: browse events, buy tickets, view purchased tickets, claim refunds
- Contract event listeners for automatic UI refresh
- Responsive pages with reusable components and loading/error states

## Tech Stack

- React + Vite
- ethers.js
- React Router
- Plain CSS

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and configure. For the current Sepolia deployment:

```env
VITE_CONTRACT_ADDRESS=0x05630805aF757Cb18A88b58E937a9EC943e28419
VITE_CHAIN_ID=11155111
VITE_ADMIN_ADDRESS=0xYourAdminWalletAddress
```

3. Start development server:

```bash
npm run dev
```

4. Build production bundle:

```bash
npm run build
```

## Contract Interface Assumptions

The frontend expects a contract with these methods:

- `eventCount()`
- `eventsData(eventId)`
- `ticketsOf(eventId, user)`
- `createEvent(name, description, imageUrl, price, totalTickets, saleDeadline, eventDate)`
- `buyTickets(eventId, amount)` payable
- `withdraw(eventId)`
- `cancelEvent(eventId)`
- `refund(eventId)`

And these events:

- `EventCreated`
- `TicketsBought`
- `EventCancelled`
- `FundsWithdrawn`
- `Refunded`
