---
layout: tasfiya
title: إتقان Competition Brochure
---

<div class="brochure-container" id="brochure">
    <div class="border-pattern"></div>
    <div class="corner-decoration corner-top-left"></div>
    <div class="corner-decoration corner-top-right"></div>
    <div class="corner-decoration corner-bottom-left"></div>
    <div class="corner-decoration corner-bottom-right"></div>
    
    <div class="brochure-header">
        <div class="logo-section">
            <img src="/assets/img/islamic/banner1.png" alt="SIO Logo" class="sio-logo">
        </div>
        
        <div class="calligraphy-section">
            <div class="calligraphy-decoration top"></div>
            <span class="flower-decoration flower-left">❁</span>
            <img src="/assets/img/islamic/إتقان.png" alt="Itqan" class="calligraphy-image">
            <span class="flower-decoration flower-right">❁</span>
            <div class="calligraphy-decoration bottom"></div>
        </div>

        </div>

    <div class="brochure-content">
        <div class="intro-section">
            <p class="lead">
                The first edition of Itqan Competition brings together the most beautiful voices in Qur'an Recitation and Adhan from across Delhi.
            </p>
        </div>

        <div class="categories-section">
            <h2 class="section-title">Competition Categories</h2>
            <div class="category-grid">
                <!-- Hifz Category -->
                <div class="category-card">
                    <i class="fas fa-quran"></i>
                    <h3>Hifz Competition</h3>
                    <div class="subcategories">
                        <div class="subcategory">
                            <h4>Under 12</h4>
                            <span class="badge">1 Juz</span>
                        </div>
                        <div class="subcategory">
                            <h4>Open Age</h4>
                            <span class="badge">2 Juz</span>
                            <span class="badge">Full Quran</span>
                        </div>
                    </div>
                </div>

                <!-- Tarteel Category -->
                <div class="category-card">
                    <i class="fas fa-microphone"></i>
                    <h3>Tarteel Competition</h3>
                    <div class="subcategories">
                        <div class="subcategory">
                            <h4>Open Age</h4>
                            <span class="badge">Beautiful Recitation</span>
                        </div>
                    </div>
                </div>

                <!-- Adhan Category -->
                <div class="category-card">
                    <i class="fas fa-mosque"></i>
                    <h3>Adhan Competition</h3>
                    <div class="subcategories">
                        <div class="subcategory">
                            <h4>Open Age</h4>
                            <span class="badge">Call to Prayer</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="stages-section">
            <h2 class="section-title">Competition Process</h2>
            <div class="stages-timeline">
                <div class="stage-item">
                    <div class="stage-number">1</div>
                    <div class="stage-content">
                        <h3><i class="fas fa-flag-checkered"></i> Preliminary Rounds</h3>
                        <div class="stage-tracks">
                            <div class="track-item">
                                <h4><i class="fas fa-school"></i> School Track</h4>
                                <ul>
                                    <li>10 Islamic Schools</li>
                                    <li>Internal Selection Process</li>
                                    <li>2 Best Contestants per Category</li>
                                </ul>
                            </div>
                            <div class="track-item">
                                <h4><i class="fas fa-user"></i> Individual Track</h4>
                                <ul>
                                    <li>Open Registration</li>
                                    <li>Preliminary by إتقان Organization</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="stage-item">
                    <div class="stage-number">2</div>
                    <div class="stage-content">
                        <h3><i class="fas fa-trophy"></i> Finals</h3>
                        <div class="stage-tracks">
                            <div class="track-item">
                                <h4><i class="fas fa-quran"></i> Hifz Finals</h4>
                                <ul>
                                    <li>Maximum 20 Participants per Category</li>
                                </ul>
                            </div>
                            <div class="track-item">
                                <h4><i class="fas fa-microphone"></i> Tarteel & Adhan Finals</h4>
                                <ul>
                                    <li>12 Participants Each</li>
                                    <li>10 from Schools</li>
                                    <li>2 Individual Participants</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="contact-section">
            <div class="contact-text">
                <h2>Join Us</h2>
                <div class="event-details">
                    <div class="date-venue">
                        <p class="detail-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>26 February 2024</span>
                        </p>
                        <p class="detail-item">
                            <i class="fas fa-mosque"></i>
                            <span>Masjid Ishate Islam</span>
                        </p>
                        <p class="contact-info">
                            <i class="fas fa-globe"></i>
                            <span>sio-afe.github.io/itqan</span>
                        </p>
                    </div>
                </div>
            </div>
            <div class="qr-section">
                <h3>Register</h3>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://sio-afe.github.io/itqan/register" alt="Registration QR Code">
            </div>
        </div>
    </div>

    <div class="download-section">
        <button onclick="downloadAsPNG()" class="download-btn">
            <i class="fas fa-image"></i> Download as PNG
        </button>
        <button onclick="downloadAsPDF()" class="download-btn">
            <i class="fas fa-file-pdf"></i> Download as PDF
        </button>
    </div>
