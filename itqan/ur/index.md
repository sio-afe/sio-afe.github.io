<div class="register-hero-section">
    <div class="register-hero-bg"></div>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-10 text-center">
                <div class="register-content">
                    <h2 class="mb-4">إتقان مقابلے میں شامل ہوں</h2>
                    <p class="lead mb-4">قرآن تلاوت اور اذان میں اپنی صلاحیتوں کا مظاہرہ کریں۔ اس مبارک سفر کا حصہ بننے کے لیے ابھی رجسٹر کریں۔</p>
                    <div class="register-hero-button">
                        {% include components/register-button.html %}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
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
    background: url('/assets/img/islamic/pattern.png') center/cover;
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

[dir="rtl"] .register-content h2 {
    color: #dfb456;
    font-size: 3.2rem;
    margin-bottom: 1.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', sans-serif;
    line-height: 1.8;
}

[dir="rtl"] .register-content .lead {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.6rem;
    line-height: 1.8;
    margin-bottom: 2rem;
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', sans-serif;
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

[dir="rtl"] .register-content::after {
    right: auto;
    left: -1rem;
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
    
    [dir="rtl"] .register-content h2 {
        font-size: 2.4rem;
    }
    
    [dir="rtl"] .register-content .lead {
        font-size: 1.3rem;
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