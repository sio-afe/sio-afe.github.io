---
layout: tasfiya
title: Register - Itqan
scripts:
  - src: https://unpkg.com/@supabase/supabase-js@2.39.7/dist/umd/supabase.js
  - src: https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js
  - src: https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js
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
                <label for="category" class="required">Competition Category</label>
                <select id="category" name="category" class="form-control" required>
                    <option value="">Select Category</option>
                    <option value="hifz">Hifz Competition</option>
                    <option value="tilawat">Tilawat Competition</option>
                    <option value="adhan">Adhan Competition</option>
                </select>
            </div>

            <div class="form-group">
                <label for="fullName" class="required">Full Name</label>
                <input type="text" id="fullName" name="fullName" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="email" class="required">Email</label>
                <input type="email" id="email" name="email" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="phone" class="required">Phone Number</label>
                <input type="tel" id="phone" name="phone" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="age" class="required">Age</label>
                <input type="number" id="age" name="age" class="form-control" required min="5" max="100">
            </div>

            <div class="form-group" id="subcategoryGroup" style="display: none;">
                <label for="subcategory" class="required">Competition Level</label>
                <select id="subcategory" name="subcategory" class="form-control" required>
                    <option value="">Select Level</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="address" class="required">Address</label>
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
    .register-page {
        padding: 1rem;
        margin: 1rem;
        width: calc(100% - 2rem);
    }
    
    .register-form-container {
        padding: 1rem;
    }

    .register-page h1 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }

    .thuluth-text {
        font-size: 1.3em;
    }

    .payment-info-box {
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .payment-info-box h3 {
        font-size: 1.1rem;
    }

    .payment-info-box ol {
        padding-left: 1.2rem;
        margin-bottom: 0.5rem;
    }

    .payment-info-box li {
        font-size: 0.9rem;
        margin-bottom: 0.3rem;
    }

    .fee-info {
        margin-top: 0.8rem;
        padding-top: 0.8rem;
    }

    .fee-info p {
        font-size: 0.9rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        font-size: 0.95rem;
        margin-bottom: 0.3rem;
    }

    .form-control {
        padding: 0.6rem 0.8rem;
        font-size: 0.95rem;
    }

    .register-submit-btn {
        padding: 0.8rem 1.5rem;
        font-size: 0.95rem;
    }

    .help-text {
        font-size: 0.85rem;
        margin-top: 0.8rem;
    }

    /* Payment module mobile adjustments */
    .payment-module {
        padding: 1rem;
        margin: 1rem auto;
        width: calc(100% - 2rem);
    }

    .payment-module-header h3 {
        font-size: 1.1rem;
    }

    .payment-module-amount {
        font-size: 1.6rem;
    }

    .upi-button-container {
        margin: 1rem 0;
    }

    .upi-app-button {
        padding: 1rem;
    }

    .pay-using-text {
        font-size: 1rem;
    }

    .upi-logo {
        height: 32px;
    }

    .transaction-info {
        font-size: 0.85rem;
    }

    /* Verification form mobile adjustments */
    #verificationSection {
        margin-top: 1rem;
    }

    #verificationSection h4 {
        font-size: 1.1rem;
    }

    .verification-form {
        padding: 1rem;
    }

    .verification-form .form-control {
        padding: 0.6rem;
    }

    /* Success/Error messages mobile adjustments */
    .message-container {
        padding: 60px 0.5rem 0.5rem 0.5rem; /* Adjusted top padding for mobile */
    }

    .success-message,
    .error-message {
        padding: 1.25rem;
        margin: 0 auto 0.5rem auto;
        width: calc(100% - 2rem);
    }

    .payment-success {
        padding: 1.5rem;
        margin: 0 auto 0.5rem auto;
    }

    .payment-success i {
        font-size: 2.5rem;
    }

    .payment-success h3 {
        font-size: 1.2rem;
    }

    .transaction-details {
        padding: 0.8rem;
    }
}

