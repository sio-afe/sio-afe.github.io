import React, { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';

export default function FormationPreview({
  players,
  editable = false,
  onDragStart,
  onDrag,
  onDragEnd,
  showDownload = false
}) {
  const fieldNodeRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFileName = useMemo(() => {
    const date = new Date().toISOString().split('T')[0];
    return `muqawamah-formation-${date}.png`;
  }, []);

  const handleDownload = async () => {
    if (!fieldNodeRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(fieldNodeRef.current, {
        cacheBust: true,
        pixelRatio: window.devicePixelRatio || 2,
        backgroundColor: '#0f1b2c'
      });
      const link = document.createElement('a');
      link.download = downloadFileName;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Formation download failed:', error);
      alert('Unable to download formation right now. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const attachHandlers = (playerId) =>
    editable
      ? {
          draggable: true,
          onDragStart: (event) => onDragStart && onDragStart(event, playerId),
          onDrag: (event) => onDrag && onDrag(event),
          onDragEnd: (event) => onDragEnd && onDragEnd(event),
          onTouchStart: (event) => onDragStart && onDragStart(event, playerId),
          onTouchMove: (event) => onDrag && onDrag(event),
          onTouchEnd: (event) => onDragEnd && onDragEnd(event)
        }
      : {};

  return (
    <div className="formation-preview-wrapper">
      <div className="football-field" ref={fieldNodeRef}>
        <div className="football-field-surface" />
        <div
          className="formation-overlay"
          style={{ pointerEvents: editable ? 'auto' : 'none' }}
        >
          {players.map((player) => (
            <div
              key={player.id}
              className={`player-marker ${editable ? 'draggable' : ''}`}
              style={{ left: `${player.x}%`, top: `${player.y}%` }}
              {...attachHandlers(player.id)}
            >
              <div className={`player-circle ${player.isSubstitute ? 'substitute' : ''}`}>
                {player.image ? (
                  <img src={player.image} alt={player.name || player.position} />
                ) : (
                  <span>{player.position}</span>
                )}
              </div>
              <div className="player-label">
                <strong>{player.position}</strong>
                <span>{player.name || 'Unnamed'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDownload && (
        <button
          type="button"
          className="download-formation-btn"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <i className="fas fa-download" />
          <span>{isDownloading ? 'Preparing...' : 'Download Formation'}</span>
        </button>
      )}
    </div>
  );
}