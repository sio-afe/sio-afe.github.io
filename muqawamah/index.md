---
layout: default
permalink: /muqawamah/
---

<style>
.tournament-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.hero-section {
    text-align: center;
    padding: 0;
    margin: 40px auto;
    width: 100%;
    max-width: 1200px;
    height: auto;
    border-radius: 15px;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s ease forwards;
}

.hero-section picture {
    display: block;
    width: 100%;
}

.hero-section img {
    width: 100%;
    height: auto;
    max-width: 100%;
    border-radius: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.hero-section h1 {
    font-size: 2.5em;
    margin-bottom: 20px;
}

.hero-section p {
    font-size: 1.2em;
    max-width: 800px;
    margin: 0 auto;
}

.tournament-links {
    text-align: center;
    margin: 40px 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 30px;
}

.tournament-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 16px 32px;
    background: linear-gradient(135deg, #4CAF50, #43A047);
    color: white;
    text-decoration: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.2);
    min-width: 220px;
    border: none;
    position: relative;
    overflow: hidden;
}

.tournament-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
    background: linear-gradient(135deg, #43A047, #388E3C);
}

.tournament-button.u17 {
    background: linear-gradient(135deg, #2196F3, #1976D2);
    box-shadow: 0 4px 15px rgba(33, 150, 243, 0.2);
    animation-delay: 0.2s;
}

.tournament-button.u17:hover {
    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.3);
    background: linear-gradient(135deg, #1976D2, #1565C0);
}

.cta-section {
    text-align: center;
    margin: 40px 0;
    padding: 40px;
    background: linear-gradient(135deg, #f5f7fa, #e4e7eb);
    border-radius: 15px;
    color: #1a237e;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.cta-section h2 {
    margin-bottom: 20px;
    font-size: 2em;
    color: #1a237e;
    font-weight: 600;
}

.cta-section p {
    margin-bottom: 30px;
    font-size: 1.1em;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    color: #424242;
    line-height: 1.6;
}

.info-section {
    background: white;
    border-radius: 15px;
    padding: 30px;
    margin: 30px 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s ease forwards;
    overflow: hidden;
}

.info-section h2 {
    color: #1a237e;
    margin-bottom: 20px;
    font-size: 1.8em;
}

.info-section p {
    margin-bottom: 20px;
    line-height: 1.6;
    word-wrap: break-word;
}

.rules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.rule-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
    word-wrap: break-word;
    overflow: hidden;
}

.rule-card:hover {
    transform: translateY(-5px);
}

.rule-card h3 {
    color: #1a237e;
    margin-bottom: 12px;
    font-size: 1.2em;
    border-bottom: 2px solid #2196F3;
    padding-bottom: 8px;
}

.rule-card ul {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
}

.rule-card li {
    margin-bottom: 10px;
    padding-left: 15px;
    position: relative;
    word-wrap: break-word;
    line-height: 1.4;
    font-size: 0.95em;
}

.rule-card li:last-child {
    margin-bottom: 0;
}

.important-note {
    background: #fff3e0;
    padding: 15px;
    border-left: 4px solid #ff9800;
    margin-top: 20px;
    border-radius: 4px;
}

.contact-section {
    margin-top: 40px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    opacity: 0;
    animation: fadeIn 0.5s ease forwards;
    animation-delay: 0.4s;
}

.last-updated {
    text-align: center;
    color: #666;
    font-size: 0.9rem;
    margin-top: 40px;
    font-style: italic;
}

.sponsors-section {
    padding: 40px 20px;
    margin: 40px 0;
    background: linear-gradient(to bottom, #ffffff, #f8f9fa);
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.sponsors-section h2 {
    text-align: center;
    color: #1a237e;
    margin-bottom: 30px;
    font-size: 2em;
    font-weight: 600;
    position: relative;
    padding-bottom: 12px;
}

.sponsors-section h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #4CAF50, #2196F3);
    border-radius: 2px;
}

.sponsors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 30px;
    justify-items: center;
    max-width: 1000px;
    margin: 0 auto;
    padding: 15px;
}

.sponsor-item {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    text-align: center;
    width: 100%;
    max-width: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.sponsor-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4CAF50, #2196F3);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.sponsor-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.sponsor-item:hover::before {
    opacity: 1;
}

.sponsor-item img {
    width: 120px;
    height: 120px;
    object-fit: contain;
    margin-bottom: 12px;
    transition: transform 0.3s ease;
}

.sponsor-item:hover img {
    transform: scale(1.05);
}

.sponsor-item p {
    color: #1a237e;
    font-size: 1rem;
    font-weight: 500;
    margin: 0;
    padding-top: 8px;
    border-top: 1px solid #eee;
    width: 100%;
}

@media (max-width: 768px) {
    .sponsors-section {
        padding: 25px 12px;
        margin: 25px 0;
    }

    .sponsors-section h2 {
        font-size: 1.5em;
        margin-bottom: 20px;
    }

    .sponsors-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        padding: 0 8px;
    }

    .sponsor-item {
        padding: 12px 8px;
        max-width: none;
        width: 100%;
        border-radius: 8px;
    }

    .sponsor-item img {
        width: 80px;
        height: 80px;
        margin-bottom: 8px;
    }

    .sponsor-item p {
        font-size: 0.85rem;
        padding-top: 6px;
    }
}

