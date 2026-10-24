(function () {
	const stopVideo = (section) => {
		const videos = section.querySelectorAll("video");

		if (videos.length > 0) {
			videos.forEach((video) => {
				video.pause();
			});
		}
	};

	const playVideo = (section) => {
		const videos = section.querySelectorAll("video");

		if (videos.length > 0) {
			videos.forEach((video) => {
				video.play();
			});
		}
	};

	//const initSection = () => {
	//	const sections = document.querySelectorAll(".image-with-text-section");

	//	sections.forEach(item => {
	//		if (item.querySelectorAll(".observe-me").length > 0) {
	//			function createObserver() {
	//					function handleIntersect(entries, observer) {
	//							entries.forEach(entry => {
	//									if (entry.isIntersecting) {
	//											let css_classlist = entry.target.classList;
	//											css_classlist.add("is-inview");
	
	//											observer.unobserve(entry.target);
	
	//											setTimeout(() => {
	//													css_classlist.remove("is-inview");
	//													css_classlist.remove("observe-me");
	//											}, 1250); // Duration matches the animation duration in SCSS
	//									}
	//							});
	//					}
	
	//					let options = {
	//							root: null,
	//							rootMargin: "0px",
	//							threshold: 0.0
	//					};
	
	//					let observer = new IntersectionObserver(handleIntersect, options);
	//					let targets = item.querySelectorAll(".observe-me");
	//					targets.forEach((target, index) => {
	//							observer.observe(target);
	//					});
	//			}
	
	//			createObserver();
	//		} 
	//	})
		

	//	const sectionObserver = new IntersectionObserver((entries) => {
	//		entries.forEach((entry) => {
	//			if (entry.isIntersecting) playVideo(entry.target);
	//			else stopVideo(entry.target);
	//		});
	//	});

	//	const sectionResizeObserver = new ResizeObserver((entries) => {
	//		const [entry] = entries;
	//		playVideo(entry.target);
	//	});

	//	sections.forEach((section) => {
	//		sectionObserver.observe(section);
	//		sectionResizeObserver.observe(section);
	//	});
	//};


	const initSection = () => {
		const sections = document.querySelectorAll(".image-with-text-section");
	
		sections.forEach((section) => {
			const observeItems = section.querySelectorAll(".observe-me");
	
			if (observeItems.length > 0) {
				const observerOptions = {
					root: null,
					rootMargin: "0px",
					threshold: 0.2, // Slight threshold for early detection
				};
	
				const observer = new IntersectionObserver((entries, observer) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const target = entry.target;
							target.classList.add("is-inview");
	
							// Unobserve and reset class after animation ends
							observer.unobserve(target);
							setTimeout(() => {
								target.classList.remove("is-inview");
								target.classList.remove("observe-me");
							}, 1250); // Match animation duration
						}
					});
				}, observerOptions);
	
				observeItems.forEach((item) => observer.observe(item));
			}
		});
	
		const videoSectionObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					playVideo(entry.target);
				} else {
					stopVideo(entry.target);
				}
			});
		});
	
		const videoResizeObserver = new ResizeObserver((entries) => {
			entries.forEach((entry) => playVideo(entry.target));
		});
	
		sections.forEach((section) => {
			videoSectionObserver.observe(section);
			videoResizeObserver.observe(section);
		});
	};
	
	initSection();

	document.addEventListener("shopify:section:load", function () {
		initSection();
	});
})();
