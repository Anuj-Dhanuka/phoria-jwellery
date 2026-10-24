(function () {
	const initCollapsibleContent = () => {
		$(".banner-with-popup__toggle").unbind("click").on("click", function () {
			const parent = $(this).parent();

			if (!parent.hasClass("active")) {
				parent
					.siblings(".banner-with-popup__item.active")
					.removeClass("active");
				parent.addClass("active");
				$(this)
					.closest(".banner-with-popup__items")
					.find(".banner-with-popup__answer")
					.stop()
					.slideUp(300);
				$(this).next().stop().slideDown(300);
			} else {
				parent.removeClass("active");
				$(this).next().stop().slideUp(300);
			}
		});
	};

	const initGallery = () => {
    if ($('.banner-with-popup').length > 0) {
        $('.banner-with-popup').each(function (index, item) {
            var images = $(this).find(".banner-with-popup__gallery--image-wrapper");

            if (item.querySelectorAll(".observe-me").length > 0) {
                function createObserver() {
                    function handleIntersect(entries, observer) {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                let css_classlist = entry.target.classList;
                                css_classlist.add("is-inview");

                                observer.unobserve(entry.target);

                                setTimeout(() => {
                                    css_classlist.remove("is-inview");
                                    css_classlist.remove("observe-me");

                                    startGallerySlideshow(images);
                                }, 600); // Duration matches the animation duration in SCSS
                            }
                        });
                    }

                    let options = {
                        root: null,
                        rootMargin: "0px",
                        threshold: 0.1
                    };

                    let observer = new IntersectionObserver(handleIntersect, options);
                    let targets = item.querySelectorAll(".observe-me");
                    targets.forEach((target, index) => {
                        observer.observe(target);
                    });
                }

                createObserver();
            } else {
                // If there are no elements to observe, start the gallery slideshow immediately
                startGallerySlideshow(images);
            }
        });
    }
	};

const startGallerySlideshow = (images) => {
	if (images.length > 1) {
			let speed = Number(images.closest('.banner-with-popup__gallery').data("speed")) * 1000;
			let currentImageIndex = 0;
			let fadeSpeed = 1000; // Time for the crossfade effect (adjust as needed)

			// Initially show the first image
			images.eq(currentImageIndex).fadeIn(fadeSpeed);

			// Start the slideshow
			var interval = setInterval(function () {
					let nextImageIndex = (currentImageIndex + 1) % images.length;

					// Crossfade: one fades in while the other fades out
					images.eq(currentImageIndex).fadeOut(fadeSpeed);
					images.eq(nextImageIndex).fadeIn(fadeSpeed);

					currentImageIndex = nextImageIndex;
			}, speed); // Change image every {speed} seconds (adjust as needed)
	}
};  

const initBannerWithPopup = () => {
    initCollapsibleContent();
    initGallery();
}

	document.addEventListener("DOMContentLoaded", function () {
		initBannerWithPopup();

        document.addEventListener("shopify:section:load", function () {
            initBannerWithPopup();
        });
	});
})();
