import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, Suspense } from 'react'
import AudioPlayer from '../components/AudioPlayer'
import indexData from '../data/index.json'
import './AthigaramPage.css'

export default function AthigaramPage() {
  const { number } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedKurals, setExpandedKurals] = useState({})
  const [showModern, setShowModern] = useState(true)

  useEffect(() => {
    setLoading(true)
    setData(null)
    setExpandedKurals({})
    const num = parseInt(number, 10)
    if (isNaN(num) || num < 1 || num > 133) {
      navigate('/', { replace: true })
      return
    }
    import(`../data/athigaram_${String(num).padStart(3, '0')}.json`)
      .then(mod => {
        setData(mod.default)
        setLoading(false)
        window.scrollTo(0, 0)
      })
      .catch(() => setLoading(false))
  }, [number, navigate])

  const toggleKural = (idx) =>
    setExpandedKurals(prev => ({ ...prev, [idx]: !prev[idx] }))

  const expandAll = () => {
    if (!data) return
    const all = {}
    data.kurals.forEach((_, i) => { all[i] = true })
    setExpandedKurals(all)
  }
  const collapseAll = () => setExpandedKurals({})

  const num = parseInt(number, 10)
  const prevAth = indexData.find(a => a.athigaramNumber === num - 1)
  const nextAth = indexData.find(a => a.athigaramNumber === num + 1)

  if (loading) {
    return (
      <div className="ath-page loading-state">
        <div className="loader-wrap">
          <div className="loader-ring" />
          <p>ஏற்றுகிறது…</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="ath-page error-state">
        <p>அதிகாரம் கிடைக்கவில்லை</p>
        <button onClick={() => navigate('/')}>முகப்புக்கு செல்</button>
      </div>
    )
  }

  const allExpanded =
    data.kurals.length > 0 && data.kurals.every((_, i) => expandedKurals[i])

  return (
    <div className="ath-page">

      {/* ── Header ── */}
      <div className="ath-header">
        <div className="ath-meta">
          <span className="ath-pal">{data.pal}</span>
          {data.iyal && <span className="ath-sep">›</span>}
          {data.iyal && <span className="ath-iyal">{data.iyal}</span>}
        </div>
        <h1 className="ath-title">
          <span className="ath-num-badge">{data.athigaramNumber}</span>
          {data.athigaramTitle}
        </h1>
        <p className="ath-kural-range">
          குறள்கள் {(data.athigaramNumber - 1) * 10 + 1} – {data.athigaramNumber * 10}
        </p>
      </div>

      {/* ── Audio Player ── */}
      <AudioPlayer
        src={data.audioFile}
        sources={data.audioFiles}
        title={`${data.athigaramNumber}. ${data.athigaramTitle}`}
      />

      {/* ── Intro ── */}
      {data.intro && (
        <div className="ath-intro">
          <h2 className="section-label">அதிகார முன்னுரை</h2>
          <p className="intro-text">{data.intro}</p>
        </div>
      )}

      {/* ── Kural controls ── */}
      <div className="kural-controls">
        <div className="toggle-group">
          <span className="toggle-label">நவீன தமிழ்</span>
          <button
            className={`toggle-btn ${showModern ? 'on' : 'off'}`}
            onClick={() => setShowModern(m => !m)}
            aria-label="Toggle modern Tamil"
          >
            <span className="toggle-thumb" />
          </button>
        </div>
        <div className="expand-btns">
          <button onClick={allExpanded ? collapseAll : expandAll}>
            {allExpanded ? '▲ மடக்கு அனைத்தும்' : '▼ விரி அனைத்தும்'}
          </button>
        </div>
      </div>

      {/* ── Kurals ── */}
      <div className="kurals-list">
        {data.kurals.map((kural, idx) => {
          const isOpen = !!expandedKurals[idx]
          const kuralNum = kural.kuralNumber || (num - 1) * 10 + idx + 1
          return (
            <div key={kuralNum} className={`kural-card ${isOpen ? 'open' : ''}`}>

              {/* Header row — always visible */}
              <button
                className="kural-header"
                onClick={() => toggleKural(idx)}
                aria-expanded={isOpen}
              >
                <span className="kural-badge">{kuralNum}</span>
                <div className="kural-verse-preview">
                  {kural.verse.split('\n')[0]}
                </div>
                <span className="kural-chevron">{isOpen ? '▲' : '▼'}</span>
              </button>

              {/* Expanded body */}
              {isOpen && (
                <div className="kural-body">

                  {/* Original verse */}
                  <div className="kural-section verse-section">
                    <h3 className="section-label">குறள்</h3>
                    <div className="verse-text">
                      {kural.verse.split('\n').map((line, i) => (
                        <div key={i} className="verse-line">{line}</div>
                      ))}
                    </div>
                  </div>

                  {/* Modern Tamil */}
                  {showModern && kural.modernVerse && (
                    <div className="kural-section modern-section">
                      <h3 className="section-label">நவீன தமிழ்</h3>
                      <div className="modern-text">{kural.modernVerse}</div>
                    </div>
                  )}

                  {/* Meaning — இதன் பொருள் */}
                  {kural.meaning && (
                    <div className="kural-section meaning-section">
                      <h3 className="section-label">இதன் பொருள்</h3>
                      <p className="meaning-text">{kural.meaning}</p>
                    </div>
                  )}

                  {/* Commentary — உரை விளக்கம் */}
                  {kural.commentary && (
                    <div className="kural-section commentary-section">
                      <h3 className="section-label">உரை விளக்கம்</h3>
                      <p className="commentary-text">{kural.commentary}</p>
                    </div>
                  )}

                  {/* Vilakkam — group summary shown after some kurals */}
                  {kural.vilakkam && (
                    <div className="kural-section vilakkam-section">
                      <h3 className="section-label">சிறப்பு விளக்கம்</h3>
                      <p className="vilakkam-text">{kural.vilakkam}</p>
                    </div>
                  )}

                </div>
              )}
            </div>
          )
        })}

        {data.kurals.length === 0 && (
          <div className="no-kurals">
            இந்த அதிகாரத்தில் குறள்கள் கிடைக்கவில்லை
          </div>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <div className="ath-bottom-nav">
        <button
          className="nav-prev"
          onClick={() => navigate(`/athigaram/${num - 1}`)}
          disabled={num <= 1}
          title={prevAth?.athigaramTitle}
        >
          ◀ {prevAth ? `${prevAth.athigaramNumber}. ${prevAth.athigaramTitle}` : ''}
        </button>
        <button className="nav-home" onClick={() => navigate('/')}>
          முகப்பு
        </button>
        <button
          className="nav-next"
          onClick={() => navigate(`/athigaram/${num + 1}`)}
          disabled={num >= 133}
          title={nextAth?.athigaramTitle}
        >
          {nextAth ? `${nextAth.athigaramNumber}. ${nextAth.athigaramTitle}` : ''} ▶
        </button>
      </div>

    </div>
  )
}
