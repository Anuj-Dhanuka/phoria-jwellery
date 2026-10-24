(function () {
	const splitScreenSlid = () => {
		$(".product-slider__section").each(function (index, item) {
			if ($(this).hasClass("slider_started")) {
				return "";
			}

			$(this).addClass("slider_started");
			const id = $(this).attr("id");
			const box = $(this).find(".product-slider");
			const autoplay = box.data("autoplay");
			const stopAutoplay = box.data("stop-autoplay");
			const onCursor = box.data("cursor");

			const delay = box.data("delay") * 1000;
			const speed = box.data("speed") * 1000;
			if (autoplay) {
				autoplayParm = {
					autoplay: {
						delay: delay,
						disableOnInteraction: false,
					},
				};
			} else {
				autoplayParm = {};
			}
			let swiperParms = {
				effect: box.data("effect"),
				speed: speed,
				keyboard: true,
				//loop: true,
				creativeEffect: {
					prev: {
						shadow: false,
						translate: [0, 0, -400],
					},
					next: {
						translate: ["100%", 0, 0],
					},
				},
				coverflowEffect: {
					rotate: 50,
					stretch: 0,
					depth: 100,
					modifier: 1,
					slideShadows: false,
				},
				flipEffect: {
					slideShadows: false,
				},
				...autoplayParm,
			};
			const swiperImg = new Swiper(`#${id} .product-slider__image-swiper`, {
				navigation: {
					nextEl: `#${id} .swiper-button-next`,
					prevEl: `#${id} .swiper-button-prev`,
				},
				...swiperParms,
				autoplay: false,
			});
			const swiperText = new Swiper(`#${id} .product-slider__product-swiper`, {
				pagination: {
					el: `#${id} .swiper-pagination`,
					clickable: true,
				},
				...swiperParms,
				spaceBetween: 24,
			});

			swiperImg.controller.control = swiperText;
			swiperText.controller.control = swiperImg;

			if (autoplay && stopAutoplay) {
				document
					.querySelector(`#${id} .product-slider__wrapper`)
					.addEventListener("mouseenter", function () {
						swiperText.autoplay.stop();
					});
				document
					.querySelector(`#${id} .product-slider__wrapper`)
					.addEventListener("mouseleave", function () {
						swiperText.autoplay.start();
					});
			}

			if (onCursor == "cursor") {
				const cursor = document.getElementById("cursor");

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
					let prevButton = document.querySelector(
						`#${id} .swiper-button-prev.swiper-button-disabled`
					);

					let nextButton = document.querySelector(
						`#${id} .swiper-button-next.swiper-button-disabled`
					);

					let prevText = "prev";
					if (prevButton) {
						prevText = "prev prev-disabled";
					}

					let nextText = "next";
					if (nextButton) {
						nextText = "next next-disabled";
					}

					switch (type) {
						case "next":
							return `${nextText} button button--simple`;
						case "prev":
							return `${prevText} button button--simple`;
						default:
							return "button button--simple";
					}
				};

				document.querySelector(`#${id} .product-slider-cursor`).onmousemove = (
					e
				) => {
					const interactable = e.target.closest(".product-slider__buttons"),
						interacting = interactable !== null;

					const icon = document.getElementById("cursor-icon");

					if (e.target.closest(".product-slider__buttons") != null) {
						animateCursor(e);
					}

					cursor.dataset.type = interacting ? interactable.dataset.type : "";

					if (interacting) {
						icon.className = getCursorClass(interactable.dataset.type);
					}
				};
			}

			if (item.querySelectorAll(".observe-me").length > 0) {
				function createObserver() {
					function handleIntersect(entries, observer) {
						entries.forEach((entry) => {
							if (entry.isIntersecting) {
								let css_classlist = entry.target.classList;

								css_classlist.add("is-inview");
								if (autoplay) {
									swiperText.autoplay.stop();
								}
								observer.unobserve(entry.target); // Unobserve the element after the first intersection
								setTimeout(() => {
									css_classlist.remove("is-inview");
									css_classlist.remove("observe-me");
									if (autoplay) {
										swiperText.autoplay.start();
									}
								}, 600);
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
					});
				}

				createObserver();
			}
		});
	};

	document.addEventListener("DOMContentLoaded", function () {
		splitScreenSlid();
		document.addEventListener("shopify:section:load", function () {
			splitScreenSlid();
		});
	});
})();
