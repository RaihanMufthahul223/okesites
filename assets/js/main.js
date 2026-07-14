/* =============================================
   OKESITE — Interactions & Motion Design
   Featuring: Lenis Smooth Scroll + GSAP
   ============================================= */

(function () {
  'use strict';

  var hasLenis = typeof Lenis !== 'undefined';
  var hasGSAP = typeof gsap !== 'undefined';

  var lenis;

  // --- Navbar ---
  var navbar = document.getElementById('navbar');

  // --- Hamburger Menu ---
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
  }

  // Close on mobile menu link click
  var mobileLinks = document.querySelectorAll('.mobile-link, .mob-cta');
  for (var i = 0; i < mobileLinks.length; i++) {
    mobileLinks[i].addEventListener('click', function () {
      if (hamburger) hamburger.classList.remove('active');
      if (mobileMenu) mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Prevent lock scroll if window resized to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024) {
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  }, { passive: true });


  // --- FAQ Accordion ---
  var faqItems = document.querySelectorAll('.faq-item');
  for (var k = 0; k < faqItems.length; k++) {
    (function (item) {
      var btn = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');

      if (btn && answer) {
        btn.addEventListener('click', function () {
          var isOpen = item.classList.contains('open');

          // Close all
          for (var m = 0; m < faqItems.length; m++) {
            faqItems[m].classList.remove('open');
            var mAns = faqItems[m].querySelector('.faq-answer');
            if (mAns) mAns.classList.remove('open');
            var mBtn = faqItems[m].querySelector('.faq-question');
            if (mBtn) mBtn.setAttribute('aria-expanded', 'false');
          }

          if (!isOpen) {
            item.classList.add('open');
            answer.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      }
    })(faqItems[k]);
  }


  // =============================================
  // PREMIUM MOTION DESKTOP/MOBILE PATHWAY
  // =============================================

  // 1. Initialize Lenis Smooth Scroll
  if (hasLenis) {
    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      smoothTouch: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync scroll event with navbar & ScrollTrigger
    lenis.on('scroll', function (e) {
      if (e.scroll > 10) {
        if (navbar) navbar.classList.add('scrolled');
      } else {
        if (navbar) navbar.classList.remove('scrolled');
      }
      if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
    });

    if (hasGSAP) {
      // Connect Lenis back to GSAP ticker
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  } else {
    // Basic Fallback Scroll Listener
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        if (navbar) navbar.classList.add('scrolled');
      } else {
        if (navbar) navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // 2. Smooth Anchor Clicking
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var l = 0; l < anchors.length; l++) {
    anchors[l].addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -72 });
        } else {
          var top = target.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }
    });
  }

  // 3. GSAP Animations
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero & Preloader Timeline
    var heroTimeline = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 1.1 }
    });

    // Prepare initial states to prevent layout shifts
    gsap.set('#hero-title', { opacity: 0, y: 40 });
    gsap.set('#hero-sub', { opacity: 0, y: 30 });
    gsap.set('#hero-cta a', { opacity: 0, y: 20 });
    gsap.set('#hero-visual', { opacity: 0, y: 50, scale: 0.97 });
    gsap.set('#stats-bar .stat', { opacity: 0, y: 25 });

    // Preloader Animation
    var preloader = document.getElementById('preloader');
    var preloaderText = document.getElementById('preloader-text');

    if (preloader && preloaderText) {
      if (typeof lenis !== 'undefined' && lenis) lenis.stop(); // Lock scroll
      document.body.style.overflow = 'hidden';

      heroTimeline
        .to(preloaderText, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to(preloaderText, { opacity: 0, y: -20, duration: 0.6, ease: 'power3.in', delay: 0.8 })
        .to(preloader, { yPercent: -100, duration: 0.8, ease: 'power4.inOut', onComplete: function() {
            if (typeof lenis !== 'undefined' && lenis) lenis.start();
            document.body.style.overflow = '';
            preloader.style.display = 'none';
        } }, '-=0.2');
    }

    heroTimeline
      .to('#hero-title', { opacity: 1, y: 0, duration: 1.2 }, preloader ? '-=0.3' : '+=0')
      .to('#hero-sub', { opacity: 1, y: 0 }, '-=0.9')
      .to('#hero-cta a', { opacity: 1, y: 0, stagger: 0.15 }, '-=0.8')
      .to('#hero-visual', { opacity: 1, y: 0, scale: 1, ease: 'power2.out' }, '-=0.9')
      .to('#stats-bar .stat', { opacity: 1, y: 0, stagger: 0.12 }, '-=0.8');

    // Parallax effect for Hero visual
    gsap.to('#hero-visual', {
      yPercent: -15,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Section Entrance Transitions
    var sections = gsap.utils.toArray('.comparison, .portfolio, .pricing, .testimonials, .faq-section, .final-cta');
    sections.forEach(function (sec) {
      var header = sec.querySelector('.comparison-header, .portfolio-header, .pricing-header, .testimonials-header, .faq-header, h2');
      var items = sec.querySelectorAll('.comp-problem, .comp-approach, .portfolio-item, .price-card, .pricing-custom, .testi-card, .faq-item');

      var secTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });

      if (header) {
        gsap.set(header, { opacity: 0, y: 35 });
        secTimeline.to(header, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' });
      }

      if (items.length > 0) {
        gsap.set(items, { opacity: 0, y: 40 });
        secTimeline.to(items, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.12 }, '-=0.6');
      }
    });

    // WA Float Toggle with ScrollTrigger
    var waFloatBtn = document.getElementById('wa-float');
    var footerEl = document.getElementById('footer');
    if (waFloatBtn && footerEl) {
      gsap.set(waFloatBtn, { opacity: 1, pointerEvents: 'auto' });
      
      ScrollTrigger.create({
        trigger: footerEl,
        start: 'top 95%',
        onEnter: function () {
          gsap.to(waFloatBtn, { opacity: 0, pointerEvents: 'none', duration: 0.25, ease: 'power2.out' });
        },
        onLeaveBack: function () {
          gsap.to(waFloatBtn, { opacity: 1, pointerEvents: 'auto', duration: 0.25, ease: 'power2.out' });
        }
      });
    }
  }

})();
