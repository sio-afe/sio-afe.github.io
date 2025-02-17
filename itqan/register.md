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
    background: rgba(0, 0, 0, 0.5);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.success-message,
.error-message,
.payment-module {
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 2rem;
    width: 100%;
    max-width: 500px;
    margin: auto;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Payment module specific styles */
.payment-module {
    background: #f8f9fa;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
    max-width: 500px;
    margin: 1rem auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.payment-module-header {
    text-align: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.payment-module-header h3 {
    color: #333;
    font-size: 1.1rem;
    margin: 0;
}

.payment-module-amount {
    font-size: 1.5rem;
    color: #333;
    font-weight: 600;
    margin: 0.5rem 0;
}

.upi-buttons-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1rem auto;
}

.upi-app-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.75rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: white;
    color: #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.upi-icon {
    width: 36px;
    height: 36px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
}

.payment-module-footer {
    margin-top: 1rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 0.85em;
    color: #666;
}

/* Success message specific styles */
.payment-success {
    background: #e8f5e9;
    border: 1px solid #81c784;
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    margin: 1rem auto;
    max-width: 500px;
}

.payment-success i {
    color: #43a047;
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.payment-success h3 {
    color: #2e7d32;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
}

.payment-success p {
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.payment-success .transaction-details {
    background: white;
    padding: 0.75rem;
    border-radius: 8px;
    margin-top: 0.75rem;
    text-align: left;
    font-size: 0.9rem;
}

.transaction-info {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
}

@media (max-width: 600px) {
    .upi-buttons-container {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
    }
    
    .payment-module, .payment-success {
        margin: 0.75rem;
        padding: 1rem;
    }

    .upi-icon {
        width: 32px;
        height: 32px;
    }
}

@media (max-width: 360px) {
    .upi-buttons-container {
        grid-template-columns: repeat(2, 1fr);
    }
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
}

.upi-app-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.75rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: white;
    color: #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
}

@media (max-width: 360px) {
    .upi-buttons-container {
        grid-template-columns: 1fr;
    }
}

/* Add styles for payment module */
.payment-module {
    background: #f8f9fa;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    padding: 2rem;
    max-width: 600px;
    margin: 2rem auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.payment-module-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.payment-module-header h3 {
    color: #333;
    font-size: 1.2rem;
    margin: 0;
}

.payment-module-amount {
    font-size: 2rem;
    color: #333;
    font-weight: 600;
    margin: 1rem 0;
}

.upi-buttons-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1rem auto;
}

.upi-app-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.75rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: white;
    color: #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.upi-app-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: #f8f9fa;
}

.upi-app-button:active {
    transform: translateY(0);
}

.upi-app-button span {
    font-size: 0.85em;
    text-align: center;
    line-height: 1.2;
    color: #666;
}

.gpay-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='100' height='100' viewBox='0 0 48 48'%3E%3Cpath fill='%23e64a19' d='M42.858,11.975c-4.546-2.624-10.359-1.065-12.985,3.481L23.25,26.927 c-1.916,3.312,0.551,4.47,3.301,6.119l6.372,3.678c2.158,1.245,4.914,0.506,6.158-1.649l6.807-11.789 C48.176,19.325,46.819,14.262,42.858,11.975z'%3E%3C/path%3E%3Cpath fill='%23fbc02d' d='M35.365,16.723l-6.372-3.678c-3.517-1.953-5.509-2.082-6.954,0.214l-9.398,16.275 c-2.624,4.543-1.062,10.353,3.481,12.971c3.961,2.287,9.024,0.93,11.311-3.031l9.578-16.59 C38.261,20.727,37.523,17.968,35.365,16.723z'%3E%3C/path%3E%3Cpath fill='%2343a047' d='M36.591,8.356l-4.476-2.585c-4.95-2.857-11.28-1.163-14.137,3.787L9.457,24.317 c-1.259,2.177-0.511,4.964,1.666,6.22l5.012,2.894c2.475,1.43,5.639,0.582,7.069-1.894l9.735-16.86 c2.017-3.492,6.481-4.689,9.974-2.672L36.591,8.356z'%3E%3C/path%3E%3Cpath fill='%231e88e5' d='M19.189,13.781l-4.838-2.787c-2.158-1.242-4.914-0.506-6.158,1.646l-5.804,10.03 c-2.857,4.936-1.163,11.252,3.787,14.101l3.683,2.121l4.467,2.573l1.939,1.115c-3.442-2.304-4.535-6.92-2.43-10.555l1.503-2.596 l5.504-9.51C22.083,17.774,21.344,15.023,19.189,13.781z'%3E%3C/path%3E%3C/svg%3E");
}

