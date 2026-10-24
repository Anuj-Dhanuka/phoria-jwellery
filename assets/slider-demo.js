(function () {
	let swiperInstance = null;

	function initSwiper() {
		if (window.innerWidth > 1200 && !swiperInstance) {
			const wrapper = document.querySelector(".slider-demo-wrapper");
			wrapper.classList.add("swiper-wrapper");

			const elements = document.querySelectorAll(
				".slider-demo > .swiper-wrapper > *"
			);

			elements.forEach((element) => {
				element.classList.add("swiper-slide");
			});

			swiperInstance = new Swiper(".slider-demo", {
				direction: "vertical",
				speed: 400,
				effect: "creative",
				creativeEffect: {
					prev: {
						translate: [0, "-20%", -1],
					},
					next: {
						translate: [0, "100%", 0],
					},
				},
				mousewheel: {
					forceToAxis: true,
					releaseOnEdges: false,
					sensitivity: 1,
					thresholdDelta: 20,
					thresholdTime: 200,
				},
				touchReleaseOnEdges: false,
				touchRatio: 0.2,
				longSwipes: true,
				freeMode: false,
				on: {
					slideChangeTransitionStart: changeNavStyle,
				},
			});

			changeNavStyle();

			function changeNavStyle() {
				const stickyNav = document.querySelector(".shopify-section-header");
				const activeSlide = document.querySelector(
					".swiper-slide-active > .background"
				);
				let backgroundColor;
				let isLightBackground;

				if (activeSlide) {
					backgroundColor =
						window.getComputedStyle(activeSlide).backgroundColor;
					isLightBackground = isLightColor(backgroundColor);
				}

				if (isLightBackground) {
					stickyNav.classList.add("color-background-1");
					stickyNav.classList.remove("color-background-2");
				} else {
					stickyNav.classList.add("color-background-2");
				}
			}

			function isLightColor(color) {
				const rgb = color.match(/\d+/g).map(Number);
				const luminance = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
				return luminance > 186;
			}
		} else if (window.innerWidth <= 1200) {
			swiperInstance && swiperInstance.destroy(true, true);
			swiperInstance = null; // Clear the instance after destroying
			const wrapper = document.querySelector(".slider-demo-wrapper");
			wrapper.classList.remove("swiper-wrapper");
		}
	}

	initSwiper();

	window.addEventListener("resize", function () {
		initSwiper();
	});
	document.addEventListener("shopify:section:load", function () {
		initSwiper();
	});
})();
