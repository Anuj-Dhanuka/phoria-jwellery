(function () {
	const productMarkers = (section) => {
		let parent = document.currentScript
			? document.currentScript.parentElement
			: section;

		let productsSelector = ".product-markers-for-mobile .product-markers__item-inner";
		let markersSelector = ".js-product-markers__item";

		var products = parent?.querySelectorAll(productsSelector);
		var markers = parent?.querySelectorAll(markersSelector);

		if (parent) {
			markers.forEach((item) => {
				item.addEventListener("click", (event) => {
					event.stopPropagation();
					const index = item.dataset.index;
					item.classList.toggle("active");

					let otherMarkers = [...markers].filter(marker => marker !== item);
					let product = parent?.querySelector(
						`${productsSelector}[data-index="${index}"]`
					);
					let otherProducts = parent?.querySelector(
						`${productsSelector}:not([data-index="${index}"])`
					);

					product.classList.toggle("active");
					otherProducts.classList.remove("active");
					otherMarkers.forEach(marker => marker.classList.remove("active"));

					parent
						.querySelector(".product-markers-for-mobile")
						.classList.add("active");
				});
			});

			parent.querySelector(markersSelector).click();
		}

		document.addEventListener("click", (e) => {
			const parentClicked = e.target.closest(markersSelector);
			markers?.forEach((marker) => {
				if (parentClicked !== marker && !e.target.closest(productsSelector)) {
					marker.classList.remove("active");
					products?.forEach(product => product.classList.remove("active"));
				}
			});
		});
	};

	productMarkers();

	document.addEventListener("DOMContentLoaded", function () {
		productMarkers();

		document.addEventListener("shopify:section:load", function (section) {
			productMarkers(section.target);
		});
	});
})();
