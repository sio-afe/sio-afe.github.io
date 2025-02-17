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
            <li>Fill the registration form below</li>
            <li>Click submit to proceed with UPI payment</li>
            <li>Complete the payment using your preferred UPI app</li>
            <li>You will receive confirmation on successful registration</li>
        </ol>
        <div class="fee-info">
            <p><strong>Registration Fee:</strong> ₹80</p>
            <p><small>* Payment will be processed via UPI</small></p>
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
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    padding: 1rem;
}

.success-message,
.error-message {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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

/* Updated styles for UPI payment buttons */
.upi-buttons-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1rem auto;
    max-width: 600px;
    padding: 0 1rem;
}

.upi-app-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: white;
    color: #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    min-width: 100px;
}

.upi-app-button span {
    font-size: 0.9em;
    text-align: center;
    line-height: 1.2;
    color: #333;
}

.upi-icon {
    width: 40px;
    height: 40px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    transition: transform 0.3s ease;
}

.gpay-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M21.5 11.5h-9v3h5.5c-.5 2.5-2.5 4-5.5 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.5 0 2.9.5 4 1.5l2.3-2.3C17.3 4 15 3 12.5 3 7.8 3 4 6.8 4 11.5s3.8 8.5 8.5 8.5c7 0 8.5-6.5 8.5-8.5 0-.7 0-1.2-.1-1.5z'/%3E%3C/svg%3E");
}

.phonepe-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%235f259f' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z'/%3E%3C/svg%3E");
}

.paytm-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2300B9F1' d='M19 5v2h-4v12h-2V7H9V5h10zM5 5v14h14v2H3V5h2z'/%3E%3C/svg%3E");
}

.other-upi-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23957718' d='M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z'/%3E%3C/svg%3E");
}

.upi-app-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: #f8f9fa;
}

.upi-app-button:active {
    transform: translateY(0);
}

@media (max-width: 600px) {
    .upi-buttons-container {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.8rem;
    }
    
    .upi-app-button {
        padding: 0.8rem;
    }
}

@media (max-width: 360px) {
    .upi-buttons-container {
        grid-template-columns: 1fr;
    }
}

/* Add styles for payment module */
.payment-module {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.08);
}

.payment-module-header {
    text-align: center;
    margin-bottom: 2rem;
}

.payment-module-header h3 {
    color: #333;
    font-size: 1.4rem;
    margin: 0;
    font-weight: 600;
    margin-bottom: 1rem;
}

.payment-module-amount {
    font-size: 3rem;
    font-weight: 700;
    color: #1a73e8;
    margin: 1.5rem 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.upi-buttons-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
    margin: 1.5rem auto;
}

.upi-app-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    padding: 1.2rem 1rem;
    border-radius: 16px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: white;
    color: #333;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.upi-app-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    background: #f8f9fa;
    border-color: rgba(0, 0, 0, 0.12);
}

.upi-app-button:active {
    transform: translateY(0);
}

.upi-app-button span {
    font-size: 0.9em;
    text-align: center;
    line-height: 1.2;
    color: #333;
    font-weight: 500;
}

.upi-icon {
    width: 40px;
    height: 40px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    transition: transform 0.3s ease;
}

.upi-app-button:hover .upi-icon {
    transform: scale(1.1);
}

.payment-module-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.transaction-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.transaction-info span {
    color: #555;
    font-size: 0.9rem;
}

.transaction-info span:first-child {
    font-weight: 500;
    color: #333;
}

@media (max-width: 600px) {
    .payment-module {
        margin: 0.5rem;
        padding: 1.5rem;
        border-radius: 16px;
    }

    .payment-module-header h3 {
        font-size: 1.2rem;
    }

    .payment-module-amount {
        font-size: 2.5rem;
        margin: 1rem 0;
    }

    .upi-buttons-container {
        gap: 1rem;
    }

    .upi-app-button {
        padding: 1rem;
    }

    .upi-icon {
        width: 36px;
        height: 36px;
    }
}

@media (max-width: 360px) {
    .upi-buttons-container {
        grid-template-columns: repeat(2, 1fr);
    }

    .payment-module {
        padding: 1.2rem;
    }
}

/* Message container backdrop */
.message-container {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
}

/* Add these styles for a better payment experience */
.payment-module {
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Add styles for the amount display */
.payment-module-amount {
    position: relative;
    display: inline-block;
    padding: 0.5rem 2rem;
    background: linear-gradient(135deg, #f6f9ff 0%, #f0f4ff 100%);
    border-radius: 12px;
    border: 1px solid rgba(26, 115, 232, 0.1);
}

.payment-module-amount::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(26, 115, 232, 0.1), transparent);
    border-radius: inherit;
    z-index: -1;
}

/* Success message styles */
.payment-success {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    color: #333;
}

.payment-success i {
    font-size: 4rem;
    color: #2e7d32;
    margin-bottom: 1rem;
}

.payment-success h3 {
    font-size: 1.5rem;
    color: #2e7d32;
    margin-bottom: 1rem;
}

.payment-success p {
    color: #333;
    margin-bottom: 1rem;
}

.payment-success .transaction-details {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: left;
}

.transaction-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: #333;
}

.transaction-info span {
    color: #333;
}

.transaction-info span:first-child {
    font-weight: 500;
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
};

