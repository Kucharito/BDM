export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  )
}
