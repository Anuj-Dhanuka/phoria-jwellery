/*
  Banner + product grid collection page (sections/ph-banner-grid.liquid).
  Needs swiper-bundle.min.js, loaded with defer in layout/theme.liquid (runs before this file).

  Each section gets a small context object ({ root, cards, ... }) so the product list can be
  swapped in place after sorting and everything that depends on it re-initialised.
*/
(function () {
  'use strict';

  var VIEW_STORAGE_KEY = 'ph-banner-grid-view';
  var MOBILE_QUERY = window.matchMedia('(max-width: 959px)');
  var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

  var SWIPER_OPTIONS = {
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 460,
    threshold: 2,
    resistanceRatio: 0.45,
    longSwipesRatio: 0.22,
    longSwipesMs: 180,
    touchStartPreventDefault: false,
    touchMoveStopPropagation: true,
    preventClicks: true,
    preventClicksPropagation: true,
    nested: true
  };

  // Moves the progress line to the current slide. Uses the real slide index because
  // in loop mode Swiper reorders slides, so scroll progress no longer maps to position.
  function updateProgress(target, swiper) {
    var count = Math.max(swiper.slides.length, 1);
    var width = swiper.el.clientWidth || 1;
    var lineWidth = width / count;
    var index = Math.min(Math.max(swiper.realIndex || 0, 0), count - 1);
    target.style.setProperty('--ph-bg-progress-width', lineWidth + 'px');
    target.style.setProperty('--ph-bg-progress-x', lineWidth * index + 'px');
  }

  // Carousels wrap around: past the last image comes the first again (and back).
  // 3+ slides use a true loop; with only 2, Swiper's loop can jump, so rewind instead.
  function wrapOptions(swiperEl) {
    var count = swiperEl.querySelectorAll('.swiper-slide').length;
    if (count >= 3) return { loop: true };
    if (count === 2) return { rewind: true };
    return {};
  }

  function createSwiper(swiperEl, target, extraOptions) {
    var options = Object.assign({}, SWIPER_OPTIONS, wrapOptions(swiperEl), extraOptions || {}, {
      on: {
        afterInit: function (swiper) {
          updateProgress(target, swiper);
        },
        realIndexChange: function (swiper) {
          updateProgress(target, swiper);
        },
        resize: function (swiper) {
          updateProgress(target, swiper);
        },
        touchStart: function () {
          target.classList.add('is-dragging');
        },
        touchEnd: function () {
          target.classList.remove('is-dragging');
        }
      }
    });
    return new window.Swiper(swiperEl, options);
  }

  function initBanner(ctx) {
    var banner = ctx.root.querySelector('[data-ph-bg-banner]');
    var swiperEl = ctx.root.querySelector('[data-ph-bg-banner-swiper]');
    if (!banner || !swiperEl || typeof window.Swiper === 'undefined') return;
    if (swiperEl.querySelectorAll('.swiper-slide').length < 2) return;

    var swiper = createSwiper(swiperEl, banner, { nested: false });
    var prev = banner.querySelector('[data-ph-bg-banner-prev]');
    var next = banner.querySelector('[data-ph-bg-banner-next]');
    if (prev) prev.addEventListener('click', function () { swiper.slidePrev(); });
    if (next) next.addEventListener('click', function () { swiper.slideNext(); });
  }

  // Card photos swipe on mobile only; desktop shows thumbnails side by side (CSS).
  function syncCardSwipers(ctx) {
    ctx.cards.forEach(function (item) {
      if (MOBILE_QUERY.matches && !item.swiper) {
        item.swiper = createSwiper(item.el, item.card);
      } else if (!MOBILE_QUERY.matches && item.swiper) {
        item.swiper.destroy(true, true);
        item.swiper = null;
      }
    });
  }

  function initCards(ctx) {
    ctx.cards.forEach(function (item) {
      if (item.swiper) item.swiper.destroy(true, true);
    });
    ctx.cards = [];
    if (typeof window.Swiper === 'undefined') return;

    ctx.root.querySelectorAll('[data-ph-bg-card]').forEach(function (card) {
      var swiperEl = card.querySelector('[data-ph-bg-card-swiper]');
      if (!swiperEl || swiperEl.querySelectorAll('.swiper-slide').length < 2) return;
      ctx.cards.push({ card: card, el: swiperEl, swiper: null });
    });
    syncCardSwipers(ctx);
  }

  // Desktop thumbnail videos load nothing up front and only play while on screen.
  function initThumbVideos(ctx) {
    if (ctx.videoObserver) ctx.videoObserver.disconnect();
    ctx.videoObserver = null;

    var videos = ctx.root.querySelectorAll('.ph-bg-card__video');
    if (!videos.length || !('IntersectionObserver' in window) || REDUCED_MOTION.matches) return;

    ctx.videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting && !MOBILE_QUERY.matches) {
          var playing = video.play();
          if (playing && playing.catch) playing.catch(function () {});
        } else {
          video.pause();
        }
      });
    }, { rootMargin: '200px 0px' });

    videos.forEach(function (video) {
      video.muted = true;
      ctx.videoObserver.observe(video);
    });
  }

  // Everything that depends on the product list; re-run after the list is swapped.
  function initProducts(ctx) {
    initCards(ctx);
    initThumbVideos(ctx);
  }

  function initViewToggle(ctx) {
    var root = ctx.root;
    var buttons = root.querySelectorAll('[data-ph-bg-view]');
    if (!buttons.length) return;

    var setView = function (view) {
      root.setAttribute('data-view', view);
      buttons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-ph-bg-view') === view));
      });
      ctx.cards.forEach(function (item) {
        if (!item.swiper) return;
        item.swiper.update();
        updateProgress(item.card, item.swiper);
      });
    };

    var saved = null;
    try {
      saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    } catch (error) {
      saved = null;
    }
    // Only restore a saved view if its button is on the page (single view can be switched off).
    if (saved && root.querySelector('[data-ph-bg-view="' + saved + '"]')) setView(saved);

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var view = button.getAttribute('data-ph-bg-view');
        setView(view);
        try {
          window.localStorage.setItem(VIEW_STORAGE_KEY, view);
        } catch (error) {
          // Storage unavailable (private mode); the view still changes.
        }
      });
    });
  }

  // Shared filter/sort panel: full screen on mobile, a drawer with a backdrop on desktop.
  // Handles open/close (with the drawer's slide), Escape, backdrop click, focus trap, scroll lock.
  function createPanel(panel, openButton, onOpen) {
    var root = panel.closest('[data-ph-banner-grid]');
    var backdrop = root ? root.querySelector('[data-ph-bg-backdrop]') : null;
    var closeTimer = null;

    var focusables = function () {
      return Array.prototype.slice.call(panel.querySelectorAll('button, a[href]')).filter(function (el) {
        return !el.disabled && el.offsetParent !== null;
      });
    };

    var onKeydown = function (event) {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      var list = focusables();
      if (!list.length) return;
      var first = list[0];
      var last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    var open = function () {
      if (onOpen) onOpen();
      window.clearTimeout(closeTimer);
      panel.hidden = false;
      if (backdrop) backdrop.hidden = false;
      // Force a layout so the drawer's slide-in transition runs from its closed position.
      void panel.offsetWidth;
      panel.classList.add('is-open');
      if (backdrop) backdrop.classList.add('is-open');
      document.body.classList.add('ph-bg-filter-open');
      openButton.setAttribute('aria-expanded', 'true');
      document.addEventListener('keydown', onKeydown);
      // Focus the close control that is visible (top CLOSE on mobile, ✕ beside the title on desktop).
      var closeButton = Array.prototype.slice.call(panel.querySelectorAll('[data-ph-bg-panel-close]')).filter(function (el) {
        return el.offsetParent !== null;
      })[0];
      if (closeButton) closeButton.focus();
    };

    var close = function () {
      panel.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-open');
      // Hide once the slide-out has finished (immediately on mobile / reduced motion).
      var duration = parseFloat(window.getComputedStyle(panel).transitionDuration) || 0;
      var finish = function () {
        panel.hidden = true;
        if (backdrop) backdrop.hidden = true;
      };
      window.clearTimeout(closeTimer);
      if (duration > 0) {
        closeTimer = window.setTimeout(finish, duration * 1000);
      } else {
        finish();
      }
      document.body.classList.remove('ph-bg-filter-open');
      openButton.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKeydown);
      openButton.focus();
    };

    openButton.addEventListener('click', open);
    panel.querySelectorAll('[data-ph-bg-panel-close]').forEach(function (button) {
      button.addEventListener('click', close);
    });
    if (backdrop) {
      backdrop.addEventListener('click', function () {
        if (panel.classList.contains('is-open')) close();
      });
    }

    return { open: open, close: close };
  }

  function scrollToToolbar(root) {
    var toolbar = root.querySelector('.ph-bg-toolbar');
    if (!toolbar) return;
    if (toolbar.getBoundingClientRect().top < 0) toolbar.scrollIntoView({ block: 'start' });
  }

  // Filter panel: options are toggled in the panel and only applied on "FILTER".
  // Within a group any option may match; across groups every group must match.
  var FILTER_GROUPS = ['style', 'finish', 'size', 'stone'];

  function emptyFilterState() {
    var state = {};
    FILTER_GROUPS.forEach(function (group) {
      state[group] = [];
    });
    return state;
  }

  function initFilter(ctx) {
    var root = ctx.root;
    var panel = root.querySelector('[data-ph-bg-filter]');
    var openButton = root.querySelector('[data-ph-bg-filter-open]');
    if (!panel || !openButton) return;

    var options = Array.prototype.slice.call(panel.querySelectorAll('[data-ph-bg-filter-option]'));
    var countEl = root.querySelector('[data-ph-bg-filter-count]');
    var applied = emptyFilterState();

    var findOption = function (group, value) {
      for (var i = 0; i < options.length; i++) {
        if (options[i].dataset.group === group && options[i].dataset.value === value) return options[i];
      }
      return null;
    };

    var itemMatches = function (item, group, value) {
      if (group === 'style') return item.dataset.style === value;
      if (group === 'size') return (' ' + item.dataset.sizes + ' ').indexOf(' ' + value + ' ') !== -1;
      var option = findOption(group, value);
      if (!option) return false;
      var haystack = item.dataset.match || '';
      return option.dataset.match.split(',').some(function (word) {
        word = word.trim();
        return word !== '' && haystack.indexOf(word) !== -1;
      });
    };

    var activeCount = function (state) {
      return FILTER_GROUPS.reduce(function (total, group) {
        return total + state[group].length;
      }, 0);
    };

    var writeUrl = function (state) {
      var url = new URL(window.location.href);
      FILTER_GROUPS.forEach(function (group) {
        if (state[group].length) {
          url.searchParams.set(group, state[group].join(','));
        } else {
          url.searchParams.delete(group);
        }
      });
      window.history.replaceState(window.history.state, '', url.toString());
    };

    var readUrl = function () {
      var state = emptyFilterState();
      var params = new URLSearchParams(window.location.search);
      FILTER_GROUPS.forEach(function (group) {
        (params.get(group) || '').split(',').forEach(function (value) {
          if (value && findOption(group, value)) state[group].push(value);
        });
      });
      return state;
    };

    var matchesState = function (item, state) {
      return FILTER_GROUPS.every(function (group) {
        return !state[group].length || state[group].some(function (value) {
          return itemMatches(item, group, value);
        });
      });
    };

    // Products are looked up each time because sorting swaps the list.
    var countMatches = function (state) {
      var total = 0;
      root.querySelectorAll('[data-ph-bg-item]').forEach(function (item) {
        if (matchesState(item, state)) total += 1;
      });
      return total;
    };

    var applyState = function (state) {
      applied = state;
      var visible = 0;
      root.querySelectorAll('[data-ph-bg-item]').forEach(function (item) {
        var show = matchesState(item, state);
        item.hidden = !show;
        if (show) visible += 1;
      });

      var count = activeCount(state);
      // Lifestyle images are placed by product position, so hide them while filtering.
      root.querySelectorAll('.ph-bg-grid__feature').forEach(function (feature) {
        feature.hidden = count > 0;
      });
      var noResults = root.querySelector('[data-ph-bg-no-results]');
      if (noResults) noResults.hidden = visible > 0;
      if (countEl) countEl.textContent = count ? ' (' + count + ')' : '';
      writeUrl(state);
    };

    var readPanel = function () {
      var state = emptyFilterState();
      options.forEach(function (option) {
        if (option.getAttribute('aria-pressed') === 'true') state[option.dataset.group].push(option.dataset.value);
      });
      return state;
    };

    var syncPanel = function (state) {
      options.forEach(function (option) {
        var pressed = state[option.dataset.group].indexOf(option.dataset.value) !== -1;
        option.setAttribute('aria-pressed', String(pressed));
      });
    };

    var clearButton = panel.querySelector('[data-ph-bg-filter-clear]');
    var applyButton = panel.querySelector('[data-ph-bg-filter-apply]');
    var applyLabel = panel.querySelector('[data-ph-bg-filter-apply-label]');

    // Live preview: the button shows how many products the current selection matches,
    // and is disabled when nothing matches so the visitor never lands on an empty page.
    var updateFooter = function () {
      var state = readPanel();
      var selected = activeCount(state);
      var matches = countMatches(state);
      if (clearButton) clearButton.disabled = selected === 0;
      if (!applyButton || !applyLabel) return;
      applyButton.disabled = selected > 0 && matches === 0;
      if (selected === 0) {
        applyLabel.textContent = 'FILTER';
      } else if (matches === 0) {
        applyLabel.textContent = 'NO MATCHING PRODUCTS';
      } else {
        applyLabel.textContent = 'FILTER \u00b7 ' + matches + (matches === 1 ? ' PRODUCT' : ' PRODUCTS');
      }
    };

    var panelControls = createPanel(panel, openButton, function () {
      syncPanel(applied);
      updateFooter();
    });

    options.forEach(function (option) {
      option.addEventListener('click', function () {
        var pressed = option.getAttribute('aria-pressed') === 'true';
        option.setAttribute('aria-pressed', String(!pressed));
        updateFooter();
      });
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        syncPanel(emptyFilterState());
        updateFooter();
        // Keep keyboard focus inside the panel once CLEAR becomes disabled.
        var first = panel.querySelector('[data-ph-bg-filter-option]');
        if (first) first.focus();
      });
    }

    if (applyButton) {
      applyButton.addEventListener('click', function () {
        applyState(readPanel());
        panelControls.close();
        scrollToToolbar(root);
      });
    }

    // Delegated: the "Clear filters" button is replaced when sorting swaps the list.
    root.addEventListener('click', function (event) {
      if (event.target.closest('[data-ph-bg-filter-reset]')) applyState(emptyFilterState());
    });

    ctx.reapplyFilter = function () {
      applyState(applied);
    };

    var initial = readUrl();
    if (activeCount(initial)) applyState(initial);
  }

  // Sort panel: picking an option closes the panel at once, shows a loading line and swaps in
  // the sorted products from Shopify (Section Rendering API) without reloading the page.
  // Picking the active option again returns to the collection's own order.
  var SORT_LABELS = {
    'price-ascending': 'Sorted by price, low to high',
    'price-descending': 'Sorted by price, high to low'
  };

  function initSort(ctx) {
    var root = ctx.root;
    var panel = root.querySelector('[data-ph-bg-sort]');
    var openButton = root.querySelector('[data-ph-bg-sort-open]');
    if (!panel || !openButton) return;

    var links = Array.prototype.slice.call(panel.querySelectorAll('[data-ph-bg-sort-option]'));
    var cache = {};
    var requestId = 0;

    var currentSort = function () {
      return new URLSearchParams(window.location.search).get('sort_by') || '';
    };

    var targetUrl = function (value) {
      var url = new URL(window.location.href);
      if (value) {
        url.searchParams.set('sort_by', value);
      } else {
        url.searchParams.delete('sort_by');
      }
      url.searchParams.delete('page');
      return url;
    };

    var fetchResults = function (url) {
      var sectionUrl = new URL(url.toString());
      sectionUrl.searchParams.set('section_id', root.dataset.sectionId);
      var key = sectionUrl.toString();
      if (!cache[key]) {
        cache[key] = fetch(key, { credentials: 'same-origin' }).then(function (response) {
          if (!response.ok) throw new Error('Sort request failed: ' + response.status);
          return response.text();
        });
        cache[key].catch(function () {
          delete cache[key];
        });
      }
      return cache[key];
    };

    // Toggle target for each option: its own sort, or back to default if already active.
    var valueFor = function (link) {
      var value = link.getAttribute('data-ph-bg-sort-option');
      return currentSort() === value ? '' : value;
    };

    var syncLinks = function () {
      var active = currentSort();
      links.forEach(function (link) {
        var value = link.getAttribute('data-ph-bg-sort-option');
        if (value === active) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
        link.href = targetUrl(valueFor(link)).toString();
      });
    };

    // Warm the cache while the panel is open so the swap is near-instant.
    var panelControls = createPanel(panel, openButton, function () {
      syncLinks();
      links.forEach(function (link) {
        fetchResults(targetUrl(valueFor(link)));
      });
    });

    var applySort = function (value) {
      var url = targetUrl(value);
      var results = root.querySelector('[data-ph-bg-results]');
      var status = root.querySelector('[data-ph-bg-status]');
      var thisRequest = ++requestId;

      panelControls.close();
      if (!results) {
        window.location.assign(url.toString());
        return;
      }
      results.classList.add('is-loading');
      results.setAttribute('aria-busy', 'true');
      scrollToToolbar(root);

      fetchResults(url)
        .then(function (html) {
          if (thisRequest !== requestId) return;
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var fresh = doc.querySelector('[data-ph-bg-results]');
          if (!fresh) throw new Error('Sorted products not found in response');

          results.innerHTML = fresh.innerHTML;
          results.classList.remove('is-loading');
          results.removeAttribute('aria-busy');
          window.history.replaceState(window.history.state, '', url.toString());
          syncLinks();
          initProducts(ctx);
          if (ctx.reapplyFilter) ctx.reapplyFilter();
          if (status) status.textContent = SORT_LABELS[value] || 'Sorted by featured order';
        })
        .catch(function () {
          // Fall back to a normal page load if the in-place update fails.
          window.location.assign(url.toString());
        });
    };

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        applySort(valueFor(link));
      });
    });
  }

  function initReadMore(ctx) {
    var description = ctx.root.querySelector('[data-ph-bg-description]');
    var button = ctx.root.querySelector('[data-ph-bg-more]');
    if (!description || !button) return;

    // Only offer "Read more" when the text is actually cut off.
    if (description.scrollHeight <= description.clientHeight + 1) return;
    button.hidden = false;

    button.addEventListener('click', function () {
      var expanded = description.classList.toggle('is-expanded');
      button.setAttribute('aria-expanded', String(expanded));
      button.textContent = expanded ? 'READ LESS' : 'READ MORE';
    });
  }

  function init(root) {
    if (root.dataset.phBgReady === 'true') return;
    root.dataset.phBgReady = 'true';

    var ctx = { root: root, cards: [], videoObserver: null, reapplyFilter: null };

    initReadMore(ctx);
    initBanner(ctx);
    initProducts(ctx);
    initViewToggle(ctx);
    initFilter(ctx);
    initSort(ctx);

    MOBILE_QUERY.addEventListener('change', function () {
      syncCardSwipers(ctx);
    });
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('[data-ph-banner-grid]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initAll();
    });
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
