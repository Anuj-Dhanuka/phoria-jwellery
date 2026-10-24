class CartRemoveButton extends HTMLElement {
	constructor() {
		super();

		this.addEventListener("click", (event) => {
			event.preventDefault();
			this.removeByKeyOrLine();

            const cartUpdatedEvent = new CustomEvent('cartUpdated', {
              detail: {
                message: "Cart was updated"
              }
            });
            document.dispatchEvent(cartUpdatedEvent);
		});
	}

	removeByKeyOrLine() {
		const key = this.dataset.key || "";
		const index = Number(this.dataset.index || 0);
		const lcBundleKeyFromDom = this.dataset.lcBundleKey || "";
		const bundleKeyFromDom = this.dataset.bundleKey || "";

		fetch(`${routes.cart_url}.js`)
			.then((response) => response.json())
			.then((cartState) => {
				const items = Array.isArray(cartState?.items) ? cartState.items : [];
				const updates = {};
				let targetItem = null;

				if (key) {
					targetItem = items.find((item) => String(item.key) === String(key)) || null;
				}
				if (!targetItem && index > 0 && items[index - 1]) {
					targetItem = items[index - 1];
				}

				const lcBundleKey =
					lcBundleKeyFromDom ||
					(targetItem?.properties && targetItem.properties._lc_bundle_key) ||
					"";
				const bundleKey =
					bundleKeyFromDom ||
					(targetItem?.properties && targetItem.properties._ph_bundle_key) ||
					"";

				items.forEach((item, itemIndex) => {
					const props = item?.properties || {};
					const sameLcBundle = lcBundleKey && props._lc_bundle_key === lcBundleKey;
					const sameBundle = bundleKey && props._ph_bundle_key === bundleKey;
					const isClickedLine = key
						? String(item.key) === String(key)
						: itemIndex + 1 === index;
					if (sameLcBundle || sameBundle || isClickedLine) {
						updates[item.key] = 0;
					}
				});

				if (!Object.keys(updates).length) {
					const payload = key ? { id: key, quantity: 0 } : { line: index, quantity: 0 };
					return fetch(`${routes.cart_change_url}`, {
						...fetchConfig(),
						body: JSON.stringify(payload),
					});
				}

				return fetch(`${routes.cart_update_url}`, {
					...fetchConfig(),
					body: JSON.stringify({ updates }),
				});
			})
			.then(() => {
				window.location.reload();
			})
			.catch((error) => {
				console.error("removeByKeyOrLine failed:", error);
			});
	}
}

customElements.define("cart-remove-button", CartRemoveButton);

class CartItems extends HTMLElement {
	constructor() {
		super();
		this.lineItemStatusElement =
			document.getElementById("shopping-cart-line-item-status") ||
			document.getElementById("CartDrawer-LineItemStatus");

		if (document.querySelector(".cart-shipping")) {
			this.minSpend = document.querySelector(".cart-shipping").dataset.minSpend;
			this.minTotal = Math.round(this.minSpend * (Shopify.currency.rate || 1));
			this.cartShipping();
		}

		const debouncedOnChange = debounce((event) => {
			this.onChange(event);
		}, ON_CHANGE_DEBOUNCE_TIMER);

		this.addEventListener("change", debouncedOnChange.bind(this));

		this._inflightControllers = new Map();
	}

	cartUpdateUnsubscriber = undefined;

	_beginRequest(line) {
		const key = String(line);
		const prev = this._inflightControllers.get(key);
		if (prev) prev.abort();
		const controller = new AbortController();
		this._inflightControllers.set(key, controller);
		return controller;
	}

	_endRequest(line, controller) {
		const key = String(line);
		if (this._inflightControllers.get(key) === controller) {
			this._inflightControllers.delete(key);
		}
	}

