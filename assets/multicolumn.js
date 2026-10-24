(function () {
	const multicolumnSlider = () => {
		const multicolumnSliders = Array.from(
			document.querySelectorAll(".multicolumn-slider")
		);
		if (multicolumnSliders.length === 0) return;
		multicolumnSliders.forEach((slider) => {
			const sectionId = slider.dataset.id;
			const perRow = slider.dataset.perRow;
			const mobileR = slider.dataset.mobile;
			const speed = slider.dataset.speed * 1000;
			const autoplay = toBoolean(slider.dataset.autoplay);
			const enablenNavigation = toBoolean(slider.dataset.navigation);
			const stopAutoplaySlider = toBoolean(slider.dataset.stopAutoplay);
			let autoplayParm = {};

			if (autoplay) {
				autoplayParm = {
					autoplay: {
						delay: 0,
						disableOnInteraction: false,
					},
				};
			}

			const multicolumnSwiper = new Swiper(`#${sectionId} .swiper`, {
				loop: true,
				longSwipesRatio: 0.1,
				slidesPerView: mobileR,
				allowTouchMove: true,
				speed: speed,
				breakpoints: {
					//576: {
					//  slidesPerView: 2,
					//},
					1200: {
						slidesPerView: +perRow + 0.4,
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

					multicolumnSwiper.setTranslate(multicolumnSwiper.getTranslate());

					const currentSlideWidth =
						multicolumnSwiper.slides[multicolumnSwiper.activeIndex].offsetWidth;
					distanceRatio = Math.abs(
						(currentSlideWidth * multicolumnSwiper.activeIndex +
							multicolumnSwiper.getTranslate()) /
							currentSlideWidth
					);

					duration = multicolumnSwiper.params.speed * distanceRatio;
					multicolumnSwiper.autoplay.stop();
				};

				const startAutoplay = (delay = duration) => {
					startTimer = setTimeout(() => {
						multicolumnSwiper.autoplay.start();
					}, delay);
				};

				slider.addEventListener("mouseenter", function () {
					stopAutoplay();
				});

				slider.addEventListener("mouseleave", function () {
					const distance =
						multicolumnSwiper.width * multicolumnSwiper.activeIndex +
						multicolumnSwiper.getTranslate();

					duration = distance !== 0 ? duration : 0;
					multicolumnSwiper.slideTo(multicolumnSwiper.activeIndex, duration);
					startAutoplay();
				});

				if (enablenNavigation) {
					const handleSwitch = (setIndex) => {
						stopAutoplay();
						const switchSpeed = 1000;
						const index = setIndex();
						if (index === 999) {
							multicolumnSwiper.slideNext(switchSpeed);
						} else if (index === -999) {
							multicolumnSwiper.slidePrev(switchSpeed);
						} else {
							multicolumnSwiper.slideTo(index, switchSpeed);
						}
					};

					document.querySelector(`#${sectionId} .multicolumn-button-next`).addEventListener(
						"click",
						function () {
							handleSwitch(function () {
								let nextIndex = multicolumnSwiper.activeIndex;
								const lastSwiperIndex = multicolumnSwiper.slides.length - 1;

								nextIndex =
									nextIndex > lastSwiperIndex
										? lastSwiperIndex - nextIndex
										: nextIndex;

								return distanceRatio < 0.003 ? 999 : nextIndex;
							});
						},
						false
					);

					document.querySelector(`#${sectionId} .multicolumn-button-prev`).addEventListener(
						"click",
						function () {
							handleSwitch(function () {
								let prevIndex = multicolumnSwiper.activeIndex - 1;
								prevIndex =
									prevIndex < 0
										? multicolumnSwiper.slides.length + prevIndex
										: prevIndex;

								return distanceRatio === 0 ? -999 : prevIndex;
							});
						},
						false
					);

					const cursor = document.getElementById(`${sectionId}-cursor`);

					const animateCursor = (e) => {
						const x = e.clientX - cursor.offsetWidth / 2,
							y = e.clientY - cursor.offsetHeight / 2;

						const keyframes = {
							transform: `translate(${x}px, ${y}px) `,
						};

						cursor.animate(keyframes, {
							duration: 100,
							fill: "forwards",
						});
					};

					const getCursorClass = (type) => {
						switch (type) {
							case "next":
								return "cursor-icon next button button--simple";
							case "prev":
								return "cursor-icon prev button button--simple";
							default:
								return "cursor-icon button button--simple";
						}
					};

					document.querySelector(
						`#${sectionId} .multicolumn-cursor`
					).onmousemove = (e) => {
						const interactable = e.target.closest(".multicolumn__buttons"),
							interacting = interactable !== null;

						const icon = document.getElementById(`${sectionId}-cursor-icon`);

						if (e.target.closest(".multicolumn__buttons") != null) {
							animateCursor(e);
						}

						cursor.dataset.type = interacting ? interactable.dataset.type : "";

						if (interacting) {
							icon.className = getCursorClass(interactable.dataset.type);
						}
					};
				}
			}
		});
	};
	function toBoolean(string) {
		return string === "true" ? true : false;
	}
	document.addEventListener("DOMContentLoaded", function () {
		multicolumnSlider();
		document.addEventListener("shopify:section:load", function () {
			multicolumnSlider();
		});
	});
})();
