(function () {
	const initProductAccordion = () => {
		$(".about__accordion-toggle").click(function () {
			if (!$(this).hasClass("active")) {
				$(this).addClass("active");
				$(this)
					.siblings(".about__accordion-description")
					.eq($(this).index())
					.stop()
					.slideDown(300);
			} else {
				$(this).removeClass("active");
				$(this).siblings(".about__accordion-description").stop().slideUp(300);
			}
		});
	};

	const initZoomImage = () => {
		const imagesWrapper = document.querySelector(
			".product-media-modal__content"
		);
		const images = imagesWrapper.querySelectorAll(".js-image-zoom");

		images.forEach((el) => {
			el.addEventListener("click", (e) => {
				imagesWrapper.classList.toggle("zoom");
			});
		});
	};



	const revealPopup = () => {
		const stickyBar = document.querySelector('.product__popup'); // Sticky bar
		const secondSection = document.querySelector('.product-section + section'); // Second section
		const footer = document.querySelector('footer'); // Footer

		// Check if the required elements exist
		if (!stickyBar || !secondSection || !footer) {
				console.error('Required elements not found!');
				return;
		}

			const getOffset = (element) => {
				const rect = element.getBoundingClientRect();
				return rect.top + window.scrollY;
			};

			const secondSectionMid = getOffset(secondSection);
			const footerTop = getOffset(footer);

			const handleScroll = () => {
				const scrollPosition = window.scrollY + window.innerHeight;
				const activeOffset = window.scrollY > secondSectionMid && scrollPosition < footerTop;

				stickyBar.classList[activeOffset ? "add" : "remove"]('active');
			};

			// Initial check in case the user starts in the middle of the page
			handleScroll();
};

	document.addEventListener('scroll', () => revealPopup());


	document.addEventListener("shopify:section:load", function () {
		initProductAccordion();
		initZoomImage();
		revealPopup();
	});

	initProductAccordion();
	initZoomImage();
	revealPopup();
})();

class FloatedForm extends HTMLElement {
	constructor() {
		super();
		this.renderForm();
	}

	renderForm() {
		fetch(this.getAttribute("data-product-url"))
			.then((response) => response.text())
			.then((responseText) => {
				const responseHTML = new DOMParser().parseFromString(
					responseText,
					"text/html"
				);
				this.productElement = responseHTML.querySelector(
					'div[id^="ProductInfo-"]'
				);

				this.preventDuplicatedIDs();
				this.removeDOMElements();
				this.setInnerHTML(this, this.productElement.innerHTML);

				if (window.Shopify && Shopify.PaymentButton) {
					Shopify.PaymentButton.init();
				}

				if (window.ProductModel) window.ProductModel.loadShopifyXR();

				this.showMoreFields();
			})
			.finally(() => {
				const selectDropDown = () => {
					$(".product__popup .product-form__controls--dropdown").each(function () {
						const elListItem = $(this).find(".dropdown-select ul li");
						const elItem = $(this).find(".dropdown-select ul");
						const selectedText = $(this).find(
							".dropdown-select .select-label"
						);

						selectedText.on("click", function (e) {
							elItem.toggleClass("active");
							if (elItem.hasClass("active")) {
								e.stopPropagation();
								$(document).click(function () {
									elItem.removeClass("active");
								});
							}
						});

						elListItem.on("click", function () {
							selectedText
								.find("span")
								.text($(this).text())
								.attr("title", $(this).text());
							elItem.removeClass("active");
							document.activeElement.blur();
						});
					});
				};

				selectDropDown();
			});
	}

	setInnerHTML(element, html) {
		element.innerHTML = html;

		// Reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
		element.querySelectorAll("script").forEach((oldScriptTag) => {
			const newScriptTag = document.createElement("script");
			Array.from(oldScriptTag.attributes).forEach((attribute) => {
				newScriptTag.setAttribute(attribute.name, attribute.value);
			});
			newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
			oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
		});
	}