	cartShipping() {
		let progressPrev = getComputedStyle(
			document.querySelector(".cart-shipping__progress-current")
		).getPropertyValue("width");
		document.documentElement.style.setProperty("--progress-prev", progressPrev);

		this.total = document.querySelector(".cart-shipping").dataset.total;
		this.progress = (this.total / this.minTotal) * 100;
		if (this.progress > 100) this.progress = 100;

		if (this.minTotal > this.total) {
			let amount = this.minTotal - this.total;
			let message = document
				.querySelector(".cart-shipping")
				.dataset.message.replace("||amount||", formatMoney(amount));
			document.querySelector(".cart-shipping__message_default").innerText =
				message;
			document
				.querySelector(".cart-shipping__message_success")
				.classList.remove("active");
			document
				.querySelector(".cart-shipping__message_default")
				.classList.add("active");
		} else {
			document
				.querySelector(".cart-shipping__message_default")
				.classList.remove("active");
			document
				.querySelector(".cart-shipping__message_success")
				.classList.add("active");
		}
		document.querySelector(".cart-shipping__progress-current").style.width =
			this.progress + "%";
	}

	connectedCallback() {
		this.cartUpdateUnsubscriber = subscribe(
			PUB_SUB_EVENTS.cartUpdate,
			(event) => {
				if (event.source === "cart-items") {
					return;
				}
				this.onCartUpdate();
			}
		);
		this.cleanupOrphanLcComponents();
	}

	disconnectedCallback() {
		if (this.cartUpdateUnsubscriber) {
			this.cartUpdateUnsubscriber();
		}
	}

	onChange(event) {
		this.updateQuantity(
			event.target.dataset.index,
			event.target.value,
			document.activeElement.getAttribute("name"),
			event.target.dataset.bundleKey || "",
			event.target.dataset.lcBundleKey || ""
		);
	}

	onCartUpdate() {
		fetch(`${routes.cart_url}?section_id=main-cart-items`)
			.then((response) => response.text())
			.then((responseText) => {
				const html = new DOMParser().parseFromString(responseText, "text/html");
				const sourceQty = html.querySelector("cart-items");
				this.innerHTML = sourceQty.innerHTML;
                console.log("sourceQty", sourceQty)
			})
			.catch((e) => {
				console.error(e);
			});
	}

	getSectionsToRender() {
		return [
			{
				id: "main-cart-items",
				section: document.getElementById("main-cart-items").dataset.id,
				selector: ".js-contents",
			},
			{
				id: "cart-icon-bubble",
				section: "cart-icon-bubble",
				selector: ".shopify-section",
			},
			{
				id: "cart-live-region-text",
				section: "cart-live-region-text",
				selector: ".shopify-section",
			},
			{
				id: "main-cart-footer",
				section: document.getElementById("main-cart-footer").dataset.id,
				selector: ".js-contents-totals",
			},
			{
				id: "main-cart-shipping",
				section:
					document.getElementById("main-cart-shipping").dataset.id || null,
				selector: ".js-contents-shipping",
			},
		];
	}

