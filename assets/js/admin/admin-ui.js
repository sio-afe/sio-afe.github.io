import { getClient, signIn, signOut, isAdmin } from '../supabase-client.js';

// Initialize UI elements after DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== ADMIN UI INITIALIZATION START ===');
    
    try {
        console.log('Waiting for Supabase initialization...');
        await window.waitForSupabase();
        console.log('Supabase initialized successfully');
        
        // UI Elements
        const adminBtn = document.getElementById('adminBtn');
        const adminIcon = document.getElementById('adminIcon');
        const adminBtnText = document.getElementById('adminBtnText');
        const adminLoginModal = document.getElementById('adminLoginModal');
        const adminLoginForm = document.getElementById('adminLoginForm');
        const closeModalBtn = document.querySelector('.close-modal');

        // Debug logging for form elements
        console.log('=== UI ELEMENTS STATUS ===');
        const elements = {
            adminBtn: !!adminBtn,
            adminIcon: !!adminIcon,
            adminBtnText: !!adminBtnText,
            adminLoginModal: !!adminLoginModal,
            adminLoginForm: !!adminLoginForm,
            closeModalBtn: !!closeModalBtn
        };
        console.log('Form elements found:', elements);
        console.log('Modal element details:', {
            modalDisplay: adminLoginModal?.style.display,
            modalClasses: adminLoginModal?.className,
            modalHTML: adminLoginModal?.innerHTML?.substring(0, 100) + '...'
        });

        // Modal handlers
        function showModal() {
            console.log('=== SHOW MODAL START ===');
            console.log('Modal before show:', {
                exists: !!adminLoginModal,
                display: adminLoginModal?.style.display,
                visibility: adminLoginModal?.style.visibility
            });
            
            if (adminLoginModal) {
                adminLoginModal.style.display = 'block';
                console.log('Modal display set to: block');
                
                const emailInput = document.getElementById('adminEmail');
                console.log('Email input found:', !!emailInput);
                if (emailInput) {
                    emailInput.focus();
                    console.log('Email input focused');
                }
            } else {
                console.error('Modal element not found when trying to show');
            }
            
            console.log('=== SHOW MODAL END ===');
        }

        function hideModal() {
            console.log('=== HIDE MODAL START ===');
            if (adminLoginModal) {
                adminLoginModal.style.display = 'none';
                console.log('Modal hidden');
                if (adminLoginForm) {
                    adminLoginForm.reset();
                    console.log('Form reset');
                }
            }
            console.log('=== HIDE MODAL END ===');
        }

        // Show/hide admin controls based on auth state
        async function updateUIForAuthState() {
            console.log('=== UPDATE UI STATE START ===');
            try {
                const isAdminUser = await isAdmin();
                console.log('Current admin status:', isAdminUser);
                
                if (adminIcon && adminBtnText) {
                    adminIcon.className = isAdminUser ? 'fas fa-sign-out-alt' : 'fas fa-user-shield';
                    adminBtnText.textContent = isAdminUser ? 'Logout' : 'Login';
                    adminBtn.title = isAdminUser ? 'Logout' : 'Login';
                    console.log('Updated button UI:', {
                        iconClass: adminIcon.className,
                        buttonText: adminBtnText.textContent,
                        buttonTitle: adminBtn.title
                    });
                }

                // Show/hide admin view based on auth state
                const viewToggle = document.querySelector('.view-toggle');
                const userView = document.querySelector('.user-view');
                const adminView = document.querySelector('.admin-view');

                console.log('View elements found:', {
                    viewToggle: !!viewToggle,
                    userView: !!userView,
                    adminView: !!adminView
                });

                if (viewToggle && userView && adminView) {
                    if (isAdminUser) {
                        viewToggle.style.display = 'flex';
                        if (!userView.classList.contains('active') && !adminView.classList.contains('active')) {
                            userView.classList.add('active');
                        }
                    } else {
                        viewToggle.style.display = 'none';
                        userView.classList.add('active');
                        adminView.classList.remove('active');
                    }
                    console.log('Updated view states');
                }
            } catch (error) {
                console.error('Error updating UI:', error);
            }
            console.log('=== UPDATE UI STATE END ===');
        }

        // If admin elements don't exist, return early
        if (!adminBtn || !adminLoginModal) {
            console.error('Required admin UI elements not found:', {
                adminBtn: !!adminBtn,
                adminLoginModal: !!adminLoginModal
            });
            return;
        }

        // Event Listeners
        adminBtn.addEventListener('click', async (e) => {
            console.log('=== ADMIN BUTTON CLICKED ===');
            e.preventDefault();
            console.log('Checking admin status...');
            const isAdminUser = await isAdmin();
            console.log('Admin button clicked, current admin status:', isAdminUser);
            
            if (isAdminUser) {
                console.log('Attempting to log out...');
                try {
                    await signOut();
                    console.log('Logout successful');
                    await updateUIForAuthState();
                    window.location.reload();
                } catch (error) {
                    console.error('Logout failed:', error);
                    alert('Logout failed: ' + error.message);
                }
            } else {
                console.log('Showing login modal...');
                showModal();
                console.log('Modal should now be visible');
            }
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', (e) => {
                console.log('Close button clicked');
                e.preventDefault();
                hideModal();
            });
        }

        if (adminLoginModal) {
            adminLoginModal.addEventListener('click', (e) => {
                console.log('Modal background clicked');
                if (e.target === adminLoginModal) {
                    console.log('Closing modal from background click');
                    hideModal();
                }
            });
        }

        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', async (e) => {
                console.log('=== LOGIN FORM SUBMITTED ===');
                e.preventDefault();
                
                const emailInput = document.getElementById('adminEmail');
                const passwordInput = document.getElementById('adminPassword');
                
                console.log('Form inputs found:', {
                    emailInput: !!emailInput,
                    passwordInput: !!passwordInput
                });
                
                if (!emailInput || !passwordInput) {
                    console.error('Form inputs not found');
                    alert('Error: Form inputs not found');
                    return;
                }
                
                const email = emailInput.value;
                const password = passwordInput.value;
                
                console.log('Form validation:', {
                    hasEmail: !!email,
                    hasPassword: !!password
                });
                
                if (!email || !password) {
                    console.log('Form validation failed');
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
                    window.location.reload();
                } catch (error) {
                    console.error('Login failed:', error);
                    alert('Login failed: ' + (error.message || 'Unknown error'));
                }
            });
        }

        // Initialize UI state on load
        console.log('Initializing UI state...');
        await updateUIForAuthState();
        console.log('=== ADMIN UI INITIALIZATION COMPLETE ===');
        
    } catch (error) {
        console.error('Error initializing admin UI:', error);
    }
}); 