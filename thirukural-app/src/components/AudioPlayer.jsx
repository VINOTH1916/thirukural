import { useRef, useState, useEffect, useCallback } from 'react'
import './AudioPlayer.css'

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioPlayer({ src, title }) {
  const audioRef = useRef(null)
  const progressRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1.0)
  const [volume, setVolume] = useState(1.0)
  const [muted, setMuted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false)

  // Reset when src changes
  useEffect(() => {
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setError(false)
    setLoading(false)
  }, [src])

  // Sync speed to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed
  }, [speed])

  // Sync volume/mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      audioRef.current.muted = muted
    }
  }, [volume, muted])

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      setLoading(true)
      audio.play().then(() => {
        setPlaying(true)
        setLoading(false)
      }).catch(() => {
        setError(true)
        setLoading(false)
      })
    }
  }, [playing])

  const skip = useCallback((seconds) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds))
  }, [duration])

  const handleProgressClick = (e) => {
    const audio = audioRef.current
    const bar = progressRef.current
    if (!audio || !bar || !duration) return
    const rect = bar.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = Math.max(0, Math.min(duration, ratio * duration))
  }

  const handleProgressDrag = (e) => {
    if (e.buttons !== 1) return
    handleProgressClick(e)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Close speed menu on outside click
  useEffect(() => {
    if (!speedMenuOpen) return
    const close = () => setSpeedMenuOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [speedMenuOpen])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.code === 'Space') { e.preventDefault(); handlePlayPause() }
      if (e.code === 'ArrowLeft') skip(-10)
      if (e.code === 'ArrowRight') skip(10)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handlePlayPause, skip])

  if (!src) return null

  return (
    <div className="audio-player">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={`/audio/${src}`}
        preload="metadata"
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onEnded={() => setPlaying(false)}
        onError={() => { setError(true); setLoading(false) }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
      />

      {/* Title */}
      {title && <div className="player-title">{title}</div>}

      {/* Progress bar */}
      <div className="progress-wrap">
        <span className="time-label">{formatTime(currentTime)}</span>
        <div
          className="progress-bar"
          ref={progressRef}
          onClick={handleProgressClick}
          onMouseMove={handleProgressDrag}
        >
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <div className="progress-thumb" style={{ left: `${progress}%` }} />
          </div>
        </div>
        <span className="time-label">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="player-controls">

        {/* Volume */}
        <div className="volume-group">
          <button
            className="ctrl-btn"
            onClick={() => setMuted(m => !m)}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
          </button>
          <input
            type="range"
            className="volume-slider"
            min={0} max={1} step={0.05}
            value={muted ? 0 : volume}
            onChange={e => {
              setVolume(parseFloat(e.target.value))
              if (parseFloat(e.target.value) > 0) setMuted(false)
            }}
          />
        </div>

        {/* Playback controls */}
        <div className="playback-group">
          {/* Skip back 10s */}
          <button
            className="ctrl-btn skip-btn"
            onClick={() => skip(-10)}
            title="10 seconds back (←)"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              <text x="12" y="14.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="currentColor">10</text>
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            className={`play-btn ${loading ? 'loading' : ''}`}
            onClick={handlePlayPause}
            disabled={error}
            title="Play/Pause (Space)"
          >
            {loading ? (
              <span className="spinner" />
            ) : error ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            ) : playing ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Skip forward 10s */}
          <button
            className="ctrl-btn skip-btn"
            onClick={() => skip(10)}
            title="10 seconds forward (→)"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
              <text x="12" y="14.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="currentColor">10</text>
            </svg>
          </button>
        </div>

        {/* Speed control */}
        <div
          className="speed-group"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="speed-btn"
            onClick={() => setSpeedMenuOpen(o => !o)}
            title="Playback speed"
          >
            {speed === 1.0 ? '1×' : `${speed}×`}
          </button>
          {speedMenuOpen && (
            <div className="speed-menu">
              <div className="speed-menu-heading">வேகம்</div>
              {SPEEDS.map(s => (
                <button
                  key={s}
                  className={`speed-item ${speed === s ? 'active' : ''}`}
                  onClick={() => { setSpeed(s); setSpeedMenuOpen(false) }}
                >
                  {s === 1.0 ? '1× Normal' : `${s}×`}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {error && (
        <div className="player-error">
          ஆடியோ கோப்பு கிடைக்கவில்லை — audio file not found
        </div>
      )}
    </div>
  )
}
