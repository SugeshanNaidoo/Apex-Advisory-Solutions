// ----------------------------
// Mobile Navigation
// ----------------------------

const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    });

    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            navLinks.classList.remove('active');
            mobileToggle.classList.remove('active');
        }
    });
}

// ----------------------------
// Page Navigation
// ----------------------------

function showPage(pageName) {

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a:not(.cta-btn)').forEach(l => l.classList.remove('active'));

    const page = document.getElementById(pageName);
    if (page) page.classList.add('active');

    document.querySelectorAll('.nav-links a:not(.cta-btn)').forEach(link => {
        if (link.getAttribute('onclick')?.includes(pageName)) {
            link.classList.add('active');
        }
    });

    if (navLinks) navLinks.classList.remove('active');
    if (mobileToggle) mobileToggle.classList.remove('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const titles = {
        home: 'Apex Advisory Solutions - Business Restructuring Experts | South Africa',
        about: 'About Us - Apex Advisory Solutions',
        services: 'Our Services - Apex Advisory Solutions',
        contact: 'Contact Us - Apex Advisory Solutions',
        booking: 'Book Consultation - Apex Advisory Solutions'
    };

    document.title = titles[pageName] || 'Apex Advisory Solutions';
}

// ----------------------------
// Header Scroll Effect
// ----------------------------

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ----------------------------
// Booking Date Restriction
// ----------------------------

const dateInput = document.getElementById('b-date');

if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
}

// ----------------------------
// Helper
// ----------------------------

async function handleFormSubmit(form, endpoint, successMessage) {

    const submitBtn = form.querySelector('button[type="submit"]');

    if (!submitBtn) return;

    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    const formData = Object.fromEntries(new FormData(form).entries());

    try {

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Request failed");

        showSuccessModal(successMessage);

        form.reset();

    } catch (err) {

        console.error(err);

        alert(
            "There was an error submitting your request. Please contact us directly at info.apexadvisorysolutions@gmail.com"
        );

    } finally {

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

    }

}

// ----------------------------
// Contact Form
// ----------------------------

const contactForm = document.getElementById('contactForm');

if (contactForm) {

    contactForm.addEventListener('submit', (e) => {

        e.preventDefault();

        handleFormSubmit(
            contactForm,
            '/api/contact',
            'Thank you for contacting us! We will respond within 24 hours.'
        );

    });

}

// ----------------------------
// Booking Form
// ----------------------------

const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {

    bookingForm.addEventListener('submit', (e) => {

        e.preventDefault();

        handleFormSubmit(
            bookingForm,
            '/api/booking',
            'Your consultation request has been received. We will contact you shortly.'
        );

    });

}

// ----------------------------
// Success Modal
// ----------------------------

function showSuccessModal(message) {

    const modal = document.createElement('div');

    modal.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.55);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:10000;
    `;

    modal.innerHTML = `
        <div style="background:white;padding:2rem;border-radius:14px;max-width:420px;text-align:center">
            <h2>Success</h2>
            <p>${message}</p>
            <button id="closeModal">Close</button>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#closeModal').onclick = () => modal.remove();

}