const loadItems = (button) => {
  const totalPages = parseInt($('[data-total-pages]').val());
  let currentPage = parseInt($('[data-current-page]').val());
  let currentPageScroll = currentPage + 1;

  currentPage = currentPage+1;
  const nextUrl = $('[data-next-url]').val().replace(/page=[0-9]+/,'page='+currentPage);
  const nextUrlScroll = $('[data-next-url]').val().replace(/page=[0-9]+/,'page='+currentPageScroll);
  $('[data-current-page]').val(currentPage);

  button.setAttribute("disabled", "");
  button.classList.add('loading');

  $.ajax({
    url: nextUrl,
    type: 'GET',
    dataType: 'html',
    success: function(responseHTML){
      $('.load-more-grid').append($(responseHTML).find('.load-more-grid').html());
      colorSwatches();
    },
    complete: function() {
      if (currentPage <= totalPages) {
        const scollData = document.querySelector('.infinite-scroll__data');
        if (scollData && currentPage != totalPages) {
          scollData.querySelector('input[data-next-url]').dataset.nextUrl =  nextUrlScroll;
          scollData.querySelector('input[data-next-url]').value =  nextUrlScroll;
          scollData.querySelector('input[data-current-page]').dataset.currentPage =  currentPage;
          scollData.querySelector('input[data-current-page]').value =  currentPage;
          checkVisibility();
        }
        button.removeAttribute("disabled");
        button.classList.remove('loading');
        if (currentPage == totalPages) {
          button.remove();
        }
      } 
    }
  })
}

const animateImages = () => {
	console.log("I was called to animate images");
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
													css_classlist.remove("is-inview");
													css_classlist.remove("observe-me");
											}, 1000); // Duration matches the animation duration in SCSS
									}
							});
					}

					let options = {
							root: null,
							rootMargin: "0px",
							threshold: 0.0
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

const checkVisibility = () => {
  const spinnerList = document.querySelectorAll('.js-infinite-scroll');
  spinnerList.forEach(spinner => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadItems(spinner);
						observer.unobserve(entry.target);
          }
        })
      }
    );

    sectionObserver.observe(spinner);
  })
}

function loadMore() {  
  document.querySelectorAll('.js-load-more').forEach((button) => {
    button.onclick = () => {
      loadItems(button);
    }
  });

  checkVisibility();
}

(function () {
  loadMore();
})();

