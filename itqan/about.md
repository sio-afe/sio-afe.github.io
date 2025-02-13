---
layout: tasfiya
title: About إتقان
---

<style>
/* Lead paragraph styles */
.lead {
    font-family: 'Open Sans', sans-serif;
    font-size: 1.25rem;
    font-weight: 300;
    line-height: 1.8;
    color: #07002c;
    text-align: center;
    max-width: 1140px;
    margin: 0 auto;
    padding: 0 2rem;
}

.mb-5 {
    margin-bottom: 3rem;
}

@media (max-width: 768px) {
    .lead {
        font-size: 1.1rem;
        padding: 0 1rem;
    }
    
    .mb-5 {
        margin-bottom: 2rem;
    }
}

@media (max-width: 480px) {
    .lead {
        font-size: 1rem;
        padding: 0 0.8rem;
    }
    
    .mb-5 {
        margin-bottom: 1.5rem;
    }
}

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

/* Add these new decorative styles */
.tree-root {
    background: #ffffff;
    padding: 1rem 2rem;
    border-radius: 8px;
    color: #07002c;
    font-size: 1.5rem;
    text-align: center;
    border: 1px solid rgba(16, 3, 47, 0.1);
    position: relative;
    font-family: 'Almarena Mono', monospace;
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.05);
}

.tree-root::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 17.5c4.142 0 7.5-3.358 7.5-7.5S14.142 2.5 10 2.5 2.5 5.858 2.5 10s3.358 7.5 7.5 7.5z' fill='%23ffd700' fill-opacity='0.05'/%3E%3C/svg%3E");
    opacity: 0.3;
    z-index: 1;
}

.category-box {
    background: linear-gradient(135deg, rgba(16, 3, 47, 0.02) 0%, rgba(16, 3, 47, 0.05) 100%);
    padding: 1.5rem;
    border-radius: 15px;
    text-align: center;
    border: 2px solid rgba(16, 3, 47, 0.1);
    width: 100%;
    position: relative;
    box-shadow: 0 10px 30px rgba(16, 3, 47, 0.08);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    overflow: hidden;
}

.category-box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top right, rgba(16, 3, 47, 0.05), transparent);
    z-index: 0;
}

.category-box:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(16, 3, 47, 0.3);
    box-shadow: 0 15px 35px rgba(16, 3, 47, 0.15);
}

.category-box i {
    font-size: 2.5rem;
    color: #07002c;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
    background: linear-gradient(135deg, #07002c, rgba(16, 3, 47, 0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 4px 6px rgba(16, 3, 47, 0.2));
    transition: all 0.3s ease;
}

.category-box:hover i {
    transform: scale(1.1) rotate(5deg);
    filter: drop-shadow(0 6px 12px rgba(16, 3, 47, 0.3));
}

.category-box h3 {
    font-family: 'Almarena Mono', monospace;
    color: #ffffff;
    margin: 0.5rem 0 1rem 0;
    font-size: 1.4rem;
    background: #07002c;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.15);
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
}

.category-box:hover h3 {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 3, 47, 0.2);
    background: linear-gradient(135deg, #07002c, rgba(16, 3, 47, 0.9));
}

.subcategory-box {
    background: #ffffff;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(16, 3, 47, 0.15);
    box-shadow: 0 8px 20px rgba(16, 3, 47, 0.08);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.subcategory-box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #07002c, rgba(16, 3, 47, 0.5));
    border-radius: 4px 4px 0 0;
}

.subcategory-box:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(16, 3, 47, 0.12);
    border-color: rgba(16, 3, 47, 0.25);
}

.subcategory-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.2rem;
    padding-bottom: 0.8rem;
    border-bottom: 2px solid rgba(16, 3, 47, 0.1);
}

