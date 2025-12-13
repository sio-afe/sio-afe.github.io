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

  if (match.status === 'completed' || match.status === 'live') {
    return null; // Don't show predictions for completed/live matches
  }

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
    <div className="match-prediction-bar">
      <div className="prediction-content">
        <div className="prediction-bars-compact">
          <div className="prediction-bar-item">
            <div className="prediction-bar-label">
              <i className="fas fa-users"></i>
              <span>Community Predictions</span>
            </div>
            
            {/* Always show the prediction bar */}
            <div className="user-prediction-probability-bar compact">
              <div 
                className="user-prob-segment home-win"
                style={{ width: `${homePercent}%` }}
                title={`${match.home_team?.name || 'Home'} ${homePercent}%${totalVotes > 0 ? ` (${userPredictionStats.home} votes)` : ''}`}
              >
                {homePercent > 10 && (
                  <span className="user-prob-label">{homePercent}%</span>
                )}
              </div>
              <div 
                className="user-prob-segment draw"
                style={{ width: `${drawPercent}%` }}
                title={`Draw ${drawPercent}%${totalVotes > 0 ? ` (${userPredictionStats.draw} votes)` : ''}`}
              >
                {drawPercent > 10 && (
                  <span className="user-prob-label">{drawPercent}%</span>
                )}
              </div>
              <div 
                className="user-prob-segment away-win"
                style={{ width: `${awayPercent}%` }}
                title={`${match.away_team?.name || 'Away'} ${awayPercent}%${totalVotes > 0 ? ` (${userPredictionStats.away} votes)` : ''}`}
              >
                {awayPercent > 10 && (
                  <span className="user-prob-label">{awayPercent}%</span>
                )}
              </div>
            </div>

            {/* Show voting buttons below the bar if user hasn't voted */}
            {!userPrediction && (
              <div className="user-prediction-buttons-compact" style={{ marginTop: '12px' }}>
                <button
                  className="user-pred-btn-compact home"
                  onClick={() => handleUserPrediction('home')}
                  title={`${match.home_team?.name || 'Home'} to win`}
                >
                  <i className="fas fa-trophy"></i>
                  <span>{match.home_team?.name || 'Home'}</span>
                </button>
                <button
                  className="user-pred-btn-compact draw"
                  onClick={() => handleUserPrediction('draw')}
                  title="Draw"
                >
                  <i className="fas fa-equals"></i>
                  <span>Draw</span>
                </button>
                <button
                  className="user-pred-btn-compact away"
                  onClick={() => handleUserPrediction('away')}
                  title={`${match.away_team?.name || 'Away'} to win`}
                >
                  <i className="fas fa-trophy"></i>
                  <span>{match.away_team?.name || 'Away'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

