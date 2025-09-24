class WeddingWebsite {
    constructor() {
        this.init();
        this.bindEvents();
        this.initAnimations();
        this.setupCountdown();
        this.setupNavigation();
    }

    init() {
        // Configuration
        this.config = {
            weddingDate: '2025-11-15T19:00:00' // 15/11 às 19h
        };

        // Set up loading screen
        this.setupLoadingScreen();

        // Initialize AOS
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
                offset: 100
            });
        }
    }

    setupLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        
        if (loadingScreen) {
            // Simulate loading time
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                // document.body.style.overflow = 'visible';
            }, 2000);

            // Hide loading screen when page is fully loaded
            window.addEventListener('load', () => {
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    // document.body.style.overflow = 'visible';
                }, 1000);
            });
        }
    }

    bindEvents() {
        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.copyToClipboard(e));
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close mobile menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }

        // Hero button
        const heroBtn = document.querySelector('.hero-btn');
        if (heroBtn) {
            heroBtn.addEventListener('click', () => {
                this.scrollToSection('gift-section');
            });
        }
    }

    async copyToClipboard(e) {
        const button = e.currentTarget;
        const targetId = button.dataset.copy;
        const targetElement = document.getElementById(targetId);
        
        if (!targetElement) {
            this.showNotification('Elemento não encontrado.', 'error');
            return;
        }
        
        const textToCopy = targetElement.textContent;
        
        try {
            // Tentar usar a API moderna de clipboard
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                // Fallback para navegadores mais antigos
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }
            
            // Visual feedback
            const originalContent = button.innerHTML;
            button.innerHTML = `
                <svg viewBox="0 0 24 24" class="copy-icon">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg>
                <span>Copiado!</span>
            `;
            button.style.background = '#4CAF50';
            
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.style.background = '';
            }, 2000);
            
            // this.showNotification('Chave PIX copiada com sucesso!', 'success');
            this.trackEvent('pix_key_copied');
            
        } catch (err) {
            console.error('Erro ao copiar:', err);
            this.showNotification('Erro ao copiar. Selecione e copie manualmente.', 'error');
        }
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (container.contains(notification)) {
                    container.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    setupCountdown() {
        const weddingDate = new Date(this.config.weddingDate).getTime();
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = weddingDate - now;
            
            if (distance < 0) {
                const countdownContainer = document.querySelector('.hero-countdown');
                if (countdownContainer) {
                    countdownContainer.innerHTML = 
                        '<div class="countdown-finished"><p>🎉 O grande dia chegou! 🎉</p></div>';
                }
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            this.animateNumber('days', days);
            this.animateNumber('hours', hours);
            this.animateNumber('minutes', minutes);
            this.animateNumber('seconds', seconds);
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    animateNumber(id, newValue) {
        const element = document.getElementById(id);
        if (!element) return;
        
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue !== newValue) {
            element.style.transform = 'scale(1.1)';
            element.style.transition = 'transform 0.15s ease';
            element.textContent = newValue.toString().padStart(2, '0');
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 150);
        }
    }

    setupNavigation() {
        const nav = document.getElementById('navigation');
        if (!nav) return;
        
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add scrolled class
            if (scrollTop > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
            
            // Update active nav link
            this.updateActiveNavLink();
            
            lastScrollTop = scrollTop;
        });
    }

    updateActiveNavLink() {
        const sections = ['hero', 'our-story', 'gift-section', 'celebration'];
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    currentSection = sectionId;
                }
            }
        });
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentSection}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    handleNavClick(e) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        if (href && href.startsWith('#')) {
            const targetId = href.substring(1);
            this.scrollToSection(targetId);
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    initAnimations() {
        // Intersection Observer for custom animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });

        // Observe elements for animation
        document.querySelectorAll('[data-aos]').forEach(el => {
            observer.observe(el);
        });

        // Parallax effect for floating particles
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const particles = document.querySelectorAll('.floating-particle');
            
            particles.forEach((particle, index) => {
                const speed = (index + 1) * 0.1;
                particle.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    trackEvent(eventName, data = {}) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'wedding_gift',
                ...data
            });
        }
        
        console.log(`Event: ${eventName}`, data);
    }
}

// Utility functions
window.scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        new WeddingWebsite();
    } catch (error) {
        console.error('Erro ao inicializar o site:', error);
    }
});

// Performance optimization
window.addEventListener('load', () => {
    // Remove loading states
    document.querySelectorAll('[data-loading]').forEach(el => {
        el.removeAttribute('data-loading');
    });
    
    // Lazy load images if any
    const images = document.querySelectorAll('img[data-src]');
    if (images.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});