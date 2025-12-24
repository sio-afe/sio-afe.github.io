/**
 * ShareableCard Component
 * Creates beautiful glassmorphism cards for sharing to social media
 */

import React, { useRef, useState } from 'react';
import { toBlob, toPng } from 'html-to-image';
import '../../styles/ShareableCard.css';

// Schedule work "soon after mount".
// We always schedule a timeout so this also works in test envs where rAF exists but doesn't advance.
const scheduleNextPaint = (fn) => {
  let called = false;
  const wrapped = () => {
    if (called) return;
    called = true;
    fn();
  };

  const timeoutId = setTimeout(wrapped, 0);
  let rafId = null;
  if (typeof requestAnimationFrame === 'function') {
    rafId = requestAnimationFrame(wrapped);
  }

  return () => {
    clearTimeout(timeoutId);
    if (rafId != null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(rafId);
    }
  };
};

// Helper function to convert base64 to blob without fetch (avoids CSP issues)
const dataURLtoBlob = (dataURL) => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Cross-modal cache so reopening the same card is instant.
// key -> { blob, objectUrl, createdAt }
const SNAPSHOT_CACHE = new Map();
const MAX_CACHE_ITEMS = 40;

const cacheGet = (key) => {
  const hit = SNAPSHOT_CACHE.get(key);
  if (!hit) return null;
  // Touch for LRU-ish behavior
  SNAPSHOT_CACHE.delete(key);
  SNAPSHOT_CACHE.set(key, hit);
  return hit;
};

const cacheSet = (key, blob) => {
  try {
    const objectUrl = URL.createObjectURL(blob);
    SNAPSHOT_CACHE.set(key, { blob, objectUrl, createdAt: Date.now() });
    while (SNAPSHOT_CACHE.size > MAX_CACHE_ITEMS) {
      const firstKey = SNAPSHOT_CACHE.keys().next().value;
      const first = SNAPSHOT_CACHE.get(firstKey);
      if (first?.objectUrl) URL.revokeObjectURL(first.objectUrl);
      SNAPSHOT_CACHE.delete(firstKey);
    }
    return { blob, objectUrl };
  } catch {
    return { blob, objectUrl: null };
  }
};

// html-to-image snapshots can miss <img> content if we run before images/fonts are ready.
// We wait for:
// - all images in the node to load/decode (or timeout)
// - document fonts (if supported)
const isTestEnv = (() => {
  try {
    // Vitest/Jest typically set NODE_ENV=test
    // eslint-disable-next-line no-undef
    return typeof process !== 'undefined' && process?.env?.NODE_ENV === 'test';
  } catch {
    return false;
  }
})();

const waitForCardAssets = async (node, { timeoutMs = isTestEnv ? 25 : 2500 } = {}) => {
  if (!node) return;

  const imgs = Array.from(node.querySelectorAll('img'));
  if (isTestEnv) return; // tests don't load network images; don't block generation
  const waitImg = (img) =>
    new Promise((resolve) => {
      const done = () => {
        cleanup();
        resolve();
      };
      const onLoad = () => done();
      const onError = () => done();
      const cleanup = () => {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
      };

      // If already loaded successfully, we're good.
      if (img.complete && img.naturalWidth > 0) return resolve();

      // Prefer decode() when available (more reliable than load event in some cases).
      if (typeof img.decode === 'function') {
        img.decode().then(resolve).catch(resolve);
        return;
      }

      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
    });

  const waitFonts =
    typeof document !== 'undefined' && document.fonts?.ready
      ? document.fonts.ready.catch(() => undefined)
      : Promise.resolve();

  await Promise.race([
    Promise.all([waitFonts, ...imgs.map(waitImg)]),
    new Promise((resolve) => setTimeout(resolve, timeoutMs))
  ]);

  // Give the browser one more paint after assets resolve.
  await new Promise((resolve) => setTimeout(resolve, 0));
};

const getDefaultPixelRatio = () => {
  try {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    // 2 is a sweet spot: sharp enough for sharing, much faster than 3.
    return Math.min(2, Math.max(1, dpr));
  } catch {
    return 2;
  }
};

const makeCacheKey = (type, payload) => {
  try {
    return `${type}:${JSON.stringify(payload)}`;
  } catch {
    return `${type}:${String(payload?.id || '')}`;
  }
};

const formatDateUpper = (dateString) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();
};

const getMatchTypeLabel = (matchTypeRaw) => {
  const matchType = matchTypeRaw?.toLowerCase();
  if (!matchType || matchType === 'group') return 'GROUP STAGE';
  if (matchType === 'quarter-final') return 'QUARTER FINAL';
  if (matchType === 'semi-final') return 'SEMI FINAL';
  if (matchType === 'final') return 'FINAL';
  if (matchType === 'third-place') return '3RD PLACE';
  return matchType.toUpperCase();
};

const getMatchCacheKey = (match) =>
  makeCacheKey('match', {
    id: match?.id,
    status: match?.status,
    hs: match?.home_score,
    as: match?.away_score,
    ht: match?.home_team?.name,
    at: match?.away_team?.name,
    hcrest: match?.home_team?.crest_url,
    acrest: match?.away_team?.crest_url,
    date: match?.match_date,
    type: match?.match_type
  });

const getTeamCacheKey = (team, stats) =>
  makeCacheKey('team', {
    id: team?.id,
    name: team?.name,
    crest: team?.crest_url,
    primary: team?.primary_color,
    captain: team?.captain,
    stats
  });

