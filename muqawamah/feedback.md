---
layout: page
permalink: /muqawamah/feedback
---

<div class="container mt-4">
    <h2 class="text-center mb-4">Muqawama Football Tournament - Participant Feedback</h2>
    
    <form id="feedbackForm" class="needs-validation" novalidate>
        <div class="card mb-4">
            <div class="card-header">
                <h4>Personal Information</h4>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label for="fullName" class="form-label">Full Name*</label>
                    <input type="text" class="form-control form-control-lg" id="fullName" name="fullName" required>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <input type="email" class="form-control form-control-lg" id="email" name="email">
                </div>
                <div class="mb-3">
                    <label for="team" class="form-label">Team/Organization*</label>
                    <input type="text" class="form-control form-control-lg" id="team" name="team" required>
                </div>
                <div class="mb-3">
                    <label for="contact" class="form-label">Contact Number*</label>
                    <input type="tel" class="form-control form-control-lg" id="contact" name="contact" required>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                <h4>Tournament Experience</h4>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">Overall Tournament Rating*</label>
                    <div class="rating">
                        <input type="radio" id="star5" name="rating" value="5" required>
                        <label for="star5">★</label>
                        <input type="radio" id="star4" name="rating" value="4">
                        <label for="star4">★</label>
                        <input type="radio" id="star3" name="rating" value="3">
                        <label for="star3">★</label>
                        <input type="radio" id="star2" name="rating" value="2">
                        <label for="star2">★</label>
                        <input type="radio" id="star1" name="rating" value="1">
                        <label for="star1">★</label>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Which aspects of the tournament impressed you the most?</label>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="matchOrg" name="impressedBy" value="Match organization">
                        <label class="form-check-label" for="matchOrg">Match organization</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="refDecisions" name="impressedBy" value="Referee decisions">
                        <label class="form-check-label" for="refDecisions">Referee decisions</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="teamSpirit" name="impressedBy" value="Team spirit">
                        <label class="form-check-label" for="teamSpirit">Team spirit</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="facilities" name="impressedBy" value="Venue facilities">
                        <label class="form-check-label" for="facilities">Venue facilities</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="schedule" name="impressedBy" value="Tournament schedule">
                        <label class="form-check-label" for="schedule">Tournament schedule</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="otherAspect" name="impressedBy" value="other">
                        <label class="form-check-label" for="otherAspect">Other</label>
                        <input type="text" class="form-control mt-2" id="otherAspectText" name="otherAspectText" placeholder="Please specify">
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Satisfaction Ratings*</label>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Aspect</th>
                                    <th>Rating (1-5)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Communication from organizers</td>
                                    <td>
                                        <input type="number" class="form-control" name="communicationRating" min="1" max="5" required>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Match scheduling</td>
                                    <td>
                                        <input type="number" class="form-control" name="schedulingRating" min="1" max="5" required>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Venue facilities</td>
                                    <td>
                                        <input type="number" class="form-control" name="facilitiesRating" min="1" max="5" required>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Referee quality</td>
                                    <td>
                                        <input type="number" class="form-control" name="refereeRating" min="1" max="5" required>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Overall tournament format</td>
                                    <td>
                                        <input type="number" class="form-control" name="formatRating" min="1" max="5" required>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="challenges" class="form-label">What challenges did you face during the tournament?</label>
                    <textarea class="form-control" id="challenges" name="challenges" rows="3"></textarea>
                </div>

                <div class="mb-3">
                    <label class="form-label">Would you recommend this tournament to others?*</label>
                    <select class="form-select" name="recommend" required>
                        <option value="">Choose...</option>
                        <option value="Definitely">Definitely</option>
                        <option value="Probably">Probably</option>
                        <option value="Not sure">Not sure</option>
                        <option value="Probably not">Probably not</option>
                        <option value="Definitely not">Definitely not</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                <h4>Future Improvements</h4>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label for="futureFeatures" class="form-label">What additional features would you like to see in future tournaments?</label>
                    <textarea class="form-control" id="futureFeatures" name="futureFeatures" rows="3"></textarea>
                </div>

                <div class="mb-3">
                    <label class="form-label">Which format would you prefer for future tournaments?*</label>
                    <select class="form-select" name="preferredFormat" required>
                        <option value="">Choose...</option>
                        <option value="Knockout">Knockout</option>
                        <option value="League">League</option>
                        <option value="Group stage + Knockout">Group stage + Knockout</option>
                        <option value="Other">Other</option>
                    </select>
                    <input type="text" class="form-control mt-2" id="otherFormat" name="otherFormat" placeholder="Please specify if Other">
                </div>

                <div class="mb-3">
                    <label class="form-label">Would you participate in Muqawama 2.0?*</label>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="participate" id="participateYes" value="Yes" required>
                        <label class="form-check-label" for="participateYes">Yes</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="participate" id="participateNo" value="No">
                        <label class="form-check-label" for="participateNo">No</label>
                    </div>
                    <div class="mt-2">
                        <input type="text" class="form-control" id="noParticipateReason" name="noParticipateReason" placeholder="If no, please explain why">
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Suggested improvements for future tournaments:</label>
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <input type="text" class="form-control" name="orgImprovements" placeholder="Organization">
                        </div>
                        <div class="col-md-6 mb-2">
                            <input type="text" class="form-control" name="facImprovements" placeholder="Facilities">
                        </div>
                        <div class="col-md-6 mb-2">
                            <input type="text" class="form-control" name="ruleImprovements" placeholder="Rules & Regulations">
                        </div>
                        <div class="col-md-6 mb-2">
                            <input type="text" class="form-control" name="otherImprovements" placeholder="Other">
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="additionalComments" class="form-label">Additional Comments</label>
                    <textarea class="form-control" id="additionalComments" name="additionalComments" rows="3"></textarea>
                </div>

                <div class="mb-4">
                    <label for="sioImpact" class="form-label">Did participating in the Muqawama Football Tournament influence or change your perspective on <a href="https://sio-india.org/" target="_blank">SIO</a>? If yes, how?</label>
                    <div class="mb-3">
                        <div class="form-check custom-radio mb-2">
                            <input class="form-check-input" type="radio" name="sioImpact" id="sioImpactYes" value="Yes" required>
                            <label class="form-check-label" for="sioImpactYes">Yes</label>
                        </div>
                        <div class="form-check custom-radio mb-3">
                            <input class="form-check-input" type="radio" name="sioImpact" id="sioImpactNo" value="No">
                            <label class="form-check-label" for="sioImpactNo">No</label>
                        </div>
                    </div>
                    <div id="sioImpactDescriptionContainer" style="display: none;">
                        <label for="sioImpactDescription" class="form-label">Please explain how it changed your perspective:</label>
                        <textarea class="form-control" id="sioImpactDescription" name="sioImpactDescription" rows="4" placeholder="Share your thoughts..."></textarea>
                    </div>
                </div>
            </div>
        </div>

        <div class="text-center mb-4">
            <button type="submit" class="btn btn-primary">Submit Feedback</button>
        </div>
    </form>
</div>

<style>
.rating {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
}

.rating input {
    display: none;
}

.rating label {
    cursor: pointer;
    font-size: 30px;
    color: #ddd;
    padding: 5px;
}

.rating input:checked ~ label {
    color: #ffd700;
}

.rating label:hover,
.rating label:hover ~ label {
    color: #ffd700;
}
</style>

<script type="module" src="{{ '/assets/js/feedback.js' | relative_url }}"></script>