.subcategory-header i {
    color: #07002c;
    font-size: 1.4rem;
    background: linear-gradient(135deg, #07002c, rgba(16, 3, 47, 0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 4px rgba(16, 3, 47, 0.2));
}

.subcategory-header h4 {
    font-family: 'Almarena Mono', monospace;
    color: #07002c;
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
}

.badge {
    background: linear-gradient(135deg, rgba(16, 3, 47, 0.05) 0%, rgba(16, 3, 47, 0.1) 100%);
    padding: 0.6rem 1.4rem;
    border-radius: 25px;
    font-size: 1rem;
    margin-bottom: 1.2rem;
    box-shadow: 0 4px 12px rgba(16, 3, 47, 0.08);
    border: 1px solid rgba(16, 3, 47, 0.15);
    transition: all 0.3s ease;
    color: #07002c;
    font-weight: 500;
    display: inline-block;
}

.badge:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(16, 3, 47, 0.12);
    background: linear-gradient(135deg, rgba(16, 3, 47, 0.08) 0%, rgba(16, 3, 47, 0.15) 100%);
}

.prize-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-top: 1rem;
    padding-left: 1.2rem;
}

.prize-list div {
    color: #07002c;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    transition: all 0.3s ease;
    padding: 0.5rem 0.8rem;
    border-radius: 8px;
    background: rgba(16, 3, 47, 0.02);
}

.prize-list div:hover {
    transform: translateX(8px);
    background: rgba(16, 3, 47, 0.05);
}

.prize-list div i {
    font-size: 1.2rem;
    transition: all 0.4s ease;
    color: #07002c;
}

.prize-list div:hover i {
    transform: rotate(360deg) scale(1.2);
}

/* Add distinctive styles for each competition type */
.category-box:nth-child(1) i {
    background: linear-gradient(135deg, #07002c, #2a1164);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.category-box:nth-child(2) i {
    background: linear-gradient(135deg, #07002c, #1e0d4a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.category-box:nth-child(3) i {
    background: linear-gradient(135deg, #07002c, #150830);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Add animation for icons */
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}

.category-box i {
    animation: float 3s ease-in-out infinite;
}

/* Mobile optimizations */
@media (max-width: 768px) {
    .category-box {
        padding: 1.2rem;
    }
    
    .category-box i {
        font-size: 2rem;
    }
    
    .category-box h3 {
        font-size: 1.2rem;
        padding: 0.8rem 1.2rem;
    }
    
    .subcategory-box {
        padding: 1.2rem;
    }
    
    .badge {
        padding: 0.5rem 1.2rem;
        font-size: 0.9rem;
    }
    
    .prize-list div {
        font-size: 0.9rem;
        padding: 0.4rem 0.6rem;
    }
}

/* Add animation for the lines */
.tree-level.main-categories::before,
.category-column::before,
    .category-box::after,
.subcategories::before,
.subcategory-box:not(:last-child)::after {
    animation: lineGlow 2s infinite alternate;
}

@keyframes lineGlow {
    from {
        opacity: 0.3;
    }
    to {
        opacity: 0.6;
    }
}

.overview-box, .goal-box {
    background: #ffffff;
    padding: 3rem;
    margin: 1rem auto;
    width: 100%;
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.05);
    transition: transform 0.3s ease;
    position: relative;
    border: 1px solid rgba(16, 3, 47, 0.1);
    border-radius: 8px;
}

.overview-box:hover, .goal-box:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(16, 3, 47, 0.05);
}

.overview-box h2, .goal-box h2 {
    font-family: 'Almarena Mono', monospace;
    color: #07002c;
    margin: 0 0 1.5rem 0;
    font-size: 1.8rem;
    padding: 0.8rem;
    background: rgba(16, 3, 47, 0.03);
    text-align: center;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.05);
    border: 1px solid rgba(16, 3, 47, 0.1);
}

.overview-box p, .goal-box p {
    font-family: 'Open Sans', sans-serif;
    color: #07002c;
    text-shadow: none;
    text-align: center;
    font-size: 1.1rem;
    line-height: 1.8;
}

.overview-box i, .goal-box i {
    color: #07002c;
    font-size: 1.8rem;
        margin-bottom: 1rem;
    display: block;
    text-align: center;
}