@media (max-width: 480px) {
    .sponsors-section {
        padding: 20px 10px;
        margin: 20px 0;
        border-radius: 12px;
    }

    .sponsors-section h2 {
        font-size: 1.4em;
        margin-bottom: 15px;
    }

    .sponsors-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        padding: 0 5px;
    }

    .sponsor-item {
        padding: 10px 6px;
    }

    .sponsor-item img {
        width: 70px;
        height: 70px;
        margin-bottom: 6px;
    }

    .sponsor-item p {
        font-size: 0.8rem;
        padding-top: 5px;
    }

    .sponsor-item:hover {
        transform: translateY(-3px);
    }
}

@media (max-width: 360px) {
    .sponsors-grid {
        gap: 8px;
    }

    .sponsor-item {
        padding: 8px 5px;
    }

    .sponsor-item img {
        width: 60px;
        height: 60px;
    }

    .sponsor-item p {
        font-size: 0.75rem;
    }
}

@media (max-width: 768px) {
    .tournament-container {
        padding: 15px;
    }

    .hero-section {
        padding: 30px 15px;
        margin-bottom: 30px;
    }

    .hero-section h1 {
        font-size: 1.8em;
        margin-bottom: 15px;
    }

    .hero-section p {
        font-size: 1.1em;
        padding: 0 10px;
    }

    .info-section {
        padding: 20px;
        margin: 15px 0;
    }

    .info-section h2 {
        font-size: 1.6em;
        margin-bottom: 15px;
    }

    .objectives-grid {
        grid-template-columns: 1fr;
        gap: 15px;
        margin-top: 15px;
    }

    .objective-card {
        padding: 15px;
    }

    .objective-card h3 {
        font-size: 1.2em;
    }

    .rules-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .rule-card {
        padding: 15px;
    }

    .rule-card h3 {
        font-size: 1.2em;
    }

    .rule-card li {
        padding-left: 15px;
        font-size: 0.95em;
    }

    .important-note {
        margin: 20px 5px;
        padding: 12px;
        font-size: 0.95em;
    }

    .cta-section {
        padding: 25px 15px;
        margin: 30px 0;
    }

    .cta-section h2 {
        font-size: 1.6em;
        margin-bottom: 15px;
    }

    .cta-section p {
        font-size: 1em;
        padding: 0 10px;
        margin-bottom: 20px;
    }

    .tournament-links {
        flex-direction: column;
        align-items: center;
        gap: 15px;
        margin: 20px 0;
    }

    .tournament-button {
        width: 100%;
        max-width: 280px;
        padding: 14px 20px;
        font-size: 1em;
    }

    .sponsors-section {
        padding: 25px 15px;
        margin: 30px 0;
    }

    .sponsors-section h2 {
        font-size: 1.6em;
        margin-bottom: 20px;
    }

    .sponsors-grid {
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 15px;
        padding: 0 10px;
    }

    .sponsor-item {
        padding: 10px;
        max-width: 130px;
    }

    .sponsor-item p {
        font-size: 0.9em;
        margin-top: 8px;
    }

    .contact-section {
        margin: 30px 5px;
        padding: 20px 15px;
    }

    .contact-section h2 {
        font-size: 1.6em;
        margin-bottom: 15px;
    }

    .contact-section p {
        font-size: 0.95em;
        margin-bottom: 10px;
    }

    .last-updated {
        font-size: 0.85rem;
        margin-top: 30px;
        padding: 0 15px;
    }

    .objectives-grid, .rules-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .objective-card, .rule-card {
        padding: 15px;
    }

    .objective-card h3, .rule-card h3 {
        font-size: 1.1em;
        margin-bottom: 10px;
        padding-bottom: 6px;
    }

    .objective-card p {
        font-size: 0.9em;
        line-height: 1.4;
    }

    .rule-card li {
        font-size: 0.9em;
        padding-left: 12px;
        margin-bottom: 8px;
        line-height: 1.4;
    }
}

