/**
 * Tournament Configuration
 * Manage groups, knockout bracket, and auto-configure matches
 */

import React, { useMemo, useState, useEffect } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import { imgUrl } from '../../../lib/imagePresets';
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
  const [groupFixtures, setGroupFixtures] = useState([]);
  const [generatingFixtures, setGeneratingFixtures] = useState(false);
  const [fixturePreview, setFixturePreview] = useState(null);

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

      // Fetch existing group fixtures for this category
      const { data: fixturesData, error: fixturesError } = await supabaseClient
        .from('matches')
        .select(`
          id,
          match_number,
          match_date,
          scheduled_time,
          venue,
          status,
          match_type,
          category,
          home_team_id,
          away_team_id,
          home_team:teams!matches_home_team_id_fkey(id, name, crest_url, tournament_group),
          away_team:teams!matches_away_team_id_fkey(id, name, crest_url, tournament_group)
        `)
        .eq('category', category)
        .eq('match_type', 'group')
        .order('match_number', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (fixturesError) throw fixturesError;
      setGroupFixtures(fixturesData || []);

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

  const groups = useMemo(() => ['A', 'B', 'C', 'D'], []);

  const allAssigned = useMemo(() => getUnassignedTeams().length === 0, [teams]);

  const roundRobinSchedule = (teamIds) => {
    // Circle method. Returns rounds: [ [ [homeId, awayId], ...], ... ]
    const ids = [...(teamIds || [])].filter(Boolean);
    if (ids.length < 2) return [];

    const list = ids.length % 2 === 0 ? ids : [...ids, null]; // bye
    const n = list.length;
    const rounds = n - 1;
    const half = n / 2;

    let arr = [...list];
    const out = [];
    for (let r = 0; r < rounds; r++) {
      const pairs = [];
      for (let i = 0; i < half; i++) {
        const a = arr[i];
        const b = arr[n - 1 - i];
        if (!a || !b) continue;
        // Alternate home/away each round for balance
        const home = (r + i) % 2 === 0 ? a : b;
        const away = (r + i) % 2 === 0 ? b : a;
        pairs.push([home, away]);
      }
      out.push(pairs);
      // rotate all except first
      const fixed = arr[0];
      const rest = arr.slice(1);
      rest.unshift(rest.pop());
      arr = [fixed, ...rest];
    }
    return out;
  };

  const buildGroupFixturePreview = () => {
    const byGroup = {};
    let maxRounds = 0;
    groups.forEach((g) => {
      const ids = getTeamsByGroup(g).map((t) => t.id);
      const rounds = roundRobinSchedule(ids);
      byGroup[g] = rounds;
      maxRounds = Math.max(maxRounds, rounds.length);
    });

    const preview = [];
    // match_number: 1..maxRounds (shared matchday across all groups)
    for (let r = 0; r < maxRounds; r++) {
      groups.forEach((g) => {
        const pairs = byGroup[g][r] || [];
        pairs.forEach(([home, away]) => {
          preview.push({
            category,
            match_type: 'group',
            status: 'scheduled',
            match_number: r + 1,
            venue: 'Milli Model Ground',
            home_team_id: home,
            away_team_id: away
          });
        });
      });
    }
    return preview;
  };

  const previewAutoGenerateFixtures = () => {
    if (!allAssigned) {
      alert('Please assign all teams to groups first.');
      return;
    }
    const preview = buildGroupFixturePreview();
    if (!preview.length) {
      alert('Not enough teams assigned to generate fixtures.');
      return;
    }
    setFixturePreview(preview);
  };

  const createGroupStageFixtures = async () => {
    if (!fixturePreview?.length) return;
    const existingCount = groupFixtures.length;
    if (existingCount > 0) {
      alert(
        `You already have ${existingCount} group fixtures in this category.\n\n` +
        `For safety, this generator will NOT delete existing fixtures.\n` +
        `Please delete/clear them first if you want to regenerate.`
      );
      return;
    }

    if (!confirm(`Create ${fixturePreview.length} group-stage fixtures now?`)) return;

    setGeneratingFixtures(true);
    try {
      const { error } = await supabaseClient
        .from('matches')
        .insert(fixturePreview);
      if (error) throw error;

      alert('Group stage fixtures created! You can edit dates/times/venues in Fixtures Manager.');
      setFixturePreview(null);
      fetchData();
    } catch (error) {
      console.error('Error creating fixtures:', error);
      alert('Failed to create fixtures: ' + (error?.message || 'Unknown error'));
    } finally {
      setGeneratingFixtures(false);
    }
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
            {groups.map(group => (
              <div key={group} className="group-card">
                <h3 className="group-title">Group {group}</h3>
                <div className="group-teams">
                  {(groupedTeams[group] || []).map((team, idx) => (
                    <div key={team.id} className="group-team-row">
                      <span className="team-position">{idx + 1}</span>
                      <img 
                        src={team.crest_url ? imgUrl(team.crest_url, 'crestSm') : '/assets/img/default-crest.png'} 
                        alt="" 
                        className="team-crest-mini"
                        loading="lazy"
                        decoding="async"
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
                      src={team.crest_url ? imgUrl(team.crest_url, 'crestSm') : '/assets/img/default-crest.png'} 
                      alt="" 
                      className="team-crest-mini"
                      loading="lazy"
                      decoding="async"
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

        {/* Group Stage Fixtures */}
        <div className="config-section">
          <div className="section-header">
            <h2><i className="fas fa-calendar-alt"></i> Group Stage Fixtures</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a className="btn-secondary" href="/muqawamah/admin/fixtures/" style={{ textDecoration: 'none' }}>
                <i className="fas fa-external-link-alt"></i> Open Fixtures Manager
              </a>
              <button className="btn-primary" onClick={previewAutoGenerateFixtures} disabled={!allAssigned || generatingFixtures}>
                <i className="fas fa-magic"></i> Auto-Generate Fixtures
              </button>
            </div>
          </div>

          {!allAssigned && (
            <div className="callout warning">
              <i className="fas fa-exclamation-triangle"></i>
              Assign all teams to groups to enable auto-generation.
            </div>
          )}

          <div className="fixtures-summary">
            <span className="stat-badge">
              <i className="fas fa-futbol"></i> {groupFixtures.length} group fixtures
            </span>
          </div>

          {fixturePreview && (
            <div className="fixture-preview">
              <div className="fixture-preview-header">
                <h3>Preview ({fixturePreview.length} matches)</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn-secondary" onClick={() => setFixturePreview(null)} disabled={generatingFixtures}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={createGroupStageFixtures} disabled={generatingFixtures}>
                    {generatingFixtures ? 'Creating...' : 'Create Fixtures'}
                  </button>
                </div>
              </div>

              <div className="fixture-preview-grid">
                {fixturePreview.slice(0, 20).map((m, idx) => (
                  <div key={`${m.home_team_id}-${m.away_team_id}-${idx}`} className="fixture-preview-row">
                    <span className="fixture-md">MD {m.match_number}</span>
                    <span className="fixture-teams">
                      {teams.find(t => t.id === m.home_team_id)?.name || 'TBD'} vs {teams.find(t => t.id === m.away_team_id)?.name || 'TBD'}
                    </span>
                  </div>
                ))}
                {fixturePreview.length > 20 && (
                  <div className="fixture-preview-row muted">
                    …and {fixturePreview.length - 20} more
                  </div>
                )}
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
                            <img src={imgUrl(slot.home_team.crest_url, 'crestSm')} alt="" loading="lazy" decoding="async" />
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
                            <img src={imgUrl(slot.away_team.crest_url, 'crestSm')} alt="" loading="lazy" decoding="async" />
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
                            <img src={imgUrl(slot.home_team.crest_url, 'crestSm')} alt="" loading="lazy" decoding="async" />
                            <span>{slot.home_team.name}</span>
                          </>
                        ) : (
                          <span className="tbd">{slot.home_slot}</span>
                        )}
                      </div>
                      <div className="bracket-team away">
                        {slot.away_team ? (
                          <>
                            <img src={imgUrl(slot.away_team.crest_url, 'crestSm')} alt="" loading="lazy" decoding="async" />
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
                            <img src={imgUrl(slot.home_team.crest_url, 'crestSm')} alt="" loading="lazy" decoding="async" />
                            <span>{slot.home_team.name}</span>
                          </>
                        ) : (
                          <span className="tbd">{slot.home_slot}</span>
                        )}
                      </div>
                      <div className="bracket-team away">
                        {slot.away_team ? (
                          <>
                            <img src={imgUrl(slot.away_team.crest_url, 'crestSm')} alt="" loading="lazy" decoding="async" />
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
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .category-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .category-selector label {
          font-weight: 600;
          color: #374151;
        }

        .category-selector select {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #111827;
          font-size: 14px;
        }

        .config-stats {
          display: flex;
          gap: 12px;
        }

        .stat-badge {
          padding: 8px 16px;
          background: #f3f4f6;
          border-radius: 20px;
          font-size: 13px;
          color: #374151;
        }

        .stat-badge i {
          margin-right: 6px;
        }

        .stat-badge.complete {
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
        }

        .stat-badge.pending {
          background: rgba(245, 158, 11, 0.12);
          color: #92400e;
        }

        .config-section {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
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
          color: #111827;
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
          background: #ffffff;
          border-radius: 10px;
          padding: 16px;
          border: 1px solid #e5e7eb;
        }

        .group-title {
          font-size: 16px;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #2563eb;
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
          background: #f9fafb;
          border-radius: 6px;
          border: 1px solid #eef2f7;
        }

        .team-position {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #2563eb;
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
          color: #111827;
          font-size: 13px;
        }

        .team-stats {
          font-size: 11px;
          color: #6b7280;
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
          color: #6b7280;
          font-style: italic;
        }

        .add-team-select {
          width: 100%;
          margin-top: 12px;
          padding: 8px;
          border-radius: 6px;
          border: 1px dashed #d1d5db;
          background: #ffffff;
          color: #374151;
          font-size: 13px;
          cursor: pointer;
        }

        .add-team-select:hover {
          border-color: #4f8cff;
        }

        .unassigned-teams {
          margin-top: 24px;
          padding: 16px;
          background: rgba(245, 158, 11, 0.10);
          border-radius: 8px;
          border: 1px solid rgba(245, 158, 11, 0.25);
        }

        .unassigned-teams h4 {
          color: #92400e;
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
          background: #ffffff;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .unassigned-team select {
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #111827;
          font-size: 12px;
        }

        .knockout-actions {
          margin-bottom: 24px;
        }

        .btn-primary {
          padding: 12px 24px;
          background: linear-gradient(135deg, #2563eb, #60a5fa);
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
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          color: #111827;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .bracket-preview {
          margin-top: 24px;
        }

        .bracket-preview h3 {
          margin-bottom: 16px;
          color: #111827;
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
          color: #6b7280;
          font-size: 13px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .bracket-round.final h4 {
          color: #ffd700;
        }

        .bracket-match {
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 12px;
          border: 1px solid #e5e7eb;
        }

        .bracket-team {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
        }

        .bracket-team.home {
          border-bottom: 1px solid #e5e7eb;
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
          color: #6b7280;
          font-style: italic;
        }

        .bracket-team .score {
          font-weight: 700;
          color: #2563eb;
        }

        .tiebreaker-info {
          margin-top: 24px;
          padding: 16px;
          background: rgba(37, 99, 235, 0.08);
          border-radius: 8px;
          border: 1px solid rgba(37, 99, 235, 0.18);
        }

        .tiebreaker-info h4 {
          color: #2563eb;
          margin-bottom: 12px;
        }

        .tiebreaker-info ol {
          margin: 0;
          padding-left: 20px;
          color: #374151;
        }

        .tiebreaker-info li {
          margin-bottom: 4px;
        }

        .fixtures-summary {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .fixture-preview {
          margin-top: 14px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          background: #f9fafb;
        }

        .fixture-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .fixture-preview-header h3 {
          margin: 0;
          color: #111827;
          font-size: 16px;
          font-weight: 700;
        }

        .fixture-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 8px;
        }

        .fixture-preview-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid #eef2f7;
          border-radius: 8px;
        }

        .fixture-preview-row.muted {
          color: #6b7280;
          font-style: italic;
          justify-content: center;
        }

        .fixture-md {
          font-weight: 700;
          color: #2563eb;
          min-width: 60px;
        }

        .fixture-teams {
          color: #111827;
          font-weight: 500;
        }

        .callout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          color: #374151;
          margin-bottom: 12px;
        }

        .callout.warning {
          border-color: rgba(245, 158, 11, 0.35);
          background: rgba(245, 158, 11, 0.10);
          color: #92400e;
        }
      `}</style>
    </AdminLayout>
  );
}

