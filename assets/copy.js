function copyURI(evt) {
	evt.preventDefault();
	navigator.clipboard
		.writeText(evt.target.href || window.location.href)
		.then(() => {
			const parentElement = evt.target.closest(".copy-wrapper");
			const tooltip = parentElement.querySelector(".tooltip");

			if (tooltip) {
				tooltip.classList.add("show");

				setTimeout(() => {
					tooltip.classList.remove("show");
				}, 2000);
			}
		})
		.catch((err) => {
			console.error("Error: ", err);
		});
}

const mainArticle = () => {
	if(document.querySelector('.article-template__share') !== null) {
		const shareBlock = document.querySelector('.article-template__share');
	
		const observerOptions = {
			threshold: 1
		};

		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					shareBlock.classList.add('show');
					shareBlock.classList.remove('hide');
					observer.unobserve(entry.target);
				}
			});
		}, observerOptions);

		observer.observe(shareBlock);
	}
};

document.addEventListener("DOMContentLoaded", () => {
	const copyLinks = document.querySelectorAll(".copy-btn");

	mainArticle();

	for (const copyLink of copyLinks) {
		copyLink.addEventListener("click", copyURI);
	}
});
