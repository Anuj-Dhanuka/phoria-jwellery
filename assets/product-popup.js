(function () {
	const initProductPopup = () => {
		$(".product-popup__toggle")
			.unbind("click")
			.on("click", function () {
				const parent = $(this).parent();

				if (!parent.hasClass("active")) {
					parent.siblings(".product-popup__item.active").removeClass("active");
					parent.addClass("active");
					$(this)
						.closest(".product-popup__items")
						.find(".product-popup__answer")
						.stop()
						.slideUp(300);
					$(this).next().stop().slideDown(300);
				} else {
					parent.removeClass("active");
					$(this).next().stop().slideUp(300);
				}
			});
	};

	document.addEventListener("DOMContentLoaded", function () {
		initProductPopup();
		document.addEventListener("shopify:section:load", function () {
			initProductPopup();
		});
	});
})();
