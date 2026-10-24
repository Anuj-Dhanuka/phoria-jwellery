$(window).on('load', function () {
	let selects = $('.js-select');

	if (selects) {
		selects.each(function() {
			const that = $(this);
			const defOption = $('<option value="Country" data-provinces="[]" selected disabled></option>');

			const ph = $('<div class="placeholder-select">Country <span>*</span></div>');

			const defOption1 = $('<option value="Province" data-provinces="[]" selected disabled></option>');

			const ph1 = $('<div class="placeholder-select">Province <span>*</span></div>');

			let isProvince = $(that).parent().attr('id') === "AddressProvinceContainerNew";

			$(this).find('option:first-child').remove();
			$(this).prepend(isProvince ? ph1 : ph);
			$(this).find('select').prepend(isProvince ? defOption1 : defOption);

			$(this).find('select').change(function (e) {
				$(this).css('color', 'rgb(var(--color-foreground), 1)');
			});
		});
	}
});