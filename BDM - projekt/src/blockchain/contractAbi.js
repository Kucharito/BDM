export const ticketingAbi = [
  'function eventCount() external view returns (uint256)',
  'function eventsData(uint256 eventId) external view returns (address organizer,string name,string description,string imageUrl,uint256 price,uint256 totalTickets,uint256 soldTickets,uint256 saleDeadline,uint256 eventDate,bool cancelled,bool withdrawn)',
  'function ticketsOf(uint256 eventId,address user) external view returns (uint256)',
  'function createEvent(string name,string description,string imageUrl,uint256 price,uint256 totalTickets,uint256 saleDeadline,uint256 eventDate) external',
  'function buyTickets(uint256 eventId,uint256 amount) external payable',
  'function withdraw(uint256 eventId) external',
  'function cancelEvent(uint256 eventId) external',
  'function refund(uint256 eventId) external',
  'event EventCreated(uint256 indexed eventId,address indexed organizer,string name)',
  'event TicketsBought(uint256 indexed eventId,address indexed buyer,uint256 amount)',
  'event EventCancelled(uint256 indexed eventId)',
  'event FundsWithdrawn(uint256 indexed eventId,uint256 amount)',
  'event Refunded(uint256 indexed eventId,address indexed buyer,uint256 amount)'
]