.important-note {
    background: rgba(16, 3, 47, 0.03);
    border-left: 4px solid #07002c;
    padding: 1.5rem;
    margin: 2rem auto;
    border-radius: 0 8px 8px 0;
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.08);
    transition: all 0.3s ease;
}

.important-note:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 3, 47, 0.12);
    background: rgba(16, 3, 47, 0.05);
}

.important-note i {
    color: #07002c;
    font-size: 1.2rem;
    margin-right: 0.5rem;
    animation: pulse 2s infinite;
}

.important-note strong {
    font-family: 'Almarena Mono', monospace;
    color: #07002c;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
        font-size: 1.1rem;
    margin-bottom: 0.5rem;
}

.important-note p {
    font-family: 'Open Sans', sans-serif;
    margin: 0.5rem 0 0 0;
    text-align: left;
    width: 100%;
    color: #07002c;
        font-size: 1rem;
    line-height: 1.6;
    padding-left: 1.7rem;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
}

@media (max-width: 768px) {
    .important-note {
        padding: 1rem;
        margin: 1.5rem auto;
    }
    
    .important-note strong {
        font-size: 1rem;
    }

    .important-note p {
        font-size: 0.9rem;
        padding-left: 1.5rem;
    }
}

.content-section h2 {
    font-family: 'Almarena Mono', monospace;
    color: #07002c;
    font-size: 1.8rem;
    margin-bottom: 2rem;
    text-align: center;
    background: #ffffff;
    padding: 1.2rem 2rem;
        border-radius: 15px;
        position: relative;
    border: 2px solid #07002c;
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.08);
        overflow: hidden;
}

.content-section h2::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
    width: 6px;
    height: 100%;
    background: #07002c;
    border-radius: 3px 0 0 3px;
}

.content-section h2::after {
        content: '';
        position: absolute;
    bottom: 0;
    left: 6px;
    width: calc(100% - 6px);
        height: 2px;
    background: linear-gradient(90deg, #07002c, rgba(16, 3, 47, 0.1));
}

.content-section p {
    font-family: 'Open Sans', sans-serif;
    color: #07002c;
    line-height: 1.8;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    text-align: center;
}

@media (max-width: 768px) {
    .content-section h2 {
        font-size: 1.4rem;
        padding: 1rem 1.5rem;
        margin-bottom: 1.5rem;
    }
}

@media (max-width: 480px) {
    .content-section h2 {
        font-size: 1.2rem;
        padding: 0.8rem 1.2rem;
        margin-bottom: 1rem;
    }
}

/* Add styles for Juz names and text */
.juz-name, 
.juz-text,
.category-name,
.subcategory-name,
.node-content,
.flow-text {
    color: #07002c;
}

.node-title,
.node-description,
.flow-node-text {
    color: #07002c;
}

.tree-node h3,
.tree-node h4,
.tree-node p {
    color: #07002c;
}

/* Update text colors for competition details */
.competition-details {
    color: #07002c;
}

.comp-type {
    color: #07002c;
}

.prize-list div {
    color: #07002c;
}

/* Add margin utility classes */
.mt-5 {
    margin-top: 3rem !important;
}

.mb-5 {
    margin-bottom: 3rem !important;
}

.mb-4 {
    margin-bottom: 2rem !important;
}

@media (max-width: 768px) {
    .mt-5 {
        margin-top: 2rem !important;
    }
    
    .mb-5 {
        margin-bottom: 2rem !important;
    }
    
    .mb-4 {
        margin-bottom: 1.5rem !important;
    }
}

/* Add styles for the goal section */
.goal-highlight {
    background: linear-gradient(135deg, rgba(16, 3, 47, 0.02) 0%, rgba(16, 3, 47, 0.05) 100%);
    border: 2px solid rgba(16, 3, 47, 0.1);
    border-radius: 20px;
    padding: 2.5rem;
    margin: 3rem auto;
    max-width: 1000px;
        position: relative;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(16, 3, 47, 0.08);
}

.goal-highlight::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
    width: 6px;
    height: 100%;
    background: #07002c;
    border-radius: 3px 0 0 3px;
}

