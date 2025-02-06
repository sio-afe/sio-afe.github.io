---
layout: tasfiya
title: Register - Itqan
---

<div class="register-page">
    <h1 class="text-center mb-4">Register for <span class="thuluth-text">إتقان</span> </h1>
    
    <div class="register-form-container">
        <form id="registrationForm" class="registration-form">
            <div class="form-group">
                <label for="category">Competition Category*</label>
                <select id="category" name="category" class="form-control" required onchange="updateSubcategories()">
                    <option value="">Select Category</option>
                    <option value="hifz">Hifz Competition</option>
                    <option value="tarteel">Tarteel Competition</option>
                    <option value="adhan">Adhan Competition</option>
                </select>
            </div>

            <div class="form-group" id="subcategoryGroup" style="display: none;">
                <label for="subcategory">Competition Level*</label>
                <select id="subcategory" name="subcategory" class="form-control" required>
                    <option value="">Select Level</option>
                </select>
            </div>

            <div class="form-group">
                <label for="participant_type">Participant Type*</label>
                <select id="participant_type" name="participant_type" class="form-control" required>
                    <option value="">Select Type</option>
                    <option value="school">School Student</option>
                    <option value="individual">Individual Participant</option>
                </select>
            </div>

            <div class="form-group" id="schoolGroup" style="display: none;">
                <label for="school_name">School Name*</label>
                <input type="text" id="school_name" name="school_name" class="form-control">
            </div>

            <div class="form-group">
                <label for="fullName">Full Name*</label>
                <input type="text" id="fullName" name="fullName" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email*</label>
                <input type="email" id="email" name="email" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="phone">Phone Number*</label>
                <input type="tel" id="phone" name="phone" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="age">Age*</label>
                <input type="number" id="age" name="age" class="form-control" required min="5" max="100">
            </div>
            
            <div class="form-group">
                <label for="address">Address*</label>
                <textarea id="address" name="address" class="form-control" required rows="3"></textarea>
            </div>
            
            <button type="submit" class="register-submit-btn">Submit Registration</button>
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
    transition: all 0.3s ease;
    opacity: 1;
    transform: translateY(0);
}

.form-group.hidden {
    opacity: 0;
    transform: translateY(-10px);
    pointer-events: none;
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

.form-control:disabled {
    background: rgba(255, 255, 255, 0.05);
    cursor: not-allowed;
}

select.form-control {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23dfb456' viewBox='0 0 16 16'%3E%3Cpath d='M8 11l-7-7h14l-7 7z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2.5rem;
}

[dir="rtl"] select.form-control {
    background-position: left 1rem center;
    padding-right: 1rem;
    padding-left: 2.5rem;
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
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .register-page {
        padding: 1rem;
    }
    
    .register-form-container {
        padding: 1.5rem;
    }
}

/* Add animation for form groups */
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.form-group {
    animation: slideDown 0.3s ease-out forwards;
}
</style>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
function updateSubcategories() {
    const category = document.getElementById('category').value;
    const subcategoryGroup = document.getElementById('subcategoryGroup');
    const subcategory = document.getElementById('subcategory');
    const age = document.getElementById('age').value;

    // Clear existing options
    subcategory.innerHTML = '<option value="">Select Level</option>';

    if (category === 'hifz') {
        subcategoryGroup.style.display = 'block';
        if (age && parseInt(age) < 12) {
            subcategory.innerHTML += '<option value="1juz">1 Juz</option>';
        } else {
            subcategory.innerHTML += `
                <option value="2juz">2 Juz</option>
                <option value="full">Full Quran</option>
            `;
        }
    } else if (category === 'tarteel' || category === 'adhan') {
        subcategoryGroup.style.display = 'block';
        subcategory.innerHTML += '<option value="open">Open Age</option>';
    } else {
        subcategoryGroup.style.display = 'none';
    }
}

document.getElementById('age').addEventListener('change', updateSubcategories);
document.getElementById('participant_type').addEventListener('change', function() {
    const schoolGroup = document.getElementById('schoolGroup');
    schoolGroup.style.display = this.value === 'school' ? 'block' : 'none';
    document.getElementById('school_name').required = this.value === 'school';
});

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
        submitBtn.textContent = 'Submitting...';
        
        try {
            const formData = {
                full_name: form.fullName.value,
                email: form.email.value,
                phone: form.phone.value,
                age: parseInt(form.age.value),
                category: form.category.value,
                subcategory: form.subcategory.value,
                participant_type: form.participant_type.value,
                school_name: form.school_name.value || null,
                address: form.address.value,
                registration_date: new Date().toISOString()
            };
            
            const { data, error } = await supabase
                .from('registrations')
                .insert([formData]);
                
            if (error) throw error;
            
            // Show success message
            alert('Registration successful! We will contact you soon.');
            form.reset();
            
        } catch (error) {
            console.error('Error:', error);
            alert('Registration failed. Please try again later.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Registration';
        }
    });
});
</script> 