---
layout: tasfiya
title: رجسٹریشن - إتقان
---

<div class="register-page">
    <h1 class="text-center mb-4">إتقان مقابلے کے لیے رجسٹریشن</h1>
    
    <div class="register-form-container">
        <form id="registrationForm" class="registration-form">
            <div class="form-group">
                <label for="fullName">مکمل نام*</label>
                <input type="text" id="fullName" name="fullName" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="email">ای میل*</label>
                <input type="email" id="email" name="email" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="phone">فون نمبر*</label>
                <input type="tel" id="phone" name="phone" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="age">عمر*</label>
                <input type="number" id="age" name="age" class="form-control" required min="5" max="100">
            </div>
            
            <div class="form-group">
                <label for="category">مقابلے کی قسم*</label>
                <select id="category" name="category" class="form-control" required>
                    <option value="">قسم منتخب کریں</option>
                    <option value="quran">قرآن تلاوت</option>
                    <option value="adhan">اذان</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="experience">تجربہ (سالوں میں)</label>
                <input type="number" id="experience" name="experience" class="form-control" min="0" max="50">
            </div>
            
            <div class="form-group">
                <label for="address">پتہ*</label>
                <textarea id="address" name="address" class="form-control" required rows="3"></textarea>
            </div>
            
            <button type="submit" class="register-submit-btn">رجسٹریشن جمع کریں</button>
        </form>
    </div>
</div>

<style>
.register-page {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
}

.register-page h1 {
    color: #dfb456;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.register-form-container {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(223, 180, 86, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.registration-form {
    display: grid;
    gap: 1.5rem;
}

.form-group {
    position: relative;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #dfb456;
    font-weight: 500;
}

.form-control {
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(223, 180, 86, 0.2);
    border-radius: 8px;
    color: #fff;
    transition: all 0.3s ease;
}

.form-control:focus {
    outline: none;
    border-color: #dfb456;
    box-shadow: 0 0 0 2px rgba(223, 180, 86, 0.2);
    background: rgba(255, 255, 255, 0.15);
}

.register-submit-btn {
    background: linear-gradient(45deg, #dfb456, #e6c172);
    color: #005f73;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    margin-top: 1rem;
}

.register-submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(223, 180, 86, 0.3);
    background: linear-gradient(45deg, #e6c172, #dfb456);
}

.register-submit-btn:active {
    transform: translateY(0);
}

/* RTL Support */
[dir="rtl"] .register-page {
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', sans-serif;
}

[dir="rtl"] .form-group label {
    font-size: 1.2rem;
}

[dir="rtl"] .form-control {
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', sans-serif;
    font-size: 1.1rem;
    line-height: 1.8;
    text-align: right;
}

[dir="rtl"] .register-submit-btn {
    font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', sans-serif;
    font-size: 1.2rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .register-page {
        padding: 1rem;
    }
    
    .register-form-container {
        padding: 1.5rem;
    }
    
    [dir="rtl"] .form-group label {
        font-size: 1.1rem;
    }
    
    [dir="rtl"] .form-control {
        font-size: 1rem;
    }
    
    [dir="rtl"] .register-submit-btn {
        font-size: 1.1rem;
    }
}
</style>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    const supabaseUrl = 'YOUR_SUPABASE_URL';
    const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);
    
    const form = document.getElementById('registrationForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.register-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'جمع کر رہا ہے...';
        
        try {
            const formData = {
                full_name: form.fullName.value,
                email: form.email.value,
                phone: form.phone.value,
                age: parseInt(form.age.value),
                category: form.category.value,
                experience: parseInt(form.experience.value) || 0,
                address: form.address.value,
                registration_date: new Date().toISOString()
            };
            
            const { data, error } = await supabase
                .from('registrations')
                .insert([formData]);
                
            if (error) throw error;
            
            // Show success message
            alert('رجسٹریشن کامیاب! ہم جلد ہی آپ سے رابطہ کریں گے۔');
            form.reset();
            
        } catch (error) {
            console.error('Error:', error);
            alert('رجسٹریشن ناکام۔ براہ کرم کچھ دیر بعد کوشش کریں۔');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'رجسٹریشن جمع کریں';
        }
    });
});
</script> 