@media (max-width: 480px) {
    .hero-section h1 {
        font-size: 1.6em;
    }

    .tournament-button {
        max-width: 250px;
        min-width: unset;
    }

    .objectives-grid, .rules-grid {
        gap: 12px;
    }

    .objective-card, .rule-card {
        padding: 12px;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.info-section .highlight {
    color: #4CAF50;
    font-weight: 600;
}

.objectives-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 30px;
}

.objective-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
    word-wrap: break-word;
    overflow: hidden;
}

.objective-card:hover {
    transform: translateY(-5px);
}

.objective-card h3 {
    color: #1a237e;
    margin-bottom: 12px;
    font-size: 1.2em;
    border-bottom: 2px solid #2196F3;
    padding-bottom: 8px;
}

.objective-card p {
    color: #333;
    line-height: 1.5;
    font-size: 0.95em;
    margin: 0;
    word-wrap: break-word;
}

.values-intro {
    text-align: center;
    margin: 30px 0;
    padding: 25px;
    background: linear-gradient(135deg, rgba(96, 125, 139, 0.05), rgba(144, 164, 174, 0.05));
    border-radius: 12px;
}

.values-intro p {
    font-size: 1.1em;
    color: #455a64;
    line-height: 1.6;
    margin: 0;
}

.values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
    margin: 30px auto;
    max-width: 1000px;
    padding: 0 15px;
}

.value-card {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
    border: 1px solid rgba(144, 164, 174, 0.2);
    margin: 0 auto;
    width: 100%;
    max-width: 400px;
}

.value-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.value-card h3 {
    color: #455a64;
    margin-bottom: 15px;
    font-size: 1.2em;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
}

.value-card h3::before {
    content: "•";
    color: #4CAF50;
    font-size: 1.5em;
    line-height: 1;
}

.value-card p {
    color: #546e7a;
    line-height: 1.6;
    margin: 0;
    font-size: 0.95em;
}

@media (max-width: 768px) {
    .values-intro {
        padding: 20px;
        margin: 20px 0;
    }

    .values-intro p {
        font-size: 1em;
    }

    .value-card {
        padding: 20px;
    }
}

@media (max-width: 480px) {
    .values-grid {
        padding: 0 5px;
        gap: 15px;
    }

    .value-card {
        padding: 15px;
    }
}

@media (min-width: 768px) {
    .hero-section {
        padding: 30px;
    }
    .hero-section img {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        display: block;
    }
}

.muqawama-section {
    margin-top: 2rem;
    padding: 1rem 0;
}

.muqawama-section h3 {
    color: #1a237e;
    font-size: 1.8em;
    margin-bottom: 1rem;
    text-align: center;
}

.muqawama-section h4 {
    color: #1d3557;
    font-size: 1.4em;
    margin: 1.5rem 0 1rem;
    border-left: 4px solid #4CAF50;
    padding-left: 1rem;
}

.muqawama-why, .muqawama-vision, .muqawama-essence, .club-role {
    margin: 1.5rem 0;
    padding: 1rem;
    background: rgba(76, 175, 80, 0.05);
    border-radius: 8px;
}

