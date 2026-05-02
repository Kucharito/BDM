export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null

  return (
    <div className="alert alert-error">
      <p>{message}</p>
      {onRetry ? (
        <button className="btn btn-secondary" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  )
}
