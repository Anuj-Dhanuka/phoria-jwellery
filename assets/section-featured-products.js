(function () {
	const multicolumnSlider = () => {
		const multicolumnSliders = document.querySelectorAll(
			".featured-products.swiper"
		);

		if (
			document.querySelectorAll(".featured-products:not(.swiper)").length > 0
		) {
			document
				.querySelectorAll(".featured-products:not(.swiper)")
				.forEach((item) => {
					if (item.querySelectorAll(".observe-me").length > 0) {
						function createObserver() {
							function handleIntersect(entries, observer) {
								entries.forEach((entry) => {
									if (entry.isIntersecting) {
										entry.target.classList.add("is-inview");
										observer.unobserve(entry.target); // Unobserve the element after the first intersection
									}
								});
							}

							let options = {
								root: null,
								rootMargin: "0px",
								threshold: 0.1,
							};

							let observer = new IntersectionObserver(handleIntersect, options);

							let targets = item.querySelectorAll(".observe-me");

							targets.forEach((target, index) => {
								observer.observe(target);
								target.style.setProperty("--delay", `${index / 4}s`);
							});
						}

						createObserver();
					}
				});
		}

		if (multicolumnSliders.length === 0) return;

		multicolumnSliders.forEach((slider) => {
			let slides_count = slider.dataset.slidesCount;
			const sectionId = slider.dataset.id;
			const perRow = slider.dataset.perRow;
			const speed = slider.dataset.speed * 1000;
			const autoplay = toBoolean(slider.dataset.autoplay);
			const stopAutoplaySlider = toBoolean(slider.dataset.stopAutoplay);
			const enablenNavigation = toBoolean(slider.dataset.navigation);
			let autoplayParm = {};

			if (autoplay) {
				autoplayParm = {
					autoplay: {
						delay: 0,
						disableOnInteraction: false,
					},
				};
			}

			if (slides_count > 3) {
				if (
					slider.querySelectorAll(".featured-products__image-wrapper").length >
					0
				) {
					slider
						.querySelectorAll(".featured-products__image-wrapper")
						.forEach((item) => item.classList.remove("observe-me"));
				}

				let multiple = slides_count > 3;

				const productsSlider = new Swiper(`#${sectionId} .swiper`, {
					loop: true,
					longSwipesRatio: 0.1,
					allowTouchMove: true,
					speed: speed,
					...autoplayParm,
					breakpoints: {
						0: {
							slidesPerView: 1,
							slidesPerGroup: 1,
						},
						576: {
							slidesPerView: +perRow - multiple ? 2 : perRow > 2 ? 1 : 0 + 0.2,
						},
						990: {
							slidesPerView: +perRow - (multiple ? 1 : 0) + 0.2,
						},
					},
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

						productsSlider.setTranslate(productsSlider.getTranslate());

						const currentSlideWidth =
							productsSlider.slides[productsSlider.activeIndex].offsetWidth;
						distanceRatio = Math.abs(
							(currentSlideWidth * productsSlider.activeIndex +
								productsSlider.getTranslate()) /
								currentSlideWidth
						);

						duration = productsSlider.params.speed * distanceRatio;
						productsSlider.autoplay.stop();
					};

					const startAutoplay = (delay = duration) => {
						startTimer = setTimeout(() => {
							productsSlider.autoplay.start();
						}, delay);
					};

					slider.addEventListener("mouseenter", function () {
						stopAutoplay();
					});

					slider.addEventListener("mouseleave", function () {
						const distance =
							productsSlider.width * productsSlider.activeIndex +
							productsSlider.getTranslate();

						duration = distance !== 0 ? duration : 0;
						productsSlider.slideTo(productsSlider.activeIndex, duration);
						startAutoplay();
					});

					if (enablenNavigation) {
						const handleSwitch = (setIndex) => {
							stopAutoplay();
							const switchSpeed = 1000;
							const index = setIndex();
							if (index === 999) {
								productsSlider.slideNext(switchSpeed);
							} else if (index === -999) {
								productsSlider.slidePrev(switchSpeed);
							} else {
								productsSlider.slideTo(index, switchSpeed);
							}
						};

						document.querySelector(`#${sectionId} .products-button-next`).addEventListener(
							"click",
							function () {
								handleSwitch(function () {
									let nextIndex = productsSlider.activeIndex;
									const lastSwiperIndex = productsSlider.slides.length - 1;

									nextIndex =
										nextIndex > lastSwiperIndex
											? lastSwiperIndex - nextIndex
											: nextIndex;

									return distanceRatio < 0.003 ? 999 : nextIndex;
								});
							},
							false
						);

						document.querySelector(`#${sectionId} .products-button-prev`).addEventListener(
							"click",
							function () {
								handleSwitch(function () {
									let prevIndex = productsSlider.activeIndex - 1;
									prevIndex =
										prevIndex < 0
											? productsSlider.slides.length + prevIndex
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
							`#${sectionId} .products-cursor`
						).onmousemove = (e) => {
							const interactable = e.target.closest(".products__buttons"),
								interacting = interactable !== null;

							const icon = document.getElementById(`${sectionId}-cursor-icon`);

							if (e.target.closest(".products__buttons") != null) {
								animateCursor(e);
							}

							cursor.dataset.type = interacting
								? interactable.dataset.type
								: "";

							if (interacting) {
								icon.className = getCursorClass(interactable.dataset.type);
							}
						};
					}
				}
			}
			//else {
			//	function createObserver() {
			//		function handleIntersect(entries, observer) {
			//			entries.forEach(entry => {
			//				if (entry.isIntersecting) {
			//					entry.target.classList.add("is-inview");
			//					observer.unobserve(entry.target); // Unobserve the element after the first intersection
			//				}
			//			});
			//		}

			//		let options = {
			//			root: null,
			//			rootMargin: "0px",
			//			threshold: 0.1
			//		};

			//		let observer = new IntersectionObserver(handleIntersect, options);

			//		let targets = document.querySelectorAll(".observe-me");

			//		targets.forEach((target, index) => {
			//			observer.observe(target);
			//			target.style.setProperty('--delay', `${index / 4}s`);
			//		});
			//	}

			//	createObserver();
			//}
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
