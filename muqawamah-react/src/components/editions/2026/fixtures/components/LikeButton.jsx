import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../../lib/supabaseClient';

export default function LikeButton({ matchId, userIdentifier, initialLikeCount }) {
  const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
  const [flyingHearts, setFlyingHearts] = useState([]);

  useEffect(() => {
    setLikeCount(initialLikeCount || 0);
  }, [initialLikeCount]);

  const handleLike = async () => {
    if (!matchId || !userIdentifier) return;

    // Show hearts immediately (don't wait for database)
    const heartCount = 3 + Math.floor(Math.random() * 3); // 3-5 hearts
    for (let i = 0; i < heartCount; i++) {
      setTimeout(() => {
        createFlyingHeart(i, heartCount);
      }, i * 80); // Stagger the hearts more to reduce overlap
    }

    // Update count optimistically
    setLikeCount(prev => prev + 1);

    // Then try to save to database (non-blocking)
    try {
      await supabaseClient
        .from('match_likes')
        .insert({
          match_id: matchId,
          user_identifier: userIdentifier
        });
    } catch (error) {
      // If error (like 409 conflict), just log it - we already showed the animation
      console.error('Error saving like (non-critical):', error);
    }
  };

  // Create flying heart animation - goes straight up and fades
  const createFlyingHeart = (index, total) => {
    const heartId = Date.now() + Math.random() + index;
    // Small horizontal spread to create a column effect, but mostly vertical
    const horizontalSpread = (index / total) * 20 - 10; // -10 to +10px horizontal spread
    const randomDelay = index * 0.15; // Stagger timing for column effect
    
    const heartData = { 
      id: heartId, 
      horizontalOffset: horizontalSpread,
      delay: randomDelay
    };
    setFlyingHearts(prev => [...prev, heartData]);
    
    // Remove heart after animation completes
    setTimeout(() => {
      setFlyingHearts(prev => prev.filter(h => h.id !== heartId));
    }, 3000);
  };

  return (
    <>
      {/* Sticky Like Button - Left Corner */}
      <button 
        className="match-like-button-sticky"
        onClick={handleLike}
        title="Show your support for this match"
      >
        <i className="fas fa-heart"></i>
        {likeCount > 0 && (
          <span className="like-count-badge">{likeCount}</span>
        )}
      </button>

      {/* Flying Hearts Animation */}
      <div className="flying-hearts-container">
        {flyingHearts.map(heart => (
          <div 
            key={heart.id} 
            className="flying-heart"
            style={{ 
              '--horizontal-offset': `${heart.horizontalOffset || 0}px`,
              '--delay': `${heart.delay || 0}s`
            }}
          >
            <i className="fas fa-heart"></i>
          </div>
        ))}
      </div>
    </>
  );
}

