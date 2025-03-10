---
layout: tasfiya
title: Event Gallery
permalink: /itqan/gallery/
---

<div class="container py-5">
    <div class="row mb-5">
        <div class="col-12 text-center">
            <h1 class="display-4 fw-bold mb-3" style="color: #e2c27d;">Event Gallery</h1>
            <div class="divider-gold mx-auto mb-4"></div>
            <p class="lead">Relive the first edition of ITQAN through these captured images.</p>
        </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="row mb-4">
        <div class="col-12">
            <ul class="nav nav-tabs gallery-tabs justify-content-center" id="galleryTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="photos-tab" data-bs-toggle="tab" data-bs-target="#photos" type="button" role="tab" aria-controls="photos" aria-selected="true">
                        <i class="fas fa-star me-2"></i>Highlights
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="videos-tab" data-bs-toggle="tab" data-bs-target="#videos" type="button" role="tab" aria-controls="videos" aria-selected="false">
                        <i class="fas fa-video me-2"></i>Videos
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="find-photos-tab" data-bs-toggle="tab" data-bs-target="#find-photos" type="button" role="tab" aria-controls="find-photos" aria-selected="false">
                        <i class="fas fa-search me-2"></i>Find Your Photos
                    </button>
                </li>
            </ul>
        </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content" id="galleryTabContent">
        <!-- Photos Tab -->
        <div class="tab-pane fade show active" id="photos" role="tabpanel" aria-labelledby="photos-tab">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="section-header text-center mb-5">
                        <h2 class="h3 mb-3" style="color: #e2c27d;">Event Highlights</h2>
                        <p class="text-muted">Capturing the special moments from ITQAN's first edition</p>
                        <div class="divider-gold mx-auto mt-3" style="width: 60px;"></div>
                    </div>
                </div>
            </div>
            
            <div class="row g-4">
                <!-- Event photos -->
                <div class="col-md-6 col-lg-3">
                    <div class="card gallery-card h-100">
                        <img src="{{ '/assets/img/islamic/event/img2.jpg' | relative_url }}" class="card-img-top" alt="Event Photo">
                        <div class="card-body">
                            <h5 class="card-title">Event Highlights</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-3">
                    <div class="card gallery-card h-100">
                        <img src="{{ '/assets/img/islamic/event/img3.jpg' | relative_url }}" class="card-img-top" alt="Event Photo">
                        <div class="card-body">
                            <h5 class="card-title">Event Highlights</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-3">
                    <div class="card gallery-card h-100">
                        <img src="{{ '/assets/img/islamic/event/img4.jpg' | relative_url }}" class="card-img-top" alt="Event Photo">
                        <div class="card-body">
                            <h5 class="card-title">Event Highlights</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-3">
                    <div class="card gallery-card h-100">
                        <img src="{{ '/assets/img/islamic/event/img5.jpg' | relative_url }}" class="card-img-top" alt="Event Photo">
                        <div class="card-body">
                            <h5 class="card-title">Event Highlights</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Videos Tab -->
        <div class="tab-pane fade" id="videos" role="tabpanel" aria-labelledby="videos-tab">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="section-header text-center mb-5">
                        <h2 class="h3 mb-3" style="color: #e2c27d;">Event Videos</h2>
                        <p class="text-muted">Watch highlights from our competition</p>
                        <div class="divider-gold mx-auto mt-3" style="width: 60px;"></div>
                    </div>
                </div>
            </div>
            
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
                        <div class="card-body text-center py-5">
                            <div class="video-placeholder mb-4">
                                <i class="fas fa-video fa-4x" style="color: #e2c27d; opacity: 0.6;"></i>
                            </div>
                            <h3 class="h4 mb-3">Coming Soon</h3>
                            <p class="lead">Our team is working hard to compile and edit the event videos.</p>
                            <p>Please be patient as we prepare these memorable moments to share with you.</p>
                            <p>Check back soon for updates!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Find Your Photos Tab -->
        <div class="tab-pane fade" id="find-photos" role="tabpanel" aria-labelledby="find-photos-tab">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="section-header text-center mb-5">
                        <h2 class="h3 mb-3" style="color: #e2c27d;">Find Your Photos</h2>
                        <p class="text-muted">Search for your personal photos from the event</p>
                        <div class="divider-gold mx-auto mt-3" style="width: 60px;"></div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
                        <div class="card-body p-0">
                            <iframe id="MemzoInt" src="https://memzo.ai/integrate/SmVkK1Zha2ZpU1lhR0dxQnFXdnhMUT09" style="border:none;width:100%;min-height:720px;overflow-y:hidden;overflow:hidden" title="Get Your Photos"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .divider-gold {
        height: 3px;
        width: 80px;
        background: linear-gradient(45deg, #957718, #e2c27d);
        border-radius: 3px;
    }
    
    .gallery-card {
        transition: all 0.3s ease;
        border: none;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    .gallery-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    
    .gallery-card img {
        height: 220px;
        object-fit: cover;
        transition: all 0.5s ease;
    }
    
    .gallery-card:hover img {
        transform: scale(1.05);
    }
    
    .gallery-card .card-body {
        padding: 1.5rem;
        background: #07002c;
        color: #ffffff;
    }
    
    .gallery-card .card-title {
        color: #e2c27d;
        font-weight: 600;
        margin-bottom: 0.75rem;
    }
    
    .gallery-card .card-text {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
    }
    
    .video-placeholder {
        background: rgba(7, 0, 44, 0.1);
        border-radius: 16px;
        padding: 3rem;
        display: inline-block;
    }
    
    /* Gallery Tabs Styling */
    .gallery-tabs {
        border-bottom: 1px solid rgba(226, 194, 125, 0.2);
        margin-bottom: 2rem;
    }
    
    .gallery-tabs .nav-link {
        color: #6c757d;
        border: none;
        padding: 1rem 1.5rem;
        font-weight: 500;
        border-bottom: 3px solid transparent;
        background: transparent;
        transition: all 0.3s ease;
    }
    
    .gallery-tabs .nav-link:hover {
        color: #e2c27d;
        border-color: rgba(226, 194, 125, 0.3);
    }
    
    .gallery-tabs .nav-link.active {
        color: #e2c27d;
        background: transparent;
        border-color: #e2c27d;
    }
    
    .gallery-tabs .nav-link i {
        color: #e2c27d;
    }
    
    .section-header {
        position: relative;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .gallery-card img {
            height: 180px;
        }
        
        .gallery-tabs .nav-link {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
        }
    }
    
    /* RTL Support */
    [dir="rtl"] .gallery-card .card-body {
        text-align: right;
    }
    
    [dir="rtl"] .gallery-tabs .nav-link i {
        margin-right: 0;
        margin-left: 0.5rem;
    }
</style>

<script>
    // Initialize Bootstrap tabs
    document.addEventListener('DOMContentLoaded', function() {
        var triggerTabList = [].slice.call(document.querySelectorAll('#galleryTabs button'))
        triggerTabList.forEach(function(triggerEl) {
            var tabTrigger = new bootstrap.Tab(triggerEl)
            triggerEl.addEventListener('click', function(event) {
                event.preventDefault()
                tabTrigger.show()
            })
        })
    });
</script> 