.goal-highlight h2 {
    font-family: 'Almarena Mono', monospace;
    color: #07002c;
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
        display: flex;
    flex-direction: column;
        align-items: center;
    gap: 1rem;
    justify-content: center;
    text-align: center;
}

.goal-highlight h2 i {
    font-size: 2.5rem;
    background: linear-gradient(45deg, #957718, #e2c27d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(2px 2px 4px rgba(149, 119, 24, 0.3));
    margin-bottom: 0.5rem;
}

.goal-highlight p {
    font-family: 'Open Sans', sans-serif;
    font-size: 1.2rem;
    line-height: 1.8;
    color: #07002c;
    margin: 0;
    text-align: center;
}

.goal-points {
    list-style: none;
    padding: 0;
    margin: 1.5rem auto 0;
    max-width: 800px;
}

.goal-points li {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-left: 1rem;
        position: relative;
}

.goal-points li i {
    color: #957718;
    font-size: 1.2rem;
    margin-top: 0.2rem;
}

.goal-points li span {
    flex: 1;
    font-size: 1.1rem;
    line-height: 1.6;
}

@media (max-width: 768px) {
    .goal-highlight {
        padding: 2rem;
        margin: 2rem auto;
    }
    
    .goal-highlight h2 {
        font-size: 1.5rem;
    }
    
    .goal-highlight p {
        font-size: 1.1rem;
    }
    
    .goal-points li span {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .goal-highlight {
        padding: 1.5rem;
    margin: 1.5rem auto;
    }
    
    .goal-highlight h2 {
        font-size: 1.3rem;
    }
    
    .goal-highlight p {
        font-size: 1rem;
    }

    .goal-points li span {
        font-size: 0.95rem;
    }
}
</style>

<div class="islamic-decoration">
    <h1>About <span class="thuluth-text">إتقان</span></h1>
</div>

<div class="about-content">
    <p class="lead mb-5">
        Muslims voices are unified from all around the islamic world raising the call to prayer (Azan) and reciting verses from the holy Quran in aesthetics, precised and special voices and maqamat. To spread the holy Quran knowledge and glorify the call to prayer through <span class="thuluth-text">إتقان</span> competition And to raise the competitive soul between the contestants whom gifted with the best voices, reciting and maqamat talents.
    </p>

    <div class="goal-highlight">
        <h2><i class="fas fa-bullseye"></i>  Goals</h2>
        <p>The <span class="thuluth-text">إتقان</span> competition aims to achieve several noble objectives:</p>
        <ul class="goal-points">
            <li>
                <i class="fas fa-star"></i>
                <span>Highlight beautiful voices in reciting the Holy Quran and raising the call to prayer</span>
            </li>
            <li>
                <i class="fas fa-star"></i>
                <span>Glorify the Holy Quran and the call to prayer through aesthetic recitation</span>
            </li>
            <li>
                <i class="fas fa-star"></i>
                <span>Highlight talents in the field of Quranic recitation and maqamat</span>
            </li>
            <li>
                <i class="fas fa-star"></i>
                <span>Enhance the aesthetics of voices and maqamat for Quran reciters and muezzins</span>
            </li>
        </ul>
    </div>

            <div class="important-note">
                <strong><i class="fas fa-exclamation-circle"></i>Important:</strong>
                <p>Each participant can only register and compete in one category of their choice.</p>
            </div>

   

    <section class="content-section">
        <h2>Competition Structure</h2>
        <div class="vertical-tree">
            <!-- Root Node -->
            <div class="tree-root">
                <span class="thuluth-text">إتقان</span> Competition
            </div>
            
            <!-- Main Categories -->
            <div class="tree-level main-categories">
                <!-- Hifz Category -->
                <div class="category-column">
                    <div class="category-box">
                        <i class="fas fa-quran"></i>
                        <h3>Hifz Competition</h3>
                    </div>
                    
                    <div class="subcategories">
                        <!-- Under 12 -->
                        <div class="subcategory-box">
                            <div class="subcategory-header">
                <i class="fas fa-child"></i>
                                <h4>Under 12</h4>
                            </div>
                            <div class="competition-details">
                                <div class="comp-type">
                                    <span class="badge">Juz 30</span>
                                    <div class="prize-list">
                                        <div><i class="fas fa-trophy gold"></i> First Prize</div>
                                        <div><i class="fas fa-trophy silver"></i> Second Prize</div>
                                        <div><i class="fas fa-trophy bronze"></i> Third Prize</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Open Age -->
                        <div class="subcategory-box">
                            <div class="subcategory-header">
                                <i class="fas fa-users"></i>
                                <h4>Open Age</h4>
                            </div>
                            <div class="competition-details">
                                <div class="comp-type">
                                    <span class="badge">Juz 30 and Juz 29</span>
                                    <div class="prize-list">
                                        <div><i class="fas fa-trophy gold"></i> First Prize</div>
                                        <div><i class="fas fa-trophy silver"></i> Second Prize</div>
                                        <div><i class="fas fa-trophy bronze"></i> Third Prize</div>
                                    </div>
                                </div>
                                <div class="comp-type">
                                    <span class="badge">Full Quran</span>
                                    <div class="prize-list">
                                        <div><i class="fas fa-trophy gold"></i> First Prize</div>
                                        <div><i class="fas fa-trophy silver"></i> Second Prize</div>
                                        <div><i class="fas fa-trophy bronze"></i> Third Prize</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tarteel and Azan Category -->
                <div class="category-column">
                    <!-- Tarteel Competition -->
                    <div class="category-box mb-4">
                        <i class="fas fa-microphone"></i>
                        <h3>Tarteel Competition</h3>
                    </div>
                    
                    <div class="subcategories mb-5">
                        <div class="subcategory-box">
                            <div class="subcategory-header">
                                <i class="fas fa-users"></i>
                                <h4>Open Age</h4>
                            </div>
                            <div class="competition-details">
                                <div class="comp-type">
                                    <span class="badge">Beautiful Recitation</span>
                                    <div class="prize-list">
                                        <div><i class="fas fa-trophy gold"></i> First Prize</div>
                                        <div><i class="fas fa-trophy silver"></i> Second Prize</div>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

                    <!-- Azan Competition -->
                    <div class="category-box mt-5">
                <i class="fas fa-mosque"></i>
                        <h3>Azan Competition</h3>
                    </div>
                    
                    <div class="subcategories">
                        <div class="subcategory-box">
                            <div class="subcategory-header">
                                <i class="fas fa-users"></i>
                                <h4>Open Age</h4>
                            </div>
                            <div class="competition-details">
                                <div class="comp-type">
                                    <span class="badge">Call to Prayer</span>
                                    <div class="prize-list">
                                        <div><i class="fas fa-trophy gold"></i> First Prize</div>
                                        <div><i class="fas fa-trophy silver"></i> Second Prize</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
            </div>
        </div>
    </section>

    <section class="content-section">
        <h2>Competition Stages</h2>
        <div class="vertical-tree">
            <!-- Root Node -->
            <div class="tree-root">
                <span class="thuluth-text">إتقان</span> Competition Process
            </div>
            
            <!-- Main Categories -->
            <div class="tree-level main-categories">
                <!-- Stage 1 -->
                <div class="category-column">
                    <div class="category-box">
                        <i class="fas fa-flag-checkered"></i>
                        <h3>Stage 1: Preliminary Rounds</h3>
                    </div>
                    
                    <div class="subcategories">
                        <!-- School Track -->
                        <div class="subcategory-box">
                            <div class="subcategory-header">
                                <i class="fas fa-school"></i>
                                <h4>School Track</h4>
                            </div>
                            <div class="competition-details">
                                <div class="comp-type">
                                    <span class="badge">School Selection</span>
                                    <div class="prize-list">
                                        <div><i class="fas fa-check-circle"></i> 10 Islamic Schools</div>
                                        <div><i class="fas fa-check-circle"></i> Internal Selection</div>
                                        <div><i class="fas fa-check-circle"></i> 2 Best per Category</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Individual Track -->
                        <div class="subcategory-box">
                            <div class="subcategory-header">
                                <i class="fas fa-user"></i>
                                <h4>Individual Track</h4>
                            </div>
                            <div class="competition-details">
                                <div class="comp-type">
                                    <span class="badge">Open Selection</span>
                                    <div class="prize-list">
                                        <div><i class="fas fa-check-circle"></i> Open Registration</div>
                                        <div><i class="fas fa-check-circle"></i> Preliminary by إتقان</div>
                                    </div>
                                </div>
            </div>
            </div>
            </div>
        </div>

                <!-- Stage 2 -->
                <div class="category-column">
                    <div class="category-box">
                        <i class="fas fa-trophy"></i>
                        <h3>Stage 2: Finals</h3>
                    </div>
                    
                    <div class="subcategories">
                        <!-- Hifz Finals -->
                        <div class="subcategory-box">
                            <div class="subcategory-header">
                                <i class="fas fa-quran"></i>
                                <h4>Hifz Finals</h4>
                            </div>
                            <div class="competition-details">
                                <div class="comp-type">
                                    <span class="badge">Finalists</span>
                                    <div class="prize-list">
                                        <div><i class="fas fa-users"></i> 24 Max per Category</div>
                                        <div><i class="fas fa-school"></i> 20 from Schools</div>
                                        <div><i class="fas fa-user"></i> 4 from Individual</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tarteel & Azan Finals -->
                        <div class="subcategory-box">
                            <div class="subcategory-header">
                                <i class="fas fa-microphone"></i>
                                <h4>Tarteel & Azan Finals</h4>
                            </div>
                            <div class="competition-details">
                                <div class="comp-type">
                                    <span class="badge">Finalists</span>
                                    <div class="prize-list">
                                        <div><i class="fas fa-users"></i> 12 Participants Each</div>
                                        <div><i class="fas fa-school"></i> 10 from Schools</div>
                                        <div><i class="fas fa-user"></i> 2 Individuals</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
            </div>
        </div>
    </section>
</div>

<style>
.about-content {
    max-width: 1140px;
    margin: 0 auto;
    padding: 0 1rem;
    overflow-x: hidden;
}

.content-section {
    width: 100%;
    max-width: 100%;
    margin: 4rem 0;
    padding: 0;
}

.vertical-tree {
    width: 100%;
    max-width: 100%;
    padding: 1rem;
    margin: 0;
    overflow: visible;
}

.tree-level.main-categories {
    width: 100%;
    max-width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 3rem;
    justify-content: center;
    padding: 2rem 0;
}

.category-column {
    flex: 1;
    min-width: 300px;
    max-width: 400px;
    margin: 0;
    padding: 0.5rem;
}

.category-box {
    width: 100%;
    margin: 0 0 2.5rem 0;
    padding: 2rem;
}

.subcategories {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.subcategory-box {
    margin: 0;
    padding: 2rem;
}

.tree-root {
    margin-bottom: 3rem;
}

@media (max-width: 768px) {
    .tree-level.main-categories {
        gap: 2rem;
        padding: 1rem 0;
    }

    .category-column {
        padding: 0.25rem;
        min-width: 280px;
    }

    .category-box {
        padding: 1.5rem;
        margin: 0 0 2rem 0;
    }

    .subcategories {
        gap: 1.5rem;
    }

    .subcategory-box {
        padding: 1.5rem;
    }

    .content-section {
        margin: 3rem 0;
    }

    .tree-root {
        margin-bottom: 2rem;
    }
}

@media (max-width: 480px) {
    .tree-level.main-categories {
        gap: 1.5rem;
        padding: 0.5rem 0;
    }

    .category-box {
        padding: 1.25rem;
        margin: 0 0 1.5rem 0;
    }

    .subcategories {
        gap: 1.25rem;
    }

    .subcategory-box {
        padding: 1.25rem;
    }

    .content-section {
        margin: 2rem 0;
    }
}

.tree-root {
    background: #ffffff;
    padding: 1rem 2rem;
    border-radius: 8px;
    color: #07002c;
    font-size: 1.5rem;
    text-align: center;
    border: 1px solid rgba(16, 3, 47, 0.1);
    position: relative;
    font-family: 'Almarena Mono', monospace;
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.05);
}

.tree-root::after {
    content: '';
    position: absolute;
    bottom: -2rem;
    left: 50%;
    width: 2px;
    height: 2rem;
    background: rgba(16, 3, 47, 0.3);
}

.tree-level {
    display: flex;
    justify-content: center;
    gap: 3rem;
    width: 100%;
    position: relative;
}

.tree-level::before {
    content: '';
    position: absolute;
    top: -2rem;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 2px;
    background: rgba(16, 3, 47, 0.3);
}

.category-box {
    background: linear-gradient(135deg, rgba(16, 3, 47, 0.02) 0%, rgba(16, 3, 47, 0.05) 100%);
    padding: 1.5rem;
    border-radius: 15px;
    text-align: center;
    border: 2px solid rgba(16, 3, 47, 0.1);
    width: 100%;
    position: relative;
    box-shadow: 0 10px 30px rgba(16, 3, 47, 0.08);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    overflow: hidden;
}

.category-box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top right, rgba(16, 3, 47, 0.05), transparent);
    z-index: 0;
}

