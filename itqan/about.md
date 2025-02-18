---
layout: tasfiya
title: About إتقان
---

<style>
/* Container styles */
.container-fluid {
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
}

.container {
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
}

/* Responsive containers */
@media (min-width: 576px) {
    .container {
        max-width: 540px;
    }
}

@media (min-width: 768px) {
    .container {
        max-width: 720px;
    }
}

@media (min-width: 992px) {
    .container {
        max-width: 960px;
    }
}

@media (min-width: 1200px) {
    .container {
        max-width: 1140px;
    }
}

@media (min-width: 1400px) {
    .container {
        max-width: 1320px;
    }
}

/* Grid system */
.row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
}

.col {
    position: relative;
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
}

/* Responsive columns */
.col-12 { flex: 0 0 100%; max-width: 100%; }
.col-md-6 { flex: 0 0 100%; max-width: 100%; }
.col-lg-4 { flex: 0 0 100%; max-width: 100%; }
.col-xl-3 { flex: 0 0 100%; max-width: 100%; }

@media (min-width: 768px) {
    .col-md-6 { flex: 0 0 50%; max-width: 50%; }
}

@media (min-width: 992px) {
    .col-lg-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
}

@media (min-width: 1200px) {
    .col-xl-3 { flex: 0 0 25%; max-width: 25%; }
}

/* Lead paragraph styles */
.lead {
    font-family: 'Open Sans', sans-serif;
    font-size: 1.25rem;
    font-weight: 300;
    line-height: 1.8;
    color: #07002c;
    text-align: left;
    margin: 0 auto;
    padding: 2rem 0;
}

@media (max-width: 768px) {
    .lead {
    text-align: center;
        font-size: 1.1rem;
        padding: 1.5rem 0;
    }
}

/* Thuluth font */
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

/* Section styles */
.section {
    padding: 4rem 0;
}

@media (max-width: 768px) {
    .section {
        padding: 3rem 0;
    }
}

/* Card styles */
.card {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid rgba(16, 3, 47, 0.15);
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.08);
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(16, 3, 47, 0.15);
}

.card-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(16, 3, 47, 0.1);
    background: linear-gradient(135deg, rgba(16, 3, 47, 0.02) 0%, rgba(16, 3, 47, 0.05) 100%);
    border-radius: 12px 12px 0 0;
}

.card-body {
    padding: 1.5rem;
    flex: 1;
}

.card-title {
    font-family: 'Almarena Mono', monospace;
    color: #07002c;
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
}

.card-icon {
    font-size: 2rem;
    color: #07002c;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #07002c, rgba(16, 3, 47, 0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Goal section styles */
.goal-section {
    background: linear-gradient(135deg, rgba(16, 3, 47, 0.02) 0%, rgba(16, 3, 47, 0.05) 100%);
    padding: 4rem 0;
    margin: 2rem 0;
}

.goal-card {
    background: #ffffff;
    border-radius: 15px;
    padding: 2rem;
    height: 100%;
    border: 1px solid rgba(16, 3, 47, 0.15);
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.08);
    transition: all 0.3s ease;
}

.goal-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(16, 3, 47, 0.15);
}

.goal-icon {
    font-size: 2.5rem;
    color: #957718;
    margin-bottom: 1rem;
}

.goal-title {
    font-family: 'Almarena Mono', monospace;
    color: #07002c;
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

/* Competition section styles */
.competition-section {
    padding: 4rem 0;
}

.competition-card {
    background: #ffffff;
    border-radius: 15px;
    padding: 2rem;
    height: 100%;
    border: 1px solid rgba(16, 3, 47, 0.15);
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.08);
    transition: all 0.3s ease;
}

.competition-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(16, 3, 47, 0.15);
}

/* Prize list styles */
.prize-list {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0 0;
}

.prize-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
    border: 1px solid rgba(16, 3, 47, 0.05);
}

.prize-item:hover {
    transform: translateX(8px);
    background: #ffffff;
    border-color: rgba(16, 3, 47, 0.1);
}

.prize-icon {
    font-size: 1.2rem;
    color: #957718;
}

/* Different colors for different prize levels */
.prize-item:nth-child(1) .prize-icon {
    color: #FFD700;
}

.prize-item:nth-child(2) .prize-icon {
    color: #C0C0C0;
}

.prize-item:nth-child(3) .prize-icon {
    color: #CD7F32;
}

/* Utility classes */
.text-center {
    text-align: center;
}

.mb-4 {
    margin-bottom: 1.5rem;
}

.mb-5 {
    margin-bottom: 3rem;
}

