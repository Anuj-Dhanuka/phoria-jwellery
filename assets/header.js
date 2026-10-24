(function () {
	const header = () => {
		const header = document.querySelector(".shopify-section-header");
		const headerAlways = document.querySelector(".header-always");

		if (headerAlways) {
			header.classList.add("always-show");
		}

		const menu = document.querySelector(".list-menu--inline");
		const menuLinks = document.querySelectorAll(".list-menu-item");
		const search = document.querySelector(".header__search");

		header.addEventListener("keydown", (e) => {
			if (e.code === "Escape" && search.isOpen) {
				search.close();
			}
		});

		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty("--vh", `${vh}px`);

		const annBar = document.querySelector(".section-announcement");
		const annBarObserver = new IntersectionObserver((entries) => {
			const [entry] = entries;

			if (entry.isIntersecting) {
				document.documentElement.style.setProperty(
					"--ann-height",
					`${entry.intersectionRect.height}px`
				);
			} else {
				document.documentElement.style.setProperty("--ann-height", `0px`);
			}
		});
		if (annBar) annBarObserver.observe(annBar);

		//menuLinks &&
		//	menuLinks.forEach((link) => {
		//		link.addEventListener("mouseenter", (e) => {
		//			if (link.classList.contains("list-menu--megamenu")) {
		//				link.classList.add("list-menu--megamenu-visible");
		//				if (
		//					header.classList.contains("color-background-2") &&
		//					!header.classList.contains("shopify-section-header-sticky")
		//				) {
		//					header.classList.remove("color-background-2");
		//				}

		//				menuLinks.forEach((el) => {
		//					if (el !== link) {
		//						el.classList.remove("list-menu--megamenu-visible");
		//					}
		//				});
		//			} else {
		//				menuLinks.forEach((el) => {
		//					el.classList.remove("list-menu--megamenu-visible");
		//				});
		//			}
		//		});
		//	});
		//menu &&
		//	menu.addEventListener("mouseleave", (e) => {
		//		menuLinks.forEach((link) => {
		//			link.classList.remove("list-menu--megamenu-visible");
		//		});
		//	});

		const addBackground = () => {
			if (document.querySelector(".overflow-hidden-drawer")) {
				return;
			}

			if (document.querySelector(".always-show")) {
				return;
			}

			const headerObserver = new ResizeObserver((entries) => {
				const [entry] = entries;
				if (entry.contentRect.width >= 1200) {
					if (
						header.classList.contains("color-background-2") &&
						!header.classList.contains("shopify-section-header-sticky")
					) {
						header.classList.remove("color-background-2");
					}

					if (
						header.classList.contains("section--have-overlay") &&
						!header.classList.contains("shopify-section-header-sticky")
					) {
						header.classList.add("have-background");
					}
				}
			});

			headerObserver.observe(header);
		};

		const removeBackground = () => {
			if (
				document.querySelector(".overflow-hidden") ||
				document.querySelector(".overflow-hidden-drawer")
			) {
				return;
			}

			if (document.querySelector(".always-show")) {
				return;
			}

			const headerObserver = new ResizeObserver((entries) => {
				const [entry] = entries;
				if (entry.contentRect.width >= 1200) {
					if (
						header.classList.contains("color-background-1") &&
						!header.classList.contains("shopify-section-header-sticky")
					) {
						header.classList.add("color-background-2");
					}

					if (
						header.classList.contains("section--have-overlay") &&
						!header.classList.contains("shopify-section-header-sticky")
					) {
						header.classList.remove("have-background");
					}
				}
			});

			headerObserver.observe(header);
		};

		header.addEventListener("mouseenter", addBackground);

		header.addEventListener("focus", addBackground);

		header.addEventListener("focusin", addBackground);

		header.addEventListener("mouseleave", removeBackground);

		header.addEventListener("focusout", removeBackground);

		document.addEventListener("DOMContentLoaded", () => {
			const firstSection = document.querySelector("main .shopify-section:first-child:not(.not-margin) .section--has-overlay:not(.article-template__header)");
			let isSectionVisible = false;
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting && !isSectionVisible) {
						isSectionVisible = true;
						header.classList.add("entering-section", "color-background-2");
					} else if (!entry.isIntersecting && isSectionVisible) {
						isSectionVisible = false;
						header.classList.remove("entering-section");
					}
				},
				{ threshold: 0.15 }
			);

			if (firstSection) {
				observer.observe(firstSection);
			}

			window.addEventListener("scroll", () => {
				if (isSectionVisible) {
					header.classList.add("entering-section", "color-background-2");
				}
			});
		});

		//const megaMenuListLinks = () => {
		//	const megaMenuLinkWithSubmenu = document.querySelector(
		//		".mega-menu__list-item--children"
		//	);
		//	const megaMenuLinks = document.querySelectorAll(".mega-menu__list-item");
		//	if (megaMenuLinkWithSubmenu) {
		//		megaMenuLinks.forEach((link) => {
		//			link.classList.add("mega-menu__list-item--opacity");
		//		});
		//		megaMenuLinkWithSubmenu.classList.remove(
		//			"mega-menu__list-item--opacity"
		//		);
		//		megaMenuLinkWithSubmenu.classList.add("mega-menu__list-item--visible");
		//	}
		//	$(".mega-menu__list-item").mouseenter(function (event) {
		//		if (megaMenuLinkWithSubmenu) {
		//			megaMenuLinkWithSubmenu.classList.remove(
		//				"mega-menu__list-item--visible"
		//			);
		//		}
		//		$(this).removeClass("mega-menu__list-item--opacity");
		//		$(this).siblings().addClass("mega-menu__list-item--opacity");
		//		$(this).mouseleave(() => {
		//			$(this).siblings().removeClass("mega-menu__list-item--opacity");
		//		});
		//	});
		//	$(".mega-menu__list-item").focus(function (event) {
		//		if (megaMenuLinkWithSubmenu) {
		//			megaMenuLinkWithSubmenu.classList.remove(
		//				"mega-menu__list-item--visible"
		//			);
		//		}
		//		$(this).removeClass("mega-menu__list-item--opacity");
		//		$(this).siblings().addClass("mega-menu__list-item--opacity");
		//		$(this).mouseleave(() => {
		//			$(this).siblings().removeClass("mega-menu__list-item--opacity");
		//		});
		//	});
		//};

		//const megaMenuSublinks = () => {
		//	$(".mega-menu--list .mega-menu__submenu-item").mouseenter(function (
		//		event
		//	) {
		//		$(this).removeClass("mega-menu__submenu-item--opacity");
		//		$(this)
		//			.parent()
		//			.siblings()
		//			.find(".mega-menu__submenu-item")
		//			.addClass("mega-menu__submenu-item--opacity");
		//		$(this).mouseleave(() => {
		//			$(this)
		//				.parent()
		//				.siblings()
		//				.find(".mega-menu__submenu-item")
		//				.removeClass("mega-menu__submenu-item--opacity");
		//		});
		//	});
		//	$(".mega-menu--list .mega-menu__submenu-item").focusin(function (event) {
		//		$(this).removeClass("mega-menu__submenu-item--opacity");
		//		$(this)
		//			.parent()
		//			.siblings()
		//			.find(".mega-menu__submenu-item")
		//			.addClass("mega-menu__submenu-item--opacity");
		//		$(this).focusout(() => {
		//			$(this)
		//				.parent()
		//				.siblings()
		//				.find(".mega-menu__submenu-item")
		//				.removeClass("mega-menu__submenu-item--opacity");
		//		});
		//	});
		//};
		//megaMenuListLinks();
		//megaMenuSublinks();

		const main = document.querySelector("main");
		const breadcrumbs = document.querySelector(".breadcrumbs-wrapper");
		if (
			main
				.querySelectorAll(".shopify-section")[0]
				?.classList.contains("section--has-overlay") &&
			!main
				.querySelectorAll(".shopify-section")[0]
				?.classList.contains("not-margin")
		) {
			header.classList.add("color-background-1", "color-background-2");
			if (breadcrumbs) {
				breadcrumbs.classList.add("color-background-2");
			}
		}
	};

	header();

	document.addEventListener("shopify:section:load", header);
	document.addEventListener("shopify:section:unload", header);
	document.addEventListener("shopify:section:reorder", header);
})();
