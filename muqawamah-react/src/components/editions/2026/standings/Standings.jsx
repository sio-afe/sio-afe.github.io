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

  // isGroupView = true means we hide YC/RC columns for cleaner look
  const renderTable = (teams, groupName = null, isGroupView = false) => (
    <div className={`standings-table-wrapper ${isGroupView ? 'group-card' : ''}`} key={groupName || 'overall'}>
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
            {!isGroupView && <th className="col-stat hide-mobile" title="Yellow Cards">YC</th>}
            {!isGroupView && <th className="col-stat hide-mobile" title="Red Cards">RC</th>}
            <th className="col-points">PTS</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, idx) => {
            // In group view use group_position, in overall use the passed position (overall rank)
            const position = isGroupView ? (team.group_position || idx + 1) : (team.position || idx + 1);
            const teamsPerGroup = settings?.teams_qualifying_per_group || 2;
            const numGroups = Object.keys(groupedTeams).filter(g => g !== 'Ungrouped').length || 1;
            const totalQualifyingSpots = isGroupView ? teamsPerGroup : (numGroups * teamsPerGroup);
            const isLastQualifier = position === totalQualifyingSpots;
            
            return (
              <tr 
                key={team.id} 
                className={`standings-table-row ${isLastQualifier ? 'qualification-line' : ''}`}
                onClick={() => handleTeamClick(team.id)}
              >
                <td className="col-position">
                  <span className="standings-rank">
                    {position}
                  </span>
                </td>
                <td className="col-team-full">
                  <div className="team-cell-full" title={team.name}>
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
                {!isGroupView && (
                  <td className="col-stat hide-mobile">
                    <span className="card-stat yellow">{team.yellow_cards || 0}</span>
                  </td>
                )}
                {!isGroupView && (
                  <td className="col-stat hide-mobile">
                    <span className="card-stat red">{team.red_cards || 0}</span>
                  </td>
                )}
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
            <div className="standings-tabs-container">
              <div className="standings-tabs">
                <button 
                  className={`standings-tab ${viewMode === 'groups' ? 'active' : ''}`}
                  onClick={() => setViewMode('groups')}
                >
                  <i className="fas fa-th-large"></i>
                  <span>Groups</span>
                </button>
                <button 
                  className={`standings-tab ${viewMode === 'overall' ? 'active' : ''}`}
                  onClick={() => setViewMode('overall')}
                >
                  <i className="fas fa-list"></i>
                  <span>Overall</span>
                </button>
                <span 
                  className="standings-tab-slider" 
                  style={{ 
                    transform: `translateX(${viewMode === 'overall' ? '100%' : '0%'})` 
                  }}
                />
              </div>
            </div>
          )}


          {viewMode === 'groups' && hasGroups ? (
            <div className="groups-container">
              {groups.map(group => (
                <div key={group} className="group-standings">
                  {renderTable(groupedTeams[group], group, true)}
                </div>
              ))}
              {ungroupedTeams.length > 0 && (
                <div className="group-standings">
                  {renderTable(ungroupedTeams, 'Ungrouped', true)}
                </div>
              )}
            </div>
          ) : (
            renderTable(getAllTeamsSorted(), null, false)
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

        .standings-page-title {
          text-align: left;
        }

        .standings-divider {
          border: none;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0;
        }

        /* Capsule Tab Navigation */
        .standings-tabs-container {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
        }

        .standings-tabs {
          position: relative;
          display: inline-flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50px;
          padding: 6px;
          gap: 0;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(79, 140, 255, 0.15);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .standings-tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Oswald', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 14px 32px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.55);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          z-index: 2;
          white-space: nowrap;
          border-radius: 50px;
        }

        .standings-tab i {
          font-size: 0.9rem;
        }

        .standings-tab:hover {
          color: rgba(255, 255, 255, 0.85);
        }

        .standings-tab.active {
          color: #fff;
        }

        .standings-tab-slider {
          position: absolute;
          top: 6px;
          left: 6px;
          width: calc(50% - 6px);
          height: calc(100% - 12px);
          background: linear-gradient(135deg, #4f8cff, #6ecdee);
          border-radius: 50px;
          transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          z-index: 1;
          box-shadow: 0 4px 12px rgba(79, 140, 255, 0.4);
        }

        .groups-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
        }

        @media (max-width: 1100px) {
          .groups-container {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        .group-standings {
          animation: fadeSlideUp 0.4s ease-out backwards;
        }
        .group-standings:nth-child(1) { animation-delay: 0s; }
        .group-standings:nth-child(2) { animation-delay: 0.08s; }
        .group-standings:nth-child(3) { animation-delay: 0.16s; }
        .group-standings:nth-child(4) { animation-delay: 0.24s; }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .standings-table-wrapper.group-card {
          background: linear-gradient(180deg, rgba(20, 30, 50, 0.95) 0%, rgba(15, 22, 40, 0.9) 100%);
          border: 1px solid rgba(79, 140, 255, 0.15);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.02) inset;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .standings-table-wrapper.group-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(79, 140, 255, 0.1);
        }

        .group-header {
          padding: 16px 20px;
          background: linear-gradient(135deg, rgba(79, 140, 255, 0.18), rgba(79, 140, 255, 0.05));
          border-bottom: 1px solid rgba(79, 140, 255, 0.25);
          position: relative;
          overflow: hidden;
        }

        .group-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(79, 140, 255, 0.5), transparent);
        }

        .group-header.ungrouped {
          background: linear-gradient(135deg, rgba(255, 152, 0, 0.18), rgba(255, 152, 0, 0.05));
          border-bottom-color: rgba(255, 152, 0, 0.25);
        }

        .group-header.ungrouped::before {
          background: linear-gradient(90deg, transparent, rgba(255, 152, 0, 0.5), transparent);
        }

        .group-badge {
          font-family: 'Oswald', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #6fb1fc;
          letter-spacing: 2px;
          text-shadow: 0 0 20px rgba(79, 140, 255, 0.3);
        }

        .group-header.ungrouped .group-badge {
          color: #ffb74d;
          text-shadow: 0 0 20px rgba(255, 152, 0, 0.3);
        }

        .standings-table-row.qualification-line {
          border-bottom: 2px solid #4f8cff !important;
          position: relative;
        }

        .standings-table-row.qualification-line::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 5%, #4f8cff 30%, #6fb1fc 50%, #4f8cff 70%, transparent 95%);
          box-shadow: 0 0 10px rgba(79, 140, 255, 0.5);
        }

        .card-stat {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .card-stat.yellow {
          color: #ffc107;
          text-shadow: 0 0 8px rgba(255, 193, 7, 0.3);
        }

        .card-stat.red {
          color: #f44336;
          text-shadow: 0 0 8px rgba(244, 67, 54, 0.3);
        }

        /* Points highlight for group view */
        .group-card .points-value {
          background: linear-gradient(135deg, #4f8cff, #6fb1fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1rem;
        }

        /* GD styling */
        .gd-positive {
          color: #4ade80 !important;
        }

        .gd-negative {
          color: #f87171 !important;
        }

        /* Wins/Draws/Losses subtle colors */
        .stat-wins {
          color: #4ade80 !important;
        }

        .stat-losses {
          color: #f87171 !important;
        }

      `}</style>
    </>
  );
}
