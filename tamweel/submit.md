---
layout: newdef
title: Submit Your Pitch - Tamweel
---

<div class="hero-section">
    <div class="hero-content">
        <h1 class="hero-title">Submit Your Pitch</h1>
        <p class="hero-subtitle">Share your vision for an impactful Islamic event</p>
    </div>
</div>

<div class="form-container card">
    <div class="form-header">
        <i class="fas fa-paper-plane form-icon"></i>
        <p class="intro-text">Fill out the form below with details about your event idea. Be as specific as possible to help us understand your vision.</p>
    </div>

    <form id="pitchForm" class="pitch-form">
        <div class="form-section card">
            <div class="section-header">
                <i class="fas fa-user"></i>
                <h2>Basic Information</h2>
            </div>
            <div class="form-group">
                <label for="eventName">Event Name*</label>
                <input type="text" id="eventName" name="eventName" required>
            </div>
            
            <div class="form-group">
                <label for="organizerName">Primary Organizer Name*</label>
                <input type="text" id="organizerName" name="organizerName" required>
            </div>
            
            <div class="form-group">
                <label for="email">Contact Email*</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="phone">Contact Phone*</label>
                <input type="tel" id="phone" name="phone" required>
            </div>
        </div>

        <div class="form-section card">
            <div class="section-header">
                <i class="fas fa-calendar-alt"></i>
                <h2>Event Details</h2>
            </div>
            <div class="form-group">
                <label for="eventDescription">Event Description*</label>
                <textarea id="eventDescription" name="eventDescription" rows="4" required></textarea>
            </div>
            
            <div class="form-group">
                <label for="targetAudience">Target Audience*</label>
                <input type="text" id="targetAudience" name="targetAudience" required>
            </div>
            
            <div class="form-group">
                <label for="expectedAttendees">Expected Number of Attendees*</label>
                <input type="number" id="expectedAttendees" name="expectedAttendees" required>
            </div>
            
            <div class="form-group">
                <label for="proposedDate">Proposed Event Date*</label>
                <input type="date" id="proposedDate" name="proposedDate" required>
            </div>
            
            <div class="form-group">
                <label for="venue">Proposed Venue</label>
                <input type="text" id="venue" name="venue">
            </div>
        </div>

        <div class="form-section card">
            <div class="section-header">
                <i class="fas fa-coins"></i>
                <h2>Budget & Resources</h2>
            </div>
            <div class="form-group">
                <label for="totalBudget">Total Budget Required (₹)*</label>
                <input type="number" id="totalBudget" name="totalBudget" required>
            </div>
            
            <div class="form-group">
                <label for="budgetBreakdown">Budget Breakdown*</label>
                <textarea id="budgetBreakdown" name="budgetBreakdown" rows="4" required 
                    placeholder="Please provide a detailed breakdown of how the funds will be used"></textarea>
            </div>
            
            <div class="form-group">
                <label for="additionalResources">Additional Resources Needed</label>
                <textarea id="additionalResources" name="additionalResources" rows="3"
                    placeholder="List any non-monetary resources you need (volunteers, equipment, etc.)"></textarea>
            </div>
        </div>

        <div class="form-section card">
            <div class="section-header">
                <i class="fas fa-chart-line"></i>
                <h2>Impact & Sustainability</h2>
            </div>
            <div class="form-group">
                <label for="expectedImpact">Expected Impact*</label>
                <textarea id="expectedImpact" name="expectedImpact" rows="4" required
                    placeholder="Describe how this event will benefit the community"></textarea>
            </div>
            
            <div class="form-group">
                <label for="successMetrics">Success Metrics*</label>
                <textarea id="successMetrics" name="successMetrics" rows="3" required
                    placeholder="How will you measure the success of this event?"></textarea>
            </div>
            
            <div class="form-group">
                <label for="sustainability">Sustainability Plan</label>
                <textarea id="sustainability" name="sustainability" rows="3"
                    placeholder="If applicable, describe how this event could be sustained or repeated in the future"></textarea>
            </div>
        </div>

        <div class="form-section card">
            <div class="section-header">
                <i class="fas fa-plus-circle"></i>
                <h2>Additional Information</h2>
            </div>
            <div class="form-group">
                <label for="experience">Relevant Experience</label>
                <textarea id="experience" name="experience" rows="3"
                    placeholder="Describe any relevant experience in organizing similar events"></textarea>
            </div>
            
            <div class="form-group">
                <label for="additionalInfo">Additional Information</label>
                <textarea id="additionalInfo" name="additionalInfo" rows="3"
                    placeholder="Any other information you'd like to share about your event idea"></textarea>
            </div>
        </div>

        <div class="form-submit">
            <button type="submit" class="btn btn-large">
                <i class="fas fa-paper-plane"></i> Submit Pitch
            </button>
        </div>
    </form>
</div>

<style>
.form-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0;
    background: transparent;
    box-shadow: none;
}

.form-header {
    text-align: center;
    margin-bottom: 2rem;
}

.form-icon {
    font-size: 3rem;
    color: var(--primary);
    margin-bottom: 1rem;
    animation: float 3s ease-in-out infinite;
}

.intro-text {
    font-size: 1.1rem;
    color: var(--text-dark);
    opacity: 0.8;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(0,0,0,0.1);
}

.section-header i {
    font-size: 1.5rem;
    color: var(--primary);
}

.form-section {
    margin-bottom: 2rem;
    transition: var(--transition);
}

.form-section:hover {
    transform: translateY(-5px);
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-dark);
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 1rem;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 1rem;
    transition: var(--transition);
    background: white;
}

.form-group input:focus,
.form-group textarea:focus {
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 3px rgba(194, 39, 43, 0.1);
}

.form-group textarea {
    resize: vertical;
}

.form-submit {
    text-align: center;
    margin-top: 3rem;
}

.form-submit .btn {
    min-width: 200px;
}

@media (max-width: 768px) {
    .form-container {
        margin: 1rem;
    }
    
    .form-section {
        padding: 1.5rem;
    }
    
    .section-header {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
    }
}
</style>

<script>
document.getElementById('pitchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    try {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // TODO: Add your form submission logic here
        // For example, sending to a backend API or database
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
        
        // Show success message
        alert('Thank you for submitting your pitch! We will review it and get back to you soon.');
        e.target.reset();
    } catch (error) {
        alert('There was an error submitting your pitch. Please try again later.');
        console.error('Error:', error);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Pitch';
    }
});

// Add floating labels
document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
    field.addEventListener('focus', () => {
        field.parentElement.classList.add('focused');
    });
    
    field.addEventListener('blur', () => {
        if (!field.value) {
            field.parentElement.classList.remove('focused');
        }
    });
});
</script> 