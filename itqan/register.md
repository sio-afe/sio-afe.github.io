---
layout: tasfiya
title: Register - Itqan
scripts:
  - src: https://unpkg.com/@supabase/supabase-js@2.39.7/dist/umd/supabase.js
  - src: /assets/js/supabase-init.js
  - src: /assets/js/supabase-client.js
  - src: /assets/js/register.js
---

<div class="register-page">
    <h1 class="text-center mb-4">Register for <span class="thuluth-text">إتقان</span> </h1>
    
    <!-- Add payment info box -->
    <div class="payment-info-box">
        <h3><i class="fas fa-info-circle"></i> Registration Process</h3>
        <ol>
            <li>Fill and submit this registration form</li>
            <li>You will receive a WhatsApp message with payment details on the registered number</li>
            <li>Complete the payment via UPI and send the screenshot</li>
            <li>On Verification, You will be conveyed further details</li>
        </ol>
        <div class="fee-info">
            <p><strong>Registration Fee:</strong> ₹80</p>
            <p><small>* Payment instructions will be shared via WhatsApp after registration</small></p>
        </div>
    </div>

    <div class="register-form-container">
        <form id="registrationForm" class="registration-form">
            <div class="form-group">
                <label for="category">Competition Category</label>
                <select id="category" name="category" class="form-control" required>
                    <option value="">Select Category</option>
                    <option value="hifz">Hifz Competition</option>
                    <option value="tilawat">Tilawat Competition</option>
                    <option value="adhan">Adhan Competition</option>
                </select>
            </div>

            <div class="form-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" name="fullName" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="age">Age</label>
                <input type="number" id="age" name="age" class="form-control" required min="5" max="100">
            </div>

            <div class="form-group" id="subcategoryGroup" style="display: none;">
                <label for="subcategory">Competition Level </label>
                <select id="subcategory" name="subcategory" class="form-control" required>
                    <option value="">Select Level</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="address">Address</label>
                <textarea id="address" name="address" class="form-control" required rows="3"></textarea>
            </div>
            
            <button type="submit" class="register-submit-btn">Submit</button>
            <p class="help-text">Having trouble submitting? Please contact us at <a href="tel:+918826340784">+91 88263 40784</a></p>
        </form>
    </div>
</div>

<!-- Add success/error message container -->
<div class="message-container">
    <div class="success-message" style="display: none;">
        <i class="fas fa-check-circle"></i>
        <span class="message-text"></span>
    </div>
    <div class="error-message" style="display: none;">
        <i class="fas fa-exclamation-circle"></i>
        <span class="message-text"></span>
    </div>
</div>

<style>
.register-page {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    position: relative;
    background: #ffffff;
}

.register-page h1 {
    color: #07002c;
    text-shadow: none;
}

/* Add Thuluth font */
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');

