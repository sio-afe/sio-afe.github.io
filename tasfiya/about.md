---
layout: tasfiya
title: About Competition - Tasfiya
---

<div class="islamic-decoration">
    <h1>About the Competition</h1>
</div>

<div class="about-content">
    <div class="section mb-5">
        <h2 class="text-gold mb-4">Overview</h2>
        <p class="lead">
            The Tasfiya Competition is a prestigious Qur'an recitation and Athan competition that brings together talented individuals from across Delhi to showcase their beautiful voices in reciting the Holy Qur'an and performing the call to prayer.
        </p>
    </div>

    <div class="row justify-content-center mb-5">
        <div class="col-md-6 mb-4">
            <div class="feature-card">
                <i class="fas fa-trophy fa-3x mb-3" style="color: #ffd700;"></i>
                <h3>Competition Categories</h3>
                <ul class="list-unstyled">
                    <li>• Qur'an Recitation - Senior Division</li>
                    <li>• Qur'an Recitation - Junior Division</li>
                    <li>• Athan Competition</li>
                    <li>• Special Category for Huffaz</li>
                </ul>
            </div>
        </div>
        <div class="col-md-6 mb-4">
            <div class="feature-card">
                <i class="fas fa-award fa-3x mb-3" style="color: #ffd700;"></i>
                <h3>Prizes</h3>
                <ul class="list-unstyled">
                    <li>• First Prize: ₹25,000</li>
                    <li>• Second Prize: ₹15,000</li>
                    <li>• Third Prize: ₹10,000</li>
                    <li>• Special Recognition Awards</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="section mb-5">
        <h2 class="text-gold mb-4">Judging Criteria</h2>
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="feature-card">
                    <h4>Qur'an Recitation</h4>
                    <ul class="list-unstyled">
                        <li>• Tajweed Rules</li>
                        <li>• Voice Quality</li>
                        <li>• Pronunciation</li>
                        <li>• Memorization</li>
                    </ul>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="feature-card">
                    <h4>Athan Competition</h4>
                    <ul class="list-unstyled">
                        <li>• Voice Clarity</li>
                        <li>• Proper Pronunciation</li>
                        <li>• Melody and Rhythm</li>
                        <li>• Overall Impact</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.text-gold {
    color: #ffd700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.section {
    background: rgba(255, 255, 255, 0.03);
    padding: 2rem;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    transform: translateY(0);
    transition: transform 0.3s ease, background 0.3s ease;
}

.section:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.05);
}

.feature-card {
    background: rgba(255, 255, 255, 0.03);
    padding: 2rem;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(255, 215, 0, 0.1);
    height: 100%;
    animation: fadeIn 0.5s ease-out calc(var(--animation-order, 0) * 0.1s) both;
}

.feature-card:hover {
    transform: translateY(-5px) scale(1.02);
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.feature-card i {
    transition: transform 0.3s ease;
}

.feature-card:hover i {
    transform: scale(1.1) rotate(5deg);
}

.feature-card ul li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.8rem;
    opacity: 0.9;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.feature-card ul li:before {
    content: '•';
    color: #ffd700;
    position: absolute;
    left: 0;
    transition: transform 0.3s ease;
}

.feature-card:hover ul li {
    opacity: 1;
    transform: translateX(5px);
}

.feature-card:hover ul li:before {
    transform: scale(1.2);
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
}

.lead {
    animation: slideIn 0.5s ease-out 0.2s both;
}

@media (max-width: 768px) {
    .feature-card {
        margin-bottom: 1rem;
    }
    
    .section {
        padding: 1.5rem;
    }
}
</style> 