</div>

<style>
/* Add Thuluth font */
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');

/* Print styles for A4 */
@media print {
    @page {
        size: A4;
        margin: 0;
    }
    
    body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
    }
    
    .brochure-container {
        position: relative;
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 10mm;
        box-shadow: none;
        background: linear-gradient(-45deg, #005f73, #0a9396, #094c59, #083c48) !important;
    }

    .download-section {
        display: none;
    }

    .category-card, .stage-card {
        break-inside: avoid;
        page-break-inside: avoid;
    }
}

.brochure-container {
    background: linear-gradient(-45deg, #005f73, #0a9396, #094c59, #083c48);
    background-size: 400% 400%;
    animation: gradientBG 15s ease infinite;
    color: #fff;
    padding: 1.5rem;
    width: 210mm;
    height: 297mm;
    margin: 2rem auto;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
    border-radius: 0;
    border: 1px solid rgba(223, 180, 86, 0.2);
    display: grid;
    grid-template-rows: auto 1fr auto;
}

.brochure-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/assets/img/islamic/bckg.png') center/cover;
    opacity: 0.1;
    pointer-events: none;
}

/* Islamic Pattern Border */
.brochure-container::after {
    content: '';
    position: absolute;
    inset: 4px;
    border: 1px solid rgba(223, 180, 86, 0.2);
    border-radius: 13px;
    pointer-events: none;
    background-image: 
        linear-gradient(45deg, transparent 48%, rgba(223, 180, 86, 0.2) 49%, rgba(223, 180, 86, 0.2) 51%, transparent 52%),
        linear-gradient(-45deg, transparent 48%, rgba(223, 180, 86, 0.2) 49%, rgba(223, 180, 86, 0.2) 51%, transparent 52%);
    background-size: 20px 20px;
    background-position: center;
    opacity: 0.3;
}

/* Additional Decorative Border */
.brochure-container .border-pattern {
    content: '';
    position: absolute;
    inset: 8px;
    border: 2px solid rgba(223, 180, 86, 0.3);
    border-radius: 12px;
    pointer-events: none;
    background-image: 
        radial-gradient(circle at 15px 15px, rgba(223, 180, 86, 0.2) 2px, transparent 2px),
        radial-gradient(circle at 15px 15px, rgba(223, 180, 86, 0.15) 4px, transparent 4px);
    background-size: 30px 30px;
    background-position: top left;
    opacity: 0.5;
}

/* Corner Decorations */
.corner-decoration {
    position: absolute;
    width: 50px;
    height: 50px;
    pointer-events: none;
    opacity: 0.5;
}

.corner-decoration::before {
    content: '❁';
    position: absolute;
    color: rgba(223, 180, 86, 0.4);
    font-size: 1.5rem;
}

.corner-top-left { top: 10px; left: 10px; }
.corner-top-right { top: 10px; right: 10px; }
.corner-bottom-left { bottom: 10px; left: 10px; }
.corner-bottom-right { bottom: 10px; right: 10px; }

@keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.brochure-header {
    text-align: center;
    margin-bottom: 0.5rem;
    position: relative;
}

.logo-section {
    margin-bottom: 0.5rem;
}

.sio-logo {
    max-width: 100%;
    height: 50px;
    object-fit: contain;
}

