const CLOUD_NAME = 'dsgrl4zf8';

class BirthdayWebsite {
    constructor() {
        this.imageSlider = {
            currentSlide: 0,
            autoplayTimer: null,
            isAutoplayPaused: false,
            data: []
        };
        this.videoSlider = {
            currentSlide: 0,
            autoplayTimer: null,
            isAutoplayPaused: false,
            data: []
        };
        this.allGalleryData = [];
        this.keyboardListenerSetup = false;

        this.init();
    }

    async init() {
        this.initParticles();
        await this.loadGalleryData();
        this.initGallery();
        this.initScrollAnimations();
        this.startAutoplay();
        await this.loadSpecialMessage();
    }

    async loadGalleryData() {
        try {
            // Wait for Firebase to be ready
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds

            while (!window.galleryData && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (window.galleryData) {
                this.allGalleryData = await window.galleryData.getItems();
                console.log('✅ Loaded', this.allGalleryData.length, 'items from Firestore');

                // Separate images and videos
                this.separateMediaTypes();

                // Set up real-time listener for updates
                window.galleryData.listen((items) => {
                    console.log('🔄 Real-time update received:', items.length, 'items');
                    this.allGalleryData = items;
                    this.separateMediaTypes();
                    this.refreshAllGalleries();
                });

                // Set up real-time listener for special message updates
                window.galleryData.listenToSpecialMessage((specialMessage) => {
                    console.log('🔄 Special message update received');
                    this.renderSpecialMessage(specialMessage);
                });

            } else {
                throw new Error('Gallery data system not available');
            }

        } catch (error) {
            console.error('❌ Error loading gallery data:', error);
            this.allGalleryData = [];
            this.separateMediaTypes();
            this.showEmptyGalleryMessages();
        }
    }

    separateMediaTypes() {
        // Separate images and videos based on type and file extension
        this.imageSlider.data = this.allGalleryData.filter(item => this.isImage(item));
        this.videoSlider.data = this.allGalleryData.filter(item => this.isVideo(item));

        console.log('📸 Images:', this.imageSlider.data.length);
        console.log('🎬 Videos:', this.videoSlider.data.length);
    }

    isImage(item) {
        if (item.type === 'image') return true;
        if (item.type === 'video') return false;

        // Check by file extension if type is not clear
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
        const publicId = item.imageId || '';
        const extension = publicId.split('.').pop()?.toLowerCase();

        return imageExtensions.includes(extension);
    }

    isVideo(item) {
        if (item.type === 'video') return true;
        if (item.type === 'image') return false;

        // Check by file extension if type is not clear
        const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv', '3gp', 'm4v'];
        const publicId = item.imageId || '';
        const extension = publicId.split('.').pop()?.toLowerCase();

        return videoExtensions.includes(extension);
    }

    showEmptyGalleryMessages() {
        this.showEmptyImageGallery();
        this.showEmptyVideoGallery();
    }

    showEmptyImageGallery() {
        const container = document.getElementById('image-gallery-container');
        container.innerHTML = `
            <div class="empty-gallery">
                <div style="text-align: center; padding: 60px 20px; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">📸</div>
                    <h3 style="font-family: var(--font-heading); margin-bottom: 10px;">No photos uploaded yet!</h3>
                    <p>Upload some beautiful photos for Nonie using the <a href="upload.html" style="color: var(--rose-gold);">upload page</a>.</p>
                </div>
            </div>
        `;
    }

    showEmptyVideoGallery() {
        const container = document.getElementById('video-gallery-container');
        container.innerHTML = `
            <div class="empty-gallery">
                <div style="text-align: center; padding: 60px 20px; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">🎬</div>
                    <h3 style="font-family: var(--font-heading); margin-bottom: 10px;">No videos uploaded yet!</h3>
                    <p>Upload some special video messages for Nonie using the <a href="upload.html" style="color: var(--rose-gold);">upload page</a>.</p>
                </div>
            </div>
        `;
    }

    refreshAllGalleries() {
        this.refreshImageGallery();
        this.refreshVideoGallery();

        // Re-setup controls after refresh
        setTimeout(() => {
            this.setupImageGalleryControls();
            this.setupVideoGalleryControls();
            this.setupHoverEffects();
        }, 100);
    }

    refreshImageGallery() {
        // Clear existing gallery
        const container = document.getElementById('image-gallery-container');
        container.innerHTML = '';

        // Recreate gallery with new data
        this.createImageGalleryHTML();

        // Reset current slide
        this.imageSlider.currentSlide = 0;

        // Restart autoplay if we have content
        if (this.imageSlider.autoplayTimer) {
            clearInterval(this.imageSlider.autoplayTimer);
        }
        this.startImageAutoplay();
    }

    refreshVideoGallery() {
        // Clear existing gallery
        const container = document.getElementById('video-gallery-container');
        container.innerHTML = '';

        // Recreate gallery with new data
        this.createVideoGalleryHTML();

        // Reset current slide
        this.videoSlider.currentSlide = 0;

        // Restart autoplay if we have content
        if (this.videoSlider.autoplayTimer) {
            clearInterval(this.videoSlider.autoplayTimer);
        }
        this.startVideoAutoplay();
    }

    // Particle Animation System
    initParticles() {
        const canvas = document.getElementById('particles-canvas');
        const ctx = canvas.getContext('2d');

        let particles = [];
        let animationId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticle = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            color: `rgba(183, 110, 121, ${Math.random() * 0.3 + 0.1})`
        });

