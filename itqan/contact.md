---
layout: tasfiya
title: Contact إتقان
---

<style>
/* Add Thuluth font */
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');

.thuluth-text {
    font-family: 'Amiri', serif;
    font-size: 1.8em;
    background: linear-gradient(45deg, #957718, #e2c27d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
    font-weight: 700;
    filter: drop-shadow(2px 2px 4px rgba(149, 119, 24, 0.3));
}

@media (max-width: 768px) {
    .thuluth-text {
        font-size: 1.5em;
    }
}

.islamic-decoration {
    position: relative;
    text-align: center;
    padding: 2rem 0;
    margin-bottom: 3rem;
    overflow: hidden;
}

.islamic-decoration h1 {
    color: #07002c;
    font-size: 2.5rem;
    font-family: 'Almarena Mono', monospace;
    position: relative;
    z-index: 1;
    margin-bottom: 0;
    display: inline-block;
}

@media (max-width: 768px) {
    .islamic-decoration {
        padding: 1.5rem 0;
        margin-bottom: 2rem;
    }

    .islamic-decoration h1 {
        font-size: 2rem;
    }
}

@media (max-width: 480px) {
    .islamic-decoration {
        padding: 1rem 0;
        margin-bottom: 1.5rem;
    }

    .islamic-decoration h1 {
        font-size: 1.5rem;
    }
}

.contact-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.contact-info {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 3rem;
    width: 100%;
    justify-content: center;
    grid-template-columns: repeat(auto-fit, minmax(250px, 300px));
}

.contact-card {
    background: #ffffff;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(16, 3, 47, 0.1);
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.05);
    transition: all 0.3s ease;
}

.contact-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(16, 3, 47, 0.12);
    border-color: rgba(16, 3, 47, 0.25);
}

.contact-card i {
    font-size: 2rem;
    margin-bottom: 1rem;
    display: block;
    background: linear-gradient(45deg, #957718, #e2c27d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(2px 2px 4px rgba(149, 119, 24, 0.3));
}

.contact-card h3 {
    color: #07002c;
    margin-bottom: 1rem;
    font-size: 1.3rem;
    width: 100%;
    text-align: center;
    font-family: 'Almarena Mono', monospace;
}

.contact-card p {
    color: #07002c;
    line-height: 1.8;
    font-size: 1.1rem;
    text-align: center;
    width: 100%;
    margin: 0;
    font-family: 'Open Sans', sans-serif;
}

.contact-form {
    background: #ffffff;
    padding: 2rem;
    border-radius: 8px;
    border: 1px solid rgba(16, 3, 47, 0.1);
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.05);
}

.contact-form h2 {
    color: #07002c;
    margin-bottom: 2rem;
    text-align: center;
    font-size: 1.8rem;
    font-family: 'Almarena Mono', monospace;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    color: #07002c;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    font-family: 'Open Sans', sans-serif;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.8rem;
    background: #ffffff;
    border: 1px solid rgba(16, 3, 47, 0.1);
    border-radius: 8px;
    color: #07002c;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    font-family: 'Open Sans', sans-serif;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #957718;
    box-shadow: 0 0 0 2px rgba(149, 119, 24, 0.2);
}

.submit-btn {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(45deg, #957718, #e2c27d);
    border: none;
    border-radius: 8px;
    color: #ffffff;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: 'Almarena Mono', monospace;
    box-shadow: 0 4px 15px rgba(149, 119, 24, 0.2);
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(149, 119, 24, 0.3);
    background: linear-gradient(45deg, #8b6e17, #d4b76f);
}

@media (min-width: 768px) {
    .contact-info {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .contact-info {
        grid-template-columns: 1fr;
        max-width: 100%;
        padding: 0 1rem;
    }
    
    .contact-card {
        width: 100%;
        max-width: 350px;
        margin: 0 auto;
    }
    
    .contact-card,
    .contact-form {
        padding: 1.5rem;
    }
    
    .contact-card h3 {
        font-size: 1.2rem;
    }
    
    .contact-card p {
        font-size: 1rem;
    }
    
    .contact-form h2 {
        font-size: 1.5rem;
    }
    
    .form-group label {
        font-size: 1rem;
    }
    
    .form-group input,
    .form-group textarea {
        font-size: 1rem;
        padding: 0.7rem;
    }
    
    .submit-btn {
        padding: 0.8rem;
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .contact-card {
        padding: 1.25rem;
    }
    
    .contact-form {
        padding: 1.25rem;
    }
    
    .contact-form h2 {
        font-size: 1.3rem;
    }
}

.success-message,
.error-message {
    display: none;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: center;
    font-family: 'Open Sans', sans-serif;
}

.success-message {
    background: rgba(0, 255, 0, 0.05);
    border: 1px solid rgba(0, 255, 0, 0.2);
    color: #07002c;
}

.error-message {
    background: rgba(255, 0, 0, 0.05);
    border: 1px solid rgba(255, 0, 0, 0.2);
    color: #07002c;
}
</style>

<div class="islamic-decoration">
    <h1>Contact</h1>
</div>

<div class="contact-content">
    <div class="contact-info">
        <div class="contact-card">
            <i class="fas fa-map-marker-alt"></i>
            <h3>Our Location</h3>
            <p>SIO Abul Fazal Office<br>Abul Fazal Enclave, Jamia Nagar<br>New Delhi, India</p>
        </div>


        <div class="contact-card">
            <i class="fas fa-envelope"></i>
            <h3>Email</h3>
            <p>sioaf@proton.me</p>
        </div>

    </div>

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