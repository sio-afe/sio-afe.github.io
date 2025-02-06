---
layout: tasfiya
title: About إتقان
---

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

@media (max-width: 768px) {
    .thuluth-text {
        font-size: 1.5em;
    }
}

/* Add these new decorative styles */
.tree-root {
    background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.2));
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.2);
    position: relative;
    overflow: hidden;
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
}

.category-box {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 215, 0, 0.1) 100%);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.15);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.category-box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 17.5c4.142 0 7.5-3.358 7.5-7.5S14.142 2.5 10 2.5 2.5 5.858 2.5 10s3.358 7.5 7.5 7.5z' fill='%23ffd700' fill-opacity='0.05'/%3E%3C/svg%3E");
    opacity: 0.1;
}

.category-box:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.15);
}

.subcategory-box {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.06) 100%);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.1);
    transition: all 0.3s ease;
}

.subcategory-box:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.1);
}

.badge {
    background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.2));
    padding: 0.4rem 1.2rem;
    border-radius: 20px;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.15);
    transition: all 0.3s ease;
}

.badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.15);
}

.prize-list div {
    transition: all 0.3s ease;
}

.prize-list div:hover {
    transform: translateX(5px);
}

.prize-list div i {
    transition: all 0.3s ease;
}

.prize-list div:hover i {
    transform: rotate(360deg);
}

.stage-box {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 215, 0, 0.1) 100%);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.15);
    position: relative;
    overflow: hidden;
}

.stage-box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 17.5c4.142 0 7.5-3.358 7.5-7.5S14.142 2.5 10 2.5 2.5 5.858 2.5 10s3.358 7.5 7.5 7.5z' fill='%23ffd700' fill-opacity='0.05'/%3E%3C/svg%3E");
    opacity: 0.1;
}

.stage-box:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.15);
}

.stage-header i {
    transition: all 0.3s ease;
}

.stage-box:hover .stage-header i {
    transform: scale(1.1);
}

.stage-group ul li {
    transition: all 0.3s ease;
}

.stage-group ul li:hover {
    transform: translateX(5px);
    color: rgba(255, 255, 255, 1);
}

.stage-group ul li::before {
    transition: all 0.3s ease;
}

.stage-group ul li:hover::before {
    transform: scale(1.5);
}

/* Add decorative connectors */
.tree-level::before {
    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
}

.category-box::after {
    background: linear-gradient(180deg, rgba(255, 215, 0, 0.3), transparent);
}

.tree-root::after {
    background: linear-gradient(180deg, rgba(255, 215, 0, 0.3), transparent);
}

/* Add glowing effect to icons */
.category-box i,
.stage-header i,
.subcategory-header i {
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* Add shimmer animation to borders */
@keyframes borderShimmer {
    0% { border-color: rgba(255, 215, 0, 0.1); }
    50% { border-color: rgba(255, 215, 0, 0.3); }
    100% { border-color: rgba(255, 215, 0, 0.1); }
}

.category-box,
.subcategory-box,
.stage-box {
    animation: borderShimmer 3s infinite;
}

/* Enhance mobile styles */
@media (max-width: 768px) {
    .tree-root,
    .category-box,
    .subcategory-box,
    .stage-box {
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    }
    
    .category-column:not(:last-child) {
        border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        position: relative;
    }
    
    .category-column:not(:last-child)::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
    }
}

@media (max-width: 768px) {
    .content-section {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
    }

    .content-section h2 {
        font-size: 1.5rem;
        text-align: center;
    }

    .content-section p {
        font-size: 1rem;
        padding: 0 0.5rem;
    }

    /* Tree Structure Mobile Fixes */
    .vertical-tree, .flow-tree {
        padding: 1rem 0.5rem;
        gap: 1.5rem;
    }

    .tree-root, .flow-root {
        font-size: 1.2rem;
        padding: 0.8rem 1.5rem;
        width: 85%;
    }

    .tree-level, .flow-split {
        flex-direction: column;
        align-items: center;
        gap: 2.5rem;
        padding: 0 1rem;
    }

    .category-column, .flow-path {
        width: 100%;
        max-width: none;
        margin-bottom: 1rem;
    }

    .category-box, .flow-node {
        max-width: 300px;
        margin: 0 auto;
    }

    .subcategories {
        max-width: 300px;
        margin: 0 auto;
    }

    /* Improve connecting lines for mobile */
    .tree-level::before,
    .flow-split::before {
        width: 2px;
        height: 100%;
        left: 50%;
        transform: translateX(-50%);
        top: -1.5rem;
    }

    .category-box::after,
    .flow-path::before {
        height: 1.5rem;
        bottom: -1.5rem;
    }

    /* Improve node styling for mobile */
    .subcategory-box, .flow-node {
        padding: 1rem;
        margin-bottom: 0.5rem;
    }

    .subcategory-header {
        margin-bottom: 0.8rem;
    }

    .subcategory-header h4,
    .flow-node h4 {
        font-size: 1rem;
    }

    .competition-details,
    .node-details {
        padding-left: 0.5rem;
    }

    .comp-type {
        margin-bottom: 1rem;
    }

    .badge {
        font-size: 0.85rem;
        padding: 0.3rem 1rem;
    }

    .prize-list {
        gap: 0.4rem;
        padding-left: 0.5rem;
    }

    .prize-list div {
        font-size: 0.85rem;
    }

    /* Fix flow tree specific mobile issues */
    .flow-node {
        margin-bottom: 0;
    }

    .primary-node {
        margin-bottom: 1rem;
    }

    .node-details ul li {
        font-size: 0.85rem;
        margin: 0.4rem 0;
    }

    /* Add better spacing between sections */
    .category-column:not(:last-child),
    .flow-path:not(:last-child) {
        margin-bottom: 2.5rem;
    }

    /* Improve visual hierarchy */
    .category-box i,
    .flow-node i {
        font-size: 1.3rem;
        margin-bottom: 0.3rem;
    }

    .category-box h3,
    .flow-node h3 {
        font-size: 1.1rem;
    }
}

