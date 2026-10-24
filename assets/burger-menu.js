class BurgerMenu extends HTMLElement {
	constructor() {
		super();
		this.header = document.querySelector(".header-wrapper");
		this.burgerMenu = this.querySelector(".burger-menu");
		this.openButton = this.querySelector(".burger-menu__toggle--open-btn");
		this.closeButton = this.querySelectorAll(".burger-menu__toggle--close-btn");
		this.overlay = this.querySelector(".burger-menu__overlay");

		if (this.header) this.header.preventHide = false;

		this.setListeners();
	}

	open(event) {
		event.preventDefault();
		if (this.header) this.header.preventHide = true;

		this.burgerMenu.classList.add("burger-menu--open");
		this.overlay.classList.add("burger-menu__overlay--active");
		document.body.classList.add("overflow-hidden-drawer");
	}

	close(event) {
		event.preventDefault();

		this.burgerMenu.classList.remove("burger-menu--open");
		this.overlay.classList.remove("burger-menu__overlay--active");
		document.body.classList.remove("overflow-hidden-drawer");

		if (this.header) this.header.preventHide = false;

		this.burgerMenu.classList.add("hiding");

		setTimeout(() => this.burgerMenu.classList.remove("hiding"), 700);
	}

	setListeners() {
		this.openButton?.addEventListener("click", (event) => this.open(event));
		this.closeButton?.forEach((item) =>
			item.addEventListener("click", (event) => this.close(event))
		);
		this.overlay?.addEventListener("click", (event) => this.close(event));
		this.burgerMenu?.addEventListener(
			"keyup",
			(event) => event.code === "Escape" && this.close(event)
		);
	}
}

if (!customElements.get("burger-menu")) {
	customElements.define("burger-menu", BurgerMenu);
}
