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
    <div class="register-header">
        <h1 class="text-center">Register for <span class="thuluth-text">إتقان</span></h1>
        <div class="header-decoration">
            <span class="decoration-line"></span>
            <i class="fas fa-star"></i>
            <span class="decoration-line"></span>
        </div>
    </div>
    
    <!-- Add important note -->
    <div class="important-note">
        <div class="note-icon">
            <i class="fas fa-exclamation-circle pulse"></i>
        </div>
        <div class="note-content">
            <strong>Important Note</strong>
            <p>Participants can register for multiple categories to increase their chances of reaching finals. However, if a participant qualifies in multiple categories, they will need to choose only one category to compete in during the final round.</p>
        </div>
    </div>
    
    <!-- Add payment info box -->
    <div class="payment-info-box">
        <div class="info-header">
            <i class="fas fa-info-circle"></i>
            <h3>Registration Process</h3>
        </div>
        <div class="process-steps">
            <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">Fill the registration form below</div>
            </div>
            <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">Click submit to proceed with UPI payment</div>
            </div>
            <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">Complete the payment using your preferred UPI app</div>
            </div>
            <div class="step">
                <div class="step-number">4</div>
                <div class="step-content">You will receive confirmation on successful registration</div>
            </div>
        </div>
        <div class="fee-info">
            <div class="fee-amount">
                <span class="fee-label">Registration Fee:</span>
                <span class="fee-value">₹80</span>
            </div>
            <p class="payment-note"><i class="fas fa-info-circle"></i> Payment will be processed via UPI</p>
        </div>
    </div>

    <div class="register-form-container">
        <form id="registrationForm" class="registration-form">
            <div class="form-group">
                <label for="category" class="required">Competition Category</label>
                <select id="category" name="category" class="form-control" required>
                    <option value="">Select Category</option>
                    <option value="hifz">Hifz Competition</option>
                    <option value="tarteel">Tarteel Competition</option>
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
    padding: 2.5rem;
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

@media (min-width: 1200px) {
    .register-page {
        max-width: 900px;
        padding: 3rem;
    }

    .register-header h1 {
        font-size: 2.8rem;
    }

    .thuluth-text {
        font-size: 2em;
    }

    .important-note {
        padding: 2rem;
    }

    .process-steps {
        gap: 2rem;
    }

    .step {
        padding: 1.5rem;
    }

    .fee-amount {
        font-size: 2rem;
    }
}

@media (min-width: 992px) and (max-width: 1199px) {
    .register-page {
        max-width: 800px;
        padding: 2.5rem;
    }

    .register-header h1 {
        font-size: 2.5rem;
    }

    .important-note {
        padding: 1.8rem;
    }
}

@media (min-width: 768px) and (max-width: 991px) {
    .register-page {
        max-width: 700px;
        padding: 2rem;
        margin: 1.5rem auto;
    }

    .register-header h1 {
        font-size: 2.2rem;
    }

    .important-note {
        padding: 1.5rem;
        margin: 1.5rem auto;
    }

    .process-steps {
        gap: 1.2rem;
    }

    .step {
        padding: 1.2rem;
    }

    .fee-amount {
        font-size: 1.6rem;
    }
}

@media (min-width: 576px) and (max-width: 767px) {
    .register-page {
        max-width: 100%;
        padding: 1.5rem;
        margin: 1rem;
    }

    .register-header h1 {
        font-size: 2rem;
    }

    .thuluth-text {
        font-size: 1.5em;
    }

    .important-note {
        padding: 1.2rem;
        margin: 1.2rem auto;
        flex-direction: column;
        text-align: center;
    }

    .note-icon {
        margin: 0 auto 1rem;
    }

    .process-steps {
        gap: 1rem;
    }

    .step {
        padding: 1rem;
    }

    .fee-amount {
        font-size: 1.4rem;
    }

    .form-group {
        margin-bottom: 1.2rem;
    }
}