/* Extra small devices */
@media (max-width: 360px) {
    .register-page h1 {
        font-size: 1.3rem;
    }

    .thuluth-text {
        font-size: 1.2em;
    }

    .payment-module-amount {
        font-size: 1.4rem;
    }

    .form-control {
        padding: 0.5rem 0.7rem;
        font-size: 0.9rem;
    }

    .register-submit-btn {
        padding: 0.7rem 1.2rem;
        font-size: 0.9rem;
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

.form-group label.required::after {
    content: '*';
    color: #957718;
    margin-left: 4px;
    font-size: 1.2em;
    background: linear-gradient(45deg, #957718, #e2c27d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0px 0px 1px rgba(149, 119, 24, 0.3));
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
    background: rgba(0, 0, 0, 0.5);
    display: none;
    align-items: flex-start;
    justify-content: center;
    z-index: 1000;
    padding: 76px 1rem 1rem 1rem; /* Added top padding to account for navbar */
    overflow-y: auto;
}

.success-message,
.error-message,
.payment-module {
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Payment module specific styles */
.payment-module {
    background: #ffffff;
    padding: 1.5rem;
    border-radius: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin: 0 auto 1rem auto;
    width: calc(100% - 2rem);
    max-width: 400px;
    position: relative;
    border: 1px solid rgba(204, 140, 37, 0.2);
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98));
}

.payment-header {
    text-align: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(204, 140, 37, 0.2);
}

.payment-header h3 {
    color: #957718;
    font-size: 1.3rem;
    margin: 0;
    font-weight: 600;
}

.payment-module-amount {
    font-size: 1.8rem;
    font-weight: 600;
    color: #07002c;
    margin: 0.5rem 0;
}

.upi-button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 1.5rem 0;
    text-align: center;
}

.upi-app-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    border: 1px solid rgba(204, 140, 37, 0.2);
    border-radius: 12px;
    background: white;
    transition: all 0.3s ease;
    width: 100%;
    max-width: 300px;
    cursor: pointer;
    gap: 0.75rem;
}

.upi-app-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: #f8f9fa;
}

.pay-using-text {
    font-size: 1rem;
    color: #333;
    margin: 0;
}

.upi-logo {
    height: 40px;
    width: auto;
    object-fit: contain;
    margin: 0;
    display: block;
}

.payment-module-footer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 0.9em;
    color: #666;
}

.transaction-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

@media (max-width: 600px) {
    .upi-buttons-container {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.8rem;
    }
    
    .payment-module {
        margin: 1rem;
        padding: 1rem;
    }
}

@media (max-width: 360px) {
    .upi-buttons-container {
        grid-template-columns: 1fr;
    }
}

/* Success message styles */
.payment-success {
    background: #e8f5e9;
    border: 1px solid #81c784;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    margin: 0 auto 1rem auto; /* Added bottom margin */
    max-width: 600px;
}

.payment-success i {
    color: #43a047;
    font-size: 3rem;
    margin-bottom: 1rem;
}

.payment-success h3 {
    color: #2e7d32;
    margin-bottom: 1rem;
}

.payment-success .transaction-details {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: left;
}

.qr-container {
    text-align: center;
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.qr-container canvas {
    max-width: 200px;
    margin: 0 auto;
    display: block;
}

.payment-options {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    margin-top: 1rem;
}

.qr-code-container {
    text-align: center;
    margin: 1rem 0;
    padding: 1.5rem;
    border: 1px solid rgba(204, 140, 37, 0.2);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    position: relative;
    cursor: pointer;
    overflow: hidden;
}

.qr-code-blur {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(3px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.qr-code-container.active .qr-code-blur {
    opacity: 0;
    pointer-events: none;
}

.qr-code-blur-text {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 1rem;
}

.qr-code-blur-button {
    background: linear-gradient(45deg, #cc8c25, #e2c27d);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.qr-code-blur-button:hover {
    transform: translateY(-2px);
}

.qr-code-container img {
    width: 200px;
    height: 200px;
    margin: 0 auto;
    display: block;
}

.qr-code-text {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #666;
}

.payment-divider {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 1rem 0;
    gap: 1rem;
}

.payment-divider::before,
.payment-divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(204, 140, 37, 0.2);
}

.payment-divider-text {
    color: #666;
    font-size: 0.9rem;
    white-space: nowrap;
}

/* Mobile adjustments */
@media (max-width: 480px) {
    .qr-code-container img {
        width: 180px;
        height: 180px;
    }
}

.verification-section {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(204, 140, 37, 0.2);
    display: block;
}

.verification-section h4 {
    color: #957718;
    font-size: 1.1rem;
    margin-bottom: 1rem;
    text-align: center;
}

.verification-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.verification-form .form-group {
    margin-bottom: 1rem;
}

.verification-form label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 500;
    font-size: 0.95rem;
}

.verification-form .form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid rgba(204, 140, 37, 0.3);
    border-radius: 4px;
    font-size: 0.95rem;
    transition: all 0.3s ease;
}

.verification-form .register-submit-btn {
    margin-top: 1rem;
    width: 100%;
    padding: 0.75rem;
}

.verification-form .form-control:focus {
    border-color: #cc8c25;
    box-shadow: 0 0 0 2px rgba(204, 140, 37, 0.1);
    outline: none;
}

.upi-button-container {
    display: flex;
    justify-content: center;
    margin: 2rem 0;
}

.upi-app-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    border: 1px solid rgba(204, 140, 37, 0.2);
    border-radius: 12px;
    background: white;
    transition: all 0.3s ease;
    width: 100%;
    max-width: 300px;
    cursor: pointer;
}

