(function () {
  function fitStickySummaryCopy() {
    const stickyBar = document.getElementById('phStickyBar');
    if (!stickyBar) return;

    const title = stickyBar.querySelector('.ph-sticky-pdp-product-title');
    const price = stickyBar.querySelector('.ph-sticky-summary-price');
    const subtitle = stickyBar.querySelector('.ph-sticky-pdp-product-subtitle');
    if (!title || !price) return;

    const setStyleValue = (node, property, value) => {
      if (node.style[property] !== value) {
        node.style[property] = value;
      }
    };

    const ensureTitleInner = () => {
      const existing = title.querySelector(':scope > .ph-sticky-pdp-product-title__inner');
      if (existing && title.childNodes.length === 1) return existing;

      const text = (title.textContent || '').trim();
      title.textContent = '';
      const inner = document.createElement('span');
      inner.className = 'ph-sticky-pdp-product-title__inner';
      inner.textContent = text;
      title.appendChild(inner);
      return inner;
    };

    const resetTitleMarquee = () => {
      title.classList.remove('is-marquee');
      title.style.removeProperty('--ph-sticky-title-marquee-distance');
      title.style.removeProperty('--ph-sticky-title-marquee-duration');
    };

    const updateTitleMarquee = () => {
      const inner = ensureTitleInner();
      resetTitleMarquee();

      window.requestAnimationFrame(() => {
        const overflow = inner.scrollWidth - title.clientWidth;
        if (overflow <= 1) return;

        const distance = overflow + 24;
        const duration = Math.min(18, Math.max(9, distance / 10));
        title.style.setProperty('--ph-sticky-title-marquee-distance', `${distance}px`);
        title.style.setProperty('--ph-sticky-title-marquee-duration', `${duration}s`);
        title.classList.add('is-marquee');
      });
    };

    if (window.innerWidth >= 768) {
      resetTitleMarquee();
      setStyleValue(title, 'fontSize', '');
      setStyleValue(title, 'letterSpacing', '');
      setStyleValue(price, 'fontSize', '');
      setStyleValue(price, 'letterSpacing', '');
      if (subtitle) {
        setStyleValue(subtitle, 'fontSize', '');
        setStyleValue(subtitle, 'letterSpacing', '');
      }
      return;
    }

    const width = Math.min(window.innerWidth || 375, document.documentElement.clientWidth || 375);
    let size = Math.min(12, Math.max(11, width * 0.032));
    let spacing = Math.min(1, Math.max(0.65, width * 0.0028));
    const minSize = 9.5;
    const minSpacing = 0.2;

    const applyType = () => {
      setStyleValue(title, 'fontSize', `${size}px`);
      setStyleValue(title, 'letterSpacing', `${spacing}px`);
      setStyleValue(price, 'fontSize', `${size}px`);
      setStyleValue(price, 'letterSpacing', `${spacing}px`);
    };

    ensureTitleInner();
    resetTitleMarquee();
    applyType();

    for (let guard = 0; title.scrollWidth > title.clientWidth && guard < 36; guard += 1) {
      if (spacing > minSpacing) {
        spacing = Math.max(minSpacing, spacing - 0.1);
      } else if (size > minSize) {
        size = Math.max(minSize, size - 0.25);
      } else {
        break;
      }
      applyType();
    }

    updateTitleMarquee();

    if (!subtitle) return;

    let subtitleSize = Math.min(8, Math.max(8, width * 0.024));
    let subtitleSpacing = Math.min(2, Math.max(1.35, width * 0.005));
    const minSubtitleSize = 7;
    const minSubtitleSpacing = 0.2;
    const applySubtitleType = () => {
      setStyleValue(subtitle, 'fontSize', `${subtitleSize}px`);
      setStyleValue(subtitle, 'letterSpacing', `${subtitleSpacing}px`);
    };

    applySubtitleType();

    for (let guard = 0; subtitle.scrollWidth > subtitle.clientWidth && guard < 56; guard += 1) {
      if (subtitleSpacing > minSubtitleSpacing) {
        subtitleSpacing = Math.max(minSubtitleSpacing, subtitleSpacing - 0.15);
      } else if (subtitleSize > minSubtitleSize) {
        subtitleSize = Math.max(minSubtitleSize, subtitleSize - 0.25);
      } else {
        break;
      }
      applySubtitleType();
    }
  }

  function bindStickyFit() {
    fitStickySummaryCopy();
    window.addEventListener('resize', fitStickySummaryCopy);

    const stickyBar = document.getElementById('phStickyBar');
    if (stickyBar) {
      new MutationObserver(fitStickySummaryCopy).observe(stickyBar, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(fitStickySummaryCopy).catch(() => {});
    }
  }

  window.phPdpFitStickySummaryCopy = fitStickySummaryCopy;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindStickyFit, { once: true });
  } else {
    bindStickyFit();
  }
}());
