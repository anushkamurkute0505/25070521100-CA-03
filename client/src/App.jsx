import { useMemo, useState } from 'react'
import './App.css'

const categories = [
  'Roads & Potholes',
  'Street Lighting',
  'Water Supply & Leakage',
  'Sanitation & Waste',
  'Drainage & Flooding',
  'Parking & Encroachment',
]

const districts = [
  'Nagpur',
  'Pune',
  'Mumbai Suburban',
  'Nashik',
  'Thane',
  'Aurangabad (Chh. Sambhajinagar)',
  'Kolhapur',
]

const issueStats = [
  { name: 'Roads & Potholes', reported: 3840, resolved: 2760 },
  { name: 'Sanitation & Waste', reported: 2980, resolved: 2410 },
  { name: 'Water Supply', reported: 2380, resolved: 1620 },
  { name: 'Street Lighting', reported: 1620, resolved: 1380 },
  { name: 'Drainage & Flooding', reported: 1080, resolved: 520 },
  { name: 'Encroachment', reported: 580, resolved: 252 },
]

const journey = [
  { number: '01', title: 'Report the issue', text: 'Add the location, category, description and any useful photos.' },
  { number: '02', title: 'Get a clear report', text: 'Review the summary and evidence checklist before you submit.' },
  { number: '03', title: 'Track your ticket', text: 'Keep your reference ID and record updates in one place.' },
  { number: '04', title: 'Record the outcome', text: 'Update the ticket when you receive an acknowledgement or resolution.' },
]

