import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import Footer from '../../../shared/Footer';

export default function Standings() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine category from URL
  const getCategory = () => {
    const path = window.location.pathname;
    if (path.includes('/u17/')) return 'u17';
    return 'open-age';
  };

  const [category] = useState(getCategory());

  useEffect(() => {
    fetchStandings();

    // Subscribe to real-time updates
    const subscription = supabaseClient
      .channel('standings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'teams' }, 
        () => {
          fetchStandings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchStandings = async () => {
    try {
      const { data: teamsData, error } = await supabaseClient
        .from('teams')
        .select('*')
        .eq('category', category)
        .order('points', { ascending: false })
        .order('goals_for', { ascending: false })
        .order('goals_against', { ascending: true });

      if (error) throw error;

      // Add position numbers
      const withPositions = teamsData.map((team, idx) => ({
        ...team,
        position: idx + 1,
        goal_difference: (team.goals_for || 0) - (team.goals_against || 0)
      }));

      setTeams(withPositions);
    } catch (error) {
      console.error('Error fetching standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = (teamId) => {
    window.location.href = `/muqawamah/2026/${category}/teams/?team=${teamId}`;
  };

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

  return (
    <>
      <TournamentNavbar />
      <div className="standings-page">
        <div className="standings-page-container">
          <h1 className="standings-page-title">STANDINGS</h1>
          
          <div className="standings-table-wrapper">
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
                  <th className="col-points">PTS</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr 
                    key={team.id} 
                    className="standings-table-row"
                    onClick={() => handleTeamClick(team.id)}
                  >
                    <td className="col-position">
                      <span className={`position-badge position-${team.position}`}>
                        {team.position}
                      </span>
                    </td>
                    <td className="col-team-full">
                      <div className="team-cell-full">
                        <div className="team-logo-standings">
                          {team.crest_url ? (
                            <img 
                              src={team.crest_url} 
                              alt={team.name}
                              loading="lazy"
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
                        {team.goal_difference >= 0 ? '+' : ''}{team.goal_difference}
                      </span>
                    </td>
                    <td className="col-points">
                      <span className="points-value">{team.points || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {teams.length === 0 && (
              <div className="no-standings">
                <i className="fas fa-table"></i>
                <p>No standings available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer edition="2026" />
    </>
  );
}

