(function () {
	const initCollapsibleContent = () => {
		$(".collapsible-content__toggle").unbind("click").on("click", function () {
			const parent = $(this).parent();

			if (!parent.hasClass("active")) {
				parent
					.siblings(".collapsible-content__item.active")
					.removeClass("active");
				parent.addClass("active");
				$(this)
					.closest(".collapsible-content__items")
					.find(".collapsible-content__answer")
					.stop()
					.slideUp(300);
				$(this).next().stop().slideDown(300);
			} else {
				parent.removeClass("active");
				$(this).next().stop().slideUp(300);
			}
		});
	};

	const startCollapsibleSlideshow = (images) => {
		if(images.length > 1) {
			let speed = Number(images.closest('.collapsible-content__gallery').data("speed")) * 1000;
			var currentImageIndex = 0;
			let fadeSpeed = 1000; // Time for the crossfade effect (adjust as needed)
			
			images.eq(currentImageIndex).fadeIn(fadeSpeed);

			// Start the slideshow
			var interval = setInterval(function () {
					let nextImageIndex = (currentImageIndex + 1) % images.length;

					// Crossfade: one fades in while the other fades out
					images.eq(currentImageIndex).fadeOut(fadeSpeed);
					images.eq(nextImageIndex).fadeIn(fadeSpeed);

					currentImageIndex = nextImageIndex;
			}, speed);  // Change image every {speed} seconds (adjust as needed)
		}
	}

	const initGallery = () => {
		console.log("It was called");
		
		if($('.collapsible-content').length > 0) {
			$('.collapsible-content').each(function(index, item) {
				var images = $(this).find(".collapsible-content__gallery--image-wrapper");

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

															startCollapsibleSlideshow(images);
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
					startCollapsibleSlideshow(images);
			}
			});
		}
	};

	initCollapsibleContent();
	initGallery();

	document.addEventListener("DOMContentLoaded", function () {
		initCollapsibleContent();
		initGallery();
		document.addEventListener("shopify:section:load", function () {
			initCollapsibleContent();
			initGallery();
		});
	});
})();
