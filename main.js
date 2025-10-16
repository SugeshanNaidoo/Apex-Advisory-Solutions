      // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileToggle');
        const navLinks = document.getElementById('navLinks');

        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        // Page navigation
        function showPage(pageName) {
            const pages = document.querySelectorAll('.page');
            const links = document.querySelectorAll('.nav-links a:not(.cta-btn)');
            
            pages.forEach(page => page.classList.remove('active'));
            links.forEach(link => link.classList.remove('active'));
            
            document.getElementById(pageName).classList.add('active');
            
            // Update active nav link
            links.forEach(link => {
                if (link.getAttribute('onclick')?.includes(pageName)) {
                    link.classList.add('active');
                }
            });
            
            navLinks.classList.remove('active');
            mobileToggle.classList.remove('active');
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Update document title
            const titles = {
                'home': 'Apex Advisory Solutions - Business Restructuring Experts | South Africa',
                'about': 'About Us - Apex Advisory Solutions',
                'services': 'Our Services - Apex Advisory Solutions',
                'contact': 'Contact Us - Apex Advisory Solutions',
                'booking': 'Book Consultation - Apex Advisory Solutions'
            };
            document.title = titles[pageName] || 'Apex Advisory Solutions';
        }

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // Contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = this.querySelector('button[type="submit"]');
                const btnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                const formData = {
                    name: this.querySelector('input[type="text"]').value,
                    email: this.querySelector('input[type="email"]').value,
                    phone: this.querySelector('input[type="tel"]').value,
                    company: this.querySelectorAll('input[type="text"]')[1]?.value || '',
                    service: this.querySelector('select').value,
                    message: this.querySelector('textarea').value
                };
                
                try {
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
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

        // Booking form submission
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = this.querySelector('button[type="submit"]');
                const btnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                const inputs = this.querySelectorAll('input[type="text"]');
                const formData = {
                    firstName: inputs[0].value,
                    lastName: inputs[1].value,
                    email: this.querySelector('input[type="email"]').value,
                    phone: this.querySelector('input[type="tel"]').value,
                    company: inputs[2].value,
                    position: inputs[3]?.value || '',
                    service: this.querySelectorAll('select')[0].value,
                    date: this.querySelector('input[type="date"]').value,
                    time: this.querySelectorAll('select')[1].value,
                    format: this.querySelectorAll('select')[2].value,
                    urgency: this.querySelectorAll('select')[3].value,
                    details: this.querySelector('textarea').value,
                    consent: this.querySelector('input[type="checkbox"]').checked
                };
                
                try {
                    const response = await fetch('/api/booking', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
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

        // Success modal
        function showSuccessModal(message) {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 3rem; border-radius: 16px; max-width: 500px; width: 90%; text-align: center; animation: slideUp 0.3s;">
                    <div style="width: 80px; height: 80px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                        <i class="fas fa-check" style="color: white; font-size: 2.5rem;"></i>
                    </div>
                    <h2 style="color: var(--primary); margin-bottom: 1rem; font-size: 1.8rem;">Success!</h2>
                    <p style="color: var(--text-light); line-height: 1.6; margin-bottom: 2rem;">${message}</p>
                    <p style="color: var(--text-light); font-size: 0.95rem; margin-bottom: 2rem;">For urgent matters, please contact us directly at <strong style="color: var(--primary);">info.apexadvisorysolutions@gmail.com</strong>.</p>
                    <button onclick="this.closest('div').parentElement.remove()" class="btn btn-primary">
                        Close
                    </button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }

        // Set minimum date for booking
        const dateInput = document.querySelector('#booking input[type="date"]');
        if (dateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.min = tomorrow.toISOString().split('T')[0];
        }

        // Smooth scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeIn 0.6s ease-out forwards';
                }
            });
        }, observerOptions);

        // Observe elements
        document.querySelectorAll('.service-card, .stat-item').forEach(el => {
            observer.observe(el);
        });