import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import Footer from '../../../shared/Footer';
import MatchFormationField from '../../../shared/MatchFormationField';

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
  const [flyingHearts, setFlyingHearts] = useState([]);
  
  // Prediction states
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [showPredictionDetails, setShowPredictionDetails] = useState(false);
  
  // User prediction states
  const [userPrediction, setUserPrediction] = useState(null); // 'home', 'draw', 'away'
  const [userPredictionStats, setUserPredictionStats] = useState({
    home: 0,
    draw: 0,
    away: 0
  });

  // Winner celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [winnerTeam, setWinnerTeam] = useState(null);

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

  // Show celebration when match is completed
  useEffect(() => {
    if (match && match.status === 'completed' && match.home_score !== null && match.away_score !== null) {
      const homeScore = match.home_score ?? 0;
      const awayScore = match.away_score ?? 0;
      
      // Only show celebration if there's a winner (not a draw)
      if (homeScore !== awayScore) {
        const winner = homeScore > awayScore ? match.home_team : match.away_team;
        setWinnerTeam(winner);
        setShowCelebration(true);
        
        // Hide celebration after 5 seconds
        const timer = setTimeout(() => {
          setShowCelebration(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [match]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);

      // Fetch match details
      const { data: matchData, error: matchError } = await supabaseClient
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;
      setMatch(matchData);

      // Fetch goals for this match with player details
      const { data: goalsData } = await supabaseClient
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
        .order('minute', { ascending: true });

      if (goalsData) {
        // Map goals to include players table data if available
        const goalsWithPlayers = await Promise.all(
          goalsData.map(async (goal) => {
            let scorerName = goal.scorer?.player_name || null;
            let assisterName = goal.assister?.player_name || null;
            let scorerImage = goal.scorer?.player_image || null;
            let assisterImage = goal.assister?.player_image || null;

            // If scorer_id exists but no name from team_players, try to get from players table
            if (goal.scorer_id && !scorerName) {
              const { data: playerData } = await supabaseClient
                .from('players')
                .select('name, player_image')
                .eq('registration_player_id', goal.scorer_id)
                .maybeSingle();
              
              if (playerData) {
                scorerName = playerData.name || playerData.player_name;
                scorerImage = playerData.player_image || scorerImage;
              }
            }

            // If assister_id exists but no name from team_players, try to get from players table
            if (goal.assister_id && !assisterName) {
              const { data: playerData } = await supabaseClient
                .from('players')
                .select('name, player_image')
                .eq('registration_player_id', goal.assister_id)
                .maybeSingle();
              
              if (playerData) {
                assisterName = playerData.name || playerData.player_name;
                assisterImage = playerData.player_image || assisterImage;
              }
            }

            return {
              ...goal,
              scorer: scorerName ? { player_name: scorerName, player_image: scorerImage } : null,
              assister: assisterName ? { player_name: assisterName, player_image: assisterImage } : null
            };
          })
        );

        setGoals(goalsWithPlayers);
      }

      // Fetch cards for this match
      const { data: cardsData } = await supabaseClient
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
        .order('minute', { ascending: true });

      if (cardsData) {
        // Map cards to include players table data if available
        const cardsWithPlayers = await Promise.all(
          cardsData.map(async (card) => {
            let playerName = card.player?.player_name || null;

            // If player_id exists but no name from team_players, try to get from players table
            if (card.player_id && !playerName) {
              const { data: playerData } = await supabaseClient
                .from('players')
                .select('name, player_image')
                .eq('registration_player_id', card.player_id)
                .maybeSingle();
              
              if (playerData) {
                playerName = playerData.name || playerData.player_name;
              }
            }

            return {
              ...card,
              player: playerName ? { player_name: playerName } : null
            };
          })
        );

        setCards(cardsWithPlayers);
      }

      // Fetch home team players (with position coordinates) from players table
      if (matchData.home_team?.id) {
        const { data: homePlayers } = await supabaseClient
          .from('players')
          .select('*')
          .eq('team_id', matchData.home_team.id)
          .order('position');
        
        if (homePlayers) setHomeTeamPlayers(homePlayers);
      }

      // Fetch away team players (with position coordinates) from players table
      if (matchData.away_team?.id) {
        const { data: awayPlayers } = await supabaseClient
          .from('players')
          .select('*')
          .eq('team_id', matchData.away_team.id)
          .order('position');
        
        if (awayPlayers) setAwayTeamPlayers(awayPlayers);
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

  // Handle user prediction vote
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
          
          setUserPrediction(null);
          // Update stats
          const newStats = { ...userPredictionStats };
          newStats[predictionType] = Math.max(0, newStats[predictionType] - 1);
          setUserPredictionStats(newStats);
        } else {
          // Different prediction, update it
          await supabaseClient
            .from('match_predictions')
            .update({ prediction: predictionType })
            .eq('id', existingPred.id);
          
          setUserPrediction(predictionType);
          // Update stats
          const newStats = { ...userPredictionStats };
          newStats[existingPred.prediction] = Math.max(0, newStats[existingPred.prediction] - 1);
          newStats[predictionType] = (newStats[predictionType] || 0) + 1;
          setUserPredictionStats(newStats);
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
        
        setUserPrediction(predictionType);
        // Update stats
        const newStats = { ...userPredictionStats };
        newStats[predictionType] = (newStats[predictionType] || 0) + 1;
        setUserPredictionStats(newStats);
      }
      
      // Refresh stats from database to ensure accuracy
      await fetchInteractions();
    } catch (error) {
      console.error('Error saving prediction:', error);
    }
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

  // Handle like/heart button - allow multiple likes
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
      // The unique constraint might still exist, so we'll handle it gracefully
      console.error('Error saving like (non-critical):', error);
      // Don't decrement the count - user already saw the animation
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

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }).toUpperCase();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString.substring(0, 5);
  };

  const getPositionLabel = (position) => {
    const labels = {
      'GK': 'Goalkeeper',
      'CB': 'Defender',
      'LB': 'Defender',
      'RB': 'Defender',
      'CDM': 'Midfielder',
      'CM': 'Midfielder',
      'CAM': 'Midfielder',
      'LM': 'Midfielder',
      'RM': 'Midfielder',
      'CF': 'Forward',
      'ST': 'Forward',
      'SUB': 'Substitute'
    };
    return labels[position] || position || 'Player';
  };

  // Sort players by position for squad display
  const sortPlayersByPosition = (players) => {
    const positionOrder = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'CF', 'ST', 'SUB'];
    return [...players].sort((a, b) => {
      const indexA = positionOrder.indexOf(a.position);
      const indexB = positionOrder.indexOf(b.position);
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });
  };

  // Calculate player stats for squad display (goals and cards)
  const getPlayerStatsForSquad = (player) => {
    if (!player) return { goalsScored: 0, assists: 0, yellowCards: 0, redCards: 0 };
    
    let goalsScored = 0;
    let assists = 0;
    let yellowCards = 0;
    let redCards = 0;
    
    const playerName = player.name || player.player_name || '';
    const registrationPlayerId = player.registration_player_id;
    
    // Count goals
    goals.forEach(goal => {
      let isScorer = false;
      let isAssister = false;
      
      // First try via players table
      if (registrationPlayerId) {
        if (goal.scorer_id === registrationPlayerId) isScorer = true;
        if (goal.assister_id === registrationPlayerId) isAssister = true;
      }
      
      // Fallback to team_players by name
      if (!isScorer && !isAssister) {
        const scorerName = goal.scorer?.player_name || '';
        const assisterName = goal.assister?.player_name || '';
        
        if (scorerName && playerName && scorerName.toLowerCase().trim() === playerName.toLowerCase().trim()) {
          isScorer = true;
        }
        if (assisterName && playerName && assisterName.toLowerCase().trim() === playerName.toLowerCase().trim()) {
          isAssister = true;
        }
      }
      
      if (isScorer) goalsScored++;
      if (isAssister) assists++;
    });

    // Count cards
    if (cards && cards.length > 0) {
      cards.forEach(card => {
        let isCardForPlayer = false;
        
        if (registrationPlayerId && card.player_id === registrationPlayerId) {
          isCardForPlayer = true;
        }
        
        if (!isCardForPlayer) {
          const cardPlayerName = card.player?.player_name || '';
          if (cardPlayerName && playerName && cardPlayerName.toLowerCase().trim() === playerName.toLowerCase().trim()) {
            isCardForPlayer = true;
          }
        }
        
        if (isCardForPlayer) {
          if (card.card_type === 'yellow') yellowCards++;
          if (card.card_type === 'red') redCards++;
        }
      });
    }
    
    return { goalsScored, assists, yellowCards, redCards };
  };

  // Group goals by scorer to count goals and assists
  const getPlayerStats = () => {
    const statsMap = {};
    
    goals.forEach(goal => {
      // Count goals (using new schema: scorer_id and scorer object)
      if (goal.scorer?.player_name) {
        const scorerName = goal.scorer.player_name;
        if (!statsMap[scorerName]) {
          statsMap[scorerName] = { 
            name: scorerName, 
            goals: 0, 
            assists: 0,
            team_id: goal.team_id 
          };
        }
        statsMap[scorerName].goals += 1;
      }
      
      // Count assists (using new schema: assister_id and assister object)
      if (goal.assister?.player_name) {
        const assisterName = goal.assister.player_name;
        if (!statsMap[assisterName]) {
          statsMap[assisterName] = { 
            name: assisterName, 
            goals: 0, 
            assists: 0,
            team_id: goal.team_id 
          };
        }
        statsMap[assisterName].assists += 1;
      }
    });
    
    // Convert to array and sort by goals, then assists
    return Object.values(statsMap).sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      return b.assists - a.assists;
    });
  };

  if (loading) {
    return (
      <>
        <TournamentNavbar />
        <div className="match-detail-loading">
          <div className="fixtures-loading-content">
            <div className="logo-loader">
              <div className="logo-ring"></div>
              <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama" className="logo-pulse" />
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
  const isLive = match.status === 'live';
  const hasScore = isFinished || isLive;
  const playerStats = getPlayerStats();

  const getMatchStatusBadge = () => {
    if (match.status === 'completed') {
      return { label: 'FULL TIME', className: 'status-completed' };
    } else if (match.status === 'live') {
      return { label: 'LIVE', className: 'status-live' };
    } else if (match.status === 'scheduled') {
      return { label: 'SCHEDULED', className: 'status-scheduled' };
    }
    return { label: 'UPCOMING', className: 'status-scheduled' };
  };

  const getMatchTypeLabel = () => {
    const matchType = match.match_type?.toLowerCase();
    if (!matchType || matchType === 'group') return 'Group Stage';
    if (matchType === 'quarter-final' || matchType === 'quarterfinal') return 'Quarter Final';
    if (matchType === 'semi-final' || matchType === 'semifinal') return 'Semi Final';
    if (matchType === 'final') return 'Final';
    if (matchType === 'third-place' || matchType === 'thirdplace') return '3rd Place';
    return matchType.charAt(0).toUpperCase() + matchType.slice(1);
  };

  const statusBadge = getMatchStatusBadge();

  return (
    <>
      <TournamentNavbar />
      <div className="match-detail-page">
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
        {/* Match Header */}
        <section className="match-header-section">
          <div className="match-header-content">
            <div className="match-datetime">
              <p className="match-date">{formatDate(match.match_date)}</p>
              <p className="match-time">{formatTime(match.scheduled_time)}</p>
            </div>

            <div className="match-teams-header">
              {/* Home Team */}
              <div className="header-team home">
                <div className="team-logo-large">
                  {match.home_team?.crest_url ? (
                    <img 
                      src={match.home_team.crest_url} 
                      alt={match.home_team.name}
                      loading="lazy"
                    />
                  ) : (
                    <span>{match.home_team?.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <h4 className="team-name-header">{match.home_team?.name || 'TBD'}</h4>
              </div>

              {/* Score */}
              <div className="match-score-header">
                {hasScore ? (
                  <span className={`score-big ${isLive ? 'live' : ''}`}>{match.home_score ?? 0} - {match.away_score ?? 0}</span>
                ) : (
                  <span className="score-vs">VS</span>
                )}
                {/* Match Type Label */}
                <span className="match-type-label">{getMatchTypeLabel()}</span>
                {/* Match Status Badge */}
                <span className={`match-status-badge-detail ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
              </div>

              {/* Away Team */}
              <div className="header-team away">
                <div className="team-logo-large">
                  {match.away_team?.crest_url ? (
                    <img 
                      src={match.away_team.crest_url} 
                      alt={match.away_team.name}
                      loading="lazy"
                    />
                  ) : (
                    <span>{match.away_team?.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <h4 className="team-name-header">{match.away_team?.name || 'TBD'}</h4>
              </div>
            </div>

            {/* Winner Celebration */}
            {isFinished && showCelebration && winnerTeam && (
              <div className="winner-celebration">
                <div className="firecrackers-container">
                  {[...Array(50)].map((_, i) => {
                    const angle = (Math.random() * 360) * (Math.PI / 180);
                    const distance = 150 + Math.random() * 200;
                    const sparkX = Math.cos(angle) * distance;
                    const sparkY = Math.sin(angle) * distance;
                    const delay = Math.random() * 0.5;
                    const duration = 1.5 + Math.random() * 0.5;
                    
                    return (
                      <div
                        key={i}
                        className="firecracker-spark"
                        style={{
                          left: `${30 + Math.random() * 40}%`,
                          bottom: `${15 + Math.random() * 15}%`,
                          '--animation-delay': `${delay}s`,
                          '--animation-duration': `${duration}s`,
                          '--spark-x': `${sparkX}px`,
                          '--spark-y': `${-sparkY}px`,
                          '--spark-color': i % 5 === 0 ? '#ff6b6b' : i % 5 === 1 ? '#4ecdc4' : i % 5 === 2 ? '#ffe66d' : i % 5 === 3 ? '#ff9ff3' : '#95e1d3'
                        }}
                      />
                    );
                  })}
                </div>
                <div className="winner-announcement">
                  <div className="winner-trophy">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <h2 className="winner-text">{winnerTeam.name}</h2>
                  <p className="winner-subtitle">WINNER</p>
                </div>
              </div>
            )}

            {/* Community Predictions Only */}
            {!isFinished && (
              <div className="match-prediction-bar">
                <div className="prediction-content">
                  <div className="prediction-bars-compact">
                    {/* Community Prediction Bar - Always Show */}
                    {(() => {
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
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            <div className="match-meta">
              <p className="matchday-label">MATCHDAY {match.match_number || 1}</p>
              {match.venue && <p className="venue-label">{match.venue}</p>}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="match-detail-content">
          <div className="match-detail-single-column">
            {/* Goals & Highlights Timeline - Compact */}
            <div className="goals-panel-compact">
              <h3 className="panel-title-compact">
                <i className="fas fa-futbol"></i>
                Goals & Highlights
              </h3>
              
              {goals.length > 0 || cards.length > 0 ? (
                <div className="goals-list-compact">
                  {/* Combine goals and cards, sort by minute */}
                  {[...goals.map(g => ({ ...g, type: 'goal' })), ...cards.map(c => ({ ...c, type: 'card' }))]
                    .sort((a, b) => (a.minute || 0) - (b.minute || 0))
                    .map((event, idx) => {
                      if (event.type === 'goal') {
                        const isHomeGoal = event.team_id === match.home_team_id;
                        return (
                          <div key={`goal-${event.id || idx}`} className={`goal-row-compact ${isHomeGoal ? 'home' : 'away'}`}>
                            <span className="goal-minute-compact">{event.minute}'</span>
                            <span className="goal-icon-compact">
                              <i className="fas fa-futbol"></i>
                            </span>
                            <span className="goal-scorer-compact">{event.scorer?.player_name || 'Unknown'}</span>
                            {event.assister?.player_name && (
                              <span className="goal-assist-compact">({event.assister.player_name})</span>
                            )}
                            <span className="goal-team-compact">{isHomeGoal ? match.home_team?.name : match.away_team?.name}</span>
                          </div>
                        );
                      } else {
                        const isHomeCard = event.team_id === match.home_team_id;
                        return (
                          <div key={`card-${event.id || idx}`} className={`card-row-compact ${isHomeCard ? 'home' : 'away'}`}>
                            <span className="goal-minute-compact">{event.minute}'</span>
                            <span className={`card-icon-compact ${event.card_type}`}>
                              {event.card_type === 'yellow' ? (
                                <i className="fas fa-square" style={{ color: '#ffd700' }}></i>
                              ) : (
                                <i className="fas fa-square" style={{ color: '#ff0000' }}></i>
                              )}
                            </span>
                            <span className="goal-scorer-compact">{event.player?.player_name || 'Unknown'}</span>
                            <span className="goal-team-compact">{isHomeCard ? match.home_team?.name : match.away_team?.name}</span>
                          </div>
                        );
                      }
                    })}
                </div>
              ) : (
                <p className="no-goals-compact">
                  {isFinished ? 'No events' : 'Events will appear here'}
                </p>
              )}
            </div>

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

            {/* Squads Section */}
            <div className="squads-section">
              <h3 className="panel-title">SQUADS</h3>
              
              <div className="squads-grid">
                {/* Home Team Squad */}
                <div className="squad-column home">
                  <div className="squad-header">
                    {match.home_team?.crest_url && (
                      <img 
                        src={match.home_team.crest_url} 
                        alt="" 
                        className="squad-team-logo"
                        loading="lazy"
                      />
                    )}
                    <span>{match.home_team?.name}</span>
                  </div>
                  <div className="squad-list">
                    {sortPlayersByPosition(homeTeamPlayers).map((player, idx) => {
                      const playerStats = getPlayerStatsForSquad(player);
                      return (
                        <div className={`squad-player-row ${player.position === 'SUB' || player.is_substitute ? 'substitute' : ''}`} key={player.id}>
                          <span className="player-name">{player.name || player.player_name || 'Unknown'}</span>
                          <div className="player-stats-icons">
                            {playerStats.goalsScored > 0 && (
                              <span className="stat-icon goal-icon" title={`${playerStats.goalsScored} goal${playerStats.goalsScored > 1 ? 's' : ''}`}>
                                <span className="ball-icon-wrapper">
                                  <img src="/assets/img/Muqawama/ball.svg" alt="Goal" style={{ width: '16px', height: '16px' }} />
                                </span>
                                {playerStats.goalsScored > 1 && (
                                  <span className="stat-count-badge">{playerStats.goalsScored}</span>
                                )}
                              </span>
                            )}
                            {playerStats.yellowCards > 0 && (
                              <span className="stat-icon yellow-card-icon" title={`${playerStats.yellowCards} yellow card${playerStats.yellowCards > 1 ? 's' : ''}`}>
                                <img src="/assets/img/Muqawama/Yellow_card.svg" alt="Yellow Card" style={{ width: '14px', height: '14px' }} />
                                {playerStats.yellowCards > 1 && (
                                  <span className="stat-count-badge">{playerStats.yellowCards}</span>
                                )}
                              </span>
                            )}
                            {playerStats.redCards > 0 && (
                              <span className="stat-icon red-card-icon" title={`${playerStats.redCards} red card${playerStats.redCards > 1 ? 's' : ''}`}>
                                <img src="/assets/img/Muqawama/Red_card.svg" alt="Red Card" style={{ width: '14px', height: '14px' }} />
                                {playerStats.redCards > 1 && (
                                  <span className="stat-count-badge">{playerStats.redCards}</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {homeTeamPlayers.length === 0 && (
                      <p className="no-squad">Squad not available</p>
                    )}
                  </div>
                </div>

                {/* Away Team Squad */}
                <div className="squad-column away">
                  <div className="squad-header away">
                    <span>{match.away_team?.name}</span>
                    {match.away_team?.crest_url && (
                      <img 
                        src={match.away_team.crest_url} 
                        alt="" 
                        className="squad-team-logo"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="squad-list">
                    {sortPlayersByPosition(awayTeamPlayers).map((player, idx) => {
                      const playerStats = getPlayerStatsForSquad(player);
                      return (
                        <div className={`squad-player-row ${player.position === 'SUB' || player.is_substitute ? 'substitute' : ''}`} key={player.id}>
                          <span className="player-name">{player.name || player.player_name || 'Unknown'}</span>
                          <div className="player-stats-icons">
                            {playerStats.goalsScored > 0 && (
                              <span className="stat-icon goal-icon" title={`${playerStats.goalsScored} goal${playerStats.goalsScored > 1 ? 's' : ''}`}>
                                <span className="ball-icon-wrapper">
                                  <img src="/assets/img/Muqawama/ball.svg" alt="Goal" style={{ width: '16px', height: '16px' }} />
                                </span>
                                {playerStats.goalsScored > 1 && (
                                  <span className="stat-count-badge">{playerStats.goalsScored}</span>
                                )}
                              </span>
                            )}
                            {playerStats.yellowCards > 0 && (
                              <span className="stat-icon yellow-card-icon" title={`${playerStats.yellowCards} yellow card${playerStats.yellowCards > 1 ? 's' : ''}`}>
                                <img src="/assets/img/Muqawama/Yellow_card.svg" alt="Yellow Card" style={{ width: '14px', height: '14px' }} />
                                {playerStats.yellowCards > 1 && (
                                  <span className="stat-count-badge">{playerStats.yellowCards}</span>
                                )}
                              </span>
                            )}
                            {playerStats.redCards > 0 && (
                              <span className="stat-icon red-card-icon" title={`${playerStats.redCards} red card${playerStats.redCards > 1 ? 's' : ''}`}>
                                <img src="/assets/img/Muqawama/Red_card.svg" alt="Red Card" style={{ width: '14px', height: '14px' }} />
                                {playerStats.redCards > 1 && (
                                  <span className="stat-count-badge">{playerStats.redCards}</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {awayTeamPlayers.length === 0 && (
                      <p className="no-squad">Squad not available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <div className="match-detail-footer">
          
        </div>
      </div>
      <Footer edition="2026" />
    </>
  );
}