function App() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    severity: 'Medium — urgent',
    city: 'Nagpur',
    ward: '',
    description: '',
  })
  const [files, setFiles] = useState([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [trackId, setTrackId] = useState('')
  const [trackMessage, setTrackMessage] = useState('')
  const [trackSearched, setTrackSearched] = useState(false)

  const reportSummary = useMemo(() => {
    const category = formData.category || 'Category to be confirmed'
    const city = formData.city || 'District to be confirmed'
    const channel = formData.category.includes('Water')
      ? 'Water supply / municipal water department'
      : formData.category.includes('Drainage')
        ? 'Municipal drainage department'
        : formData.category.includes('Street')
          ? 'Municipal street-lighting department'
          : formData.category.includes('Sanitation')
            ? 'Municipal sanitation department'
            : 'Municipal corporation / local civic body'
    return { category, city, channel }
  }, [formData.category, formData.city])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData(previous => ({ ...previous, [name]: value }))
    setMessage('')
  }

  function handleFiles(event) {
    const chosen = Array.from(event.target.files || []).slice(0, 5)
    setFiles(chosen)
  }

  function resetForm() {
    setFormData({
      title: '',
      category: '',
      severity: 'Medium — urgent',
      city: 'Nagpur',
      ward: '',
      description: '',
    })
    setFiles([])
    setMessage('')
    setMessageType('')
    setTicketId('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setMessageType('')
    setIsSubmitting(true)

    try {
      // This uses the existing backend route. Only fields supported by the
      // current server are sent; severity, ward and photos remain prototype UI data.
      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          category: formData.category,
          city: `${formData.city}${formData.ward.trim() ? ` — ${formData.ward.trim()}` : ''}`,
          description: formData.description.trim(),
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not save this report.')

      const generatedId = `CS-MH-${new Date().toISOString().slice(5, 10).replace('-', '')}-${String(result.complaintId).slice(-6).toUpperCase()}`
      setTicketId(generatedId)
      setMessage(`Report saved successfully. Your CivicSnap reference is ${generatedId}.`)
      setMessageType('success')
      setTrackId(generatedId)
      setFormData({
        title: '',
        category: '',
        severity: 'Medium — urgent',
        city: 'Nagpur',
        ward: '',
        description: '',
      })
      setFiles([])
    } catch (error) {
      console.error('Report submission failed:', error)
      setMessage(error.message || 'Could not submit the report. Check that the backend is running.')
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleTrack(event) {
    event.preventDefault()
    setTrackSearched(true)
    if (ticketId && trackId.trim().toLowerCase() === ticketId.toLowerCase()) {
      setTrackMessage('This ticket was created in the current session. Its report is recorded; official department updates are not connected yet.')
    } else {
      setTrackMessage('This prototype can show the reference created in this browser session only. Full tracking needs a backend ticket-lookup endpoint.')
    }
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="CivicSnap India home">
          <span className="brand-mark">C</span>
          <span>CivicSnap <b>India</b><small>COMMUNITY · ACCOUNTABILITY</small></span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#insights">Insights</a>
          <a href="#journey">How it works</a>
          <a href="#track">Track tickets</a>
        </nav>
        <a className="button button-primary nav-cta" href="#report">＋ Report an issue</a>
      </header>

      <main id="home">
        <section className="hero section-wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> MAHARASHTRA CIVIC REPORTING PILOT</div>
            <h1>See it.<br />Report it.<br /><em>Track it.</em></h1>
            <p className="hero-intro">A clearer way to document neighbourhood issues, prepare a structured report, and keep every ticket reference in one place.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#report">Report an issue <span>↗</span></a>
              <a className="button button-light" href="#track">Track a ticket <span>→</span></a>
            </div>
            <div className="hero-note"><span>✳</span> Built for community visibility. Not an official government service.</div>
          </div>
          <div className="hero-art" aria-label="Civic reporting dashboard illustration">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="city-card">
              <div className="city-sky"><span className="sun" /><span className="cloud cloud-one" /><span className="cloud cloud-two" /></div>
              <div className="building building-one" /><div className="building building-two" /><div className="building building-three" /><div className="building building-four" />
              <div className="street" />
              <div className="map-pin">⌖</div>
            </div>
            <div className="floating-stat stat-top"><span className="mini-icon">↗</span><div><strong>One clear record</strong><small>Details in one place</small></div></div>
            <div className="floating-stat stat-bottom"><span className="mini-icon mint">✓</span><div><strong>Ticket reference</strong><small>Ready to track</small></div></div>
            <div className="art-label">YOUR CITY, YOUR VOICE</div>
          </div>
        </section>

        <section className="metrics-strip">
          <div className="metric"><strong>14</strong><span>Districts in the<br />pilot concept</span></div>
          <div className="metric"><strong>87<span>%</span></strong><span>Correct channel<br />identified first time</span></div>
          <div className="metric"><strong>63<span>%</span></strong><span>Closed within SLA<br />window</span></div>
          <div className="metric"><strong>99.2<span>%</span></strong><span>Reports with GPS<br />tag</span></div>
          <p className="metric-disclaimer">Illustrative reference figures from the supplied design — not live verified government data.</p>
        </section>

        <section className="insights section-wrap" id="insights">
          <div className="section-intro">
            <div className="eyebrow">THE BIGGER PICTURE</div>
            <h2>Make local issues<br /><em>harder to ignore.</em></h2>
            <p>Use clear categories and consistent records to understand what communities are reporting. Figures below are sample design data and are not connected to a live civic database.</p>
            <div className="insight-pills"><span>● Reported</span><span>● Resolved</span></div>
          </div>
          <div className="chart-card">
            <div className="chart-heading"><div><span className="overline">REPORTED CATEGORY VOLUME</span><h3>Top civic issues · Maharashtra pilot</h3></div><span className="chart-tag">SAMPLE DATA</span></div>
            <div className="chart-legend"><span><i className="legend-reported" /> Reported</span><span><i className="legend-resolved" /> Resolved</span></div>
            <div className="chart-rows">
              {issueStats.map(item => {
                const max = 3840
                return <div className="chart-row" key={item.name}>
                  <div className="chart-label"><span>{item.name}</span><b>{item.reported.toLocaleString('en-IN')} <small>/ {item.resolved.toLocaleString('en-IN')}</small></b></div>
                  <div className="bar-track"><div className="bar-reported" style={{ width: `${item.reported / max * 100}%` }} /><div className="bar-resolved" style={{ width: `${item.resolved / max * 100}%` }} /></div>
                </div>
              })}
            </div>
            <div className="chart-foot"><span><strong>21</strong><small>Departments mapped</small></span><span><strong>6</strong><small>Issue categories shown</small></span><span><strong>01</strong><small>Community-first prototype</small></span></div>
          </div>
        </section>

        <section className="journey-section" id="journey">
          <div className="section-wrap">
            <div className="journey-heading">
              <div><div className="eyebrow">THE JOURNEY</div><h2>Four clear steps from a broken street to a <em>closed ticket.</em></h2></div>
              <p>Keep the details, timestamps and reference together. Accountability should be easy to follow — not dependent on memory.</p>
            </div>
            <div className="journey-grid">
              {journey.map(step => <article className="journey-card" key={step.number}>
                <span className="step-number">{step.number}</span><div className="step-line" /><h3>{step.title}</h3><p>{step.text}</p>
              </article>)}
            </div>
          </div>
        </section>

        <section className="report-section" id="report">
          <div className="section-wrap report-layout">
            <div className="report-copy">
              <div className="eyebrow eyebrow-light">REPORT BUILDER</div>
              <h2>File a structured report in <em>under a minute.</em></h2>
              <p>Fill in the essentials and CivicSnap prepares a clear summary with an evidence checklist, locality reference and a suggested complaint channel.</p>
              <div className="privacy-note"><span>⌑</span><div><strong>Your report, your choice</strong><p>This prototype saves the complaint to your local project database. It does not automatically submit to a government system.</p></div></div>
              <div className="report-checks"><span>✓ Clear issue details</span><span>✓ Evidence checklist</span><span>✓ Suggested channel</span></div>
            </div>
            <div className="form-card">
              <div className="form-card-head"><div><span className="overline">NEW CIVIC REPORT</span><h3>Tell us what needs attention</h3></div><span className="form-step">01 / 01</span></div>
              <form onSubmit={handleSubmit}>
                <label htmlFor="title">Issue title <span>*</span></label>
                <input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Large pothole near my street" required maxLength={120} />

                <div className="field-grid">
                  <div><label htmlFor="category">Category <span>*</span></label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                      <option value="">Choose a category</option>{categories.map(category => <option key={category}>{category}</option>)}
                    </select>
                  </div>
                  <div><label htmlFor="severity">Severity</label>
                    <select id="severity" name="severity" value={formData.severity} onChange={handleChange}>
                      <option>High — safety risk</option><option>Medium — urgent</option><option>Low — routine</option>
                    </select>
                  </div>
                </div>

                <div className="field-grid">
                  <div><label htmlFor="city">City / District <span>*</span></label>
                    <select id="city" name="city" value={formData.city} onChange={handleChange} required>
                      {districts.map(district => <option key={district}>{district}</option>)}
                    </select>
                  </div>
                  <div><label htmlFor="ward">Ward / Locality</label>
                    <input id="ward" name="ward" value={formData.ward} onChange={handleChange} placeholder="e.g. Ward 12, Dharampeth" />
                  </div>
                </div>

                <label htmlFor="description">Description <span>*</span></label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe what happened and the nearest landmark..." rows="4" required maxLength={1500} />

                <label>Evidence <small className="label-note">Optional · up to 5 images</small></label>
                <label className="upload-zone" htmlFor="evidence">
                  <span className="upload-icon">↑</span><strong>Drop photos here or click to browse</strong><small>JPG / PNG · up to 5 files</small>
                  <input id="evidence" type="file" accept="image/png,image/jpeg" multiple onChange={handleFiles} />
                </label>
                {files.length > 0 && <div className="file-list">{files.map(file => <span key={`${file.name}-${file.size}`}>▧ {file.name}</span>)}</div>}

                <div className="summary-preview">
                  <span className="overline">REPORT PREVIEW</span>
                  <p><b>Category:</b> {reportSummary.category}</p><p><b>Area:</b> {reportSummary.city}{formData.ward ? ` · ${formData.ward}` : ''}</p><p><b>Suggested channel:</b> {reportSummary.channel}</p>
                  <small>Suggestion only. Confirm the correct local authority before making an official submission.</small>
                </div>

                <button className="button button-primary submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving report…' : 'Generate report & save ticket'} <span>↗</span></button>
                <button className="reset-button" type="button" onClick={resetForm}>Reset form</button>
                {message && <div className={`form-message ${messageType}`} role="status">{message}{ticketId && messageType === 'success' && <p>Save this reference to track it in this session: <strong>{ticketId}</strong></p>}</div>}
                <p className="form-footnote">⌑ Data is sent to your CivicSnap project backend. Photos are selected locally and are not uploaded by this prototype.</p>
              </form>
            </div>
          </div>
        </section>

        <section className="tracking-section section-wrap" id="track">
          <div className="tracking-copy"><div className="eyebrow">TRANSPARENT TRACKING</div><h2>Know where your complaint <em>stands.</em></h2><p>Enter a CivicSnap reference to view the prototype tracking panel. Official department status updates are not connected yet.</p>
            <div className="tracking-note"><span>◎</span><div><strong>Keep your reference ID safe</strong><small>A saved report ID is not the same as an official government complaint number.</small></div></div>
          </div>
          <div className="track-card">
            <span className="overline">TRACK A TICKET</span><h3>Find your report</h3>
            <form onSubmit={handleTrack} className="track-form"><label htmlFor="trackId">CivicSnap ticket reference</label><input id="trackId" value={trackId} onChange={e => { setTrackId(e.target.value); setTrackSearched(false) }} placeholder="e.g. CS-MH-1027-ABC123" required /><button className="button button-dark" type="submit">Track ticket →</button></form>
            {trackSearched && <div className="track-result" role="status"><span className="result-dot" /><div><strong>Prototype tracking result</strong><p>{trackMessage}</p><div className="progress-steps"><span className="active">Reported</span><i /><span>Reviewed</span><i /><span>Resolved</span></div></div></div>}
          </div>
        </section>
      </main>

      <footer className="footer"><a className="brand" href="#home"><span className="brand-mark">C</span><span>CivicSnap <b>India</b><small>COMMUNITY · ACCOUNTABILITY</small></span></a><p>Building better neighbourhoods, together.</p><span>Student project prototype · Maharashtra, India</span></footer>
    </div>
  )
}

export default App
