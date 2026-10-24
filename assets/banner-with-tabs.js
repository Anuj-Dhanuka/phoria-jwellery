(function () {
	const slideshow = () => {
		document.querySelectorAll(".slideshow__padding").forEach((block) => {
			let id = block.closest("section").getAttribute("id");
			block = $(block);
			const autoplay = block.data("autoplay");
			const stopAutoplay = block.data("stop-autoplay");
			const delay = block.data("delay") * 1000;
			const speed = block.data("speed") * 1000;
	
			let swiperParams = {
				speed: speed,
				keyboard: true,
				loop: true,
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
				//pagination: {
				//	el: `#${id} .swiper-pagination`,
				//},
				...swiperParams,
				...autoplayParams,
				allowTouchMove: false,
				touchRatio: 0,
				keyboard: {
					enabled: false,
				},
				spaceBetween: 24,
				on: {
					init: function () {
						swiperTextElement.classList.add('first_step');
						console.log(window.getComputedStyle(document.querySelector('.first_step .slideshow__tab')).animation);
					},
					slideChange: function () {
						swiperTextElement.classList.remove('first_step');
					}
				}
			});

			let swiperImgSelector = `#${id} .slideshow__contents-wrapper`;
			let swiperImgElement = document.querySelector(swiperImgSelector);

	
			const swiperImg = new Swiper(swiperImgSelector, {
				//navigation: {
				//	nextEl: `#${id} .swiper-button-next`, 
				//	prevEl: `#${id} .swiper-button-prev`,
				//},
					...swiperParams,
					...autoplayParams,
					thumbs: {
					swiper: swiperText,
				},
				on: {
					init: function () {
						swiperImgElement.classList.add('first_step');
					},
					slideChange: function () {
						swiperImgElement.classList.remove('first_step');
					}
				}
			});
		})
	}


	document.addEventListener("DOMContentLoaded", function () {
		slideshow();
		document.addEventListener("shopify:section:load", function () {
			slideshow();
		});
	});
})();