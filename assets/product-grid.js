(function () {
  const calcMinHeight = () => {
    const facetsTop = document.querySelector('.facets__top');
    const sortWrapper = document.querySelector('.facets__sort-wrapper');
    const collectionWrapper = document.querySelector('.collection-wrapper');

    if (facetsTop && sortWrapper && collectionWrapper) {
      collectionWrapper.style.gridTemplateRows =  sortWrapper.getBoundingClientRect().height+'px auto 1fr';
    }
  }

  const resizeCollectionGrid = () => {
		const collectionGridSection = document.querySelector('.collection-grid-section') || document.querySelector('.section-search');

		const sectionResizeObserver = new ResizeObserver((entries) => {

			const [entry] = entries;
      calcMinHeight();
		});

		sectionResizeObserver.observe(collectionGridSection);
	}

  document.addEventListener('shopify:section:load', function () {
		resizeCollectionGrid();
	});

	resizeCollectionGrid();

    
})();