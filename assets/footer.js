////(function () {
//  // Function to get all the next siblings of an element
//  const nextSiblings = (currentElement) => {
//    let next_siblings = [];
//    let sibling = currentElement.nextElementSibling;

//    while (sibling) {
//      next_siblings.push(sibling);
//      sibling = sibling.nextElementSibling;
//    }

//    return next_siblings;
//  };

//  const footerDifferenceCalc = () => {
//    if (window.innerWidth > 989) {
//      let innerBlock = document.querySelector(
//        ".home_page_slider .footer--center_subscribe"
//      );
//      let sectionBlock = document.querySelector(
//        ".shopify-section-group-footer-group"
//      );
//      let innerHeight = innerBlock.offsetHeight;
//      let sectionHeight = sectionBlock.offsetHeight;

//      innerBlock.style.marginTop =
//        innerHeight > sectionHeight
//          ? 0 - parseInt(innerHeight - sectionHeight) + "px"
//          : 0;
//    }
//  };

//  const footer = () => {
//    const caculateNewsletterMargin = () => {
//      let timeout =
//        document?.querySelector(".home_page_slider") !== null ? 1500 : 0;

//      setTimeout(() => {
//        const footerNewsletter = document.querySelector(
//          ".footer--newsletter__form--center"
//        );

//        // Only proceed if the newsletter form exists
//        if (footerNewsletter) {
//          let footerParent = footerNewsletter.parentNode;
//          let footerStyles = window.getComputedStyle(footerParent);

//          // Calculate the total height of next siblings
//          let siblingsTotalHeight =
//            nextSiblings(footerNewsletter).reduce((totalHeight, sibling) => {
//              const siblingHeight = sibling.offsetHeight || 0; // Handle hidden elements
//              return totalHeight + siblingHeight;
//            }, 0) - parseInt(footerStyles.getPropertyValue("padding-top"), 10);

//          let windowHeight = window.outerHeight;
//          let newsletterHeight = footerNewsletter.offsetHeight;
//          let spaceLeft =
//            (windowHeight - siblingsTotalHeight - newsletterHeight) / 2;

//          paddingTop = spaceLeft > 0 ? spaceLeft : 0;

//          // Apply the calculated margin to the newsletter
//          footerNewsletter.style.paddingTop = `${paddingTop}px`;
//        }
//      }, timeout);
//    };

//    caculateNewsletterMargin();
//    setTimeout(() => footerDifferenceCalc(), 1500);

//    window.addEventListener("resize", () =>
//      setTimeout(() => caculateNewsletterMargin(), 1500)
//    );
//  };

//  // Reapply the footer logic when the section is reloaded
//  document.addEventListener("shopify:section:load", footer);
//  footer();
//})();

(function () {
	// Function to get all the next siblings of an element
	const nextSiblings = (currentElement) => {
		let next_siblings = [];
		let sibling = currentElement.nextElementSibling;

		while (sibling) {
			next_siblings.push(sibling);
			sibling = sibling.nextElementSibling;
		}

		return next_siblings;
	};

	const footerDifferenceCalc = () => {
		if (
			window.innerWidth > 989 &&
			document.querySelector(".home_page_slider .footer--center_subscribe") !==
				null
		) {
			//debugger;
			const innerBlock = document.querySelector(
				".home_page_slider .footer--center_subscribe"
			);
			const sectionBlock = document.querySelector(
				".shopify-section-group-footer-group"
			);

			if (!innerBlock || !sectionBlock) return;

			const innerHeight = innerBlock.offsetHeight;
			const sectionHeight = sectionBlock.offsetHeight;

			innerBlock.querySelector(
				".footer--newsletter__form--center"
			).style.marginTop = `${0 - (innerHeight - sectionHeight)}px`;
		}
	};

	const calculateNewsletterMargin = () => {
		return new Promise((resolve) => {
			const timeout =
				document.querySelector(".home_page_slider") !== null ? 700 : 0;

			setTimeout(() => {
				const footerNewsletter = document.querySelector(
					".footer--newsletter__form--center"
				);

				if (footerNewsletter) {
					// FIX: reset inline styles to prevent compounding from a prev calc-s
					footerNewsletter.style.paddingTop = "";
					footerNewsletter.style.marginTop = "";

					const footerParent = footerNewsletter.parentNode;
					const footerStyles = window.getComputedStyle(footerParent);

					const footerPaddingTop =
						parseInt(footerStyles.getPropertyValue("padding-top"), 10) || 0;
					const nextSiblingsTotalHeight = nextSiblings(footerNewsletter).reduce(
						(totalHeight, sibling) => {
							const siblingHeight = sibling.offsetHeight || 0;
							return totalHeight + siblingHeight;
						},
						0
					);
					const siblingsTotalHeight =
						nextSiblingsTotalHeight - footerPaddingTop;

					//const windowHeight = window.outerHeight
					// FIX: outerHeight also includes height of browser window (tabs, URL bar etc)
					const windowHeight = window.innerHeight;
					const newsletterHeight = footerNewsletter.offsetHeight;

					const spaceLeftTotal =
						windowHeight - siblingsTotalHeight - newsletterHeight;
					const spaceLeftAbove = spaceLeftTotal / 2;

					footerNewsletter.style.paddingTop = `${Math.max(
						spaceLeftAbove,
						0
					)}px`;

					// debug output
					//console.log(
					//	`calculateNewsletterMargin update padding`,
					//	JSON.stringify({
					//		windowHeight,
					//		windowWidth: window.innerWidth,
					//		footerPaddingTop,
					//		nextSiblingsTotalHeight,
					//		siblingsTotalHeight,
					//		newsletterHeight,
					//		spaceLeftTotal,
					//		spaceLeftAbove,
					//		paddingTop: footerNewsletter.style.paddingTop,
					//	})
					//);
				}

				resolve(); // Signal completion
			}, timeout);
		});
	};

	const displayPaddingAndMargin = () => {
		const footerNewsletter = document.querySelector(
			".footer--newsletter__form--center"
		);

		//console.log(
		//	`current padding and margin`,
		//	JSON.stringify({
		//		paddingTop: footerNewsletter.style.paddingTop,
		//		marginTop: footerNewsletter.style.marginTop,
		//	})
		//);
	};

	const footer = async () => {
		if (document.querySelector(".footer--newsletter__form--center") != null) {
			calculateNewsletterMargin()
				.then(footerDifferenceCalc)
				.then(displayPaddingAndMargin);
		}
	};

	// Reapply the footer logic when the section is reloaded
	document.addEventListener("shopify:section:load", footer);
	footer();

	// Optimize resize event using debounce
	window.addEventListener("resize", () => {
		setTimeout(footer, 1000);
	});
})();
