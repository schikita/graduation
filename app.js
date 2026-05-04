/* =============================================
   GRADUATION REPORTAGE — APP.JS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV SCROLL BLUR ── */
  const nav = document.querySelector('nav');
  const backTop = document.getElementById('back-top');
  const hero = document.getElementById('hero');
  const updateNavState = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    backTop.classList.toggle('visible', y > 400);
    if (hero) {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      document.body.classList.toggle('below-hero', y >= heroBottom - 80);
    }
  };
  window.addEventListener('scroll', updateNavState, { passive: true });
  window.addEventListener('resize', updateNavState);
  updateNavState();

  /* ── LAZY LOAD (viewport / IntersectionObserver) ── */
  function cssBackgroundUrlValue(src) {
    const v = String(src || '').trim();
    if (!v) return '';
    if (/^url\s*\(/i.test(v)) return v;
    const u = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `url('${u}')`;
  }

  /** Escape path for url('…') inside background / image-set */
  function escapeBgPathForUrl(src) {
    return String(src || '').trim().replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  /** Prefer WebP, fall back to JPEG (same dimensions), one network request where supported */
  function cssBackgroundImageWebpWithJpegFallback(webpPath, jpegPath) {
    const w = escapeBgPathForUrl(webpPath);
    const j = escapeBgPathForUrl(jpegPath);
    if (!w || !j) return cssBackgroundUrlValue(webpPath || jpegPath);
    return `image-set(url('${w}') type('image/webp'), url('${j}') type('image/jpeg'))`;
  }

  const lazyObserverOptions = { root: null, rootMargin: '0px', threshold: 0.01 };
  let lazyObserver;

  function bindLazyInRoot(root = document) {
    if (!lazyObserver || !root) return;
    root.querySelectorAll('img[data-defer-src], iframe[data-defer-src], video[data-defer-src]').forEach((el) => {
      if (el.matches && el.matches('img[data-load-with-menu]')) return;
      lazyObserver.observe(el);
    });
    root.querySelectorAll('[data-lazy-bg], [data-lazy-bg-mobile]').forEach((el) => {
      lazyObserver.observe(el);
    });
    root.querySelectorAll('[data-bg-defer]').forEach((el) => {
      lazyObserver.observe(el);
    });
    root.querySelectorAll('[style*="background-image"]').forEach((el) => {
      const bg = el.style.backgroundImage;
      if (bg && bg !== 'none' && bg.includes('url')) {
        el.dataset.bgDefer = bg;
        el.style.backgroundImage = 'none';
      }
      lazyObserver.observe(el);
    });
  }

  lazyObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      const deferSrc = el.getAttribute && el.getAttribute('data-defer-src');
      if (deferSrc) {
        if (el.tagName === 'IMG' || el.tagName === 'IFRAME') {
          el.src = deferSrc;
        } else if (el.tagName === 'VIDEO') {
          el.src = deferSrc;
          el.load();
        }
        el.removeAttribute('data-defer-src');
      }

      const bgDeferRaw =
        el.getAttribute('data-bg-defer') || (el.dataset && el.dataset.bgDefer);
      if (bgDeferRaw) {
        const bgDeferFallback =
          el.getAttribute('data-bg-defer-fallback') ||
          (el.dataset && el.dataset.bgDeferFallback);
        if (bgDeferFallback) {
          el.style.backgroundImage = cssBackgroundImageWebpWithJpegFallback(
            bgDeferRaw,
            bgDeferFallback
          );
          el.removeAttribute('data-bg-defer-fallback');
          delete el.dataset.bgDeferFallback;
        } else {
          el.style.backgroundImage = cssBackgroundUrlValue(bgDeferRaw);
        }
        el.removeAttribute('data-bg-defer');
        delete el.dataset.bgDefer;
      }

      const lazyBgDesktop = el.dataset && el.dataset.lazyBg;
      const lazyBgMobile = el.dataset && el.dataset.lazyBgMobile;
      if (lazyBgDesktop || lazyBgMobile) {
        const useUrl =
          (window.innerWidth <= 768 && lazyBgMobile) ? lazyBgMobile : lazyBgDesktop;
        if (useUrl) {
          el.style.backgroundImage = cssBackgroundUrlValue(useUrl);
        }
        delete el.dataset.lazyBg;
        delete el.dataset.lazyBgMobile;
      }

      obs.unobserve(el);
    });
  }, lazyObserverOptions);

  bindLazyInRoot(document);

  /* Мини-игра: отдельный stylesheet с PNG-слоями — только у границы viewport */
  const minigameSec = document.getElementById('minigame');
  if (minigameSec) {
    const ioMinigameCss = new IntersectionObserver((entries, o) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (document.getElementById('minigame-layers-css')) {
          o.disconnect();
          return;
        }
        const link = document.createElement('link');
        link.id = 'minigame-layers-css';
        link.rel = 'stylesheet';
        link.href = 'minigame-layers.css';
        document.head.appendChild(link);
        o.disconnect();
      });
    }, { rootMargin: '100px 0px', threshold: 0.01 });
    ioMinigameCss.observe(minigameSec);
  }

  /* ── BURGER MENU ── */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    const isOpen = mobileMenu.classList.contains('open');
    document.body.classList.toggle('mobile-menu-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (isOpen && lazyObserver) {
      mobileMenu.querySelectorAll('img[data-defer-src][data-load-with-menu]').forEach((img) => {
        lazyObserver.observe(img);
      });
    }
  });
  document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
    });
  });

  /* ── HERO CTA MOBILE OFFSET ── */
  const heroCta = document.querySelector('.hero-content .btn[href="#hero-note"]');
  const heroNote = document.getElementById('hero-note');
  if (heroCta && heroNote) {
    heroCta.addEventListener('click', (e) => {
      if (window.innerWidth > 768) return;
      e.preventDefault();
      const extraOffset = 56;
      const targetY = heroNote.getBoundingClientRect().top + window.pageYOffset + extraOffset;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  }

  /* ── BACK TO TOP ── */
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── PARALLAX ── */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  function doParallax() {
    parallaxEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }
  window.addEventListener('scroll', doParallax, { passive: true });
  doParallax();

  /* ── REVEAL ON SCROLL ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));

  /* ── HORIZONTAL DRAG SLIDER ── */
  document.querySelectorAll('.h-slider').forEach(slider => {
    let isDown = false, startX, scrollLeft;
    slider.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
    slider.addEventListener('mouseleave', () => isDown = false);
    slider.addEventListener('mouseup', () => isDown = false);
    slider.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      slider.scrollLeft = scrollLeft - (e.pageX - slider.offsetLeft - startX);
    });
    // Touch
    let touchX;
    slider.addEventListener('touchstart', e => { touchX = e.touches[0].pageX; scrollLeft = slider.scrollLeft; }, { passive: true });
    slider.addEventListener('touchmove', e => {
      slider.scrollLeft = scrollLeft - (e.touches[0].pageX - touchX);
    }, { passive: true });
  });

  /* ── SEMI-CIRCLE VERTICAL CAROUSEL ── */
  const salonsCarousel = document.querySelector('.salons-carousel');
  const salonsPhotos = document.querySelectorAll('.salons-carousel .salons-photo');
  if (salonsCarousel && salonsPhotos.length) {
    let activeIndex = 0;
    const visibleRange = 5;
    const stepY = 82;
    const radiusX = 118;

    function wrapDistance(i, a, n) {
      let d = i - a;
      const half = Math.floor(n / 2);
      if (d > half) d -= n;
      if (d < -half) d += n;
      return d;
    }

    function renderSalonsCarousel() {
      const total = salonsPhotos.length;
      salonsPhotos.forEach((photo, i) => {
        const d = wrapDistance(i, activeIndex, total);
        if (Math.abs(d) > visibleRange) {
          photo.style.opacity = '0';
          photo.style.pointerEvents = 'none';
          return;
        }
        const t = d / visibleRange;
        const y = t * stepY * 1.35;
        const x = -Math.cos(t * Math.PI * 0.5) * radiusX;
        const scale = 1 - Math.min(Math.abs(t) * 0.28, 0.28);
        const alpha = 1 - Math.min(Math.abs(t) * 0.48, 0.48);
        photo.style.opacity = String(alpha);
        photo.style.zIndex = String(20 - Math.abs(d));
        photo.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
        photo.style.filter = d === 0 ? 'saturate(1.05)' : 'saturate(0.85) brightness(0.9)';
        photo.classList.toggle('is-active', d === 0);
        photo.style.pointerEvents = d === 0 ? 'auto' : 'none';
      });
    }

    function moveCarousel(dir) {
      const total = salonsPhotos.length;
      activeIndex = (activeIndex + dir + total) % total;
      renderSalonsCarousel();
    }

    salonsCarousel.addEventListener('wheel', (e) => {
      e.preventDefault();
      moveCarousel(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    let touchStartY = 0;
    salonsCarousel.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    salonsCarousel.addEventListener('touchmove', (e) => {
      const delta = e.touches[0].clientY - touchStartY;
      if (Math.abs(delta) < 24) return;
      moveCarousel(delta < 0 ? 1 : -1);
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    renderSalonsCarousel();
  }

  /* ── GALLERY FILTERS ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const masonryItems = document.querySelectorAll('.masonry-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      masonryItems.forEach(item => {
        if (cat === 'all' || item.dataset.cat === cat) {
          item.style.display = '';
          item.style.animation = 'fadeIn 0.4s ease';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  /* ── LIGHTBOX ── */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  let lbItems = [], lbIdx = 0;

  function openLightbox(items, idx) {
    lbItems = items; lbIdx = idx;
    showLb();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function showLb() {
    const item = lbItems[lbIdx];
    lbImg.className = 'lightbox-img photo' + (item.cls ? ' ' + item.cls : '');
    lbImg.setAttribute('data-label', item.label || '');
    if (item.bg) {
      lbImg.style.backgroundImage = `url('${item.bg}')`;
    } else {
      lbImg.style.backgroundImage = '';
    }
  }
  document.getElementById('lb-close').addEventListener('click', () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  });
  document.getElementById('lb-prev').addEventListener('click', () => { lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; showLb(); });
  document.getElementById('lb-next').addEventListener('click', () => { lbIdx = (lbIdx + 1) % lbItems.length; showLb(); });
  lightbox.addEventListener('click', e => { if (e.target === lightbox) { lightbox.classList.remove('open'); document.body.style.overflow = ''; } });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
    if (e.key === 'ArrowLeft') { lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; showLb(); }
    if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbItems.length; showLb(); }
  });

  // Gallery lightbox items
  const galleryItems = [
    { cls: 'photo-rose', label: 'Образ выпускницы' }, { cls: 'photo-gold', label: 'Детали образа' },
    { cls: 'photo-warm', label: 'Эмоции утра' }, { cls: 'photo-cool', label: 'За кулисами' },
    { cls: 'photo-violet', label: 'Финальные штрихи' }, { cls: 'photo-morning', label: 'Последние минуты' },
    { cls: 'photo-rose', label: 'Букет выпускницы' }, { cls: 'photo-gold', label: 'Украшения' },
    { cls: 'photo-warm', label: 'Улыбки друзей' }, { cls: 'photo-cool', label: 'Причёска' },
    { cls: 'photo-violet', label: 'Туфли выпускницы' }, { cls: 'photo-morning', label: 'Класс в последний раз' },
  ];
  document.querySelectorAll('.masonry-item').forEach((el, i) => {
    el.addEventListener('click', () => openLightbox(galleryItems, i % galleryItems.length));
  });

  // Portraits lightbox items (Образы выпускников)
  const portraitsItems = [
    { bg: 'assets/img/galery/1.jpg', label: 'Выпускница в вечернем платье' },
    { bg: 'assets/img/galery/2.jpg', label: 'Выпускник в костюме' },
    { bg: 'assets/img/galery/3.jpg', label: 'Подруги-выпускницы' },
    { bg: 'assets/img/galery/4.jpg', label: 'Выпускники — лучшие друзья' },
  ];
  const portraitPhotos = document.querySelectorAll('#portraits .portrait-card .photo');
  if (portraitPhotos.length) {
    portraitPhotos.forEach((el, i) => {
      el.addEventListener('click', () => {
        openLightbox(portraitsItems, i % portraitsItems.length);
      });
    });
  }

  // Karpenko note photos lightbox items
  const karpenkoPhotos = document.querySelectorAll('#karpenko .karpenko-peek-photo');
  const karpenkoItems = [
    { bg: 'assets/photo/2-1.jpg', label: 'Фото Карпенко 1' },
    { bg: 'assets/photo/2-2.jpg', label: 'Фото Карпенко 2' },
    { bg: 'assets/photo/2-3.jpg', label: 'Фото Карпенко 3' },
  ];
  if (karpenkoPhotos.length) {
    karpenkoPhotos.forEach((el, i) => {
      el.addEventListener('click', () => {
        openLightbox(karpenkoItems, i % karpenkoItems.length);
      });
    });
  }

  /* ── MINI-GAME ── */
  const gameProfiles = {
    female: {
      title: 'Выпускница',
      bodyClass: 'female',
      steps: [
        {
          key: 'outfit',
          title: 'Выбери наряд',
          options: [
            {
              label: 'Вечернее платье',
              cls: 'photo-rose',
              layerClass: 'look-outfit-dress',
              previewImage: 'assets/minigame/female_outfit_dress.png'
            },
            {
              label: 'Брючный костюм',
              cls: 'photo-cool',
              layerClass: 'look-outfit-pantsuit',
              previewImage: 'assets/minigame/female_outfit_pantsuit.png'
            },
            {
              label: 'Платье в стиле бохо',
              cls: 'photo-violet',
              layerClass: 'look-outfit-boho',
              previewImage: 'assets/minigame/female_outfit_boho.png'
            },
            {
              label: 'Классическое А-силуэт',
              cls: 'photo-gold',
              layerClass: 'look-outfit-classic',
              previewImage: 'assets/minigame/female_outfit_classic.png'
            }
          ]
        },
        {
          key: 'shoes',
          title: 'Выбери обувь',
          options: [
            {
              label: 'Туфли на каблуке',
              cls: 'photo-gold',
              layerClass: 'look-shoes-heels',
              previewImage: 'assets/minigame/female_shoes_heels.png'
            },
            {
              label: 'Балетки',
              cls: 'photo-rose',
              layerClass: 'look-shoes-ballet',
              previewImage: 'assets/minigame/female_shoes_ballet.png'
            },
            {
              label: 'Босоножки',
              cls: 'photo-warm',
              layerClass: 'look-shoes-sandals',
              previewImage: 'assets/minigame/female_shoes_sandals.png'
            },
            {
              label: 'Лоферы',
              cls: 'photo-cool',
              layerClass: 'look-shoes-loafers',
              previewImage: 'assets/minigame/female_shoes_loafers.png'
            }
          ]
        },
        {
          key: 'accessory',
          title: 'Выбери аксессуар',
          options: [
            {
              label: 'Жемчужное ожерелье',
              cls: 'photo-rose',
              layerClass: 'look-accessory-pearls',
              previewImage: 'assets/minigame/female_accessory_pearls.png'
            },
            {
              label: 'Золотые серьги',
              cls: 'photo-gold',
              layerClass: 'look-accessory-earrings',
              previewImage: 'assets/minigame/female_accessory_earrings.png'
            },
            {
              label: 'Клатч',
              cls: 'photo-violet',
              layerClass: 'look-accessory-clutch',
              previewImage: 'assets/minigame/female_accessory_clutch.png'
            },
            {
              label: 'Венок из цветов',
              cls: 'photo-morning',
              layerClass: 'look-accessory-wreath',
              previewImage: 'assets/minigame/female_accessory_wreath.png'
            }
          ]
        },
        {
          key: 'flowers',
          title: 'Выбери букет',
          options: [
            {
              label: 'Розы',
              cls: 'photo-rose',
              layerClass: 'look-flowers-roses',
              previewImage: 'assets/minigame/female_flowers_roses.png'
            },
            {
              label: 'Пионы',
              cls: 'photo-violet',
              layerClass: 'look-flowers-peonies',
              previewImage: 'assets/minigame/female_flowers_peonies.png'
            },
            {
              label: 'Полевые цветы',
              cls: 'photo-morning',
              layerClass: 'look-flowers-field',
              previewImage: 'assets/minigame/female_flowers_field.png'
            },
            {
              label: 'Белые лилии',
              cls: 'photo-gold',
              layerClass: 'look-flowers-lilies',
              previewImage: 'assets/minigame/female_flowers_lilies.png'
            }
          ]
        }
      ]
    }
  };

  const heroineMeta = {
    label: 'Выпускницу',
    badgeName: 'Выпускница',
    profile: 'female',
    layerClass: 'look-character-female',
    previewImage: 'assets/minigame/base_female.png'
  };

  let currentStep = 0;
  const selections = {};
  let gameRenderGeneration = 0;

  const minigameSection = document.getElementById('minigame');
  const gameStage = document.getElementById('game-stage');
  const gameResult = document.getElementById('game-result');
  const progressDots = document.querySelectorAll('.progress-dot');
  const progressLabel = document.querySelector('.progress-label');
  const resultBadge = document.querySelector('.result-badge');
  const resultHint = document.getElementById('result-hint');
  const resultHeroWrap = document.getElementById('result-hero-wrap');
  const resultSummaryEl = document.getElementById('result-summary');

  function getActiveSteps() {
    return gameProfiles.female.steps;
  }

  /** Для выпускницы: наряды 1–2 → жемчуг и клатч; наряды 3–4 → серьги и венок. */
  function getGameOptionRows(step) {
    if (step.key === 'accessory') {
      const oi = parseInt(selections.outfit, 10);
      const indices = !Number.isNaN(oi) && oi >= 2 ? [1, 3] : [0, 2];
      return indices.map((idx) => ({ opt: step.options[idx], idx }));
    }
    return step.options.map((opt, idx) => ({ opt, idx }));
  }

  function normalizeFemaleAccessorySelection() {
    if (selections.accessory === undefined) return;
    const outfitIdx = parseInt(selections.outfit, 10);
    const allowed = !Number.isNaN(outfitIdx) && outfitIdx >= 2 ? [1, 3] : [0, 2];
    if (!allowed.includes(selections.accessory)) delete selections.accessory;
  }

  function getBouquetLayerMarkup() {
    const stepKey = 'flowers';
    const idx = selections[stepKey];
    if (idx === undefined) return '';
    const profileData = gameProfiles.female;
    const step = profileData.steps.find((s) => s.key === stepKey);
    const opt = step?.options[idx];
    if (!opt?.layerClass) return '';
    return `<div class="dressup-layer dressup-bouquet ${opt.layerClass}" aria-hidden="true"></div>`;
  }

  function getCharacterMarkup() {
    const profileData = gameProfiles.female;
    const outfitIdx = parseInt(selections.outfit, 10);
    if (!Number.isNaN(outfitIdx)) {
      const selectedOutfit = profileData.steps.find(s => s.key === 'outfit')?.options[outfitIdx];
      if (selectedOutfit?.previewImage) {
        let transformedImage = selectedOutfit.previewImage;
        const shoeRaw = selections.shoes;
        const shoeIdx = shoeRaw === undefined || shoeRaw === null || shoeRaw === ''
          ? NaN
          : parseInt(shoeRaw, 10);
        const dressNum = outfitIdx + 1;
        const outfitCount = profileData.steps.find(s => s.key === 'outfit')?.options.length ?? 4;
        const hasShoes = !Number.isNaN(shoeIdx);
        const shoeNum = hasShoes ? Math.min(3, Math.max(0, shoeIdx)) + 1 : NaN;
        const acRaw = selections.accessory;
        const acNum = acRaw === undefined || acRaw === null || acRaw === ''
          ? NaN
          : parseInt(acRaw, 10);
        /* Наряды 1–2 + обувь + жемчуг/клатч: assets/minigame/acsessuars/{1|2}-1/ */
        const hasAccessoryLayerForDress = dressNum === 1 || dressNum === 2;
        const usePearlClutchAccessoryComposite =
          (outfitIdx === 0 || outfitIdx === 1) &&
          hasShoes &&
          !Number.isNaN(acNum) &&
          (acNum === 0 || acNum === 2) &&
          hasAccessoryLayerForDress;
        if (usePearlClutchAccessoryComposite) {
          const acSlot = acNum === 0 ? 1 : 2;
          const accBase = `assets/minigame/acsessuars/${dressNum}-1`;
          if (shoeNum === 1) {
            transformedImage = `${accBase}/female_output_${dressNum}-acssesuars-1-${acSlot}.png`;
          } else {
            transformedImage = `${accBase}/female_output_${dressNum}-obuv-${shoeNum}-${acSlot}.png`;
          }
        } else if (
          (outfitIdx === 2 || outfitIdx === 3) &&
          hasShoes &&
          !Number.isNaN(acNum) &&
          (acNum === 1 || acNum === 3)
        ) {
          /* Наряды 3–4 + обувь + серьги/венок: acsessuars/{3|4}-1/ …-acssesuars-{обувь}-{слот}.png */
          const acSlot = acNum === 1 ? 1 : 2;
          const accBase = `assets/minigame/acsessuars/${dressNum}-1`;
          transformedImage = `${accBase}/female_output_${dressNum}-acssesuars-${shoeNum}-${acSlot}.png`;
        } else if (outfitIdx >= 0 && outfitIdx < outfitCount && hasShoes) {
          transformedImage = `assets/minigame/obuv-female/female_output_${dressNum}-obuv-${shoeNum}.png`;
        } else {
          transformedImage = `assets/minigame/female_outfut_done/female_output_${dressNum}.png`;
        }
        const bouquet = getBouquetLayerMarkup();
        return `<div class="dressup-layer dressup-body transformed" data-bg-defer="${String(transformedImage).replace(/"/g, '&quot;')}"></div>${bouquet}`;
      }
    }
    const bouquet = getBouquetLayerMarkup();
    return `<div class="dressup-layer dressup-body ${profileData.bodyClass}"></div>${bouquet}`;
  }

  function getSelectedItemsMarkup() {
    const profileData = gameProfiles.female;
    const cards = [];
    profileData.steps.forEach(step => {
      if (step.key === 'outfit') return;
      if (selections[step.key] !== undefined) {
        const opt = step.options[selections[step.key]];
        cards.push(`
          <div class="dressup-selected-item">
            <div class="dressup-selected-thumb${opt.previewImage ? '' : ' no-image'}" ${opt.previewImage ? `data-bg-defer="${String(opt.previewImage).replace(/"/g, '&quot;')}"` : ''}></div>
          </div>
        `);
      }
    });
    return {
      left: cards.filter((_, i) => i % 2 === 0).join(''),
      right: cards.filter((_, i) => i % 2 === 1).join('')
    };
  }

  function renderStep(idx) {
    normalizeFemaleAccessorySelection();
    const gameHeader = document.querySelector('#minigame .game-header');
    if (gameHeader) gameHeader.classList.toggle('game-header--playing', currentStep > 0);
    if (minigameSection) {
      minigameSection.classList.toggle('minigame--playing', currentStep > 0);
      minigameSection.classList.remove('minigame--result');
    }
    const activeSteps = getActiveSteps();
    const step = activeSteps[idx];
    const optionRows = getGameOptionRows(step);
    const gen = ++gameRenderGeneration;
    gameStage.style.opacity = 0;
    setTimeout(() => {
      if (gen !== gameRenderGeneration) return;
      const selectedItems = getSelectedItemsMarkup();
      gameStage.innerHTML = `
        <div class="game-layout">
          <div class="game-avatar-panel reveal visible">
            <div class="game-avatar-title">Превью образа</div>
            <div class="dressup-preview-shell">
              <div class="dressup-side left">${selectedItems.left}</div>
              <div class="dressup-preview">
                ${getCharacterMarkup()}
              </div>
              <div class="dressup-side right">${selectedItems.right}</div>
            </div>
          </div>
          <div class="game-controls">
            <div class="game-question reveal visible">
              <h3>${step.title}</h3>
            </div>
            <div class="game-options${optionRows.length === 2 ? ' game-options--pair' : ''}">
              ${optionRows.map(({ opt, idx }) => `
                <div class="game-option ${selections[step.key] === idx ? 'selected' : ''}" data-step-key="${step.key}" data-idx="${idx}">
                  <div class="photo ${opt.cls}" data-label="${opt.previewImage ? '' : opt.label}" ${opt.previewImage ? `data-bg-defer="${String(opt.previewImage).replace(/"/g, '&quot;')}"` : ''}></div>
                  <div class="game-option-label">${opt.label}</div>
                  <div class="game-option-check">✓</div>
                </div>
              `).join('')}
            </div>
            <div class="game-nav">
              ${idx > 0 ? '<button class="btn" id="g-prev">← Назад</button>' : ''}
              <button class="btn" id="g-next" ${selections[step.key] === undefined ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''}>${idx < activeSteps.length - 1 ? 'Далее →' : '✨ Готово!'}</button>
            </div>
          </div>
        </div>
      `;
      bindLazyInRoot(gameStage);
      gameStage.style.opacity = 1;
      gameStage.style.transition = 'opacity 0.4s';

      gameStage.querySelectorAll('.game-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
          const card = e.currentTarget;
          const stepKey = card.dataset.stepKey;
          const selectedIndex = parseInt(card.getAttribute('data-idx'), 10);
          if (Number.isNaN(selectedIndex)) return;
          selections[stepKey] = selectedIndex;
          if (stepKey === 'outfit') {
            delete selections.accessory;
          }
          renderStep(currentStep);
        });
      });

      const prevBtn = document.getElementById('g-prev');
      const nextBtn = document.getElementById('g-next');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          currentStep--;
          updateProgress();
          renderStep(currentStep);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (selections[step.key] === undefined) return;
          const stepsCount = getActiveSteps().length;
          if (currentStep < stepsCount - 1) {
            currentStep++;
            updateProgress();
            renderStep(currentStep);
          } else {
            showResult();
          }
        });
      }
    }, 200);
  }

  function updateProgress() {
    const stepsCount = getActiveSteps().length;
    progressDots.forEach((dot, i) => {
      dot.style.display = i < stepsCount ? '' : 'none';
      dot.classList.toggle('done', i < currentStep);
      dot.classList.toggle('current', i === currentStep);
    });
    progressLabel.textContent = `${currentStep + 1} / ${stepsCount}`;
  }

  function showResult() {
    gameStage.style.display = 'none';
    gameResult.classList.add('show');
    if (minigameSection) {
      minigameSection.classList.remove('minigame--playing');
      minigameSection.classList.add('minigame--result');
    }
    if (resultBadge) {
      const who = heroineMeta.badgeName || heroineMeta.label;
      resultBadge.textContent = `✨ ${who} готова к выпускному!`;
    }
    if (resultHeroWrap) {
      resultHeroWrap.innerHTML = `<div class="dressup-preview dressup-preview--result">${getCharacterMarkup()}</div>`;
      bindLazyInRoot(resultHeroWrap);
    }
    if (resultHint) resultHint.style.display = 'none';
    if (resultSummaryEl) {
      resultSummaryEl.innerHTML = '';
      resultSummaryEl.style.display = 'none';
    }
    launchConfetti();
    progressDots.forEach(d => d.classList.add('done'));
  }

  document.getElementById('g-restart').addEventListener('click', () => {
    currentStep = 0;
    Object.keys(selections).forEach(k => delete selections[k]);
    gameStage.style.display = '';
    gameResult.classList.remove('show');
    if (minigameSection) minigameSection.classList.remove('minigame--result');
    if (resultHeroWrap) resultHeroWrap.innerHTML = '';
    if (resultHint) {
      resultHint.style.display = '';
      resultHint.textContent = 'Твой образ собран. Ты великолепна.';
    }
    if (resultSummaryEl) resultSummaryEl.style.display = '';
    updateProgress();
    renderStep(0);
  });

  updateProgress();
  renderStep(0);

  /* ── CONFETTI ── */
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = [];
    const colors = ['#f0ddb4','#e4b0a8','#c9a060','#9b8ec4','#fff'];
    for (let i = 0; i < 140; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        w: 6 + Math.random() * 8,
        h: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: -1.5 + Math.random() * 3,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vr: -0.05 + Math.random() * 0.1,
        alpha: 1
      });
    }
    let frame;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y > canvas.height * 0.7) p.alpha -= 0.02;
        if (p.alpha > 0) { alive = true; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });
      if (alive) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
    setTimeout(() => { cancelAnimationFrame(frame); ctx.clearRect(0, 0, canvas.width, canvas.height); }, 5000);
  }

  /* ── MAGNETIC BUTTONS ── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * 0.15}px, ${dy * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

});
