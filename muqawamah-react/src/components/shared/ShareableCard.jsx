/**
 * ShareableCard Component
 * Creates beautiful glassmorphism cards for sharing to social media
 */

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import '../../styles/ShareableCard.css';

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

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  const getMatchTypeLabel = () => {
    const matchType = match.match_type?.toLowerCase();
    if (!matchType || matchType === 'group') return 'GROUP STAGE';
    if (matchType === 'quarter-final') return 'QUARTER FINAL';
    if (matchType === 'semi-final') return 'SEMI FINAL';
    if (matchType === 'final') return 'FINAL';
    if (matchType === 'third-place') return '3RD PLACE';
    return matchType.toUpperCase();
  };

  const isFinished = match.status === 'completed';
  const isLive = match.status === 'live';

  // Pre-generate image when modal opens
  React.useEffect(() => {
    const generateImage = async () => {
      if (!cardRef.current) return;
      
      try {
        const dataUrl = await toPng(cardRef.current, {
          quality: 1,
          pixelRatio: 3,
          backgroundColor: '#0a0e1a',
        });
        
        const blob = dataURLtoBlob(dataUrl);
        setImageData({ dataUrl, blob });
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    // Use requestAnimationFrame for instant generation on next paint
    const frameId = requestAnimationFrame(generateImage);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const downloadImage = () => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.download = `match-${match.home_team?.name}-vs-${match.away_team?.name}.png`;
    link.href = imageData.dataUrl;
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
              <span className="card-date-inline">{formatDate(match.match_date)}</span>
              <span className="card-match-type-text">{getMatchTypeLabel()}</span>
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
        const dataUrl = await toPng(cardRef.current, {
          quality: 1,
          pixelRatio: 3,
          backgroundColor: '#0a0e1a',
        });
        
        const blob = dataURLtoBlob(dataUrl);
        setImageData({ dataUrl, blob });
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    const frameId = requestAnimationFrame(generateImage);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const downloadImage = () => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.download = `team-${team.name}.png`;
    link.href = imageData.dataUrl;
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
        const dataUrl = await toPng(cardRef.current, {
          quality: 1,
          pixelRatio: 3,
          backgroundColor: '#0a0e1a',
        });
        
        const blob = dataURLtoBlob(dataUrl);
        setImageData({ dataUrl, blob });
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    const frameId = requestAnimationFrame(generateImage);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const downloadImage = () => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.download = `player-${player.name || 'player'}.png`;
    link.href = imageData.dataUrl;
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

  const getPositionColor = (position) => {
    const pos = position?.toUpperCase();
    if (pos === 'GK') return '#fbbf24';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return '#60a5fa';
    if (['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(pos)) return '#4ade80';
    if (['ST', 'CF', 'LW', 'RW'].includes(pos)) return '#f87171';
    return '#a78bfa';
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
        const dataUrl = await toPng(cardRef.current, {
          quality: 1,
          pixelRatio: 3,
          backgroundColor: '#0a0e1a',
        });
        
        const blob = dataURLtoBlob(dataUrl);
        setImageData({ dataUrl, blob });
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    const frameId = requestAnimationFrame(generateImage);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const downloadImage = () => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.download = `muqawamah-top-${statType}.png`;
    link.href = imageData.dataUrl;
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

