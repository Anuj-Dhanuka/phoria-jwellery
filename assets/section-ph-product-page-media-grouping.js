document.addEventListener('DOMContentLoaded', function () {
  const hiddenUkSizeHandles = new Set([]);
  const gallery = document.querySelector('.ph-pdp-product-images');
  let mediaGroupingTags = [];

  try {
    mediaGroupingTags = JSON.parse(gallery?.dataset.mediaGroupingTags || '[]');
  } catch (_error) {
    mediaGroupingTags = [];
  }

  let enableVariantMediaGrouping = Array.isArray(mediaGroupingTags)
    && mediaGroupingTags.some((tag) => String(tag || '').trim().toLowerCase() === 'vimgord');
  const toHandle = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  function isHiddenUkSize(value) {
    return hiddenUkSizeHandles.has(toHandle(value));
  }

  document.querySelectorAll('.ph-pdp-size-box[data-option-value]').forEach((sizeBox) => {
    if (isHiddenUkSize(sizeBox.getAttribute('data-option-value'))) {
      sizeBox.remove();
    }
  });

  const stickySelect = document.getElementById('phStickySizeSelect');
  if (stickySelect) {
    Array.from(stickySelect.options).forEach((opt) => {
      if (isHiddenUkSize(opt.value)) {
        opt.remove();
      }
    });
  }

  document.querySelectorAll('.ph-pdp-size-boxes[data-option-index]').forEach((group) => {
    const optionIndex = group.getAttribute('data-option-index');
    const hiddenInput = document.getElementById(`Option${optionIndex}`);
    if (!hiddenInput) return;

    if (isHiddenUkSize(hiddenInput.value)) {
      const firstVisible = group.querySelector('.ph-pdp-size-box[data-option-value]');
      if (!firstVisible) return;

      const nextValue = firstVisible.getAttribute('data-option-value');
      hiddenInput.value = nextValue;
      group.querySelectorAll('.ph-pdp-size-box').forEach((box) => {
        box.classList.toggle('selected', box === firstVisible);
      });
      if (stickySelect) stickySelect.value = nextValue;
      if (typeof window.updateVariantSelection === 'function') {
        window.updateVariantSelection();
      }
    }
  });

  const mediaItems = Array.from(document.querySelectorAll('.ph-pdp-product-media-item'));
  if (!mediaItems.length) return;

  function normalizeGroupKey(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function getMediaAlt(item) {
    if (item.dataset.mediaAlt) return item.dataset.mediaAlt;
    const node = item.querySelector('img,video,iframe');
    return node ? (node.getAttribute('alt') || '') : '';
  }

  function getOrderFromAlt(alt) {
    if (!alt) return Number.MAX_SAFE_INTEGER;
    const match = alt.match(/order\s*:\s*(\d+)/i);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  }

  function getGroupsFromAlt(alt) {
    if (!alt) return [];
    const match = alt.match(/group\s*:\s*([^|]+)/i);
    if (!match) return [];

    return match[1]
      .split(',')
      .map((token) => normalizeGroupKey(token))
      .filter(Boolean);
  }

  function hasGroupedMediaMarkers() {
    return mediaItems.some((item) => getGroupsFromAlt(getMediaAlt(item)).length > 0);
  }

  if (!enableVariantMediaGrouping && hasGroupedMediaMarkers()) {
    enableVariantMediaGrouping = true;
  }
  if (!enableVariantMediaGrouping) return;

  function showGroup(groupKeyRaw) {
    const mediaList = document.querySelector('.ph-pdp-product-media-list');
    if (!mediaList) return;

    const groupKey = normalizeGroupKey(groupKeyRaw);
    const isDefaultGroup = !groupKey || groupKey === 'default';
    const itemMeta = mediaItems.map((item, index) => {
      const alt = getMediaAlt(item);
      const groups = getGroupsFromAlt(alt);
      const order = getOrderFromAlt(alt);

      if (!item.dataset.originalIndex) item.dataset.originalIndex = String(index);

      const originalIndex = Number(item.dataset.originalIndex || index);
      const isMatch = isDefaultGroup
        ? (groups.length === 0 || groups.includes('default'))
        : groups.includes(groupKey);

      item.style.display = isMatch ? '' : 'none';
      return { item, isMatch, order, originalIndex };
    });

    const shown = itemMeta.filter((entry) => entry.isMatch).length;
    if (!shown && !isDefaultGroup) {
      showGroup('default');
      return;
    }

    const hasExplicitOrder = itemMeta.some(
      (entry) => entry.isMatch && entry.order !== Number.MAX_SAFE_INTEGER
    );

    if (!hasExplicitOrder) {
      window.__phMobileProductCarouselRefresh?.(true);
      return;
    }

    const visibleItems = itemMeta
      .filter((entry) => entry.isMatch)
      .sort((a, b) => (a.order - b.order) || (a.originalIndex - b.originalIndex))
      .map((entry) => entry.item);
    const hiddenItems = itemMeta
      .filter((entry) => !entry.isMatch)
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .map((entry) => entry.item);

    [...visibleItems, ...hiddenItems].forEach((node) => mediaList.appendChild(node));
    window.__phMobileProductCarouselRefresh?.(true);
  }

  function getPrimarySelectedOption() {
    const letterInput = document.getElementById('LetterCharmSelection');
    const letterValue = letterInput ? String(letterInput.value || '').trim().toUpperCase() : '';
    if (letterValue && letterValue !== 'NO LETTER') return letterValue;

    const selectedSize = document.querySelector('.ph-pdp-size-box.selected');
    if (selectedSize) return selectedSize.getAttribute('data-option-value') || '';

    const sizeGroup = document.querySelector('.ph-pdp-size-boxes[data-option-index]');
    if (sizeGroup) {
      const sizeIndex = sizeGroup.getAttribute('data-option-index');
      const sizeInput = document.getElementById(`Option${sizeIndex}`);
      if (sizeInput && sizeInput.value) return sizeInput.value;
    }

    const option0 = document.getElementById('Option0');
    if (option0 && option0.value) return option0.value;

    const selected = document.querySelector(
      '.ph-pdp-variant-box.selected, .ph-pdp-size-box.selected, .ph-pdp-text-option.selected'
    );
    return selected ? selected.getAttribute('data-option-value') : '';
  }

  function applyCurrentGroup() {
    const selectedValue = getPrimarySelectedOption();
    showGroup(selectedValue || 'default');
  }

  applyCurrentGroup();

  document.querySelectorAll('.ph-pdp-variant-box, .ph-pdp-size-box, .ph-pdp-text-option').forEach((el) => {
    el.addEventListener('click', () => {
      requestAnimationFrame(applyCurrentGroup);
    });
  });

  document.querySelectorAll('input[id^="Option"]').forEach((input) => {
    input.addEventListener('change', applyCurrentGroup);
  });

  const letterCharmInput = document.getElementById('LetterCharmSelection');
  if (letterCharmInput) {
    letterCharmInput.addEventListener('change', applyCurrentGroup);
  }

  document.querySelectorAll('.ph-pdp-letter-charms-carousel [data-letter-charms-value], [data-letter-charms-value="NO LETTER"], [data-letter-charms-pick]').forEach((el) => {
    el.addEventListener('click', () => {
      requestAnimationFrame(applyCurrentGroup);
    });
  });

  const variantIdInput = document.querySelector('input[name="id"]');
  if (variantIdInput) {
    variantIdInput.addEventListener('change', applyCurrentGroup);
  }

  const stickySel = document.getElementById('phStickySizeSelect');
  if (stickySel) {
    stickySel.addEventListener('change', applyCurrentGroup);
  }

  const stickyLetterSel = document.getElementById('phStickyLetterCharmSelect');
  if (stickyLetterSel) {
    stickyLetterSel.addEventListener('change', applyCurrentGroup);
  }
});
