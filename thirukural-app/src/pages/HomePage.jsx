import { useNavigate } from 'react-router-dom'
import indexData from '../data/index.json'
import './HomePage.css'

const PAL_INFO = {
  'அறத்துப்பால்': {
    en: 'Virtue',
    desc: 'அறம் — நீதி, ஒழுக்கம், இல்லறம், துறவறம் பற்றிய 38 அதிகாரங்கள்',
    color: 'pal-virtue',
    symbol: 'அ',
  },
  'பொருட்பால்': {
    en: 'Wealth',
    desc: 'பொருள் — அரசியல், அமைச்சு, படை, நட்பு பற்றிய 70 அதிகாரங்கள்',
    color: 'pal-wealth',
    symbol: 'பொ',
  },
  'காமத்துப்பால்': {
    en: 'Love',
    desc: 'காமம் — களவு, கற்பு, காதல் பற்றிய 25 அதிகாரங்கள்',
    color: 'pal-love',
    symbol: 'கா',
  },
}

export default function HomePage() {
  const navigate = useNavigate()

  const grouped = {}
  for (const a of indexData) {
    if (!grouped[a.pal]) grouped[a.pal] = []
    grouped[a.pal].push(a)
  }

  return (
    <div className="home-page">

      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-shimmer-bar" />
        <div className="hero-ornament">॥</div>
        <h1 className="hero-title">திருக்குறள்</h1>
        <p className="hero-subtitle">பரிமேலழகர் உரை</p>
        <p className="hero-desc">
          திருவள்ளுவர் இயற்றிய 1330 குறள்கள் — முப்பால், 133 அதிகாரங்கள்
        </p>
        <div className="hero-stats">
          <div className="stat">
            <span>133</span>
            <label>அதிகாரங்கள்</label>
          </div>
          <div className="stat-div" />
          <div className="stat">
            <span>1330</span>
            <label>குறள்கள்</label>
          </div>
          <div className="stat-div" />
          <div className="stat">
            <span>3</span>
            <label>பால்கள்</label>
          </div>
        </div>
      </div>

      {/* ── Opening kural ── */}
      <div className="opening-kural">
        <div className="opening-kural-label">திருக்குறள் — முதல் குறள்</div>
        <div className="kural-verse">
          அகர முதல வெழுத்தெல்லாம் ஆதி<br />
          பகவன் முதற்றே உலகு.
        </div>
        <div className="kural-num">குறள் 1 — கடவுள் வாழ்த்து</div>
      </div>

      {/* ── Section heading ── */}
      <div className="section-heading">
        <span className="section-heading-line" />
        <span className="section-heading-text">முப்பால் — மூன்று பிரிவுகள்</span>
        <span className="section-heading-line" />
      </div>

      {/* ── Pal cards ── */}
      <div className="pal-cards">
        {['அறத்துப்பால்', 'பொருட்பால்', 'காமத்துப்பால்'].map(pal => {
          const info = PAL_INFO[pal]
          const aths = grouped[pal] || []
          return (
            <div key={pal} className={`pal-card ${info.color}`}>
              <div className="pal-card-accent" />
              <div className="pal-card-inner">
                <div className="pal-card-symbol">{info.symbol}</div>
                <div className="pal-card-body">
                  <h2 className="pal-card-title">{pal}</h2>
                  <p className="pal-card-en">{info.en}</p>
                  <p className="pal-card-desc">{info.desc}</p>
                  <div className="pal-card-aths">
                    {aths.slice(0, 6).map(a => (
                      <button
                        key={a.athigaramNumber}
                        className="mini-ath-btn"
                        onClick={() => navigate(`/athigaram/${a.athigaramNumber}`)}
                      >
                        {a.athigaramNumber}. {a.athigaramTitle}
                      </button>
                    ))}
                    {aths.length > 6 && (
                      <button
                        className="mini-ath-btn see-more"
                        onClick={() => navigate(`/athigaram/${aths[6].athigaramNumber}`)}
                      >
                        மேலும் {aths.length - 6} அதிகாரங்கள் →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
