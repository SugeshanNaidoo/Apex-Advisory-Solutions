// Mobile menu toggle
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileToggle.classList.toggle('active');
});

// Close nav when clicking a link on mobile
navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
    }
});

// Page navigation
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a:not(.cta-btn)').forEach(l => l.classList.remove('active'));

    document.getElementById(pageName).classList.add('active');

    document.querySelectorAll('.nav-links a:not(.cta-btn)').forEach(link => {
        if (link.getAttribute('onclick')?.includes(pageName)) {
            link.classList.add('active');
        }
    });

    navLinks.classList.remove('active');
    mobileToggle.classList.remove('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const titles = {
        home:    'Apex Advisory Solutions - Business Restructuring Experts | South Africa',
        about:   'About Us - Apex Advisory Solutions',
        services:'Our Services - Apex Advisory Solutions',
        contact: 'Contact Us - Apex Advisory Solutions',
        booking: 'Book Consultation - Apex Advisory Solutions'
    };
    document.title = titles[pageName] || 'Apex Advisory Solutions';
}

// Header scroll effect
window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// Set minimum date for booking (tomorrow)
const dateInput = document.getElementById('b-date');
if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
}

// ---- Contact Form ----
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
        const btnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        const formData = {
            name:    document.getElementById('c-name').value,
            email:   document.getElementById('c-email').value,
            phone:   document.getElementById('c-phone').value,
            company: document.getElementById('c-company').value,
            service: document.getElementById('c-service').value,
            message: document.getElementById('c-message').value
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showSuccessModal('Thank you for contacting us! We will respond within 24 hours.');
                this.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Sorry, there was an error sending your message. Please try again or contact us directly at info.apexadvisorysolutions@gmail.com.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnText;
        }
    });
}

// ---- Booking Form ----
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
        const btnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        const formData = {
            firstName: document.getElementById('b-fname').value,
            lastName:  document.getElementById('b-lname').value,
            email:     document.getElementById('b-email').value,
            phone:     document.getElementById('b-phone').value,
            company:   document.getElementById('b-company').value,
            position:  document.getElementById('b-position').value,
            service:   document.getElementById('b-service').value,
            date:      document.getElementById('b-date').value,
            time:      document.getElementById('b-time').value,
            format:    document.getElementById('b-format').value,
            urgency:   document.getElementById('b-urgency').value,
            details:   document.getElementById('b-details').value,
            consent:   this.querySelector('input[type="checkbox"]').checked
        };

        try {
            const response = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                showSuccessModal('Your consultation has been booked! We will send you a confirmation email shortly.');
                this.reset();
            } else {
                throw new Error(result.message || 'Failed to book consultation');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Sorry, there was an error booking your consultation. Please try again or contact us directly at info.apexadvisorysolutions@gmail.com.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnText;
        }
    });
}

// ---- Success Modal ----
function showSuccessModal(message) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.55); display: flex; align-items: center;
        justify-content: center; z-index: 10000; padding: 1rem;
        animation: fadeIn 0.3s;
    `;

    modal.innerHTML = `
        <div style="background:white; padding:2.5rem; border-radius:16px; max-width:480px;
                    width:100%; text-align:center; animation:fadeIn 0.3s;">
            <div style="width:72px; height:72px; background:#10b981; border-radius:50%;
                        display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem;">
                <i class="fas fa-check" style="color:white; font-size:2rem;"></i>
            </div>
            <h2 style="color:var(--primary); margin-bottom:0.75rem; font-size:1.7rem;">Success!</h2>
            <p style="color:var(--text-light); line-height:1.6; margin-bottom:1.5rem;">${message}</p>
            <p style="color:var(--text-light); font-size:0.9rem; margin-bottom:1.75rem;">
                For urgent matters, contact us at
                <strong style="color:var(--primary);">info.apexadvisorysolutions@gmail.com</strong>.
            </p>
            <button onclick="this.closest('[style]').remove()" class="btn btn-primary" style="min-width:140px; justify-content:center;">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ---- Scroll animations ----
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease-out forwards';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.service-card, .stat-item, .founder-card').forEach(el => {
    observer.observe(el);
});