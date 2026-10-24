(function () {
	const mediaBanner = () => {
		document.querySelectorAll(".media-banner").forEach((block) => {
			let box = block.closest("section");
			let id = box.getAttribute("id");
			block = $(block);

			const stickyEffect = block.data("sticky-effect");

			if (stickyEffect) {
				var normalElement = document.querySelector(`#${id} + .sticky-section`);
				if (normalElement == null) {
					return;
				}

				var isSticky = false;

				window.addEventListener("scroll", function () {
					var stickyTop = box.getBoundingClientRect().top;
					var normalElementTop = normalElement.getBoundingClientRect().top;

					if (stickyTop <= 0 && !isSticky) {
						box.classList.add("sticky-active");
						isSticky = true;
					}

					if (normalElementTop <= 0 && isSticky) {
						box.classList.remove("sticky-active");
						isSticky = false;
					}
				});
			}
		});
	};

	document.addEventListener("DOMContentLoaded", function () {
		mediaBanner();
		document.addEventListener("shopify:section:load", function () {
			mediaBanner();
		});
	});
})();

//document.addEventListener("DOMContentLoaded", function () {
//	var stickyElement = document.querySelector(
//		"#shopify-section-template--23032186601765__media-banner"
//	);
//	var normalElement = document.querySelector(
//		"#shopify-section-template--23032186601765__media-banner-2"
//	);
//	var isSticky = false; // Track whether the element is sticky

//	window.addEventListener("scroll", function () {
//		var stickyTop = stickyElement.getBoundingClientRect().top;
//		var normalElementTop = normalElement.getBoundingClientRect().top;

//		// Add sticky class when sticky element reaches the top of the viewport
//		if (stickyTop <= 0 && !isSticky) {
//			stickyElement.classList.add("sticky-active");
//			isSticky = true; // Set sticky state to true
//		}

//		// Remove sticky class if the second section is in the viewport
//		if (normalElementTop <= 0 && isSticky) {
//			stickyElement.classList.remove("sticky-active");
//			isSticky = false; // Set sticky state to false
//		}
//	});
//});
