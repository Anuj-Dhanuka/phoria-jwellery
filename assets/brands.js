(function () {
  const brands = () => {
    let containers = document.querySelectorAll(".brands");

    containers.forEach((container) => {
      let images = container.querySelectorAll(".brands__image-wrapper");
      let links = container.querySelectorAll(".brands__placeholder");

      images.forEach((image, index) => {
				let isFirst = (index === 0);

				image.style.opacity = isFirst ? 1 : 0;
				image.style.zIndex = isFirst ? 1 : 0;
				image.style.transition = "opacity 1s ease";
      });

      let fadeImages = (index) => {
        images.forEach((image, i) => {
					let isCurrent = (i === index);
					
					image.style.opacity = isCurrent ? 1 : 0;
					image.style.zIndex = isCurrent ? 1 : 0;
        });
      };

      links.forEach((link, index) => link.addEventListener("mouseenter", () => fadeImages(index)));
      container.addEventListener("mouseleave", () => fadeImages(0));
    });
  };

  // Initialize the function on DOM load and section load in Shopify
  document.addEventListener("DOMContentLoaded", function () {
    brands();
    document.addEventListener("shopify:section:load", function () {
      brands();
    });
  });
})();