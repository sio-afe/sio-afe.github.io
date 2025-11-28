import React, { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { FootballFieldSVG } from './FootballFieldSVG';

export default function FormationPreview({
  players,
  editable = false,
  onDragStart,
  onDrag,
  onDragEnd,
  showDownload = false
}) {
  const fieldNodeRef = useRef(null);
  const svgRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [draggedPlayer, setDraggedPlayer] = useState(null);

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
        backgroundColor: '#ffffff'
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

  const handlePlayerMouseDown = (e, player) => {
    if (!editable) return;
    e.preventDefault();
    setDraggedPlayer(player.id);
    if (onDragStart) onDragStart(e, player.id);
  };

  const handlePlayerTouchStart = (e, player) => {
    if (!editable) return;
    setDraggedPlayer(player.id);
    if (onDragStart) onDragStart(e, player.id);
  };

  const handleMouseMove = (e) => {
    if (!draggedPlayer || !editable || !fieldNodeRef.current) return;
    e.preventDefault();
    if (onDrag) {
      onDrag(e);
    }
  };

  const handleTouchMove = (e) => {
    if (!draggedPlayer || !editable || !fieldNodeRef.current) return;
    e.preventDefault();
    if (onDrag) {
      onDrag(e);
    }
  };

  const handleMouseUp = () => {
    if (draggedPlayer) {
      setDraggedPlayer(null);
      if (onDragEnd) onDragEnd();
    }
  };

  const handleTouchEnd = () => {
    if (draggedPlayer) {
      setDraggedPlayer(null);
      if (onDragEnd) onDragEnd();
    }
  };

  return (
    <div className="formation-preview-wrapper">
      <div 
        className="football-field-svg" 
        ref={fieldNodeRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <FootballFieldSVG 
          ref={svgRef}
          style={{ width: '100%', height: 'auto', maxWidth: '400px', display: 'block', margin: '0 auto' }}
        >
          {/* Players */}
          {players.map((player) => {
            // Convert percentage to SVG coordinates (accounting for the 3px transform)
            const svgX = 3 + (player.x / 100) * 68;
            const svgY = 3 + (player.y / 100) * 105;
            
            return (
              <g 
                key={player.id}
                transform={`translate(${svgX}, ${svgY})`}
                className={editable ? "player-marker-draggable" : "player-marker-static"}
                style={{ cursor: editable ? 'move' : 'default' }}
                onMouseDown={(e) => handlePlayerMouseDown(e, player)}
                onTouchStart={(e) => handlePlayerTouchStart(e, player)}
              >
                {/* Player circle with image or position */}
                <circle 
                  r="3" 
                  fill="#4a90e2" 
                  stroke="#fff" 
                  strokeWidth="0.5"
                />
                {player.image ? (
                  <image 
                    href={player.image} 
                    x="-3" 
                    y="-3" 
                    width="6" 
                    height="6" 
                    clipPath="circle(3px at center)"
                    style={{ borderRadius: '50%' }}
                  />
                ) : (
                  <text 
                    x="0" 
                    y="1" 
                    textAnchor="middle" 
                    fill="#fff" 
                    fontSize="2.5" 
                    fontWeight="600"
                  >
                    {player.position}
                  </text>
                )}
                
                {/* Player name and position below */}
                <text 
                  x="0" 
                  y="5.5" 
                  textAnchor="middle" 
                  fill="#000" 
                  fontSize="1.8" 
                  fontWeight="600"
                >
                  {player.name || 'Player'}
                </text>
                <text 
                  x="0" 
                  y="7.5" 
                  textAnchor="middle" 
                  fill="#666" 
                  fontSize="1.5" 
                  fontWeight="400"
                >
                  {player.position}
                </text>
              </g>
            );
          })}
        </FootballFieldSVG>
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