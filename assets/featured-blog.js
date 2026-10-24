(function() {
  const calcTop = (section) => {
    const imageWrapper = section.querySelector('.article-card__image-wrapper');
    let top = 0;

    if (imageWrapper) {
      top = imageWrapper.offsetHeight  / 2;
    }
    else {
      top = 50;
    }

    return top;
  }

  const initSlider = () => {
    const sliders = document.querySelectorAll('.blog__slider');

    sliders.forEach((slider, index) => {
      const articlesSlider = new Swiper(slider, {
        slidesPerView: 1,
        spaceBetween: 8,
        speed: 1000,
        navigation: {
          nextEl: ".blog__slider-nav .swiper-button-next",
          prevEl: ".blog__slider-nav .swiper-button-prev",
        },
        breakpoints: {
          576: {
            slidesPerView: 2.05,
            slidesPerGroup: 2
          },
          990: {
            slidesPerView: 3.05,
            slidesPerGroup: 3
          },
          1200: {
            slidesPerView: 3,
            slidesPerGroup: 3
          }
        }
      })
    })
  }

  const initSection = () => {
    const sections = document.querySelectorAll('.section-featured-blog');

    const sectionResizeObserver = new ResizeObserver((entries) => {
			const [entry] = entries;
      sections.forEach(section => {
        let top = calcTop(section);
        if (section.querySelector('.blog__slider-nav'))
          section.querySelector('.blog__slider-nav').style.top = top + 'px';
      })
    })

    sections.forEach(section => {
      sectionResizeObserver.observe(section);
    });

    initSlider();
  }

  initSection();

  document.addEventListener('shopify:section:load', function () {
    initSection();
  });
})()