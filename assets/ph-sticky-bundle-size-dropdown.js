(function () {
  var MOBILE_QUERY = '(max-width: 767px)';
  var STACK_SIZE_LABELS = {
    'UK L': 'UK L/K',
    'UK O': 'UK O/M',
    'UK Q': 'UK Q/P',
    'UK S': 'UK S/R'
  };

  function isMobile() {
    return window.matchMedia && window.matchMedia(MOBILE_QUERY).matches;
  }

  function getProductHandle() {
    var match = window.location.pathname.match(/\/products\/([^/?#]+)/);
    return match ? match[1] : '';
  }

  function normalizeText(value) {
    return String(value || '').trim().toUpperCase();
  }

  function getCurrentVariantId() {
    var params = new URLSearchParams(window.location.search);
    var fromUrl = params.get('variant');
    if (fromUrl) return String(fromUrl);
    var idInput = document.querySelector('form[action*="/cart/add"] input[name="id"]');
    return idInput ? String(idInput.value) : '';
  }

  function getStickyBar() {
    return document.getElementById('phStickyBar');
  }

  function getStickyButton(stickyBar) {
    return stickyBar && stickyBar.querySelector('#phStickyAddToCart, .ph-sticky-add-btn');
  }

  function getVariantLabel(variant, useStackPairs) {
    var value = normalizeText(variant.option1 || variant.title);
    return useStackPairs && STACK_SIZE_LABELS[value] ? STACK_SIZE_LABELS[value] : value;
  }

  function getDisplayVariants(product) {
    var variants = Array.isArray(product.variants) ? product.variants : [];
    var available = variants.filter(function (variant) {
      return variant && variant.available !== false && normalizeText(variant.option1 || variant.title);
    });
    var useStackPairs = Boolean(product.handle && product.handle.indexOf('ring-stack') !== -1);

    if (!useStackPairs) return available;

    return available.filter(function (variant) {
      return Boolean(STACK_SIZE_LABELS[normalizeText(variant.option1 || variant.title)]);
    });
  }

  function setVariantId(variantId) {
    document.querySelectorAll('form[action*="/cart/add"] input[name="id"]').forEach(function (input) {
      input.value = String(variantId);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function updateUrlVariant(variantId) {
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', String(variantId));
      window.history.replaceState(window.history.state || {}, '', url.toString());
    } catch (error) {}
  }

  function buildStickySelect(product) {
    if (!isMobile()) return;

    var stickyBar = getStickyBar();
    if (!stickyBar || stickyBar.querySelector('#phStickySizeSelect')) return;

    var button = getStickyButton(stickyBar);
    if (!button) return;

    var variants = getDisplayVariants(product);
    if (variants.length < 2) return;

    var useStackPairs = Boolean(product.handle && product.handle.indexOf('ring-stack') !== -1);
    var currentVariantId = getCurrentVariantId();
    var selectedVariant = variants.find(function (variant) {
      return String(variant.id) === currentVariantId;
    }) || variants[0];

    setVariantId(selectedVariant.id);

    var contentWrapper = stickyBar.querySelector('.ph-sticky-bar-content-wrapper');
    if (contentWrapper) {
      contentWrapper.classList.remove('ph-sticky-bar-content-wrapper--price-only');
      contentWrapper.querySelectorAll('.ph-sticky-price--mobile-no-dropdown').forEach(function (price) {
        price.setAttribute('hidden', 'hidden');
      });
    }

    var wrap = document.createElement('span');
    wrap.className = 'ph-sticky-select-wrap ph-sticky-select-wrap--bundle-mobile';

    var select = document.createElement('select');
    select.id = 'phStickySizeSelect';
    select.name = 'stickysize';
    select.className = 'ph-sticky-size-select';
    select.setAttribute('aria-label', 'Select size');

    variants.forEach(function (variant) {
      var option = document.createElement('option');
      option.value = String(variant.id);
      option.textContent = getVariantLabel(variant, useStackPairs);
      option.dataset.optionValue = variant.option1 || variant.title || '';
      if (String(variant.id) === String(selectedVariant.id)) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener('change', function () {
      setVariantId(select.value);
      updateUrlVariant(select.value);
      select.dispatchEvent(new CustomEvent('ph:sticky-size-changed', {
        bubbles: true,
        detail: { variantId: select.value }
      }));
    });

    wrap.appendChild(select);
    button.parentElement.insertAdjacentElement('beforebegin', wrap);
  }

  function init() {
    var handle = getProductHandle();
    if (!handle || !getStickyBar()) return;

    fetch('/products/' + handle + '.js')
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (product) {
        if (!product) return;
        var hasSizeOption = (product.options || []).some(function (option) {
          return normalizeText(option.name) === 'SIZE';
        });
        if (hasSizeOption) buildStickySelect(product);
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
