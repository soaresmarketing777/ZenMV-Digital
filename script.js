document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. DARK MODE (LocalStorage)
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    html.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
        trackEvent('theme_toggle', { theme: newTheme });
    });

    // ==========================================
    // 2. HEADER GLASSMORPHISM ON SCROLL
    // ==========================================
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ==========================================
    // 3. MOBILE MENU
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    
    mobileMenuBtn.addEventListener('click', () => {
        const isActive = mobileNav.classList.toggle('active');
        mobileMenuBtn.textContent = isActive ? '✕' : '☰';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
        });
    });

    // ==========================================
    // 4. UTM TRACKING & LOCALSTORAGE
    // ==========================================
    const urlParams = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(param => {
        if (urlParams.has(param)) {
            localStorage.setItem(param, urlParams.get(param));
        }
    });

    // ==========================================
    // 5. FAQ ACCORDION
    // ==========================================
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            const isActive = item.classList.contains('active');
            
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.accordion-content').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
                trackEvent('faq_open', { question: header.textContent.trim() });
            }
        });
    });

    // ==========================================
    // 6. SMART FORM (Mailto/WA Fallback + Draft)
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const formInputs = contactForm.querySelectorAll('input, select, textarea');

    // Restaurar rascunho
    formInputs.forEach(input => {
        const saved = localStorage.getItem(`form_draft_${input.name}`);
        if (saved) input.value = saved;
        input.addEventListener('input', () => localStorage.setItem(`form_draft_${input.name}`, input.value));
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const phone = formData.get('phone');
        const service = formData.get('service');
        const message = formData.get('message');
        
        const utmSource = localStorage.getItem('utm_source') || 'site direto';
        const utmCampaign = localStorage.getItem('utm_campaign') || 'sem campanha';
        
        const waMessage = `Olá, Miguel! Sou *${name}*.\n` +
                          `Tenho interesse em: *${service}*\n` +
                          `Mensagem: ${message}\n` +
                          `Meu telefone: ${phone}\n` +
                          `_(Origem: ${utmSource} / Campanha: ${utmCampaign})_`;
        
        const encodedMessage = encodeURIComponent(waMessage);
        const waLink = `https://wa.me/5511941104145?text=${encodedMessage}`;
        
        document.getElementById('modal-wa-link').href = waLink;
        document.getElementById('success-modal').classList.add('active');
        
        contactForm.reset();
        formInputs.forEach(input => localStorage.removeItem(`form_draft_${input.name}`));
        
        trackEvent('form_submission', { service: service, source: utmSource });
    });

    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('success-modal').classList.remove('active');
    });
    
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('success-modal');
        if (e.target === modal) modal.classList.remove('active');
    });

    // ==========================================
    // 7. COOKIE BANNER (LGPD) & TRACK EVENT
    // ==========================================
    const cookieBanner = document.getElementById('cookie-banner');
    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => cookieBanner.classList.add('show'), 2000);
    }

    document.getElementById('accept-cookies').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.classList.remove('show');
        trackEvent('cookie_consent', { status: 'accepted' });
    });

    // Função de Rastreamento Segura (Verifica consentimento)
    window.trackEvent = function(eventName, params = {}) {
        const consent = localStorage.getItem('cookieConsent');
        if (consent === 'accepted') {
            console.log(`[TRACKING] Event: ${eventName}`, params);
            // Descomente as linhas abaixo em produção:
            // window.dataLayer = window.dataLayer || [];
            // window.dataLayer.push({ event: eventName, ...params });
            // if (typeof fbq !== 'undefined') fbq('trackCustom', eventName, params);
        }
    };

    // ==========================================
    // 8. ANIMAÇÃO DE SCROLL (Intersection Observer)
    // ==========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.service-card, .testimonial-card, .info-box').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});