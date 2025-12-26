/**
 * Players Management Page
 * Tournament Players Management Page
 * View, edit, delete tournament player information (public.players)
 */

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import { POSITIONS } from '../../config/adminConfig';
import SmartImg from '../../../components/shared/SmartImg';
import { uploadImageVariants } from '../../utils/uploadImageVariants';

export default function PlayersList() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Add player state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    team_id: '',
    position: 'Forward',
    number: '',
    is_substitute: false
  });
  const [addingPlayer, setAddingPlayer] = useState(false);

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('players')
        .select('*, team:teams(id, name, category, crest_url)')
        .order('name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      alert('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('teams')
        .select('id, name, category')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const addPlayer = async () => {
    if (!newPlayer.name.trim()) {
      alert('Please enter a player name');
      return;
    }
    if (!newPlayer.team_id) {
      alert('Please select a team');
      return;
    }

    try {
      setAddingPlayer(true);
      const { error } = await supabaseClient
        .from('players')
        .insert({
          name: newPlayer.name.trim(),
          team_id: newPlayer.team_id,
          position: newPlayer.position,
          number: newPlayer.number ? parseInt(newPlayer.number, 10) : null,
          is_substitute: newPlayer.is_substitute
        });

      if (error) throw error;

      alert('Player added successfully!');
      setShowAddModal(false);
      setNewPlayer({
        name: '',
        team_id: '',
        position: 'Forward',
        number: '',
        is_substitute: false
      });
      fetchPlayers();
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Failed to add player: ' + (error.message || error));
    } finally {
      setAddingPlayer(false);
    }
  };

  const updatePlayer = async (playerId, updates) => {
    try {
      const { error } = await supabaseClient
        .from('players')
        .update(updates)
        .eq('id', playerId);

      if (error) throw error;

      alert('Player updated successfully!');
      fetchPlayers();
      setShowModal(false);
      setEditing(false);
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Failed to update player' + (error?.message ? `: ${error.message}` : ''));
    }
  };

  const handlePlayerImageUpload = async (file) => {
    if (!file || !selectedPlayer?.id) return;
    try {
      setUploadingImage(true);
      const { originalUrl } = await uploadImageVariants({
        entityType: 'players',
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
        .from('players')
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

  const availableCategories = Array.from(
    new Set((players || []).map(p => p?.team?.category).filter(Boolean))
  ).sort((a, b) => String(a).localeCompare(String(b)));

  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPosition = positionFilter === 'all' || player.position === positionFilter;
    const matchesCategory = categoryFilter === 'all' || player.team?.category === categoryFilter;
    
    return matchesSearch && matchesPosition && matchesCategory;
  });

  return (
    <AdminLayout title="Tournament Players">
      <div className="admin-page-header">
        <div className="page-header-left">
          <button className="refresh-btn" onClick={fetchPlayers}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ marginLeft: 10 }}
          >
            <i className="fas fa-plus"></i> Add Player
          </button>
        </div>
        <div className="page-header-right">
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            title="Filter by category"
          >
            <option value="all">All Categories</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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
                <th>No.</th>
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
                        <strong>{player.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="position-badge">{player.position}</span>
                    </td>
                    <td>{player.number ?? '—'}</td>
                    <td>{player.team?.name || 'N/A'}</td>
                    <td>
                      <span className="category-badge">{player.team?.category}</span>
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
                    alt={selectedPlayer.name}
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
                      value={selectedPlayer.name || ''}
                      onChange={(e) => setSelectedPlayer({
                        ...selectedPlayer,
                        name: e.target.value
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Jersey Number (optional)</label>
                    <input
                      type="number"
                      value={selectedPlayer.number ?? ''}
                      onChange={(e) => setSelectedPlayer({
                        ...selectedPlayer,
                        number: e.target.value === '' ? null : parseInt(e.target.value, 10)
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
                    <label>Player Photo</label>
                    {selectedPlayer.player_image && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                        <a
                          className="btn-secondary"
                          href={selectedPlayer.player_image}
                          download={`player-${(selectedPlayer.name || 'photo').toString().trim().replace(/\s+/g, '-').toLowerCase()}.jpg`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: 'none' }}
                          title="Download current player photo"
                        >
                          <i className="fas fa-download" /> Download Image
                        </a>
                        <small style={{ color: '#6b7280' }}>
                          Tip: if download is blocked by the browser, it will open in a new tab—use “Save image as…”.
                        </small>
                      </div>
                    )}
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
                        name: selectedPlayer.name,
                        number: selectedPlayer.number ?? null,
                        position: selectedPlayer.position,
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
                      <span>{selectedPlayer.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Position:</label>
                      <span className="position-badge">{selectedPlayer.position}</span>
                    </div>
                    <div className="detail-item">
                      <label>Jersey No.:</label>
                      <span>{selectedPlayer.number ?? '—'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Team:</label>
                      <span>{selectedPlayer.team?.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Type:</label>
                      {selectedPlayer.is_substitute ? (
                        <span className="type-badge substitute">Substitute</span>
                      ) : (
                        <span className="type-badge starter">Starter</span>
                      )}
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

      {/* Add Player Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Player</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="edit-form">
                <div className="form-group">
                  <label>Player Name *</label>
                  <input
                    type="text"
                    placeholder="Enter player name"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Team *</label>
                  <select
                    value={newPlayer.team_id}
                    onChange={(e) => setNewPlayer({ ...newPlayer, team_id: e.target.value })}
                  >
                    <option value="">Select a team...</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Position</label>
                  <select
                    value={newPlayer.position}
                    onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                  >
                    {POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Jersey Number (optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={newPlayer.number}
                    onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Player Type</label>
                  <select
                    value={newPlayer.is_substitute ? 'substitute' : 'starter'}
                    onChange={(e) => setNewPlayer({ ...newPlayer, is_substitute: e.target.value === 'substitute' })}
                  >
                    <option value="starter">Starter</option>
                    <option value="substitute">Substitute</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowAddModal(false)}
                    disabled={addingPlayer}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={addPlayer}
                    disabled={addingPlayer}
                  >
                    {addingPlayer ? (
                      <><i className="fas fa-spinner fa-spin"></i> Adding...</>
                    ) : (
                      <><i className="fas fa-plus"></i> Add Player</>
                    )}
                  </button>
                </div>

                <p style={{ marginTop: 15, fontSize: '0.85rem', color: '#6b7280' }}>
                  <i className="fas fa-info-circle"></i> After adding the player, you can edit them to upload a photo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