.phonepe-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='100' height='100' viewBox='0 0 48 48'%3E%3Cpath fill='%234527a0' d='M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5 V37z'%3E%3C/path%3E%3Cpath fill='%23fff' d='M32.267,20.171c0-0.681-0.584-1.264-1.264-1.264h-2.334l-5.35-6.25 c-0.486-0.584-1.264-0.778-2.043-0.584l-1.848,0.584c-0.292,0.097-0.389,0.486-0.195,0.681l5.836,5.666h-8.851 c-0.292,0-0.486,0.195-0.486,0.486v0.973c0,0.681,0.584,1.506,1.264,1.506h1.972v4.305c0,3.502,1.611,5.544,4.723,5.544 c0.973,0,1.378-0.097,2.35-0.486v3.112c0,0.875,0.681,1.556,1.556,1.556h0.786c0.292,0,0.584-0.292,0.584-0.584V21.969h2.812 c0.292,0,0.486-0.195,0.486-0.486V20.171z M26.043,28.413c-0.584,0.292-1.362,0.389-1.945,0.389c-1.556,0-2.097-0.778-2.097-2.529 v-4.305h4.043V28.413z'%3E%3C/path%3E%3C/svg%3E");
}

.paytm-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='100' height='100' viewBox='0 0 48 48'%3E%3Cpath fill='%230d47a1' d='M5.446 18.01H.548c-.277 0-.502.167-.503.502L0 30.519c-.001.3.196.45.465.45.735 0 1.335 0 2.07 0C2.79 30.969 3 30.844 3 30.594 3 29.483 3 28.111 3 27l2.126.009c1.399-.092 2.335-.742 2.725-2.052.117-.393.14-.733.14-1.137l.11-2.862C7.999 18.946 6.949 18.181 5.446 18.01zM4.995 23.465C4.995 23.759 4.754 24 4.461 24H3v-3h1.461c.293 0 .534.24.534.535V23.465zM13.938 18h-3.423c-.26 0-.483.08-.483.351 0 .706 0 1.495 0 2.201C10.06 20.846 10.263 21 10.552 21h2.855c.594 0 .532.972 0 1H11.84C10.101 22 9 23.562 9 25.137c0 .42.005 1.406 0 1.863-.008.651-.014 1.311.112 1.899C9.336 29.939 10.235 31 11.597 31h4.228c.541 0 1.173-.474 1.173-1.101v-8.274C17.026 19.443 15.942 18.117 13.938 18zM14 27.55c0 .248-.202.45-.448.45h-1.105C12.201 28 12 27.798 12 27.55v-2.101C12 25.202 12.201 25 12.447 25h1.105C13.798 25 14 25.202 14 25.449V27.55zM18 18.594v5.608c.124 1.6 1.608 2.798 3.171 2.798h1.414c.597 0 .561.969 0 .969H19.49c-.339 0-.462.177-.462.476v2.152c0 .226.183.396.422.396h2.959c2.416 0 3.592-1.159 3.591-3.757v-8.84c0-.276-.175-.383-.342-.383h-2.302c-.224 0-.355.243-.355.422v5.218c0 .199-.111.316-.29.316H21.41c-.264 0-.409-.143-.409-.396v-5.058C21 18.218 20.88 18 20.552 18c-.778 0-1.442 0-2.22 0C18.067 18 18 18.263 18 18.594L18 18.594z'%3E%3C/path%3E%3Cpath fill='%2300adee' d='M27.038 20.569v-2.138c0-.237.194-.431.43-.431H28c1.368-.285 1.851-.62 2.688-1.522.514-.557.966-.704 1.298-.113L32 18h1.569C33.807 18 34 18.194 34 18.431v2.138C34 20.805 33.806 21 33.569 21H32v9.569C32 30.807 31.806 31 31.57 31h-2.14C29.193 31 29 30.807 29 30.569V21h-1.531C27.234 21 27.038 20.806 27.038 20.569L27.038 20.569zM42.991 30.465c0 .294-.244.535-.539.535h-1.91c-.297 0-.54-.241-.54-.535v-6.623-1.871c0-1.284-2.002-1.284-2.002 0v8.494C38 30.759 37.758 31 37.461 31H35.54C35.243 31 35 30.759 35 30.465V18.537C35 18.241 35.243 18 35.54 18h1.976c.297 0 .539.241.539.537v.292c1.32-1.266 3.302-.973 4.416.228 2.097-2.405 5.69-.262 5.523 2.375 0 2.916-.026 6.093-.026 9.033 0 .294-.244.535-.538.535h-1.891C45.242 31 45 30.759 45 30.465c0-2.786 0-5.701 0-8.44 0-1.307-2-1.37-2 0v8.44H42.991z'%3E%3C/path%3E%3C/svg%3E");
}