        const initParticlesArray = () => {
            particles = [];
            const particleCount = Math.min(50, Math.floor(canvas.width * canvas.height / 15000));

            for (let i = 0; i < particleCount; i++) {
                particles.push(createParticle());
            }
        };

        const updateParticles = () => {
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

                particle.opacity += (Math.random() - 0.5) * 0.01;
                particle.opacity = Math.max(0.1, Math.min(0.7, particle.opacity));
            });
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.opacity;
                ctx.fill();
            });

            // Draw connections between nearby particles
            particles.forEach((particle, i) => {
                particles.slice(i + 1).forEach(otherParticle => {
                    const distance = Math.sqrt(
                        Math.pow(particle.x - otherParticle.x, 2) +
                        Math.pow(particle.y - otherParticle.y, 2)
                    );

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(183, 110, 121, ${0.1 * (100 - distance) / 100})`;
                        ctx.globalAlpha = 0.3;
                        ctx.stroke();
                    }
                });
            });
        };

        const animate = () => {
            updateParticles();
            drawParticles();
            animationId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        initParticlesArray();
        animate();

        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticlesArray();
        });
    }

    // Gallery System
    initGallery() {
        this.createImageGalleryHTML();
        this.createVideoGalleryHTML();

        // Delay setup to ensure DOM elements are fully rendered
        setTimeout(() => {
            this.setupImageGalleryControls();
            this.setupVideoGalleryControls();
            this.setupHoverEffects();
        }, 100);
    }

    createImageGalleryHTML() {
        const container = document.getElementById('image-gallery-container');

        if (this.imageSlider.data.length === 0) {
            this.showEmptyImageGallery();
            return;
        }

        // Create slides for images
        this.imageSlider.data.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.className = `slide ${index === 0 ? 'active' : ''}`;

            const img = document.createElement('img');
            img.src = item.cloudinaryUrl || this.getCloudinaryUrl(item.imageId);
            img.alt = item.caption;
            img.loading = 'lazy';

            slide.appendChild(img);
            container.appendChild(slide);
        });

        // Create caption container below the slider
        const captionContainer = document.createElement('div');
        captionContainer.className = 'slide-caption-container';
        captionContainer.id = 'image-caption-container';

        this.imageSlider.data.forEach((item, index) => {
            const caption = document.createElement('div');
            caption.className = `slide-caption ${index === 0 ? 'active' : ''}`;
            caption.innerHTML = `<p>"${item.caption || 'Beautiful moment with Nonie 💕'}"</p>`;
            captionContainer.appendChild(caption);
        });

        container.appendChild(captionContainer);

        // Create navigation arrows for images
        this.createNavigationControls(container, 'image');

        // Create dot indicators for images
        this.createDotIndicators(container, this.imageSlider.data.length, 'image');
    }

    createVideoGalleryHTML() {
        const container = document.getElementById('video-gallery-container');

        if (this.videoSlider.data.length === 0) {
            this.showEmptyVideoGallery();
            return;
        }

        // Create slides for videos
        this.videoSlider.data.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.className = `slide ${index === 0 ? 'active' : ''}`;

            const video = document.createElement('video');
            video.src = item.cloudinaryUrl || this.getCloudinaryUrl(item.imageId, 'video');
            video.controls = true;
            video.muted = true;
            video.loop = true;
            video.setAttribute('playsinline', '');
            video.setAttribute('preload', 'metadata');

            slide.appendChild(video);
            container.appendChild(slide);
        });

        // Create caption container below the slider
        const captionContainer = document.createElement('div');
        captionContainer.className = 'slide-caption-container';
        captionContainer.id = 'video-caption-container';

        this.videoSlider.data.forEach((item, index) => {
            const caption = document.createElement('div');
            caption.className = `slide-caption ${index === 0 ? 'active' : ''}`;
            caption.innerHTML = `<p>"${item.caption || 'Beautiful moment with Nonie 💕'}"</p>`;
            captionContainer.appendChild(caption);
        });

        container.appendChild(captionContainer);

        // Create navigation arrows for videos
        this.createNavigationControls(container, 'video');

        // Create dot indicators for videos
        this.createDotIndicators(container, this.videoSlider.data.length, 'video');
    }

    createNavigationControls(container, type) {
        const prevBtn = document.createElement('button');
        prevBtn.className = `nav-arrow prev nav-arrow-${type}`;
        prevBtn.innerHTML = '❮';
        prevBtn.setAttribute('aria-label', `Previous ${type}`);

        const nextBtn = document.createElement('button');
        nextBtn.className = `nav-arrow next nav-arrow-${type}`;
        nextBtn.innerHTML = '❯';
        nextBtn.setAttribute('aria-label', `Next ${type}`);

        container.appendChild(prevBtn);
        container.appendChild(nextBtn);
    }

    createDotIndicators(container, itemCount, type) {
        if (itemCount <= 1) return; // Don't show dots for single items

        const dotsContainer = document.createElement('div');
        dotsContainer.className = `dots-container dots-container-${type}`;

        for (let i = 0; i < itemCount; i++) {
            const dot = document.createElement('button');
            dot.className = `dot dot-${type} ${i === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to ${type} ${i + 1}`);
            dot.dataset.index = i;
            dotsContainer.appendChild(dot);
        }

        container.appendChild(dotsContainer);
    }

    setupImageGalleryControls() {
        const prevBtn = document.querySelector('.nav-arrow-image.prev');
        const nextBtn = document.querySelector('.nav-arrow-image.next');

        console.log('Setting up image gallery controls:', { prevBtn: !!prevBtn, nextBtn: !!nextBtn });

        if (prevBtn && nextBtn) {
            // Remove existing listeners to prevent duplicates
            prevBtn.removeEventListener('click', this.previousImageSlide);
            nextBtn.removeEventListener('click', this.nextImageSlide);

            // Add new listeners
            prevBtn.addEventListener('click', () => {
                console.log('Previous image button clicked');
                this.previousImageSlide();
            });
            nextBtn.addEventListener('click', () => {
                console.log('Next image button clicked');
                this.nextImageSlide();
            });

            console.log('✅ Image navigation buttons set up successfully');
        } else {
            console.log('❌ Image navigation buttons not found');
        }

        // Image dot navigation
        const imageDots = document.querySelectorAll('.dot-image');
        console.log('Setting up image dots:', imageDots.length);
        imageDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                console.log('Image dot clicked:', index);
                this.goToImageSlide(index);
            });
        });
    }

    setupVideoGalleryControls() {
        const prevBtn = document.querySelector('.nav-arrow-video.prev');
        const nextBtn = document.querySelector('.nav-arrow-video.next');

        console.log('Setting up video gallery controls:', { prevBtn: !!prevBtn, nextBtn: !!nextBtn });

        if (prevBtn && nextBtn) {
            // Remove existing listeners to prevent duplicates
            prevBtn.removeEventListener('click', this.previousVideoSlide);
            nextBtn.removeEventListener('click', this.nextVideoSlide);

            // Add new listeners
            prevBtn.addEventListener('click', () => {
                console.log('Previous video button clicked');
                this.previousVideoSlide();
            });
            nextBtn.addEventListener('click', () => {
                console.log('Next video button clicked');
                this.nextVideoSlide();
            });

            console.log('✅ Video navigation buttons set up successfully');
        } else {
            console.log('❌ Video navigation buttons not found');
        }

        // Video dot navigation
        const videoDots = document.querySelectorAll('.dot-video');
        console.log('Setting up video dots:', videoDots.length);
        videoDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                console.log('Video dot clicked:', index);
                this.goToVideoSlide(index);
            });
        });

        // Keyboard navigation for both sliders (only set up once)
        if (!this.keyboardListenerSetup) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    if (this.imageSlider.data.length > 0) this.previousImageSlide();
                    if (this.videoSlider.data.length > 0) this.previousVideoSlide();
                }
                if (e.key === 'ArrowRight') {
                    if (this.imageSlider.data.length > 0) this.nextImageSlide();
                    if (this.videoSlider.data.length > 0) this.nextVideoSlide();
                }
            });
            this.keyboardListenerSetup = true;
            console.log('✅ Keyboard navigation set up');
        }

        // Touch/swipe support for both galleries
        this.setupTouchSupport();
    }

    setupTouchSupport() {
        this.setupTouchForGallery('image-gallery-container', 'image');
        this.setupTouchForGallery('video-gallery-container', 'video');
    }

    setupTouchForGallery(containerId, type) {
        let touchStartX = 0;
        const gallery = document.getElementById(containerId);
        if (!gallery) return;

        gallery.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        gallery.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const difference = touchStartX - touchEndX;

            if (Math.abs(difference) > 50) {
                if (difference > 0) {
                    type === 'image' ? this.nextImageSlide() : this.nextVideoSlide();
                } else {
                    type === 'image' ? this.previousImageSlide() : this.previousVideoSlide();
                }
            }
        });
    }

    setupHoverEffects() {
        // Image gallery hover effects
        const imageGallery = document.getElementById('image-gallery-container');
        if (imageGallery) {
            imageGallery.addEventListener('mouseenter', () => {
                this.imageSlider.isAutoplayPaused = true;
            });

            imageGallery.addEventListener('mouseleave', () => {
                this.imageSlider.isAutoplayPaused = false;
            });
        }

        // Video gallery hover effects
        const videoGallery = document.getElementById('video-gallery-container');
        if (videoGallery) {
            videoGallery.addEventListener('mouseenter', () => {
                this.videoSlider.isAutoplayPaused = true;
            });

            videoGallery.addEventListener('mouseleave', () => {
                this.videoSlider.isAutoplayPaused = false;
            });
        }
    }

    getCloudinaryUrl(imageId, resourceType = 'image') {
        // Construct Cloudinary URL with optimizations
        if (resourceType === 'video') {
            return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/c_scale,w_800,h_600,q_auto,f_auto/${imageId}`;
        } else {
            return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_scale,w_800,h_600,q_auto,f_auto/${imageId}`;
        }
    }

    // Image slider methods
    goToImageSlide(index) {
        const slides = document.querySelectorAll('#image-gallery-container .slide');
        const dots = document.querySelectorAll('.dot-image');
        const captions = document.querySelectorAll('#image-caption-container .slide-caption');

        if (slides.length === 0) return;

        // Remove active class from current slide, dot, and caption
        if (slides[this.imageSlider.currentSlide]) {
            slides[this.imageSlider.currentSlide].classList.remove('active');
        }
        if (dots[this.imageSlider.currentSlide]) {
            dots[this.imageSlider.currentSlide].classList.remove('active');
        }
        if (captions[this.imageSlider.currentSlide]) {
            captions[this.imageSlider.currentSlide].classList.remove('active');
        }

        // Update current slide index
        this.imageSlider.currentSlide = index;

        // Add active class to new slide, dot, and caption
        if (slides[this.imageSlider.currentSlide]) {
            slides[this.imageSlider.currentSlide].classList.add('active');
        }
        if (dots[this.imageSlider.currentSlide]) {
            dots[this.imageSlider.currentSlide].classList.add('active');
        }
        if (captions[this.imageSlider.currentSlide]) {
            captions[this.imageSlider.currentSlide].classList.add('active');
        }

        // Restart Ken Burns animation
        const activeImg = slides[this.imageSlider.currentSlide]?.querySelector('img');
        if (activeImg) {
            activeImg.style.animation = 'none';
            setTimeout(() => {
                activeImg.style.animation = 'kenBurns 6s ease-in-out infinite alternate';
            }, 10);
        }
    }

    nextImageSlide() {
        if (this.imageSlider.data.length === 0) return;
        const nextIndex = (this.imageSlider.currentSlide + 1) % this.imageSlider.data.length;
        this.goToImageSlide(nextIndex);
    }

    previousImageSlide() {
        if (this.imageSlider.data.length === 0) return;
        const prevIndex = (this.imageSlider.currentSlide - 1 + this.imageSlider.data.length) % this.imageSlider.data.length;
        this.goToImageSlide(prevIndex);
    }

    // Video slider methods
    goToVideoSlide(index) {
        const slides = document.querySelectorAll('#video-gallery-container .slide');
        const dots = document.querySelectorAll('.dot-video');
        const captions = document.querySelectorAll('#video-caption-container .slide-caption');

        if (slides.length === 0) return;

        // Remove active class from current slide, dot, and caption
        if (slides[this.videoSlider.currentSlide]) {
            slides[this.videoSlider.currentSlide].classList.remove('active');
        }
        if (dots[this.videoSlider.currentSlide]) {
            dots[this.videoSlider.currentSlide].classList.remove('active');
        }
        if (captions[this.videoSlider.currentSlide]) {
            captions[this.videoSlider.currentSlide].classList.remove('active');
        }

        // Update current slide index
        this.videoSlider.currentSlide = index;

        // Add active class to new slide, dot, and caption
        if (slides[this.videoSlider.currentSlide]) {
            slides[this.videoSlider.currentSlide].classList.add('active');
        }
        if (dots[this.videoSlider.currentSlide]) {
            dots[this.videoSlider.currentSlide].classList.add('active');
        }
        if (captions[this.videoSlider.currentSlide]) {
            captions[this.videoSlider.currentSlide].classList.add('active');
        }
    }

    nextVideoSlide() {
        if (this.videoSlider.data.length === 0) return;
        const nextIndex = (this.videoSlider.currentSlide + 1) % this.videoSlider.data.length;
        this.goToVideoSlide(nextIndex);
    }

    previousVideoSlide() {
        if (this.videoSlider.data.length === 0) return;
        const prevIndex = (this.videoSlider.currentSlide - 1 + this.videoSlider.data.length) % this.videoSlider.data.length;
        this.goToVideoSlide(prevIndex);
    }

    // Autoplay methods
    startAutoplay() {
        this.startImageAutoplay();
        this.startVideoAutoplay();
    }

    startImageAutoplay() {
        if (this.imageSlider.data.length <= 1) return;

        this.imageSlider.autoplayTimer = setInterval(() => {
            if (!this.imageSlider.isAutoplayPaused) {
                this.nextImageSlide();
            }
        }, 6000);
    }

    startVideoAutoplay() {
        if (this.videoSlider.data.length <= 1) return;

        this.videoSlider.autoplayTimer = setInterval(() => {
            if (!this.videoSlider.isAutoplayPaused) {
                this.nextVideoSlide();
            }
        }, 8000); // Slightly longer for videos
    }

    // Special Message Methods
    async loadSpecialMessage() {
        try {
            if (!window.galleryData) {
                console.log('Gallery data not ready for special message');
                return;
            }

            const specialMessage = await window.galleryData.getSpecialMessage();
            this.renderSpecialMessage(specialMessage);

        } catch (error) {
            console.error('❌ Error loading special message:', error);
            this.renderSpecialMessage(null);
        }
    }

    renderSpecialMessage(specialMessage) {
        const container = document.getElementById('special-message-container');
        if (!container) return;

        if (specialMessage && specialMessage.cloudinaryUrl) {
            console.log('✅ Rendering special message');
            container.innerHTML = `
                <div class="special-message-video">
                    <video controls autoplay muted>
                        <source src="${specialMessage.cloudinaryUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div class="slide-caption-container">
                    <div class="slide-caption active">
                        <p>"${specialMessage.caption || 'A special message filled with love for Nonie 💕'}"</p>
                    </div>
                </div>
            `;

            // Add intersection observer for animations
            const videoElement = container.querySelector('.special-message-video');
            if (videoElement) {
                this.observeElement(videoElement);
            }

        } else {
            console.log('No special message to display');
            container.innerHTML = `
                <div class="special-message-empty">
                    <h3>💝 No Special Message Yet</h3>
                    <p>A heartfelt video message will appear here once uploaded!</p>
                    <p><a href="upload.html">Upload a Special Message →</a></p>
                </div>
            `;
        }
    }

    observeElement(element) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        observer.observe(element);
    }

    // Scroll Animations
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        const animatedElements = document.querySelectorAll('.section-title, .special-message-display');
        animatedElements.forEach(el => observer.observe(el));
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BirthdayWebsite();
});

// Handle window load for any additional setup
window.addEventListener('load', () => {
    // Remove any loading states
    document.body.classList.remove('loading');
});

// Handle orientation change on mobile devices
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.location.reload();
    }, 500);
});