.category-box:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(16, 3, 47, 0.3);
    box-shadow: 0 15px 35px rgba(16, 3, 47, 0.15);
}

.category-box i {
    font-size: 2.5rem;
    color: #07002c;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
    background: linear-gradient(135deg, #07002c, rgba(16, 3, 47, 0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 4px 6px rgba(16, 3, 47, 0.2));
    transition: all 0.3s ease;
}

.category-box:hover i {
    transform: scale(1.1) rotate(5deg);
    filter: drop-shadow(0 6px 12px rgba(16, 3, 47, 0.3));
}

.category-box h3 {
    font-family: 'Almarena Mono', monospace;
    color: #ffffff;
    margin: 0.5rem 0 1rem 0;
    font-size: 1.4rem;
    background: #07002c;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.15);
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
}

.category-box:hover h3 {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 3, 47, 0.2);
    background: linear-gradient(135deg, #07002c, rgba(16, 3, 47, 0.9));
}

.subcategory-box {
    background: #ffffff;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(16, 3, 47, 0.15);
    box-shadow: 0 8px 20px rgba(16, 3, 47, 0.08);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.subcategory-box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #07002c, rgba(16, 3, 47, 0.5));
    border-radius: 4px 4px 0 0;
}

.subcategory-box:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(16, 3, 47, 0.12);
    border-color: rgba(16, 3, 47, 0.25);
}

