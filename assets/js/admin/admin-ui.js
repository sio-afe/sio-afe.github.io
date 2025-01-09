import { supabaseClient, signIn, signOut, isAdmin } from '../supabase-client.js';

// UI Elements
const adminBtn = document.getElementById('adminBtn');
const adminIcon = document.getElementById('adminIcon');
const adminLoginModal = document.getElementById('adminLoginModal');
const adminLoginForm = document.getElementById('adminLoginForm');
const closeModalBtn = document.querySelector('.close-modal');
const adminPanelModal = document.getElementById('adminPanelModal');

// Show/hide admin controls based on auth state
async function updateUIForAuthState() {
    try {
        const isAdminUser = await isAdmin();
        
        // Update icon based on auth state
        if (adminIcon) {
            adminIcon.className = isAdminUser ? 'fas fa-sign-out-alt' : 'fas fa-user-shield';
            adminBtn.title = isAdminUser ? 'Logout' : ' Login';
        }

        // Show admin panel if logged in
        if (isAdminUser && adminPanelModal) {
            showAdminPanel();
        }
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

// Modal handlers
function showModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.style.display = 'block';
        // Focus on email input
        setTimeout(() => {
            const emailInput = document.getElementById('adminEmail');
            if (emailInput) {
                emailInput.focus();
            }
        }, 100);
    }
}

function hideModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form if it exists
        const form = document.getElementById('adminLoginForm');
        if (form) {
            form.reset();
        }
    }
}

function showAdminPanel() {
    if (adminPanelModal) {
        adminPanelModal.style.display = 'block';
    }
}

function hideAdminPanel() {
    if (adminPanelModal) {
        adminPanelModal.style.display = 'none';
    }
}

// Event Listeners
if (adminBtn) {
    adminBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const isAdminUser = await isAdmin();
        
        if (isAdminUser) {
            // If logged in, log out
            try {
                hideAdminPanel();
                await signOut();
                await updateUIForAuthState();
            } catch (error) {
                console.error('Logout failed:', error);
                alert('Logout failed: ' + error.message);
            }
        } else {
            // If not logged in, show login modal
            showModal();
        }
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hideModal);
}

if (adminLoginModal) {
    adminLoginModal.addEventListener('click', (e) => {
        if (e.target === adminLoginModal) {
            hideModal();
        }
    });
}

if (adminPanelModal) {
    adminPanelModal.addEventListener('click', (e) => {
        if (e.target === adminPanelModal) {
            hideAdminPanel();
        }
    });
}

if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail')?.value;
        const password = document.getElementById('adminPassword')?.value;
        
        console.log('Login attempt with email:', email);
        
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        try {
            console.log('Attempting to sign in...');
            const result = await signIn(email, password);
            console.log('Sign in result:', result);
            hideModal();
            await updateUIForAuthState();
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed: ' + (error.message || 'Unknown error'));
        }
    });
}

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    updateUIForAuthState();
    
    // Listen for auth state changes
    supabaseClient.auth.onAuthStateChange(() => {
        updateUIForAuthState();
    });
}); 