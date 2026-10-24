(function () {
	const blogSlider = () => {
		const blogSliders = Array.from(
			document.querySelectorAll(".blog-slider-slider")
		);
		if (blogSliders.length === 0) return;
		blogSliders.forEach((slider) => {
			const sectionId = slider.dataset.id;
			const slidesCount = parseInt(slider.dataset.slidesCount);
			const noSlider = slidesCount < 3;
			const mobileR = slider.dataset.mobile;
			const speed = slider.dataset.speed * 1000;
			const autoplay = noSlider ? false : toBoolean(slider.dataset.autoplay);
			const stopAutoplaySlider = toBoolean(slider.dataset.stopAutoplay);
			const perRow = noSlider ? slidesCount : parseInt(slider.dataset.perRow);

			let autoplayParm = {};

			if (autoplay) {
				autoplayParm = {
					autoplay: {
						delay: 0,
						disableOnInteraction: false,
					},
				};
			}

			const blogSwiper = new Swiper(`#${sectionId} .swiper`, {
				loop: true,
				longSwipesRatio: 0.1,
				slidesPerView: mobileR,
				allowTouchMove: true,
				speed: speed,
				breakpoints: {
					1200: {
						slidesPerView: perRow + (noSlider ? 0 : 0.4)
					},
				},
				...autoplayParm,
			});
			if (autoplay && stopAutoplaySlider) {
				let duration;
				let distanceRatio;
				let startTimer;
				const swiperWrapperEl = document.querySelector(
					`#${sectionId} .swiper-wrapper`
				);

				const stopAutoplay = () => {
					if (startTimer) clearTimeout(startTimer);

					blogSwiper.setTranslate(blogSwiper.getTranslate());

					const currentSlideWidth =
						blogSwiper.slides[blogSwiper.activeIndex].offsetWidth;
					distanceRatio = Math.abs(
						(currentSlideWidth * blogSwiper.activeIndex +
							blogSwiper.getTranslate()) /
							currentSlideWidth
					);

					duration = blogSwiper.params.speed * distanceRatio;
					blogSwiper.autoplay.stop();
				};

				const startAutoplay = (delay = duration) => {
					startTimer = setTimeout(() => {
						blogSwiper.autoplay.start();
					}, delay);
				};

				swiperWrapperEl.addEventListener("mouseenter", function () {
					stopAutoplay();
				});

				swiperWrapperEl.addEventListener("mouseleave", function () {
					const distance =
						blogSwiper.width * blogSwiper.activeIndex +
						blogSwiper.getTranslate();

					duration = distance !== 0 ? duration : 0;
					blogSwiper.slideTo(blogSwiper.activeIndex, duration);
					startAutoplay();
				});
			}
		});
	};
	
	function toBoolean(string) {
		return string === "true" ? true : false;
	}
	document.addEventListener("DOMContentLoaded", function () {
		blogSlider();
		document.addEventListener("shopify:section:load", function () {
			blogSlider();
		});
	});
})();
