---
layout: tasfiya
title: Qur'an Recitation Competition
---

<div class="islamic-decoration">
    <h1>Qur'an Recitation and Athan Competition</h1>
</div>

<p class="lead mb-5">
    SIO Abul Fazal presents the first edition of <span class="thuluth-text">إتقان</span> competition, which brings together all those with beautiful and touching voices in the Qur'an Recitation and the Athan from all over the place, in Delhi, which aims to honor the most beautiful voices in Qur'an Recitation and Athan raising.
    
</p>

<div class="row justify-content-center mt-5">
    <div class="col-md-4 mb-4">
        <div class="feature-card">
            <i class="fas fa-book-quran fa-3x mb-3" style="color: #dfb456;"></i>
            <h3>Qur'an Recitation</h3>
            <p>Showcase your talent in reciting the Holy Qur'an with proper Tajweed and beautiful voice</p>
        </div>
    </div>
    <div class="col-md-4 mb-4">
        <div class="feature-card">
            <i class="fas fa-mosque fa-3x mb-3" style="color: #dfb456;"></i>
            <h3>Athan Competition</h3>
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
                    <p class="lead mb-4">Showcase your talent in Quran recitation and Adhan. Register now to be part of this blessed journey.</p>
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
    background: linear-gradient(45deg, #dfb456, #e6c172);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    font-weight: 700;
    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
    display: inline-block;
}

.lead {
    font-size: 1.25rem;
    font-weight: 300;
    line-height: 1.8;
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
}

.feature-card {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    padding: 2rem;
    transition: background 0.3s ease;
    border: 1px solid rgba(223, 180, 86, 0.1);
}

.feature-card:hover {
    background: rgba(223, 180, 86, 0.05);
}

.feature-card h3 {
    color: #dfb456;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-align: center;
}

.feature-card p {
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0;
    text-align: center;
    line-height: 1.6;
    font-size: 1.1rem;
}

@media (max-width: 768px) {
    .thuluth-text {
        font-size: 1.5em;
    }
}

.register-hero-section {
    position: relative;
    padding: 6rem 0;
    margin-top: 4rem;
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
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(223, 180, 86, 0.15);
}

.register-content::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 20px;
    padding: 2px;
    background: linear-gradient(45deg, #dfb456, transparent, #e6c172);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
}

.register-content h2 {
    color: #dfb456;
    font-size: 3rem;
    margin-bottom: 1.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.register-content .lead {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.4rem;
    line-height: 1.6;
    margin-bottom: 2rem;
}

.register-hero-button {
    transform: scale(1.2);
    margin: 2rem 0 1rem;
}

.register-hero-button .register-button {
    padding: 1rem 2.5rem;
    font-size: 1.2rem;
    box-shadow: 0 8px 25px rgba(223, 180, 86, 0.3);
}

/* Decorative elements */
.register-content::after {
    content: '❁';
    position: absolute;
    top: -1rem;
    right: -1rem;
    font-size: 2rem;
    color: #dfb456;
    animation: rotate 10s linear infinite;
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 768px) {
    .register-hero-section {
        padding: 4rem 0;
        margin-top: 3rem;
    }
    
    .register-content {
        padding: 2rem;
    }
    
    .register-content h2 {
        font-size: 2rem;
    }
    
    .register-content .lead {
        font-size: 1.1rem;
    }
    
    .register-hero-button {
        transform: scale(1.1);
        margin: 1.5rem 0 0.5rem;
    }
    
    .register-hero-button .register-button {
        padding: 0.8rem 2rem;
        font-size: 1.1rem;
    }
}
</style>

<!-- Add more sections as needed --> 