.muqawama-essence {
    background: rgba(33, 150, 243, 0.05);
    font-style: italic;
    text-align: center;
    padding: 1.5rem;
}

.club-role ul {
    list-style: none;
    padding-left: 1.5rem;
    margin-top: 1rem;
}

.club-role ul li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
    line-height: 1.6;
}

.club-role ul li::before {
    content: "•";
    color: #4CAF50;
    font-size: 1.5em;
    position: absolute;
    left: 0;
    top: -0.2rem;
}

.muqawama-call {
    text-align: center;
    margin: 2rem 0;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1));
    border-radius: 8px;
    font-weight: 500;
}

@media (max-width: 768px) {
    .muqawama-section h3 {
        font-size: 1.5em;
    }

    .muqawama-section h4 {
        font-size: 1.2em;
    }

    .muqawama-why, .muqawama-vision, .muqawama-essence, .club-role {
        padding: 0.8rem;
    }

    .club-role ul {
        padding-left: 1rem;
    }
}

@media (max-width: 480px) {
    .muqawama-section h3 {
        font-size: 1.3em;
    }

    .muqawama-section h4 {
        font-size: 1.1em;
    }
}

.find-images-section {
    text-align: center;
    margin: 40px 0;
    padding: 40px;
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    border-radius: 15px;
    color: #1a237e;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
}

.find-images-section::before,
.find-images-section::after {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1));
    border-radius: 50%;
    z-index: 0;
}

.find-images-section::before {
    top: -100px;
    left: -100px;
}

.find-images-section::after {
    bottom: -100px;
    right: -100px;
}

.find-images-section h2 {
    margin-bottom: 15px;
    font-size: 1.8em;
    color: #1a237e;
    font-weight: 600;
    position: relative;
    z-index: 1;
}

.find-images-section p {
    margin-bottom: 20px;
    font-size: 1em;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    color: #424242;
    line-height: 1.5;
    position: relative;
    z-index: 1;
}

.qr-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 15px auto;
    max-width: 200px;
    padding: 15px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
}

.qr-container::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(135deg, #4CAF50, #2196F3);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
}

.qr-container:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
}

.qr-code {
    width: 100%;
    height: auto;
    max-width: 180px;
    border-radius: 8px;
}

@media (max-width: 768px) {
    .find-images-section {
        margin: 30px 0;
        padding: 25px 15px;
    }

    .find-images-section h2 {
        font-size: 1.5em;
        margin-bottom: 12px;
    }

    .find-images-section p {
        font-size: 0.95em;
        padding: 0 10px;
        margin-bottom: 15px;
    }

    .qr-container {
        max-width: 180px;
        padding: 12px;
    }

    .qr-code {
        max-width: 160px;
    }
}

@media (max-width: 480px) {
    .find-images-section {
        margin: 20px 0;
        padding: 20px 15px;
    }

    .find-images-section h2 {
        font-size: 1.3em;
    }

    .qr-container {
        max-width: 160px;
        padding: 10px;
    }

    .qr-code {
        max-width: 140px;
    }
}

.social-section {
    text-align: center;
    margin: 40px auto;
    padding: 30px;
    max-width: 1000px;
    background: #ffffff;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.social-header {
    margin-bottom: 25px;
}

.social-header h2 {
    font-size: 2em;
    color: #333;
    margin-bottom: 10px;
    font-weight: 600;
}

.social-header p {
    color: #666;
    font-size: 1.1em;
    max-width: 600px;
    margin: 0 auto;
}

.instagram-container {
    display: inline-block;
    margin: 25px auto;
}

.instagram-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 25px;
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    color: white;
    text-decoration: none;
    font-size: 1.1em;
    font-weight: 600;
    border-radius: 8px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.instagram-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.instagram-button i {
    font-size: 1.3em;
}

@media (max-width: 768px) {
    .social-section {
        margin: 30px 0;
        padding: 25px 15px;
    }

    .social-header h2 {
        font-size: 1.5em;
        margin-bottom: 12px;
    }

    .social-header p {
        font-size: 0.95em;
        padding: 0 10px;
        margin-bottom: 15px;
    }

    .instagram-button {
        font-size: 1em;
        padding: 10px 20px;
    }
}

