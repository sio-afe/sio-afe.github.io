/**
 * Stats Recalculator Utility
 * Recalculates all team statistics from completed matches
 * Use this to fix data inconsistencies
 */

import React, { useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import { compressImage } from '../../../components/shared/registration/utils/imageCompression';
import { ensurePublicImageUrl } from '../../../lib/storage';

export default function StatsRecalculator() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [thumbRunning, setThumbRunning] = useState(false);
  const [thumbLimit, setThumbLimit] = useState(150);
  const [cleanupRunning, setCleanupRunning] = useState(false);
  const [cleanupLimitPerTable, setCleanupLimitPerTable] = useState(5000);
  const [cleanupMaxDelete, setCleanupMaxDelete] = useState(200);
  const [cleanupReport, setCleanupReport] = useState(null);
  const [cleanupShowPreviews, setCleanupShowPreviews] = useState(false);
  const [cleanupPreviewCount, setCleanupPreviewCount] = useState(24);

  const addLog = (message, type = 'info') => {
    setLog(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const parseStoragePublicUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const marker = '/storage/v1/object/public/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const after = url.slice(idx + marker.length); // "{bucket}/{path...}"
    const [bucket, ...pathParts] = after.split('/');
    const path = pathParts.join('/');
    if (!bucket || !path) return null;
    return { bucket, path };
  };

  const insertSuffixBeforeExtension = (path, suffix) => {
    const lastSlash = path.lastIndexOf('/');
    const file = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;
    const dir = lastSlash >= 0 ? path.slice(0, lastSlash + 1) : '';
    const dot = file.lastIndexOf('.');
    if (dot === -1) return null;
    return `${dir}${file.slice(0, dot)}${suffix}${file.slice(dot)}`;
  };

  const fetchAsFile = async (url) => {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
    const blob = await res.blob();
    const contentType = blob.type || 'image/webp';
    const ext = contentType.includes('png')
      ? 'png'
      : contentType.includes('jpeg') || contentType.includes('jpg')
        ? 'jpg'
        : 'webp';
    return new File([blob], `image.${ext}`, { type: contentType });
  };

  const uploadVariant = async ({ bucket, path, dataUrl }) => {
    try {
      await ensurePublicImageUrl({
        value: dataUrl,
        bucket,
        path,
        upsert: false
      });
      return { ok: true, existed: false };
    } catch (e) {
      const msg = String(e?.message || e);
      if (msg.toLowerCase().includes('already exists') || msg.includes('409')) {
        return { ok: true, existed: true };
      }
      throw e;
    }
  };

  const backfillThumbnails = async () => {
    if (!confirm('This will generate and upload missing _thumb/_card variants for existing images.\n\nContinue?')) {
      return;
    }

    setThumbRunning(true);
    setLog([]);

    try {
      addLog('🖼️ Starting thumbnail backfill...', 'info');

      const tasks = [];
      const collect = async ({ table, column }) => {
        try {
          const { data, error } = await supabaseClient.from(table).select(`id, ${column}`).limit(thumbLimit);
          if (error) throw error;
          (data || []).forEach((row) => {
            const url = row?.[column];
            if (typeof url === 'string' && url.includes('/storage/v1/object/public/')) {
              tasks.push({ table, column, url });
            }
          });
        } catch (e) {
          addLog(`⚠️ Skipped ${table}.${column}: ${e.message || e}`, 'warning');
        }
      };

      // Registration + tournament tables
      await collect({ table: 'team_registrations', column: 'team_logo' });
      await collect({ table: 'team_players', column: 'player_image' });
      await collect({ table: 'teams', column: 'crest_url' });
      await collect({ table: 'players', column: 'player_image' });

      addLog(`🔎 Found ${tasks.length} Storage image URLs to process (limit ${thumbLimit})`, 'info');

      let processed = 0;
      let created = 0;
      let skipped = 0;

      for (const t of tasks) {
        processed += 1;
        try {
          const parsed = parseStoragePublicUrl(t.url);
          if (!parsed) {
            skipped += 1;
            continue;
          }

          const file = await fetchAsFile(t.url);

          // Thumb (fast lists/grids)
          const thumbDataUrl = await compressImage(file, {
            maxWidth: 240,
            maxHeight: 240,
            quality: 0.82,
            outputFormat: 'image/webp'
          });
          const thumbPath = insertSuffixBeforeExtension(parsed.path, '_thumb');
          if (thumbPath) {
            const r = await uploadVariant({ bucket: parsed.bucket, path: thumbPath, dataUrl: thumbDataUrl });
            if (!r.existed) created += 1;
          }

          // Card variant for player photos (bigger)
          const isPlayerImage = t.table === 'team_players' || t.table === 'players' || t.url.includes('/player_image/');
          if (isPlayerImage) {
            const cardDataUrl = await compressImage(file, {
              maxWidth: 520,
              maxHeight: 650,
              quality: 0.86,
              outputFormat: 'image/webp'
            });
            const cardPath = insertSuffixBeforeExtension(parsed.path, '_card');
            if (cardPath) {
              const r = await uploadVariant({ bucket: parsed.bucket, path: cardPath, dataUrl: cardDataUrl });
              if (!r.existed) created += 1;
            }
          }

          if (processed % 10 === 0) addLog(`⏳ Processed ${processed}/${tasks.length}...`, 'info');
        } catch (e) {
          skipped += 1;
          addLog(`❌ Failed: ${t.url} (${e.message || e})`, 'error');
        }
      }

      addLog(`✅ Done. processed=${processed}, createdVariants=${created}, skipped=${skipped}`, 'success');
      addLog('Refresh Player Database / Standings pages — thumbnails should load much faster now.', 'info');
    } finally {
      setThumbRunning(false);
    }
  };

  const runCleanupScan = async () => {
    try {
      setCleanupRunning(true);
      setCleanupReport(null);
      addLog('🧹 Running Storage cleanup scan (unused images)...', 'info');

      const { data, error } = await supabaseClient.functions.invoke('storage-unused', {
        body: {
          dryRun: true,
          prefixes: ['legacy', 'admin'],
          limitPerTable: cleanupLimitPerTable,
          maxReturn: 250
        }
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Cleanup scan failed');

      setCleanupReport(data);
      addLog(
        `✅ Cleanup scan done: unused=${data.unusedCount} (showing ${data.unusedPreview?.length || 0})`,
        'success'
      );
    } catch (e) {
      addLog(`❌ Cleanup scan error: ${e.message || e}`, 'error');
    } finally {
      setCleanupRunning(false);
    }
  };

  const runCleanupDelete = async () => {
    if (!cleanupReport?.unusedCount) {
      alert('Run a cleanup scan first.');
      return;
    }
    const plannedDeleteCount = Math.min(cleanupMaxDelete, cleanupReport.unusedCount || 0);
    if (
      !confirm(
        `⚠️ This will DELETE ${plannedDeleteCount} unused Storage object(s) from the bucket.\n\n(Max delete cap: ${cleanupMaxDelete}; unused found: ${cleanupReport.unusedCount})\n\nThis cannot be undone.\n\nContinue?`
      )
    ) {
      return;
    }

    try {
      setCleanupRunning(true);
      addLog(`🗑️ Deleting ${plannedDeleteCount} unused Storage object(s)...`, 'warning');

      const { data, error } = await supabaseClient.functions.invoke('storage-unused', {
        body: {
          dryRun: false,
          confirm: 'DELETE',
          prefixes: ['legacy', 'admin'],
          limitPerTable: cleanupLimitPerTable,
          maxDelete: cleanupMaxDelete,
          maxReturn: 250
        }
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Cleanup delete failed');

      setCleanupReport(data);
      addLog(`✅ Deleted ${data.deletedCount} objects. Remaining unused=${data.unusedCount}`, 'success');
    } catch (e) {
      addLog(`❌ Cleanup delete error: ${e.message || e}`, 'error');
    } finally {
      setCleanupRunning(false);
    }
  };

  const getPublicUrlForObject = (bucket, objectPath) => {
    try {
      const { data } = supabaseClient.storage.from(bucket).getPublicUrl(objectPath);
      return data?.publicUrl || null;
    } catch {
      return null;
    }
  };

  const recalculateAllStats = async () => {
    if (!confirm('⚠️ This will recalculate ALL team statistics from completed matches.\n\nThis may take a few moments. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      setLog([]);
      addLog('🚀 Starting stats recalculation...', 'info');

      // Fetch all teams
      const { data: teams, error: teamsError } = await supabaseClient
        .from('teams')
        .select('*')
        .order('name');

      if (teamsError) throw teamsError;

      const teamsToProcess = categoryFilter === 'all' 
        ? teams 
        : teams.filter(t => t.category === categoryFilter);

      addLog(`📊 Found ${teamsToProcess.length} teams to process`, 'info');

      // Reset all team stats
      for (const team of teamsToProcess) {
        await supabaseClient
          .from('teams')
          .update({
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goals_for: 0,
            goals_against: 0,
            points: 0
          })
          .eq('id', team.id);
      }
      addLog('✅ Reset all team stats to zero', 'success');

      // Fetch all completed matches
      const { data: matches, error: matchesError } = await supabaseClient
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, category),
          away_team:teams!matches_away_team_id_fkey(id, name, category)
        `)
        .eq('status', 'completed');

      if (matchesError) throw matchesError;

      const matchesToProcess = categoryFilter === 'all'
        ? matches
        : matches.filter(m => m.home_team?.category === categoryFilter);

      addLog(`⚽ Found ${matchesToProcess.length} completed matches`, 'info');

      // Process each completed match
      for (const match of matchesToProcess) {
        if (!match.home_team_id || !match.away_team_id) {
          addLog(`⚠️ Skipping match with missing teams`, 'warning');
          continue;
        }

        const homeScore = match.home_score || 0;
        const awayScore = match.away_score || 0;

        // Fetch current team stats
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
          addLog(`⚠️ Skipping match: teams not found`, 'warning');
          continue;
        }

        // Calculate new stats for home team
        let homeStats = {
          played: (homeTeam.played || 0) + 1,
          goals_for: (homeTeam.goals_for || 0) + homeScore,
          goals_against: (homeTeam.goals_against || 0) + awayScore
        };

        // Calculate new stats for away team
        let awayStats = {
          played: (awayTeam.played || 0) + 1,
          goals_for: (awayTeam.goals_for || 0) + awayScore,
          goals_against: (awayTeam.goals_against || 0) + homeScore
        };

        // Determine result
        if (homeScore > awayScore) {
          homeStats.won = (homeTeam.won || 0) + 1;
          homeStats.points = (homeTeam.points || 0) + 3;
          awayStats.lost = (awayTeam.lost || 0) + 1;
        } else if (homeScore < awayScore) {
          awayStats.won = (awayTeam.won || 0) + 1;
          awayStats.points = (awayTeam.points || 0) + 3;
          homeStats.lost = (homeTeam.lost || 0) + 1;
        } else {
          homeStats.drawn = (homeTeam.drawn || 0) + 1;
          homeStats.points = (homeTeam.points || 0) + 1;
          awayStats.drawn = (awayTeam.drawn || 0) + 1;
          awayStats.points = (awayTeam.points || 0) + 1;
        }

        // Update both teams
        await supabaseClient.from('teams').update(homeStats).eq('id', match.home_team_id);
        await supabaseClient.from('teams').update(awayStats).eq('id', match.away_team_id);

        addLog(`✓ Processed: ${homeTeam.name} ${homeScore}-${awayScore} ${awayTeam.name}`, 'success');
      }

      addLog('🎉 Recalculation complete!', 'success');
      addLog(`📈 Processed ${matchesToProcess.length} matches across ${teamsToProcess.length} teams`, 'info');

    } catch (error) {
      console.error('Error recalculating stats:', error);
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const syncMatchScoresFromGoals = async () => {
    if (!confirm('🔄 This will recalculate match scores from goal records.\n\nUse this if scores are out of sync with goals. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      setLog([]);
      addLog('🚀 Starting match score sync from goals...', 'info');

      // Fetch all matches
      const { data: matches, error: matchesError } = await supabaseClient
        .from('matches')
        .select('*');

      if (matchesError) throw matchesError;

      const matchesToProcess = categoryFilter === 'all'
        ? matches
        : matches.filter(m => m.category === categoryFilter);

      addLog(`⚽ Found ${matchesToProcess.length} matches to sync`, 'info');

      let synced = 0;
      let errors = 0;

      for (const match of matchesToProcess) {
        try {
          // Count goals for each team in this match
          const { data: homeGoals, error: homeError } = await supabaseClient
            .from('goals')
            .select('id')
            .eq('match_id', match.id)
            .eq('team_id', match.home_team_id);

          const { data: awayGoals, error: awayError } = await supabaseClient
            .from('goals')
            .select('id')
            .eq('match_id', match.id)
            .eq('team_id', match.away_team_id);

          if (homeError || awayError) throw new Error('Failed to fetch goals');

          const homeScore = homeGoals?.length || 0;
          const awayScore = awayGoals?.length || 0;

          // Update match scores if different
          if (match.home_score !== homeScore || match.away_score !== awayScore) {
            await supabaseClient
              .from('matches')
              .update({
                home_score: homeScore,
                away_score: awayScore
              })
              .eq('id', match.id);

            addLog(`✓ Synced match scores: ${homeScore}-${awayScore}`, 'success');
            synced++;
          }
        } catch (err) {
          addLog(`⚠️ Error processing match: ${err.message}`, 'warning');
          errors++;
        }
      }

      addLog(`🎉 Sync complete! ${synced} matches updated, ${errors} errors`, 'success');

    } catch (error) {
      console.error('Error syncing match scores:', error);
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Statistics Utilities">
      <div className="utilities-page">
        <div className="utilities-header">
          <h2>⚙️ Data Management Utilities</h2>
          <p className="utilities-description">
            Use these tools to maintain data integrity and fix inconsistencies
          </p>
        </div>

        <div className="category-filter">
          <label>Category Filter:</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Categories</option>
            <option value="open-age">Open Age</option>
            <option value="u17">U17</option>
          </select>
        </div>

        <div className="utilities-cards">
          <div className="utility-card">
            <div className="utility-icon">📊</div>
            <h3>Recalculate Team Statistics</h3>
            <p>
              Resets and recalculates all team statistics (played, won, drawn, lost, goals, points)
              from completed match results. Use this to fix data inconsistencies.
            </p>
            <button 
              className="btn-primary"
              onClick={recalculateAllStats}
              disabled={loading}
            >
              {loading ? '⏳ Processing...' : '🔄 Recalculate All Stats'}
            </button>
          </div>

          <div className="utility-card">
            <div className="utility-icon">⚽</div>
            <h3>Sync Match Scores from Goals</h3>
            <p>
              Recalculates match scores by counting goal records in the database.
              Use this if match scores don't match the recorded goals.
            </p>
            <button 
              className="btn-primary"
              onClick={syncMatchScoresFromGoals}
              disabled={loading}
            >
              {loading ? '⏳ Processing...' : '🔄 Sync Scores from Goals'}
            </button>
          </div>

          <div className="utility-card">
            <div className="utility-icon">🖼️</div>
            <h3>Generate Image Thumbnails</h3>
            <p>
              Backfills missing <code>_thumb</code> and <code>_card</code> variants in Supabase Storage for existing images.
              This makes Player/Team lists load much faster (no loading circle).
            </p>
            <p style={{ marginTop: 8, color: '#6b7280', fontSize: '0.95rem' }}>
              <strong>Limit per run</strong> is a safety cap so your browser doesn’t freeze while resizing/uploading lots of images.
              You can run it multiple times until everything is generated.
            </p>
            <div className="thumb-controls">
              <label>
                Limit per run:
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={thumbLimit}
                  onChange={(e) => setThumbLimit(parseInt(e.target.value) || 150)}
                  disabled={thumbRunning || loading}
                />
              </label>
            </div>
            <button
              className="btn-primary"
              onClick={backfillThumbnails}
              disabled={thumbRunning || loading}
            >
              {thumbRunning ? '⏳ Generating...' : '✨ Generate Thumbnails'}
            </button>
          </div>

          <div className="utility-card">
            <div className="utility-icon">🧹</div>
            <h3>Storage Cleanup (Unused Images)</h3>
            <p>
              Finds Storage objects that are <strong>not referenced</strong> by your database (players/teams/registrations),
              so you can delete clutter safely. This runs server-side (Edge Function) so your service key stays private.
            </p>
            <p style={{ marginTop: 8, color: '#6b7280', fontSize: '0.95rem' }}>
              Recommended flow: <strong>Scan</strong> → review list → optionally <strong>Delete</strong> (capped).
            </p>

            <div className="cleanup-controls">
              <label>
                Limit per table:
                <input
                  type="number"
                  min="100"
                  max="20000"
                  value={cleanupLimitPerTable}
                  onChange={(e) => setCleanupLimitPerTable(parseInt(e.target.value) || 5000)}
                  disabled={cleanupRunning || loading}
                />
              </label>
              <label>
                Max delete:
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={cleanupMaxDelete}
                  onChange={(e) => setCleanupMaxDelete(parseInt(e.target.value) || 200)}
                  disabled={cleanupRunning || loading}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={runCleanupScan} disabled={cleanupRunning || loading}>
                {cleanupRunning ? '⏳ Working...' : '🔎 Scan Unused'}
              </button>
              <button
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}
                onClick={runCleanupDelete}
                disabled={cleanupRunning || loading || !cleanupReport?.unusedCount}
              >
                🗑️ Delete (capped)
              </button>
            </div>

            {cleanupReport?.ok && (
              <div className="cleanup-report">
                <div className="cleanup-metrics">
                  <div><strong>Scanned</strong>: {cleanupReport.totalObjectsScanned}</div>
                  <div><strong>Unused</strong>: {cleanupReport.unusedCount}</div>
                  <div><strong>Deleted</strong>: {cleanupReport.deletedCount}</div>
                </div>
                <div className="cleanup-preview-controls">
                  <label>
                    <input
                      type="checkbox"
                      checked={cleanupShowPreviews}
                      onChange={(e) => setCleanupShowPreviews(e.target.checked)}
                      disabled={cleanupRunning || loading}
                    />
                    Show image previews
                  </label>
                  <label>
                    Preview count:
                    <input
                      type="number"
                      min="6"
                      max="80"
                      value={cleanupPreviewCount}
                      onChange={(e) => setCleanupPreviewCount(parseInt(e.target.value) || 24)}
                      disabled={cleanupRunning || loading || !cleanupShowPreviews}
                    />
                  </label>
                </div>

                {cleanupShowPreviews && Array.isArray(cleanupReport.unusedPreview) && cleanupReport.unusedPreview.length > 0 && (
                  <div className="cleanup-preview-grid">
                    {cleanupReport.unusedPreview.slice(0, cleanupPreviewCount).map((p) => {
                      const url = getPublicUrlForObject(cleanupReport.bucket, p);
                      return (
                        <div className="cleanup-preview-item" key={p}>
                          {url ? (
                            <img
                              src={url}
                              alt={p}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                // Hide broken previews (private objects / missing permissions)
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="cleanup-preview-missing">No preview</div>
                          )}
                          <div className="cleanup-preview-path" title={p}>{p}</div>
                          <button
                            type="button"
                            className="cleanup-copy-btn"
                            onClick={() => navigator.clipboard?.writeText(p)}
                          >
                            Copy path
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {Array.isArray(cleanupReport.unusedPreview) && cleanupReport.unusedPreview.length > 0 && (
                  <>
                    <div style={{ marginTop: 10, fontSize: '0.95rem', color: '#6b7280' }}>
                      Showing first {cleanupReport.unusedPreview.length} unused candidates:
                    </div>
                    <pre className="cleanup-list">
{cleanupReport.unusedPreview.join('\n')}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {log.length > 0 && (
          <div className="utility-log">
            <h3>📝 Process Log</h3>
            <div className="log-content">
              {log.map((entry, index) => (
                <div key={index} className={`log-entry log-${entry.type}`}>
                  <span className="log-time">[{entry.timestamp}]</span>
                  <span className="log-message">{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .utilities-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .utilities-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .utilities-header h2 {
          font-size: 2rem;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .utilities-description {
          color: #666;
          font-size: 1.1rem;
        }

        .category-filter {
          background: white;
          padding: 15px 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .category-filter label {
          font-weight: 600;
          color: #333;
        }

        .category-filter select {
          padding: 8px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-filter select:focus {
          outline: none;
          border-color: #667eea;
        }

        .utilities-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .utility-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .utility-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }

        .utility-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .utility-card h3 {
          font-size: 1.4rem;
          margin-bottom: 10px;
          color: #333;
        }

        .utility-card p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .btn-primary {
          width: 100%;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .thumb-controls {
          margin: 10px 0 12px;
        }

        .thumb-controls label {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .thumb-controls input {
          width: 120px;
          padding: 8px 10px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          outline: none;
        }

        .thumb-controls input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
        }

        .cleanup-controls {
          margin: 10px 0 12px;
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cleanup-controls label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .cleanup-controls input {
          width: 140px;
          padding: 8px 10px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          outline: none;
        }

        .cleanup-controls input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
        }

        .cleanup-report {
          margin-top: 12px;
          text-align: left;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px;
        }

        .cleanup-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 8px;
          font-size: 0.95rem;
        }

        .cleanup-preview-controls {
          margin-top: 10px;
          display: flex;
          gap: 14px;
          align-items: center;
          flex-wrap: wrap;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .cleanup-preview-controls label {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cleanup-preview-controls input[type="number"] {
          width: 110px;
          padding: 6px 8px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          outline: none;
        }

        .cleanup-preview-grid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .cleanup-preview-item {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: white;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cleanup-preview-item img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          background: #f3f4f6;
        }

        .cleanup-preview-missing {
          width: 100%;
          height: 120px;
          border-radius: 8px;
          background: #f3f4f6;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .cleanup-preview-path {
          font-size: 12px;
          color: #374151;
          word-break: break-all;
          max-height: 48px;
          overflow: auto;
        }

        .cleanup-copy-btn {
          border: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 8px;
          padding: 8px 10px;
          cursor: pointer;
          font-weight: 600;
          color: #374151;
        }

        .cleanup-copy-btn:hover {
          background: #f9fafb;
        }

        .cleanup-list {
          margin-top: 10px;
          max-height: 180px;
          overflow: auto;
          background: #111827;
          color: #e5e7eb;
          padding: 10px;
          border-radius: 8px;
          font-size: 12px;
        }

        .utility-log {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .utility-log h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .log-content {
          max-height: 400px;
          overflow-y: auto;
          background: #f9fafb;
          border-radius: 8px;
          padding: 15px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.9rem;
        }

        .log-entry {
          padding: 8px 12px;
          margin-bottom: 8px;
          border-radius: 6px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .log-time {
          color: #999;
          flex-shrink: 0;
        }

        .log-message {
          flex: 1;
        }

        .log-info {
          background: #eff6ff;
          color: #1e40af;
        }

        .log-success {
          background: #f0fdf4;
          color: #166534;
        }

        .log-warning {
          background: #fef9c3;
          color: #854d0e;
        }

        .log-error {
          background: #fef2f2;
          color: #991b1b;
        }

        @media (max-width: 768px) {
          .utilities-cards {
            grid-template-columns: 1fr;
          }
          
          .category-filter {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </AdminLayout>
  );
}


