// ----------------------------
// SEO: per-page meta data
// Updates title, description, canonical and OG tags on every
// navigation so Google sees distinct metadata for each section.
// ----------------------------

const PAGE_SEO = {
    home: {
        title:       'Apex Advisory Solutions - Business Restructuring Experts | South Africa',
        description: 'Apex Advisory Solutions offers expert business restructuring, legal & governance, financial advisory, and strategic consulting services across South Africa.',
        url:         'https://apexadvisorysolutions.co.za/',
        hash:        ''
    },
    about: {
        title:       'About Us - Apex Advisory Solutions | Admitted Attorneys & Chartered Accountants',
        description: 'Meet the founders of Apex Advisory Solutions — Avathar Soni Naidoo (Admitted Attorney) and Ashendran Naidoo (Chartered Business Accountant). Trusted advisors for South African businesses.',
        url:         'https://apexadvisorysolutions.co.za/#about',
        hash:        '#about'
    },
    services: {
        title:       'Our Services - Business Restructuring, Legal, Financial & IT Advisory | Apex Advisory',
        description: 'Business restructuring & rescue, legal & governance, financial advisory, strategic planning, operations consulting, and IT & cybersecurity services.',
        url:         'https://apexadvisorysolutions.co.za/#services',
        hash:        '#services'
    },
    contact: {
        title:       'Contact Us - Apex Advisory Solutions | Sandton, South Africa',
        description: 'Get in touch with Apex Advisory Solutions. Call +27-82-315-4737 or email info.apexadvisorysolutions@gmail.com. Office hours Mon–Fri 08:00–17:00.',
        url:         'https://apexadvisorysolutions.co.za/#contact',
        hash:        '#contact'
    },
    booking: {
        title:       'Book a Consultation - Apex Advisory Solutions | South Africa',
        description: 'Schedule a confidential business consultation with Apex Advisory Solutions. Choose in-person, video conference, or phone. Our team responds within 24 hours.',
        url:         'https://apexadvisorysolutions.co.za/#booking',
        hash:        '#booking'
    }
};

function updateSEO(pageName) {
    const seo = PAGE_SEO[pageName];
    if (!seo) return;

    document.title = seo.title;

    const setMeta = (sel, val) => {
        const el = document.querySelector(sel);
        if (el) el.setAttribute('content', val);
    };
    const setAttr = (id, attr, val) => {
        const el = document.getElementById(id);
        if (el) el.setAttribute(attr, val);
    };

    setMeta('meta[name="description"]', seo.description);
    setAttr('canonical', 'href', seo.url);
    setMeta('#og-title',            'content', seo.title);       // falls back gracefully if ids missing
    setMeta('#og-description',      'content', seo.description);
    setMeta('#og-url',              'content', seo.url);
    setMeta('#twitter-title',       'content', seo.title);
    setMeta('#twitter-description', 'content', seo.description);

    history.replaceState(null, seo.title, seo.hash || '/');
}

// ----------------------------
// Mobile Navigation
// ----------------------------

const mobileToggle = document.getElementById('mobileToggle');
const navLinks     = document.getElementById('navLinks');

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
        if (link.getAttribute('onclick')?.includes(pageName)) link.classList.add('active');
    });

    if (navLinks)     navLinks.classList.remove('active');
    if (mobileToggle) mobileToggle.classList.remove('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    updateSEO(pageName);
}

// On load: respect the URL hash so shared links land on the right page
(function handleInitialHash() {
    const map = { '#about': 'about', '#services': 'services', '#contact': 'contact', '#booking': 'booking' };
    const page = map[window.location.hash] || 'home';
    if (page !== 'home') showPage(page);
})();

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
// Client-side form validation
// Returns an error message string, or null if valid.
// ----------------------------

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateContactForm(data) {
    if (!data.name?.trim())    return 'Please enter your name.';
    if (!data.email?.trim())   return 'Please enter your email address.';
    if (!validateEmail(data.email)) return 'Please enter a valid email address.';
    if (!data.message?.trim()) return 'Please enter your message.';
    return null;
}

function validateBookingForm(data) {
    if (!data.firstName?.trim()) return 'Please enter your first name.';
    if (!data.lastName?.trim())  return 'Please enter your last name.';
    if (!data.email?.trim())     return 'Please enter your email address.';
    if (!validateEmail(data.email)) return 'Please enter a valid email address.';
    if (!data.phone?.trim())     return 'Please enter your phone number.';
    if (!data.service?.trim())   return 'Please select a service.';
    if (!data.date?.trim())      return 'Please select a date.';
    if (!data.time?.trim())      return 'Please select a time.';
    if (!data.details?.trim())   return 'Please describe your requirements.';
    if (!data.consent)           return 'You must agree to the terms to proceed.';
    return null;
}

// ----------------------------
// Form submit helper
// ----------------------------

async function handleFormSubmit(form, endpoint, successMessage, validateFn) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    const formData = Object.fromEntries(new FormData(form).entries());

    // Client-side validation before hitting the server
    if (validateFn) {
        const error = validateFn(formData);
        if (error) {
            showErrorBanner(form, error);
            return;
        }
    }

    clearErrorBanner(form);

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Request failed');

        showSuccessModal(successMessage);
        form.reset();

    } catch (err) {
        console.error(err);
        showErrorBanner(form, err.message || 'There was an error submitting your request. Please contact us directly at info.apexadvisorysolutions@gmail.com');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ----------------------------
// Inline error banner (shown inside the form, above submit)
// ----------------------------

function showErrorBanner(form, message) {
    clearErrorBanner(form);
    const banner = document.createElement('div');
    banner.className = 'form-error-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    banner.style.cssText = `
        background:#fef2f2; border:1px solid #fca5a5; color:#dc2626;
        padding:0.75rem 1rem; border-radius:8px; margin-bottom:1rem;
        font-size:0.9rem; display:flex; align-items:center; gap:0.5rem;
    `;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) form.insertBefore(banner, submitBtn.parentElement || submitBtn);
    else form.appendChild(banner);
}

function clearErrorBanner(form) {
    form.querySelector('.form-error-banner')?.remove();
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
            'Thank you for contacting us! We will respond within 24 hours.',
            validateContactForm
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
            'Your consultation request has been received. We will contact you shortly.',
            validateBookingForm
        );
    });
}

// ----------------------------
// Success Modal
// ----------------------------

function showSuccessModal(message) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.55);
        display:flex; align-items:center; justify-content:center;
        z-index:10000; padding:1rem;
    `;
    modal.innerHTML = `
        <div style="background:white; padding:2.5rem; border-radius:16px; max-width:460px;
                    width:100%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.2);">
            <div style="width:68px; height:68px; background:#10b981; border-radius:50%;
                        display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem;">
                <i class="fas fa-check" style="color:white; font-size:1.75rem;"></i>
            </div>
            <h2 style="color:#0f172a; margin-bottom:0.75rem; font-size:1.6rem;">Success!</h2>
            <p style="color:#64748b; line-height:1.6; margin-bottom:1.75rem;">${message}</p>
            <button id="modalCloseBtn"
                    style="background:#f59e0b; color:white; border:none; padding:0.875rem 2rem;
                           border-radius:8px; font-size:1rem; font-weight:600; cursor:pointer;
                           min-width:140px;">
                Close
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#modalCloseBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}