const getStatsCacheKey = (statType, items) =>
  makeCacheKey('stats', {
    statType,
    items: (items || []).slice(0, 3).map((i) => ({
      id: i?.id,
      name: i?.name,
      value: i?.value,
      image: i?.image,
      crest_url: i?.crest_url
    }))
  });

const generateCardImage = async ({
  node,
  cacheKey,
  backgroundColor = '#0a0e1a',
  pixelRatio
}) => {
  if (!node) return null;

  const cached = cacheKey ? cacheGet(cacheKey) : null;
  if (cached?.blob) return { blob: cached.blob, objectUrl: cached.objectUrl };

  await waitForCardAssets(node);

  const pr = pixelRatio ?? getDefaultPixelRatio();
  // Prefer toBlob (faster than toPng + base64 parsing, and uses less memory).
  const blob =
    (await toBlob(node, {
      pixelRatio: pr,
      backgroundColor,
      cacheBust: true,
      useCORS: true
    }).catch(() => null)) ||
    null;

  if (blob) {
    const saved = cacheKey ? cacheSet(cacheKey, blob) : { blob, objectUrl: URL.createObjectURL(blob) };
    return saved;
  }

  // Fallback to PNG data URL if toBlob isn't available (older builds).
  const dataUrl = await toPng(node, {
    quality: 1,
    pixelRatio: pr,
    backgroundColor,
    cacheBust: true,
    useCORS: true
  });
  const fallbackBlob = dataURLtoBlob(dataUrl);
  const saved = cacheKey ? cacheSet(cacheKey, fallbackBlob) : { blob: fallbackBlob, objectUrl: null };
  return { ...saved, dataUrl };
};

