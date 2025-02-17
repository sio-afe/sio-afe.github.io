import { getClient, submitRegistration, checkEmailExists } from './supabase-client.js';

function updateSubcategories() {
    const category = document.getElementById('category').value;
    const subcategoryGroup = document.getElementById('subcategoryGroup');
    const subcategory = document.getElementById('subcategory');
    const age = document.getElementById('age').value;

    // Clear existing options
    subcategory.innerHTML = '<option value="">Select Level</option>';

    if (category === 'hifz') {
        subcategoryGroup.style.display = 'block';
        if (age && parseInt(age) < 12) {
            subcategory.innerHTML += '<option value="1juz">1 Juz</option>';
        } else {
            subcategory.innerHTML += `
                <option value="2juz">2 Juz</option>
                <option value="full">Full Quran</option>
            `;
        }
    } else if (category === 'tilawat' || category === 'adhan') {
        subcategoryGroup.style.display = 'block';
        subcategory.innerHTML += '<option value="open">Open Age</option>';
    } else {
        subcategoryGroup.style.display = 'none';
    }
}

function showMessage(type, text, successMessage, errorMessage) {
    const messageElement = type === 'success' ? successMessage : errorMessage;
    const otherMessage = type === 'success' ? errorMessage : successMessage;
    
    messageElement.querySelector('.message-text').textContent = text;
    messageElement.style.display = 'flex';
    otherMessage.style.display = 'none';
    
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

async function handleFormSubmit(e, form, successMessage, errorMessage) {
    e.preventDefault();
    
    const submitBtn = form.querySelector('.register-submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    try {
        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        for (const field of requiredFields) {
            if (!field.value) {
                const fieldLabel = form.querySelector(`label[for="${field.id}"]`)?.textContent || field.name;
                throw new Error(`${fieldLabel} is required`);
            }
        }

        // Check if subcategory is required but hidden
        const category = form.category.value;
        const subcategoryGroup = document.getElementById('subcategoryGroup');
        if ((category === 'hifz' || category === 'tilawat' || category === 'adhan') && 
            (!form.subcategory.value || subcategoryGroup.style.display === 'none')) {
            updateSubcategories(); // Show the subcategory field
            subcategoryGroup.scrollIntoView({ behavior: 'smooth' });
            throw new Error('Please select a Competition Level');
        }
        
        // Validate age
        const age = parseInt(form.age.value);
        if (age < 5 || age > 100) {
            throw new Error('Age must be between 5 and 100');
        }
        
        // Validate phone number format
        const phone = form.phone.value;
        if (!/^\+?[\d\s-]{10,}$/.test(phone)) {
            throw new Error('Please enter a valid phone number');
        }
        
        // Validate email format
        const email = form.email.value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Please enter a valid email address');
        }

        // Check if email already exists for this category
        const { exists, error: emailCheckError } = await checkEmailExists(email, form.category.value);
        if (emailCheckError) throw emailCheckError;
        if (exists) {
            throw new Error('You have already registered for this category');
        }
        
        const formData = {
            full_name: form.fullName.value,
            email: email,
            phone: phone,
            age: age,
            category: form.category.value,
            subcategory: form.subcategory.value,
            participant_type: form.participant_type.value,
            school_name: form.school_name.value || null,
            address: form.address.value
        };
        
        // Submit registration
        const { data, error } = await submitRegistration(formData);
        if (error) {
            if (error.message?.includes('row-level security')) {
                throw new Error('Registration system is temporarily unavailable. Please contact us at +91 88263 40784 for assistance.');
            }
            throw error;
        }
        
        showMessage('success', 'Registration successful! We will contact you soon.', successMessage, errorMessage);
        form.reset();
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('error', error.message || 'Registration failed. Please try again later.', successMessage, errorMessage);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Registration';
    }
}

async function initializeForm() {
    try {
        // Wait for Supabase to be initialized
        const supabaseClient = await getClient();
        if (!supabaseClient) {
            throw new Error('Failed to get Supabase client');
        }

        // Get form elements
        const form = document.getElementById('registrationForm');
        const ageInput = document.getElementById('age');
        const categoryInput = document.getElementById('category');
        const participantTypeInput = document.getElementById('participant_type');
        const successMessage = document.querySelector('.success-message');
        const errorMessage = document.querySelector('.error-message');

        if (!form || !ageInput || !categoryInput || !participantTypeInput) {
            throw new Error('Required form elements not found');
        }

        // Add event listeners
        ageInput.addEventListener('change', updateSubcategories);
        categoryInput.addEventListener('change', () => {
            updateSubcategories();
            // Reset subcategory when category changes
            document.getElementById('subcategory').value = '';
        });
        participantTypeInput.addEventListener('change', function() {
            const schoolGroup = document.getElementById('schoolGroup');
            schoolGroup.style.display = this.value === 'school' ? 'block' : 'none';
            document.getElementById('school_name').required = this.value === 'school';
        });

        // Initial call to set up subcategories if category is pre-selected
        if (categoryInput.value) {
            updateSubcategories();
        }

        form.addEventListener('submit', (e) => handleFormSubmit(e, form, successMessage, errorMessage));

        console.log('Registration form initialized successfully');
    } catch (error) {
        console.error('Failed to initialize registration form:', error);
        throw error;
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeForm().catch(error => {
            console.error('Failed to initialize application:', error);
        });
    });
} else {
    initializeForm().catch(error => {
        console.error('Failed to initialize application:', error);
    });
} 