(function () {
  const animateBlogImages = () => {
    const sections = document.querySelectorAll(".section-main-blog");

    sections.forEach(item => {
      if (item.querySelectorAll(".observe-me").length > 0) {
        function createObserver() {
          function handleIntersect(entries, observer) {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                let css_classlist = entry.target.classList;
                css_classlist.add("is-inview");

                observer.unobserve(entry.target);

                setTimeout(() => {
									css_classlist.remove("observe-me");
                  css_classlist.remove("is-inview");
                }, 1250); // Duration matches the animation duration in SCSS
              }
            });
          }

          let options = {
            root: null,
            rootMargin: "0px",
            threshold: 0
          };

          let observer = new IntersectionObserver(handleIntersect, options);
          let targets = item.querySelectorAll(".observe-me");

          targets.forEach((target, index) => {
            observer.observe(target);
          });
        }

        createObserver();
      }
    })
  }

  animateBlogImages();

  document.addEventListener("shopify:section:load", function () {
    animateBlogImages();
  });
})();
