$(document).ready(function() {
  if ($(".announcement-bar__close-button").length > 0) {
    let close_btns = $(".announcement-bar__close-button");
    
    close_btns.each((index, close_btn) => {
      let parent_section = $(close_btn).closest(".section-announcement");

      
      $(close_btn).on("click", () => {
				parent_section.hide();
				document.body.classList.add("announcement-hide");
			});
    });
  }
});