.thuluth-text {
    font-family: 'Amiri', serif;
    font-size: 1.8em;
    background: linear-gradient(45deg, #957718, #e2c27d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    font-weight: 700;
    filter: drop-shadow(2px 2px 4px rgba(149, 119, 24, 0.3));
    display: inline-block;
}

@media (max-width: 768px) {
    .thuluth-text {
        font-size: 1.5em;
    }
}

.register-form-container {
    background: #ffffff;
    padding: 2rem;
    border-radius: 15px;
    border: 1px solid rgba(16, 3, 47, 0.1);
    box-shadow: 0 8px 32px rgba(16, 3, 47, 0.05);
}

.registration-form {
    display: grid;
    gap: 1.5rem;
}

.form-group {
    position: relative;
    transition: all 0.3s ease;
    opacity: 1;
    transform: translateY(0);
}

.form-group.hidden {
    opacity: 0;
    transform: translateY(-10px);
    pointer-events: none;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #07002c;
    font-weight: 500;
}

.form-control {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #ffffff;
    border: 1px solid rgba(16, 3, 47, 0.1);
    border-radius: 8px;
    color: #07002c;
    transition: all 0.3s ease;
}

.form-control:focus {
    outline: none;
    border-color: #957718;
    box-shadow: 0 0 0 2px rgba(149, 119, 24, 0.2);
    background: #ffffff;
}

.form-control:disabled {
    background: rgba(16, 3, 47, 0.05);
    cursor: not-allowed;
}

select.form-control {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23957718' viewBox='0 0 16 16'%3E%3Cpath d='M8 11l-7-7h14l-7 7z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2.5rem;
}

[dir="rtl"] select.form-control {
    background-position: left 1rem center;
    padding-right: 1rem;
    padding-left: 2.5rem;
}

.register-submit-btn {
    background: linear-gradient(45deg, #957718, #e2c27d);
    color: #ffffff;
    border: none;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    margin-top: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    letter-spacing: 0.5px;
}

.register-submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(149, 119, 24, 0.3);
    background: linear-gradient(45deg, #8b6e17, #d4b76f);
}

.register-submit-btn:active {
    transform: translateY(0);
}

/* RTL Support */
[dir="rtl"] .register-page {
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', sans-serif;
}

[dir="rtl"] .form-group label {
    font-size: 1.2rem;
}

[dir="rtl"] .form-control {
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', sans-serif;
    font-size: 1.1rem;
    line-height: 1.8;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .register-page {
        padding: 1rem;
    }
    
    .register-form-container {
        padding: 1.5rem;
    }
}

/* Add animation for form groups */
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.form-group {
    animation: slideDown 0.3s ease-out forwards;
}

/* Add styles for success/error messages */
.message-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    width: 300px;
}

.success-message,
.error-message {
    display: none;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    animation: fadeIn 0.3s ease-out;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.success-message {
    background: rgba(40, 167, 69, 0.95);
    border: 1px solid rgba(40, 167, 69, 0.2);
    color: white;
}

.error-message {
    background: rgba(220, 53, 69, 0.95);
    border: 1px solid rgba(220, 53, 69, 0.2);
    color: white;
}

.success-message i,
.error-message i {
    margin-right: 0.5rem;
    font-size: 1.2rem;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .message-container {
        width: calc(100% - 40px);
        max-width: 300px;
    }
}

/* Add these new styles for better form appearance */
.form-control::placeholder {
    color: rgba(7, 0, 44, 0.5);
}

.form-control:hover {
    border-color: rgba(149, 119, 24, 0.3);
}

/* Style for required field indicator */
.form-group label::after {
    content: '*';
    color: #957718;
    margin-left: 4px;
}

/* Remove asterisk from optional fields */
.form-group:has(input:not([required])) label::after,
.form-group:has(select:not([required])) label::after,
.form-group:has(textarea:not([required])) label::after {
    display: none;
}

/* Add focus ring for better accessibility */
.form-control:focus-visible {
    outline: 2px solid rgba(149, 119, 24, 0.4);
    outline-offset: 1px;
}

/* Style for disabled state */
.form-control:disabled {
    background-color: rgba(7, 0, 44, 0.05);
    color: rgba(7, 0, 44, 0.6);
}

/* Add transition for smooth hover effects */
.form-control {
    transition: all 0.2s ease-in-out;
}

/* Add styles for help text */
.help-text {
    text-align: center;
    margin-top: 1rem;
    color: #666;
    font-size: 0.9rem;
}

.help-text a {
    color: #957718;
    text-decoration: none;
    font-weight: 500;
}

.help-text a:hover {
    text-decoration: underline;
}

/* Add styles for payment info box */
.payment-info-box {
    background: rgba(149, 119, 24, 0.05);
    border: 1px solid rgba(149, 119, 24, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.payment-info-box h3 {
    color: #957718;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.payment-info-box ol {
    margin: 0;
    padding-left: 1.5rem;
    color: #333;
}

.payment-info-box li {
    margin-bottom: 0.5rem;
    line-height: 1.4;
}

.fee-info {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed rgba(149, 119, 24, 0.2);
}

.fee-info p {
    margin: 0.25rem 0;
    color: #333;
}

.fee-info small {
    color: #666;
    font-style: italic;
}

/* RTL support for payment info box */
[dir="rtl"] .payment-info-box ol {
    padding-right: 1.5rem;
    padding-left: 0;
}

[dir="rtl"] .payment-info-box h3 i {
    margin-left: 0.5rem;
    margin-right: 0;
}
</style>

<script type="module">
import { getClient, submitRegistration, checkEmailExists } from '/assets/js/supabase-client.js';

// Make updateSubcategories available globally
window.updateSubcategories = function() {
    const category = document.getElementById('category').value;
    const subcategoryGroup = document.getElementById('subcategoryGroup');
    const subcategory = document.getElementById('subcategory');
    const age = document.getElementById('age').value;

    // Clear existing options
    subcategory.innerHTML = '<option value="">Select Level</option>';

    if (category === 'hifz') {
        subcategoryGroup.style.display = 'block';
        if (age && parseInt(age) < 17) {
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
};

async function initializeForm() {
    try {
        // Wait for Supabase to be initialized
        const supabaseClient = await getClient();
        if (!supabaseClient) {
            throw new Error('Failed to get Supabase client');
        }

        // Add event listeners
        const form = document.getElementById('registrationForm');
        const ageInput = document.getElementById('age');
        const successMessage = document.querySelector('.success-message');
        const errorMessage = document.querySelector('.error-message');

        if (!form || !ageInput) {
            throw new Error('Required form elements not found');
        }

        // Add event listeners
        ageInput.addEventListener('change', window.updateSubcategories);

        function showMessage(type, text, isPersistent = false) {
            const messageElement = type === 'success' ? successMessage : errorMessage;
            const otherMessage = type === 'success' ? errorMessage : successMessage;
            
            messageElement.querySelector('.message-text').innerHTML = text;
            messageElement.style.display = 'flex';
            otherMessage.style.display = 'none';
            
            // Only set timeout for error messages
            if (!isPersistent && type === 'error') {
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 5000);
            }
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.register-submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            
            try {
                // Validate required fields
                const requiredFields = form.querySelectorAll('[required]');
                for (const field of requiredFields) {
                    if (!field.value) {
                        throw new Error(`${field.name} is required`);
                    }
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
                    address: form.address.value,
                    participant_type: 'individual'
                };
                
                // Submit registration
                const { data, error } = await submitRegistration(formData);
                if (error) throw error;

                // Create WhatsApp link with payment details
                const message = encodeURIComponent(
                    `Subject: Registration for *${formData.category.charAt(0).toUpperCase() + formData.category.slice(1)} Competition* in Itqan\n\n` +
                    `Salam!,\n\n` +
                    `I am ${formData.full_name}, registering for ${formData.category.charAt(0).toUpperCase() + formData.category.slice(1)} Competition in Itqan.\n\n` +
                    `Please provide the payment details for registration fee of ₹80.`
                );
                const whatsappLink = `whatsapp://send?phone=918826340784&text=${message}`;
                const webWhatsappLink = `https://wa.me/918826340784?text=${message}`;
                
                // Create success message with click handler and fallback
                const successHtml = `
                    <div style="text-align: left; line-height: 1.5;">
                        <p style="margin-bottom: 10px;">Registration process started! Please complete these steps:</p>
                        <ol style="margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 8px;">Use your registered phone number (${formData.phone})</li>
                            <li style="margin-bottom: 8px;">
                                <a href="${whatsappLink}" 
                                   onclick="window.location.href='${webWhatsappLink}';return false;" 
                                   target="_blank" 
                                   style="color: white; text-decoration: underline;">
                                    Click here to send WhatsApp message
                                </a>
                            </li>
                            <li style="margin-bottom: 8px;">Wait for payment details and follow the instructions</li>
                        </ol>
                    </div>
                `;
                
                showMessage('success', successHtml, true);
                form.reset();
                
            } catch (error) {
                console.error('Error:', error);
                showMessage('error', error.message || 'Registration failed. Please try again later.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit';
            }
        });

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
</script> 