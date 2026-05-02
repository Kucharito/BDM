export default function FilterBar({ organizerFilter, setOrganizerFilter, sortOrder, setSortOrder }) {
  return (
    <div className="filter-bar">
      <div className="field">
        <label htmlFor="organizerFilter">Filter by organizer</label>
        <input
          id="organizerFilter"
          type="text"
          placeholder="0x..."
          value={organizerFilter}
          onChange={(event) => setOrganizerFilter(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="sortOrder">Sort by</label>
        <select id="sortOrder" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  )
}