@media (max-width: 575px) {
    .register-page {
        max-width: 100%;
        padding: 1rem;
        margin: 0.5rem;
    }

    .register-header h1 {
        font-size: 1.8rem;
        text-align: center;
    }

    .thuluth-text {
        font-size: 1.3em;
    }

    .header-decoration {
        margin: 0.8rem 0;
    }

    .decoration-line {
        width: 60px;
    }

    .important-note {
        padding: 1rem;
        margin: 1rem auto;
        flex-direction: column;
        text-align: center;
        gap: 0.8rem;
    }

    .note-icon {
        margin: 0 auto 0.8rem;
        width: 35px;
        height: 35px;
    }

    .note-content strong {
        font-size: 1rem;
    }

    .note-content p {
        font-size: 0.9rem;
    }

    .process-steps {
        gap: 0.8rem;
    }

    .step {
        padding: 0.8rem;
    }

    .step-number {
        width: 30px;
        height: 30px;
        font-size: 0.9rem;
    }

    .step-content {
        font-size: 0.9rem;
    }

    .fee-amount {
        font-size: 1.3rem;
        flex-direction: column;
        gap: 0.3rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        font-size: 0.9rem;
        margin-bottom: 0.3rem;
    }

    .form-control {
        padding: 0.6rem;
        font-size: 0.9rem;
    }

    .register-submit-btn {
        padding: 0.8rem;
        font-size: 0.9rem;
    }

    .help-text {
        font-size: 0.8rem;
        margin-top: 0.8rem;
    }

    .message-container {
        padding: 0.5rem;
    }

    .success-message,
    .error-message {
        padding: 1rem;
        margin: 0.5rem auto;
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
    padding: 2rem;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(149, 119, 24, 0.1);
    position: relative;
    overflow: hidden;
    max-width: 350px;
    margin: 0 auto;
}

.qr-code-container img {
    display: block;
    width: 250px;
    height: 250px;
    margin: 0 auto;
    transition: all 0.3s ease;
    filter: blur(3px);
}

.qr-code-container.active img {
    filter: blur(0);
}

.qr-code-blur {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
}

.qr-code-container.active .qr-code-blur {
    opacity: 0;
    pointer-events: none;
}

.qr-code-blur-text {
    font-size: 1.2rem;
    color: #957718;
    margin-bottom: 1rem;
    font-weight: 500;
}

.qr-code-blur-button {
    background: linear-gradient(45deg, #957718, #e2c27d);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 50px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
    box-shadow: 0 4px 12px rgba(149, 119, 24, 0.15);
}

.qr-code-blur-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(149, 119, 24, 0.25);
    background: linear-gradient(45deg, #8b6e17, #d4b76f);
}

.qr-actions {
    margin: 1.5rem auto;
    text-align: center;
    max-width: 350px;
}

.download-qr-btn {
    background: linear-gradient(45deg, #957718, #e2c27d);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 50px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1rem;
    box-shadow: 0 4px 12px rgba(149, 119, 24, 0.15);
}

.download-qr-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(149, 119, 24, 0.25);
    background: linear-gradient(45deg, #8b6e17, #d4b76f);
}

.download-qr-btn:active {
    transform: translateY(0);
}

.download-qr-btn i {
    font-size: 1.2rem;
}

.payment-instructions {
    margin: 1.5rem auto;
    padding: 1.5rem;
    border-radius: 12px;
    background: #f8f9fa;
    border: 1px solid rgba(204, 140, 37, 0.2);
    max-width: 350px;
}

.payment-instructions h4 {
    color: #957718;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    text-align: center;
    font-weight: 600;
}

.payment-instructions ol {
    padding-left: 1.5rem;
    margin-bottom: 0;
    list-style-position: outside;
}

.payment-instructions li {
    margin-bottom: 1rem;
    color: #333;
    line-height: 1.6;
    padding-left: 0.5rem;
}

.payment-instructions li:last-child {
    margin-bottom: 0;
}

@media (max-width: 768px) {
    .qr-code-container {
        padding: 1.5rem;
        margin: 0 1rem;
    }

    .qr-code-container img {
        width: 200px;
        height: 200px;
    }

    .qr-actions {
        margin: 1.25rem 1rem;
    }

    .payment-instructions {
        margin: 1.25rem 1rem;
        padding: 1.25rem;
    }

    .payment-instructions h4 {
        font-size: 1.1rem;
        margin-bottom: 1.25rem;
    }

    .payment-instructions li {
        font-size: 0.95rem;
        margin-bottom: 0.8rem;
    }

    .download-qr-btn {
        padding: 0.7rem 1.75rem;
        font-size: 0.95rem;
    }
}

.payment-info-box {
    background: linear-gradient(to bottom, rgba(255, 248, 225, 0.5), rgba(255, 248, 225, 0.8));
    border: 1px solid rgba(204, 140, 37, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(149, 119, 24, 0.1);
}

.payment-info-box h3 {
    color: #957718;
    font-size: 1.3rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.payment-info-box h3 i {
    color: #957718;
}

.payment-info-box ol {
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
}

.payment-info-box li {
    color: #333;
    margin-bottom: 0.5rem;
    line-height: 1.6;
}

.fee-info {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(204, 140, 37, 0.2);
}

.fee-info p {
    margin: 0.25rem 0;
    color: #333;
}

.fee-info p strong {
    color: #957718;
}

/* Enhanced Header Styles */
.register-header {
    text-align: center;
    margin-bottom: 2rem;
    padding: 2rem 0;
}

.register-header h1 {
    font-size: 2.5rem;
    color: #07002c;
    margin-bottom: 1rem;
}

.header-decoration {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
}

.decoration-line {
    height: 2px;
    width: 100px;
    background: linear-gradient(90deg, transparent, #957718, transparent);
}

.header-decoration .fa-star {
    color: #957718;
    font-size: 1.2rem;
}

/* Enhanced Important Note Styles */
.important-note {
    background: linear-gradient(135deg, rgba(149, 119, 24, 0.05), rgba(226, 194, 125, 0.1));
    border: none;
    border-radius: 15px;
    padding: 1.5rem;
    margin: 2rem auto;
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
    box-shadow: 0 4px 15px rgba(149, 119, 24, 0.1);
    position: relative;
    overflow: hidden;
    max-width: 800px;
}

.important-note::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, #957718, #e2c27d);
    border-radius: 4px 0 0 4px;
}

.note-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    background: linear-gradient(45deg, #957718, #e2c27d);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.note-icon i {
    color: white;
    font-size: 1.2rem;
}

.note-content {
    flex: 1;
}

.note-content strong {
    display: block;
    color: #957718;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    font-family: 'Almarena Mono', monospace;
}

.note-content p {
    color: #07002c;
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

.pulse {
    animation: pulse 2s infinite;
}

/* Enhanced Payment Info Box Styles */
.payment-info-box {
    background: #ffffff;
    border-radius: 20px;
    padding: 2rem;
    margin: 2rem auto;
    box-shadow: 0 8px 25px rgba(149, 119, 24, 0.08);
    border: 1px solid rgba(149, 119, 24, 0.1);
    max-width: 800px;
}

.info-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(149, 119, 24, 0.1);
}

.info-header i {
    font-size: 1.8rem;
    color: #957718;
}

.info-header h3 {
    color: #07002c;
    font-size: 1.5rem;
    margin: 0;
    font-family: 'Almarena Mono', monospace;
}

.process-steps {
    display: grid;
    gap: 1.5rem;
}

.step {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(149, 119, 24, 0.03), rgba(226, 194, 125, 0.05));
    border-radius: 12px;
    transition: all 0.3s ease;
}

.step:hover {
    transform: translateX(5px);
    background: linear-gradient(135deg, rgba(149, 119, 24, 0.05), rgba(226, 194, 125, 0.08));
}

.step-number {
    width: 35px;
    height: 35px;
    background: linear-gradient(45deg, #957718, #e2c27d);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1.1rem;
    flex-shrink: 0;
}

.step-content {
    color: #07002c;
    font-size: 1rem;
    line-height: 1.5;
}

.fee-info {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(149, 119, 24, 0.1);
}

.fee-amount {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.fee-label {
    color: #07002c;
    font-weight: 600;
    font-size: 1.1rem;
}

.fee-value {
    color: #957718;
    font-size: 1.8rem;
    font-weight: bold;
    font-family: 'Almarena Mono', monospace;
}

.payment-note {
    text-align: center;
    color: #666;
    font-size: 0.9rem;
    margin: 0.5rem 0 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.payment-note i {
    color: #957718;
}

@media (max-width: 768px) {
    .register-header h1 {
        font-size: 2rem;
    }

    .decoration-line {
        width: 60px;
    }

    .important-note {
        padding: 1.25rem;
        gap: 1rem;
        margin: 1.5rem 1rem;
    }

    .note-icon {
        width: 35px;
        height: 35px;
    }

    .note-content strong {
        font-size: 1rem;
    }

    .note-content p {
        font-size: 0.9rem;
    }

    .payment-info-box {
        padding: 1.5rem;
        margin: 1.5rem 1rem;
    }

    .info-header {
        margin-bottom: 1.5rem;
    }

    .info-header i {
        font-size: 1.5rem;
    }

    .info-header h3 {
        font-size: 1.3rem;
    }

    .step {
        padding: 0.8rem;
        gap: 1rem;
    }

    .step-number {
        width: 30px;
        height: 30px;
        font-size: 1rem;
    }

    .step-content {
        font-size: 0.9rem;
    }

    .fee-amount {
        flex-direction: column;
        gap: 0.5rem;
    }

    .fee-label {
        font-size: 1rem;
    }

    .fee-value {
        font-size: 1.5rem;
    }
}

@media (max-width: 480px) {
    .register-header h1 {
        font-size: 1.8rem;
    }

    .decoration-line {
        width: 40px;
    }

    .important-note {
        padding: 1rem;
    }

    .payment-info-box {
        padding: 1.25rem;
    }

    .step {
        padding: 0.7rem;
    }

    .step-content {
        font-size: 0.85rem;
    }
}

/* Additional responsive improvements */
.register-form-container {
    transition: all 0.3s ease;
}

.form-control:focus {
    box-shadow: 0 0 0 2px rgba(149, 119, 24, 0.2);
}

.register-submit-btn {
    transition: all 0.3s ease;
}

.register-submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(149, 119, 24, 0.2);
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
        } else if (category === 'tarteel' || category === 'adhan') {
            subcategoryGroup.style.display = 'block';
            subcategory.innerHTML += '<option value="open">Open Age</option>';
        }
    }
};

// Function to handle payment display
async function handlePaymentDisplay(formData) {
    const paymentHtml = `
        <div class="payment-module">
            <div class="payment-header">
                <h3>Complete Your Payment</h3>
                <div class="payment-module-amount">₹80.00</div>
            </div>
            <div class="payment-options">
                <div class="qr-code-container" id="qrCodeContainer">
                    <img src="/assets/img/islamic/payment-qr.svg" alt="UPI QR Code">
                    <div class="qr-code-blur">
                        <p class="qr-code-blur-text">Pay using QR Code</p>
                        <button class="qr-code-blur-button" onclick="showQRAndPay()">View & Pay</button>
                    </div>
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
    
    return { paymentHtml };
}

// Update the global functions to handle QR display
window.showQRAndPay = function() {
    const qrContainer = document.getElementById('qrCodeContainer');
    qrContainer.classList.add('active');
    
    // Add download button and instructions after QR becomes visible
    const instructionsHtml = `
        <div class="qr-actions">
            <button onclick="downloadQR()" class="download-qr-btn">
                <i class="fas fa-download"></i>
                <span>Download QR</span>
            </button>
        </div>
        <div class="payment-instructions">
            <h4>Payment Instructions</h4>
            <ol>
                <li>Download or screenshot the QR code above</li>
                <li>Open your UPI app (GPay, PhonePe, Paytm, etc.)</li>
                <li>Select 'Scan QR' or 'Upload QR'</li>
                <li>Choose the downloaded QR from your gallery</li>
                <li>Verify the payment details and proceed</li>
                <li>After successful payment, enter the UPI reference ID below</li>
            </ol>
        </div>
    `;
    
    // Insert instructions after the QR container
    qrContainer.insertAdjacentHTML('afterend', instructionsHtml);
};

// Add function to download QR code
window.downloadQR = function() {
    const qrImage = document.querySelector('#qrCodeContainer img');
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create a new image to properly load the SVG
    const img = new Image();
    img.crossOrigin = 'anonymous';  // Handle CORS if needed
    
    img.onload = function() {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert to PNG and download
        try {
            const pngUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = 'payment-qr.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error converting to PNG:', error);
            alert('Failed to download QR code. Please try taking a screenshot instead.');
        }
    };
    
    img.onerror = function() {
        console.error('Error loading image');
        alert('Failed to load QR code. Please try taking a screenshot instead.');
    };
    
    // Set source to trigger loading
    img.src = qrImage.src;
};

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

                // Show payment UI
                const { paymentHtml } = await handlePaymentDisplay(formData);
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
</script> 