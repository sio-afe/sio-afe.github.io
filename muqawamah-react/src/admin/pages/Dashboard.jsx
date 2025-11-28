/**
 * Admin Dashboard - Main Overview Page
 */

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../lib/supabaseClient';
import AdminLayout from '../components/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    confirmedTeams: 0,
    totalPlayers: 0,
    pendingPayments: 0,
    upcomingMatches: 0,
    totalGoals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch registration counts
      const { count: totalRegs } = await supabaseClient
        .from('team_registrations')
        .select('*', { count: 'exact', head: true });

      const { count: confirmed } = await supabaseClient
        .from('team_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed');

      const { count: pending } = await supabaseClient
        .from('team_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_payment');

      // Fetch player count
      const { count: players } = await supabaseClient
        .from('team_players')
        .select('*', { count: 'exact', head: true });

      // Fetch upcoming matches count
      const { count: matches } = await supabaseClient
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .gte('match_date', new Date().toISOString());

      // Fetch total goals
      const { count: goals } = await supabaseClient
        .from('goals')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalRegistrations: totalRegs || 0,
        confirmedTeams: confirmed || 0,
        totalPlayers: players || 0,
        pendingPayments: pending || 0,
        upcomingMatches: matches || 0,
        totalGoals: goals || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Registrations',
      value: stats.totalRegistrations,
      icon: 'fas fa-file-alt',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      link: '/muqawamah/admin/registrations'
    },
    {
      title: 'Confirmed Teams',
      value: stats.confirmedTeams,
      icon: 'fas fa-check-circle',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      link: '/muqawamah/admin/teams'
    },
    {
      title: 'Total Players',
      value: stats.totalPlayers,
      icon: 'fas fa-users',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      link: '/muqawamah/admin/players'
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      icon: 'fas fa-clock',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      link: '/muqawamah/admin/registrations?status=pending_payment'
    },
    {
      title: 'Upcoming Matches',
      value: stats.upcomingMatches,
      icon: 'fas fa-calendar-alt',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      link: '/muqawamah/admin/fixtures'
    },
    {
      title: 'Total Goals',
      value: stats.totalGoals,
      icon: 'fas fa-trophy',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      link: '/muqawamah/admin/goals'
    }
  ];

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="admin-stats-grid">
            {statCards.map((card, index) => (
              <a 
                key={index} 
                href={card.link} 
                className="admin-stat-card clean"
              >
                <div className="stat-icon-wrapper" style={{ backgroundColor: card.bgColor }}>
                  <i className={card.icon} style={{ color: card.color }}></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-title">{card.title}</h3>
                  <p className="stat-value">{card.value}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="admin-dashboard-bottom">
            <div className="admin-quick-actions-clean">
              <h2 className="section-title-clean">Quick Actions</h2>
              <div className="quick-actions-list">
                <a href="/muqawamah/admin/registrations" className="quick-action-item">
                  <div className="action-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                    <i className="fas fa-eye"></i>
                  </div>
                  <span>View Registrations</span>
                  <i className="fas fa-chevron-right action-arrow"></i>
                </a>
                <a href="/muqawamah/admin/fixtures" className="quick-action-item">
                  <div className="action-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <i className="fas fa-plus"></i>
                  </div>
                  <span>Create Fixture</span>
                  <i className="fas fa-chevron-right action-arrow"></i>
                </a>
                <a href="/muqawamah/admin/matches" className="quick-action-item">
                  <div className="action-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <i className="fas fa-edit"></i>
                  </div>
                  <span>Record Match Result</span>
                  <i className="fas fa-chevron-right action-arrow"></i>
                </a>
                <a href="/muqawamah/admin/teams" className="quick-action-item">
                  <div className="action-icon" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <span>Manage Teams</span>
                  <i className="fas fa-chevron-right action-arrow"></i>
                </a>
              </div>
            </div>

            <div className="admin-recent-activity">
              <h2 className="section-title-clean">Recent Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <i className="fas fa-check"></i>
                  </div>
                  <div className="activity-details">
                    <p className="activity-title">Team Registration Confirmed</p>
                    <p className="activity-time">2 hours ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <i className="fas fa-calendar"></i>
                  </div>
                  <div className="activity-details">
                    <p className="activity-title">New Match Scheduled</p>
                    <p className="activity-time">5 hours ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <i className="fas fa-futbol"></i>
                  </div>
                  <div className="activity-details">
                    <p className="activity-title">Match Result Recorded</p>
                    <p className="activity-time">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

