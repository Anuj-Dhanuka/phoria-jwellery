(function () {
	const initSlider = () => {
		const sliders = document.querySelectorAll(".product-card-js");

		sliders.forEach((slider, index) => {
			const productSlider = new Swiper(slider, {
				pagination: {
					el: ".product-pagination .swiper-pagination",
					clickable: true,
				},
				navigation: {
					nextEl: ".product-button-group .swiper-button-next",
					prevEl: ".product-button-group .swiper-button-prev",
				},
				allowTouchMove: true,
				990: {
					allowTouchMove: false,
				},
			});
		});
	};

	initSlider();

	document.addEventListener("shopify:section:load", function () {
		initSlider();
	});
})();
