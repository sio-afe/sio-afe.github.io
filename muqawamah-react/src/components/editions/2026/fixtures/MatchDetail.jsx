import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import Footer from '../../../shared/Footer';
import MatchFormationField from '../../../shared/MatchFormationField';
import LikeButton from './components/LikeButton';
import MatchHeader from './components/MatchHeader';
import MatchPredictions from './components/MatchPredictions';
import GoalsAndHighlights from './components/GoalsAndHighlights';
import SquadsSection from './components/SquadsSection';
import { MatchShareCard, PrewarmMatchShareCard, ShareButton } from '../../../shared/ShareableCard';

export default function MatchDetail({ matchId, onBack }) {
  const [match, setMatch] = useState(null);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction states
  const [likeCount, setLikeCount] = useState(0);
  const [userIdentifier, setUserIdentifier] = useState(null);
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Prediction states
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  
  // User prediction states
  const [userPrediction, setUserPrediction] = useState(null); // 'home', 'draw', 'away'
  const [userPredictionStats, setUserPredictionStats] = useState({
    home: 0,
    draw: 0,
    away: 0
  });


  // Generate or retrieve user identifier (browser fingerprint)
  useEffect(() => {
    const getOrCreateUserIdentifier = () => {
      let identifier = localStorage.getItem('user_identifier');
      if (!identifier) {
        // Create a simple fingerprint based on browser characteristics
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Fingerprint', 2, 2);
        const fingerprint = canvas.toDataURL();
        
        identifier = btoa(
          navigator.userAgent +
          navigator.language +
          screen.width +
          screen.height +
          new Date().getTimezoneOffset() +
          fingerprint
        ).substring(0, 32);
        localStorage.setItem('user_identifier', identifier);
      }
      setUserIdentifier(identifier);
    };
    
    getOrCreateUserIdentifier();
  }, []);

  useEffect(() => {
    if (matchId) {
      fetchMatchData();
    }
  }, [matchId]);

  useEffect(() => {
    if (matchId && userIdentifier && match) {
      fetchInteractions();
    }
  }, [matchId, userIdentifier, match]);

  useEffect(() => {
    // Predict score if match is not finished
    if (match && match.status !== 'completed' && match.status !== 'live' && match.home_team_id && match.away_team_id) {
      predictMatchScore();
    }
  }, [match]);


  const fetchMatchData = async () => {
    try {
      setLoading(true);

      // Fetch match details - only select needed columns
      const { data: matchData, error: matchError } = await supabaseClient
        .from('matches')
        .select(`
          id,
          match_number,
          match_date,
          scheduled_time,
          home_team_id,
          away_team_id,
          home_score,
          away_score,
          status,
          category,
          match_type,
          venue,
          home_team:teams!matches_home_team_id_fkey(id, name, crest_url, category),
          away_team:teams!matches_away_team_id_fkey(id, name, crest_url, category)
        `)
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;
      setMatch(matchData);

      // Fetch goals and cards in parallel
      const [goalsResult, cardsResult] = await Promise.all([
        supabaseClient
          .from('goals')
          .select(`
            id,
            match_id,
            team_id,
            scorer_id,
            assister_id,
            minute,
            goal_type,
            scorer:team_players!goals_scorer_id_fkey(id, player_name, player_image),
            assister:team_players!goals_assister_id_fkey(id, player_name, player_image)
          `)
          .eq('match_id', matchId)
          .order('minute', { ascending: true }),
        supabaseClient
          .from('cards')
          .select(`
            id,
            match_id,
            team_id,
            player_id,
            card_type,
            minute,
            player:team_players!cards_player_id_fkey(id, player_name, player_image)
          `)
          .eq('match_id', matchId)
          .order('minute', { ascending: true })
      ]);

      const goalsData = goalsResult.data;
      const cardsData = cardsResult.data;

      if (goalsData) {
        // Batch fetch all player IDs that need lookup from players table
        const playerIdsToLookup = new Set();
        goalsData.forEach(goal => {
          if (goal.scorer_id && !goal.scorer?.player_name) {
            playerIdsToLookup.add(goal.scorer_id);
          }
          if (goal.assister_id && !goal.assister?.player_name) {
            playerIdsToLookup.add(goal.assister_id);
          }
        });

        // Batch fetch all players in one query
        let playersMap = {};
        if (playerIdsToLookup.size > 0) {
          const { data: playersData } = await supabaseClient
            .from('players')
            .select('name, player_image, registration_player_id')
            .in('registration_player_id', Array.from(playerIdsToLookup));
          
          if (playersData) {
            playersData.forEach(player => {
              if (player.registration_player_id) {
                playersMap[player.registration_player_id] = player;
              }
            });
          }
        }

        // Map goals with player data
        const goalsWithPlayers = goalsData.map((goal) => {
          let scorerName = goal.scorer?.player_name || null;
          let assisterName = goal.assister?.player_name || null;
          let scorerImage = goal.scorer?.player_image || null;
          let assisterImage = goal.assister?.player_image || null;

          // Use players table data if available
          if (goal.scorer_id && !scorerName && playersMap[goal.scorer_id]) {
            scorerName = playersMap[goal.scorer_id].name;
            scorerImage = playersMap[goal.scorer_id].player_image || scorerImage;
          }

          if (goal.assister_id && !assisterName && playersMap[goal.assister_id]) {
            assisterName = playersMap[goal.assister_id].name;
            assisterImage = playersMap[goal.assister_id].player_image || assisterImage;
          }

          return {
            ...goal,
            scorer: scorerName ? { player_name: scorerName, player_image: scorerImage } : null,
            assister: assisterName ? { player_name: assisterName, player_image: assisterImage } : null
          };
        });

        setGoals(goalsWithPlayers);
      }

      if (cardsData) {
        // Batch fetch all player IDs that need lookup from players table
        const cardPlayerIdsToLookup = new Set();
        cardsData.forEach(card => {
          if (card.player_id && !card.player?.player_name) {
            cardPlayerIdsToLookup.add(card.player_id);
          }
        });

        // Batch fetch all players in one query
        let cardPlayersMap = {};
        if (cardPlayerIdsToLookup.size > 0) {
          const { data: cardPlayersData } = await supabaseClient
            .from('players')
            .select('name, player_image, registration_player_id')
            .in('registration_player_id', Array.from(cardPlayerIdsToLookup));
          
          if (cardPlayersData) {
            cardPlayersData.forEach(player => {
              if (player.registration_player_id) {
                cardPlayersMap[player.registration_player_id] = player;
              }
            });
          }
        }

        // Map cards with player data
        const cardsWithPlayers = cardsData.map((card) => {
          let playerName = card.player?.player_name || null;

          // Use players table data if available
          if (card.player_id && !playerName && cardPlayersMap[card.player_id]) {
            playerName = cardPlayersMap[card.player_id].name;
          }

          return {
            ...card,
            player: playerName ? { player_name: playerName } : null
          };
        });

        setCards(cardsWithPlayers);
      }

      // Fetch both teams' players in parallel - only select needed columns
      if (matchData.home_team?.id && matchData.away_team?.id) {
        const [homePlayersResult, awayPlayersResult] = await Promise.all([
          supabaseClient
            .from('players')
            .select('id, name, player_image, position, position_x, position_y, is_substitute, team_id, registration_player_id')
            .eq('team_id', matchData.home_team.id)
            .order('position'),
          supabaseClient
            .from('players')
            .select('id, name, player_image, position, position_x, position_y, is_substitute, team_id, registration_player_id')
            .eq('team_id', matchData.away_team.id)
            .order('position')
        ]);

        if (homePlayersResult.data) setHomeTeamPlayers(homePlayersResult.data);
        if (awayPlayersResult.data) setAwayTeamPlayers(awayPlayersResult.data);
      }

    } catch (error) {
      console.error('Error fetching match:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch likes and user predictions for this match
  const fetchInteractions = async () => {
    if (!matchId || !userIdentifier || !match) return;

    try {
      // Fetch like count
      const { data: likesData } = await supabaseClient
        .from('match_likes')
        .select('id')
        .eq('match_id', matchId);

      if (likesData) {
        setLikeCount(likesData.length);
      } else {
        setLikeCount(0);
      }

      // Fetch user predictions
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
        setUserPredictionStats(stats);

        // Check if user has predicted
        const { data: userPred } = await supabaseClient
          .from('match_predictions')
          .select('prediction')
          .eq('match_id', matchId)
          .eq('user_identifier', userIdentifier)
          .maybeSingle();

        if (userPred) {
          setUserPrediction(userPred.prediction);
        }
      }
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  // Handle user prediction update
  const handlePredictionUpdate = (newPrediction) => {
    setUserPrediction(newPrediction);
  };

  // Handle stats update
  const handleStatsUpdate = (newStats) => {
    setUserPredictionStats(newStats);
  };

  // Predict match score using ML algorithm
  const predictMatchScore = async () => {
    if (!match || !match.home_team_id || !match.away_team_id) return;

    setPredictionLoading(true);
    try {
      // Fetch team statistics
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
        setPredictionLoading(false);
        return;
      }

      // Fetch recent matches for both teams (last 2 matches only)
      const { data: homeMatches } = await supabaseClient
        .from('matches')
        .select('home_score, away_score, home_team_id, away_team_id')
        .or(`home_team_id.eq.${match.home_team_id},away_team_id.eq.${match.home_team_id}`)
        .eq('status', 'completed')
        .order('match_date', { ascending: false })
        .limit(2);

      const { data: awayMatches } = await supabaseClient
        .from('matches')
        .select('home_score, away_score, home_team_id, away_team_id')
        .or(`home_team_id.eq.${match.away_team_id},away_team_id.eq.${match.away_team_id}`)
        .eq('status', 'completed')
        .order('match_date', { ascending: false })
        .limit(2);

      // Calculate average goals scored/conceded for home team
      let homeGoalsScored = 0;
      let homeGoalsConceded = 0;
      let homeMatchCount = 0;

      if (homeMatches && homeMatches.length > 0) {
        homeMatches.forEach(m => {
          if (m.home_team_id === match.home_team_id) {
            homeGoalsScored += m.home_score || 0;
            homeGoalsConceded += m.away_score || 0;
            homeMatchCount++;
          } else {
            homeGoalsScored += m.away_score || 0;
            homeGoalsConceded += m.home_score || 0;
            homeMatchCount++;
          }
        });
      }

      // Calculate average goals scored/conceded for away team
      let awayGoalsScored = 0;
      let awayGoalsConceded = 0;
      let awayMatchCount = 0;

      if (awayMatches && awayMatches.length > 0) {
        awayMatches.forEach(m => {
          if (m.home_team_id === match.away_team_id) {
            awayGoalsScored += m.home_score || 0;
            awayGoalsConceded += m.away_score || 0;
            awayMatchCount++;
          } else {
            awayGoalsScored += m.away_score || 0;
            awayGoalsConceded += m.home_score || 0;
            awayMatchCount++;
          }
        });
      }

      // Calculate league averages FIRST (needed for fallback in first matches)
      // This is needed for first matches and normalization
      const { data: allTeams } = await supabaseClient
        .from('teams')
        .select('goals_for, goals_against, played')
        .eq('category', match.category || 'open-age')
        .gt('played', 0);

      let leagueAvgGoalsScored = 1.5; // Default fallback
      let leagueAvgGoalsConceded = 1.5; // Default fallback
      
      if (allTeams && allTeams.length > 0) {
        const totalGoalsFor = allTeams.reduce((sum, t) => sum + (t.goals_for || 0), 0);
        const totalGoalsAgainst = allTeams.reduce((sum, t) => sum + (t.goals_against || 0), 0);
        const totalPlayed = allTeams.reduce((sum, t) => sum + (t.played || 0), 0);
        
        if (totalPlayed > 0) {
          leagueAvgGoalsScored = totalGoalsFor / totalPlayed;
          leagueAvgGoalsConceded = totalGoalsAgainst / totalPlayed;
        }
      }

      // Calculate averages (prefer last 2 matches, fallback to overall stats, then league average)
      // For first matches, use overall stats if available, otherwise use league average
      const homeAvgScored = homeMatchCount > 0 
        ? homeGoalsScored / homeMatchCount 
        : (homeTeam.played > 0 
          ? (homeTeam.goals_for || 0) / homeTeam.played 
          : leagueAvgGoalsScored);
      
      const homeAvgConceded = homeMatchCount > 0 
        ? homeGoalsConceded / homeMatchCount 
        : (homeTeam.played > 0 
          ? (homeTeam.goals_against || 0) / homeTeam.played 
          : leagueAvgGoalsConceded);
      
      const awayAvgScored = awayMatchCount > 0 
        ? awayGoalsScored / awayMatchCount 
        : (awayTeam.played > 0 
          ? (awayTeam.goals_for || 0) / awayTeam.played 
          : leagueAvgGoalsScored);
      
      const awayAvgConceded = awayMatchCount > 0 
        ? awayGoalsConceded / awayMatchCount 
        : (awayTeam.played > 0 
          ? (awayTeam.goals_against || 0) / awayTeam.played 
          : leagueAvgGoalsConceded);

      // ML Prediction Algorithm (Improved Poisson-based approach)
      // Step 1: Calculate normalized attack/defense strength relative to league average
      // Attack strength > 1.0 means better than average, < 1.0 means worse
      // For first matches (no data), assume average strength (1.0)
      const homeAttackStrength = (homeMatchCount === 0 && homeTeam.played === 0) 
        ? 1.0 
        : (leagueAvgGoalsScored > 0 ? homeAvgScored / leagueAvgGoalsScored : 1.0);
      
      const homeDefenseStrength = (homeMatchCount === 0 && homeTeam.played === 0)
        ? 1.0
        : (leagueAvgGoalsConceded > 0 ? homeAvgConceded / leagueAvgGoalsConceded : 1.0);
      
      const awayAttackStrength = (awayMatchCount === 0 && awayTeam.played === 0)
        ? 1.0
        : (leagueAvgGoalsScored > 0 ? awayAvgScored / leagueAvgGoalsScored : 1.0);
      
      const awayDefenseStrength = (awayMatchCount === 0 && awayTeam.played === 0)
        ? 1.0
        : (leagueAvgGoalsConceded > 0 ? awayAvgConceded / leagueAvgGoalsConceded : 1.0);

      // Step 2: Calculate expected goals using Poisson model
      // Expected goals = (team's attack strength) * (opponent's defense weakness) * (league average) * (home advantage)
      const homeAdvantage = 1.12; // Home teams typically score 12% more
      
      // Home team expected goals = their attack strength × away team's defensive weakness × league avg × home advantage
      const homeExpectedGoals = homeAttackStrength * (1 / awayDefenseStrength) * leagueAvgGoalsScored * homeAdvantage;
      
      // Away team expected goals = their attack strength × home team's defensive weakness × league avg
      const awayExpectedGoals = awayAttackStrength * (1 / homeDefenseStrength) * leagueAvgGoalsScored;

      // Convert to Poisson distribution and get most likely scores
      const homePredicted = Math.round(homeExpectedGoals);
      const awayPredicted = Math.round(awayExpectedGoals);

      // Calculate win/draw probabilities using Poisson distribution
      const calculatePoisson = (lambda, k) => {
        if (lambda <= 0) return k === 0 ? 1 : 0;
        let logProb = -lambda + k * Math.log(lambda);
        for (let i = 2; i <= k; i++) {
          logProb -= Math.log(i);
        }
        return Math.exp(logProb);
      };

      // Calculate probabilities for all possible score combinations (0-5 goals each)
      let homeWinProb = 0;
      let drawProb = 0;
      let awayWinProb = 0;

      for (let homeGoals = 0; homeGoals <= 5; homeGoals++) {
        for (let awayGoals = 0; awayGoals <= 5; awayGoals++) {
          const prob = calculatePoisson(homeExpectedGoals, homeGoals) * calculatePoisson(awayExpectedGoals, awayGoals);
          
          if (homeGoals > awayGoals) {
            homeWinProb += prob;
          } else if (homeGoals === awayGoals) {
            drawProb += prob;
          } else {
            awayWinProb += prob;
          }
        }
      }

      // Normalize probabilities to sum to 100%
      const totalProb = homeWinProb + drawProb + awayWinProb;
      if (totalProb > 0) {
        homeWinProb = (homeWinProb / totalProb) * 100;
        drawProb = (drawProb / totalProb) * 100;
        awayWinProb = (awayWinProb / totalProb) * 100;
      } else {
        // Fallback: equal probabilities
        homeWinProb = 33.33;
        drawProb = 33.33;
        awayWinProb = 33.34;
      }

      setPrediction({
        homeScore: Math.max(0, homePredicted),
        awayScore: Math.max(0, awayPredicted),
        homeWinProb: Math.round(homeWinProb),
        drawProb: Math.round(drawProb),
        awayWinProb: Math.round(awayWinProb),
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name
      });
    } catch (error) {
      console.error('Error predicting match:', error);
    } finally {
      setPredictionLoading(false);
    }
  };




  if (loading) {
    return (
      <>
        <TournamentNavbar />
        <div className="match-detail-loading">
          <div className="fixtures-loading-content">
            <div className="logo-loader">
              <div className="logo-ring"></div>
              <img src="/assets/img/muq_invert.png" alt="Muqawama" className="logo-pulse" />
            </div>
            <p>Loading match details...</p>
          </div>
        </div>
        <Footer edition="2026" />
      </>
    );
  }

  if (!match) {
    return (
      <>
        <TournamentNavbar />
        <div className="match-detail-error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Match not found</p>
         
        </div>
        <Footer edition="2026" />
      </>
    );
  }

  const isFinished = match.status === 'completed';

  return (
    <>
      <TournamentNavbar />
      <div className="match-detail-page">
        {/* Floating Action Buttons */}
        <div className="match-action-buttons">
          <LikeButton 
            matchId={matchId} 
            userIdentifier={userIdentifier} 
            initialLikeCount={likeCount}
          />
          <ShareButton onClick={() => setShowShareModal(true)} />
        </div>
        
        <MatchHeader match={match} />

        {/* Main Content */}
        <section className="match-detail-content">
          <div className="match-detail-single-column">
            <MatchPredictions
              match={match}
              matchId={matchId}
              userIdentifier={userIdentifier}
              userPrediction={userPrediction}
              userPredictionStats={userPredictionStats}
              onPredictionUpdate={handlePredictionUpdate}
              onStatsUpdate={handleStatsUpdate}
            />

            <GoalsAndHighlights 
              goals={goals} 
              cards={cards} 
              match={match} 
              isFinished={isFinished} 
            />

            {/* Formation Display - Both Teams */}
            <div className="formation-section">
              <h3 className="panel-title">FORMATIONS</h3>
              <MatchFormationField
                homePlayers={homeTeamPlayers}
                awayPlayers={awayTeamPlayers}
                homeTeam={match.home_team}
                awayTeam={match.away_team}
                goals={goals}
                cards={cards}
              />
            </div>

            <SquadsSection
              homeTeamPlayers={homeTeamPlayers}
              awayTeamPlayers={awayTeamPlayers}
              match={match}
              goals={goals}
              cards={cards}
            />
          </div>
        </section>

        {/* Back Button */}
        <div className="match-detail-footer">
          
        </div>
      </div>
      <Footer edition="2026" />

      {/* Prewarm share image in the background so first open is instant */}
      {match && <PrewarmMatchShareCard match={match} />}
      
      {/* Share Modal */}
      {showShareModal && (
        <MatchShareCard 
          match={match} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </>
  );
}
