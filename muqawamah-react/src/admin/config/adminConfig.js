/**
 * Admin Configuration
 * Centralized admin settings and permissions
 */

// Super Admin Email(s)
export const SUPER_ADMIN_EMAILS = [
  'admin@sio-abulfazal.org',
  // Add more super admin emails here if needed
];

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/muqawamah/admin',
  REGISTRATIONS: '/muqawamah/admin/registrations',
  PLAYERS: '/muqawamah/admin/players',
  TEAMS: '/muqawamah/admin/teams',
  FIXTURES: '/muqawamah/admin/fixtures',
  MATCHES: '/muqawamah/admin/matches',
  GOALS: '/muqawamah/admin/goals',
  STATISTICS: '/muqawamah/admin/statistics',
  UTILITIES: '/muqawamah/admin/utilities',
  SETTINGS: '/muqawamah/admin/settings'
};

// Admin Permissions
export const PERMISSIONS = {
  VIEW_REGISTRATIONS: 'view_registrations',
  EDIT_REGISTRATIONS: 'edit_registrations',
  DELETE_REGISTRATIONS: 'delete_registrations',
  MANAGE_PLAYERS: 'manage_players',
  MANAGE_TEAMS: 'manage_teams',
  MANAGE_FIXTURES: 'manage_fixtures',
  MANAGE_MATCHES: 'manage_matches',
  MANAGE_GOALS: 'manage_goals',
  VIEW_STATISTICS: 'view_statistics'
};

// Registration Status Options
export const REGISTRATION_STATUSES = [
  { value: 'draft', label: 'Draft', color: '#9ca3af' },
  { value: 'submitted', label: 'Submitted', color: '#fbbf24' },
  { value: 'pending_verification', label: 'Pending Verification', color: '#f59e0b' },
  { value: 'confirmed', label: 'Confirmed', color: '#10b981' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
];

// Tournament Categories
export const CATEGORIES = [
  { value: 'open-age', label: 'Open Age' },
  { value: 'u17', label: 'Under 17' }
];

// Player Positions
export const POSITIONS = [
  'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'CF', 'ST'
];

