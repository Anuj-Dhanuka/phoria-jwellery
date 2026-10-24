(function () {
	const slideshow = () => {
		document.querySelectorAll(".slideshow").forEach((block) => {
			let box = block.closest("section");
			let id = box.getAttribute("id");
			block = $(block);
			const autoplay = block.data("autoplay");
			const stopAutoplay = block.data("stop-autoplay");
			const delay = block.data("delay") * 1000;
			const speed = block.data("speed") * 1000;
			const effect = block.data("effect");			
	
			let swiperParams = {
				speed: speed,
				keyboard: true,
				loop: true
			};
	
			let autoplayParams = autoplay ? {
				autoplay: {
					delay: delay,
					disableOnInteraction: false,
					pauseOnMouseEnter: stopAutoplay,
				},
			} : {};

			let swiperTextSelector = `#${id} .slideshow__tabs-wrapper`;
			let swiperTextElement = document.querySelector(swiperTextSelector);
	
			const swiperText = new Swiper(swiperTextSelector, {
				...swiperParams,
				//autoplay: false,
				spaceBetween: 24,
				direction: "horizontal",
				slidesPerView: "auto",
				//slideToClickedSlide: true,
				//loopedSlides: 4,
				allowTouchMove: false,

				breakpoints: {
					990: {
						allowTouchMove: true,
					},
					1600: {
						allowTouchMove: false,
						touchRatio: 0,
						keyboard: {
							enabled: false,
						},
					},
				},
				on: {
					init: function () {
						swiperTextElement.classList.add('first_step');
					},
					slideChange: function () {
						swiperTextElement.classList.remove('first_step');
					}
				}
			});

			let swiperImgSelector = `#${id} .slideshow__contents-wrapper`;
			let swiperImgElement = document.querySelector(swiperImgSelector);

	
			const swiperImg = new Swiper(swiperImgSelector, {
					pagination: {
						el: `#${id} .swiper-pagination`,
						clickable: true,
					},
					...swiperParams,
					...autoplayParams,
					effect: effect,
					thumbs: {
						swiper: swiperText,
					},
				on: {
					init: function () {
						swiperImgElement.classList.add('first_step');
						box.style.setProperty('--bullet-duration', `${delay}ms`);
					},
					slideChange: function () {
						box.style.setProperty('--bullet-duration', `${delay + speed}ms`);
					},
					slideChangeTransitionEnd: function () {
						swiperImgElement.classList.remove('first_step');
					}
				}
			});

			if (autoplay && stopAutoplay) {
				swiperImgElement.addEventListener("mouseenter", function () {
						swiperTextElement.classList.add("stop_move");
					});
					swiperImgElement.addEventListener("mouseleave", function () {
						swiperTextElement.classList.remove("stop_move");
					});
			}

			if($(block.find(".slideshow__content")).length === 1) {
				swiperImgElement.classList.add('no_slideshow');
				swiperTextElement.classList.add('no_slideshow');

				swiperImg.destroy(true, true);
				swiperText.destroy(true, true);
			}
		})
	}


	document.addEventListener("DOMContentLoaded", function () {
		slideshow();
		document.addEventListener("shopify:section:load", function () {
			slideshow();
		});
	});
})();