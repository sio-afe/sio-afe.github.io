import { supabaseClient, signIn, signOut, isAdmin } from '../supabase-client.js';

// Initialize UI elements after DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing admin UI...');
    
    // UI Elements
    const adminBtn = document.getElementById('adminBtn');
    const adminIcon = document.getElementById('adminIcon');
    const adminBtnText = document.getElementById('adminBtnText');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const closeModalBtn = document.querySelector('.close-modal');

    // Debug logging for form elements
    console.log('Form elements found:', {
        adminBtn: !!adminBtn,
        adminIcon: !!adminIcon,
        adminBtnText: !!adminBtnText,
        adminLoginModal: !!adminLoginModal,
        adminLoginForm: !!adminLoginForm,
        closeModalBtn: !!closeModalBtn
    });

    // Show/hide admin controls based on auth state
    async function updateUIForAuthState() {
        try {
            // Add a small delay to ensure Supabase is initialized
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const isAdminUser = await isAdmin();
            console.log('Admin status:', isAdminUser);
            
            // Update button based on auth state
            if (adminIcon && adminBtnText) {
                adminIcon.className = isAdminUser ? 'fas fa-sign-out-alt' : 'fas fa-user-shield';
                adminBtnText.textContent = isAdminUser ? '' : '';
                adminBtn.title = isAdminUser ? 'Logout' : 'Login';
            }

            // Show/hide admin view based on auth state
            const viewToggle = document.querySelector('.view-toggle');
            const userView = document.querySelector('.user-view');
            const adminView = document.querySelector('.admin-view');

            if (viewToggle && userView && adminView) {
                if (isAdminUser) {
                    viewToggle.style.display = 'flex';
                    // Keep current view if already set
                    if (!userView.classList.contains('active') && !adminView.classList.contains('active')) {
                        userView.classList.add('active');
                    }
                } else {
                    viewToggle.style.display = 'none';
                    userView.classList.add('active');
                    adminView.classList.remove('active');
                }
            }
        } catch (error) {
            console.error('Error updating UI:', error);
            // Reset to default state on error
            if (adminIcon && adminBtnText) {
                adminIcon.className = 'fas fa-user-shield';
                adminBtnText.textContent = 'Login';
                adminBtn.title = 'Login';
            }
        }
    }

    // Modal handlers
    function showModal() {
        if (adminLoginModal) {
            adminLoginModal.style.display = 'block';
            // Focus on email input
            const emailInput = document.getElementById('adminEmail');
            if (emailInput) {
                emailInput.focus();
            }
        }
    }

    function hideModal() {
        if (adminLoginModal) {
            adminLoginModal.style.display = 'none';
            // Reset form if it exists
            if (adminLoginForm) {
                adminLoginForm.reset();
            }
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
                    await signOut();
                    console.log('Logged out successfully');
                    await updateUIForAuthState();
                    // Reload the page to reset all admin states
                    window.location.reload();
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

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('adminEmail');
            const passwordInput = document.getElementById('adminPassword');
            
            if (!emailInput || !passwordInput) {
                console.error('Form inputs not found');
                alert('Error: Form inputs not found');
                return;
            }
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }

            try {
                console.log('Attempting to sign in...');
                const { error } = await signIn(email, password);
                
                if (error) {
                    console.error('Sign in error:', error);
                    alert('Login failed: ' + error.message);
                    return;
                }

                console.log('Sign in successful');
                hideModal();
                // Reload the page to initialize all admin features
                window.location.reload();
            } catch (error) {
                console.error('Login failed:', error);
                alert('Login failed: ' + (error.message || 'Unknown error'));
            }
        });
    }

    // Initialize UI state on load
    updateUIForAuthState();
}); 