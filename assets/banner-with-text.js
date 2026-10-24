(function () {
	const initCollapsibleContent = () => {
		$(".banner-with-text__toggle").unbind("click").on("click", function () {
			const parent = $(this).parent();

			if (!parent.hasClass("active")) {
				parent
					.siblings(".banner-with-text__item.active")
					.removeClass("active");
				parent.addClass("active");
				$(this)
					.closest(".banner-with-text__items")
					.find(".banner-with-text__answer")
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
		if($('.banner-with-text__gallery').length > 0) {
			$('.banner-with-text__gallery').each(function() {
				var images = $(this).find(".banner-with-text__gallery--image-wrapper");

				if(images.length > 1) {
					let speed = Number($(this).data("speed")) * 1000;
					var currentImageIndex = 0;
					
					images.eq(currentImageIndex).fadeIn();

					var interval = setInterval(function() {
							images.eq(currentImageIndex).fadeOut();

							currentImageIndex++;
							if (currentImageIndex >= images.length) {
									currentImageIndex = 0; // Go back to the first image
							}

							images.eq(currentImageIndex).fadeIn();
					}, speed); // Change image every {speed} seconds (adjust as needed)
				}
			});
		}
	};

	document.addEventListener("shopify:section:load", function () {
		initCollapsibleContent();
	});

	initCollapsibleContent();
	initGallery();
})();
