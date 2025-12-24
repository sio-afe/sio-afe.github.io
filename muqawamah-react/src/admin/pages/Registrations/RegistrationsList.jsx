/**
 * Registrations Management Page
 * View, edit, delete team registrations
 */

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import { REGISTRATION_STATUSES } from '../../config/adminConfig';
import { compressImage, getBase64SizeKB } from '../../../components/shared/registration/utils/imageCompression';
import SmartImg from '../../../components/shared/SmartImg';

const positionOptions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'CF', 'ST', 'SUB'];

export default function RegistrationsList() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReg, setSelectedReg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [inTournament, setInTournament] = useState({});
  
  // Player editing state
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [playerSaving, setPlayerSaving] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ player_name: '', player_age: '', aadhar_no: '', position: 'SUB', is_substitute: true, player_image: null });
  
  // Team editing state
  const [editingTeam, setEditingTeam] = useState(false);
  const [teamSaving, setTeamSaving] = useState(false);
  const [teamEditData, setTeamEditData] = useState({});

  useEffect(() => {
    fetchRegistrations();
    checkTournamentStatus();
  }, [filter]);

  const checkTournamentStatus = async () => {
    try {
      // Get all teams in tournament with their registration IDs
      const { data, error } = await supabaseClient
        .from('teams')
        .select('registration_id');

      if (error) throw error;

      // Create a map of registration IDs that are already in tournament
      const tournamentMap = {};
      data?.forEach(team => {
        if (team.registration_id) {
          tournamentMap[team.registration_id] = true;
        }
      });

      setInTournament(tournamentMap);
    } catch (error) {
      console.error('Error checking tournament status:', error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      let query = supabaseClient
        .from('team_registrations')
        .select('*, team_players(count)')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      alert('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabaseClient
        .from('team_registrations')
        .update({ 
          status: newStatus,
          confirmed_at: newStatus === 'confirmed' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      alert('Status updated successfully!');
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const addToTournament = async (registration) => {
    // Check if already in tournament
    if (inTournament[registration.id]) {
      alert(`ℹ️ "${registration.team_name}" is already in the tournament!`);
      return;
    }

    if (!confirm(`Add "${registration.team_name}" to the tournament?\n\nThis will create an entry in the teams table for fixtures and standings, and copy all players.`)) {
      return;
    }

    try {
      // Double-check if already in tournament
      const { data: existing } = await supabaseClient
        .from('teams')
        .select('id')
        .eq('registration_id', registration.id)
        .single();

      if (existing) {
        alert('This team is already in the tournament!');
        checkTournamentStatus(); // Refresh status
        return;
      }

      // Add to tournament teams table
      const { data: newTeam, error: teamError } = await supabaseClient
        .from('teams')
        .insert({
          name: registration.team_name,
          crest_url: registration.team_logo,
          captain: registration.captain_name,
          category: registration.category,
          formation: registration.formation,
          registration_id: registration.id
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Copy players from team_players to players table
      const { data: teamPlayers, error: playersError } = await supabaseClient
        .from('team_players')
        .select('*')
        .eq('team_id', registration.id);

      if (playersError) throw playersError;

      if (teamPlayers && teamPlayers.length > 0) {
        const playerInserts = teamPlayers.map(player => ({
          team_id: newTeam.id,
          name: player.player_name,
          position: player.position,
          is_substitute: player.is_substitute,
          player_image: player.player_image,
          position_x: player.position_x,
          position_y: player.position_y,
          registration_player_id: player.id
        }));

        const { error: insertError } = await supabaseClient
          .from('players')
          .insert(playerInserts);

        if (insertError) throw insertError;
      }

      alert(`✅ "${registration.team_name}" added to tournament successfully!\n\n${teamPlayers?.length || 0} players copied.\n\nYou can now create fixtures and matches for this team.`);
      
      // Refresh tournament status
      checkTournamentStatus();
    } catch (error) {
      console.error('Error adding to tournament:', error);
      alert('Failed to add team to tournament: ' + error.message);
    }
  };

  const deleteRegistration = async (id) => {
    const reg = registrations.find(r => r.id === id);
    if (!reg) return;

    const confirmMsg = `⚠️ WARNING: This will permanently delete the registration for "${reg.team_name}" and ALL related data:\n\n` +
      `✓ All players in this registration\n` +
      `✓ If added to tournament: the team, all matches, and all goals\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Type the team name to confirm: "${reg.team_name}"`;

    const userInput = prompt(confirmMsg);
    
    if (userInput !== reg.team_name) {
      if (userInput !== null) {
        alert('Team name did not match. Deletion cancelled.');
      }
      return;
    }

    try {
      // Step 1: Check if this registration has a team in the tournament
      const { data: tournamentTeam, error: teamCheckError } = await supabaseClient
        .from('teams')
        .select('id')
        .eq('registration_id', id)
        .maybeSingle();

      if (teamCheckError && teamCheckError.code !== 'PGRST116') {
        throw teamCheckError;
      }

      // Step 2: If team exists in tournament, delete all related tournament data
      if (tournamentTeam) {
        // Delete from players table first (tournament players that reference team_players)
        const { error: tournamentPlayersError } = await supabaseClient
          .from('players')
          .delete()
          .eq('team_id', tournamentTeam.id);

        if (tournamentPlayersError) throw new Error(`Failed to delete tournament players: ${tournamentPlayersError.message}`);

        // Delete all goals involving this team
        const { error: goalsError } = await supabaseClient
          .from('goals')
          .delete()
          .eq('team_id', tournamentTeam.id);

        if (goalsError) throw new Error(`Failed to delete goals: ${goalsError.message}`);

        // Delete all matches where this team is home or away
        const { error: matchesError } = await supabaseClient
          .from('matches')
          .delete()
          .or(`home_team_id.eq.${tournamentTeam.id},away_team_id.eq.${tournamentTeam.id}`);

        if (matchesError) throw new Error(`Failed to delete matches: ${matchesError.message}`);

        // Delete the team from tournament
        const { error: teamError } = await supabaseClient
          .from('teams')
          .delete()
          .eq('id', tournamentTeam.id);

        if (teamError) throw new Error(`Failed to delete team: ${teamError.message}`);
      }

      // Step 3: Delete all players from this registration (team_players)
      const { error: playersError } = await supabaseClient
        .from('team_players')
        .delete()
        .eq('team_id', id);

      if (playersError) throw new Error(`Failed to delete registration players: ${playersError.message}`);

      // Step 4: Finally, delete the registration itself
      const { error: regError } = await supabaseClient
        .from('team_registrations')
        .delete()
        .eq('id', id);

      if (regError) throw new Error(`Failed to delete registration: ${regError.message}`);

      alert(`✅ Successfully deleted "${reg.team_name}" and all related data!`);
      fetchRegistrations();
      checkTournamentStatus();
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert(`❌ Failed to delete registration: ${error.message}`);
    }
  };

  const viewDetails = async (id) => {
    try {
      const { data, error } = await supabaseClient
        .from('team_registrations')
        .select('*, team_players(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      setSelectedReg(data);
      setEditingTeam(false);
      setTeamEditData({});
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching details:', error);
      alert('Failed to load details');
    }
  };

  // Edit player functions
  const openEditPlayer = (player) => {
    setEditingPlayer({ ...player });
    setShowPlayerModal(true);
  };

  const handlePlayerEdit = (field, value) => {
    setEditingPlayer(prev => ({ ...prev, [field]: value }));
  };

  const handlePlayerImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }

    try {
      // Compress and convert the image to WebP format
      const compressedBase64 = await compressImage(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.85,
        outputFormat: 'image/webp'
      });

      const compressedSizeKB = getBase64SizeKB(compressedBase64);
      const originalSizeKB = Math.round(file.size / 1024);
      console.log(`Player image compressed to WebP: ${originalSizeKB}KB → ${compressedSizeKB}KB`);

      setEditingPlayer(prev => ({ ...prev, player_image: compressedBase64 }));
    } catch (error) {
      console.error('Error compressing player image:', error);
      alert('Failed to process image. Please try another file.');
    }
  };

  const savePlayerEdit = async () => {
    if (!editingPlayer) return;

    setPlayerSaving(true);
    try {
      const { error } = await supabaseClient
        .from('team_players')
        .update({
          player_name: editingPlayer.player_name,
          player_age: editingPlayer.player_age ? parseInt(editingPlayer.player_age) : null,
          aadhar_no: editingPlayer.aadhar_no || null,
          position: editingPlayer.position,
          is_substitute: editingPlayer.is_substitute,
          player_image: editingPlayer.player_image
        })
        .eq('id', editingPlayer.id);

      if (error) throw error;

      alert('Player updated successfully!');
      setShowPlayerModal(false);
      setEditingPlayer(null);
      
      // Refresh the registration details
      viewDetails(selectedReg.id);
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Failed to update player: ' + error.message);
    } finally {
      setPlayerSaving(false);
    }
  };

  const deletePlayer = async (playerId, playerName) => {
    if (!confirm(`Delete player "${playerName}" from this team?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('team_players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      alert('Player deleted successfully!');
      viewDetails(selectedReg.id);
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Failed to delete player: ' + error.message);
    }
  };

  // Add new player
  const handleNewPlayerImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }

    try {
      // Compress and convert the image to WebP format
      const compressedBase64 = await compressImage(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.85,
        outputFormat: 'image/webp'
      });

      const compressedSizeKB = getBase64SizeKB(compressedBase64);
      const originalSizeKB = Math.round(file.size / 1024);
      console.log(`Player image compressed to WebP: ${originalSizeKB}KB → ${compressedSizeKB}KB`);

      setNewPlayer(prev => ({ ...prev, player_image: compressedBase64 }));
    } catch (error) {
      console.error('Error compressing player image:', error);
      alert('Failed to process image. Please try another file.');
    }
  };

  const addNewPlayer = async () => {
    if (!newPlayer.player_name) {
      alert('Please enter player name');
      return;
    }

    setPlayerSaving(true);
    try {
      const { error } = await supabaseClient
        .from('team_players')
        .insert({
          team_id: selectedReg.id,
          player_name: newPlayer.player_name,
          player_age: newPlayer.player_age ? parseInt(newPlayer.player_age) : null,
          aadhar_no: newPlayer.aadhar_no || null,
          position: newPlayer.position,
          is_substitute: newPlayer.is_substitute,
          player_image: newPlayer.player_image
        });

      if (error) throw error;

      alert('Player added successfully!');
      setShowAddPlayerModal(false);
      setNewPlayer({ player_name: '', player_age: '', aadhar_no: '', position: 'SUB', is_substitute: true, player_image: null });
      
      // Refresh the registration details
      viewDetails(selectedReg.id);
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Failed to add player: ' + error.message);
    } finally {
      setPlayerSaving(false);
    }
  };

  // Team editing functions
  const startEditTeam = () => {
    setTeamEditData({
      team_name: selectedReg.team_name,
      category: selectedReg.category,
      formation: selectedReg.formation,
      team_logo: selectedReg.team_logo
    });
    setEditingTeam(true);
  };

  const handleTeamEdit = (field, value) => {
    setTeamEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleTeamLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }

    try {
      // Compress and convert the image to WebP format
      const compressedBase64 = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        outputFormat: 'image/webp'
      });

      const compressedSizeKB = getBase64SizeKB(compressedBase64);
      const originalSizeKB = Math.round(file.size / 1024);
      console.log(`Team logo compressed to WebP: ${originalSizeKB}KB → ${compressedSizeKB}KB`);

      setTeamEditData(prev => ({ ...prev, team_logo: compressedBase64 }));
    } catch (error) {
      console.error('Error compressing team logo:', error);
      alert('Failed to process image. Please try another file.');
    }
  };

  const saveTeamEdit = async () => {
    if (!teamEditData.team_name || !teamEditData.team_name.trim()) {
      alert('Team name is required');
      return;
    }

    setTeamSaving(true);
    try {
      const { error } = await supabaseClient
        .from('team_registrations')
        .update({
          team_name: teamEditData.team_name,
          category: teamEditData.category,
          formation: teamEditData.formation,
          team_logo: teamEditData.team_logo
        })
        .eq('id', selectedReg.id);

      if (error) throw error;

      alert('Team details updated successfully!');
      setEditingTeam(false);
      
      // Refresh the registration details
      viewDetails(selectedReg.id);
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Failed to update team: ' + error.message);
    } finally {
      setTeamSaving(false);
    }
  };

  const cancelTeamEdit = () => {
    setEditingTeam(false);
    setTeamEditData({});
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.captain_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.captain_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusConfig = REGISTRATION_STATUSES.find(s => s.value === status);
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: statusConfig?.color || '#6b7280' }}
      >
        {statusConfig?.label || status}
      </span>
    );
  };

  return (
    <AdminLayout title="Registrations Management">
      <div className="admin-page-header">
        <div className="page-header-left">
          <button className="refresh-btn" onClick={fetchRegistrations}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
        <div className="page-header-right">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by team, captain, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({registrations.length})
        </button>
        {REGISTRATION_STATUSES.map(status => (
          <button
            key={status.value}
            className={`filter-tab ${filter === status.value ? 'active' : ''}`}
            onClick={() => setFilter(status.value)}
          >
            {status.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading registrations...</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Team Name</th>
                <th>Captain</th>
                <th>Category</th>
                <th>Players</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <p>No registrations found</p>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <div className="team-cell">
                        {reg.team_logo && (
                          <SmartImg
                            src={reg.team_logo}
                            preset="crestSm"
                            alt=""
                            className="team-logo-small"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        <strong>{reg.team_name}</strong>
                      </div>
                    </td>
                    <td>
                      <div>{reg.captain_name}</div>
                      <small style={{ color: '#6b7280' }}>{reg.captain_email}</small>
                    </td>
                    <td>
                      <span className="category-badge">{reg.category}</span>
                    </td>
                    <td>{reg.team_players?.[0]?.count || 0} players</td>
                    <td>{getStatusBadge(reg.status)}</td>
                    <td>{new Date(reg.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-view"
                          onClick={() => viewDetails(reg.id)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {reg.status === 'confirmed' && (
                          inTournament[reg.id] ? (
                            <button 
                              className="btn-icon btn-tournament-added"
                              disabled
                              title="Already in Tournament"
                            >
                              <i className="fas fa-check-circle"></i>
                            </button>
                          ) : (
                            <button 
                              className="btn-icon btn-tournament"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToTournament(reg);
                              }}
                              title="Add to Tournament"
                            >
                              <i className="fas fa-trophy"></i>
                            </button>
                          )
                        )}
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => deleteRegistration(reg.id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedReg && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registration Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>
                  Team Information
                  {!editingTeam && (
                    <button 
                      className="btn-edit-team"
                      onClick={startEditTeam}
                      title="Edit Team Details"
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                  )}
                </h3>
                {editingTeam ? (
                  <div className="team-edit-form">
                    <div className="form-group">
                      <label>Team Logo</label>
                      {teamEditData.team_logo && (
                        <div className="current-image-preview">
                          <SmartImg src={teamEditData.team_logo} preset="crestMd" alt="Team logo" loading="lazy" decoding="async" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTeamLogoUpload}
                      />
                    </div>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Team Name:</label>
                        <input
                          type="text"
                          value={teamEditData.team_name || ''}
                          onChange={(e) => handleTeamEdit('team_name', e.target.value)}
                          className="edit-input"
                        />
                      </div>
                      <div className="detail-item">
                        <label>Category:</label>
                        <select
                          value={teamEditData.category || 'open-age'}
                          onChange={(e) => handleTeamEdit('category', e.target.value)}
                          className="edit-input"
                        >
                          <option value="open-age">Open Age</option>
                          <option value="u17">U17</option>
                        </select>
                      </div>
                      <div className="detail-item">
                        <label>Formation:</label>
                        <select
                          value={teamEditData.formation || '1-3-2-1'}
                          onChange={(e) => handleTeamEdit('formation', e.target.value)}
                          className="edit-input"
                        >
                          <option value="1-3-2-1">1-3-2-1</option>
                          <option value="1-2-3-1">1-2-3-1</option>
                          <option value="1-4-1-1">1-4-1-1</option>
                          <option value="1-3-1-2">1-3-1-2</option>
                          <option value="1-2-2-2">1-2-2-2</option>
                        </select>
                      </div>
                      <div className="detail-item">
                        <label>Status:</label>
                        {getStatusBadge(selectedReg.status)}
                      </div>
                    </div>
                    <div className="team-edit-actions">
                      <button 
                        className="btn-secondary" 
                        onClick={cancelTeamEdit}
                        disabled={teamSaving}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-primary" 
                        onClick={saveTeamEdit}
                        disabled={teamSaving}
                      >
                        {teamSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Team Logo:</label>
                      {selectedReg.team_logo ? (
                        <div className="team-logo-preview">
                          <SmartImg src={selectedReg.team_logo} preset="crestMd" alt="Team logo" loading="lazy" decoding="async" />
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>No logo</span>
                      )}
                    </div>
                    <div className="detail-item">
                      <label>Team Name:</label>
                      <span>{selectedReg.team_name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Category:</label>
                      <span>{selectedReg.category}</span>
                    </div>
                    <div className="detail-item">
                      <label>Formation:</label>
                      <span>{selectedReg.formation}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      {getStatusBadge(selectedReg.status)}
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Captain Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedReg.captain_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedReg.captain_email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedReg.captain_phone}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>
                  Players ({selectedReg.team_players?.length || 0})
                  <button 
                    className="btn-add-player"
                    onClick={() => setShowAddPlayerModal(true)}
                  >
                    <i className="fas fa-plus"></i> Add Player
                  </button>
                </h3>
                <div className="players-list">
                  {selectedReg.team_players?.map((player, idx) => (
                    <div key={idx} className="player-item player-item-editable">
                      {player.player_image && (
                        <SmartImg src={player.player_image} preset="playerAvatar" alt="" className="player-image-small" loading="lazy" decoding="async" />
                      )}
                      <div className="player-info-section">
                        <strong>{player.player_name}</strong>
                        <small>
                          {player.position} {player.is_substitute && '(SUB)'}
                          {player.player_age && ` • Age: ${player.player_age}`}
                          {player.aadhar_no && ` • Aadhar: ${player.aadhar_no.slice(-4)}`}
                        </small>
                      </div>
                      <div className="player-actions">
                        <button 
                          className="btn-icon btn-edit-small"
                          onClick={() => openEditPlayer(player)}
                          title="Edit Player"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn-icon btn-delete-small"
                          onClick={() => deletePlayer(player.id, player.player_name)}
                          title="Delete Player"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Screenshot Section */}
              {selectedReg.payment_screenshot && (
                <div className="detail-section payment-section">
                  <h3><i className="fas fa-receipt"></i> Payment Screenshot</h3>
                  <div className="payment-screenshot-container">
                    <SmartImg
                      src={selectedReg.payment_screenshot}
                      alt="Payment Screenshot"
                      className="payment-screenshot-image"
                      onClick={() => window.open(selectedReg.payment_screenshot, '_blank')}
                      loading="lazy"
                      decoding="async"
                    />
                    <p className="payment-amount">
                      Amount: <strong>₹{selectedReg.payment_amount}</strong>
                    </p>
                  </div>
                  {selectedReg.status === 'pending_verification' && (
                    <div className="payment-verify-actions">
                      <button
                        className="btn-verify-payment"
                        onClick={() => {
                          updateStatus(selectedReg.id, 'confirmed');
                          setShowModal(false);
                        }}
                      >
                        <i className="fas fa-check"></i> Verify & Confirm
                      </button>
                      <button
                        className="btn-reject-payment"
                        onClick={() => {
                          if (confirm('Reject this payment? The registration will be cancelled.')) {
                            updateStatus(selectedReg.id, 'cancelled');
                            setShowModal(false);
                          }
                        }}
                      >
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="detail-section">
                <h3>Change Status</h3>
                <div className="status-buttons">
                  {REGISTRATION_STATUSES.map(status => (
                    <button
                      key={status.value}
                      className={`status-btn ${selectedReg.status === status.value ? 'active' : ''}`}
                      style={{ borderColor: status.color }}
                      onClick={() => {
                        updateStatus(selectedReg.id, status.value);
                        setShowModal(false);
                      }}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedReg.status === 'confirmed' && (
                <div className="detail-section">
                  <h3>Tournament Actions</h3>
                  <button 
                    className="btn-primary tournament-add-btn"
                    onClick={() => addToTournament(selectedReg)}
                  >
                    <i className="fas fa-trophy"></i> Add to Tournament
                  </button>
                  <p className="help-text">
                    <i className="fas fa-info-circle"></i> This will create an entry in the Teams table for fixtures, matches, and standings.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {showPlayerModal && editingPlayer && (
        <div className="modal-overlay" onClick={() => setShowPlayerModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Player</h2>
              <button className="modal-close" onClick={() => setShowPlayerModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Player Name</label>
                <input
                  type="text"
                  value={editingPlayer.player_name || ''}
                  onChange={(e) => handlePlayerEdit('player_name', e.target.value)}
                  placeholder="Player Name"
                />
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  value={editingPlayer.player_age || ''}
                  onChange={(e) => handlePlayerEdit('player_age', e.target.value)}
                  placeholder="Age"
                  min="10"
                  max="60"
                />
              </div>

              <div className="form-group">
                <label>Aadhar Number</label>
                <input
                  type="text"
                  value={editingPlayer.aadhar_no || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 12) {
                      handlePlayerEdit('aadhar_no', value);
                    }
                  }}
                  placeholder="12-digit Aadhar number"
                  maxLength="12"
                />
              </div>

              <div className="form-group">
                <label>Position</label>
                <select
                  value={editingPlayer.position || 'SUB'}
                  onChange={(e) => handlePlayerEdit('position', e.target.value)}
                >
                  {positionOptions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingPlayer.is_substitute || false}
                    onChange={(e) => handlePlayerEdit('is_substitute', e.target.checked)}
                  />
                  Is Substitute
                </label>
              </div>

              <div className="form-group">
                <label>Player Photo</label>
                {editingPlayer.player_image && (
                  <div className="current-image-preview">
                    <SmartImg src={editingPlayer.player_image} preset="playerCard" alt="Current photo" loading="lazy" decoding="async" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePlayerImage}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowPlayerModal(false)}
                disabled={playerSaving}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={savePlayerEdit}
                disabled={playerSaving}
              >
                {playerSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {showAddPlayerModal && (
        <div className="modal-overlay" onClick={() => setShowAddPlayerModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Player</h2>
              <button className="modal-close" onClick={() => setShowAddPlayerModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Player Name *</label>
                <input
                  type="text"
                  value={newPlayer.player_name}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, player_name: e.target.value }))}
                  placeholder="Player Name"
                />
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  value={newPlayer.player_age}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, player_age: e.target.value }))}
                  placeholder="Age"
                  min="10"
                  max="60"
                />
              </div>

              <div className="form-group">
                <label>Aadhar Number</label>
                <input
                  type="text"
                  value={newPlayer.aadhar_no}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 12) {
                      setNewPlayer(prev => ({ ...prev, aadhar_no: value }));
                    }
                  }}
                  placeholder="12-digit Aadhar number"
                  maxLength="12"
                />
              </div>

              <div className="form-group">
                <label>Position</label>
                <select
                  value={newPlayer.position}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, position: e.target.value }))}
                >
                  {positionOptions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newPlayer.is_substitute}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, is_substitute: e.target.checked }))}
                  />
                  Is Substitute
                </label>
              </div>

              <div className="form-group">
                <label>Player Photo</label>
                {newPlayer.player_image && (
                  <div className="current-image-preview">
                    <SmartImg src={newPlayer.player_image} preset="playerCard" alt="Player photo" loading="lazy" decoding="async" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNewPlayerImage}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowAddPlayerModal(false);
                  setNewPlayer({ player_name: '', player_age: '', aadhar_no: '', position: 'SUB', is_substitute: true, player_image: null });
                }}
                disabled={playerSaving}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={addNewPlayer}
                disabled={playerSaving || !newPlayer.player_name}
              >
                {playerSaving ? 'Adding...' : 'Add Player'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

