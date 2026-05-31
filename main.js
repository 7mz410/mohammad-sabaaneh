// Intersection Observer for scroll animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add visible class immediately to hero elements
document.addEventListener('DOMContentLoaded', () => {
    const heroElements = document.querySelectorAll('.hero .animate-up, .hero .animate-fade');
    heroElements.forEach(el => {
        setTimeout(() => el.classList.add('visible'), 100);
    });

    // Observe other elements
    const animatedElements = document.querySelectorAll('.animate-up:not(.hero *), .animate-fade:not(.hero *)');
    animatedElements.forEach(el => observer.observe(el));
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.padding = '1rem 0';
    } else {
        navbar.style.background = 'rgba(26, 26, 26, 0.9)';
        navbar.style.padding = '1.5rem 0';
    }
});
