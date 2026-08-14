import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import indexData from '../data/index.json'
import { useTheme } from '../hooks/useTheme'
import './Layout.css'

const PAL_ORDER = ['அறத்துப்பால்', 'பொருட்பால்', 'காமத்துப்பால்']
const PAL_EN = {
  'அறத்துப்பால்': 'Virtue',
  'பொருட்பால்': 'Wealth',
  'காமத்துப்பால்': 'Love',
}

const THEME_META = {
  satva:  { label: 'சத்வ',  sub: 'Satva',  desc: 'Light' },
  rajas:  { label: 'ரஜஸ்', sub: 'Rajas',  desc: 'Dusk'  },
  tamas:  { label: 'தமஸ்', sub: 'Tamas',  desc: 'Dark'  },
}

function buildTree(data) {
  const tree = {}
  for (const pal of PAL_ORDER) tree[pal] = {}
  for (const a of data) {
    const pal = a.pal
    const iyal = a.iyal || 'பிற'
    if (!tree[pal][iyal]) tree[pal][iyal] = []
    tree[pal][iyal].push(a)
  }
  return tree
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedPals, setExpandedPals] = useState({ 'அறத்துப்பால்': true })
  const [expandedIyals, setExpandedIyals] = useState({})
  const [search, setSearch] = useState('')
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const { theme, pickTheme } = useTheme()

  const tree = buildTree(indexData)

  const match = location.pathname.match(/athigaram\/(\d+)/)
  const currentNum = match ? parseInt(match[1]) : null

  // Auto-expand sidebar to show the active athigaram
  useEffect(() => {
    if (!currentNum) return
    const current = indexData.find(a => a.athigaramNumber === currentNum)
    if (current) {
      setExpandedPals(p => ({ ...p, [current.pal]: true }))
      setExpandedIyals(p => ({ ...p, [current.pal + '|' + current.iyal]: true }))
    }
  }, [currentNum])

  // Close theme menu on outside click
  useEffect(() => {
    if (!themeMenuOpen) return
    const close = () => setThemeMenuOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [themeMenuOpen])

  const togglePal  = (pal) => setExpandedPals(p => ({ ...p, [pal]: !p[pal] }))
  const toggleIyal = (key) => setExpandedIyals(p => ({ ...p, [key]: !p[key] }))

  const filtered = search.trim()
    ? indexData.filter(a =>
        a.athigaramTitle.includes(search) ||
        String(a.athigaramNumber).includes(search)
      )
    : null

  return (
    <div className="app-shell">

      {/* ── Topbar ── */}
      <header className="topbar">

        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="Toggle sidebar"
        >
          <span /><span /><span />
        </button>

        <div className="topbar-title" onClick={() => navigate('/')}>
          <span className="topbar-tamil">திருக்குறள்</span>
          <span className="topbar-sub">பரிமேலழகர் உரை</span>
        </div>

        {/* Athigaram prev/next — only on athigaram pages */}
        {currentNum && (
          <div className="topbar-nav">
            <button
              disabled={currentNum <= 1}
              onClick={() => navigate(`/athigaram/${currentNum - 1}`)}
            >
              ◀ {currentNum - 1}
            </button>
            <span className="topbar-current">{currentNum} / 133</span>
            <button
              disabled={currentNum >= 133}
              onClick={() => navigate(`/athigaram/${currentNum + 1}`)}
            >
              {currentNum + 1} ▶
            </button>
          </div>
        )}

        {/* ── Theme switcher ── */}
        <div
          className="theme-switcher"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="theme-btn"
            onClick={() => setThemeMenuOpen(o => !o)}
            title="Change theme"
          >
            <span className="theme-dot" data-theme-dot={theme} />
            <span className="theme-btn-label">{THEME_META[theme]?.sub}</span>
            <span className="theme-btn-arrow">{themeMenuOpen ? '▲' : '▼'}</span>
          </button>

          {themeMenuOpen && (
            <div className="theme-menu">
              <div className="theme-menu-heading">தீம் தேர்வு</div>
              {Object.entries(THEME_META).map(([key, meta]) => (
                <button
                  key={key}
                  className={`theme-option ${theme === key ? 'active' : ''}`}
                  onClick={() => { pickTheme(key); setThemeMenuOpen(false) }}
                >
                  <span className="theme-dot" data-theme-dot={key} />
                  <span className="theme-option-text">
                    <span className="theme-option-ta">{meta.label}</span>
                    <span className="theme-option-sub">{meta.sub} · {meta.desc}</span>
                  </span>
                  {theme === key && <span className="theme-check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

      </header>

      <div className="body-wrap">

        {/* ── Sidebar ── */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-search">
            <input
              type="search"
              placeholder="தேடல்…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <nav className="sidebar-nav">
            {filtered ? (
              <ul className="ath-list">
                {filtered.map(a => (
                  <li key={a.athigaramNumber}>
                    <button
                      className={`ath-btn ${currentNum === a.athigaramNumber ? 'active' : ''}`}
                      onClick={() => { navigate(`/athigaram/${a.athigaramNumber}`); setSearch('') }}
                    >
                      <span className="ath-num">{a.athigaramNumber}</span>
                      <span className="ath-name">{a.athigaramTitle}</span>
                    </button>
                  </li>
                ))}
                {filtered.length === 0 && (
                  <li className="no-results">கண்டுபிடிக்கவில்லை</li>
                )}
              </ul>
            ) : (
              PAL_ORDER.map(pal => (
                <div key={pal} className="pal-group">
                  <button
                    className={`pal-btn ${expandedPals[pal] ? 'expanded' : ''}`}
                    onClick={() => togglePal(pal)}
                  >
                    <span className="pal-arrow">{expandedPals[pal] ? '▾' : '▸'}</span>
                    <span className="pal-name">{pal}</span>
                    <span className="pal-en">{PAL_EN[pal]}</span>
                  </button>

                  {expandedPals[pal] && (
                    <div className="iyal-list">
                      {Object.entries(tree[pal] || {}).map(([iyal, athigarams]) => {
                        const key = pal + '|' + iyal
                        const isOpen = expandedIyals[key] !== false
                        return (
                          <div key={iyal} className="iyal-group">
                            <button
                              className={`iyal-btn ${isOpen ? 'expanded' : ''}`}
                              onClick={() => toggleIyal(key)}
                            >
                              <span>{isOpen ? '▾' : '▸'}</span>
                              <span>{iyal}</span>
                            </button>
                            {isOpen && (
                              <ul className="ath-list">
                                {athigarams.map(a => (
                                  <li key={a.athigaramNumber}>
                                    <button
                                      className={`ath-btn ${currentNum === a.athigaramNumber ? 'active' : ''}`}
                                      onClick={() => navigate(`/athigaram/${a.athigaramNumber}`)}
                                    >
                                      <span className="ath-num">{a.athigaramNumber}</span>
                                      <span className="ath-name">{a.athigaramTitle}</span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="main-content">
          <Outlet />
        </main>

      </div>
    </div>
  )
}
