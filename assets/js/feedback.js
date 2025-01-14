document.addEventListener('DOMContentLoaded', async function() {
    // Wait for Supabase to initialize
    await window.waitForSupabase();
    
    const form = document.getElementById('feedbackForm');
    const otherAspect = document.getElementById('otherAspect');
    const otherAspectText = document.getElementById('otherAspectText');
    const participateNo = document.getElementById('participateNo');
    const noParticipateReason = document.getElementById('noParticipateReason');
    const preferredFormat = document.querySelector('select[name="preferredFormat"]');
    const otherFormat = document.getElementById('otherFormat');
    const sioImpactYes = document.getElementById('sioImpactYes');
    const sioImpactDescription = document.getElementById('sioImpactDescription');
    const sioImpactDescriptionContainer = document.getElementById('sioImpactDescriptionContainer');

    // Check if feedback was already submitted
    if (localStorage.getItem('feedbackSubmitted')) {
        showThankYouMessage();
        return;
    }

    // Hide "Other" input fields and description fields initially
    otherAspectText.style.display = 'none';
    otherFormat.style.display = 'none';
    noParticipateReason.style.display = 'none';
    sioImpactDescriptionContainer.style.display = 'none';

    // Toggle "Other" text input for impressed aspects
    otherAspect.addEventListener('change', function() {
        otherAspectText.style.display = this.checked ? 'block' : 'none';
    });

    // Toggle reason input for "No" participation
    participateNo.addEventListener('change', function() {
        noParticipateReason.style.display = this.checked ? 'block' : 'none';
    });

    // Toggle "Other" format input
    preferredFormat.addEventListener('change', function() {
        otherFormat.style.display = this.value === 'Other' ? 'block' : 'none';
    });

    // Toggle SIO impact description
    sioImpactYes.addEventListener('change', function() {
        sioImpactDescriptionContainer.style.display = 'block';
        sioImpactDescription.required = true;
    });

    document.getElementById('sioImpactNo').addEventListener('change', function() {
        sioImpactDescriptionContainer.style.display = 'none';
        sioImpactDescription.required = false;
        sioImpactDescription.value = '';
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        // Disable submit button to prevent double submission
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...';

        const formData = new FormData(form);
        const data = {
            personal_info: {
                full_name: formData.get('fullName'),
                email: formData.get('email') || null,
                team: formData.get('team'),
                contact: formData.get('contact')
            },
            tournament_experience: {
                overall_rating: parseInt(formData.get('rating')),
                impressed_by: Array.from(formData.getAll('impressedBy')).map(value => {
                    if (value === 'other') {
                        return formData.get('otherAspectText');
                    }
                    return value;
                }).filter(Boolean),
                satisfaction_ratings: {
                    communication: parseInt(formData.get('communicationRating')),
                    scheduling: parseInt(formData.get('schedulingRating')),
                    facilities: parseInt(formData.get('facilitiesRating')),
                    referee: parseInt(formData.get('refereeRating')),
                    format: parseInt(formData.get('formatRating'))
                },
                challenges: formData.get('challenges') || null,
                would_recommend: formData.get('recommend')
            },
            future_improvements: {
                desired_features: formData.get('futureFeatures') || null,
                preferred_format: formData.get('preferredFormat') === 'Other' ? 
                    formData.get('otherFormat') : 
                    formData.get('preferredFormat'),
                would_participate: formData.get('participate'),
                no_participate_reason: formData.get('participate') === 'No' ? 
                    formData.get('noParticipateReason') : 
                    null,
                suggested_improvements: {
                    organization: formData.get('orgImprovements') || null,
                    facilities: formData.get('facImprovements') || null,
                    rules: formData.get('ruleImprovements') || null,
                    other: formData.get('otherImprovements') || null
                }
            },
            sio_impact: {
                changed_perspective: formData.get('sioImpact'),
                description: formData.get('sioImpact') === 'Yes' ? 
                    formData.get('sioImpactDescription') : 
                    null
            },
            additional_comments: formData.get('additionalComments') || null
        };

        try {
            console.log('Submitting feedback:', data);
            const { error } = await window.supabaseClient
                .from('feedback')
                .insert([data]);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Store submission in localStorage
            localStorage.setItem('feedbackSubmitted', 'true');
            
            // Show thank you message
            showThankYouMessage();
        } catch (error) {
            console.error('Error:', error);
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit Feedback';
            alert('Sorry, there was an error submitting your feedback. Please try again later.');
        }
    });
});

function showThankYouMessage() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-lg-8 text-center">
                <div class="card shadow-sm border-0 rounded-3 p-5">
                    <div class="card-body">
                        <i class="fas fa-check-circle text-success mb-4" style="font-size: 4rem;"></i>
                        <h2 class="mb-4">Thank You for Your Feedback!</h2>
                        <p class="lead mb-4">Your response has been recorded successfully. We appreciate your time and valuable input.</p>
                        <p class="text-muted">Your feedback will help us improve future tournaments.</p>
                        <a href="/muqawamah" class="btn btn-primary btn-lg mt-3">Return to Homepage</a>
                    </div>
                </div>
            </div>
        </div>
    `;
} 