/**
 * Tournament Configuration
 * Manage groups, knockout bracket, and auto-configure matches
 */

import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import { 
  getGroupStandings, 
  getTournamentSettings, 
  isGroupStageComplete,
  getKnockoutBracket,
  STANDARD_BRACKET 
} from '../../../lib/tournamentUtils';

export default function TournamentConfig() {
  const [category, setCategory] = useState('open-age');
  const [teams, setTeams] = useState([]);
  const [groupedTeams, setGroupedTeams] = useState({});
  const [settings, setSettings] = useState(null);
  const [bracket, setBracket] = useState(null);
  const [groupStageStatus, setGroupStageStatus] = useState({ total: 0, completed: 0, isComplete: false });
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState(false);

  useEffect(() => {
    fetchData();
  }, [category]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabaseClient
        .from('teams')
        .select('*')
        .eq('category', category)
        .order('name');

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Get grouped standings
      const standings = await getGroupStandings(category);
      setGroupedTeams(standings);

      // Get settings
      const settingsData = await getTournamentSettings(category);
      setSettings(settingsData);

      // Check group stage status
      const status = await isGroupStageComplete(category);
      setGroupStageStatus(status);

      // Get knockout bracket
      const bracketData = await getKnockoutBracket(category);
      setBracket(bracketData);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load tournament data');
    } finally {
      setLoading(false);
    }
  };

  const updateTeamGroup = async (teamId, group) => {
    try {
      const { error } = await supabaseClient
        .from('teams')
        .update({ tournament_group: group || null })
        .eq('id', teamId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating team group:', error);
      alert('Failed to update team group');
    }
  };

  const autoAssignGroups = async () => {
    if (!confirm('This will randomly assign all teams to groups. Continue?')) return;

    try {
      // Shuffle teams
      const shuffled = [...teams].sort(() => Math.random() - 0.5);
      const groups = ['A', 'B', 'C', 'D'];
      const teamsPerGroup = Math.ceil(shuffled.length / groups.length);

      // Assign teams to groups
      for (let i = 0; i < shuffled.length; i++) {
        const groupIndex = Math.floor(i / teamsPerGroup);
        const group = groups[Math.min(groupIndex, groups.length - 1)];
        
        await supabaseClient
          .from('teams')
          .update({ tournament_group: group })
          .eq('id', shuffled[i].id);
      }

      alert('Teams assigned to groups!');
      fetchData();
    } catch (error) {
      console.error('Error assigning groups:', error);
      alert('Failed to assign groups');
    }
  };

  const markGroupStageComplete = async () => {
    if (!groupStageStatus.isComplete) {
      alert(`Group stage is not complete!\n${groupStageStatus.completed}/${groupStageStatus.total} matches completed.`);
      return;
    }

    if (!confirm('Mark group stage as complete? This will allow knockout configuration.')) return;

    try {
      const { error } = await supabaseClient
        .from('tournament_settings')
        .upsert({
          category,
          group_stage_complete: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'category' });

      if (error) throw error;
      
      alert('Group stage marked as complete!');
      fetchData();
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    }
  };

  const configureKnockout = async () => {
    if (!settings?.group_stage_complete) {
      alert('Please mark group stage as complete first.');
      return;
    }

    if (!confirm('Configure knockout bracket? This will create quarter-final matches based on group standings.')) return;

    setConfiguring(true);
    try {
      // Get final group standings
      const standings = await getGroupStandings(category);
      
      // Extract qualified teams (top N from each group)
      const qualifyingCount = settings.teams_qualifying_per_group || 2;
      const qualifiedTeams = {};
      
      Object.entries(standings).forEach(([group, teams]) => {
        if (group !== 'Ungrouped') {
          teams.slice(0, qualifyingCount).forEach((team, idx) => {
            qualifiedTeams[`${group}${idx + 1}`] = team;
          });
        }
      });

      console.log('Qualified teams:', qualifiedTeams);

      // Clear existing knockout bracket
      await supabaseClient
        .from('knockout_bracket')
        .delete()
        .eq('category', category);

      // Delete existing knockout matches
      await supabaseClient
        .from('matches')
        .delete()
        .eq('category', category)
        .in('match_type', ['quarter-final', 'semi-final', 'final', 'third-place']);

      // Create Quarter-Final matches
      for (const qf of STANDARD_BRACKET.quarterFinals) {
        const homeTeam = qualifiedTeams[qf.home];
        const awayTeam = qualifiedTeams[qf.away];

        if (!homeTeam || !awayTeam) {
          console.warn(`Missing team for QF${qf.match}: ${qf.home} or ${qf.away}`);
          continue;
        }

        // Create match
        const { data: match, error: matchError } = await supabaseClient
          .from('matches')
          .insert({
            home_team_id: homeTeam.id,
            away_team_id: awayTeam.id,
            category,
            match_type: 'quarter-final',
            status: 'scheduled',
            match_number: qf.match
          })
          .select()
          .single();

        if (matchError) throw matchError;

        // Create bracket entry
        await supabaseClient
          .from('knockout_bracket')
          .insert({
            category,
            round: 'quarter-final',
            match_number: qf.match,
            home_slot: qf.home,
            away_slot: qf.away,
            home_team_id: homeTeam.id,
            away_team_id: awayTeam.id,
            match_id: match.id
          });
      }

      // Create Semi-Final bracket slots (teams will be filled after QF)
      for (const sf of STANDARD_BRACKET.semiFinals) {
        await supabaseClient
          .from('knockout_bracket')
          .insert({
            category,
            round: 'semi-final',
            match_number: sf.match,
            home_slot: sf.home,
            away_slot: sf.away
          });
      }

      // Create Final bracket slot
      await supabaseClient
        .from('knockout_bracket')
        .insert({
          category,
          round: 'final',
          match_number: 1,
          home_slot: STANDARD_BRACKET.final.home,
          away_slot: STANDARD_BRACKET.final.away
        });

      // Create Third Place bracket slot
      await supabaseClient
        .from('knockout_bracket')
        .insert({
          category,
          round: 'third-place',
          match_number: 1,
          home_slot: STANDARD_BRACKET.thirdPlace.home,
          away_slot: STANDARD_BRACKET.thirdPlace.away
        });

      alert('Knockout bracket configured! Quarter-final matches have been created.');
      fetchData();
    } catch (error) {
      console.error('Error configuring knockout:', error);
      alert('Failed to configure knockout: ' + error.message);
    } finally {
      setConfiguring(false);
    }
  };

  const getTeamsByGroup = (group) => {
    return teams.filter(t => t.tournament_group === group);
  };

  const getUnassignedTeams = () => {
    return teams.filter(t => !t.tournament_group);
  };

  if (loading) {
    return (
      <AdminLayout title="Tournament Configuration">
        <div className="admin-loading">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Tournament Configuration">
      <div className="tournament-config">
        {/* Category Selector */}
        <div className="config-header">
          <div className="category-selector">
            <label>Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="open-age">Open Age</option>
              <option value="u17">Under 17</option>
            </select>
          </div>
          
          <div className="config-stats">
            <span className="stat-badge">
              <i className="fas fa-users"></i> {teams.length} Teams
            </span>
            <span className="stat-badge">
              <i className="fas fa-futbol"></i> {groupStageStatus.completed}/{groupStageStatus.total} Matches
            </span>
            <span className={`stat-badge ${groupStageStatus.isComplete ? 'complete' : 'pending'}`}>
              {groupStageStatus.isComplete ? '✓ Group Stage Complete' : '○ Group Stage In Progress'}
            </span>
          </div>
        </div>

        {/* Group Assignment Section */}
        <div className="config-section">
          <div className="section-header">
            <h2><i className="fas fa-th-large"></i> Group Assignment</h2>
            <button className="btn-secondary" onClick={autoAssignGroups}>
              <i className="fas fa-random"></i> Auto-Assign Groups
            </button>
          </div>

          <div className="groups-grid">
            {['A', 'B', 'C', 'D'].map(group => (
              <div key={group} className="group-card">
                <h3 className="group-title">Group {group}</h3>
                <div className="group-teams">
                  {(groupedTeams[group] || []).map((team, idx) => (
                    <div key={team.id} className="group-team-row">
                      <span className="team-position">{idx + 1}</span>
                      <img 
                        src={team.crest_url || '/assets/img/default-crest.png'} 
                        alt="" 
                        className="team-crest-mini"
                      />
                      <span className="team-name">{team.name}</span>
                      <span className="team-stats">
                        {team.points || 0}pts | GD: {team.goal_difference >= 0 ? '+' : ''}{team.goal_difference || 0}
                      </span>
                      <button 
                        className="btn-icon remove"
                        onClick={() => updateTeamGroup(team.id, null)}
                        title="Remove from group"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                  {(groupedTeams[group] || []).length === 0 && (
                    <div className="empty-group">No teams assigned</div>
                  )}
                </div>
                
                {/* Add team dropdown */}
                <select 
                  className="add-team-select"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      updateTeamGroup(e.target.value, group);
                    }
                  }}
                >
                  <option value="">+ Add team to Group {group}</option>
                  {getUnassignedTeams().map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Unassigned Teams */}
          {getUnassignedTeams().length > 0 && (
            <div className="unassigned-teams">
              <h4><i className="fas fa-exclamation-triangle"></i> Unassigned Teams ({getUnassignedTeams().length})</h4>
              <div className="unassigned-list">
                {getUnassignedTeams().map(team => (
                  <div key={team.id} className="unassigned-team">
                    <img 
                      src={team.crest_url || '/assets/img/default-crest.png'} 
                      alt="" 
                      className="team-crest-mini"
                    />
                    <span>{team.name}</span>
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          updateTeamGroup(team.id, e.target.value);
                        }
                      }}
                    >
                      <option value="">Assign to...</option>
                      <option value="A">Group A</option>
                      <option value="B">Group B</option>
                      <option value="C">Group C</option>
                      <option value="D">Group D</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Knockout Configuration Section */}
        <div className="config-section">
          <div className="section-header">
            <h2><i className="fas fa-trophy"></i> Knockout Stage</h2>
          </div>

          <div className="knockout-actions">
            {!settings?.group_stage_complete ? (
              <button 
                className="btn-primary"
                onClick={markGroupStageComplete}
                disabled={!groupStageStatus.isComplete}
              >
                <i className="fas fa-check-circle"></i> Mark Group Stage Complete
              </button>
            ) : (
              <button 
                className="btn-primary"
                onClick={configureKnockout}
                disabled={configuring}
              >
                <i className="fas fa-cogs"></i> 
                {configuring ? 'Configuring...' : 'Configure Knockout Bracket'}
              </button>
            )}
          </div>

          {/* Bracket Preview */}
          {bracket && (bracket['quarter-final']?.length > 0) && (
            <div className="bracket-preview">
              <h3>Knockout Bracket</h3>
              
              <div className="bracket-rounds">
                {/* Quarter Finals */}
                <div className="bracket-round">
                  <h4>Quarter Finals</h4>
                  {bracket['quarter-final'].map(slot => (
                    <div key={slot.id} className="bracket-match">
                      <div className="bracket-team home">
                        {slot.home_team ? (
                          <>
                            <img src={slot.home_team.crest_url} alt="" />
                            <span>{slot.home_team.name}</span>
                          </>
                        ) : (
                          <span className="tbd">{slot.home_slot}</span>
                        )}
                        {slot.match?.status === 'completed' && (
                          <span className="score">{slot.match.home_score}</span>
                        )}
                      </div>
                      <div className="bracket-team away">
                        {slot.away_team ? (
                          <>
                            <img src={slot.away_team.crest_url} alt="" />
                            <span>{slot.away_team.name}</span>
                          </>
                        ) : (
                          <span className="tbd">{slot.away_slot}</span>
                        )}
                        {slot.match?.status === 'completed' && (
                          <span className="score">{slot.match.away_score}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Semi Finals */}
                <div className="bracket-round">
                  <h4>Semi Finals</h4>
                  {bracket['semi-final'].map(slot => (
                    <div key={slot.id} className="bracket-match">
                      <div className="bracket-team home">
                        {slot.home_team ? (
                          <>
                            <img src={slot.home_team.crest_url} alt="" />
                            <span>{slot.home_team.name}</span>
                          </>
                        ) : (
                          <span className="tbd">{slot.home_slot}</span>
                        )}
                      </div>
                      <div className="bracket-team away">
                        {slot.away_team ? (
                          <>
                            <img src={slot.away_team.crest_url} alt="" />
                            <span>{slot.away_team.name}</span>
                          </>
                        ) : (
                          <span className="tbd">{slot.away_slot}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final */}
                <div className="bracket-round final">
                  <h4>Final</h4>
                  {bracket['final'].map(slot => (
                    <div key={slot.id} className="bracket-match">
                      <div className="bracket-team home">
                        {slot.home_team ? (
                          <>
                            <img src={slot.home_team.crest_url} alt="" />
                            <span>{slot.home_team.name}</span>
                          </>
                        ) : (
                          <span className="tbd">{slot.home_slot}</span>
                        )}
                      </div>
                      <div className="bracket-team away">
                        {slot.away_team ? (
                          <>
                            <img src={slot.away_team.crest_url} alt="" />
                            <span>{slot.away_team.name}</span>
                          </>
                        ) : (
                          <span className="tbd">{slot.away_slot}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tiebreaker Rules Info */}
          <div className="tiebreaker-info">
            <h4><i className="fas fa-info-circle"></i> Tiebreaker Rules</h4>
            <ol>
              <li>Points (higher is better)</li>
              <li>Goal Difference (higher is better)</li>
              <li>Goals Scored (higher is better)</li>
              <li>Head-to-Head Result</li>
              <li>Yellow Cards (fewer is better)</li>
              <li>Red Cards (fewer is better)</li>
              <li>Alphabetical Order</li>
            </ol>
          </div>
        </div>
      </div>

      <style>{`
        .tournament-config {
          padding: 20px;
        }

        .config-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 16px;
          background: #1e2a38;
          border-radius: 8px;
        }

        .category-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .category-selector label {
          font-weight: 600;
          color: #8b9caf;
        }

        .category-selector select {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #2a3a4a;
          background: #0d1117;
          color: #fff;
          font-size: 14px;
        }

        .config-stats {
          display: flex;
          gap: 12px;
        }

        .stat-badge {
          padding: 8px 16px;
          background: #2a3a4a;
          border-radius: 20px;
          font-size: 13px;
          color: #8b9caf;
        }

        .stat-badge i {
          margin-right: 6px;
        }

        .stat-badge.complete {
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .stat-badge.pending {
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
        }

        .config-section {
          background: #1e2a38;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .group-card {
          background: #0d1117;
          border-radius: 10px;
          padding: 16px;
          border: 1px solid #2a3a4a;
        }

        .group-title {
          font-size: 16px;
          font-weight: 700;
          color: #4f8cff;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #4f8cff;
        }

        .group-teams {
          min-height: 120px;
        }

        .group-team-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          margin-bottom: 4px;
          background: #1e2a38;
          border-radius: 6px;
        }

        .team-position {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #4f8cff;
          color: #fff;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 700;
        }

        .team-crest-mini {
          width: 24px;
          height: 24px;
          object-fit: contain;
          border-radius: 4px;
        }

        .team-name {
          flex: 1;
          font-weight: 500;
          color: #fff;
          font-size: 13px;
        }

        .team-stats {
          font-size: 11px;
          color: #8b9caf;
        }

        .btn-icon {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-icon.remove {
          background: rgba(244, 67, 54, 0.2);
          color: #f44336;
        }

        .btn-icon.remove:hover {
          background: rgba(244, 67, 54, 0.4);
        }

        .empty-group {
          text-align: center;
          padding: 20px;
          color: #5a6a7a;
          font-style: italic;
        }

        .add-team-select {
          width: 100%;
          margin-top: 12px;
          padding: 8px;
          border-radius: 6px;
          border: 1px dashed #2a3a4a;
          background: transparent;
          color: #8b9caf;
          font-size: 13px;
          cursor: pointer;
        }

        .add-team-select:hover {
          border-color: #4f8cff;
        }

        .unassigned-teams {
          margin-top: 24px;
          padding: 16px;
          background: rgba(255, 152, 0, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(255, 152, 0, 0.3);
        }

        .unassigned-teams h4 {
          color: #ff9800;
          margin-bottom: 12px;
        }

        .unassigned-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .unassigned-team {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #1e2a38;
          border-radius: 6px;
        }

        .unassigned-team select {
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #2a3a4a;
          background: #0d1117;
          color: #fff;
          font-size: 12px;
        }

        .knockout-actions {
          margin-bottom: 24px;
        }

        .btn-primary {
          padding: 12px 24px;
          background: linear-gradient(135deg, #4f8cff, #6fb1fc);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: #2a3a4a;
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-secondary:hover {
          background: #3a4a5a;
        }

        .bracket-preview {
          margin-top: 24px;
        }

        .bracket-preview h3 {
          margin-bottom: 16px;
          color: #fff;
        }

        .bracket-rounds {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding: 16px 0;
        }

        .bracket-round {
          min-width: 240px;
        }

        .bracket-round h4 {
          color: #8b9caf;
          font-size: 13px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .bracket-round.final h4 {
          color: #ffd700;
        }

        .bracket-match {
          background: #0d1117;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 12px;
          border: 1px solid #2a3a4a;
        }

        .bracket-team {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
        }

        .bracket-team.home {
          border-bottom: 1px solid #2a3a4a;
        }

        .bracket-team img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .bracket-team span {
          flex: 1;
          font-size: 13px;
        }

        .bracket-team .tbd {
          color: #5a6a7a;
          font-style: italic;
        }

        .bracket-team .score {
          font-weight: 700;
          color: #4f8cff;
        }

        .tiebreaker-info {
          margin-top: 24px;
          padding: 16px;
          background: rgba(79, 140, 255, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(79, 140, 255, 0.2);
        }

        .tiebreaker-info h4 {
          color: #4f8cff;
          margin-bottom: 12px;
        }

        .tiebreaker-info ol {
          margin: 0;
          padding-left: 20px;
          color: #8b9caf;
        }

        .tiebreaker-info li {
          margin-bottom: 4px;
        }
      `}</style>
    </AdminLayout>
  );
}

