/**
 * Stats Recalculator Utility
 * Recalculates all team statistics from completed matches
 * Use this to fix data inconsistencies
 */

import React, { useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';

export default function StatsRecalculator() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const addLog = (message, type = 'info') => {
    setLog(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const recalculateAllStats = async () => {
    if (!confirm('⚠️ This will recalculate ALL team statistics from completed matches.\n\nThis may take a few moments. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      setLog([]);
      addLog('🚀 Starting stats recalculation...', 'info');

      // Fetch all teams
      const { data: teams, error: teamsError } = await supabaseClient
        .from('teams')
        .select('*')
        .order('name');

      if (teamsError) throw teamsError;

      const teamsToProcess = categoryFilter === 'all' 
        ? teams 
        : teams.filter(t => t.category === categoryFilter);

      addLog(`📊 Found ${teamsToProcess.length} teams to process`, 'info');

      // Reset all team stats
      for (const team of teamsToProcess) {
        await supabaseClient
          .from('teams')
          .update({
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goals_for: 0,
            goals_against: 0,
            points: 0
          })
          .eq('id', team.id);
      }
      addLog('✅ Reset all team stats to zero', 'success');

      // Fetch all completed matches
      const { data: matches, error: matchesError } = await supabaseClient
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, category),
          away_team:teams!matches_away_team_id_fkey(id, name, category)
        `)
        .eq('status', 'completed');

      if (matchesError) throw matchesError;

      const matchesToProcess = categoryFilter === 'all'
        ? matches
        : matches.filter(m => m.home_team?.category === categoryFilter);

      addLog(`⚽ Found ${matchesToProcess.length} completed matches`, 'info');

      // Process each completed match
      for (const match of matchesToProcess) {
        if (!match.home_team_id || !match.away_team_id) {
          addLog(`⚠️ Skipping match with missing teams`, 'warning');
          continue;
        }

        const homeScore = match.home_score || 0;
        const awayScore = match.away_score || 0;

        // Fetch current team stats
        const { data: homeTeam } = await supabaseClient
          .from('teams')
          .select('*')
          .eq('id', match.home_team_id)
          .single();

        const { data: awayTeam } = await supabaseClient
          .from('teams')
          .select('*')
          .eq('id', match.away_team_id)
          .single();

        if (!homeTeam || !awayTeam) {
          addLog(`⚠️ Skipping match: teams not found`, 'warning');
          continue;
        }

        // Calculate new stats for home team
        let homeStats = {
          played: (homeTeam.played || 0) + 1,
          goals_for: (homeTeam.goals_for || 0) + homeScore,
          goals_against: (homeTeam.goals_against || 0) + awayScore
        };

        // Calculate new stats for away team
        let awayStats = {
          played: (awayTeam.played || 0) + 1,
          goals_for: (awayTeam.goals_for || 0) + awayScore,
          goals_against: (awayTeam.goals_against || 0) + homeScore
        };

        // Determine result
        if (homeScore > awayScore) {
          homeStats.won = (homeTeam.won || 0) + 1;
          homeStats.points = (homeTeam.points || 0) + 3;
          awayStats.lost = (awayTeam.lost || 0) + 1;
        } else if (homeScore < awayScore) {
          awayStats.won = (awayTeam.won || 0) + 1;
          awayStats.points = (awayTeam.points || 0) + 3;
          homeStats.lost = (homeTeam.lost || 0) + 1;
        } else {
          homeStats.drawn = (homeTeam.drawn || 0) + 1;
          homeStats.points = (homeTeam.points || 0) + 1;
          awayStats.drawn = (awayTeam.drawn || 0) + 1;
          awayStats.points = (awayTeam.points || 0) + 1;
        }

        // Update both teams
        await supabaseClient.from('teams').update(homeStats).eq('id', match.home_team_id);
        await supabaseClient.from('teams').update(awayStats).eq('id', match.away_team_id);

        addLog(`✓ Processed: ${homeTeam.name} ${homeScore}-${awayScore} ${awayTeam.name}`, 'success');
      }

      addLog('🎉 Recalculation complete!', 'success');
      addLog(`📈 Processed ${matchesToProcess.length} matches across ${teamsToProcess.length} teams`, 'info');

    } catch (error) {
      console.error('Error recalculating stats:', error);
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const syncMatchScoresFromGoals = async () => {
    if (!confirm('🔄 This will recalculate match scores from goal records.\n\nUse this if scores are out of sync with goals. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      setLog([]);
      addLog('🚀 Starting match score sync from goals...', 'info');

      // Fetch all matches
      const { data: matches, error: matchesError } = await supabaseClient
        .from('matches')
        .select('*');

      if (matchesError) throw matchesError;

      const matchesToProcess = categoryFilter === 'all'
        ? matches
        : matches.filter(m => m.category === categoryFilter);

      addLog(`⚽ Found ${matchesToProcess.length} matches to sync`, 'info');

      let synced = 0;
      let errors = 0;

      for (const match of matchesToProcess) {
        try {
          // Count goals for each team in this match
          const { data: homeGoals, error: homeError } = await supabaseClient
            .from('goals')
            .select('id')
            .eq('match_id', match.id)
            .eq('team_id', match.home_team_id);

          const { data: awayGoals, error: awayError } = await supabaseClient
            .from('goals')
            .select('id')
            .eq('match_id', match.id)
            .eq('team_id', match.away_team_id);

          if (homeError || awayError) throw new Error('Failed to fetch goals');

          const homeScore = homeGoals?.length || 0;
          const awayScore = awayGoals?.length || 0;

          // Update match scores if different
          if (match.home_score !== homeScore || match.away_score !== awayScore) {
            await supabaseClient
              .from('matches')
              .update({
                home_score: homeScore,
                away_score: awayScore
              })
              .eq('id', match.id);

            addLog(`✓ Synced match scores: ${homeScore}-${awayScore}`, 'success');
            synced++;
          }
        } catch (err) {
          addLog(`⚠️ Error processing match: ${err.message}`, 'warning');
          errors++;
        }
      }

      addLog(`🎉 Sync complete! ${synced} matches updated, ${errors} errors`, 'success');

    } catch (error) {
      console.error('Error syncing match scores:', error);
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Statistics Utilities">
      <div className="utilities-page">
        <div className="utilities-header">
          <h2>⚙️ Data Management Utilities</h2>
          <p className="utilities-description">
            Use these tools to maintain data integrity and fix inconsistencies
          </p>
        </div>

        <div className="category-filter">
          <label>Category Filter:</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Categories</option>
            <option value="open-age">Open Age</option>
            <option value="u17">U17</option>
          </select>
        </div>

        <div className="utilities-cards">
          <div className="utility-card">
            <div className="utility-icon">📊</div>
            <h3>Recalculate Team Statistics</h3>
            <p>
              Resets and recalculates all team statistics (played, won, drawn, lost, goals, points)
              from completed match results. Use this to fix data inconsistencies.
            </p>
            <button 
              className="btn-primary"
              onClick={recalculateAllStats}
              disabled={loading}
            >
              {loading ? '⏳ Processing...' : '🔄 Recalculate All Stats'}
            </button>
          </div>

          <div className="utility-card">
            <div className="utility-icon">⚽</div>
            <h3>Sync Match Scores from Goals</h3>
            <p>
              Recalculates match scores by counting goal records in the database.
              Use this if match scores don't match the recorded goals.
            </p>
            <button 
              className="btn-primary"
              onClick={syncMatchScoresFromGoals}
              disabled={loading}
            >
              {loading ? '⏳ Processing...' : '🔄 Sync Scores from Goals'}
            </button>
          </div>
        </div>

        {log.length > 0 && (
          <div className="utility-log">
            <h3>📝 Process Log</h3>
            <div className="log-content">
              {log.map((entry, index) => (
                <div key={index} className={`log-entry log-${entry.type}`}>
                  <span className="log-time">[{entry.timestamp}]</span>
                  <span className="log-message">{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .utilities-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .utilities-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .utilities-header h2 {
          font-size: 2rem;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .utilities-description {
          color: #666;
          font-size: 1.1rem;
        }

        .category-filter {
          background: white;
          padding: 15px 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .category-filter label {
          font-weight: 600;
          color: #333;
        }

        .category-filter select {
          padding: 8px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-filter select:focus {
          outline: none;
          border-color: #667eea;
        }

        .utilities-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .utility-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .utility-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }

        .utility-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .utility-card h3 {
          font-size: 1.4rem;
          margin-bottom: 10px;
          color: #333;
        }

        .utility-card p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .btn-primary {
          width: 100%;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .utility-log {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .utility-log h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .log-content {
          max-height: 400px;
          overflow-y: auto;
          background: #f9fafb;
          border-radius: 8px;
          padding: 15px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.9rem;
        }

        .log-entry {
          padding: 8px 12px;
          margin-bottom: 8px;
          border-radius: 6px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .log-time {
          color: #999;
          flex-shrink: 0;
        }

        .log-message {
          flex: 1;
        }

        .log-info {
          background: #eff6ff;
          color: #1e40af;
        }

        .log-success {
          background: #f0fdf4;
          color: #166534;
        }

        .log-warning {
          background: #fef9c3;
          color: #854d0e;
        }

        .log-error {
          background: #fef2f2;
          color: #991b1b;
        }

        @media (max-width: 768px) {
          .utilities-cards {
            grid-template-columns: 1fr;
          }
          
          .category-filter {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </AdminLayout>
  );
}