.calligraphy-section {
    position: relative;
    text-align: center;
    padding: 0.5rem 0;
    margin-bottom: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.calligraphy-image {
    height: 100px;
    width: auto;
    max-width: 100%;
}

.tentative-date {
    font-size: 0.9rem;
    color: #dfb456;
    margin: 0;
    text-shadow: 0 0 5px rgba(223, 180, 86, 0.3);
    font-weight: 500;
    letter-spacing: 1px;
    background: linear-gradient(45deg, #dfb456, #e6c172);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
    display: inline-block;
    padding: 0.3rem 1.5rem;
    border: 1px solid rgba(223, 180, 86, 0.3);
    border-radius: 20px;
    box-shadow: 0 0 10px rgba(223, 180, 86, 0.1);
}

.tentative-date::before {
    content: '';
    position: absolute;
    inset: -3px;
    border: 1px solid rgba(223, 180, 86, 0.2);
    border-radius: 22px;
}

.tentative-date::after {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, transparent, rgba(223, 180, 86, 0.2), transparent);
    border-radius: 21px;
    z-index: -1;
}

.subtitle {
    font-size: 1rem;
    margin-top: 0.5rem;
}

.brochure-content {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    gap: 0.5rem;
    padding: 0 0.8rem;
    overflow: hidden;
}

.intro-section {
    margin-bottom: 0.3rem;
}

.lead {
    font-size: 0.85rem;
    line-height: 1.3;
    margin-bottom: 0.3rem;
}

.categories-section, .stages-section {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
    margin: 0.3rem 0;
}

.category-card {
    padding: 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    background: linear-gradient(135deg, rgba(223, 180, 86, 0.1), rgba(230, 193, 114, 0.05));
    border: 1px solid rgba(223, 180, 86, 0.2);
    border-radius: 10px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.category-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, transparent, #dfb456, transparent);
    opacity: 0.5;
}

.category-card i {
    font-size: 1.5rem;
    margin-bottom: 0.3rem;
    color: #dfb456;
    text-shadow: 0 0 10px rgba(223, 180, 86, 0.3);
    animation: shimmer 2s infinite;
}

.category-card h3 {
    color: #dfb456;
    text-align: center;
    font-size: 0.95rem;
    margin-bottom: 0.2rem;
    text-shadow: 0 0 5px rgba(223, 180, 86, 0.3);
}

.subcategory h4 {
    color: #e6c172;
    font-size: 0.8rem;
    margin-bottom: 0.15rem;
}

.badge {
    padding: 0.1rem 0.4rem;
    font-size: 0.7rem;
    margin: 0.1rem 0.1rem 0.1rem 0;
    background: linear-gradient(45deg, rgba(223, 180, 86, 0.2), rgba(230, 193, 114, 0.1));
    border: 1px solid rgba(223, 180, 86, 0.3);
    border-radius: 20px;
    color: #dfb456;
    display: inline-block;
}

h2.section-title {
    font-size: 1.2rem;
    margin: 0.4rem auto;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    display: inline-block;
    padding: 0 2rem;
    width: auto;
    transform: none;
    left: auto;
}

h2.section-title::before, h2.section-title::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #dfb456, transparent);
}

h2.section-title::before {
    right: 100%;
}

h2.section-title::after {
    left: 100%;
}

@keyframes shimmer {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
}

.category-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(223, 180, 86, 0.1);
    border-color: rgba(223, 180, 86, 0.3);
}

.stages-timeline {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: 0.3rem;
}

.stage-item {
    background: linear-gradient(135deg, rgba(223, 180, 86, 0.08), rgba(230, 193, 114, 0.03));
    border-radius: 10px;
    padding: 0.5rem;
    border: 1px solid rgba(223, 180, 86, 0.2);
    position: relative;
    overflow: hidden;
}

.stage-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #dfb456, transparent);
    opacity: 0.5;
}

.stage-number {
    width: 28px;
    height: 28px;
    background: linear-gradient(45deg, #dfb456, #e6c172);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: bold;
    color: #005f73;
    margin-bottom: 0.3rem;
    box-shadow: 0 0 10px rgba(223, 180, 86, 0.2);
}

.stage-content h3 {
    color: #dfb456;
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
    text-shadow: 0 0 5px rgba(223, 180, 86, 0.3);
    text-align: center;
    width: 100%;
}

.stage-tracks {
    display: grid;
    gap: 0.4rem;
}

.track-item {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(223, 180, 86, 0.02));
    padding: 0.4rem;
    border-radius: 8px;
    border: 1px solid rgba(223, 180, 86, 0.15);
}

.track-item h4 {
    color: #e6c172;
    font-size: 0.8rem;
    margin-bottom: 0.2rem;
    text-shadow: 0 0 5px rgba(223, 180, 86, 0.2);
    text-align: center;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.3rem;
}

.track-item ul li {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.9);
    position: relative;
    padding-left: 1rem;
}

.track-item ul li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #dfb456;
}

.contact-section {
    margin-top: auto;
    padding: 0.8rem 2rem;
    background: linear-gradient(135deg, rgba(223, 180, 86, 0.08), rgba(230, 193, 114, 0.03));
    border-radius: 10px;
    border: 1px solid rgba(223, 180, 86, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 5rem;
}

.contact-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 25%;
}

.contact-text h2 {
    font-size: 1.1rem;
    margin: 0 0 0.15rem 0;
    color: #dfb456;
    text-align: center;
    width: 100%;
}

.event-details {
    margin: 0;
    width: 100%;
    display: flex;
    justify-content: flex-start;
}

.date-venue {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    align-items: flex-start;
}

.detail-item, .contact-info {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.3rem;
    color: #dfb456;
    font-size: 0.9rem;
    margin: 0;
    line-height: 1;
    width: auto;
}

.detail-item i {
    color: #dfb456;
    font-size: 1rem;
    width: 1.2rem;
    text-align: center;
}

.detail-item span {
    color: rgba(255, 255, 255, 0.9);
}

