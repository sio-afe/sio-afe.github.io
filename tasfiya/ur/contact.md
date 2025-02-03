---
layout: tasfiya
title: رابطہ کریں - تصفیہ
dir: rtl
---

<div class="islamic-decoration">
    <h1>رابطہ کریں</h1>
</div>

<div class="contact-content">
    <div class="contact-info">
        <div class="contact-card">
            <i class="fas fa-map-marker-alt"></i>
            <h3>ہمارا مقام</h3>
            <p>ایس آئی او ابوالفضل دفتر<br>ابوالفضل انکلیو، جامعہ نگر<br>نئی دہلی، انڈیا</p>
        </div>

        <div class="contact-card">
            <i class="fas fa-phone"></i>
            <h3>فون</h3>
            <p>+91 XXX XXX XXXX<br>+91 XXX XXX XXXX</p>
        </div>

        <div class="contact-card">
            <i class="fas fa-envelope"></i>
            <h3>ای میل</h3>
            <p>info@tasfiya.org<br>support@tasfiya.org</p>
        </div>
    </div>

    <div class="contact-form">
        <h2>ہمیں پیغام بھیجیں</h2>
        <form id="contactForm" onsubmit="return false;">
            <div class="form-group">
                <label for="name">نام</label>
                <input type="text" id="name" name="name" required>
            </div>

            <div class="form-group">
                <label for="email">ای میل</label>
                <input type="email" id="email" name="email" required>
            </div>

            <div class="form-group">
                <label for="subject">موضوع</label>
                <input type="text" id="subject" name="subject" required>
            </div>

            <div class="form-group">
                <label for="message">پیغام</label>
                <textarea id="message" name="message" rows="5" required></textarea>
            </div>

            <button type="submit" class="submit-btn">
                <i class="fas fa-paper-plane"></i>
                <span class="btn-text">پیغام بھیجیں</span>
                <span class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i></span>
            </button>
        </form>
    </div>
</div>

<style>
.contact-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 1rem;
    font-family: 'Noto Naskh Arabic', sans-serif;
}

.contact-info {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.contact-card {
    background: rgba(255, 255, 255, 0.02);
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
}

.contact-card i {
    font-size: 2rem;
    color: #ffd700;
    margin-bottom: 1rem;
}

.contact-card h3 {
    color: #ffd700;
    margin-bottom: 1rem;
    font-size: 1.3rem;
    font-family: 'Noto Naskh Arabic', sans-serif;
}

.contact-card p {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.8;
    font-size: 1.1rem;
    text-align: center;
    font-family: 'Noto Naskh Arabic', sans-serif;
}

.contact-form {
    background: rgba(255, 255, 255, 0.02);
    padding: 2rem;
    border-radius: 8px;
}

.contact-form h2 {
    color: #ffd700;
    margin-bottom: 2rem;
    text-align: center;
    font-size: 1.8rem;
    font-family: 'Noto Naskh Arabic', sans-serif;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    text-align: right;
    font-family: 'Noto Naskh Arabic', sans-serif;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 1.1rem;
    transition: border-color 0.3s ease;
    text-align: right;
    font-family: 'Noto Naskh Arabic', sans-serif;
}

.submit-btn {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid #ffd700;
    border-radius: 8px;
    color: #ffd700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: 'Noto Naskh Arabic', sans-serif;
}

.submit-btn:hover {
    background: rgba(255, 215, 0, 0.1);
}

@media (min-width: 768px) {
    .contact-info {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .contact-card,
    .contact-form {
        padding: 1.5rem;
    }
    
    .contact-card p,
    .form-group label,
    .form-group input,
    .form-group textarea {
        font-size: 1rem;
        line-height: 1.6;
    }
    
    .contact-form h2 {
        font-size: 1.5rem;
    }
}

.success-message,
.error-message {
    display: none;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: center;
    font-family: 'Noto Naskh Arabic', sans-serif;
}

.success-message {
    background: rgba(0, 255, 0, 0.1);
    border: 1px solid rgba(0, 255, 0, 0.3);
    color: #90EE90;
}

.error-message {
    background: rgba(255, 0, 0, 0.1);
    border: 1px solid rgba(255, 0, 0, 0.3);
    color: #FFB6C1;
}

/* Typography for Urdu text */
[dir="rtl"] {
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Nafees Nastaleeq', 'Noto Naskh Arabic', sans-serif;
    line-height: 1.8;
}

[dir="rtl"] h1,
[dir="rtl"] h2,
[dir="rtl"] h3,
[dir="rtl"] h4,
[dir="rtl"] h5,
[dir="rtl"] h6 {
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Nafees Nastaleeq', 'Noto Naskh Arabic', sans-serif;
    line-height: 1.8;
}

[dir="rtl"] p,
[dir="rtl"] div,
[dir="rtl"] span,
[dir="rtl"] li,
[dir="rtl"] label,
[dir="rtl"] input,
[dir="rtl"] textarea {
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Nafees Nastaleeq', 'Noto Naskh Arabic', sans-serif;
    line-height: 1.8;
}

/* Font loading */
@font-face {
    font-family: 'Mehr Nastaleeq';
    src: local('Mehr Nastaleeq');
    font-display: swap;
}

@font-face {
    font-family: 'Jameel Noori Nastaleeq';
    src: local('Jameel Noori Nastaleeq');
    font-display: swap;
}

@font-face {
    font-family: 'Noto Nastaliq Urdu';
    src: local('Noto Nastaliq Urdu');
    font-display: swap;
}

@font-face {
    font-family: 'Nafees Nastaleeq';
    src: local('Nafees Nastaleeq');
    font-display: swap;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = contactForm.querySelector('.submit-btn');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitBtn.classList.add('loading');
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        // Construct mailto URL
        const mailtoUrl = `mailto:adnanshakeel@pm.me?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
`Name: ${name}
Email: ${email}

Message:
${message}`
        )}`;
        
        // Open email client in new window
        window.open(mailtoUrl, '_blank');
        
        // Show success message and reset form
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            showMessage('success', 'نئی ونڈو میں ای میل کلائنٹ کھل رہا ہے...');
            contactForm.reset();
        }, 1000);
    });
    
    function showMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = text;
        
        const existingMessage = contactForm.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        contactForm.appendChild(messageDiv);
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
});
</script> 