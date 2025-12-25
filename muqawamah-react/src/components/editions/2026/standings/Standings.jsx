import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import Footer from '../../../shared/Footer';
import { getGroupStandings, getTournamentSettings, calculateTeamCards } from '../../../../lib/tournamentUtils';
import SmartImg from '../../../shared/SmartImg';
import { useTournamentLiveUpdates } from '../../../../hooks/useTournamentLiveUpdates';
import { useFlashMap } from '../../../../hooks/useFlashMap';

export default function Standings() {
  const [groupedTeams, setGroupedTeams] = useState({});
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('groups'); // 'groups' or 'overall'
  const prevTeamSigRef = useRef(new Map()); // teamId -> signature string
  const { isFlashing: isTeamFlashing, flashKeys: flashTeams } = useFlashMap(900);

  // Determine category from URL
  const getCategory = () => {
    const path = window.location.pathname;
    if (path.includes('/u17/')) return 'u17';
    return 'open-age';
  };

  const [category] = useState(getCategory());

  useEffect(() => {
    fetchStandings();
  }, []);

  const refetchStandings = useCallback(() => {
    fetchStandings({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useTournamentLiveUpdates({
    enabled: true,
    channelKey: `standings:${category}`,
    // standings can change from match results/goals/cards/teams updates
    tables: ['matches', 'teams', 'cards', 'goals'],
    filtersByTable: {
      matches: `category=eq.${category}`,
      teams: `category=eq.${category}`
    },
    debounceMs: 800,
    pollIntervalMs: 10_000,
    onUpdate: refetchStandings
  });

  const fetchStandings = async ({ silent = false } = {}) => {
    try {
      // Get tournament settings
      const settingsData = await getTournamentSettings(category);
      setSettings(settingsData);

      // Get grouped standings with tiebreakers applied
      const standings = await getGroupStandings(category);

      // Detect changes (points/GD/GF/cards) and flash changed teams (only on silent refresh)
      if (silent && standings) {
        const changed = [];
        Object.values(standings).flat().forEach((t) => {
          const sig = `${t.points ?? ''}|${t.goal_difference ?? ''}|${t.goals_for ?? ''}|${t.goals_against ?? ''}|${t.yellow_cards ?? ''}|${t.red_cards ?? ''}`;
          const prev = prevTeamSigRef.current.get(t.id);
          if (prev && prev !== sig) changed.push(t.id);
          prevTeamSigRef.current.set(t.id, sig);
        });
        if (changed.length) flashTeams(changed);
      } else if (!silent && standings) {
        // initialize map
        Object.values(standings).flat().forEach((t) => {
          const sig = `${t.points ?? ''}|${t.goal_difference ?? ''}|${t.goals_for ?? ''}|${t.goals_against ?? ''}|${t.yellow_cards ?? ''}|${t.red_cards ?? ''}`;
          prevTeamSigRef.current.set(t.id, sig);
        });
      }

      setGroupedTeams(standings);

    } catch (error) {
      console.error('Error fetching standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = (teamId) => {
    window.location.href = `/muqawamah/2026/${category}/teams/?team=${teamId}`;
  };

  // Get all teams sorted for overall view
  const getAllTeamsSorted = () => {
    const allTeams = Object.values(groupedTeams).flat();
    return allTeams.sort((a, b) => {
      // Sort by points, then GD, then GF, then cards
      if (b.points !== a.points) return (b.points || 0) - (a.points || 0);
      if (b.goal_difference !== a.goal_difference) return (b.goal_difference || 0) - (a.goal_difference || 0);
      if ((b.goals_for || 0) !== (a.goals_for || 0)) return (b.goals_for || 0) - (a.goals_for || 0);
      if ((a.yellow_cards || 0) !== (b.yellow_cards || 0)) return (a.yellow_cards || 0) - (b.yellow_cards || 0);
      return (a.red_cards || 0) - (b.red_cards || 0);
    }).map((team, idx) => ({ ...team, position: idx + 1 }));
  };

  const renderTable = (teams, groupName = null) => (
    <div className="standings-table-wrapper" key={groupName || 'overall'}>
      {groupName && groupName !== 'Ungrouped' && (
        <div className="group-header">
          <span className="group-badge">Group {groupName}</span>
        </div>
      )}
      {groupName === 'Ungrouped' && teams.length > 0 && (
        <div className="group-header ungrouped">
          <span className="group-badge">Ungrouped Teams</span>
        </div>
      )}
      <table className="standings-table-full">
        <thead>
          <tr>
            <th className="col-position">#</th>
            <th className="col-team-full">TEAM</th>
            <th className="col-stat">P</th>
            <th className="col-stat">W</th>
            <th className="col-stat">D</th>
            <th className="col-stat">L</th>
            <th className="col-stat hide-mobile">GF</th>
            <th className="col-stat hide-mobile">GA</th>
            <th className="col-stat">GD</th>
            <th className="col-stat hide-mobile" title="Yellow Cards">YC</th>
            <th className="col-stat hide-mobile" title="Red Cards">RC</th>
            <th className="col-points">PTS</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, idx) => {
            const position = team.group_position || team.position || idx + 1;
            const isLastQualifier = position === (settings?.teams_qualifying_per_group || 2);
            
            return (
              <tr 
                key={team.id} 
                className={`standings-table-row ${isLastQualifier ? 'qualification-line' : ''}`}
                onClick={() => handleTeamClick(team.id)}
              >
                <td className="col-position">
                  <span className={`position-badge position-${position}`}>
                    {position}
                  </span>
                </td>
                <td className="col-team-full">
                  <div className="team-cell-full">
                    <div className="team-logo-standings">
                      {team.crest_url ? (
                        <SmartImg
                          src={team.crest_url} 
                          preset="crestSm"
                          alt={team.name}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span>{team.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <span className="team-name-full">{team.name}</span>
                  </div>
                </td>
                <td className="col-stat">{team.played || 0}</td>
                <td className="col-stat stat-wins">{team.won || 0}</td>
                <td className="col-stat stat-draws">{team.drawn || 0}</td>
                <td className="col-stat stat-losses">{team.lost || 0}</td>
                <td className="col-stat hide-mobile">{team.goals_for || 0}</td>
                <td className="col-stat hide-mobile">{team.goals_against || 0}</td>
                <td className="col-stat">
                  <span className={team.goal_difference >= 0 ? 'gd-positive' : 'gd-negative'}>
                    {team.goal_difference >= 0 ? '+' : ''}{team.goal_difference || 0}
                  </span>
                </td>
                <td className="col-stat hide-mobile">
                  <span className="card-stat yellow">{team.yellow_cards || 0}</span>
                </td>
                <td className="col-stat hide-mobile">
                  <span className="card-stat red">{team.red_cards || 0}</span>
                </td>
                <td className="col-points">
                  <span className={`points-value ${isTeamFlashing(team.id) ? 'value-flash' : ''}`}>{team.points || 0}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <>
        <TournamentNavbar />
        <div className="standings-loading">
          <div className="standings-loading-content">
            <div className="logo-loader">
              <div className="logo-ring"></div>
              <img src="/assets/img/muq_invert.png" alt="Muqawama" className="logo-pulse" />
            </div>
            <p>Loading standings...</p>
          </div>
        </div>
        <Footer edition="2026" />
      </>
    );
  }

  const groups = Object.keys(groupedTeams).filter(g => g !== 'Ungrouped').sort();
  const hasGroups = groups.length > 0;
  const ungroupedTeams = groupedTeams['Ungrouped'] || [];

  return (
    <>
      <TournamentNavbar />
      <div className="standings-page">
        <div className="standings-page-container">
          {/* Header - matches Statistics page */}
          <div className="standings-header-v2">
            <h1 className="standings-page-title">STANDINGS</h1>
            <hr className="standings-divider" />
          </div>

          {hasGroups && (
            <div className="standings-controls">
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${viewMode === 'groups' ? 'active' : ''}`}
                  onClick={() => setViewMode('groups')}
                >
                  <i className="fas fa-th-large"></i> Groups
                </button>
                <button 
                  className={`toggle-btn ${viewMode === 'overall' ? 'active' : ''}`}
                  onClick={() => setViewMode('overall')}
                >
                  <i className="fas fa-list"></i> Overall
                </button>
              </div>
            </div>
          )}


          {viewMode === 'groups' && hasGroups ? (
            <div className="groups-container">
              {groups.map(group => (
                <div key={group} className="group-standings">
                  {renderTable(groupedTeams[group], group)}
                </div>
              ))}
              {ungroupedTeams.length > 0 && (
                <div className="group-standings">
                  {renderTable(ungroupedTeams, 'Ungrouped')}
                </div>
              )}
            </div>
          ) : (
            renderTable(getAllTeamsSorted())
          )}

          {!hasGroups && ungroupedTeams.length === 0 && Object.keys(groupedTeams).length === 0 && (
            <div className="no-standings">
              <i className="fas fa-table"></i>
              <p>No standings available yet</p>
            </div>
          )}
        </div>
      </div>
      <Footer edition="2026" />

      <style>{`
        .standings-header-v2 {
          margin-bottom: 32px;
        }

        .standings-divider {
          border: none;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0;
        }

        .standings-controls {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .view-toggle {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 8px;
        }

        .toggle-btn {
          padding: 8px 16px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          border-radius: 6px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .toggle-btn:hover {
          color: #fff;
        }

        .toggle-btn.active {
          background: #4f8cff;
          color: #fff;
        }

        .groups-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
          gap: 24px;
        }

        @media (max-width: 768px) {
          .groups-container {
            grid-template-columns: 1fr;
          }
        }

        .group-header {
          padding: 12px 16px;
          background: linear-gradient(135deg, rgba(79, 140, 255, 0.2), rgba(79, 140, 255, 0.05));
          border-radius: 8px 8px 0 0;
          border-bottom: 2px solid #4f8cff;
        }

        .group-header.ungrouped {
          background: linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 152, 0, 0.05));
          border-bottom-color: #ff9800;
        }

        .group-badge {
          font-family: 'Oswald', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #4f8cff;
          letter-spacing: 1px;
        }

        .group-header.ungrouped .group-badge {
          color: #ff9800;
        }

        .standings-table-row.qualification-line {
          border-bottom: 2px solid #4f8cff !important;
        }

        .card-stat {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .card-stat.yellow {
          color: #ffc107;
        }

        .card-stat.red {
          color: #f44336;
        }
      `}</style>
    </>
  );
}
