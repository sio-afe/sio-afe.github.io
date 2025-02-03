---
layout: tasfiya
title: FAQ - Tasfiya
---

<div class="islamic-decoration">
    <h1>Frequently Asked Questions</h1>
</div>

<div class="faq-content">
    <div class="accordion" id="faqAccordion">
        <!-- Registration -->
        <div class="faq-item mb-4">
            <h2 class="faq-header" id="headingOne">
                <button class="faq-btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                    <i class="fas fa-question-circle me-2"></i>
                    How do I register for the competition?
                </button>
            </h2>
            <div id="collapseOne" class="collapse show" data-bs-parent="#faqAccordion">
                <div class="faq-body">
                    Registration can be done online through our website or in person at the SIO Abul Fazal office. You'll need to provide basic information and choose your competition category.
                </div>
            </div>
        </div>

        <!-- Eligibility -->
        <div class="faq-item mb-4">
            <h2 class="faq-header" id="headingTwo">
                <button class="faq-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                    <i class="fas fa-user-check me-2"></i>
                    Who is eligible to participate?
                </button>
            </h2>
            <div id="collapseTwo" class="collapse" data-bs-parent="#faqAccordion">
                <div class="faq-body">
                    The competition is open to all residents of Delhi. Age categories are: Junior (under 15) and Senior (15 and above). Participants must be able to recite the Qur'an with proper Tajweed.
                </div>
            </div>
        </div>

        <!-- Competition Format -->
        <div class="faq-item mb-4">
            <h2 class="faq-header" id="headingThree">
                <button class="faq-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                    <i class="fas fa-clipboard-list me-2"></i>
                    What is the competition format?
                </button>
            </h2>
            <div id="collapseThree" class="collapse" data-bs-parent="#faqAccordion">
                <div class="faq-body">
                    The competition consists of multiple rounds: Preliminary, Semi-Final, and Final. Each round will have specific Surahs assigned for recitation. Athan competition will be conducted separately.
                </div>
            </div>
        </div>

        <!-- Judging -->
        <div class="faq-item mb-4">
            <h2 class="faq-header" id="headingFour">
                <button class="faq-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour">
                    <i class="fas fa-gavel me-2"></i>
                    How is the judging conducted?
                </button>
            </h2>
            <div id="collapseFour" class="collapse" data-bs-parent="#faqAccordion">
                <div class="faq-body">
                    A panel of qualified judges will evaluate participants based on Tajweed, pronunciation, voice quality, and overall presentation. Detailed scoring criteria will be provided to all participants.
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.faq-item {
    margin-bottom: 1.5rem;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.02);
}

.faq-header {
    margin: 0;
}

.faq-btn {
    width: 100%;
    padding: 1.2rem 1.5rem;
    text-align: left;
    background: none;
    border: none;
    color: #ffd700;
    font-size: 1.2rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    transition: background 0.3s ease;
}

.faq-btn:hover, .faq-btn:not(.collapsed) {
    background: rgba(255, 215, 0, 0.05);
}

.faq-btn i {
    color: #ffd700;
    margin-right: 1rem;
    width: 24px;
    text-align: center;
}

.faq-body {
    padding: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
    border-top: 1px solid rgba(255, 215, 0, 0.1);
    line-height: 1.8;
    font-size: 1.1rem;
    text-align: center;
    background: rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .faq-btn {
        padding: 1rem;
        font-size: 1.1rem;
    }
    
    .faq-body {
        padding: 1rem;
        font-size: 1rem;
        line-height: 1.6;
    }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.faq-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;
    animation: fadeIn 0.5s ease-out;
}

// Add focus styles for accessibility
.faq-btn:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.5);
}

.islamic-decoration {
    position: relative;
    text-align: center;
    padding: 2rem 0;
    margin-bottom: 2rem;
    overflow: hidden;
}

.islamic-decoration h1 {
    color: #ffd700;
    font-size: 2.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 1;
}

.islamic-decoration::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
    z-index: 0;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Remove the icon rotation animation
    const faqButtons = document.querySelectorAll('.faq-btn');
    faqButtons.forEach(button => {
        button.addEventListener('click', function() {
            // No icon rotation needed
        });
    });
});
</script> 