.subcategory-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.2rem;
    padding-bottom: 0.8rem;
    border-bottom: 2px solid rgba(16, 3, 47, 0.1);
}

.subcategory-header i {
    color: #07002c;
    font-size: 1.4rem;
    background: linear-gradient(135deg, #07002c, rgba(16, 3, 47, 0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 4px rgba(16, 3, 47, 0.2));
}

.subcategory-header h4 {
    font-family: 'Almarena Mono', monospace;
    color: #07002c;
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
}

.competition-details {
    padding-left: 1rem;
}

.comp-type {
    margin-bottom: 1.5rem;
}

.comp-type:last-child {
    margin-bottom: 0;
}

.prize-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-top: 1rem;
    padding-left: 1.2rem;
}

.prize-list div {
    font-family: 'Open Sans', sans-serif;
    color: #07002c;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    transition: all 0.3s ease;
    padding: 0.5rem 0.8rem;
    border-radius: 8px;
    background: rgba(16, 3, 47, 0.02);
}

.prize-list div:hover {
    transform: translateX(8px);
    background: rgba(16, 3, 47, 0.05);
}

.prize-list div i {
    font-size: 1.2rem;
    transition: all 0.4s ease;
    color: #07002c;
}

.prize-list div:hover i {
    transform: rotate(360deg) scale(1.2);
}