// Function to handle UPI payment
async function handleUPIPayment(formData) {
    const transactionId = 'ITQ' + Date.now();
    const upiId = "adnanshakeelahmed99@oksbi"; // Your UPI ID
    const amount = "1";
    
    // Generate different UPI app links
    const gpayLink = `gpay://upi/pay?pa=${upiId}&pn=Itqan%20Registration&am=${amount}&tr=${transactionId}&tn=Registration%20for%20${encodeURIComponent(formData.full_name)}`;
    const phonepeLink = `phonepe://pay?pa=${upiId}&pn=Itqan%20Registration&am=${amount}&tr=${transactionId}&tn=Registration%20for%20${encodeURIComponent(formData.full_name)}`;
    const paytmLink = `paytmmp://pay?pa=${upiId}&pn=Itqan%20Registration&am=${amount}&tr=${transactionId}&tn=Registration%20for%20${encodeURIComponent(formData.full_name)}`;
    
    // Create payment module HTML
    const paymentHtml = `
        <div class="payment-module">
            <div class="payment-module-header">
                <h3>Complete Your Payment</h3>
                <div class="payment-module-amount">₹${amount}</div>
            </div>
            <div class="upi-buttons-container">
                <a href="${gpayLink}" class="upi-app-button gpay-button">
                    <div class="upi-icon gpay-icon"></div>
                    <span>Google<br>Pay</span>
                </a>
                <a href="${phonepeLink}" class="upi-app-button phonepe-button">
                    <div class="upi-icon phonepe-icon"></div>
                    <span>PhonePe</span>
                </a>
                <a href="${paytmLink}" class="upi-app-button paytm-button">
                    <div class="upi-icon paytm-icon"></div>
                    <span>Paytm</span>
                </a>
            </div>
            <div class="payment-module-footer">
                <div class="transaction-info">
                    <span>Transaction ID:</span>
                    <span>${transactionId}</span>
                </div>
                <div class="transaction-info">
                    <span>UPI ID:</span>
                    <span>${upiId}</span>
                </div>
            </div>
        </div>
    `;
    
    return { paymentHtml, transactionId };
}

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
            const messageContainer = document.querySelector('.message-container');
            const messageElement = type === 'success' ? successMessage : errorMessage;
            const otherMessage = type === 'success' ? errorMessage : successMessage;
            
            messageElement.querySelector('.message-text').innerHTML = text;
            messageContainer.style.display = 'flex';
            messageElement.style.display = 'block';
            otherMessage.style.display = 'none';
            
            // Add click event listener to close on outside click
            messageContainer.onclick = function(e) {
                if (e.target === messageContainer) {
                    messageContainer.style.display = 'none';
                    if (!isPersistent) {
                        messageElement.style.display = 'none';
                    }
                }
            };
            
            // Only set timeout for error messages
            if (!isPersistent && type === 'error') {
                setTimeout(() => {
                    messageContainer.style.display = 'none';
                    messageElement.style.display = 'none';
                }, 5000);
            }
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.register-submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
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

                // Generate UPI payment
                const { paymentHtml, transactionId } = await handleUPIPayment(formData);
                
                // Show payment UI
                showMessage('success', paymentHtml, true);
                
                // Store form data temporarily
                sessionStorage.setItem('pendingRegistration', JSON.stringify({
                    formData,
                    transactionId
                }));
                
            } catch (error) {
                console.error('Error:', error);
                showMessage('error', error.message || 'Registration failed. Please try again later.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit';
            }
        });

        // Check for pending registration on page load
        window.addEventListener('pageshow', function() {
            const pendingReg = sessionStorage.getItem('pendingRegistration');
            if (pendingReg) {
                const { formData, transactionId } = JSON.parse(pendingReg);
                
                // Clear any existing messages
                const messageContainer = document.querySelector('.message-container');
                messageContainer.style.display = 'none';
                document.querySelector('.success-message').style.display = 'none';
                document.querySelector('.error-message').style.display = 'none';
                
                // Submit registration and show success message
                submitRegistration(formData)
                    .then(({ data, error }) => {
                        if (error) throw error;
                        
                        // Show success message
                        const successMessage = document.querySelector('.success-message');
                        successMessage.innerHTML = `
                            <div class="payment-success">
                                <i class="fas fa-check-circle"></i>
                                <h3>Registration Successful!</h3>
                                <p>Your payment has been received and registration is complete.</p>
                                <div class="transaction-details">
                                    <div class="transaction-info">
                                        <span>Transaction ID:</span>
                                        <span>${transactionId}</span>
                                    </div>
                                    <div class="transaction-info">
                                        <span>Amount Paid:</span>
                                        <span>₹1</span>
                                    </div>
                                    <div class="transaction-info">
                                        <span>Category:</span>
                                        <span>${formData.category}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                        messageContainer.style.display = 'flex';
                        successMessage.style.display = 'block';
                        sessionStorage.removeItem('pendingRegistration');
                        
                        // Add click event listener to close on outside click
                        messageContainer.onclick = function(e) {
                            if (e.target === messageContainer) {
                                messageContainer.style.display = 'none';
                                successMessage.style.display = 'none';
                            }
                        };
                    })
                    .catch(error => {
                        showMessage('error', error.message || 'Failed to complete registration');
                    });
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