.other-upi-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='100' height='100' viewBox='0 0 48 48'%3E%3Cpath fill='%230d47a1' d='M5.446 18.01H.548c-.277 0-.502.167-.503.502L0 30.519c-.001.3.196.45.465.45.735 0 1.335 0 2.07 0C2.79 30.969 3 30.844 3 30.594 3 29.483 3 28.111 3 27l2.126.009c1.399-.092 2.335-.742 2.725-2.052.117-.393.14-.733.14-1.137l.11-2.862C7.999 18.946 6.949 18.181 5.446 18.01zM4.995 23.465C4.995 23.759 4.754 24 4.461 24H3v-3h1.461c.293 0 .534.24.534.535V23.465zM13.938 18h-3.423c-.26 0-.483.08-.483.351 0 .706 0 1.495 0 2.201C10.06 20.846 10.263 21 10.552 21h2.855c.594 0 .532.972 0 1H11.84C10.101 22 9 23.562 9 25.137c0 .42.005 1.406 0 1.863-.008.651-.014 1.311.112 1.899C9.336 29.939 10.235 31 11.597 31h4.228c.541 0 1.173-.474 1.173-1.101v-8.274C17.026 19.443 15.942 18.117 13.938 18zM14 27.55c0 .248-.202.45-.448.45h-1.105C12.201 28 12 27.798 12 27.55v-2.101C12 25.202 12.201 25 12.447 25h1.105C13.798 25 14 25.202 14 25.449V27.55zM18 18.594v5.608c.124 1.6 1.608 2.798 3.171 2.798h1.414c.597 0 .561.969 0 .969H19.49c-.339 0-.462.177-.462.476v2.152c0 .226.183.396.422.396h2.959c2.416 0 3.592-1.159 3.591-3.757v-8.84c0-.276-.175-.383-.342-.383h-2.302c-.224 0-.355.243-.355.422v5.218c0 .199-.111.316-.29.316H21.41c-.264 0-.409-.143-.409-.396v-5.058C21 18.218 20.88 18 20.552 18c-.778 0-1.442 0-2.22 0C18.067 18 18 18.263 18 18.594L18 18.594z'%3E%3C/path%3E%3Cpath fill='%2300adee' d='M27.038 20.569v-2.138c0-.237.194-.431.43-.431H28c1.368-.285 1.851-.62 2.688-1.522.514-.557.966-.704 1.298-.113L32 18h1.569C33.807 18 34 18.194 34 18.431v2.138C34 20.805 33.806 21 33.569 21H32v9.569C32 30.807 31.806 31 31.57 31h-2.14C29.193 31 29 30.807 29 30.569V21h-1.531C27.234 21 27.038 20.806 27.038 20.569L27.038 20.569zM42.991 30.465c0 .294-.244.535-.539.535h-1.91c-.297 0-.54-.241-.54-.535v-6.623-1.871c0-1.284-2.002-1.284-2.002 0v8.494C38 30.759 37.758 31 37.461 31H35.54C35.243 31 35 30.759 35 30.465V18.537C35 18.241 35.243 18 35.54 18h1.976c.297 0 .539.241.539.537v.292c1.32-1.266 3.302-.973 4.416.228 2.097-2.405 5.69-.262 5.523 2.375 0 2.916-.026 6.093-.026 9.033 0 .294-.244.535-.538.535h-1.891C45.242 31 45 30.759 45 30.465c0-2.786 0-5.701 0-8.44 0-1.307-2-1.37-2 0v8.44H42.991z'%3E%3C/path%3E%3C/svg%3E");
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
    margin: 2rem auto;
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

// Function to handle UPI payment
async function handleUPIPayment(formData) {
    const timestamp = Date.now().toString().slice(-8);
    const transactionId = `IT${timestamp}`; // Shorter transaction ID
    const upiId = "adnanshakeel@sbi";
    const amount = "1";
    const merchantName = "Adnan Shakeel Ahmed";
    
    // Generate different UPI app links with proper encoding and formatting
    const commonParams = [
        `pa=${encodeURIComponent(upiId)}`,
        `pn=${encodeURIComponent(merchantName)}`,
        `am=${amount}`,
        `tr=${transactionId}`,
        `tn=${encodeURIComponent('Registration_' + formData.full_name.replace(/ /g, '_'))}`,
        'cu=INR',
        'mc=ITQAN',  // Merchant code (optional but recommended)
        'tid=ITQAN'   // Terminal ID (optional but recommended)
    ].join('&');

    // Proper UPI deep link formats
    const gpayLink = `gpay://upi/pay?${commonParams}`;
    const phonepeLink = `phonepe://upi/pay?${commonParams}`;
    const paytmLink = `paytmmp://upi/pay?${commonParams}`;
    
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
                    <span>Google Pay</span>
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
            
            // Add click-outside handler
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
                
                // Hide payment UI if it's showing
                const messageContainer = document.querySelector('.message-container');
                messageContainer.style.display = 'none';
                
                // Submit registration and show success message
                submitRegistration(formData)
                    .then(({ data, error }) => {
                        if (error) throw error;
                        
                        showMessage('success', `
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
                                        <span>₹80</span>
                                    </div>
                                    <div class="transaction-info">
                                        <span>Category:</span>
                                        <span>${formData.category}</span>
                                    </div>
                                </div>
                            </div>
                        `, true);
                        
                        sessionStorage.removeItem('pendingRegistration');
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