	preventDuplicatedIDs() {
		const sectionId = this.productElement.dataset.section;
		this.productElement.innerHTML = this.productElement.innerHTML.replaceAll(
			sectionId,
			`floated-${sectionId}`
		);

		if (this.productElement.querySelectorAll("variant-selects")) {
			this.productElement
				.querySelectorAll("variant-selects")
				.forEach((radio) => {
					radio.dataset.originalSection = sectionId;
				});
		}

		if (this.productElement.querySelectorAll("variant-radios")) {
			this.productElement
				.querySelectorAll("variant-radios")
				.forEach((radio) => {
					radio.dataset.originalSection = sectionId;
				});
		}
	}

	removeDOMElements() {
		const text = this.productElement.querySelector(".product__text");
		if (text) text.remove();

		const tags = this.productElement.querySelector(".product__tags");
		if (tags) tags.remove();

    const title = this.productElement.querySelector(".product__title__wrapper");
		if (title) title.remove();

		const badges = this.productElement.querySelector(".product__custom-badges");
		if (badges) badges.remove();

    const price = this.productElement.querySelector(".price-wrapper");
		if (price) price.remove();

		const description = this.productElement.querySelector(
			".product__description"
		);
		if (description) description.remove();

		const sku = this.productElement.querySelector(".product__sku");
		if (sku) sku.remove();

		const inventory = this.productElement.querySelector(".product__inventory");
		if (inventory) inventory.remove();

		const pickupAvailability = this.productElement.querySelector(
			"pickup-availability"
		);
		if (pickupAvailability) pickupAvailability.remove();

		const customLiquid = this.productElement.querySelector(".custom-liquid");
		if (customLiquid) customLiquid.remove();

		const complementary = this.productElement.querySelector(
			"product-recommendations"
		);
		if (complementary) complementary.remove();

		const shareButtons = this.productElement.querySelector(".share-buttons");
		if (shareButtons) shareButtons.remove();

		const productModal = this.productElement.querySelectorAll(".product-popup");
		productModal.forEach((advantage) => {
			advantage.remove();
		});

		const productForm = this.productElement.querySelector("floated-form");
		if (productForm) productForm.remove();
	}

	showMoreFields() {
		$(".js-show-more").click(function (e) {
			e.preventDefault();
			$(this).siblings("input").removeClass("hidden");
			$(this).siblings("label").removeClass("hidden");
			$(this).remove();
		});
	}
}

customElements.define("floated-form", FloatedForm);

(() => {
	const LETTERS_SCROLL_STEP = 200;

	const updateLettersNavState = (carousel) => {
		if (!carousel) return;
		const track = carousel.querySelector("[data-letters-track]");
		if (!track) return;

		const prev = carousel.querySelector('[data-letters-nav="prev"]');
		const next = carousel.querySelector('[data-letters-nav="next"]');
		if (!prev || !next) return;

		const maxScrollLeft = Math.max(track.scrollWidth - track.clientWidth, 0);
		prev.disabled = track.scrollLeft <= 2;
		next.disabled = track.scrollLeft >= maxScrollLeft - 2;
	};

	const bindLettersNav = (root = document) => {
		root.querySelectorAll(".product-form__controls-carousel").forEach((carousel) => {
			const track = carousel.querySelector("[data-letters-track]");
			if (!track || carousel.dataset.lettersBound === "true") return;

			carousel.dataset.lettersBound = "true";
			updateLettersNavState(carousel);

			track.addEventListener("scroll", () => updateLettersNavState(carousel), {
				passive: true
			});
		});
	};

	document.addEventListener("click", (event) => {
		const button = event.target.closest("[data-letters-nav]");
		if (!button) return;

		const carousel = button.closest(".product-form__controls-carousel");
		const track = carousel && carousel.querySelector("[data-letters-track]");
		if (!carousel || !track) return;

		const direction = button.dataset.lettersNav === "prev" ? -1 : 1;
		track.scrollBy({ left: LETTERS_SCROLL_STEP * direction, behavior: "smooth" });
	});

	window.addEventListener("resize", () => bindLettersNav());
	document.addEventListener("shopify:section:load", () => bindLettersNav());
	document.addEventListener("DOMContentLoaded", () => bindLettersNav());
	bindLettersNav();
})();
