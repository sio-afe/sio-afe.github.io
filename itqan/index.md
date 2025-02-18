---
layout: tasfiya
title: Qur'an Recitation Competition
---

<div class="islamic-decoration">
    <h1>Quran Recitation and Azan Competition</h1>
</div>

<p class="lead mb-5">
    SIO Abul Fazal presents the first edition of <span class="thuluth-text">إتقان</span> competition, which brings together all those with beautiful and touching voices in the Quran Recitation and the Azan from all over Delhi, it aims to honor the most beautiful voices in Quran Recitation and Azan raising.
    
</p>

<div class="row justify-content-center mt-5">
    <div class="col-md-4 mb-4">
        <div class="feature-card">
            <i class="fas fa-quran fa-3x mb-3"></i>
            <h3>Hifz Competition</h3>
            <p>Demonstrate your memorization of the Holy Qur'an with proper Tajweed and perfect recall</p>
        </div>
    </div>
    <div class="col-md-4 mb-4">
        <div class="feature-card">
            <i class="fas fa-microphone-alt fa-3x mb-3"></i>
            <h3>Tarteel Competition</h3>
            <p>Showcase your talent in beautiful recitation of the Holy Qur'an with proper Tajweed</p>
        </div>
    </div>
    <div class="col-md-4 mb-4">
        <div class="feature-card">
            <i class="fas fa-mosque fa-3x mb-3"></i>
            <h3>Azan Competition</h3>
            <p>Present the call to prayer with your melodious voice and perfect pronunciation</p>
        </div>
    </div>
</div>

<div class="register-hero-section">
    <div class="register-hero-bg"></div>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-10 text-center">
                <div class="register-content">
                    <h2 class="mb-4">Join the <span class="thuluth-text">إتقان</span> Competition</h2>
                    <p class="lead mb-4">Showcase your talent in Quran recitation and Azan. Register now to be part of this blessed journey.</p>
                    <div class="event-info-box">
                        <div class="info-header">
                            <i class="fas fa-circle-info"></i>
                            <h3>Event Details</h3>
                        </div>
                        <div class="event-details">
                            <div class="detail-item">
                                <div class="detail-icon">
                                    <i class="fas fa-calendar"></i>
                                </div>
                                <div class="detail-content">
                                    <span class="detail-label">DATE</span>
                                    <span class="detail-value">9 March 2024</span>
                                </div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-icon">
                                    <i class="fas fa-location-dot"></i>
                                </div>
                                <div class="detail-content">
                                    <span class="detail-label">VENUE</span>
                                    <span class="detail-value">Scholar School Auditorium</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="register-hero-button">
                        {% include components/register-button.html %}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

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

.feature-card {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    padding: 2rem;
    transition: background 0.3s ease;
    border: 1px solid rgba(223, 180, 86, 0.1);
    height: 100%;
    min-height: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
}

