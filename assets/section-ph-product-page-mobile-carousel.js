document.addEventListener('DOMContentLoaded', function () {
  const gallery = document.querySelector('.ph-pdp-product-images[data-mobile-gallery="carousel"]');
  if (!gallery) return;

  const track = gallery.querySelector('.ph-pdp-product-media-list');
  const prev = gallery.querySelector('[data-ph-mobile-carousel-prev]');
  const next = gallery.querySelector('[data-ph-mobile-carousel-next]');
  const dots = Array.from(gallery.querySelectorAll('[data-ph-mobile-carousel-dot]'));
  const mobileQuery = window.matchMedia('(max-width: 767px)');
  const autoplayEnabled = gallery.dataset.mobileAutoplay === 'true';
  const autoplayDelay = Math.max(Number(gallery.dataset.mobileDelay || 4), 1) * 1000;
  let autoplayTimer = null;
  let swiper = null;
  let isDragging = false;

  if (!track) return;

  function getVisibleItems() {
    return Array.from(track.querySelectorAll('.ph-pdp-product-media-item')).filter((item) => item.offsetParent !== null);
  }

  function prepareSwiperSlides() {
    track.querySelectorAll('.ph-pdp-product-media-item').forEach((item) => item.classList.add('swiper-slide'));
  }

  function getActiveIndex(items) {
    if (!items.length) return 0;
    if (swiper) return Math.min(swiper.activeIndex || 0, items.length - 1);

    const left = track.scrollLeft;
    let activeIndex = 0;
    let activeDistance = Infinity;

    items.forEach((item, index) => {
      const distance = Math.abs(item.offsetLeft - left);
      if (distance < activeDistance) {
        activeDistance = distance;
        activeIndex = index;
      }
    });

    return activeIndex;
  }

  function scrollToIndex(index) {
    const items = getVisibleItems();
    if (!items.length) return;
    const nextIndex = ((index % items.length) + items.length) % items.length;

    if (swiper) {
      swiper.slideTo(nextIndex);
      return;
    }

    track.scrollTo({ left: items[nextIndex].offsetLeft, behavior: 'smooth' });
  }

  function updateProgressBar(items) {
    const slideCount = Math.max(items.length, 1);
    const dotsBar = gallery.querySelector('.ph-pdp-mobile-carousel-dots');
    const barWidth = dotsBar?.clientWidth || gallery.clientWidth || track.clientWidth || 0;

    const maxScroll = swiper ? Math.max(Math.abs(swiper.maxTranslate() - swiper.minTranslate()), 0) : Math.max(track.scrollWidth - track.clientWidth, 0);
    const activeIndex = getActiveIndex(items);
    const rawProgress = swiper && !isDragging
      ? (slideCount > 1 ? activeIndex / (slideCount - 1) : 0)
      : (swiper ? (swiper.progress || 0) : (maxScroll > 0 ? track.scrollLeft / maxScroll : 0));
    const scrollProgress = maxScroll > 0 && Number.isFinite(rawProgress) ? Math.min(Math.max(rawProgress, 0), 1) : 0;
    const visibleRatio = swiper && swiper.virtualSize
      ? Math.min((swiper.width || track.clientWidth) / swiper.virtualSize, 1)
      : (track.scrollWidth > 0 ? Math.min(track.clientWidth / track.scrollWidth, 1) : 1);
    const progressWidth = maxScroll > 0 ? Math.max(barWidth * visibleRatio, barWidth / slideCount) : barWidth / slideCount;
    const progressX = Math.max(barWidth - progressWidth, 0) * scrollProgress;

    gallery.style.setProperty('--ph-carousel-slide-count', String(slideCount));
    gallery.style.setProperty('--ph-carousel-progress-width', `${progressWidth}px`);
    gallery.style.setProperty('--ph-carousel-progress-x', `${progressX}px`);
  }

  function updateState() {
    const items = getVisibleItems();
    const activeIndex = getActiveIndex(items);
    const hasMultipleSlides = mobileQuery.matches && items.length > 1;

    gallery.style.setProperty('--ph-carousel-active-index', String(activeIndex));
    updateProgressBar(items);

    if (prev) prev.disabled = !hasMultipleSlides || activeIndex === 0;
    if (next) next.disabled = !hasMultipleSlides || activeIndex >= items.length - 1;

    dots.forEach((dot, index) => {
      const isAvailable = index < items.length;
      dot.hidden = !isAvailable;
      dot.classList.toggle('is-active', isAvailable && index === activeIndex);

      if (isAvailable && index === activeIndex) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startDragging() {
    stopAutoplay();
    isDragging = true;
    gallery.classList.add('is-dragging');
  }

  function stopDragging() {
    isDragging = false;
    gallery.classList.remove('is-dragging');
    updateState();
  }

  function startAutoplay() {
    stopAutoplay();
    if (!autoplayEnabled || !mobileQuery.matches || getVisibleItems().length < 2) return;

    autoplayTimer = window.setInterval(() => {
      const items = getVisibleItems();
      if (items.length < 2) return;
      scrollToIndex(getActiveIndex(items) + 1);
    }, autoplayDelay);
  }

  function refreshCarousel(resetPosition) {
    if (swiper) {
      prepareSwiperSlides();
      swiper.update();
      if (resetPosition) swiper.slideTo(0, 0);
    } else if (resetPosition) {
      track.scrollTo({ left: 0, behavior: 'auto' });
    }

    updateState();
    startAutoplay();
  }

  function initSwiper() {
    if (swiper || !mobileQuery.matches || typeof window.Swiper === 'undefined') return;

    gallery.classList.add('swiper', 'ph-pdp-mobile-carousel-swiper');
    track.classList.add('swiper-wrapper');
    prepareSwiperSlides();

    swiper = new window.Swiper(gallery, {
      slidesPerView: 'auto',
      slidesPerGroup: 1,
      spaceBetween: 0,
      speed: 460,
      resistanceRatio: 0.45,
      threshold: 2,
      watchSlidesProgress: true,
      freeMode: false,
      longSwipesRatio: 0.22,
      longSwipesMs: 180,
      shortSwipes: true,
      followFinger: true,
      touchReleaseOnEdges: false,
      navigation: {
        prevEl: prev || null,
        nextEl: next || null,
      },
      on: {
        activeIndexChange: updateState,
        progress: function () {
          if (isDragging) updateState();
        },
        resize: updateState,
        sliderMove: updateState,
        setTranslate: function () {
          if (isDragging) updateState();
        },
        slideChangeTransitionStart: updateState,
        touchStart: startDragging,
        touchEnd: stopDragging,
        transitionEnd: stopDragging,
      },
    });
  }

  function destroySwiper() {
    if (!swiper) return;

    swiper.destroy(true, true);
    swiper = null;
    gallery.classList.remove('swiper', 'ph-pdp-mobile-carousel-swiper');
    track.classList.remove('swiper-wrapper');
    track.querySelectorAll('.ph-pdp-product-media-item').forEach((item) => item.classList.remove('swiper-slide'));
  }

  function syncMode(resetPosition) {
    if (mobileQuery.matches) {
      initSwiper();
    } else {
      destroySwiper();
    }

    refreshCarousel(resetPosition);
  }

  prev?.addEventListener('click', () => {
    stopAutoplay();
    scrollToIndex(getActiveIndex(getVisibleItems()) - 1);
  });

  next?.addEventListener('click', () => {
    stopAutoplay();
    scrollToIndex(getActiveIndex(getVisibleItems()) + 1);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      scrollToIndex(index);
    });
  });

  track.addEventListener('scroll', () => window.requestAnimationFrame(updateState), { passive: true });
  track.addEventListener('touchstart', startDragging, { passive: true });
  track.addEventListener('touchend', stopDragging, { passive: true });
  track.addEventListener('pointerdown', startDragging, { passive: true });
  track.addEventListener('pointerup', stopDragging, { passive: true });
  track.addEventListener('pointercancel', stopDragging, { passive: true });
  mobileQuery.addEventListener('change', () => syncMode(true));
  window.addEventListener('resize', () => refreshCarousel(false), { passive: true });

  window.__phMobileProductCarouselRefresh = refreshCarousel;
  syncMode(false);
});