.contact-info {
    font-size: 0.8rem;
    margin-top: 0.05rem;
}

.qr-section {
    background: white;
    padding: 0.4rem;
    border-radius: 8px;
    border: 1px solid rgba(223, 180, 86, 0.3);
    text-align: center;
}

.qr-section h3 {
    color: #dfb456;
    font-size: 0.9rem;
    margin: 0 0 0.2rem 0;
    text-shadow: 0 0 5px rgba(223, 180, 86, 0.3);
}

.qr-section img {
    height: 140px;
    width: 140px;
    display: block;
}

/* Adjust flower decorations */
.flower-decoration {
    font-size: 3rem;
}

.flower-left {
    left: 15rem;
}

.flower-right {
    right: 15rem;
}

/* Update the download section position */
.download-section {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    gap: 1rem;
}

.download-btn {
    background: linear-gradient(45deg, #005f73, #0a9396);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
}

.download-btn:hover {
    background: linear-gradient(45deg, #0a9396, #005f73);
    transform: translateY(-2px);
}

.download-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

@media print {
    .download-section {
        display: none !important;
    }
}

/* Add styles for competition process section */
.competition-process {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin: 0.5rem 0;
}

.process-step {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 0.5rem;
    border: 1px solid rgba(223, 180, 86, 0.2);
}

.process-step h3 {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: #dfb456;
    font-size: 1rem;
    margin-bottom: 0.3rem;
}

.process-step ul {
    list-style: none;
    padding-left: 0.8rem;
    margin: 0.2rem 0;
}

.process-step ul li {
    font-size: 0.75rem;
    margin: 0.15rem 0;
    position: relative;
}

.process-step ul li::before {
    content: '→';
    position: absolute;
    left: -0.8rem;
    color: #dfb456;
}

.tentative-date {
    font-size: 0.9rem;
    color: #dfb456;
    margin: 0.3rem 0;
    text-shadow: 0 0 5px rgba(223, 180, 86, 0.3);
    font-weight: 500;
    letter-spacing: 0.5px;
    background: linear-gradient(45deg, #dfb456, #e6c172);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
    display: inline-block;
}

.tentative-date::before {
    content: 'Tentative Date';
    display: block;
    font-size: 0.7rem;
    opacity: 0.8;
    margin-bottom: 0.1rem;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.event-details {
    margin: 0.5rem 0;
}

.date-venue {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    align-items: center;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #dfb456;
    font-size: 0.9rem;
    margin: 0;
}

.detail-item i {
    color: #dfb456;
    font-size: 1rem;
}

.detail-item span {
    color: rgba(255, 255, 255, 0.9);
}

.floating-qr {
    display: none;
}
</style>

<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script>
function downloadAsPNG() {
    const element = document.getElementById('brochure');
    const downloadSection = document.querySelector('.download-section');
    
    // Hide download buttons
    downloadSection.style.display = 'none';
    
    // Add loading state to button
    const button = document.querySelector('.download-btn');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PNG...';
    button.disabled = true;

    // Wait for all images to load
    Promise.all(Array.from(element.getElementsByTagName('img'))
        .filter(img => !img.complete)
        .map(img => new Promise(resolve => {
            img.onload = img.onerror = resolve;
        })))
        .then(() => {
            html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: null,
                width: 210 * 3.78, // A4 width in pixels (at 96 DPI)
                height: 297 * 3.78, // A4 height in pixels
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'itqan-competition-brochure.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                // Reset button state and show download section
                button.innerHTML = originalText;
                button.disabled = false;
                downloadSection.style.display = 'flex';
            });
        });
}

function downloadAsPDF() {
    const element = document.getElementById('brochure');
    const downloadSection = document.querySelector('.download-section');
    
    // Hide download buttons
    downloadSection.style.display = 'none';
    
    // Add loading state to button
    const button = document.querySelectorAll('.download-btn')[1];
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    button.disabled = true;

    // Wait for all images to load
    Promise.all(Array.from(element.getElementsByTagName('img'))
        .filter(img => !img.complete)
        .map(img => new Promise(resolve => {
            img.onload = img.onerror = resolve;
        })))
        .then(() => {
            html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: null,
                width: 210 * 3.78, // A4 width in pixels (at 96 DPI)
                height: 297 * 3.78, // A4 height in pixels
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jspdf.jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
                pdf.save('itqan-competition-brochure.pdf');
                
                // Reset button state and show download section
                button.innerHTML = originalText;
                button.disabled = false;
                downloadSection.style.display = 'flex';
            });
        });
}

// Add draggable functionality to QR code
document.addEventListener('DOMContentLoaded', function() {
    const qr = document.querySelector('.floating-qr');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    qr.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === qr) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, qr);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }
});
</script> 