const getPositionColor = (position) => {
  const pos = position?.toUpperCase();
  if (pos === 'GK') return '#fbbf24';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return '#60a5fa';
  if (['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(pos)) return '#4ade80';
  if (['ST', 'CF', 'LW', 'RW'].includes(pos)) return '#f87171';
  return '#a78bfa';
};

// Instagram SVG Icon Component
const InstagramIcon = ({ size = 18, color = "rgba(255,255,255,0.6)" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={size} 
    height={size}
    fill={color}
    style={{ verticalAlign: 'middle' }}
  >
    <path d="M17.34,5.46h0a1.2,1.2,0,1,0,1.2,1.2A1.2,1.2,0,0,0,17.34,5.46Zm4.6,2.42a7.59,7.59,0,0,0-.46-2.43,4.94,4.94,0,0,0-1.16-1.77,4.7,4.7,0,0,0-1.77-1.15,7.3,7.3,0,0,0-2.43-.47C15.06,2,14.72,2,12,2s-3.06,0-4.12.06a7.3,7.3,0,0,0-2.43.47A4.78,4.78,0,0,0,3.68,3.68,4.7,4.7,0,0,0,2.53,5.45a7.3,7.3,0,0,0-.47,2.43C2,8.94,2,9.28,2,12s0,3.06.06,4.12a7.3,7.3,0,0,0,.47,2.43,4.7,4.7,0,0,0,1.15,1.77,4.78,4.78,0,0,0,1.77,1.15,7.3,7.3,0,0,0,2.43.47C8.94,22,9.28,22,12,22s3.06,0,4.12-.06a7.3,7.3,0,0,0,2.43-.47,4.7,4.7,0,0,0,1.77-1.15,4.85,4.85,0,0,0,1.16-1.77,7.59,7.59,0,0,0,.46-2.43c0-1.06.06-1.4.06-4.12S22,8.94,21.94,7.88ZM20.14,16a5.61,5.61,0,0,1-.34,1.86,3.06,3.06,0,0,1-.75,1.15,3.19,3.19,0,0,1-1.15.75,5.61,5.61,0,0,1-1.86.34c-1,.05-1.37.06-4,.06s-3,0-4-.06A5.73,5.73,0,0,1,6.1,19.8,3.27,3.27,0,0,1,5,19.05a3,3,0,0,1-.74-1.15A5.54,5.54,0,0,1,3.86,16c0-1-.06-1.37-.06-4s0-3,.06-4A5.54,5.54,0,0,1,4.21,6.1,3,3,0,0,1,5,5,3.14,3.14,0,0,1,6.1,4.2,5.73,5.73,0,0,1,8,3.86c1,0,1.37-.06,4-.06s3,0,4,.06a5.61,5.61,0,0,1,1.86.34A3.06,3.06,0,0,1,19.05,5,3.06,3.06,0,0,1,19.8,6.1,5.61,5.61,0,0,1,20.14,8c.05,1,.06,1.37.06,4S20.19,15,20.14,16ZM12,6.87A5.13,5.13,0,1,0,17.14,12,5.12,5.12,0,0,0,12,6.87Zm0,8.46A3.33,3.33,0,1,1,15.33,12,3.33,3.33,0,0,1,12,15.33Z"></path>
  </svg>
);

// Match Share Card
export function MatchShareCard({ match, onClose }) {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [imageData, setImageData] = useState(null);

  const isFinished = match.status === 'completed';
  const isLive = match.status === 'live';

  // Pre-generate image when modal opens
  React.useEffect(() => {
    const generateImage = async () => {
      if (!cardRef.current) return;
      
      try {
        const cacheKey = getMatchCacheKey(match);
        const res = await generateCardImage({ node: cardRef.current, cacheKey });
        if (!res?.blob) throw new Error('Failed to generate image');
        setImageData({ blob: res.blob, url: res.objectUrl || null, dataUrl: res.dataUrl || null });
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    // Use requestAnimationFrame (or a timeout fallback) for generation on next paint
    return scheduleNextPaint(generateImage);
  }, []);

  const downloadImage = () => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.download = `match-${match.home_team?.name}-vs-${match.away_team?.name}.png`;
    link.href = imageData.url || imageData.dataUrl;
    link.click();
  };

  // Native Share - Opens device share sheet directly
  const nativeShare = async () => {
    if (!imageData) return;

    const fileName = `muqawamah-${match.home_team?.name || 'match'}-vs-${match.away_team?.name || 'match'}.png`;
    const file = new File([imageData.blob], fileName, { type: 'image/png' });

    // Check if native sharing with files is supported
    if (navigator.share && navigator.canShare) {
      try {
        const canShareFiles = navigator.canShare({ files: [file] });
        if (canShareFiles) {
          await navigator.share({
            files: [file]
          });
          return;
        }
      } catch (err) {
        // User cancelled or share failed - that's okay
        if (err.name === 'AbortError') return;
      }
    }
    
    // Fallback - download the image
    downloadImage();
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={e => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {/* The Shareable Card */}
        <div className="shareable-card-wrapper">
          <div ref={cardRef} className="shareable-card match-card">
            {/* Background Effects */}
            <div className="card-bg-effects">
              <div className="card-glow glow-1"></div>
              <div className="card-glow glow-2"></div>
            </div>

            {/* Header with Logo */}
            <div className="card-header">
              <img 
                src="/assets/img/muq_invert.png" 
                alt="Muqawamah" 
                className="card-tournament-logo"
                crossOrigin="anonymous"
              />
              <img 
                src="/assets/img/sio-logo-white.png" 
                alt="SIO" 
                className="card-sio-logo"
                crossOrigin="anonymous"
              />
            </div>

            {/* Teams & Score - Horizontal Layout */}
            <div className="card-match-content">
              {/* Home Team */}
              <div className="card-team home">
                <div className="card-team-logo">
                  {match.home_team?.crest_url ? (
                    <img src={match.home_team.crest_url} alt={match.home_team.name} crossOrigin="anonymous" />
                  ) : (
                    <span className="logo-placeholder">{match.home_team?.name?.charAt(0)}</span>
                  )}
                </div>
                <span className="card-team-name">{match.home_team?.name}</span>
              </div>

              {/* Score - Horizontal */}
              <div className="card-score-horizontal">
                {isFinished || isLive ? (
                  <div className="score-row">
                    <span className="score-number">{match.home_score ?? 0}</span>
                    <span className="score-divider">-</span>
                    <span className="score-number">{match.away_score ?? 0}</span>
                  </div>
                ) : (
                  <span className="score-vs">VS</span>
                )}
              </div>

              {/* Away Team */}
              <div className="card-team away">
                <div className="card-team-logo">
                  {match.away_team?.crest_url ? (
                    <img src={match.away_team.crest_url} alt={match.away_team.name} crossOrigin="anonymous" />
                  ) : (
                    <span className="logo-placeholder">{match.away_team?.name?.charAt(0)}</span>
                  )}
                </div>
                <span className="card-team-name">{match.away_team?.name}</span>
              </div>
            </div>

            {/* Status, Date & Match Type */}
            <div className="card-status-section">
              {(isFinished || isLive) && (
                <span className={`card-status ${match.status}`}>
                  {isFinished ? 'FULL TIME' : 'LIVE'}
                </span>
              )}
              <span className="card-date-inline">{formatDateUpper(match.match_date)}</span>
              <span className="card-match-type-text">{getMatchTypeLabel(match.match_type)}</span>
            </div>

            {/* Footer with Instagram */}
            <div className="card-footer">
              <span className="card-instagram">
                <InstagramIcon size={18} color="rgba(255,255,255,0.85)" />
                muqawama2026
              </span>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="share-buttons">
          <h3>Share to</h3>
          <div className="share-btn-grid two-cols">
            <button 
              className="share-btn share-native" 
              onClick={nativeShare}
              disabled={isGenerating}
            >
              <i className="fas fa-share-alt"></i>
              <span>Share</span>
            </button>
            <button 
              className="share-btn download" 
              onClick={downloadImage}
              disabled={isGenerating}
            >
              <i className="fas fa-download"></i>
              <span>Download</span>
            </button>
          </div>
          {isGenerating && (
            <div className="generating-indicator">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Generating image...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Team Share Card
export function TeamShareCard({ team, stats, onClose }) {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [imageData, setImageData] = useState(null);

  // Pre-generate image when modal opens
  React.useEffect(() => {
    const generateImage = async () => {
      if (!cardRef.current) return;
      
      try {
        const cacheKey = getTeamCacheKey(team, stats);
        const res = await generateCardImage({ node: cardRef.current, cacheKey });
        if (!res?.blob) throw new Error('Failed to generate image');
        setImageData({ blob: res.blob, url: res.objectUrl || null, dataUrl: res.dataUrl || null });
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    return scheduleNextPaint(generateImage);
  }, []);

  const downloadImage = () => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.download = `team-${team.name}.png`;
    link.href = imageData.url || imageData.dataUrl;
    link.click();
  };

  // Native Share - Opens device share sheet directly
  const nativeShare = async () => {
    if (!imageData) return;

    const fileName = `muqawamah-${team.name || 'team'}.png`;
    const file = new File([imageData.blob], fileName, { type: 'image/png' });

    // Check if native sharing with files is supported
    if (navigator.share && navigator.canShare) {
      try {
        const canShareFiles = navigator.canShare({ files: [file] });
        if (canShareFiles) {
          await navigator.share({
            files: [file]
          });
          return;
        }
      } catch (err) {
        // User cancelled or share failed - that's okay
        if (err.name === 'AbortError') return;
      }
    }
    
    // Fallback - download the image
    downloadImage();
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={e => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {/* The Shareable Card */}
        <div className="shareable-card-wrapper">
          <div ref={cardRef} className="shareable-card team-card">
            {/* Background Effects */}
            <div className="card-bg-effects">
              <div className="card-glow glow-team" style={{ background: team.primary_color || '#4f8cff' }}></div>
            </div>

            {/* Header with Logo */}
            <div className="card-header">
              <img 
                src="/assets/img/muq_invert.png" 
                alt="Muqawamah" 
                className="card-tournament-logo"
                crossOrigin="anonymous"
              />
              <img 
                src="/assets/img/sio-logo-white.png" 
                alt="SIO" 
                className="card-sio-logo"
                crossOrigin="anonymous"
              />
            </div>

            {/* Team Content - New Elegant Layout */}
            <div className="card-team-content-v2">
              <div className="team-logo-wrapper">
                {team.crest_url ? (
                  <img src={team.crest_url} alt={team.name} crossOrigin="anonymous" className="team-logo-img" />
                ) : (
                  <span className="team-logo-placeholder">{team.name?.charAt(0)}</span>
                )}
              </div>
              
              <div className="team-info-wrapper">
                <h2 className="team-name-large">{team.name}</h2>
                {team.captain && (
                  <div className="team-captain-badge">
                    <span className="captain-label">Captain:</span>
                    <span className="captain-name">{team.captain}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats - Horizontal Bar */}
            {stats && (
              <div className="card-team-stats-v2">
                <div className="stat-block">
                  <span className="stat-num won">{stats.won || 0}</span>
                  <span className="stat-lbl">W</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-block">
                  <span className="stat-num draw">{stats.drawn || 0}</span>
                  <span className="stat-lbl">D</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-block">
                  <span className="stat-num lost">{stats.lost || 0}</span>
                  <span className="stat-lbl">L</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-block points">
                  <span className="stat-num">{stats.points || 0}</span>
                  <span className="stat-lbl">PTS</span>
                </div>
              </div>
            )}

            {/* Footer with Instagram */}
            <div className="card-footer">
              <span className="card-instagram">
                <InstagramIcon size={18} color="rgba(255,255,255,0.85)" />
                muqawama2026
              </span>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="share-buttons">
          <h3>Share to</h3>
          <div className="share-btn-grid two-cols">
            <button className="share-btn share-native" onClick={nativeShare} disabled={isGenerating}>
              <i className="fas fa-share-alt"></i>
              <span>Share</span>
            </button>
            <button className="share-btn download" onClick={downloadImage} disabled={isGenerating}>
              <i className="fas fa-download"></i>
              <span>Download</span>
            </button>
          </div>
          {isGenerating && (
            <div className="generating-indicator">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Generating image...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Player Share Card
export function PlayerShareCard({ player, team, onClose }) {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [imageData, setImageData] = useState(null);

  // Pre-generate image when modal opens
  React.useEffect(() => {
    const generateImage = async () => {
      if (!cardRef.current) return;
      
      try {
        const cacheKey = makeCacheKey('player', {
          id: player?.id,
          name: player?.name,
          img: player?.image,
          pos: player?.position,
          jersey: player?.jersey_number,
          goals: player?.goals,
          assists: player?.assists,
          is_captain: player?.is_captain,
          team: team ? { id: team.id, name: team.name, crest: team.crest_url } : null
        });
        const res = await generateCardImage({ node: cardRef.current, cacheKey });
        if (!res?.blob) throw new Error('Failed to generate image');
        setImageData({ blob: res.blob, url: res.objectUrl || null, dataUrl: res.dataUrl || null });
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    return scheduleNextPaint(generateImage);
  }, []);

  const downloadImage = () => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.download = `player-${player.name || 'player'}.png`;
    link.href = imageData.url || imageData.dataUrl;
    link.click();
  };

  const nativeShare = async () => {
    if (!imageData) return;

    const fileName = `muqawamah-${player.name || 'player'}.png`;
    const file = new File([imageData.blob], fileName, { type: 'image/png' });

    if (navigator.share && navigator.canShare) {
      try {
        const canShareFiles = navigator.canShare({ files: [file] });
        if (canShareFiles) {
          await navigator.share({
            files: [file]
          });
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    
    downloadImage();
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={e => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {/* The Shareable Card */}
        <div className="shareable-card-wrapper">
          <div ref={cardRef} className="shareable-card player-card">
            {/* Background Effects */}
            <div className="card-bg-effects">
              <div className="card-glow glow-player" style={{ background: getPositionColor(player.position) }}></div>
            </div>

            {/* Header with Logo */}
            <div className="card-header">
              <img 
                src="/assets/img/muq_invert.png" 
                alt="Muqawamah" 
                className="card-tournament-logo"
                crossOrigin="anonymous"
              />
              <img 
                src="/assets/img/sio-logo-white.png" 
                alt="SIO" 
                className="card-sio-logo"
                crossOrigin="anonymous"
              />
            </div>

            {/* Player Content */}
            <div className="card-player-content">
              <div className="player-photo-wrapper">
                {player.image ? (
                  <img src={player.image} alt={player.name} crossOrigin="anonymous" className="player-photo-img" />
                ) : (
                  <div className="player-photo-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
                {player.position && (
                  <span className="player-position-badge" style={{ background: getPositionColor(player.position) }}>
                    {player.position}
                  </span>
                )}
              </div>
              
              <div className="player-info-wrapper">
                {player.jersey_number && (
                  <span className="player-jersey">#{player.jersey_number}</span>
                )}
                <h2 className="player-name-large">{player.name}</h2>
                {team && (
                  <div className="player-team-badge">
                    {team.crest_url && (
                      <img src={team.crest_url} alt={team.name} className="player-team-crest" crossOrigin="anonymous" />
                    )}
                    <span className="player-team-name">{team.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Player Stats */}
            <div className="card-player-stats">
              {player.goals !== undefined && (
                <div className="player-stat-block">
                  <span className="player-stat-num">{player.goals || 0}</span>
                  <span className="player-stat-lbl">Goals</span>
                </div>
              )}
              {player.assists !== undefined && (
                <div className="player-stat-block">
                  <span className="player-stat-num">{player.assists || 0}</span>
                  <span className="player-stat-lbl">Assists</span>
                </div>
              )}
              {player.is_captain && (
                <div className="player-stat-block captain">
                  <span className="player-stat-icon">©</span>
                  <span className="player-stat-lbl">Captain</span>
                </div>
              )}
            </div>

            {/* Footer with Instagram */}
            <div className="card-footer">
              <span className="card-instagram">
                <InstagramIcon size={18} color="rgba(255,255,255,0.85)" />
                muqawama2026
              </span>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="share-buttons">
          <h3>Share to</h3>
          <div className="share-btn-grid two-cols">
            <button className="share-btn share-native" onClick={nativeShare} disabled={isGenerating}>
              <i className="fas fa-share-alt"></i>
              <span>Share</span>
            </button>
            <button className="share-btn download" onClick={downloadImage} disabled={isGenerating}>
              <i className="fas fa-download"></i>
              <span>Download</span>
            </button>
          </div>
          {isGenerating && (
            <div className="generating-indicator">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Generating image...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * PrewarmPlayerShareCard:
 * Renders the player share card offscreen and generates the snapshot into cache.
 * This makes the first "open share modal" feel instant on Player Detail page.
 *
 * It schedules work during idle time to avoid blocking the UI.
 */
export function PrewarmPlayerShareCard({ player, team }) {
  const cardRef = useRef(null);
  const [done, setDone] = useState(false);

  React.useEffect(() => {
    if (done) return;
    if (!player?.name) return;

    const cacheKey = makeCacheKey('player', {
      id: player?.id,
      name: player?.name,
      img: player?.image,
      pos: player?.position,
      jersey: player?.jersey_number,
      goals: player?.goals,
      assists: player?.assists,
      is_captain: player?.is_captain,
      team: team ? { id: team.id, name: team.name, crest: team.crest_url } : null
    });

    let cancelled = false;

    const run = async () => {
      try {
        if (!cardRef.current) return;
        await generateCardImage({ node: cardRef.current, cacheKey });
      } catch {
        // ignore prewarm failures
      } finally {
        if (!cancelled) setDone(true);
      }
    };

    // Use idle time if available; fallback to soon-after-paint.
    let cancelIdle = null;
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => run(), { timeout: 2000 });
      cancelIdle = () => cancelIdleCallback(id);
    } else {
      cancelIdle = scheduleNextPaint(() => run());
    }

    return () => {
      cancelled = true;
      if (typeof cancelIdle === 'function') cancelIdle();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    done,
    player?.id,
    player?.name,
    player?.image,
    player?.position,
    player?.jersey_number,
    player?.goals,
    player?.assists,
    player?.is_captain,
    team?.id,
    team?.name,
    team?.crest_url
  ]);

  if (done) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: -10000,
        top: -10000,
        width: 420,
        pointerEvents: 'none',
        opacity: 0
      }}
    >
      <div ref={cardRef} className="shareable-card player-card">
        {/* Background Effects */}
        <div className="card-bg-effects">
          <div className="card-glow glow-player" style={{ background: getPositionColor(player.position) }}></div>
        </div>

        {/* Header with Logo */}
        <div className="card-header">
          <img
            src="/assets/img/muq_invert.png"
            alt="Muqawamah"
            className="card-tournament-logo"
            crossOrigin="anonymous"
          />
          <img
            src="/assets/img/sio-logo-white.png"
            alt="SIO"
            className="card-sio-logo"
            crossOrigin="anonymous"
          />
        </div>

        {/* Player Content */}
        <div className="card-player-content">
          <div className="player-photo-wrapper">
            {player.image ? (
              <img src={player.image} alt={player.name} crossOrigin="anonymous" className="player-photo-img" />
            ) : (
              <div className="player-photo-placeholder">
                <i className="fas fa-user"></i>
              </div>
            )}
            {player.position && (
              <span className="player-position-badge" style={{ background: getPositionColor(player.position) }}>
                {player.position}
              </span>
            )}
          </div>

          <div className="player-info-wrapper">
            {player.jersey_number && <span className="player-jersey">#{player.jersey_number}</span>}
            <h2 className="player-name-large">{player.name}</h2>
            {team && (
              <div className="player-team-badge">
                {team.crest_url && (
                  <img src={team.crest_url} alt={team.name} className="player-team-crest" crossOrigin="anonymous" />
                )}
                <span className="player-team-name">{team.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Player Stats */}
        <div className="card-player-stats">
          {player.goals !== undefined && (
            <div className="player-stat-block">
              <span className="player-stat-num">{player.goals || 0}</span>
              <span className="player-stat-lbl">Goals</span>
            </div>
          )}
          {player.assists !== undefined && (
            <div className="player-stat-block">
              <span className="player-stat-num">{player.assists || 0}</span>
              <span className="player-stat-lbl">Assists</span>
            </div>
          )}
          {player.is_captain && (
            <div className="player-stat-block captain">
              <span className="player-stat-icon">©</span>
              <span className="player-stat-lbl">Captain</span>
            </div>
          )}
        </div>

        {/* Footer with Instagram */}
        <div className="card-footer">
          <span className="card-instagram">
            <InstagramIcon size={18} color="rgba(255,255,255,0.85)" />
            muqawama2026
          </span>
        </div>
      </div>
    </div>
  );
}

export function PrewarmMatchShareCard({ match }) {
  const cardRef = useRef(null);
  const [done, setDone] = useState(false);

  React.useEffect(() => {
    if (done) return;
    if (!match?.id) return;
    const cacheKey = getMatchCacheKey(match);

    let cancelled = false;
    const run = async () => {
      try {
        if (!cardRef.current) return;
        await generateCardImage({ node: cardRef.current, cacheKey });
      } catch {
        // ignore
      } finally {
        if (!cancelled) setDone(true);
      }
    };

    let cancelIdle = null;
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => run(), { timeout: 2000 });
      cancelIdle = () => cancelIdleCallback(id);
    } else {
      cancelIdle = scheduleNextPaint(() => run());
    }

    return () => {
      cancelled = true;
      if (typeof cancelIdle === 'function') cancelIdle();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    done,
    match?.id,
    match?.status,
    match?.home_score,
    match?.away_score,
    match?.home_team?.name,
    match?.away_team?.name,
    match?.home_team?.crest_url,
    match?.away_team?.crest_url,
    match?.match_date,
    match?.match_type
  ]);

  if (done) return null;
  const isFinished = match?.status === 'completed';
  const isLive = match?.status === 'live';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: -10000,
        top: -10000,
        width: 520,
        pointerEvents: 'none',
        opacity: 0
      }}
    >
      <div ref={cardRef} className="shareable-card match-card">
        <div className="card-bg-effects">
          <div className="card-glow glow-1"></div>
          <div className="card-glow glow-2"></div>
        </div>

        <div className="card-header">
          <img
            src="/assets/img/muq_invert.png"
            alt="Muqawamah"
            className="card-tournament-logo"
            crossOrigin="anonymous"
          />
          <img
            src="/assets/img/sio-logo-white.png"
            alt="SIO"
            className="card-sio-logo"
            crossOrigin="anonymous"
          />
        </div>

        <div className="card-match-content">
          <div className="card-team home">
            <div className="card-team-logo">
              {match?.home_team?.crest_url ? (
                <img src={match.home_team.crest_url} alt={match.home_team.name} crossOrigin="anonymous" />
              ) : (
                <span className="logo-placeholder">{match?.home_team?.name?.charAt(0)}</span>
              )}
            </div>
            <span className="card-team-name">{match?.home_team?.name}</span>
          </div>

          <div className="card-score-horizontal">
            {isFinished || isLive ? (
              <div className="score-row">
                <span className="score-number">{match?.home_score ?? 0}</span>
                <span className="score-divider">-</span>
                <span className="score-number">{match?.away_score ?? 0}</span>
              </div>
            ) : (
              <span className="score-vs">VS</span>
            )}
          </div>

          <div className="card-team away">
            <div className="card-team-logo">
              {match?.away_team?.crest_url ? (
                <img src={match.away_team.crest_url} alt={match.away_team.name} crossOrigin="anonymous" />
              ) : (
                <span className="logo-placeholder">{match?.away_team?.name?.charAt(0)}</span>
              )}
            </div>
            <span className="card-team-name">{match?.away_team?.name}</span>
          </div>
        </div>

        <div className="card-status-section">
          {(isFinished || isLive) && (
            <span className={`card-status ${match.status}`}>
              {isFinished ? 'FULL TIME' : 'LIVE'}
            </span>
          )}
          <span className="card-date-inline">{formatDateUpper(match?.match_date)}</span>
          <span className="card-match-type-text">{getMatchTypeLabel(match?.match_type)}</span>
        </div>

        <div className="card-footer">
          <span className="card-instagram">
            <InstagramIcon size={18} color="rgba(255,255,255,0.85)" />
            muqawama2026
          </span>
        </div>
      </div>
    </div>
  );
}

export function PrewarmTeamShareCard({ team, stats }) {
  const cardRef = useRef(null);
  const [done, setDone] = useState(false);

  React.useEffect(() => {
    if (done) return;
    if (!team?.id && !team?.name) return;
    const cacheKey = getTeamCacheKey(team, stats);

    let cancelled = false;
    const run = async () => {
      try {
        if (!cardRef.current) return;
        await generateCardImage({ node: cardRef.current, cacheKey });
      } catch {
        // ignore
      } finally {
        if (!cancelled) setDone(true);
      }
    };

    let cancelIdle = null;
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => run(), { timeout: 2000 });
      cancelIdle = () => cancelIdleCallback(id);
    } else {
      cancelIdle = scheduleNextPaint(() => run());
    }

    return () => {
      cancelled = true;
      if (typeof cancelIdle === 'function') cancelIdle();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    done,
    team?.id,
    team?.name,
    team?.crest_url,
    team?.primary_color,
    team?.captain,
    stats?.won,
    stats?.drawn,
    stats?.lost,
    stats?.points
  ]);

  if (done) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: -10000,
        top: -10000,
        width: 520,
        pointerEvents: 'none',
        opacity: 0
      }}
    >
      <div ref={cardRef} className="shareable-card team-card">
        <div className="card-bg-effects">
          <div className="card-glow glow-team" style={{ background: team?.primary_color || '#4f8cff' }}></div>
        </div>

        <div className="card-header">
          <img
            src="/assets/img/muq_invert.png"
            alt="Muqawamah"
            className="card-tournament-logo"
            crossOrigin="anonymous"
          />
          <img
            src="/assets/img/sio-logo-white.png"
            alt="SIO"
            className="card-sio-logo"
            crossOrigin="anonymous"
          />
        </div>

        <div className="card-team-content-v2">
          <div className="team-logo-wrapper">
            {team?.crest_url ? (
              <img src={team.crest_url} alt={team.name} crossOrigin="anonymous" className="team-logo-img" />
            ) : (
              <span className="team-logo-placeholder">{team?.name?.charAt(0)}</span>
            )}
          </div>

          <div className="team-info-wrapper">
            <h2 className="team-name-large">{team?.name}</h2>
            {team?.captain && (
              <div className="team-captain-badge">
                <span className="captain-label">Captain:</span>
                <span className="captain-name">{team.captain}</span>
              </div>
            )}
          </div>
        </div>

        {stats && (
          <div className="card-team-stats-v2">
            <div className="stat-block">
              <span className="stat-num won">{stats.won || 0}</span>
              <span className="stat-lbl">W</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-block">
              <span className="stat-num draw">{stats.drawn || 0}</span>
              <span className="stat-lbl">D</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-block">
              <span className="stat-num lost">{stats.lost || 0}</span>
              <span className="stat-lbl">L</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-block points">
              <span className="stat-num">{stats.points || 0}</span>
              <span className="stat-lbl">PTS</span>
            </div>
          </div>
        )}

        <div className="card-footer">
          <span className="card-instagram">
            <InstagramIcon size={18} color="rgba(255,255,255,0.85)" />
            muqawama2026
          </span>
        </div>
      </div>
    </div>
  );
}

export function PrewarmStatsShareCard({ statType, items }) {
  const cardRef = useRef(null);
  const [done, setDone] = useState(false);
  const top3 = (items || []).slice(0, 3);

  React.useEffect(() => {
    if (done) return;
    if (!statType) return;
    if (!top3 || top3.length === 0) return;
    const cacheKey = getStatsCacheKey(statType, items);

    let cancelled = false;
    const run = async () => {
      try {
        if (!cardRef.current) return;
        await generateCardImage({ node: cardRef.current, cacheKey });
      } catch {
        // ignore
      } finally {
        if (!cancelled) setDone(true);
      }
    };

    let cancelIdle = null;
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => run(), { timeout: 2000 });
      cancelIdle = () => cancelIdleCallback(id);
    } else {
      cancelIdle = scheduleNextPaint(() => run());
    }

    return () => {
      cancelled = true;
      if (typeof cancelIdle === 'function') cancelIdle();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, statType, top3?.[0]?.id, top3?.[0]?.name, top3?.[0]?.value, top3?.[1]?.id, top3?.[1]?.name, top3?.[1]?.value, top3?.[2]?.id, top3?.[2]?.name, top3?.[2]?.value]);

  if (done) return null;

  const getStatLabel = () => {
    switch (statType) {
      case 'goals': return 'Top Scorers';
      case 'assists': return 'Top Assists';
      case 'points': return 'Team Standings';
      case 'wins': return 'Most Wins';
      case 'clean_sheets': return 'Clean Sheets';
      default: return statType.charAt(0).toUpperCase() + statType.slice(1);
    }
  };

  const getStatIcon = () => {
    switch (statType) {
      case 'goals': return '⚽';
      case 'assists': return '🎯';
      case 'points': return '🏆';
      case 'wins': return '🥇';
      case 'clean_sheets': return '🧤';
      default: return '📊';
    }
  };

  const getMedalColor = (index) => {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return '#666';
  };

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: -10000,
        top: -10000,
        width: 520,
        pointerEvents: 'none',
        opacity: 0
      }}
    >
      <div ref={cardRef} className="shareable-card stats-card">
        <div className="card-bg-effects">
          <div className="card-glow glow-1"></div>
          <div className="card-glow glow-2"></div>
        </div>

        <div className="card-header">
          <img
            src="/assets/img/muq_invert.png"
            alt="Muqawamah"
            className="card-tournament-logo"
            crossOrigin="anonymous"
          />
          <img
            src="/assets/img/sio-logo-white.png"
            alt="SIO"
            className="card-sio-logo"
            crossOrigin="anonymous"
          />
        </div>

        <div className="stats-card-header">
          <div className="stats-card-title">
            <span className="stats-icon">{getStatIcon()}</span>
            <span className="stats-title-text">{getStatLabel()}</span>
          </div>
        </div>

        <div className="stats-top3">
          {top3.map((item, idx) => (
            <div className="stats-row" key={item?.id || idx}>
              <div className="stats-rank" style={{ color: getMedalColor(idx) }}>{idx + 1}</div>
              <div className="stats-avatar">
                {item?.image || item?.crest_url ? (
                  <img src={item.image || item.crest_url} alt={item.name} crossOrigin="anonymous" />
                ) : (
                  <span className="avatar-placeholder">{item?.name?.charAt(0)}</span>
                )}
              </div>
              <div className="stats-name">{item?.name}</div>
              <div className="stats-value">{item?.value ?? 0}</div>
            </div>
          ))}
        </div>

        <div className="card-footer">
          <span className="card-instagram">
            <InstagramIcon size={18} color="rgba(255,255,255,0.85)" />
            muqawama2026
          </span>
        </div>
      </div>
    </div>
  );
}

// Stats Share Card - Top 3 Leaderboard
export function StatsShareCard({ statType, items, onClose }) {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [imageData, setImageData] = useState(null);

  // Pre-generate image when modal opens
  React.useEffect(() => {
    const generateImage = async () => {
      if (!cardRef.current) return;
      
      try {
        const cacheKey = getStatsCacheKey(statType, items);
        const res = await generateCardImage({ node: cardRef.current, cacheKey });
        if (!res?.blob) throw new Error('Failed to generate image');
        setImageData({ blob: res.blob, url: res.objectUrl || null, dataUrl: res.dataUrl || null });
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    return scheduleNextPaint(generateImage);
  }, []);

  const downloadImage = () => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.download = `muqawamah-top-${statType}.png`;
    link.href = imageData.url || imageData.dataUrl;
    link.click();
  };

  const nativeShare = async () => {
    if (!imageData) return;

    const fileName = `muqawamah-top-${statType}.png`;
    const file = new File([imageData.blob], fileName, { type: 'image/png' });

    if (navigator.share && navigator.canShare) {
      try {
        const canShareFiles = navigator.canShare({ files: [file] });
        if (canShareFiles) {
          await navigator.share({ files: [file] });
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    
    downloadImage();
  };

  const getStatLabel = () => {
    switch(statType) {
      case 'goals': return 'Top Scorers';
      case 'assists': return 'Top Assists';
      case 'points': return 'Team Standings';
      case 'wins': return 'Most Wins';
      case 'clean_sheets': return 'Clean Sheets';
      default: return statType.charAt(0).toUpperCase() + statType.slice(1);
    }
  };

  const getStatIcon = () => {
    switch(statType) {
      case 'goals': return '⚽';
      case 'assists': return '🎯';
      case 'points': return '🏆';
      case 'wins': return '🥇';
      case 'clean_sheets': return '🧤';
      default: return '📊';
    }
  };

  const getMedalColor = (index) => {
    if (index === 0) return '#FFD700'; // Gold
    if (index === 1) return '#C0C0C0'; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return '#666';
  };

  // Get top 3 only
  const top3 = items.slice(0, 3);

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={e => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {/* The Shareable Card */}
        <div className="shareable-card-wrapper">
          <div ref={cardRef} className="shareable-card stats-card">
            {/* Background Effects */}
            <div className="card-bg-effects">
              <div className="card-glow glow-1"></div>
              <div className="card-glow glow-2"></div>
            </div>

            {/* Header with Logo */}
            <div className="card-header">
              <img 
                src="/assets/img/muq_invert.png" 
                alt="Muqawamah" 
                className="card-tournament-logo"
                crossOrigin="anonymous"
              />
              <img 
                src="/assets/img/sio-logo-white.png" 
                alt="SIO" 
                className="card-sio-logo"
                crossOrigin="anonymous"
              />
            </div>

            {/* Stats Title */}
            <div className="stats-card-title">
              <span className="stats-icon">{getStatIcon()}</span>
              <h2>{getStatLabel()}</h2>
            </div>

            {/* Top 3 Leaderboard */}
            <div className="stats-leaderboard">
              {top3.map((item, index) => (
                <div key={index} className={`stats-rank-item rank-${index + 1}`}>
                  <div className="rank-medal" style={{ background: getMedalColor(index) }}>
                    {index + 1}
                  </div>
                  <div className="rank-avatar">
                    {item.image || item.crest_url ? (
                      <img src={item.image || item.crest_url} alt={item.name} crossOrigin="anonymous" />
                    ) : (
                      <span className="rank-initial">{item.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="rank-info">
                    <span className="rank-name">{item.name}</span>
                    {item.team_name && <span className="rank-team">{item.team_name}</span>}
                  </div>
                  <div className="rank-value">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Footer with Instagram */}
            <div className="card-footer">
              <span className="card-instagram">
                <InstagramIcon size={18} color="rgba(255,255,255,0.85)" />
                muqawama2026
              </span>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="share-buttons">
          <h3>Share to</h3>
          <div className="share-btn-grid two-cols">
            <button className="share-btn share-native" onClick={nativeShare} disabled={isGenerating}>
              <i className="fas fa-share-alt"></i>
              <span>Share</span>
            </button>
            <button className="share-btn download" onClick={downloadImage} disabled={isGenerating}>
              <i className="fas fa-download"></i>
              <span>Download</span>
            </button>
          </div>
          {isGenerating && (
            <div className="generating-indicator">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Generating image...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple Share Button Component
export function ShareButton({ onClick, className = '' }) {
  return (
    <button className={`share-trigger-btn ${className}`} onClick={onClick} title="Share">
      <i className="fas fa-share-alt"></i>
      <span>Share</span>
    </button>
  );
}

export default { MatchShareCard, TeamShareCard, PlayerShareCard, StatsShareCard, ShareButton };