.flow-tree {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
    padding: 2rem 1rem;
    position: relative;
}

.flow-root {
    background: linear-gradient(45deg, rgba(16, 3, 47, 0.1), rgba(16, 3, 47, 0.2));
    padding: 1rem 2rem;
    border-radius: 50px;
    color: #07002c;
    font-size: 1.5rem;
    text-align: center;
    border: 1px solid rgba(16, 3, 47, 0.2);
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.1);
    position: relative;
    max-width: 400px;
    width: 90%;
}

.flow-root::after {
    content: '';
    position: absolute;
    bottom: -3rem;
    left: 50%;
    width: 2px;
    height: 3rem;
    background: linear-gradient(180deg, rgba(16, 3, 47, 0.3), transparent);
}

.flow-branch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    width: 100%;
    position: relative;
}

.flow-split {
    display: flex;
    justify-content: center;
    gap: 2rem;
    width: 100%;
    position: relative;
    flex-wrap: wrap;
}

.flow-split::before {
    content: '';
    position: absolute;
    top: -2rem;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(16, 3, 47, 0.3), transparent);
}

.flow-path {
    flex: 1;
    min-width: 250px;
    max-width: 300px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.flow-path::before {
    content: '';
    position: absolute;
    top: -2rem;
    left: 50%;
    width: 2px;
    height: 2rem;
    background: linear-gradient(180deg, rgba(16, 3, 47, 0.3), transparent);
}

.flow-node {
    background: linear-gradient(135deg, rgba(16, 3, 47, 0.05) 0%, rgba(16, 3, 47, 0.1) 100%);
    padding: 1.5rem;
    border-radius: 15px;
    text-align: center;
    border: 1px solid rgba(16, 3, 47, 0.15);
    box-shadow: 0 4px 15px rgba(16, 3, 47, 0.1);
    width: 100%;
    transition: all 0.3s ease;
}

.flow-node:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(16, 3, 47, 0.15);
}

