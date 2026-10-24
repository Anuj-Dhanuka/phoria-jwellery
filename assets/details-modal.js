class DetailsModal extends HTMLElement {
	constructor() {
		super();
		this.header = document.querySelector(".header-wrapper");
		this.detailsContainer = this.querySelector("details");
		this.summaryToggle = this.querySelector("summary");
		this.header.preventHide = false;

		this.detailsContainer.addEventListener(
			"keyup",
			(event) => event.code === "Escape" && this.close()
		);
		this.summaryToggle.addEventListener(
			"click",
			this.onSummaryClick.bind(this)
		);
		this.querySelector('button[type="button"]').addEventListener(
			"click",
			this.close.bind(this)
		);

		this.summaryToggle.setAttribute("role", "button");
	}

	isOpen() {
		return this.detailsContainer.hasAttribute("open");
	}

	onSummaryClick(event) {
		event.preventDefault();
		if (event.target.closest("details").hasAttribute("open")) {
			this.close();
			this.header.preventHide = false;
		} else {
			this.open(event);
			if (!this.header) return;
			this.header.preventHide = this.detailsContainer.open;
		}
	}

	onBodyClick(event) {
		if (
			!this.contains(event.target) ||
			event.target.classList.contains("modal-overlay")
		)
			this.close(false);
	}

	open(event) {
		this.onBodyClickEvent =
			this.onBodyClickEvent || this.onBodyClick.bind(this);
		event.target.closest("details").setAttribute("open", true);
		document.body.addEventListener("click", this.onBodyClickEvent);
		document.body.classList.add("overflow-hidden");
		document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);

		trapFocus(
			this.detailsContainer.querySelector('[tabindex="-1"]'),
			this.detailsContainer.querySelector('input:not([type="hidden"])')
		);
	}

	close(focusToggle = true) {
		removeTrapFocus(focusToggle ? this.summaryToggle : null);
		this.detailsContainer.removeAttribute("open");
		document.body.removeEventListener("click", this.onBodyClickEvent);
		document.body.classList.remove("overflow-hidden");
		document.body.classList.remove(
			`overflow-hidden-${this.dataset.breakpoint}`
		);
		this.header.preventHide = false;
	}
}

customElements.define("details-modal", DetailsModal);
