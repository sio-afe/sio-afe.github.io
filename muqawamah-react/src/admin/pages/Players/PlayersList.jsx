/**
 * Players Management Page
 * View, edit, delete player information
 */

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import { POSITIONS } from '../../config/adminConfig';
import SmartImg from '../../../components/shared/SmartImg';
import { uploadImageVariants } from '../../utils/uploadImageVariants';

export default function PlayersList() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('team_players')
        .select('*, team_registrations(team_name, category, status)')
        .order('player_name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      alert('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const updatePlayer = async (playerId, updates) => {
    try {
      const { error } = await supabaseClient
        .from('team_players')
        .update(updates)
        .eq('id', playerId);

      if (error) throw error;

      alert('Player updated successfully!');
      fetchPlayers();
      setShowModal(false);
      setEditing(false);
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Failed to update player');
    }
  };

  const handlePlayerImageUpload = async (file) => {
    if (!file || !selectedPlayer?.id) return;
    try {
      setUploadingImage(true);
      const { originalUrl } = await uploadImageVariants({
        entityType: 'team_players',
        entityId: selectedPlayer.id,
        file,
        withCard: true
      });

      // Update local state for preview and saving.
      setSelectedPlayer((prev) => ({ ...prev, player_image: originalUrl }));
    } catch (error) {
      console.error('Error uploading player image:', error);
      alert(`Failed to upload image: ${error.message || error}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const deletePlayer = async (playerId) => {
    if (!confirm('Are you sure you want to delete this player?')) {
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('team_players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      alert('Player deleted successfully!');
      fetchPlayers();
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Failed to delete player');
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.player_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team_registrations?.team_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPosition = positionFilter === 'all' || player.position === positionFilter;
    
    return matchesSearch && matchesPosition;
  });

  return (
    <AdminLayout title="Players Management">
      <div className="admin-page-header">
        <div className="page-header-left">
          <button className="refresh-btn" onClick={fetchPlayers}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
        <div className="page-header-right">
          <select 
            className="filter-select"
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
          >
            <option value="all">All Positions</option>
            {POSITIONS.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search players or teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading players...</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="table-stats">
            <p>Total Players: <strong>{filteredPlayers.length}</strong></p>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Position</th>
                <th>Age</th>
                <th>Team</th>
                <th>Category</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-users-slash" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <p>No players found</p>
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <div className="player-cell">
                        {player.player_image && (
                          <SmartImg
                            src={player.player_image}
                            preset="playerAvatar"
                            alt=""
                            className="player-image-small"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        <strong>{player.player_name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="position-badge">{player.position}</span>
                    </td>
                    <td>{player.player_age || 'N/A'}</td>
                    <td>{player.team_registrations?.team_name || 'N/A'}</td>
                    <td>
                      <span className="category-badge">{player.team_registrations?.category}</span>
                    </td>
                    <td>
                      {player.is_substitute ? (
                        <span className="type-badge substitute">Substitute</span>
                      ) : (
                        <span className="type-badge starter">Starter</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-edit"
                          onClick={() => {
                            setSelectedPlayer(player);
                            setShowModal(true);
                            setEditing(false);
                          }}
                          title="View/Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => deletePlayer(player.id)}
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

      {showModal && selectedPlayer && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Player' : 'Player Details'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {selectedPlayer.player_image && (
                <div className="player-image-preview">
                  <SmartImg
                    src={selectedPlayer.player_image}
                    preset="playerCard"
                    alt={selectedPlayer.player_name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}

              {editing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Player Name</label>
                    <input
                      type="text"
                      value={selectedPlayer.player_name || ''}
                      onChange={(e) => setSelectedPlayer({
                        ...selectedPlayer,
                        player_name: e.target.value
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <select
                      value={selectedPlayer.position || ''}
                      onChange={(e) => setSelectedPlayer({
                        ...selectedPlayer,
                        position: e.target.value
                      })}
                    >
                      {POSITIONS.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      value={selectedPlayer.player_age || ''}
                      onChange={(e) => setSelectedPlayer({
                        ...selectedPlayer,
                        player_age: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Player Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={(e) => handlePlayerImageUpload(e.target.files?.[0])}
                    />
                    <small style={{ color: '#6b7280' }}>
                      Uploading creates fast variants automatically (<code>_thumb</code> / <code>_card</code>).
                    </small>
                    {uploadingImage && (
                      <div style={{ marginTop: 8, color: '#6b7280' }}>
                        <i className="fas fa-spinner fa-spin" /> Uploading image...
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Player Type</label>
                    <select
                      value={selectedPlayer.is_substitute ? 'substitute' : 'starter'}
                      onChange={(e) => setSelectedPlayer({
                        ...selectedPlayer,
                        is_substitute: e.target.value === 'substitute'
                      })}
                    >
                      <option value="starter">Starter</option>
                      <option value="substitute">Substitute</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => setEditing(false)}
                      disabled={uploadingImage}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn-primary"
                      onClick={() => updatePlayer(selectedPlayer.id, {
                        player_name: selectedPlayer.player_name,
                        position: selectedPlayer.position,
                        player_age: selectedPlayer.player_age,
                        is_substitute: selectedPlayer.is_substitute,
                        player_image: selectedPlayer.player_image || null
                      })}
                      disabled={uploadingImage}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Player Name:</label>
                      <span>{selectedPlayer.player_name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Position:</label>
                      <span className="position-badge">{selectedPlayer.position}</span>
                    </div>
                    <div className="detail-item">
                      <label>Age:</label>
                      <span>{selectedPlayer.player_age || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Team:</label>
                      <span>{selectedPlayer.team_registrations?.team_name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Type:</label>
                      {selectedPlayer.is_substitute ? (
                        <span className="type-badge substitute">Substitute</span>
                      ) : (
                        <span className="type-badge starter">Starter</span>
                      )}
                    </div>
                    <div className="detail-item">
                      <label>Aadhar Number:</label>
                      <span>{selectedPlayer.aadhar_no || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => setEditing(true)}
                    >
                      <i className="fas fa-edit"></i> Edit Player
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

