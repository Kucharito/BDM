// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TicketMarketplace {
    uint256 public eventCount;
    bool private locked;

    struct EventData {
        address payable organizer;
        string name;
        string description;
        string imageUrl;
        uint256 price;
        uint256 totalTickets;
        uint256 soldTickets;
        uint256 saleDeadline;
        uint256 eventDate;
        bool cancelled;
        bool withdrawn;
    }

    mapping(uint256 => EventData) public eventsData;
    mapping(uint256 => mapping(address => uint256)) public ticketsOf;

    event EventCreated(uint256 indexed eventId, address indexed organizer, string name);
    event TicketsBought(uint256 indexed eventId, address indexed buyer, uint256 amount);
    event EventCancelled(uint256 indexed eventId);
    event FundsWithdrawn(uint256 indexed eventId, uint256 amount);
    event Refunded(uint256 indexed eventId, address indexed buyer, uint256 amount);

    modifier eventExists(uint256 eventId) {
        require(eventId > 0 && eventId <= eventCount, "Event neexistuje");
        _;
    }

    modifier noReentrant() {
        require(!locked, "Reentrancy zakazana");
        locked = true;
        _;
        locked = false;
    }

    function createEvent(
        string memory _name,
        string memory _description,
        string memory _imageUrl,
        uint256 _price,
        uint256 _totalTickets,
        uint256 _saleDeadline,
        uint256 _eventDate
    ) external {
        require(bytes(_name).length > 0, "Nazov je povinny");
        require(_price > 0, "Cena musi byt vacsia ako 0");
        require(_totalTickets > 0, "Pocet listkov musi byt vacsi ako 0");
        require(_saleDeadline > block.timestamp, "Deadline musi byt v buducnosti");
        require(_eventDate > _saleDeadline, "Event musi byt po deadline predaja");

        eventCount++;

        eventsData[eventCount] = EventData({
            organizer: payable(msg.sender),
            name: _name,
            description: _description,
            imageUrl: _imageUrl,
            price: _price,
            totalTickets: _totalTickets,
            soldTickets: 0,
            saleDeadline: _saleDeadline,
            eventDate: _eventDate,
            cancelled: false,
            withdrawn: false
        });

        emit EventCreated(eventCount, msg.sender, _name);
    }

    function buyTickets(uint256 eventId, uint256 amount)
        external
        payable
        eventExists(eventId)
    {
        EventData storage e = eventsData[eventId];

        require(!e.cancelled, "Event je zruseny");
        require(block.timestamp <= e.saleDeadline, "Predaj skoncil");
        require(amount > 0, "Mnozstvo musi byt vacsie ako 0");
        require(e.soldTickets + amount <= e.totalTickets, "Nedostatok listkov");
        require(msg.value == e.price * amount, "Nespravna suma ETH");

        ticketsOf[eventId][msg.sender] += amount;
        e.soldTickets += amount;

        emit TicketsBought(eventId, msg.sender, amount);
    }

    function cancelEvent(uint256 eventId) external eventExists(eventId) {
        EventData storage e = eventsData[eventId];

        require(msg.sender == e.organizer, "Nie si organizator");
        require(!e.cancelled, "Event uz je zruseny");
        require(!e.withdrawn, "Peniaze uz boli vybrate");

        e.cancelled = true;

        emit EventCancelled(eventId);
    }

    function withdraw(uint256 eventId)
        external
        eventExists(eventId)
        noReentrant
    {
        EventData storage e = eventsData[eventId];

        require(msg.sender == e.organizer, "Nie si organizator");
        require(!e.cancelled, "Event je zruseny");
        require(!e.withdrawn, "Peniaze uz boli vybrate");
        require(
            block.timestamp > e.saleDeadline || e.soldTickets == e.totalTickets,
            "Predaj este neskoncil"
        );

        e.withdrawn = true;

        uint256 amount = e.price * e.soldTickets;
        (bool success, ) = e.organizer.call{value: amount}("");
        require(success, "Vyber zlyhal");

        emit FundsWithdrawn(eventId, amount);
    }

    function refund(uint256 eventId)
        external
        eventExists(eventId)
        noReentrant
    {
        EventData storage e = eventsData[eventId];

        require(e.cancelled, "Event nie je zruseny");

        uint256 ticketAmount = ticketsOf[eventId][msg.sender];
        require(ticketAmount > 0, "Nemas listky na refund");

        ticketsOf[eventId][msg.sender] = 0;

        uint256 refundAmount = ticketAmount * e.price;
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund zlyhal");

        emit Refunded(eventId, msg.sender, refundAmount);
    }
}