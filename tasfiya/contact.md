---
layout: tasfiya
title: Contact Us - Tasfiya
---

<div class="islamic-decoration">
    <h1>Contact Us</h1>
</div>

<div class="contact-content">
    <div class="contact-info">
        <div class="contact-card">
            <i class="fas fa-map-marker-alt"></i>
            <h3>Our Location</h3>
            <p>SIO Abul Fazal Office<br>Abul Fazal Enclave, Jamia Nagar<br>New Delhi, India</p>
        </div>

        <div class="contact-card">
            <i class="fas fa-phone"></i>
            <h3>Phone</h3>
            <p>+91 XXX XXX XXXX<br>+91 XXX XXX XXXX</p>
        </div>

        <div class="contact-card">
            <i class="fas fa-envelope"></i>
            <h3>Email</h3>
            <p>info@tasfiya.org<br>support@tasfiya.org</p>
        </div>
    </div>

    <div class="contact-form">
        <h2>Send us a Message</h2>
        <form id="contactForm" onsubmit="return false;">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" required>
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>

            <div class="form-group">
                <label for="subject">Subject</label>
                <input type="text" id="subject" name="subject" required>
            </div>

            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="5" required></textarea>
            </div>

            <button type="submit" class="submit-btn">
                <i class="fas fa-paper-plane"></i>
                <span class="btn-text">Send Message</span>
                <span class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i></span>
            </button>
        </form>
    </div>
</div>

<style>
.contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 2rem;
}

.contact-info {
    display: grid;
    gap: 1.5rem;
}

.contact-card {
    background: rgba(255, 255, 255, 0.03);
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    backdrop-filter: blur(10px);
    transition: transform 0.3s ease;
}

.contact-card:hover {
    transform: translateY(-5px);
}

.contact-card i {
    font-size: 2rem;
    color: #ffd700;
    margin-bottom: 1rem;
}

.contact-card h3 {
    color: #ffd700;
    margin-bottom: 1rem;
}

.contact-card p {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
}

.contact-form {
    background: rgba(255, 255, 255, 0.03);
    padding: 2rem;
    border-radius: 15px;
    backdrop-filter: blur(10px);
}

.contact-form h2 {
    color: #ffd700;
    margin-bottom: 2rem;
    text-align: center;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 8px;
    color: white;
    transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #ffd700;
}

.submit-btn {
    position: relative;
    overflow: hidden;
    width: 100%;
    padding: 1rem;
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid #ffd700;
    border-radius: 8px;
    color: #ffd700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.submit-btn:hover {
    background: rgba(255, 215, 0, 0.2);
}

.submit-btn .loading-spinner {
    display: none;
    position: absolute;
}

.submit-btn.loading .btn-text,
.submit-btn.loading .fa-paper-plane {
    visibility: hidden;
}

.submit-btn.loading .loading-spinner {
    display: inline-block;
}

.form-group input:not(:placeholder-shown):valid,
.form-group textarea:not(:placeholder-shown):valid {
    border-color: rgba(0, 255, 0, 0.3);
    background: rgba(0, 255, 0, 0.05);
}

.form-group input:not(:placeholder-shown):invalid,
.form-group textarea:not(:placeholder-shown):invalid {
    border-color: rgba(255, 0, 0, 0.3);
    background: rgba(255, 0, 0, 0.05);
}

.success-message,
.error-message {
    display: none;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: center;
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

@media (max-width: 768px) {
    .contact-content {
        grid-template-columns: 1fr;
    }
    
    .contact-card,
    .contact-form {
        padding: 1.5rem;
    }
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
            showMessage('success', 'Opening email client in new window...');
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
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => messageDiv.remove(), 500);
        }, 3000);
    }
});
</script> 