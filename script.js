const CLOUD_NAME = 'dsgrl4zf8';

class BirthdayWebsite {
    constructor() {
        this.currentSlide = 0;
        this.autoplayTimer = null;
        this.isAutoplayPaused = false;
        this.galleryData = [];

        this.init();
    }

    async init() {
        this.initParticles();
        await this.loadGalleryData();
        this.initGallery();
        this.initScrollAnimations();
        this.startAutoplay();
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
                this.galleryData = await window.galleryData.getItems();
                console.log('✅ Loaded', this.galleryData.length, 'items from Firestore');

                // Set up real-time listener for updates
                window.galleryData.listen((items) => {
                    console.log('🔄 Real-time update received:', items.length, 'items');
                    this.galleryData = items;
                    this.refreshGallery();
                });

            } else {
                throw new Error('Gallery data system not available');
            }

        } catch (error) {
            console.error('❌ Error loading gallery data:', error);
            this.galleryData = []; // Empty gallery instead of placeholders
            this.showEmptyGalleryMessage();
        }
    }

    showEmptyGalleryMessage() {
        const container = document.getElementById('gallery-container');
        container.innerHTML = `
            <div class="empty-gallery">
                <div style="text-align: center; padding: 60px 20px; color: #666;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">📸</div>
                    <h3 style="font-family: var(--font-heading); margin-bottom: 10px;">No memories uploaded yet!</h3>
                    <p>Upload some beautiful photos and videos for Nonie using the <a href="upload.html" style="color: var(--rose-gold);">upload page</a>.</p>
                </div>
            </div>
        `;
    }

    refreshGallery() {
        // Clear existing gallery
        const container = document.getElementById('gallery-container');
        container.innerHTML = '';

        // Recreate gallery with new data
        this.createGalleryHTML();

        // Reset current slide
        this.currentSlide = 0;

        // Restart autoplay if we have content
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
        }
        this.startAutoplay();
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
        this.createGalleryHTML();
        this.setupGalleryControls();
        this.setupHoverEffects();
    }

    createGalleryHTML() {
        const container = document.getElementById('gallery-container');

        if (this.galleryData.length === 0) {
            this.showEmptyGalleryMessage();
            return;
        }

        // Create slides
        this.galleryData.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.className = `slide ${index === 0 ? 'active' : ''}`;

            // Handle both images and videos
            let mediaElement;
            if (item.type === 'video') {
                mediaElement = document.createElement('video');
                // Use cloudinaryUrl from Firestore if available
                mediaElement.src = item.cloudinaryUrl || this.getCloudinaryUrl(item.imageId, 'video');
                mediaElement.controls = true;
                mediaElement.muted = true;
                mediaElement.loop = true;
                mediaElement.setAttribute('playsinline', '');
            } else {
                mediaElement = document.createElement('img');
                // Use cloudinaryUrl from Firestore if available
                mediaElement.src = item.cloudinaryUrl || this.getCloudinaryUrl(item.imageId);
                mediaElement.loading = 'lazy';
            }

            mediaElement.alt = item.caption;

            const caption = document.createElement('div');
            caption.className = 'slide-caption';
            caption.innerHTML = `<p>${item.caption}</p>`;

            slide.appendChild(mediaElement);
            slide.appendChild(caption);
            container.appendChild(slide);
        });

        // Create navigation arrows
        const prevBtn = document.createElement('button');
        prevBtn.className = 'nav-arrow prev';
        prevBtn.innerHTML = '❮';
        prevBtn.setAttribute('aria-label', 'Previous image');

        const nextBtn = document.createElement('button');
        nextBtn.className = 'nav-arrow next';
        nextBtn.innerHTML = '❯';
        nextBtn.setAttribute('aria-label', 'Next image');

        container.appendChild(prevBtn);
        container.appendChild(nextBtn);

        // Create dot indicators (only if we have content)
        if (this.galleryData.length > 0) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'dots-container';

            this.galleryData.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = `dot ${index === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.addEventListener('click', () => this.goToSlide(index));
                dotsContainer.appendChild(dot);
            });

            container.appendChild(dotsContainer);
        }
    }

    setupGalleryControls() {
        const prevBtn = document.querySelector('.nav-arrow.prev');
        const nextBtn = document.querySelector('.nav-arrow.next');

        prevBtn.addEventListener('click', () => this.previousSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Touch/swipe support
        let touchStartX = 0;
        const gallery = document.getElementById('gallery-container');

        gallery.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        gallery.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const difference = touchStartX - touchEndX;

            if (Math.abs(difference) > 50) {
                if (difference > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
        });
    }

    setupHoverEffects() {
        const gallery = document.getElementById('gallery-container');

        gallery.addEventListener('mouseenter', () => {
            this.pauseAutoplay();
        });

        gallery.addEventListener('mouseleave', () => {
            this.resumeAutoplay();
        });
    }

    getCloudinaryUrl(imageId, resourceType = 'image') {
        // Construct Cloudinary URL with optimizations
        if (resourceType === 'video') {
            return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/c_scale,w_800,h_600,q_auto,f_auto/${imageId}`;
        } else {
            return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_scale,w_800,h_600,q_auto,f_auto/${imageId}`;
        }
    }

    goToSlide(index) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');

        // Remove active class from current slide and dot
        slides[this.currentSlide].classList.remove('active');
        dots[this.currentSlide].classList.remove('active');

        // Update current slide index
        this.currentSlide = index;

        // Add active class to new slide and dot
        slides[this.currentSlide].classList.add('active');
        dots[this.currentSlide].classList.add('active');

        // Restart Ken Burns animation
        const activeImg = slides[this.currentSlide].querySelector('img');
        activeImg.style.animation = 'none';
        setTimeout(() => {
            activeImg.style.animation = 'kenBurns 6s ease-in-out infinite alternate';
        }, 10);
    }

    nextSlide() {
        if (this.galleryData.length === 0) return;
        const nextIndex = (this.currentSlide + 1) % this.galleryData.length;
        this.goToSlide(nextIndex);
    }

    previousSlide() {
        if (this.galleryData.length === 0) return;
        const prevIndex = (this.currentSlide - 1 + this.galleryData.length) % this.galleryData.length;
        this.goToSlide(prevIndex);
    }

    startAutoplay() {
        if (this.galleryData.length <= 1) return; // Don't autoplay if only one slide or empty

        this.autoplayTimer = setInterval(() => {
            if (!this.isAutoplayPaused) {
                this.nextSlide();
            }
        }, 6000);
    }

    pauseAutoplay() {
        this.isAutoplayPaused = true;
    }

    resumeAutoplay() {
        this.isAutoplayPaused = false;
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
        const animatedElements = document.querySelectorAll('.section-title, .video-container');
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