@media (max-width: 768px) {
.mb-4 {
        margin-bottom: 1rem;
    }
    
    .mb-5 {
        margin-bottom: 2rem;
    }
}

/* Add these styles in the style section */
.category-section {
    background: rgba(16, 3, 47, 0.02);
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid rgba(16, 3, 47, 0.08);
}

.category-section:hover {
    background: rgba(16, 3, 47, 0.04);
}

.category-label {
    font-family: 'Almarena Mono', monospace;
    color: #07002c;
    font-weight: 600;
    font-size: 1.1rem;
    padding: 0.5rem 1rem;
    background: rgba(16, 3, 47, 0.05);
    border-radius: 6px;
    display: inline-block;
}

/* Add these new styles for competition structure */
.competition-structure {
    background: rgba(16, 3, 47, 0.02);
    padding: 3rem 0;
    margin: 2rem 0;
}

.round-card {
    background: #ffffff;
    border-radius: 15px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid rgba(16, 3, 47, 0.1);
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.08);
    transition: all 0.3s ease;
}

.round-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(16, 3, 47, 0.15);
}

.round-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(16, 3, 47, 0.1);
}

.round-icon {
    font-size: 1.5rem;
    color: #957718;
}

.round-title {
    font-family: 'Almarena Mono', monospace;
    color: #07002c;
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
}

.category-details {
    background: rgba(16, 3, 47, 0.02);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.category-details:last-child {
    margin-bottom: 0;
}

.category-name {
    font-weight: 600;
    color: #07002c;
    margin-bottom: 0.5rem;
}

.requirement-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.requirement-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    color: #07002c;
}

.requirement-icon {
    color: #957718;
    font-size: 0.9rem;
}

/* Add these new styles for round details */
.round-details {
    padding: 0.5rem 0;
    color: #07002c;
    font-size: 0.9rem;
}

.assessment-criteria {
    background: rgba(16, 3, 47, 0.02);
    border-radius: 6px;
    padding: 0.8rem;
    margin-top: 0.5rem;
}

.assessment-title {
    font-weight: 600;
    color: #07002c;
    margin-bottom: 0.5rem;
}

/* Add styles for rules section */
.rules-section {
    background: linear-gradient(135deg, rgba(16, 3, 47, 0.03) 0%, rgba(16, 3, 47, 0.06) 100%);
    padding: 3rem 0;
    margin-bottom: 2rem;
}

.rules-container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
}

.rules-title {
    color: #07002c;
    margin-bottom: 2rem;
        position: relative;
    display: inline-block;
}

.rules-title:after {
        content: '';
    display: block;
    width: 60%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #957718, transparent);
    margin: 0.5rem auto;
}

.rules-card {
    background: #ffffff;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(16, 3, 47, 0.08);
    text-align: left;
}

.rules-header {
        display: flex;
        align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(16, 3, 47, 0.1);
}

.rules-icon {
    font-size: 2rem;
    color: #957718;
}

.rules-subtitle {
    font-family: 'Almarena Mono', monospace;
    color: #07002c;
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
}

.rules-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.rule-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 0.8rem 0;
    border-bottom: 1px solid rgba(16, 3, 47, 0.05);
}

.rule-item:last-child {
    border-bottom: none;
}

.rule-icon {
    color: #957718;
    font-size: 1rem;
    padding-top: 0.2rem;
}

.rule-text {
    flex: 1;
    color: #07002c;
    line-height: 1.6;
        font-size: 1rem;
}

.rule-emphasis {
    font-weight: 600;
    color: #957718;
}
</style>

<div class="container-fluid">
    <div class="container">
        <div class="text-center mb-5">
    <h1>About <span class="thuluth-text">إتقان</span></h1>
