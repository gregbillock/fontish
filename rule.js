var colorOn = 'rgb(0,0,0)';
var colorOff = 'rgb(255,255,255)';
var colorGray = 'rgb(127,127,127)';
var colorZero = 'rgb(255,0,0)';
var gridColor = 'rgb(200,200,255)';

var neighborhoodFunction = new Array(3);

var paintCanvas = function() {
	var size = $('#size-range').val();

	var canvas = $('#canvas')[0];
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	var scalex = canvas.width / size;
	var scaley = canvas.height / size;

  var c;
  for (var i = 0; i < size; ++i) {
    for (var j = 0; j < size; ++j) {
      var dist = Math.abs(i - Math.floor(size/2));
      if (dist <= neighborhoodFunction[j]) {
        c = colorOn;
      } else {
        c = colorOff;
      }
      if (i > size/2) {
        c = colorGray;
      }
      if (i == Math.floor(size/2) && j == Math.floor(size/2)) {
        c = colorZero;
      }
      context.fillStyle = c;
      context.fillRect(scalex * i,     scaley * j,
                       scalex * (i+1), scaley * (j+1));
    }
  }


  context.lineWidth = 1;
  context.strokeStyle = gridColor;

  // horizontal lines
  for (var i = 1; i < size; ++i) {
    context.beginPath();
    context.moveTo(0, 0.5 + (scaley * i));
    context.lineTo(canvas.width, 0.5 + (scaley * i));
    context.stroke();
  }

  // vertical lines
  for (var j = 1; j < size; ++j) {
    context.beginPath();
    context.moveTo(0.5 + (scalex * j), 0);
    context.lineTo(0.5 + (scalex * j), canvas.height);
    context.stroke();
  }
};

var adjustNeighborhoodFunction = function(size) {
  if (neighborhoodFunction.length == size)
    return;

  if (neighborhoodFunction.length < size) {
    var diffLead = (size - neighborhoodFunction.length) / 2;
    var newNeighborhoodFunction = new Array(size);
    for (var i = 0; i < size; i++) {
      newNeighborhoodFunction[i] = 0;
      if (i >= diffLead && (i - diffLead) < neighborhoodFunction.length) {
        newNeighborhoodFunction[i] = neighborhoodFunction[i - diffLead];
      }
    }
    neighborhoodFunction = newNeighborhoodFunction;
  }

  if (neighborhoodFunction.length > size) {
    var diffLead = (neighborhoodFunction.length - size) / 2;
    var newNeighborhoodFunction = new Array(size);
    for (var i = diffLead, j = 0; j < size; i++, j++) {
      newNeighborhoodFunction[j] = neighborhoodFunction[i];
    }
    neighborhoodFunction = newNeighborhoodFunction;
  }
  $('#canvas').attr('width', Math.min(900, 20 * size));
  $('#canvas').attr('height', Math.min(900, 20 * size));
  paintCanvas();
};

var sliderChanged = function() {
	$('#size-text').val($('#size-range').val());
	adjustNeighborhoodFunction($('#size-range').val());
};

var sliderTextChanged = function() {
	var curval = $('#size-text').val();
	document.getElementById('size-range').value = curval;
	adjustNeighborhoodFunction($('#size-range').val());
};

var canvasClick = function(e) {
	var size = $('#size-range').val();

  var canvas = $('#canvas')[0];
  var x = e.pageX - canvas.offsetLeft;
  var y = e.pageY - canvas.offsetTop;

  var scalex = canvas.width / size;
  var scaley = canvas.height / size;

  var gridx = Math.floor(x / scalex);
  var gridy = Math.floor(y / scaley);

  // If the click is in the right-hand-side, set the value to 0.
  neighborhoodFunction[gridy] = Math.max(0, Math.floor(size/2) - gridx);
  paintCanvas();
};

var loaded = function() {
  $('#canvas').click(canvasClick);

  $('#size-range').change(sliderChanged);
  $('#size-text').change(sliderTextChanged);
  document.getElementById('size-text').oninput = sliderTextChanged;

  for (var i = 0; i < neighborhoodFunction.length; i++) {
    neighborhoodFunction[i] = 0;
  }

  paintCanvas();
};