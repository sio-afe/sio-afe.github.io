---
layout: tasfiya
title: Event Gallery
permalink: /itqan/gallery/
---

<div class="container-fluid px-4 py-5">
    <div class="row mb-5">
        <div class="col-12 text-center">
            <h1 class="display-4 fw-bold mb-3 text-primary">Event Gallery</h1>
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
                        <h2 class="h3 mb-3 text-primary">Event Highlights</h2>
                        <p class="text-muted">Capturing the special moments from ITQAN's first edition</p>
                        <div class="divider-gold mx-auto mt-3" style="width: 60px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Carousel instead of static grid -->
            <div class="row">
                <div class="col-12">
                    <div id="eventCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
                        <!-- Carousel indicators -->
                        <div class="carousel-indicators">
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="3" aria-label="Slide 4"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="4" aria-label="Slide 5"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="5" aria-label="Slide 6"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="6" aria-label="Slide 7"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="7" aria-label="Slide 8"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="8" aria-label="Slide 9"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="9" aria-label="Slide 10"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="10" aria-label="Slide 11"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="11" aria-label="Slide 12"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="12" aria-label="Slide 13"></button>
                            <button type="button" data-bs-target="#eventCarousel" data-bs-slide-to="13" aria-label="Slide 14"></button>
                        </div>
                        
                        <!-- Carousel items -->
                        <div class="carousel-inner">
                            <div class="carousel-item active">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/01.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 1">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/02.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 2">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/03.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 3">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/04.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 4">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/05.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 5">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/06.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 6">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/07.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 7">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/08.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 8">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/09.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 9">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/10.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 10">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/11.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 11">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/12.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 12">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/13.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 13">
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="carousel-image-container">
                                    <img src="{{ '/assets/img/islamic/event/14.jpg' | relative_url }}" class="d-block w-100" alt="Event Photo 14">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Carousel controls -->
                        <button class="carousel-control-prev" type="button" data-bs-target="#eventCarousel" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#eventCarousel" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Videos Tab -->
        <div class="tab-pane fade" id="videos" role="tabpanel" aria-labelledby="videos-tab">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="section-header text-center mb-5">
                        <h2 class="h2 mb-3 text-primary fw-bold">Event Videos</h2>
                        <p class="text-muted lead">Watch or download highlights from our competition</p>
                        <div class="divider-gold mx-auto mt-3" style="width: 60px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Video Category Section 1: Tarteel -->
            <div class="video-category-section mb-5">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex align-items-center category-header">
                            <h3 class="h3 mb-0 text-primary fw-bold">Tarteel</h3>
                            <div class="section-divider flex-grow-1 ms-3"></div>
                        </div>
                    </div>
                </div>
                
                <div class="row videos-row pb-2">
                    <!-- Video Item 1 -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="tarteel-01">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/tarteel-01.jpg' | relative_url }}" class="w-100" alt="ITQAN | Qari Fazlurrahman قارئ فضل الرحمٰن">
                                    <div class="video-duration">5:22</div>
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1AxvQ8ojGO31sch6qOVLY4PB-YP17H5bm', 'ITQAN | Qari Fazlurrahman قارئ فضل الرحمٰن', 'tarteel-01')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Qari Fazlurrahman قارئ فضل الرحمٰن</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 2: Saifullah Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="tarteel-02">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/tarteel-02.jpg' | relative_url }}" class="w-100" alt="ITQAN | Saifullah سيف الله">
                                    <div class="video-duration">4:36</div>
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1kSKZmTnDR9BhuwG0UjHuJcPddE2F1MId', 'ITQAN | Saifullah سيف الله', 'tarteel-02')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Saifullah سيف الله</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 3: Qari Nadeem Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="tarteel-03">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/tarteel-03.jpg' | relative_url }}" class="w-100" alt="ITQAN | Qari Nadeem قارئ نديم">
                                    <div class="video-duration">3:47</div>
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1zhmfMiy3XVALqao3ZXFYseZDqASb-AF7', 'ITQAN | Qari Nadeem قارئ نديم', 'tarteel-03')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Qari Nadeem قارئ نديم</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 4: Mohammad Saad Inam Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="tarteel-04">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/tarteel-04.jpg' | relative_url }}" class="w-100" alt="ITQAN | Mohammad Saad Inam محمد سعد إنعام">
                                    <div class="video-duration">4:15</div>
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('14FOIY2H0rqbNFE4_gnE6ya13BtFQNyFB', 'ITQAN | Mohammad Saad Inam محمد سعد إنعام', 'tarteel-04')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Mohammad Saad Inam محمد سعد إنعام</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 5: Pervez Musharraf Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="tarteel-05">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/tarteel-05.jpg' | relative_url }}" class="w-100" alt="ITQAN | Pervez Musharraf پرویز مشرف">
                                    <div class="video-duration">3:58</div>
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1nW-NV4D560zlgXAx2-vVCkEST1orZhzP', 'ITQAN | Pervez Musharraf پرویز مشرف', 'tarteel-05')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Pervez Musharraf پرویز مشرف</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 6: Mohd Khalil Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="tarteel-06">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/tarteel-06.jpg' | relative_url }}" class="w-100" alt="ITQAN | Mohd Khalil">
                                    <div class="video-duration">4:42</div>
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1npgmXXaP72w0PdlG-7-F623eVbZFr4Zj', 'ITQAN | Mohd Khalil', 'tarteel-06')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Mohd Khalil</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 7: Syed Affan Ahmad Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="tarteel-07">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/tarteel-07.jpg' | relative_url }}" class="w-100" alt="ITQAN | Syed Affan Ahmad">
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1ArWsVUM2Ix6MkCrZCugpYvqjajgFqxbi', 'ITQAN | Syed Affan Ahmad', 'tarteel-07')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Syed Affan Ahmad</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 8: Sumama Haseeb Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="tarteel-08">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/tarteel-08.jpg' | relative_url }}" class="w-100" alt="ITQAN | Sumama Haseeb">
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('15VihMXmkbfH2vTy9tzj1wTc2NtpS89i1', 'ITQAN | Sumama Haseeb', 'tarteel-08')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Sumama Haseeb</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 9: Obaidullah Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="tarteel-09">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/tarteel-09.jpg' | relative_url }}" class="w-100" alt="ITQAN | Obaidullah">
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1pbLBWPvPBZrf0nNuYX6q3RRYTzPyqr1J', 'ITQAN | Obaidullah', 'tarteel-09')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Obaidullah</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 10: Muhammad Sufyan Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="tarteel-10">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/tarteel-10.jpg' | relative_url }}" class="w-100" alt="ITQAN | Muhammad Sufyan">
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1LiWtiCoCypsHk9DTRqxsMuPE7L3oSEZL', 'ITQAN | Muhammad Sufyan', 'tarteel-10')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Muhammad Sufyan</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 11: Mohd Akhtar Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="tarteel-11">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/tarteel-11.jpg' | relative_url }}" class="w-100" alt="ITQAN | Mohd Akhtar">
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1MkcSvjF3qE9iiwHFE65-H-61nxJqER8A', 'ITQAN | Mohd Akhtar', 'tarteel-11')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Mohd Akhtar</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 12: Arman Aghwani Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="tarteel-12">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/tarteel-12.jpg' | relative_url }}" class="w-100" alt="ITQAN | Arman Aghwani">
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1c-ZMy51J4aC3FHXTVcFaaGvYs9tDfsHC', 'ITQAN | Arman Aghwani', 'tarteel-12')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Arman Aghwani</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Video Category Section 2: Azan -->
            <div class="video-category-section mb-5">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex align-items-center category-header">
                            <h3 class="h3 mb-0 text-primary fw-bold">Azan</h3>
                            <div class="section-divider flex-grow-1 ms-3"></div>
                        </div>
                    </div>
                </div>
                
                <div class="row videos-row pb-2">
                    <!-- Video Item 1 -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="azan-02">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/azan-02.jpg' | relative_url }}" class="w-100" alt="ITQAN | Mohd Umar محمد عمر">
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1mtFQm29xKcWHk0OBpWEtsiI0XVmPczJb', 'ITQAN | Mohd Umar محمد عمر', 'azan-02')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Mohd Umar محمد عمر</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 2: Qari Azam Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="azan-01">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/azan-01.jpg' | relative_url }}" class="w-100" alt="ITQAN | Qari Azam قارئ أعظم">
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('11n-pM-hT1I4o-TJ-ITC13t6K0e4Z8czi', 'ITQAN | Qari Azam قارئ أعظم', 'azan-01')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Qari Azam قارئ أعظم</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 3: Nadir Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="azan-03">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/azan-03.jpg' | relative_url }}" class="w-100" alt="ITQAN | Nadir">
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1SGpctDjH38gs0wajETKzkV6l0EjtuJIk', 'ITQAN | Nadir', 'azan-03')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Nadir</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 4: Muhammad Usama Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="azan-04">
                        <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/azan-04.jpg' | relative_url }}" class="w-100" alt="ITQAN | Muhammad Usama">
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1jmWc9tI8eVXG_RtumYsa7sW6p-TceSXQ', 'ITQAN | Muhammad Usama', 'azan-04')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Muhammad Usama</div>
                        </div>
                    </div>
                    
                    <!-- Video Item 5: Md Shaukat Ali Video -->
                    <div class="col-md-6 col-lg-4 col-xl-3">
                        <div class="card video-card h-100 border-0 shadow-sm rounded-3 overflow-hidden" data-video-id="azan-05">
                            <div class="card-body p-0">
                                <div class="video-thumbnail position-relative">
                                    <img src="{{ '/assets/img/islamic/event/azan-05.jpg' | relative_url }}" class="w-100" alt="ITQAN | Md Shaukat Ali">
                                    <div class="video-overlay">
                                        <button class="video-play-btn" onclick="playGDriveVideoInModal('1KvmPHsU8kpsh2DjG49h_NQgoNO2p5Z0g', 'ITQAN | Md Shaukat Ali', 'azan-05')">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="video-card-title">ITQAN | Md Shaukat Ali</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Video Category Section 3: Hifz Full Quran -->
            <div class="video-category-section mb-5">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex align-items-center category-header">
                            <h3 class="h3 mb-0 text-primary fw-bold">Hifz Full Quran</h3>
                            <div class="section-divider flex-grow-1 ms-3"></div>
                        </div>
                    </div>
                </div>
                
                <div class="row videos-row pb-2">
                    <!-- No videos yet -->
                    <div class="col-12 text-center py-4">
                        <p class="text-muted fst-italic">Videos coming soon...</p>
                    </div>
                </div>
            </div>
            
            <!-- Video Category Section 4: Hifz Juz 29 & 30 -->
            <div class="video-category-section mb-5">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex align-items-center category-header">
                            <h3 class="h3 mb-0 text-primary fw-bold">Hifz Juz 29 & 30</h3>
                            <div class="section-divider flex-grow-1 ms-3"></div>
                        </div>
                    </div>
                </div>
                
                <div class="row videos-row pb-2">
                    <!-- No videos yet -->
                    <div class="col-12 text-center py-4">
                        <p class="text-muted fst-italic">Videos coming soon...</p>
                    </div>
                </div>
            </div>
            
            <!-- Video Category Section 5: Hifz Juz 30 -->
            <div class="video-category-section mb-5">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex align-items-center category-header">
                            <h3 class="h3 mb-0 text-primary fw-bold">Hifz Juz 30</h3>
                            <div class="section-divider flex-grow-1 ms-3"></div>
                        </div>
                    </div>
                </div>
                
                <div class="row videos-row pb-2">
                    <!-- No videos yet -->
                    <div class="col-12 text-center py-4">
                        <p class="text-muted fst-italic">Videos coming soon...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Find Your Photos Tab -->
        <div class="tab-pane fade" id="find-photos" role="tabpanel" aria-labelledby="find-photos-tab">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="section-header text-center mb-5">
                        <h2 class="h3 mb-3 text-primary">Find Your Photos</h2>
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
    :root {
        --primary-blue: #102B4C;
        --accent-gold: #e2c27d;
        --text-dark: #2A3342;
        --text-muted: #5D6B7F;
        --card-shadow: 0 10px 20px rgba(0,0,0,0.08);
        --hover-shadow: 0 15px 30px rgba(0,0,0,0.15);
    }
    
    body {
        font-family: 'Poppins', 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;
        color: var(--text-dark);
    }
    
    /* Add subtle background pattern */
    .tab-pane#videos {
        background-image: 
            radial-gradient(#e2c27d15 1px, transparent 1px),
            radial-gradient(#102b4c08 1px, transparent 1px);
        background-size: 40px 40px;
        background-position: 0 0, 20px 20px;
        background-attachment: fixed;
    }
    
    h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6 {
        font-weight: 600;
    }
    
    .text-primary {
        color: var(--primary-blue) !important;
    }
    
    .text-secondary {
        color: var(--text-dark) !important;
    }
    
    .text-muted {
        color: var(--text-muted) !important;
    }
    
    .divider-gold {
        height: 3px;
        width: 80px;
        background: linear-gradient(45deg, #957718, var(--accent-gold));
        border-radius: 3px;
    }
    
    .gallery-card {
        transition: all 0.3s ease;
        border: none;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        background: transparent;
    }
    
    .gallery-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    
    .gallery-card img {
        height: 240px;
        width: 100%;
        object-fit: cover;
        transition: all 0.5s ease;
        border-radius: 12px;
    }
    
    .gallery-card:hover img {
        transform: scale(1.05);
    }
    
    /* Carousel Styling */
    #eventCarousel {
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        margin-bottom: 3rem;
    }
    
    .carousel-image-container {
        height: 500px;
        overflow: hidden;
        position: relative;
    }
    
    .carousel-image-container img {
        object-fit: cover;
        width: 100%;
        height: 100%;
    }
    
    /* Improved carousel animations */
    .carousel-item {
        transition: transform 0.8s ease;
    }
    
    /* Right to Left movement - refined for smoother animation */
    .carousel-item-start {
        transform: translateX(0);
    }
    
    .carousel-item-end {
        transform: translateX(-100%);
    }
    
    .carousel-item-next:not(.carousel-item-start) {
        transform: translateX(100%);
    }
    
    .carousel-item-prev:not(.carousel-item-end) {
        transform: translateX(-100%);
    }
    
    .carousel-control-prev,
    .carousel-control-next {
        width: 50px;
        height: 50px;
        background-color: rgba(16, 43, 76, 0.6);
        border-radius: 50%;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0;
        transition: all 0.3s ease;
        margin: 0 15px;
    }
    
    #eventCarousel:hover .carousel-control-prev,
    #eventCarousel:hover .carousel-control-next {
        opacity: 1;
    }
    
    .carousel-control-prev-icon,
    .carousel-control-next-icon {
        width: 20px;
        height: 20px;
    }
    
    .carousel-indicators {
        bottom: 20px;
    }
    
    .carousel-indicators button {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin: 0 5px;
        background-color: rgba(255, 255, 255, 0.6);
        border: 2px solid rgba(16, 43, 76, 0.5);
    }
    
    .carousel-indicators button.active {
        background-color: var(--primary-blue);
        border-color: var(--accent-gold);
    }
    
    .video-placeholder {
        background: rgba(7, 0, 44, 0.1);
        border-radius: 16px;
        padding: 3rem;
        display: inline-block;
    }
    
    /* Gallery Tabs Styling */
    .gallery-tabs {
        border-bottom: 1px solid rgba(16, 43, 76, 0.1);
        margin-bottom: 2rem;
    }
    
    .gallery-tabs .nav-link {
        color: var(--text-muted);
        border: none;
        padding: 1rem 1.5rem;
        font-weight: 500;
        border-bottom: 3px solid transparent;
        background: transparent;
        transition: all 0.3s ease;
    }
    
    .gallery-tabs .nav-link:hover {
        color: var(--primary-blue);
        border-color: rgba(16, 43, 76, 0.3);
    }
    
    .gallery-tabs .nav-link.active {
        color: var(--primary-blue);
        background: transparent;
        border-color: var(--primary-blue);
    }
    
    .gallery-tabs .nav-link i {
        color: var(--accent-gold);
    }
    
    .section-header {
        position: relative;
    }
    
    /* Card styling */
    .card-footer {
        background-color: #f8f9fb;
        border-top: 1px solid rgba(16, 43, 76, 0.1);
    }
    
    .card-footer h5 {
        color: var(--primary-blue);
        font-weight: 600;
    }
    
    /* Video Section Styling */
    .video-player-container {
        position: relative;
        background-color: #000;
    }
    
    .google-drive-player {
        height: 550px;
        border: none;
        outline: none;
    }
    
    .video-player-container video {
        max-height: 550px;
        outline: none;
    }
    
    .video-controls {
        border-top: 1px solid rgba(16, 43, 76, 0.1);
    }
    
    .video-controls .btn-outline-primary {
        color: var(--primary-blue);
        border-color: var(--primary-blue);
    }
    
    .video-controls .btn-outline-primary:hover {
        background-color: var(--primary-blue);
        color: #fff;
    }
    
    .video-controls .btn-primary {
        background-color: var(--primary-blue);
        border-color: var(--primary-blue);
    }
    
    .video-controls .btn-primary:hover {
        background-color: #0a1e35;
    }
    
    /* Enhanced Video Category Section Styling */
    .video-category-section {
        padding-bottom: 30px;
        position: relative;
        margin-bottom: 40px;
    }
    
    .category-header {
        position: relative;
        padding: 15px 0;
        margin-bottom: 10px;
    }
    
    .category-header:before {
        content: '';
        position: absolute;
        top: 0;
        left: -15px;
        width: 5px;
        height: 100%;
        background: linear-gradient(to bottom, var(--accent-gold), rgba(226, 194, 125, 0.3));
        border-radius: 10px;
        transform: scaleY(0.8);
        transition: transform 0.3s ease;
    }
    
    .video-category-section:hover .category-header:before {
        transform: scaleY(1);
    }
    
    .video-category-section h3 {
        font-size: 1.5rem;
        position: relative;
        display: inline-block;
        padding-bottom: 10px;
        transition: transform 0.3s ease;
    }
    
    .video-category-section:hover h3 {
        transform: translateX(3px);
    }
    
    .video-category-section h3:after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 40px;
        height: 3px;
        background: var(--accent-gold);
        transition: width 0.3s ease;
    }
    
    .video-category-section:hover h3:after {
        width: 100%;
    }
    
    .section-divider {
        height: 2px;
        background: linear-gradient(90deg, var(--accent-gold) 0%, rgba(226, 194, 125, 0.1) 100%);
        margin-left: 20px;
        position: relative;
        overflow: hidden;
    }
    
    .section-divider:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.1));
        transform: translateX(-100%);
        animation: shine 3s infinite;
    }
    
    @keyframes shine {
        0% { transform: translateX(-100%); }
        20% { transform: translateX(100%); }
        100% { transform: translateX(100%); }
    }
    
    .videos-row {
        padding: 10px 0;
        margin-left: -10px;
        margin-right: -10px;
    }
    
    .videos-row [class*="col-"] {
        padding-left: 15px;
        padding-right: 15px;
        margin-bottom: 30px;
    }
    
    @media (min-width: 992px) {
        .videos-row [class*="col-"] {
            padding-left: 20px;
            padding-right: 20px;
        }
        
        .videos-row {
            margin-left: -15px;
            margin-right: -15px;
        }
    }
    
    /* Enhanced Video Cards - YouTube Style */
    .video-card {
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        height: 100%;
        box-shadow: none;
        border-radius: 0;
        overflow: visible;
        transform: translateZ(0);
        backface-visibility: hidden;
        position: relative;
        background: transparent;
        padding: 0 4px;
    }
    
    .video-card:hover {
        transform: none;
        box-shadow: none;
    }
    
    .card-body {
        padding: 0 !important;
        margin: 0 !important;
        line-height: 0;
    }
    
    .video-thumbnail {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%;
        overflow: hidden;
        transition: all 0.3s ease;
        margin: 0;
        display: block;
        border-radius: 10px;
    }
    
    .video-thumbnail img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: all 0.3s ease;
    }
    
    .video-thumbnail:before {
        content: none;
    }
    
    .video-card-title {
        padding: 12px 8px 12px 0;
        font-weight: 500;
        color: #0f0f0f;
        font-size: 14px;
        line-height: 1.4;
        position: relative;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        background: transparent;
        margin: 0;
        letter-spacing: 0.2px;
        display: block;
    }
    
    .video-duration {
        position: absolute;
        bottom: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 2px 4px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        z-index: 2;
    }
    
    .video-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 2;
    }
    
    .video-thumbnail:hover .video-overlay {
        opacity: 1;
    }
    
    .video-play-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
        font-size: 18px;
        transform: scale(0.9);
    }
    
    .video-thumbnail:hover .video-play-btn {
        transform: scale(1);
        background: rgba(255, 0, 0, 0.8);
    }
    
    .video-play-btn:hover {
        transform: scale(1.1);
        background: rgba(255, 0, 0, 1);
    }
    
    .videos-row {
        padding: 10px 0;
        margin-left: -8px;
        margin-right: -8px;
    }
    
    .videos-row [class*="col-"] {
        padding-left: 8px;
        padding-right: 8px;
        margin-bottom: 24px;
    }
    
    @media (min-width: 992px) {
        .videos-row [class*="col-"] {
            padding-left: 12px;
            padding-right: 12px;
        }
        
        .videos-row {
            margin-left: -12px;
            margin-right: -12px;
        }
    }
    
    /* Tab content transition */
    .tab-pane {
        transition: opacity 0.3s ease-in-out;
    }
    
    .tab-pane.fade {
        opacity: 0;
    }
    
    .tab-pane.fade.show {
        opacity: 1;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .gallery-card img {
            height: 200px;
        }
        
        .gallery-tabs .nav-link {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
        }
        
        .carousel-image-container {
            height: 300px;
        }
        
        .carousel-control-prev,
        .carousel-control-next {
            width: 40px;
            height: 40px;
            margin: 0 10px;
        }
        
        .video-category-section .col-md-6 {
            width: 50%;
            padding: 0 8px;
        }
        
        .video-play-btn {
            width: 60px;
            height: 60px;
            font-size: 20px;
        }
    }
    
    .share-buttons .btn {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
    }
    
    .share-buttons .btn i {
        margin-right: 4px;
    }
    
    .share-buttons .btn-outline-primary {
        color: var(--primary-blue);
        border-color: var(--primary-blue);
    }
    
    .share-buttons .btn-outline-primary:hover {
        background-color: var(--primary-blue);
        color: white;
    }
    
    /* Video Modal Enhanced Styles */
    .modal-dialog {
        margin: 1rem auto;
        max-width: 90%;
        width: 900px;
    }
    
    .modal-content {
        border: none;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .modal-header {
        padding: 1rem 1.5rem;
        background: transparent;
    }
    
    .modal-title {
        font-size: 1.25rem;
        line-height: 1.4;
        color: var(--text-dark);
        max-width: 90%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .btn-close {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 0.75rem;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .btn-close:hover {
        background-color: rgba(0, 0, 0, 0.1);
        transform: scale(1.1);
    }
    
    .video-container {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%;
        height: 0;
        overflow: hidden;
        background: #000;
        border-radius: 8px;
        margin: 0 auto;
    }
    
    .video-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
    }
    
    .modal-footer {
        padding: 1rem 1.5rem 1.25rem;
    }
    
    .share-buttons .btn {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        border-width: 2px;
        transition: all 0.2s ease;
    }
    
    .share-buttons .btn:hover {
        transform: translateY(-1px);
    }
    
    .share-buttons .btn i {
        margin-right: 6px;
        font-size: 1rem;
    }
    
    #downloadBtn {
        padding: 0.5rem 1.25rem;
        font-weight: 500;
        transition: all 0.2s ease;
        border-width: 2px;
    }
    
    #downloadBtn:hover {
        transform: translateY(-1px);
    }
    
    /* Media query for larger screens */
    @media (min-width: 1200px) {
        .modal-dialog {
            max-width: 1000px;
        }
    }
    
    /* Media query for medium screens */
    @media (min-width: 768px) and (max-width: 1199px) {
        .modal-dialog {
            max-width: 85%;
            margin: 2rem auto;
        }
    }
    
    /* Media query for mobile screens */
    @media (max-width: 767px) {
        .modal-dialog {
            margin: 0;
            max-width: 100%;
            height: 100%;
        }
        
        .modal-content {
            height: 100%;
            border-radius: 0;
        }
        
        .modal-header {
            padding: 1rem;
        }
        
        .video-container {
            border-radius: 0;
        }
        
        .modal-footer {
            padding: 1rem;
            background: #fff;
        }
        
        .share-buttons {
            justify-content: center;
            width: 100%;
        }
        
        .share-buttons .btn {
            flex: 1;
            min-width: auto;
            padding: 0.5rem;
        }
        
        #downloadBtn {
            width: 100%;
            margin-top: 0.5rem;
        }
    }
    
    /* Ad Banner Styles */
    .ad-banner-container {
        background-color: rgba(248, 249, 250, 0.5);
        text-align: center;
    }
    
    .google-ads-wrapper {
        margin: 0 auto;
        min-height: 90px;
        display: flex;
        justify-content: center;
    }
    
    .adsbygoogle {
        width: 100%;
    }
    
    .ad-disclaimer {
        font-size: 10px;
        color: #888;
        text-align: center;
    }
    
    @media (max-width: 767px) {
        .ad-banner-container {
            padding: 10px 5px;
        }
    }
    
    /* Share button styles */
    #shareButton {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        padding: 0.5rem 1.25rem;
        transition: all 0.2s ease;
    }
    
    #shareButton i {
        font-size: 1rem;
    }
    
    /* Fallback Share Modal styles */
    .share-fallback-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1060;
    }
    
    .share-fallback-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1059;
    }
    
    .share-fallback-content {
        position: relative;
        background-color: white;
        border-radius: 20px 20px 0 0;
        padding: 1.5rem;
        box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.2);
        z-index: 1060;
    }
    
    .share-options-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .share-option-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        padding: 0.75rem;
        border-radius: 12px;
        transition: all 0.2s ease;
    }
    
    .share-option-btn:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
    
    .share-option-btn i {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: var(--primary-blue);
    }
    
    .share-option-btn span {
        font-size: 0.8rem;
        color: #333;
    }
    
    @media (max-width: 767px) {
        .share-options-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }
    
    @media (max-width: 480px) {
        .share-options-grid {
            grid-template-columns: repeat(2, 1fr);
        }
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
        });
        
        // Initialize carousel with 5-second interval
        var myCarousel = document.getElementById('eventCarousel');
        var carousel = new bootstrap.Carousel(myCarousel, {
            interval: 5000,
            wrap: true,
            ride: 'carousel'
        });

        // Check for video ID in URL on page load
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get('video');
        if (videoId) {
            const videoCard = document.querySelector(`[data-video-id="${videoId}"]`);
            if (videoCard) {
                const playBtn = videoCard.querySelector('.video-play-btn');
                if (playBtn) {
                    const driveId = playBtn.getAttribute('onclick').match(/'([^']+)'/)[1];
                    const title = playBtn.getAttribute('onclick').match(/'([^']+)'/g)[1].replace(/'/g, '');
                    playGDriveVideoInModal(driveId, title, videoId);
                }
            }
        }
        
        // Create meta tags if they don't exist yet
        createMetaTags();
    });
    
    // Function to create initial meta tags
    function createMetaTags() {
        const head = document.head;
        
        // Helper function to create meta tag
        function createMeta(property, content) {
            // Check if tag already exists
            if (!document.querySelector(`meta[property="${property}"]`)) {
                const meta = document.createElement('meta');
                meta.setAttribute('property', property);
                meta.setAttribute('content', content);
                head.appendChild(meta);
            }
        }
        
        // Default meta values
        const defaultImage = window.location.origin + "{{ '/assets/img/islamic/event/tarteel-01.jpg' | relative_url }}";
        const defaultTitle = "ITQAN Event Gallery";
        const defaultDesc = "Watch videos from the ITQAN competition";
        
        // Create Open Graph tags
        createMeta('og:title', defaultTitle);
        createMeta('og:description', defaultDesc);
        createMeta('og:image', defaultImage);
        createMeta('og:url', window.location.href);
        createMeta('og:type', 'website');
        
        // Create Twitter Card tags
        createMeta('twitter:card', 'summary_large_image');
        createMeta('twitter:title', defaultTitle);
        createMeta('twitter:description', defaultDesc);
        createMeta('twitter:image', defaultImage);
        
        // Store original values
        window.originalMeta = {
            title: defaultTitle,
            description: defaultDesc,
            image: defaultImage,
            url: window.location.href
        };
    }
    
    // Google Drive Video Modal Player
    function playGDriveVideoInModal(driveId, videoTitle, videoId) {
        // Update URL with video ID
        const url = new URL(window.location.href);
        url.searchParams.set('video', videoId);
        window.history.pushState({}, '', url);
        
        // Update page title to include video name
        document.title = videoTitle;
        
        // Update meta tags for better social sharing
        updateMetaTags(videoTitle, videoId);
        
        // Create modal if it doesn't exist
        if (!document.getElementById('videoModal')) {
            const modalHTML = `
                <div class="modal fade" id="videoModal" tabindex="-1" aria-labelledby="videoModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content bg-light">
                            <div class="modal-header border-0 pb-0">
                                <h5 class="modal-title text-dark fw-bold" id="videoModalLabel"></h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body p-0">
                                <div class="video-container shadow-sm">
                                    <iframe id="modalDriveVideo" class="w-100" allowfullscreen></iframe>
                                </div>
                                
                                <!-- Google Ads Container -->
                                <div class="ad-banner-container mt-3 px-3 pb-2">
                                    <div class="ad-disclaimer mb-1">
                                        <small class="text-muted">Advertisement</small>
                                    </div>
                                    <div class="google-ads-wrapper">
                                        <!-- Itqan Video Modal Ad -->
                                        <ins class="adsbygoogle"
                                             style="display:block"
                                             data-ad-client="ca-pub-7992841738035545"
                                             data-ad-slot="1091585776"
                                             data-ad-format="auto"
                                             data-full-width-responsive="true"></ins>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer border-0 pt-2">
                                <div class="container-fluid px-0">
                                    <div class="row align-items-center">
                                        <div class="col-12 col-md-8 mb-3 mb-md-0">
                                            <div class="share-buttons d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                                                <button class="btn btn-outline-primary btn-sm rounded-pill" id="shareButton" onclick="shareContent()">
                                                    <i class="fas fa-share-alt me-2"></i>Share
                                                </button>
                                                <div id="fallbackShareModal" class="share-fallback-container d-none">
                                                    <div class="share-fallback-overlay" onclick="toggleFallbackShare()"></div>
                                                    <div class="share-fallback-content">
                                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                                            <h5 class="m-0">Share this video</h5>
                                                            <button class="btn-close" onclick="toggleFallbackShare()"></button>
                                                        </div>
                                                        <div class="share-options-grid">
                                                            <button class="share-option-btn" onclick="shareVideo('facebook')">
                                                                <i class="fab fa-facebook"></i>
                                                                <span>Facebook</span>
                                                            </button>
                                                            <button class="share-option-btn" onclick="shareVideo('twitter')">
                                                                <i class="fab fa-twitter"></i>
                                                                <span>Twitter</span>
                                                            </button>
                                                            <button class="share-option-btn" onclick="shareVideo('whatsapp')">
                                                                <i class="fab fa-whatsapp"></i>
                                                                <span>WhatsApp</span>
                                                            </button>
                                                            <button class="share-option-btn" onclick="shareVideo('telegram')">
                                                                <i class="fab fa-telegram"></i>
                                                                <span>Telegram</span>
                                                            </button>
                                                            <button class="share-option-btn" onclick="shareVideo('linkedin')">
                                                                <i class="fab fa-linkedin"></i>
                                                                <span>LinkedIn</span>
                                                            </button>
                                                            <button class="share-option-btn" onclick="shareVideo('email')">
                                                                <i class="fas fa-envelope"></i>
                                                                <span>Email</span>
                                                            </button>
                                                            <button class="share-option-btn" onclick="copyShareLink()">
                                                                <i class="fas fa-link"></i>
                                                                <span>Copy Link</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-4 text-center text-md-end">
                                            <a id="downloadBtn" href="" class="btn btn-primary btn-sm rounded-pill px-4" target="_blank">
                                                <i class="fas fa-download me-2"></i>Download
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Set video source and title
        document.getElementById('modalDriveVideo').src = `https://drive.google.com/file/d/${driveId}/preview`;
        document.getElementById('videoModalLabel').textContent = videoTitle;
        document.getElementById('downloadBtn').href = `https://drive.google.com/uc?export=download&id=${driveId}`;
        
        // Show modal
        new bootstrap.Modal(document.getElementById('videoModal')).show();
        
        // Load Google Ads after modal is shown
        setTimeout(function() {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error('Error loading ads:', e);
            }
        }, 500);
    }

    // Function to handle social sharing
    function shareContent() {
        const url = window.location.href;
        const title = document.getElementById('videoModalLabel').textContent;
        
        // Try to use Web Share API if available (modern browsers and mobile)
        if (navigator.share) {
            navigator.share({
                title: title,
                text: title,
                url: url
            })
            .catch(error => {
                console.error('Error sharing:', error);
                toggleFallbackShare(); // Show fallback on error
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            toggleFallbackShare();
        }
    }

    // Toggle fallback share modal
    function toggleFallbackShare() {
        const fallbackModal = document.getElementById('fallbackShareModal');
        fallbackModal.classList.toggle('d-none');
    }

    // Function to handle sharing to specific platforms
    function shareVideo(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.getElementById('videoModalLabel').textContent);
        
        let shareUrl;
        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${title}%20${url}`;
                break;
            case 'telegram':
                shareUrl = `https://telegram.me/share/url?url=${url}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${title}&body=${title}%0A${url}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
        
        // Close the fallback share modal
        toggleFallbackShare();
    }

    // Function to copy share link to clipboard
    function copyShareLink() {
        const url = window.location.href;
        
        navigator.clipboard.writeText(url)
            .then(() => {
                // Show success message
                const shareButton = document.getElementById('shareButton');
                const originalText = shareButton.innerHTML;
                
                shareButton.innerHTML = '<i class="fas fa-check me-2"></i>Copied!';
                
                setTimeout(() => {
                    shareButton.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
        
        // Close the fallback share modal
        toggleFallbackShare();
    }

    // Function to update meta tags for social sharing
    function updateMetaTags(videoTitle, videoId) {
        // Get the thumbnail image path - using absolute URL
        const thumbnailPath = `/assets/img/islamic/event/${videoId}.jpg`;
        const absoluteUrl = window.location.origin + "{{ site.baseurl }}" + thumbnailPath;
        
        // Function to update a meta tag
        function updateMetaTag(property, content) {
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        }
        
        // Update Open Graph meta tags
        updateMetaTag('og:title', videoTitle);
        updateMetaTag('og:description', `Watch ${videoTitle} from the ITQAN competition`);
        updateMetaTag('og:image', absoluteUrl);
        updateMetaTag('og:url', window.location.href);
        updateMetaTag('og:type', 'video.other');
        
        // Update Twitter Card meta tags
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', videoTitle);
        updateMetaTag('twitter:description', `Watch ${videoTitle} from the ITQAN competition`);
        updateMetaTag('twitter:image', absoluteUrl);
    }

    // Reset meta tags when modal is closed
    function resetMetaTags() {
        if (window.originalMeta) {
            // Function to update a meta tag
            function updateMetaTag(property, content) {
                let meta = document.querySelector(`meta[property="${property}"]`);
                if (meta) {
                    meta.setAttribute('content', content);
                }
            }
            
            // Reset Open Graph meta tags
            updateMetaTag('og:title', window.originalMeta.title);
            updateMetaTag('og:description', window.originalMeta.description);
            updateMetaTag('og:image', window.originalMeta.image);
            updateMetaTag('og:url', window.originalMeta.url);
            updateMetaTag('og:type', 'website');
            
            // Reset Twitter Card meta tags
            updateMetaTag('twitter:title', window.originalMeta.title);
            updateMetaTag('twitter:description', window.originalMeta.description);
            updateMetaTag('twitter:image', window.originalMeta.image);
        }
    }

    // Handle modal close to update URL and stop video
    document.addEventListener('hidden.bs.modal', function (event) {
        if (event.target.id === 'videoModal') {
            // Update URL to remove video parameter
            const url = new URL(window.location.href);
            url.searchParams.delete('video');
            window.history.pushState({}, '', url);
            
            // Reset page title
            document.title = "Event Gallery";
            
            // Reset meta tags
            resetMetaTags();
            
            // Stop video playback by clearing the iframe source
            const videoFrame = document.getElementById('modalDriveVideo');
            if (videoFrame) {
                videoFrame.src = '';
            }
        }
    });

    // Also handle when modal is closed via escape key or clicking outside
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('videoModal');
            if (modal) {
                const videoFrame = document.getElementById('modalDriveVideo');
                if (videoFrame) {
                    videoFrame.src = '';
                }
            }
        }
    });

    // Handle clicking outside modal
    document.addEventListener('click', function(event) {
        const modal = document.getElementById('videoModal');
        if (modal && event.target === modal) {
            const videoFrame = document.getElementById('modalDriveVideo');
            if (videoFrame) {
                videoFrame.src = '';
            }
        }
    });

    // Function to initialize Google AdSense
    function initGoogleAds() {
        var script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7992841738035545';
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    }

    // Initialize Google AdSense when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize other functionality
        // ...existing DOMContentLoaded code...
        
        // Initialize Google AdSense
        initGoogleAds();
    });
</script> 