/* Extra small screens */
@media (max-width: 380px) {
    .tree-root, .flow-root {
        font-size: 1.1rem;
        padding: 0.7rem 1.2rem;
        width: 90%;
    }

    .category-box, .flow-node {
        padding: 0.8rem;
    }

    .subcategory-header h4,
    .flow-node h4 {
        font-size: 0.9rem;
    }

    .badge {
        font-size: 0.8rem;
        padding: 0.25rem 0.8rem;
    }

    .prize-list div,
    .node-details ul li {
        font-size: 0.8rem;
    }

    .category-box i,
    .flow-node i {
        font-size: 1.2rem;
    }

    .category-box h3,
    .flow-node h3 {
        font-size: 1rem;
    }
}

@media (max-width: 768px) {
    .flow-tree {
        padding: 0;
    }

    /* Remove all connecting lines */
    .flow-root::after,
    .flow-split::before,
    .flow-path::before,
    .tree-root::after,
    .tree-level::before,
    .category-box::after {
        display: none;
    }

    .flow-root {
        width: 100%;
        background: linear-gradient(45deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.2));
        margin: 0;
        padding: 1.5rem;
        text-align: center;
        border-radius: 0;
    }

    .flow-branch {
        padding: 1rem;
        margin: 0;
    }

    .flow-split {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 0.5rem;
    }

    .flow-path {
        width: 100%;
        animation: slideUp 0.3s ease-out forwards;
        opacity: 0;
    }

    .flow-path:nth-child(1) { animation-delay: 0.1s; }
    .flow-path:nth-child(2) { animation-delay: 0.2s; }
    .flow-path:nth-child(3) { animation-delay: 0.3s; }

    .primary-node {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
        border-radius: 15px;
        padding: 1.2rem;
        margin: 1rem auto;
        border: 1px solid rgba(255, 215, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 350px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .flow-node {
        background: rgba(255, 215, 0, 0.05);
        border-radius: 15px;
        padding: 1.5rem;
        border: 1px solid rgba(255, 215, 0, 0.1);
        position: relative;
        overflow: hidden;
        transition: transform 0.3s ease;
        margin: 0 auto;
        max-width: 350px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .flow-node:active {
        transform: scale(0.98);
    }

    .node-details {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        padding: 1rem;
        margin-top: 1rem;
    }

    .node-details ul {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .node-details ul li {
        position: relative;
        padding-left: 1.2rem;
        margin: 0.5rem 0;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.9);
    }

    .node-details ul li::before {
        content: '→';
        position: absolute;
        left: 0;
        color: #ffd700;
    }

    /* Add section separators */
    .flow-branch:not(:last-child) {
        border-bottom: 1px solid rgba(255, 215, 0, 0.1);
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
    }

    /* Enhance card appearance */
    .flow-node::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(to right, #ffd700, transparent);
    }

    .flow-node h4 {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        color: #ffd700;
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        border-bottom: 1px solid rgba(255, 215, 0, 0.1);
        padding-bottom: 0.8rem;
    }
}

/* Extra small screens */
@media (max-width: 380px) {
    .primary-node {
        padding: 1rem;
        margin: 0.5rem auto;
    }

    .flow-node {
        padding: 1.2rem;
        margin: 0 auto;
    }

    .node-details {
        padding: 0.8rem;
    }

    .node-details ul li {
        font-size: 0.85rem;
    }
}
</style>

<div class="islamic-decoration">
    <h1>About <span class="thuluth-text">إتقان</span></h1>
</div>

<div class="about-content">
    <section class="content-section">
        <h2>Overview</h2>
        <p>
            Muslims voices are unified from all around the islamic world raising the call to prayer (Adhan) and reciting verses from the holy Quran in aesthetics, precised and special voices and maqamat.
            To spread the holy Quran knowledge and glorify the call to prayer through <span class="thuluth-text">إتقان</span> competition
            And to raise the competitive soul between the contestants whom gifted with the best voices, reciting and maqamat talents.
        </p>
    </section>

    <section class="content-section">
        <h2>Goal of the Competition</h2>
        <p>
            The competition, aims to highlight the beautiful voices in reciting the Holy Quran and raising the call to prayer. It is also part of the initiative that seeks to highlight talents in their fields. This competition specifically stems from the principle of glorifying the Holy Quran and the call to prayer and highlighting the aesthetics of the voices and maqamat (a system of scales, habitual melodic phrases, modulation possibilities, ornamentation norms, and aesthetic conventions) for Quran reciters and muezzins.
        </p>
    </section>

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
                                    <span class="badge">1 Juz</span>
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
                                    <span class="badge">2 Juz</span>
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

                <!-- Tarteel Category -->
                <div class="category-column">
                    <div class="category-box">
                        <i class="fas fa-microphone"></i>
                        <h3>Tarteel Competition</h3>
                    </div>
                    
                    <div class="subcategories">
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
            </div>

                <!-- Adhan Category -->
                <div class="category-column">
                    <div class="category-box">
                <i class="fas fa-mosque"></i>
                        <h3>Adhan Competition</h3>
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
                                    <span class="badge">Participants</span>
                                    <div class="prize-list">
                                        <div><i class="fas fa-users"></i> 20 Max per Category</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tarteel & Adhan Finals -->
                        <div class="subcategory-box">
                            <div class="subcategory-header">
                                <i class="fas fa-microphone"></i>
                                <h4>Tarteel & Adhan Finals</h4>
                            </div>
                            <div class="competition-details">
                                <div class="comp-type">
                                    <span class="badge">Participants</span>
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
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;
}

.content-section {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.1);
}