.flow-node i {
    font-size: 1.5rem;
    color: #07002c;
    margin-bottom: 0.5rem;
}

.flow-node h3, .flow-node h4 {
    color: #07002c;
    margin: 0.5rem 0;
}

.flow-node h3 {
    font-size: 1.3rem;
}

.flow-node h4 {
    font-size: 1.1rem;
}

.primary-node {
    background: linear-gradient(135deg, rgba(16, 3, 47, 0.1) 0%, rgba(16, 3, 47, 0.15) 100%);
    max-width: 400px;
    width: 90%;
}

.node-details {
    margin-top: 1rem;
    text-align: left;
}

.node-details ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.node-details ul li {
    font-family: 'Open Sans', sans-serif;
    color: #07002c;
    margin: 0.5rem 0;
    font-size: 0.9rem;
    position: relative;
    padding-left: 1.2rem;
}

.node-details ul li::before {
    content: '•';
    color: #07002c;
    position: absolute;
    left: 0;
}

@media (max-width: 768px) {
    .flow-split {
        flex-direction: column;
        align-items: center;
        gap: 3rem;
    }

    .flow-path {
        width: 100%;
    }

    .flow-split::before {
        width: 2px;
        height: 100%;
        top: 0;
        background: linear-gradient(180deg, rgba(16, 3, 47, 0.3), transparent);
    }

    .flow-path::before {
        top: -3rem;
        height: 3rem;
    }

    .primary-node {
        width: 100%;
    }
}

.section-title {
    color: #07002c;
    font-family: 'Almarena Mono', monospace;
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    position: relative;
    display: inline-block;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(16, 3, 47, 0.1);
    border-radius: 2px;
}
</style> 