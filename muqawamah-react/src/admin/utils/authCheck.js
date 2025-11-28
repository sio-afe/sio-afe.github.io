/**
 * Admin Authentication Check Utilities
 */

import { supabaseClient } from '../../lib/supabaseClient';
import { SUPER_ADMIN_EMAILS } from '../config/adminConfig';

/**
 * Check if the current user is a super admin
 * @returns {Promise<boolean>}
 */
export const isSuperAdmin = async () => {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error || !user) {
      return false;
    }
    
    // Check if user's email is in the super admin list
    return SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase());
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
};

/**
 * Get current admin user
 * @returns {Promise<Object|null>}
 */
export const getAdminUser = async () => {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    const isAdmin = await isSuperAdmin();
    
    if (!isAdmin) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      role: 'super_admin',
      metadata: user.user_metadata
    };
  } catch (err) {
    console.error('Error getting admin user:', err);
    return null;
  }
};

/**
 * Verify admin access (throws error if not admin)
 * @throws {Error} If user is not an admin
 */
export const verifyAdminAccess = async () => {
  const isAdmin = await isSuperAdmin();
  
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return true;
};

