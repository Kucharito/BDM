export default function AlertBanner({ type = 'info', message, onClose }) {
  if (!message) return null

  return (
    <div className={`alert alert-${type}`}>
      <p>{message}</p>
      {onClose ? (
        <button className="btn-text" onClick={onClose}>
          Dismiss
        </button>
      ) : null}
    </div>
  )
}