.feature-card i {
    margin-bottom: 1.5rem;
    flex-shrink: 0;
    font-size: 3rem;
    background: linear-gradient(45deg, #957718, #e2c27d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
    filter: drop-shadow(0 0 8px rgba(149, 119, 24, 0.3));
    transition: all 0.3s ease;
}

.feature-card:hover i {
    transform: scale(1.1);
    filter: drop-shadow(0 0 15px rgba(149, 119, 24, 0.6));
    animation: iconFlare 2s infinite ease-in-out;
}

@keyframes iconFlare {
    0%, 100% { 
        filter: drop-shadow(0 0 8px rgba(149, 119, 24, 0.3));
        transform: scale(1.1);
    }
    50% { 
        filter: drop-shadow(0 0 20px rgba(226, 194, 125, 0.8));
        transform: scale(1.15);
    }
}

.feature-card h3 {
    color: #07002c;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-align: center;
    flex-shrink: 0;
}

.feature-card p {
    color: #07002c;
    margin-bottom: 0;
    text-align: center;
    line-height: 1.6;
    font-size: 1.1rem;
    flex-grow: 1;
    display: flex;
    align-items: center;
}

.feature-card:hover {
    background: rgba(223, 180, 86, 0.05);
}

.feature-card i.fa-quran,
.feature-card i.fa-microphone-alt,
.feature-card i.fa-mosque {
    background: linear-gradient(45deg, #957718, #e2c27d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
}

.lead {
    font-size: 1.25rem;
    font-weight: 300;
    line-height: 1.8;
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 768px) {
    .thuluth-text {
        font-size: 1.5em;
    }
    
    .feature-card {
        min-height: 240px;
        padding: 1.5rem;
    }
    
    .feature-card h3 {
        font-size: 1.3rem;
    }
    
    .feature-card p {
        font-size: 1rem;
    }
    
    .register-hero-section {
        padding: 3rem 0;
        margin-top: 1.5rem;
    }
}

.register-hero-section {
    position: relative;
    padding: 4rem 0;
    margin-top: 2rem;
    overflow: hidden;
}

.register-hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.05;
    animation: slowMove 20s linear infinite;
}

@keyframes slowMove {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(2%, 2%) rotate(1deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
}

.register-content {
    position: relative;
    z-index: 1;
    padding: 3rem;
    border-radius: 20px;
    background: #ffffff;
    border: 1px solid rgba(16, 3, 47, 0.1);
    box-shadow: 0 8px 32px rgba(16, 3, 47, 0.05);
}

.register-content h2 {
    color: #07002c;
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    text-shadow: none;
}

.register-content .lead {
    color: #07002c;
    font-size: 1.4rem;
    line-height: 1.6;
    margin-bottom: 2rem;
}

.register-hero-button {
    margin-top: 2rem;
}

.register-hero-button .register-button {
    background: linear-gradient(45deg, #957718, #e2c27d) !important;
    color: #ffffff !important;
    border: none;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    font-family: 'Almarena Mono', monospace;
    text-transform: none;
    letter-spacing: normal;
    display: block;
    text-align: center;
    text-decoration: none;
}

.register-hero-button .register-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(149, 119, 24, 0.3);
    background: linear-gradient(45deg, #8b6e17, #d4b76f) !important;
}

.register-hero-button .register-button:active {
    transform: translateY(0);
}

@media (max-width: 768px) {
    .register-hero-section {
        padding: 2rem 0;
        margin-top: 1rem;
    }

    .register-content {
        padding: 1.5rem;
        margin: 0 1rem;
    }

    .register-content h2 {
        font-size: 1.8rem;
        margin-bottom: 1rem;
    }

    .register-content .lead {
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
    }

    .register-hero-button .register-button {
        padding: 0.8rem 1.5rem;
        font-size: 1rem;
        max-width: 250px;
    }
}

@media (max-width: 480px) {
    .register-hero-section {
        padding: 1.5rem 0;
    }

    .register-content {
        padding: 1.25rem;
        margin: 0 0.5rem;
    }

    .register-content h2 {
        font-size: 1.5rem;
    }

    .register-content .lead {
        font-size: 1rem;
    }

    .register-hero-button .register-button {
        padding: 0.7rem 1.2rem;
        max-width: 220px;
    }
}

/* Decorative elements */
.register-content::after {
    content: '❁';
    position: absolute;
    top: -1rem;
    right: -1rem;
    font-size: 2rem;
    background: linear-gradient(45deg, #957718, #e2c27d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: rotate 10s linear infinite;
    filter: drop-shadow(2px 2px 4px rgba(149, 119, 24, 0.3));
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.event-info-box {
    background: #ffffff;
    border: 1px solid rgba(7, 0, 44, 0.08);
    border-radius: 20px;
    padding: 2rem;
    margin: 2rem auto;
    max-width: 500px;
    box-shadow: 0 8px 30px rgba(7, 0, 44, 0.03);
    text-align: left;
}

.info-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(7, 0, 44, 0.06);
}

.info-header i {
    color: #07002c;
    font-size: 1.2rem;
    opacity: 0.7;
}

.info-header h3 {
    margin: 0;
    color: #07002c;
    font-size: 1.1rem;
    font-weight: 600;
    font-family: 'Almarena Mono', monospace;
    letter-spacing: 0.5px;
}

.event-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1rem 1.25rem;
    background: rgba(7, 0, 44, 0.015);
    border-radius: 12px;
    transition: all 0.3s ease;
}

.detail-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    background: rgba(7, 0, 44, 0.02);
    border-radius: 10px;
}

.detail-icon i {
    color: #07002c;
    font-size: 1rem;
    opacity: 0.8;
}

.detail-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.detail-label {
    font-size: 0.75rem;
    color: rgba(7, 0, 44, 0.5);
    font-family: 'Almarena Mono', monospace;
    letter-spacing: 1px;
    font-weight: 500;
}

.detail-value {
    color: #07002c;
    font-size: 1.1rem;
    font-family: 'Almarena Mono', monospace;
    font-weight: 500;
    line-height: 1.4;
}

@media (max-width: 768px) {
    .event-info-box {
        margin: 1.5rem auto;
        padding: 1.5rem;
    }

    .detail-item {
        padding: 0.875rem 1rem;
    }

    .detail-icon {
        width: 38px;
        height: 38px;
    }

    .detail-value {
        font-size: 1rem;
    }
}

@media (max-width: 576px) {
    .event-info-box {
        margin: 1.25rem auto;
        padding: 1.25rem;
    }

    .detail-item {
        padding: 0.75rem;
        gap: 1rem;
    }

    .detail-icon {
        width: 34px;
        height: 34px;
    }

    .detail-value {
        font-size: 0.95rem;
    }
}

[dir="rtl"] .event-info-box {
    text-align: right;
}

[dir="rtl"] .detail-content {
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', sans-serif;
}
</style>

<!-- Add more sections as needed --> 