.upi-app-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: #f8f9fa;
}

.pay-using-text {
    font-size: 1rem;
    color: #333;
    margin-bottom: 0.5rem;
}

.upi-logo {
    height: 40px;
    width: auto;
    margin-top: 0.5rem;
    object-fit: contain;
}

/* Add styles for payment info box */
.payment-info-box {
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98));
    border: 1px solid rgba(204, 140, 37, 0.2);
    border-radius: 15px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(204, 140, 37, 0.1);
}

.payment-info-box h3 {
    color: #957718;
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.payment-info-box h3 i {
    color: #cc8c25;
    font-size: 1.2rem;
}

.payment-info-box ol {
    list-style-position: outside;
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
}

.payment-info-box li {
    margin-bottom: 0.8rem;
    color: #333;
    padding-left: 0.5rem;
    line-height: 1.5;
}

/* Remove the golden circle counter styles */
.payment-info-box li::before {
    display: none;
}

.fee-info {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(204, 140, 37, 0.2);
}

.fee-info p {
    margin-bottom: 0.5rem;
    color: #333;
}

.fee-info p strong {
    color: #957718;
    font-weight: 600;
}

.fee-info p small {
    color: #666;
    font-size: 0.9rem;
}

/* Mobile adjustments for payment info box */
@media (max-width: 768px) {
    .payment-info-box {
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .payment-info-box h3 {
        font-size: 1.2rem;
        margin-bottom: 1.2rem;
    }

    .payment-info-box li {
        font-size: 0.95rem;
        margin-bottom: 0.6rem;
    }

    .fee-info {
        margin-top: 1.2rem;
        padding-top: 1.2rem;
    }
}

@media (max-width: 480px) {
    .payment-info-box {
        padding: 1.2rem;
        margin-bottom: 1.2rem;
    }

    .payment-info-box h3 {
        font-size: 1.1rem;
    }

    .payment-info-box li {
        font-size: 0.9rem;
    }
}

.payment-instructions {
    background: #fff;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.payment-instructions h4 {
    color: #957718;
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.payment-instructions ol {
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
}

.payment-instructions li {
    margin-bottom: 0.8rem;
    color: #333;
    line-height: 1.5;
}

.alternative-method {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(204, 140, 37, 0.2);
    text-align: center;
}

.alternative-method p {
    margin-bottom: 1rem;
    color: #666;
}

@media (max-width: 768px) {
    .payment-instructions {
        padding: 1rem;
    }

    .payment-instructions h4 {
        font-size: 1.1rem;
    }

    .payment-instructions li {
        font-size: 0.95rem;
        margin-bottom: 0.6rem;
    }
}
</style>

<script type="module">
import { getClient, submitRegistration, checkEmailExists } from '/assets/js/supabase-client.js';

// First ensure jsQR is loaded
let jsQRLoaded = false;

function loadJsQR() {
    return new Promise((resolve, reject) => {
        if (typeof jsQR !== 'undefined') {
            jsQRLoaded = true;
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
        script.onload = () => {
            jsQRLoaded = true;
            resolve();
        };
        script.onerror = () => {
            reject(new Error('Failed to load jsQR library'));
        };
        document.head.appendChild(script);
    });
}

// Make updateSubcategories available globally
window.updateSubcategories = function() {
    const category = document.getElementById('category').value;
    const subcategoryGroup = document.getElementById('subcategoryGroup');
    const subcategory = document.getElementById('subcategory');
    const age = document.getElementById('age').value;

    // Initially hide the subcategory group
    subcategoryGroup.style.display = 'none';
    
    // Clear existing options
    subcategory.innerHTML = '<option value="">Select Level</option>';

    // Only proceed if both category and age are selected
    if (category && age) {
        const ageNum = parseInt(age);
        
        if (category === 'hifz') {
            subcategoryGroup.style.display = 'block';
            if (ageNum < 17) {
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
        }
    }
};

// Function to handle UPI payment
async function handleUPIPayment(formData) {
    // Properly encode the UPI parameters
    const upiParams = {
        pa: "adnanshakeelahmed99@oksbi",
        pn: "Adnan Shakeel Ahmed",
        am: "80",
        cu: "INR",
        tn: "Registration Fee by " + formData.full_name + " for " + formData.category.toUpperCase() + " category"
    };
    
    // Construct UPI string with proper encoding
    const upiString = `upi://pay?${Object.entries(upiParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')}`;
    
    // Create payment module HTML
    const paymentHtml = `
        <div class="payment-module">
            <div class="payment-header">
                <h3>Complete Your Payment</h3>
            </div>
            <div class="payment-options">
                <div class="qr-code-container" id="qrCodeContainer">
                    <div class="qr-code-blur">
                        <p class="qr-code-blur-text">Pay using QR Code</p>
                        <button class="qr-code-blur-button" onclick="showQRAndOpenUPI('${upiString}')">View & Pay</button>
                    </div>
                    <img src="/assets/img/islamic/payment-qr.svg" alt="UPI QR Code">
                    <p class="qr-code-text">Scan QR code with any UPI app</p>
                </div>
                
                <div class="payment-divider">
                    <span class="payment-divider-text">OR</span>
                </div>

                <div class="upi-button-container">
                    <button class="upi-app-button" onclick="openUPIApp('${upiString}')">
                        <span class="pay-using-text">Pay using</span>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" class="upi-logo">
                    </button>
                </div>
            </div>
            
            <div class="verification-section">
                <h4>Verify Your Payment</h4>
                <form id="paymentVerificationForm" class="verification-form">
                    <div class="form-group">
                        <label for="upiReference" class="required">UPI Transaction Reference ID</label>
                        <input type="text" id="upiReference" class="form-control" required 
                               placeholder="Enter the UPI reference ID from your payment">
                    </div>
                    <button type="submit" class="register-submit-btn">Complete Registration</button>
                </form>
            </div>
        </div>
    `;
    
    return { paymentHtml, upiString };
}

// Initialize form
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
        const categorySelect = document.getElementById('category');
        const successMessage = document.querySelector('.success-message');
        const errorMessage = document.querySelector('.error-message');

        if (!form || !ageInput || !categorySelect) {
            throw new Error('Required form elements not found');
        }

        // Add event listeners for both age and category changes
        ageInput.addEventListener('change', window.updateSubcategories);
        ageInput.addEventListener('input', window.updateSubcategories);
        categorySelect.addEventListener('change', window.updateSubcategories);

        function showMessage(type, text, isPersistent = false) {
            const messageContainer = document.querySelector('.message-container');
            const messageElement = type === 'success' ? successMessage : errorMessage;
            const otherMessage = type === 'success' ? errorMessage : successMessage;
            
            messageElement.querySelector('.message-text').innerHTML = text;
            messageContainer.style.display = 'flex';
            messageElement.style.display = 'block';
            otherMessage.style.display = 'none';
            
            // Add click-outside handler
            messageContainer.onclick = function(e) {
                if (e.target === messageContainer) {
                    messageContainer.style.display = 'none';
                    if (!isPersistent) {
                        messageElement.style.display = 'none';
                    }
                }
            };
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
                const { paymentHtml } = await handleUPIPayment(formData);
                
                // Show payment UI
                showMessage('success', paymentHtml, true);
                
                // Store form data temporarily
                sessionStorage.setItem('pendingRegistration', JSON.stringify({
                    formData
                }));

                // Add event listener for verification form
                const verificationForm = document.getElementById('paymentVerificationForm');
                if (verificationForm) {
                    verificationForm.addEventListener('submit', async function(e) {
                        e.preventDefault();
                        const verifyBtn = verificationForm.querySelector('button[type="submit"]');
                        verifyBtn.disabled = true;
                        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

                        try {
                            const upiReference = document.getElementById('upiReference').value;
                            
                            // Get the pending registration data
                            const pendingReg = sessionStorage.getItem('pendingRegistration');
                            if (!pendingReg) throw new Error('No pending registration found');
                            
                            const { formData } = JSON.parse(pendingReg);
                            
                            // Add the payment verification details
                            formData.upi_reference = upiReference;
                            
                            // Submit the registration with payment details
                            const { data, error } = await submitRegistration(formData);
                            if (error) throw error;
                            
                            // Show success message
                            showMessage('success', `
                                <div class="payment-success">
                                    <i class="fas fa-check-circle"></i>
                                    <h3>Registration Successful!</h3>
                                    <p>Your details have been registered successfully. The team will contact you soon after verification.</p>
                                    <div class="transaction-details">
                                        <div class="transaction-info">
                                            <span>UPI Reference:</span>
                                            <span>${upiReference}</span>
                                        </div>
                                        <div class="transaction-info">
                                            <span>Amount Paid:</span>
                                            <span>₹80.00</span>
                                        </div>
                                        <div class="transaction-info">
                                            <span>Category:</span>
                                            <span>${formData.category}</span>
                                        </div>
                                    </div>
                                </div>
                            `, true);
                            
                            // Clear the pending registration
                            sessionStorage.removeItem('pendingRegistration');
                            
                        } catch (error) {
                            console.error('Verification error:', error);
                            showMessage('error', error.message || 'Failed to verify payment. Please contact support.');
                        } finally {
                            verifyBtn.disabled = false;
                            verifyBtn.innerHTML = 'Complete Registration';
                        }
                    });
                }
                
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

// Update the global functions to use the passed UPI string
window.showQRAndOpenUPI = async function(upiString) {
    const qrContainer = document.getElementById('qrCodeContainer');
    qrContainer.classList.add('active');
    
    // Show instructions for manual scanning
    const messageContainer = document.querySelector('.message-container');
    const successMessage = document.querySelector('.success-message');
    successMessage.querySelector('.message-text').innerHTML = `
        <div class="payment-instructions">
            <h4>Payment Instructions</h4>
            <ol>
                <li>Take a screenshot of the QR code</li>
                <li>Open your UPI app (GPay, PhonePe, Paytm, etc.)</li>
                <li>Select 'Scan QR' or 'Upload QR'</li>
                <li>Choose the screenshot from your gallery</li>
                <li>Verify the payment details and proceed</li>
            </ol>
            <div class="alternative-method">
                <p>Alternatively, you can:</p>
                <button onclick="window.openUPIApp('${upiString}')" class="upi-app-button">
                    Try Direct UPI App Launch
                </button>
            </div>
        </div>
    `;
    messageContainer.style.display = 'flex';
    successMessage.style.display = 'block';
    document.querySelector('.error-message').style.display = 'none';

    try {
        // Try to load jsQR if not already loaded
        if (!jsQRLoaded) {
            await loadJsQR();
        }
        
        // Get the QR code image and make it more prominent
        const qrImage = qrContainer.querySelector('img');
        qrImage.style.width = '250px';
        qrImage.style.height = '250px';
        qrImage.style.margin = '1rem auto';
        
    } catch (error) {
        console.error('Failed to initialize QR scanner:', error);
        // Even if jsQR fails to load, we still show the QR for manual scanning
        // No need to show error message as the QR is still visible for screenshot
    }
};

window.openUPIApp = function(upiString) {
    window.location.href = upiString;
};
</script> 