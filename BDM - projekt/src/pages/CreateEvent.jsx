import { useState } from 'react'
import AlertBanner from '../components/AlertBanner'
import ErrorMessage from '../components/ErrorMessage'
import { createEvent } from '../blockchain/ticketService'
import { ethToWei, toUnixTimestamp } from '../utils/format'
import { useWallet } from '../hooks/useWallet'

const initialForm = {
  title: '',
  description: '',
  imageUrl: '',
  ticketPriceEth: '',
  totalTickets: '',
  salesDeadline: '',
  eventDate: ''
}

function validateForm(form) {
  if (!form.title.trim()) return 'Title is required.'
  if (!form.description.trim()) return 'Description is required.'
  if (!form.imageUrl.trim()) return 'Image URL is required.'
  if (!form.ticketPriceEth || Number(form.ticketPriceEth) <= 0) return 'Ticket price must be greater than 0.'
  if (!form.totalTickets || Number(form.totalTickets) <= 0) return 'Total tickets must be greater than 0.'
  if (!form.salesDeadline) return 'Sales deadline is required.'
  if (!form.eventDate) return 'Event date is required.'

  const deadlineTs = toUnixTimestamp(form.salesDeadline)
  const eventTs = toUnixTimestamp(form.eventDate)

  if (deadlineTs <= Math.floor(Date.now() / 1000)) {
    return 'Sales deadline must be in the future.'
  }

  if (eventTs <= deadlineTs) {
    return 'Event date must be after sales deadline.'
  }

  return ''
}

export default function CreateEvent() {
  const { account } = useWallet()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    if (!account) {
      setError('Connect your wallet before creating an event.')
      return
    }

    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        ticketPrice: ethToWei(form.ticketPriceEth),
        totalTickets: Number(form.totalTickets),
        salesDeadline: toUnixTimestamp(form.salesDeadline),
        eventTimestamp: toUnixTimestamp(form.eventDate)
      })

      setSuccess('Event created successfully.')
      setForm(initialForm)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-section">
      <h2>Create Event</h2>
      <p className="page-subtitle">Publish a new event and start selling tickets in ETH.</p>

      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />
      <ErrorMessage message={error} />

      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Title
          <input name="title" value={form.title} onChange={onChange} disabled={loading} />
        </label>

        <label>
          Description
          <textarea name="description" value={form.description} onChange={onChange} rows={4} disabled={loading} />
        </label>

        <label>
          Image URL
          <input name="imageUrl" type="url" value={form.imageUrl} onChange={onChange} disabled={loading} />
        </label>

        <label>
          Ticket Price (ETH)
          <input
            name="ticketPriceEth"
            type="number"
            min="0"
            step="0.0001"
            value={form.ticketPriceEth}
            onChange={onChange}
            disabled={loading}
          />
        </label>

        <label>
          Total Tickets
          <input
            name="totalTickets"
            type="number"
            min="1"
            value={form.totalTickets}
            onChange={onChange}
            disabled={loading}
          />
        </label>

        <label>
          Sales Deadline
          <input
            name="salesDeadline"
            type="datetime-local"
            value={form.salesDeadline}
            onChange={onChange}
            disabled={loading}
          />
        </label>

        <label>
          Event Date
          <input
            name="eventDate"
            type="datetime-local"
            value={form.eventDate}
            onChange={onChange}
            disabled={loading}
          />
        </label>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating Event...' : 'Create Event'}
        </button>
      </form>
    </section>
  )
}
