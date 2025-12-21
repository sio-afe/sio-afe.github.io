import React from 'react';
import { supabaseClient } from '../../../../../lib/supabaseClient';

export default function MatchPredictions({ 
  match, 
  matchId, 
  userIdentifier, 
  userPrediction, 
  userPredictionStats, 
  onPredictionUpdate,
  onStatsUpdate
}) {
  const handleUserPrediction = async (predictionType) => {
    if (!matchId || !userIdentifier || !match) return;

    try {
      // Check if user already predicted
      const { data: existingPred } = await supabaseClient
        .from('match_predictions')
        .select('id, prediction')
        .eq('match_id', matchId)
        .eq('user_identifier', userIdentifier)
        .maybeSingle();

      if (existingPred) {
        if (existingPred.prediction === predictionType) {
          // Same prediction, remove it
          await supabaseClient
            .from('match_predictions')
            .delete()
            .eq('id', existingPred.id);
          
          if (onPredictionUpdate) onPredictionUpdate(null);
        } else {
          // Different prediction, update it
          await supabaseClient
            .from('match_predictions')
            .update({ prediction: predictionType })
            .eq('id', existingPred.id);
          
          if (onPredictionUpdate) onPredictionUpdate(predictionType);
        }
      } else {
        // New prediction
        await supabaseClient
          .from('match_predictions')
          .insert({
            match_id: matchId,
            user_identifier: userIdentifier,
            prediction: predictionType
          });
        
        if (onPredictionUpdate) onPredictionUpdate(predictionType);
      }
      
      // Refresh stats from database
      if (onStatsUpdate) {
        const { data: predictionsData } = await supabaseClient
          .from('match_predictions')
          .select('prediction')
          .eq('match_id', matchId);

        if (predictionsData) {
          const stats = {
            home: predictionsData.filter(p => p.prediction === 'home').length,
            draw: predictionsData.filter(p => p.prediction === 'draw').length,
            away: predictionsData.filter(p => p.prediction === 'away').length
          };
          onStatsUpdate(stats);
        }
      }
    } catch (error) {
      console.error('Error saving prediction:', error);
    }
  };

  const isMatchFinished = match.status === 'completed';
  const totalVotes = userPredictionStats.home + userPredictionStats.draw + userPredictionStats.away;
  
  // Calculate percentages (0% if no votes)
  const homePercent = totalVotes > 0 
    ? Math.round((userPredictionStats.home / totalVotes) * 100) 
    : 0;
  const drawPercent = totalVotes > 0 
    ? Math.round((userPredictionStats.draw / totalVotes) * 100) 
    : 0;
  const awayPercent = totalVotes > 0 
    ? Math.round((userPredictionStats.away / totalVotes) * 100) 
    : 0;

  return (
    <div className="goals-panel-compact">
      <h3 className="panel-title-compact">
        <i className="fas fa-users"></i>
        Community Predictions
      </h3>
      <div className="prediction-content">
        <div className="prediction-bars-compact">
          <div className="prediction-bar-item">
            
            {/* Prediction bar with proper directional fill */}
            <div className="prediction-bar-directional">
              {/* Home bar - fills from left */}
              <div 
                className="pred-bar-home"
                style={{ width: `${homePercent}%` }}
                title={`${match.home_team?.name || 'Home'} ${homePercent}%${totalVotes > 0 ? ` (${userPredictionStats.home} votes)` : ''}`}
              >
                {homePercent > 15 && (
                  <span className="pred-bar-label">{homePercent}%</span>
                )}
              </div>
              
              {/* Draw section - in the middle */}
              {drawPercent > 0 && (
                <div 
                  className="pred-bar-draw"
                  style={{ width: `${drawPercent}%` }}
                  title={`Draw ${drawPercent}%${totalVotes > 0 ? ` (${userPredictionStats.draw} votes)` : ''}`}
                >
                  {drawPercent > 15 && (
                    <span className="pred-bar-label">{drawPercent}%</span>
                  )}
                </div>
              )}
              
              {/* Away bar - fills from right */}
              <div 
                className="pred-bar-away"
                style={{ width: `${awayPercent}%` }}
                title={`${match.away_team?.name || 'Away'} ${awayPercent}%${totalVotes > 0 ? ` (${userPredictionStats.away} votes)` : ''}`}
              >
                {awayPercent > 15 && (
                  <span className="pred-bar-label">{awayPercent}%</span>
                )}
              </div>
            </div>

            {/* Team labels under bar */}
            {totalVotes > 0 && (
              <div className="pred-bar-teams">
                <span className="pred-team-label home">{match.home_team?.name || 'Home'}</span>
                <span className="pred-team-label away">{match.away_team?.name || 'Away'}</span>
              </div>
            )}

            {/* Show voting buttons only if user hasn't voted and match is not finished */}
            {!userPrediction && !isMatchFinished && (
              <div className="user-prediction-buttons-compact">
                <button
                  className={`user-pred-btn-compact home ${userPrediction === 'home' ? 'active' : ''}`}
                  onClick={() => handleUserPrediction('home')}
                  title={`${match.home_team?.name || 'Home'} to win`}
                >
                  <span>{match.home_team?.name || 'Home'}</span>
                  <i className="fas fa-chevron-right"></i>
                </button>
                <button
                  className={`user-pred-btn-compact draw ${userPrediction === 'draw' ? 'active' : ''}`}
                  onClick={() => handleUserPrediction('draw')}
                  title="Draw"
                >
                  <i className="fas fa-equals"></i>
                  <span>Draw</span>
                </button>
                <button
                  className={`user-pred-btn-compact away ${userPrediction === 'away' ? 'active' : ''}`}
                  onClick={() => handleUserPrediction('away')}
                  title={`${match.away_team?.name || 'Away'} to win`}
                >
                  <i className="fas fa-chevron-left"></i>
                  <span>{match.away_team?.name || 'Away'}</span>
                </button>
              </div>
            )}
            
          </div>
        </div>
      </div>

      <style>{`
        .prediction-bar-directional {
          display: flex;
          width: 100%;
          height: 28px;
          border-radius: 14px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .pred-bar-home {
          background: linear-gradient(90deg, #4a90e2 0%, #357abd 100%);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.4s ease;
          border-radius: 14px 0 0 14px;
        }

        .pred-bar-draw {
          background: rgba(128, 128, 128, 0.6);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.4s ease;
        }

        .pred-bar-away {
          background: linear-gradient(90deg, #c1121f 0%, #e63946 100%);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.4s ease;
          margin-left: auto;
          border-radius: 0 14px 14px 0;
        }

        .pred-bar-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .pred-bar-teams {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          padding: 0 4px;
        }

        .pred-team-label {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pred-team-label.home {
          color: #4a90e2;
        }

        .pred-team-label.away {
          color: #e63946;
        }

        .user-pred-btn-compact.active {
          transform: scale(1.02);
        }

        .user-pred-btn-compact.home.active {
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.3) 0%, rgba(53, 122, 189, 0.2) 100%);
          border-color: #4a90e2;
          color: #4a90e2;
        }

        .user-pred-btn-compact.draw.active {
          background: rgba(128, 128, 128, 0.3);
          border-color: rgba(128, 128, 128, 0.8);
          color: rgba(255, 255, 255, 0.9);
        }

        .user-pred-btn-compact.away.active {
          background: linear-gradient(135deg, rgba(230, 57, 70, 0.3) 0%, rgba(193, 18, 31, 0.2) 100%);
          border-color: #e63946;
          color: #e63946;
        }
      `}</style>
    </div>
  );
}