</div>

        <p class="lead">
        Muslims voices are unified from all around the islamic world raising the call to prayer (Azan) and reciting verses from the holy Quran in aesthetics, precised and special voices and maqamat. To spread the holy Quran knowledge and glorify the call to prayer through <span class="thuluth-text">إتقان</span> competition And to raise the competitive soul between the contestants whom gifted with the best voices, reciting and maqamat talents.
    </p>
    </div>

    <section class="goal-section">
        <div class="container">
            <h2 class="text-center mb-5">Goals of <span class="thuluth-text">إتقان</span></h2>
            <div class="row">
                <div class="col-12 col-md-6 col-lg-3 mb-4">
                    <div class="goal-card">
                        <i class="fas fa-microphone-alt goal-icon"></i>
                        <h3 class="goal-title">Beautiful Voices</h3>
                        <p>Highlight beautiful voices in reciting the Holy Quran and raising the call to prayer</p>
            </div>
                    </div>
                <div class="col-12 col-md-6 col-lg-3 mb-4">
                    <div class="goal-card">
                        <i class="fas fa-quran goal-icon"></i>
                        <h3 class="goal-title">Glorify Quran</h3>
                        <p>Glorify the Holy Quran and the call to prayer through aesthetic recitation</p>
                            </div>
                                    </div>
                <div class="col-12 col-md-6 col-lg-3 mb-4">
                    <div class="goal-card">
                        <i class="fas fa-star goal-icon"></i>
                        <h3 class="goal-title">Highlight Talents</h3>
                        <p>Highlight talents in the field of Quranic recitation and maqamat</p>
                                </div>
                            </div>
                <div class="col-12 col-md-6 col-lg-3 mb-4">
                    <div class="goal-card">
                        <i class="fas fa-music goal-icon"></i>
                        <h3 class="goal-title">Enhance Aesthetics</h3>
                        <p>Enhance the aesthetics of voices and maqamat for Quran reciters and muezzins</p>
                        </div>
                            </div>
                                    </div>
                                </div>
    </section>

    <section class="rules-section">
        <div class="container">
            <div class="rules-container">
                <h2 class="rules-title">Competition Rules & Guidelines</h2>
                <div class="rules-card">
                    <div class="rules-header">
                        <i class="fas fa-gavel rules-icon"></i>
                        <h3 class="rules-subtitle">Important Notice</h3>
                            </div>
                    <ul class="rules-list">
                        <li class="rule-item">
                            <i class="fas fa-balance-scale rule-icon"></i>
                            <div class="rule-text">
                                All decisions made by the panel of judges are <span class="rule-emphasis">final and binding</span>. No appeals or objections will be entertained.
                                    </div>
                        </li>
                        <li class="rule-item">
                            <i class="fas fa-exclamation-circle rule-icon"></i>
                            <div class="rule-text">
                                Any form of misconduct, disrespect, or unsportsmanlike behavior will result in immediate <span class="rule-emphasis">disqualification</span> from the competition.
                                </div>
                        </li>
                        <li class="rule-item">
                            <i class="fas fa-user-shield rule-icon"></i>
                            <div class="rule-text">
                                Participants must maintain the highest standards of <span class="rule-emphasis">Islamic etiquette and adab</span> throughout the competition.
                                    </div>
                        </li>
                        <li class="rule-item">
                            <i class="fas fa-clock rule-icon"></i>
                            <div class="rule-text">
                                Participants must strictly adhere to their allocated time slots. <span class="rule-emphasis">No extensions</span> will be granted.
                                </div>
                        </li>
                        <li class="rule-item">
                            <i class="fas fa-hand-paper rule-icon"></i>
                            <div class="rule-text">
                                Any attempt to influence or interfere with the judging process will lead to immediate <span class="rule-emphasis">disqualification</span>.
                            </div>
                        </li>
                    </ul>
                        </div>
                    </div>
                </div>
    </section>

    <section class="competition-section">
        <div class="container">
            <h2 class="text-center mb-5">Competition Categories</h2>
            <div class="row">
                <!-- Hifz Competition -->
                <div class="col-12 col-md-6 col-lg-4 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <i class="fas fa-quran card-icon"></i>
                            <h3 class="card-title">Hifz Competition</h3>
                    </div>
                        <div class="card-body">
                            <h4 class="mb-3">Under 17</h4>
                            <div class="category-section mb-4">
                                <div class="category-label mb-2">Juz 30</div>
                                    <div class="prize-list">
                                    <div class="prize-item">
                                        <i class="fas fa-trophy prize-icon"></i>
                                        <span>First Prize</span>
                                </div>
                                    <div class="prize-item">
                                        <i class="fas fa-medal prize-icon"></i>
                                        <span>Second Prize</span>
                            </div>
                                    <div class="prize-item">
                                        <i class="fas fa-award prize-icon"></i>
                                        <span>Third Prize</span>
                        </div>
                    </div>
            </div>

                            <h4 class="mb-3">Open Age</h4>
                            <div class="category-section mb-4">
                                <div class="category-label mb-2">Juz 29 & 30</div>
                                    <div class="prize-list">
                                    <div class="prize-item">
                                        <i class="fas fa-trophy prize-icon"></i>
                                        <span>First Prize</span>
                                    </div>
                                    <div class="prize-item">
                                        <i class="fas fa-medal prize-icon"></i>
                                        <span>Second Prize</span>
                                </div>
                                    <div class="prize-item">
                                        <i class="fas fa-award prize-icon"></i>
                                        <span>Third Prize</span>
                            </div>
                        </div>
                    </div>

                            <div class="category-section">
                                <div class="category-label mb-2">Full Quran</div>
                                    <div class="prize-list">
                                    <div class="prize-item">
                                        <i class="fas fa-trophy prize-icon"></i>
                                        <span>First Prize</span>
            </div>
                                    <div class="prize-item">
                                        <i class="fas fa-medal prize-icon"></i>
                                        <span>Second Prize</span>
                    </div>
                                    <div class="prize-item">
                                        <i class="fas fa-award prize-icon"></i>
                                        <span>Third Prize</span>
                            </div>
                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                <!-- Tarteel Competition -->
                <div class="col-12 col-md-6 col-lg-4 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <i class="fas fa-microphone card-icon"></i>
                            <h3 class="card-title">Tarteel Competition</h3>
                            </div>
                        <div class="card-body">
                            <h4>Open Age</h4>
                                    <div class="prize-list">
                                <div class="prize-item">
                                    <i class="fas fa-trophy prize-icon"></i>
                                    <span>First Prize</span>
                                    </div>
                                <div class="prize-item">
                                    <i class="fas fa-medal prize-icon"></i>
                                    <span>Second Prize</span>
                                </div>
            </div>
            </div>
            </div>
        </div>

                <!-- Azan Competition -->
                <div class="col-12 col-md-6 col-lg-4 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <i class="fas fa-mosque card-icon"></i>
                            <h3 class="card-title">Azan Competition</h3>
                    </div>
                        <div class="card-body">
                            <h4>Open Age</h4>
                                    <div class="prize-list">
                                <div class="prize-item">
                                    <i class="fas fa-trophy prize-icon"></i>
                                    <span>First Prize</span>
                                    </div>
                                <div class="prize-item">
                                    <i class="fas fa-medal prize-icon"></i>
                                    <span>Second Prize</span>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <h2 class="text-center mb-5">Competition Process</h2>
            <div class="row">
                <!-- Preliminary Stage -->
                <div class="col-12 col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <i class="fas fa-flag-checkered card-icon"></i>
                            <h3 class="card-title">Preliminary Stage</h3>
                    </div>
                        <div class="card-body">
                        <div class="prize-list">
                                <div class="prize-item">
                                    <i class="fas fa-school prize-icon"></i>
                                    <span>10 Islamic Schools Participation</span>
                        </div>
                                <div class="prize-item">
                                    <i class="fas fa-users prize-icon"></i>
                                    <span>Internal School Selection</span>
                    </div>
                                <div class="prize-item">
                                    <i class="fas fa-user-graduate prize-icon"></i>
                                    <span>2 Best Candidates per Category</span>
                </div>
                        </div>
                    </div>
                </div>
            </div>

                <!-- Finals Stage -->
                <div class="col-12 col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <i class="fas fa-trophy card-icon"></i>
                            <h3 class="card-title">Finals Stage</h3>
                    </div>
                        <div class="card-body">
                        <div class="prize-list">
                                <div class="prize-item">
                                    <i class="fas fa-star prize-icon"></i>
                                    <span>24 Finalists per Category</span>
                        </div>
                                <div class="prize-item">
                                    <i class="fas fa-school prize-icon"></i>
                                    <span>20 School Representatives</span>
                    </div>
                                <div class="prize-item">
                                    <i class="fas fa-user prize-icon"></i>
                                    <span>4 Individual Participants</span>
                </div>
                    </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="competition-structure">
        <div class="container">
            <h2 class="text-center mb-5">Competition Structure & Rounds</h2>
            
            <!-- Hifz Competition -->
            <div class="round-card">
                <div class="round-header">
                    <i class="fas fa-quran round-icon"></i>
                    <h3 class="round-title">Hifz Competition</h3>
                </div>
                
                <!-- Under 17 and Open Age (Juz) Categories -->
                <div class="category-details">
                    <div class="category-name">Under 17 - Juz 30 & Open Age - Juz 29 & 30</div>
                    <div class="round-details">
                        <strong>Initial Round:</strong>
                        <ul class="requirement-list">
                            <li class="requirement-item">
                                <i class="fas fa-check-circle requirement-icon"></i>
                                <span>Quranic recitation of four consecutive verses</span>
                            </li>
                        </ul>
                        
                        <strong>Secondary Round:</strong>
                        <ul class="requirement-list">
                            <li class="requirement-item">
                                <i class="fas fa-check-circle requirement-icon"></i>
                                <span>Quranic recitation of four consecutive verses</span>
                            </li>
                            <li class="requirement-item">
                                <i class="fas fa-check-circle requirement-icon"></i>
                                <span>Surah identification</span>
                            </li>
                        </ul>
                        
                        <strong>Final Round:</strong>
                        <ul class="requirement-list">
                            <li class="requirement-item">
                                <i class="fas fa-check-circle requirement-icon"></i>
                                <span>Quranic recitation of four consecutive verses</span>
                            </li>
                            <li class="requirement-item">
                                <i class="fas fa-check-circle requirement-icon"></i>
                                <span>Surah identification</span>
                            </li>
                            <li class="requirement-item">
                                <i class="fas fa-check-circle requirement-icon"></i>
                                <span>Demonstration of Surah knowledge (reciting opening and closing verses)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Full Quran Category -->
                <div class="category-details">
                    <div class="category-name">Open Age - Full Quran</div>
                    <div class="round-details">
                        <ul class="requirement-list">
                            <li class="requirement-item">
                                <i class="fas fa-check-circle requirement-icon"></i>
                                <span>Participants demonstrate memorization through recitation of four consecutive verses from any part of the Holy Quran</span>
                            </li>
                            <li class="requirement-item">
                                <i class="fas fa-check-circle requirement-icon"></i>
                                <span>Judges may request recitation from any Surah</span>
                            </li>
                            <li class="requirement-item">
                                <i class="fas fa-check-circle requirement-icon"></i>
                                <span>Assessment of overall Quran memorization proficiency</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Tarteel Competition -->
            <div class="round-card">
                <div class="round-header">
                    <i class="fas fa-microphone-alt round-icon"></i>
                    <h3 class="round-title">Tarteel Competition</h3>
                </div>
                
                <div class="category-details">
                    <div class="category-name">Open Age</div>
                    <div class="round-details">
                        <ul class="requirement-list">
                            <li class="requirement-item">
                                <i class="fas fa-clock requirement-icon"></i>
                                <span>Three-minute recitation of chosen verse from the Holy Quran</span>
                            </li>
                        </ul>

                        <div class="assessment-criteria">
                            <div class="assessment-title">Assessment Criteria:</div>
                            <ul class="requirement-list">
                                <li class="requirement-item">
                                    <i class="fas fa-check-circle requirement-icon"></i>
                                    <span>Mastery of Tajweed rules and proper pronunciation</span>
                                </li>
                                <li class="requirement-item">
                                    <i class="fas fa-music requirement-icon"></i>
                                    <span>Application of appropriate maqamat (melodic modes)</span>
                                </li>
                                <li class="requirement-item">
                                    <i class="fas fa-check-circle requirement-icon"></i>
                                    <span>Voice quality and tonal clarity</span>
                                </li>
                                <li class="requirement-item">
                                    <i class="fas fa-check-circle requirement-icon"></i>
                                    <span>Proper breath control and pauses</span>
                                </li>
                                <li class="requirement-item">
                                    <i class="fas fa-heart requirement-icon"></i>
                                    <span>Emotional connection and spiritual delivery</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Azan Competition -->
            <div class="round-card">
                <div class="round-header">
                    <i class="fas fa-mosque round-icon"></i>
                    <h3 class="round-title">Azan Competition</h3>
                </div>
                
                <div class="category-details">
                    <div class="category-name">Open Age</div>
                    <div class="round-details">
                        <ul class="requirement-list">
                            <li class="requirement-item">
                                <i class="fas fa-clock requirement-icon"></i>
                                <span>Duration: Three to five minutes</span>
                            </li>
                            <li class="requirement-item">
                                <i class="fas fa-check-circle requirement-icon"></i>
                                <span>Complete Azan presentation</span>
                            </li>
                        </ul>

                        <div class="assessment-criteria">
                            <div class="assessment-title">Assessment Criteria:</div>
                            <ul class="requirement-list">
                                <li class="requirement-item">
                                    <i class="fas fa-check-circle requirement-icon"></i>
                                    <span>Adherence to proper pronunciation and traditional sequence</span>
                                </li>
                                <li class="requirement-item">
                                    <i class="fas fa-check-circle requirement-icon"></i>
                                    <span>Excellence in vocal quality and melodic presentation</span>
                                </li>
                                <li class="requirement-item">
                                    <i class="fas fa-check-circle requirement-icon"></i>
                                    <span>Mastery of breath control and appropriate pauses</span>
                                </li>
                                <li class="requirement-item">
                                    <i class="fas fa-check-circle requirement-icon"></i>
                                    <span>Effectiveness in conveying spiritual significance</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>
</div>