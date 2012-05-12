var sliderChanged = function() {
	$('#size-text').val($('#size-range').val());
};

var sliderTextChanged = function() {
	var curval = $('#size-text').val();
	document.getElementById('size-range').value = curval;
};

var loaded = function() {
  $('#size-range').change(sliderChanged);
  $('#size-text').change(sliderTextChanged);
  document.getElementById('size-text').oninput = sliderTextChanged;
};