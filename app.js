/* =============================================
   GRADUATION REPORTAGE — APP.JS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV SCROLL BLUR ── */
  const nav = document.querySelector('nav');
  const backTop = document.getElementById('back-top');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    backTop.classList.toggle('visible', y > 400);
  }, { passive: true });

  /* ── BURGER MENU ── */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

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
    lbImg.className = 'lightbox-img photo ' + (item.cls || 'photo-warm');
    lbImg.setAttribute('data-label', item.label || '');
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
    },
    male: {
      title: 'Выпускник',
      bodyClass: 'male',
      steps: [
        {
          key: 'outfit',
          title: 'Выбери костюм',
          options: [
            {
              label: 'Классический чёрный',
              cls: 'photo-cool',
              layerClass: 'look-outfit-black',
              previewImage: 'assets/minigame/male_outfit_black.png'
            },
            {
              label: 'Синий slim-fit',
              cls: 'photo-violet',
              layerClass: 'look-outfit-blue',
              previewImage: 'assets/minigame/male_outfit_blue.png'
            },
            {
              label: 'Светлый летний',
              cls: 'photo-morning',
              layerClass: 'look-outfit-light',
              previewImage: 'assets/minigame/male_outfit_light.png'
            },
            {
              label: 'Смокинг',
              cls: 'photo-gold',
              layerClass: 'look-outfit-tux',
              previewImage: 'assets/minigame/male_outfit_tux.png'
            }
          ]
        },
        {
          key: 'shoes',
          title: 'Выбери обувь',
          options: [
            {
              label: 'Оксфорды',
              cls: 'photo-gold',
              layerClass: 'look-shoes-oxford',
              previewImage: 'assets/minigame/male_shoes_oxford.png'
            },
            {
              label: 'Лоферы',
              cls: 'photo-cool',
              layerClass: 'look-shoes-loafers-male',
              previewImage: 'assets/minigame/male_shoes_loafers.png'
            },
            {
              label: 'Монки',
              cls: 'photo-warm',
              layerClass: 'look-shoes-monks',
              previewImage: 'assets/minigame/male_shoes_monks.png'
            },
            {
              label: 'Дерби',
              cls: 'photo-rose',
              layerClass: 'look-shoes-derby',
              previewImage: 'assets/minigame/male_shoes_derby.png'
            }
          ]
        },
        {
          key: 'accessory',
          title: 'Выбери аксессуар',
          options: [
            {
              label: 'Галстук',
              cls: 'photo-violet',
              layerClass: 'look-accessory-tie',
              previewImage: 'assets/minigame/male_accessory_tie.png'
            },
            {
              label: 'Бабочка',
              cls: 'photo-rose',
              layerClass: 'look-accessory-bow',
              previewImage: 'assets/minigame/male_accessory_bow.png'
            },
            {
              label: 'Подтяжки',
              cls: 'photo-cool',
              layerClass: 'look-accessory-suspenders',
              previewImage: 'assets/minigame/male_accessory_suspenders.png'
            },
            {
              label: 'Карманный платок',
              cls: 'photo-gold',
              layerClass: 'look-accessory-pocket',
              previewImage: 'assets/minigame/male_accessory_pocket.png'
            }
          ]
        },
        {
          key: 'flower',
          title: 'Выбери бутоньерку',
          options: [
            {
              label: 'Белая роза',
              cls: 'photo-rose',
              layerClass: 'look-flower-rose',
              previewImage: 'assets/minigame/male_flower_rose.png'
            },
            {
              label: 'Лаванда',
              cls: 'photo-violet',
              layerClass: 'look-flower-lavender',
              previewImage: 'assets/minigame/male_flower_lavender.png'
            },
            {
              label: 'Гипсофила',
              cls: 'photo-morning',
              layerClass: 'look-flower-gyps',
              previewImage: 'assets/minigame/male_flower_gyps.png'
            },
            {
              label: 'Пион',
              cls: 'photo-gold',
              layerClass: 'look-flower-peony',
              previewImage: 'assets/minigame/male_flower_peony.png'
            }
          ]
        }
      ]
    }
  };
  const characterStep = {
    key: 'character',
    title: 'Кого собираем?',
    options: [
      {
        label: 'Выпускницу',
        cls: 'photo-rose',
        profile: 'female',
        layerClass: 'look-character-female',
        previewImage: 'assets/minigame/base_female.png'
      },
      {
        label: 'Выпускника',
        cls: 'photo-cool',
        profile: 'male',
        layerClass: 'look-character-male',
        previewImage: 'assets/minigame/base_male.png'
      }
    ]
  };

  let currentStep = 0;
  let currentProfile = null;
  const selections = {};

  const gameStage = document.getElementById('game-stage');
  const gameResult = document.getElementById('game-result');
  const progressDots = document.querySelectorAll('.progress-dot');
  const progressLabel = document.querySelector('.progress-label');
  const resultBadge = document.querySelector('.result-badge');
  const resultHint = gameResult ? gameResult.querySelector('p') : null;

  function getActiveSteps() {
    return [characterStep].concat(currentProfile ? gameProfiles[currentProfile].steps : []);
  }

  function getCharacterMarkup() {
    if (selections.character === undefined) {
      return '<div class="dressup-placeholder">Сначала выберите персонажа</div>';
    }
    const charOpt = characterStep.options[selections.character];
    const profileData = gameProfiles[charOpt.profile];
    const selectedOutfitIndex = selections.outfit;
    if (selectedOutfitIndex !== undefined) {
      const selectedOutfit = profileData.steps.find(s => s.key === 'outfit')?.options[selectedOutfitIndex];
      if (selectedOutfit?.previewImage) {
        let transformedImage = selectedOutfit.previewImage;
        if (charOpt.profile === 'female') {
          transformedImage = `assets/minigame/female_outfut_done/female_output_${selectedOutfitIndex + 1}.png`;
        } else if (charOpt.profile === 'male') {
          transformedImage = `assets/minigame/male_output_done/male_output_${selectedOutfitIndex + 1}.png`;
        }
        return `<div class="dressup-layer dressup-body transformed" style="background-image:url('${transformedImage}')"></div>`;
      }
    }
    return `<div class="dressup-layer dressup-body ${profileData.bodyClass}"></div>`;
  }

  function getSelectedItemsMarkup() {
    if (selections.character === undefined) {
      return { left: '', right: '' };
    }
    const charOpt = characterStep.options[selections.character];
    const profileData = gameProfiles[charOpt.profile];
    const cards = [];
    profileData.steps.forEach(step => {
      if (step.key === 'outfit') return;
      if (selections[step.key] !== undefined) {
        const opt = step.options[selections[step.key]];
        cards.push(`
          <div class="dressup-selected-item">
            <div class="dressup-selected-thumb${opt.previewImage ? '' : ' no-image'}" ${opt.previewImage ? `style="background-image:url('${opt.previewImage}');"` : ''}></div>
            <div class="dressup-selected-label">${step.title.replace('Выбери ', '')}: ${opt.label}</div>
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
    const activeSteps = getActiveSteps();
    const step = activeSteps[idx];
    const selectedItems = getSelectedItemsMarkup();
    gameStage.style.opacity = 0;
    setTimeout(() => {
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
            <div class="game-options">
              ${step.options.map((opt, i) => `
                <div class="game-option ${selections[step.key] === i ? 'selected' : ''}" data-step-key="${step.key}" data-idx="${i}">
                  <div class="photo ${opt.cls}" data-label="${opt.previewImage ? '' : opt.label}" ${opt.previewImage ? `style="background-image:url('${opt.previewImage}');background-size:contain;background-position:center;background-repeat:no-repeat;"` : ''}></div>
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
      gameStage.style.opacity = 1;
      gameStage.style.transition = 'opacity 0.4s';

      gameStage.querySelectorAll('.game-option').forEach(opt => {
        opt.addEventListener('click', () => {
          const stepKey = opt.dataset.stepKey;
          const selectedIndex = parseInt(opt.dataset.idx, 10);
          selections[stepKey] = selectedIndex;
          if (stepKey === 'character') {
            const selectedProfile = characterStep.options[selectedIndex].profile;
            if (currentProfile && currentProfile !== selectedProfile) {
              gameProfiles[currentProfile].steps.forEach(profileStep => delete selections[profileStep.key]);
            }
            currentProfile = selectedProfile;
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
    const activeSteps = getActiveSteps();
    gameStage.style.display = 'none';
    gameResult.classList.add('show');
    const charOpt = selections.character !== undefined ? characterStep.options[selections.character] : null;
    if (charOpt) {
      if (resultBadge) resultBadge.textContent = `✨ ${charOpt.label} готов${charOpt.profile === 'female' ? 'а' : ''} к выпускному!`;
      if (resultHint) resultHint.textContent = 'Образ собран. Отличный выбор!';
    }
    document.getElementById('result-summary').innerHTML = activeSteps.map(step => {
      const sel = selections[step.key] !== undefined ? step.options[selections[step.key]].label : '—';
      return `<div class="result-item"><div class="result-item-cat">${step.title.replace('Выбери ', '')}</div><div class="result-item-val">${sel}</div></div>`;
    }).join('');
    launchConfetti();
    progressDots.forEach(d => d.classList.add('done'));
  }

  document.getElementById('g-restart').addEventListener('click', () => {
    currentStep = 0;
    currentProfile = null;
    Object.keys(selections).forEach(k => delete selections[k]);
    gameStage.style.display = '';
    gameResult.classList.remove('show');
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