@media (max-width: 480px) {
    .social-section {
        margin: 20px 0;
        padding: 20px 15px;
    }

    .social-header h2 {
        font-size: 1.3em;
    }

    .instagram-button {
        font-size: 0.95em;
        padding: 8px 16px;
    }

    .instagram-button i {
        font-size: 1.2em;
    }
}

.tournament-highlights {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
    margin-top: 30px;
    padding: 0;
}

.highlight-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 25px 20px;
    transition: all 0.3s ease;
}

.highlight-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.highlight-icon {
    width: 60px;
    height: 60px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 15px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.highlight-icon i {
    font-size: 1.8em;
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.highlight-title {
    font-size: 1.1em;
    color: #333;
    margin-bottom: 8px;
    font-weight: 600;
}

.highlight-text {
    color: #666;
    font-size: 0.95em;
    line-height: 1.5;
}

@media (max-width: 768px) {
    .tournament-highlights {
        grid-template-columns: 1fr;
        gap: 15px;
        margin-top: 20px;
        padding: 0;
    }

    .highlight-card {
        padding: 20px;
        margin: 0;
    }

    .highlight-icon {
        width: 50px;
        height: 50px;
        margin: 0 auto 12px;
    }

    .highlight-icon i {
        font-size: 1.5em;
    }

    .highlight-title {
        font-size: 1em;
        margin-bottom: 6px;
    }

    .highlight-text {
        font-size: 0.9em;
    }
}

@media (max-width: 480px) {
    .tournament-highlights {
        gap: 12px;
        margin-top: 15px;
    }

    .highlight-card {
        padding: 15px;
    }

    .highlight-icon {
        width: 45px;
        height: 45px;
        margin: 0 auto 10px;
    }

    .highlight-icon i {
        font-size: 1.3em;
    }
}

<div class="social-section">
    <div class="social-header">
        <h2>Join the Muqawama Community</h2>
        <p>Follow us on Instagram for exclusive tournament updates, behind-the-scenes moments, and community highlights</p>
    </div>

    <div class="instagram-container">
        <a href="https://instagram.com/muqawama2025" target="_blank" rel="noopener" class="instagram-button">
            <i class="fab fa-instagram"></i>
            <span>Follow @muqawama2025</span>
        </a>
    </div>

    <div class="tournament-highlights">
        <div class="highlight-card">
            <div class="highlight-icon">
                <i class="fas fa-futbol"></i>
            </div>
            <div class="highlight-title">22 Teams</div>
            <div class="highlight-text">Competing in an intense display of skill and sportsmanship</div>
        </div>

        <div class="highlight-card">
            <div class="highlight-icon">
                <i class="fas fa-users"></i>
            </div>
            <div class="highlight-title">200+ Players</div>
            <div class="highlight-text">United in their passion for football and community spirit</div>
        </div>

        <div class="highlight-card">
            <div class="highlight-icon">
                <i class="fas fa-camera"></i>
            </div>
            <div class="highlight-title">1000+ Moments</div>
            <div class="highlight-text">Capturing the excitement, victories, and memorable experiences</div>
        </div>
    </div>
</div>
</style>

<div class="tournament-container">
    <div class="hero-section">
        <picture>
            <!-- Wide image for desktop -->
            <source media="(min-width: 768px)" srcset="/assets/img/front_page_wide.png">
            <!-- Default/mobile image -->
            <img src="/assets/img/front_page.png" alt="Muqawamah Football Tournament">
        </picture>
    </div>

    <div class="info-section">
        <h2>About MUQAWAMA Football Tournament</h2>
        <p>The SIO Abul Fazal Enclave Area is proud to organize a two-day football tournament under the theme "<span class="highlight">MUQAWAMA</span>" (Resistance).</p>
        
        <div class="values-intro">
            <p>Our tournament transcends the boundaries of sport, embodying core values that strengthen our community and nurture the development of our youth.</p>
        </div>

        <div class="muqawama-section">
            <h3>MUQAWAMA: More Than a Tournament</h3>
            <p>Welcome to the two-day football tournament under the theme "MUQAWAMA"—a unique initiative by SIO Abul Fazal Enclave. This event is not just about competition but about building a community grounded in unity, ethics, and Islamic values.</p>

            <div class="muqawama-why">
                <h4>Why MUQAWAMA?</h4>
                <p>In today's challenging world, "Muqawama" (resistance) represents the steadfastness required to uphold Islamic principles in every facet of life. This tournament is our first step towards nurturing those values within our youth.</p>
            </div>

            <div class="muqawama-vision">
                <h4>Beyond Two Days</h4>
                <p>Unlike traditional tournaments that end when the trophy is claimed, MUQAWAMA is a beginning. Through this initiative, we aim to establish a football club where all players, regardless of which team they represent, come together as one, building a better understanding of each other.</p>
            </div>

            <div class="objectives-grid">
                <div class="objective-card">
                    <h3>Unity and Brotherhood</h3>
                    <p>Strengthening the bonds among participants and fostering collective growth.</p>
                </div>

                <div class="objective-card">
                    <h3>Islamic Ethics and Values</h3>
                    <p>Embodying principles of discipline, righteousness, and integrity on and off the field.</p>
                </div>

                <div class="objective-card">
                    <h3>Talent Development</h3>
                    <p>Sharpening skills while aligning sportsmanship with spiritual responsibility.</p>
                </div>

                <div class="objective-card">
                    <h3>Rekindling Islamic Identity</h3>
                    <p>Encouraging players to reflect on their roles as ambassadors of Islamic values.</p>
                </div>
            </div>

            <div class="muqawama-essence">
                <p>MUQAWAMA is more than a tournament—it is a call to action, a reminder to balance talent with virtue and sportsmanship with ethics. It is a step toward building a community that embodies both physical excellence and spiritual resilience.</p>
            </div>

            <div class="club-role">
                <h4>Your Role in the Club</h4>
                <p>By becoming a part of this club, you will not only grow as a player but as an individual committed to a higher cause. Together, we will:</p>
                <ul>
                    <li>Provide mentorship and guidance</li>
                    <li>Organize regular training and discussions</li>
                    <li>Prepare to lead as representatives of a balanced, ethical lifestyle</li>
                    <li>Integrate Islamic principles into your daily life</li>
                </ul>
            </div>

            <div class="muqawama-call">
                <p>Join us in making MUQAWAMA more than a tournament—make it a movement. Together, let's embody the spirit of resistance and resilience in every field of life.</p>
            </div>
        </div>
    </div>

    <div class="info-section">
        <h2>Tournament Rules and Regulations</h2>
        <div class="rules-grid">
            <div class="rule-card">
                <h3>Registration & Participation</h3>
                <ul>
                    <li>• Teams must submit complete player list with passport photos, full names, and DOB before tournament day</li>
                    <li>• Players can only participate in one team per tournament category (U-17 and Open Age are separate)</li>
                    <li>• Entry fee must be paid before tournament day</li>
                    <li>• Registration fees are non-refundable under any circumstances</li>
                </ul>
            </div>

            <div class="rule-card">
                <h3>Match Day Requirements</h3>
                <ul>
                    <li>• Teams must arrive 15 minutes before scheduled match time</li>
                    <li>• All team players must be present at arrival time</li>
                    <li>• Teams are not allowed to bring their own footballs</li>
                </ul>
            </div>

            <div class="rule-card">
                <h3>Conduct & Discipline</h3>
                <ul>
                    <li>• Abusive language or misconduct will result in immediate action</li>
                    <li>• Players must respect referee's decisions - no arguments allowed</li>
                    <li>• Smoking, gutka, and other such items are strictly prohibited</li>
                    <li>• Any damage to ground property will face severe action</li>
                </ul>
            </div>

            <div class="rule-card">
                <h3>Tournament Authority</h3>
                <ul>
                    <li>• Management team's decisions are final and cannot be challenged</li>
                    <li>• Right to disqualify teams for incomplete player attendance</li>
                    <li>• Violations may result in player bans or team elimination</li>
                    <li>• Only listed players are allowed to participate</li>
                </ul>
            </div>
        </div>

        <div class="important-note">
            <strong>Important Note:</strong> Team captains are responsible for communicating all rules to their players. By participating in the tournament, all teams agree to abide by these rules and regulations.
        </div>
    </div>

    <div class="cta-section">
        <h2>View Tournament Details</h2>
        <p>Check out the fixtures, team standings, match schedules, and all other tournament details for your category below.</p>
        <div class="tournament-links">
            <a href="/muqawamah/open-age" class="tournament-button">Open Age Tournament</a>
            <a href="/muqawamah/u17" class="tournament-button u17">Under 17 Tournament</a>
        </div>
    </div>

    <div class="sponsors-section">
        <h2>Our Sponsors</h2>
        <div class="sponsors-grid">
            <div class="sponsor-item">
                <img src="/assets/data/sponsors/shaheen-academy.png" alt="Shaheen Academy">
                <p>Shaheen Academy</p>
            </div>
            <div class="sponsor-item">
                <img src="/assets/data/sponsors/hidayat.png" alt="Hidayat Publishers">
                <p>Hidayat Publishers</p>
            </div>
            <div class="sponsor-item">
                <img src="/assets/data/sponsors/ocean.png" alt="Oceans Secret">
                <p>Oceans Secret</p>
            </div>
            <div class="sponsor-item">
                <img src="/assets/data/sponsors/whitedot.jpeg" alt="White Dot Publishers">
                <p>White Dot Publishers</p>
            </div>
            <div class="sponsor-item">
                <img src="/assets/data/sponsors/bazmi.jpeg" alt="Bazmi PG">
                <p>Bazmi PG</p>
            </div>
            <div class="sponsor-item">
                <img src="/assets/data/sponsors/motilal.png" alt="Dr Lal Hospital">
                <p>Dr Lal Hospital</p>
            </div>
            <div class="sponsor-item">
                <img src="/assets/data/sponsors/sps.jpeg" alt="Shaheen Public School">
                <p>Shaheen Public School</p>
            </div>
            <div class="sponsor-item">
                <img src="/assets/data/sponsors/nadeem.jpeg" alt="Nadeem Contactor">
                <p>Nadeem Contactor</p>
            </div>
            
            <div class="sponsor-item">
                <img src="/assets/data/sponsors/jabbar.png" alt="Jabbar Contactor">
                <p>Jabbar Contactor</p>
            </div>
            <div class="sponsor-item">
                <img src="/assets/data/sponsors/zavia.png" alt="Zavia Prints">
                <p>Zavia Prints</p>
            </div>
            
        </div>
    </div>

    <div class="find-images-section">
        <h2>Find Your Images</h2>
        <p>Scan to access all tournament photos and memories</p>
        <div class="qr-container">
            <img src="/assets/img/find_images_qr.png" alt="QR Code for Tournament Images" class="qr-code">
        </div>
    </div>

    <div class="social-section">
        <div class="social-header">
            <h2>Join the Muqawama Community</h2>
            <p>Follow us on Instagram for exclusive tournament updates, behind-the-scenes moments, and community highlights</p>
        </div>

        <div class="instagram-container">
            <a href="https://instagram.com/muqawama2025" target="_blank" rel="noopener" class="instagram-button">
                <i class="fab fa-instagram"></i>
                <span>Follow @muqawama2025</span>
            </a>
        </div>

        <div class="tournament-highlights">
            <div class="highlight-card">
                <div class="highlight-icon">
                    <i class="fas fa-futbol"></i>
                </div>
                <div class="highlight-title">22 Teams</div>
                <div class="highlight-text">Competing in an intense display of skill and sportsmanship</div>
            </div>

            <div class="highlight-card">
                <div class="highlight-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="highlight-title">200+ Players</div>
                <div class="highlight-text">United in their passion for football and community spirit</div>
            </div>

            <div class="highlight-card">
                <div class="highlight-icon">
                    <i class="fas fa-camera"></i>
                </div>
                <div class="highlight-title">1000+ Moments</div>
                <div class="highlight-text">Capturing the excitement, victories, and memorable experiences</div>
            </div>
        </div>
    </div>

</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Update last updated date
    const lastUpdated = document.getElementById('lastUpdated');
    lastUpdated.textContent = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Add scroll reveal animation for sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all info sections
    document.querySelectorAll('.info-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
});
</script>