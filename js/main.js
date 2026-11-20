(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const installContactPopup = () => {
        const markup = `
            <div class="contact-popup-overlay" id="contactPopup" aria-hidden="true">
                <section class="contact-popup" role="dialog" aria-modal="true" aria-labelledby="contactPopupTitle" aria-describedby="contactPopupIntro" tabindex="-1">
                    <button class="contact-popup-close" type="button" aria-label="Close contact form" data-contact-close><i class="fas fa-times" aria-hidden="true"></i></button>
                    <aside class="contact-popup-aside"><span class="contact-popup-mark"><i class="fas fa-heartbeat" aria-hidden="true"></i></span><span class="contact-popup-kicker">JNS Medical Centre</span><h2>Here for your next step.</h2><p>Send a service or appointment enquiry and our team can guide you.</p><a href="tel:04812582920"><i class="fas fa-phone-alt" aria-hidden="true"></i> 0481 2582920</a><small>Call to confirm appointments and availability.</small></aside>
                    <div class="contact-popup-content"><span class="section-label">Contact our team</span><h2 id="contactPopupTitle">How can we help?</h2><p id="contactPopupIntro">Share your details and enquiry below.</p>
                        <form id="quickContactForm" novalidate>
                            <div class="contact-popup-error" role="alert" aria-live="polite" hidden>Please check the highlighted fields and try again.</div>
                            <div class="contact-popup-fields">
                                <div class="contact-popup-field"><label for="quickContactName">Name <span>*</span></label><input id="quickContactName" name="name" autocomplete="name" placeholder="Your full name" required minlength="2" maxlength="100"><small data-error-for="quickContactName"></small></div>
                                <div class="contact-popup-field"><label for="quickContactEmail">Email <span>*</span></label><input id="quickContactEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com" required maxlength="150"><small data-error-for="quickContactEmail"></small></div>
                                <div class="contact-popup-field"><label for="quickContactPhone">Phone number <span>*</span></label><input id="quickContactPhone" name="phone" type="tel" autocomplete="tel" placeholder="Your contact number" required minlength="7" maxlength="20" pattern="[+()0-9 -]{7,20}"><small data-error-for="quickContactPhone"></small></div>
                                <div class="contact-popup-field contact-popup-message"><label for="quickContactMessage">Message <span>*</span></label><textarea id="quickContactMessage" name="message" placeholder="Briefly tell us how we can help" required minlength="5" maxlength="1500" rows="2"></textarea><small data-error-for="quickContactMessage"></small></div>
                            </div>
                            <div class="contact-popup-submit"><button class="btn btn-primary" type="submit">Submit Enquiry <i class="fas fa-arrow-right ms-2" aria-hidden="true"></i></button><small>This site does not send messages to the clinic inbox. Call to complete your enquiry.</small></div>
                        </form>
                    </div>
                </section>
            </div>
            <div class="contact-popup-success" id="contactPopupSuccess" role="status" aria-live="polite" aria-hidden="true"><div class="contact-success-card" tabindex="-1"><span class="contact-success-icon" aria-hidden="true"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23" fill="none"/><path d="M14 27l8 8 17-18" fill="none"/></svg></span><span class="section-label">Enquiry checked</span><h2>Thank you!</h2><p>Your details are ready. Please call the clinic to complete your enquiry.</p><a href="tel:04812582920">Call 0481 2582920</a></div></div>`;
        document.body.insertAdjacentHTML('beforeend', markup);

        const overlay = document.getElementById('contactPopup');
        const dialog = overlay.querySelector('.contact-popup');
        const form = document.getElementById('quickContactForm');
        const success = document.getElementById('contactPopupSuccess');
        const successCard = success.querySelector('.contact-success-card');
        const fields = Array.from(form.querySelectorAll('input, textarea'));
        let lastTrigger = null;
        let successTimer = null;
        let closeTimer = null;
        const focusable = () => Array.from(dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled])')).filter((item) => item.offsetParent !== null);
        const restoreTriggerFocus = () => {
            if (lastTrigger && document.contains(lastTrigger) && lastTrigger.offsetParent !== null) lastTrigger.focus();
            else document.querySelector('.navbar-toggler')?.focus();
        };

        const navbar = document.querySelector('.navbar');
        const navbarToggler = navbar && navbar.querySelector('.navbar-toggler');
        if (navbar && navbarToggler && !navbar.querySelector('.mobile-nav-appointment')) {
            const appointmentLink = document.createElement('a');
            appointmentLink.className = 'mobile-nav-appointment';
            appointmentLink.href = 'appointment.html';
            appointmentLink.setAttribute('aria-label', 'Book Appointment');
            const appointmentIcon = document.createElement('i');
            appointmentIcon.className = 'far fa-calendar-check';
            appointmentIcon.setAttribute('aria-hidden', 'true');
            appointmentLink.append(appointmentIcon, document.createTextNode('Book Appointment'));
            navbar.insertBefore(appointmentLink, navbarToggler);
        }

        const closePopup = (restoreFocus = true) => {
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('contact-popup-open');
            window.clearTimeout(closeTimer);
            if (restoreFocus) closeTimer = window.setTimeout(restoreTriggerFocus, prefersReducedMotion ? 0 : 220);
        };
        const openPopup = (trigger) => {
            lastTrigger = trigger;
            window.clearTimeout(closeTimer);
            overlay.classList.add('is-open');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('contact-popup-open');
            window.setTimeout(() => document.getElementById('quickContactName').focus(), prefersReducedMotion ? 0 : 40);
        };

        document.querySelectorAll('a[href]').forEach((link) => {
            let target;
            try { target = new URL(link.href, window.location.href); } catch (error) { return; }
            const isContactPage = /\/contact\.html$/i.test(target.pathname);
            const isAppointmentPage = /\/appointment\.html$/i.test(target.pathname);
            const isNavbarContactLink = isContactPage && link.matches('.navbar .nav-link');
            if ((!isContactPage && !isAppointmentPage) || isNavbarContactLink) return;
            link.addEventListener('click', (event) => {
                event.preventDefault();
                openPopup(link);
            });
        });

        overlay.querySelectorAll('[data-contact-close]').forEach((button) => button.addEventListener('click', closePopup));
        overlay.addEventListener('click', (event) => { if (event.target === overlay) closePopup(); });
        document.addEventListener('keydown', (event) => {
            if (!overlay.classList.contains('is-open')) return;
            if (event.key === 'Escape') { closePopup(); return; }
            if (event.key === 'Tab') {
                const items = focusable();
                if (!items.length) return;
                const first = items[0];
                const last = items[items.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        });

        const getFieldError = (field) => {
            if (field.validity.valueMissing) return 'Please complete this field.';
            if (field.validity.typeMismatch) return 'Enter a valid email address.';
            if (field.validity.tooShort) return `Enter at least ${field.minLength} characters.`;
            if (field.validity.patternMismatch) return 'Enter a valid phone number.';
            return 'Please check this field.';
        };
        fields.forEach((field) => field.addEventListener('input', () => {
            field.setCustomValidity('');
            if (field.name === 'phone' && field.value.trim() && field.value.replace(/\D/g, '').length < 7) field.setCustomValidity('Enter a phone number with at least 7 digits.');
            const valid = field.checkValidity();
            field.setAttribute('aria-invalid', String(!valid));
            const error = form.querySelector(`[data-error-for="${field.id}"]`);
            if (error) { error.textContent = valid ? '' : getFieldError(field); error.classList.toggle('is-visible', !valid); }
            if (fields.every((item) => item.checkValidity())) form.querySelector('.contact-popup-error').hidden = true;
        }));

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const invalid = fields.filter((field) => {
                field.setCustomValidity('');
                if (field.name === 'phone' && field.value.trim() && field.value.replace(/\D/g, '').length < 7) field.setCustomValidity('Enter a phone number with at least 7 digits.');
                const valid = field.checkValidity();
                field.setAttribute('aria-invalid', String(!valid));
                const error = form.querySelector(`[data-error-for="${field.id}"]`);
                if (error) { error.textContent = valid ? '' : getFieldError(field); error.classList.toggle('is-visible', !valid); }
                return !valid;
            });
            if (invalid.length) {
                form.querySelector('.contact-popup-error').hidden = false;
                invalid[0].focus();
                return;
            }
            form.querySelector('.contact-popup-error').hidden = true;
            closePopup(false);
            success.classList.add('is-visible');
            success.setAttribute('aria-hidden', 'false');
            successCard.focus();
            window.clearTimeout(successTimer);
            successTimer = window.setTimeout(() => {
                success.classList.remove('is-visible');
                success.setAttribute('aria-hidden', 'true');
                restoreTriggerFocus();
            }, 4800);
            form.reset();
            fields.forEach((field) => { field.removeAttribute('aria-invalid'); const error = form.querySelector(`[data-error-for="${field.id}"]`); if (error) { error.textContent = ''; error.classList.remove('is-visible'); } });
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        installContactPopup();
        const year = document.getElementById('currentYear');
        if (year) year.textContent = new Date().getFullYear();

        const page = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.navbar a[href]').forEach((link) => {
            const href = link.getAttribute('href') || '';
            if (href.split('#')[0] !== page) return;
            link.classList.add('active');
            if (link.classList.contains('nav-link')) link.setAttribute('aria-current', 'page');
            const parentDropdown = link.closest('.dropdown');
            const dropdownToggle = parentDropdown && parentDropdown.querySelector('.dropdown-toggle');
            if (dropdownToggle) dropdownToggle.classList.add('active');
        });

        const navCollapse = document.getElementById('primaryNav');
        if (navCollapse && window.bootstrap) {
            navCollapse.querySelectorAll('a[href]').forEach((link) => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < 992 && navCollapse.classList.contains('show') && !link.classList.contains('dropdown-toggle')) {
                        window.bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
                    }
                });
            });
        }

        const desktopHover = window.matchMedia('(hover: hover) and (pointer: fine)');
        const bindDropdownHover = () => {
            document.querySelectorAll('.navbar .nav-item.dropdown').forEach((dropdown) => {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (!toggle || dropdown.dataset.hoverBound === 'true') return;
                dropdown.dataset.hoverBound = 'true';
                let closeTimer;
                const menu = window.bootstrap && window.bootstrap.Dropdown.getOrCreateInstance(toggle);
                const openMenu = () => {
                    if (!desktopHover.matches || !menu) return;
                    window.clearTimeout(closeTimer);
                    menu.show();
                };
                const closeMenu = () => {
                    if (!desktopHover.matches || !menu) return;
                    window.clearTimeout(closeTimer);
                    closeTimer = window.setTimeout(() => {
                        if (!dropdown.matches(':hover') && !dropdown.contains(document.activeElement)) menu.hide();
                    }, 140);
                };
                dropdown.addEventListener('mouseenter', openMenu);
                dropdown.addEventListener('mouseleave', closeMenu);
                dropdown.addEventListener('focusin', openMenu);
                dropdown.addEventListener('focusout', (event) => {
                    if (!dropdown.contains(event.relatedTarget)) closeMenu();
                });
            });
        };
        bindDropdownHover();
        desktopHover.addEventListener('change', bindDropdownHover);

        const revealItems = document.querySelectorAll('.reveal');
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealItems.forEach((item) => item.classList.add('is-visible'));
        } else {
            try {
                const observer = new IntersectionObserver((entries, activeObserver) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            activeObserver.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });
                revealItems.forEach((item) => observer.observe(item));
                document.documentElement.classList.add('reveal-enabled');
            } catch (error) {
                revealItems.forEach((item) => item.classList.add('is-visible'));
            }
        }

        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            const updateBackToTop = () => {
                backToTop.style.display = window.scrollY > 420 ? 'flex' : 'none';
            };
            window.addEventListener('scroll', updateBackToTop, { passive: true });
            updateBackToTop();
            backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
        }

        const careSearch = document.getElementById('careSearch');
        if (careSearch) {
            const cards = Array.from(document.querySelectorAll('.care-search-item'));
            const emptyState = document.getElementById('noCareResults');
            careSearch.addEventListener('input', () => {
                const query = careSearch.value.trim().toLowerCase();
                let visibleCount = 0;
                cards.forEach((card) => {
                    const matches = !query || (card.dataset.search || card.textContent).toLowerCase().includes(query);
                    card.classList.toggle('d-none', !matches);
                    if (matches) visibleCount += 1;
                });
                if (emptyState) emptyState.classList.toggle('d-none', visibleCount !== 0);
            });
        }

        document.querySelectorAll('[data-enquiry-form]').forEach((enquiryForm) => {
            const successDialog = document.getElementById(enquiryForm.dataset.successDialog);
            if (!successDialog) return;
            const fields = Array.from(enquiryForm.querySelectorAll('input, select, textarea'));
            const errorSummary = enquiryForm.querySelector('.form-error-summary');
            let wasSubmitted = false;
            const fieldError = (field) => {
                if (field.validity.valueMissing) return 'Please complete this field.';
                if (field.validity.typeMismatch) return 'Enter a valid email address.';
                if (field.validity.tooShort) return `Enter at least ${field.minLength} characters.`;
                if (field.validity.patternMismatch) return 'Enter a valid phone number.';
                if (field.validity.customError) return field.validationMessage;
                return 'Please check this field.';
            };
            const validateField = (field) => {
                field.setCustomValidity('');
                if (field.name === 'phone' && field.value.trim() && field.value.replace(/\D/g, '').length < 7) {
                    field.setCustomValidity('Enter a phone number with at least 7 digits.');
                }
                const error = document.getElementById(`${field.id}Error`);
                const valid = field.checkValidity();
                field.setAttribute('aria-invalid', String(!valid));
                if (error) {
                    const describedBy = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
                    describedBy.add(error.id);
                    field.setAttribute('aria-describedby', Array.from(describedBy).join(' '));
                    error.textContent = valid ? '' : fieldError(field);
                    error.hidden = valid;
                }
                return valid;
            };
            fields.forEach((field) => {
                const update = () => {
                    if (!wasSubmitted) return;
                    validateField(field);
                    if (errorSummary && fields.every((item) => item.checkValidity())) errorSummary.hidden = true;
                };
                field.addEventListener('input', update);
                field.addEventListener('change', update);
            });
            const closeSuccess = () => {
                successDialog.classList.remove('is-open');
                successDialog.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('dialog-open');
                const submitButton = enquiryForm.querySelector('[type="submit"]');
                if (submitButton) submitButton.focus();
            };
            enquiryForm.addEventListener('submit', (event) => {
                event.preventDefault();
                wasSubmitted = true;
                enquiryForm.classList.add('was-validated');
                const invalidFields = fields.filter((field) => !validateField(field));
                if (invalidFields.length) {
                    if (errorSummary) errorSummary.hidden = false;
                    const firstInvalid = invalidFields[0];
                    firstInvalid.focus();
                    firstInvalid.reportValidity();
                    return;
                }
                if (errorSummary) errorSummary.hidden = true;
                successDialog.classList.add('is-open');
                successDialog.setAttribute('aria-hidden', 'false');
                document.body.classList.add('dialog-open');
                const closeButton = successDialog.querySelector('[data-close-success]');
                if (closeButton) closeButton.focus();
            });
            successDialog.querySelectorAll('[data-close-success]').forEach((button) => button.addEventListener('click', closeSuccess));
            successDialog.addEventListener('click', (event) => {
                if (event.target === successDialog) closeSuccess();
            });
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && successDialog.classList.contains('is-open')) closeSuccess();
            });
        });
    });
})();
