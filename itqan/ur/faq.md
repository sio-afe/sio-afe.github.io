---
layout: tasfiya
title: إتقان - عمومی سوالات
dir: rtl
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
</style>

<div class="islamic-decoration">
    <h1><span class="thuluth-text">إتقان</span> - عمومی سوالات</h1>
</div>

<div class="faq-content">
    <div class="accordion" id="faqAccordion">
        <!-- Registration -->
        <div class="faq-item mb-4">
            <h2 class="faq-header" id="headingOne">
                <button class="faq-btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                    <i class="fas fa-question-circle me-2"></i>
                    میں مقابلے کے لیے رجسٹریشن کیسے کروں؟
                </button>
            </h2>
            <div id="collapseOne" class="collapse show" data-bs-parent="#faqAccordion">
                <div class="faq-body">
                    رجسٹریشن ہماری ویب سائٹ کے ذریعے آن لائن یا ایس آئی او ابوالفضل دفتر میں ذاتی طور پر کی جا سکتی ہے۔ آپ کو بنیادی معلومات فراہم کرنی ہوں گی اور اپنی مقابلے کی قسم کا انتخاب کرنا ہوگا۔
                </div>
            </div>
        </div>

        <!-- Eligibility -->
        <div class="faq-item mb-4">
            <h2 class="faq-header" id="headingTwo">
                <button class="faq-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                    <i class="fas fa-user-check me-2"></i>
                    کون شرکت کر سکتا ہے؟
                </button>
            </h2>
            <div id="collapseTwo" class="collapse" data-bs-parent="#faqAccordion">
                <div class="faq-body">
                    مقابلہ دہلی کے تمام رہائشیوں کے لیے کھلا ہے۔ عمر کی اقسام ہیں: جونیئر (15 سال سے کم) اور سینئر (15 سال اور اس سے زیادہ)۔ شرکاء کو قرآن پاک کی تلاوت درست تجوید کے ساتھ کرنے کی صلاحیت ہونی چاہیے۔
                </div>
            </div>
        </div>

        <!-- Competition Format -->
        <div class="faq-item mb-4">
            <h2 class="faq-header" id="headingThree">
                <button class="faq-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                    <i class="fas fa-clipboard-list me-2"></i>
                    مقابلے کا فارمیٹ کیا ہے؟
                </button>
            </h2>
            <div id="collapseThree" class="collapse" data-bs-parent="#faqAccordion">
                <div class="faq-body">
                    مقابلہ متعدد راؤنڈز پر مشتمل ہے: ابتدائی، سیمی فائنل، اور فائنل۔ ہر راؤنڈ میں تلاوت کے لیے مخصوص سورتیں مقرر کی جائیں گی۔ اذان کا مقابلہ علیحدہ منعقد کیا جائے گا۔
                </div>
            </div>
        </div>

        <!-- Judging -->
        <div class="faq-item mb-4">
            <h2 class="faq-header" id="headingFour">
                <button class="faq-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour">
                    <i class="fas fa-gavel me-2"></i>
                    جج کرنے کا طریقہ کیا ہے؟
                </button>
            </h2>
            <div id="collapseFour" class="collapse" data-bs-parent="#faqAccordion">
                <div class="faq-body">
                    قابل ججوں کا ایک پینل شرکاء کی تجوید، تلفظ، آواز کے معیار، اور مجموعی پیشکش کی بنیاد پر تشخیص کرے گا۔ تمام شرکاء کو تفصیلی اسکورنگ کے معیار فراہم کیے جائیں گے۔
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
    text-align: right;
    background: none;
    border: none;
    color: #ffd700;
    font-size: 1.2rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    transition: background 0.3s ease;
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Nafees Nastaleeq', 'Noto Naskh Arabic', sans-serif;
    flex-direction: row-reverse;
}

.faq-btn:hover, .faq-btn:not(.collapsed) {
    background: rgba(255, 215, 0, 0.05);
}

.faq-btn i {
    color: #ffd700;
    margin-left: 1rem;
    width: 24px;
    text-align: center;
}

.faq-body {
    padding: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
    border-top: 1px solid rgba(255, 215, 0, 0.1);
    line-height: 1.8;
    font-size: 1.1rem;
    text-align: right;
    background: rgba(0, 0, 0, 0.1);
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Nafees Nastaleeq', 'Noto Naskh Arabic', sans-serif;
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
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 2rem;
    background: linear-gradient(45deg, #ffd700, #ffed4a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
    letter-spacing: 1px;
    position: relative;
    display: inline-block;
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Nafees Nastaleeq', 'Noto Naskh Arabic', sans-serif;
}

.islamic-decoration h1::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, 
        transparent,
        #ffd700,
        transparent
    );
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { opacity: 0.3; }
    50% { opacity: 1; }
    100% { opacity: 0.3; }
}

[dir="rtl"] {
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Nafees Nastaleeq', 'Noto Naskh Arabic', sans-serif;
}

[dir="rtl"] h1 {
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Nafees Nastaleeq', 'Noto Naskh Arabic', sans-serif;
}

/* Font loading */
@font-face {
    font-family: 'Mehr Nastaleeq';
    src: local('Mehr Nastaleeq');
    font-display: swap;
}

@font-face {
    font-family: 'Jameel Noori Nastaleeq';
    src: local('Jameel Noori Nastaleeq');
    font-display: swap;
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