	updateQuantity(line, quantity, name, bundleKey = "", lcBundleKey = "") {
		// Backward-compat: if older HTML/JS sends LC key as 4th arg, detect and route it correctly.
		if (!lcBundleKey && bundleKey && typeof bundleKey === "string" && bundleKey.startsWith("phlc_")) {
			lcBundleKey = bundleKey;
			bundleKey = "";
		}
		if (lcBundleKey) {
			this.updateLcBundleQuantity(lcBundleKey, quantity, line);
			return;
		}
		if (bundleKey) {
			this.updateBundleQuantity(bundleKey, quantity, line);
			return;
		}
		this.enableLoading(line);
		this.querySelectorAll(".quantity__button").forEach((button) =>
			button.classList.add("disabled")
		);

		if (
			document.querySelectorAll(
				'.card--product card__add-to-cart button[name="add"]'
			)
		) {
			document
				.querySelectorAll(
					'.card--product .card__add-to-cart button[name="add"]'
				)
				.forEach((button) => {
					button.setAttribute("aria-disabled", false);
					if (button.querySelector("span")) {
						button.querySelector("span").classList.remove("hidden");
						button.querySelector(".sold-out-message").classList.add("hidden");
					}
				});
		}

		if (document.querySelector(".cart-shipping")) {
			let progressPrev = getComputedStyle(
				document.querySelector(".cart-shipping__progress-current")
			).getPropertyValue("width");
			document.documentElement.style.setProperty(
				"--progress-prev",
				progressPrev
			);
		}

		const body = JSON.stringify({
			line,
			quantity,
			sections: this.getSectionsToRender().map((section) => section.section),
			sections_url: window.location.pathname,
		});

		const abortController = this._beginRequest(line);
		fetch(`${routes.cart_change_url}`, { ...fetchConfig(), body, signal: abortController.signal })
			.then((response) => {
				return response.text();
			})
			.then((state) => {
				const parsedState = JSON.parse(state);
				const quantityElement =
					document.getElementById(`Quantity-${line}`) ||
					document.getElementById(`Drawer-quantity-${line}`);
				const items = document.querySelectorAll(".cart-item");
				if (parsedState.errors) {
					quantityElement.value = quantityElement.getAttribute("value");
					this.updateLiveRegions(line, parsedState.errors);
					return;
				}

				this.classList.toggle("is-empty", parsedState.item_count === 0);
				const cartDrawerWrapper = document.querySelector("cart-drawer");
				const cartFooter = document.getElementById("main-cart-footer");

				if (cartFooter)
					cartFooter.classList.toggle("is-empty", parsedState.item_count === 0);
				if (cartDrawerWrapper)
					cartDrawerWrapper.classList.toggle(
						"is-empty",
						parsedState.item_count === 0
					);
				this.getSectionsToRender().forEach((section) => {
					const elementToReplace =
						document
							.getElementById(section.id)
							.querySelector(section.selector) ||
						document.getElementById(section.id);
					elementToReplace.innerHTML = this.getSectionInnerHTML(
						parsedState.sections[section.section],
						section.selector
					);
				});
				const updatedValue = parsedState.items[line - 1]
					? parsedState.items[line - 1].quantity
					: undefined;
				let message = "";
				if (
					items.length === parsedState.items.length &&
					updatedValue !== parseInt(quantityElement.value)
				) {
					if (typeof updatedValue === "undefined") {
						message = window.cartStrings.error;
					} else {
						message = window.cartStrings.quantityError.replace(
							"[quantity]",
							updatedValue
						);
					}
				}
				this.updateLiveRegions(line, message);

				const lineItem =
					document.getElementById(`CartItem-${line}`) ||
					document.getElementById(`CartDrawer-Item-${line}`);
				if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
					cartDrawerWrapper
						? trapFocus(
								cartDrawerWrapper,
								lineItem.querySelector(`[name="${name}"]`)
						  )
						: lineItem.querySelector(`[name="${name}"]`).focus();
				} else if (parsedState.item_count === 0 && cartDrawerWrapper) {
					trapFocus(
						cartDrawerWrapper.querySelector(".drawer__inner-empty"),
						cartDrawerWrapper.querySelector("a")
					);
				} else if (document.querySelector(".cart-item") && cartDrawerWrapper) {
					trapFocus(
						cartDrawerWrapper,
						document.querySelector(".cart-item__name")
					);
				}
				publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });
			})
			.catch((err) => {
				if (err && err.name === "AbortError") return;
				this.querySelectorAll(".loading-overlay").forEach((overlay) =>
					overlay.classList.add("hidden")
				);
				this.querySelectorAll(".quantity__button").forEach((button) =>
					button.classList.remove("disabled")
				);
				const errors =
					document.getElementById("cart-errors") ||
					document.getElementById("CartDrawer-CartErrors");
				if (errors) errors.textContent = window.cartStrings.error;
			})
			.finally(() => {
				this._endRequest(line, abortController);
				if (abortController.signal.aborted) return;
				this.querySelectorAll(".quantity__button").forEach((button) =>
					button.classList.remove("disabled")
				);
				if (document.querySelector(".cart-shipping")) {
					this.cartShipping();
				}
				this.disableLoading(line);
			});
	}

	updateBundleQuantity(bundleKey, quantity, line) {
		this.enableLoading(line);
		this.querySelectorAll(".quantity__button").forEach((button) =>
			button.classList.add("disabled")
		);

		const abortController = this._beginRequest(`bundle:${bundleKey}`);
		fetch(`${routes.cart_url}.js`, { signal: abortController.signal })
			.then((response) => response.json())
			.then((cartState) => {
				const updates = {};
				cartState.items.forEach((item, index) => {
					if (item.properties && item.properties._ph_bundle_key === bundleKey) {
						updates[index + 1] = Number(quantity);
					}
				});
				const hasBundleLines = Object.keys(updates).length > 0;
				if (!hasBundleLines) return;
				const body = JSON.stringify({
					updates,
					sections: this.getSectionsToRender().map((section) => section.section),
					sections_url: window.location.pathname,
				});
				return fetch(`${routes.cart_update_url}`, { ...fetchConfig(), body, signal: abortController.signal })
					.then((response) => response.text())
					.then((state) => {
						const parsedState = JSON.parse(state);
						if (parsedState.errors) {
							this.updateLiveRegions(line, parsedState.errors);
							publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });
							return;
						}
						this.classList.toggle("is-empty", parsedState.item_count === 0);
						const cartDrawerWrapper = document.querySelector("cart-drawer");
						const cartFooter = document.getElementById("main-cart-footer");
						if (cartFooter)
							cartFooter.classList.toggle("is-empty", parsedState.item_count === 0);
						if (cartDrawerWrapper)
							cartDrawerWrapper.classList.toggle(
								"is-empty",
								parsedState.item_count === 0
							);
						publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });
					});
			})
			.catch((err) => {
				if (err && err.name === "AbortError") return;
				const errors =
					document.getElementById("cart-errors") ||
					document.getElementById("CartDrawer-CartErrors");
				if (errors) errors.textContent = window.cartStrings.error;
				publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });
			})
			.finally(() => {
				this._endRequest(`bundle:${bundleKey}`, abortController);
				if (abortController.signal.aborted) return;
				this.querySelectorAll(".quantity__button").forEach((button) =>
					button.classList.remove("disabled")
				);
				this.disableLoading(line);
			});
	}

	updateLcBundleQuantity(lcBundleKey, quantity, line) {
		this.enableLoading(line);
		this.querySelectorAll(".quantity__button").forEach((button) =>
			button.classList.add("disabled")
		);

		const abortController = this._beginRequest(`lcbundle:${lcBundleKey}`);
		fetch(`${routes.cart_url}.js`, { signal: abortController.signal })
			.then((response) => response.json())
			.then((cartState) => {
				const updates = {};
				cartState.items.forEach((item, index) => {
					if (item.properties && item.properties._lc_bundle_key === lcBundleKey) {
						updates[index + 1] = Number(quantity);
					}
				});
				const hasBundleLines = Object.keys(updates).length > 0;
				if (!hasBundleLines) return;
				const body = JSON.stringify({
					updates,
					sections: this.getSectionsToRender().map((section) => section.section),
					sections_url: window.location.pathname,
				});
				return fetch(`${routes.cart_update_url}`, { ...fetchConfig(), body, signal: abortController.signal })
					.then((response) => response.text())
					.then((state) => {
						const parsedState = JSON.parse(state);
						if (parsedState.errors) {
							this.updateLiveRegions(line, parsedState.errors);
							publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });
							return;
						}
						this.classList.toggle("is-empty", parsedState.item_count === 0);
						const cartDrawerWrapper = document.querySelector("cart-drawer");
						const cartFooter = document.getElementById("main-cart-footer");
						if (cartFooter)
							cartFooter.classList.toggle("is-empty", parsedState.item_count === 0);
						if (cartDrawerWrapper)
							cartDrawerWrapper.classList.toggle(
								"is-empty",
								parsedState.item_count === 0
							);
						publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });
					});
			})
			.catch((err) => {
				if (err && err.name === "AbortError") return;
				const errors =
					document.getElementById("cart-errors") ||
					document.getElementById("CartDrawer-CartErrors");
				if (errors) errors.textContent = window.cartStrings.error;
				publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });
			})
			.finally(() => {
				this._endRequest(`lcbundle:${lcBundleKey}`, abortController);
				if (abortController.signal.aborted) return;
				this.querySelectorAll(".quantity__button").forEach((button) =>
					button.classList.remove("disabled")
				);
				this.disableLoading(line);
			});
	}

	cleanupOrphanLcComponents() {
		fetch(`${routes.cart_url}.js`)
			.then((response) => response.json())
			.then((cartState) => {
				const items = Array.isArray(cartState?.items) ? cartState.items : [];
				if (!items.length) return;
				const visibleBundleKeys = new Set();
				const hiddenLineUpdates = {};

				items.forEach((item) => {
					const props = item?.properties || {};
					const bundleKey = props._lc_bundle_key || "";
					const isHiddenLcComponent =
						props._lc_hidden_component === "true" ||
						props._lc_component_role === "secondary_base";
					if (bundleKey && !isHiddenLcComponent) {
						visibleBundleKeys.add(bundleKey);
					}
				});

				items.forEach((item, index) => {
					const props = item?.properties || {};
					const bundleKey = props._lc_bundle_key || "";
					const isHiddenLcComponent =
						props._lc_hidden_component === "true" ||
						props._lc_component_role === "secondary_base";
					const isOrphanHidden =
						isHiddenLcComponent &&
						(!bundleKey || !visibleBundleKeys.has(bundleKey));
					if (isOrphanHidden) {
						hiddenLineUpdates[index + 1] = 0;
					}
				});

				if (!Object.keys(hiddenLineUpdates).length) return;

				const body = JSON.stringify({
					updates: hiddenLineUpdates,
					sections: this.getSectionsToRender().map((section) => section.section),
					sections_url: window.location.pathname,
				});

				return fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
					.then((response) => response.text())
					.then((state) => {
						const parsedState = JSON.parse(state);
						this.classList.toggle("is-empty", parsedState.item_count === 0);
						publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });
					});
			})
			.catch(() => {
				// no-op; avoid blocking cart interactions
			});
	}

	updateLiveRegions(line, message) {
		const lineItemError =
			document.getElementById(`Line-item-error-${line}`) ||
			document.getElementById(`CartDrawer-LineItemError-${line}`);
		if (lineItemError)
			lineItemError.querySelector(".cart-item__error-text").textContent = message;

		if (this.lineItemStatusElement) {
			this.lineItemStatusElement.setAttribute("aria-hidden", true);
		}

		const cartStatus =
			document.getElementById("cart-live-region-text") ||
			document.getElementById("CartDrawer-LiveRegionText");
		cartStatus.setAttribute("aria-hidden", false);

		setTimeout(() => {
			cartStatus.setAttribute("aria-hidden", true);
		}, 1000);
	}

	getSectionInnerHTML(html, selector) {
		return new DOMParser()
			.parseFromString(html, "text/html")
			.querySelector(selector).innerHTML;
	}

	enableLoading(line) {
		const mainCartItems =
			document.getElementById("main-cart-items") ||
			document.getElementById("CartDrawer-CartItems");
		mainCartItems.classList.add("cart__items--disabled");

		const cartItemElements = this.querySelectorAll(
			`#CartItem-${line} .loading-overlay`
		);
		const cartDrawerItemElements = this.querySelectorAll(
			`#CartDrawer-Item-${line} .loading-overlay`
		);

		[...cartItemElements, ...cartDrawerItemElements].forEach((overlay) =>
			overlay.classList.remove("hidden")
		);

		document.activeElement.blur();
		if (this.lineItemStatusElement) {
			this.lineItemStatusElement.setAttribute("aria-hidden", false);
		}
	}

	disableLoading(line) {
		const mainCartItems =
			document.getElementById("main-cart-items") ||
			document.getElementById("CartDrawer-CartItems");
		mainCartItems.classList.remove("cart__items--disabled");

		const cartItemElements = this.querySelectorAll(
			`#CartItem-${line} .loading-overlay`
		);
		const cartDrawerItemElements = this.querySelectorAll(
			`#CartDrawer-Item-${line} .loading-overlay`
		);

		cartItemElements.forEach((overlay) => overlay.classList.add("hidden"));
		cartDrawerItemElements.forEach((overlay) =>
			overlay.classList.add("hidden")
		);
	}
}

customElements.define("cart-items", CartItems);

if (!customElements.get("cart-note")) {
	customElements.define(
		"cart-note",
		class CartNote extends HTMLElement {
			constructor() {
				super();

				this.addEventListener(
					"input",
					debounce((event) => {
						const body = JSON.stringify({ note: event.target.value });
						fetch(`${routes.cart_update_url}`, {
							...fetchConfig(),
							...{ body },
						});
					}, ON_CHANGE_DEBOUNCE_TIMER)
				);
			}
		}
	);
}