.content-section:last-child {
    border-bottom: none;
}

.content-section h2 {
    color: #ffd700;
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    position: relative;
}

.content-section p {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.8;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    text-align: center;
}

.vertical-tree {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 2rem 1rem;
    position: relative;
}

.tree-root {
    background: rgba(255, 215, 0, 0.1);
    padding: 1rem 2rem;
    border-radius: 50px;
    color: #ffd700;
    font-size: 1.5rem;
    text-align: center;
    border: 1px solid rgba(255, 215, 0, 0.2);
    position: relative;
}

.tree-root::after {
    content: '';
    position: absolute;
    bottom: -2rem;
    left: 50%;
    width: 2px;
    height: 2rem;
    background: rgba(255, 215, 0, 0.3);
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
    background: rgba(255, 215, 0, 0.3);
}

.category-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    flex: 1;
    position: relative;
}

.category-box {
    background: rgba(255, 215, 0, 0.05);
    padding: 1rem;
    border-radius: 10px;
    text-align: center;
    border: 1px solid rgba(255, 215, 0, 0.1);
    width: 100%;
    position: relative;
}

.category-box::after {
    content: '';
    position: absolute;
    bottom: -2rem;
    left: 50%;
    width: 2px;
    height: 2rem;
    background: rgba(255, 215, 0, 0.3);
}

.category-box i {
    font-size: 1.5rem;
    color: #ffd700;
    margin-bottom: 0.5rem;
}

.category-box h3 {
    color: #ffd700;
    margin: 0;
    font-size: 1.2rem;
}

.subcategories {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
}

.subcategory-box {
    background: rgba(255, 255, 255, 0.03);
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid rgba(255, 215, 0, 0.1);
}

.subcategory-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.1);
}

.subcategory-header i {
    color: #ffd700;
    font-size: 1rem;
}

.subcategory-header h4 {
    color: #ffd700;
    margin: 0;
    font-size: 1rem;
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
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding-left: 1rem;
}

.prize-list div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
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
    background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.2));
    padding: 1rem 2rem;
    border-radius: 50px;
    color: #ffd700;
    font-size: 1.5rem;
    text-align: center;
    border: 1px solid rgba(255, 215, 0, 0.2);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.1);
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
    background: linear-gradient(180deg, rgba(255, 215, 0, 0.3), transparent);
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
    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
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
    background: linear-gradient(180deg, rgba(255, 215, 0, 0.3), transparent);
}

.flow-node {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 215, 0, 0.1) 100%);
    padding: 1.5rem;
    border-radius: 15px;
    text-align: center;
    border: 1px solid rgba(255, 215, 0, 0.15);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    width: 100%;
    transition: all 0.3s ease;
}

.flow-node:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.15);
}

.flow-node i {
    font-size: 1.5rem;
    color: #ffd700;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.flow-node h3, .flow-node h4 {
    color: #ffd700;
    margin: 0.5rem 0;
}

.flow-node h3 {
    font-size: 1.3rem;
}

.flow-node h4 {
    font-size: 1.1rem;
}

.primary-node {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.15) 100%);
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
    color: rgba(255, 255, 255, 0.9);
    margin: 0.5rem 0;
    font-size: 0.9rem;
    position: relative;
    padding-left: 1.2rem;
}

.node-details ul li::before {
    content: '•';
    color: #ffd700;
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
        background: linear-gradient(180deg, rgba(255, 215, 0, 0.3), transparent);
    }

    .flow-path::before {
        top: -3rem;
        height: 3rem;
    }

    .primary-node {
        width: 100%;
    }
}
</style> 