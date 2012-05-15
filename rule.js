var colorOn = 'rgb(0,0,0)';
var colorOff = 'rgb(255,255,255)';
var colorGray = 'rgb(127,127,127)';
var colorZero = 'rgb(255,0,0)';
var gridColor = 'rgb(200,200,255)';

// Defaulted to classic Life rule.
var neighborhoodFunction = [1,1,1];
var birthMin = 3;
var birthMax = 3;
var surviveMin = 2;
var surviveMax = 3;

var done = function() {
  var url = window.location.href.split('/');
  url[url.length - 1] = 'index.html';
  url = url.join('/');
  url += '?';
  url += 'n=';
  for (var i = 0; i < neighborhoodFunction.length; ++i) {
    url += neighborhoodFunction[i];
    if (i < neighborhoodFunction.length - 1)
      url += ',';
  }
  url += '&s=' + surviveMin + ',' + surviveMax;
  url += '&b=' + birthMin + ',' + birthMax;
  window.location = url;
};


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
      } else if (i <= size/2) {
        c = colorOff;
      } else {
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

var countCells = function(neighborhood) {
  var count = 0;
  for (var i = 0; i < neighborhood.length; ++i) {
    if (neighborhood[i] < 0) continue;
    count += neighborhood[i] * 2 + 1;
  }
  return count - 1;
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
      newNeighborhoodFunction[j] = Math.min(neighborhoodFunction[i], Math.floor(size/2));
    }
    neighborhoodFunction = newNeighborhoodFunction;
  }
  $('#canvas').attr('width', Math.min(900, 20 * size));
  $('#canvas').attr('height', Math.min(900, 20 * size));
  paintCanvas();
  paintTotals();
}

var paintTotals = function() {
	var totalCells = countCells(neighborhoodFunction);
  $('#ncells').html(totalCells);

  $('#birth-range').slider("option", "max", totalCells);
  $('#survive-range').slider("option", "max", totalCells);
  $('#birth-range').slider("option", "value", $('#birth-range').slider("value"));
  $('#survive-range').slider("option", "value", $('#survive-range').slider("value"));

  $('#birth-range-min').html('0');
  $('#birth-range-max').html(totalCells);
  $('#survive-range-max').html(totalCells);
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
  paintTotals();
};

var surviveLimits = function(min, max) {
	surviveMin = min;
	surviveMax = max;
	if (surviveMin < surviveMax) {
    $('#survive-label').html("Survive range: " + min + " to " + max);
	} else {
    $('#survive-label').html("Survive range: " + min);
	}
};

var birthLimits = function(min, max) {
	birthMin = min;
	birthMax = max;
	if (birthMin < birthMax) {
    $('#birth-label').html("Birth range: " + min + " to " + max);
	} else {
    $('#birth-label').html("Birth range: " + min);
	}
};

var loaded = function() {
  var pieces = window.location.search.split(/\?|\&|\=/);
  var urlParams = {};
  for (var i = 1; i < pieces.length - 1; i += 2) {
    urlParams[decodeURIComponent(pieces[i])] = decodeURIComponent(pieces[i+1]);
  }

  if (urlParams.n) {
    var neighborhood = '[' + urlParams.n + ']';
    try {
      var neighborhoodArray = JSON.parse(neighborhood);
      if (typeof(neighborhoodArray) == 'object' && neighborhoodArray.length % 2 == 1) {
        neighborhoodFunction = neighborhoodArray;
      }
    } catch (e) {
      return;
    }

    var survive = '[' + urlParams.s + ']';
    try {
      var surviveArray = JSON.parse(survive);
      if (typeof(surviveArray) == 'object' && surviveArray.length == 2) {
        surviveMin = surviveArray[0];
        surviveMax = surviveArray[1];
      }
    } catch (e) {
      return;
    }

    var birth = '[' + urlParams.b + ']';
    try {
      var birthArray = JSON.parse(birth);
      if (typeof(birthArray) == 'object' && birthArray.length == 2) {
        birthMin = birthArray[0];
        birthMax = birthArray[1];
      }
    } catch (e) {
      return;
    }
  }

  $('#canvas').click(canvasClick);

  $('#size-range').change(sliderChanged);
  $('#size-text').change(sliderTextChanged);
  document.getElementById('size-text').oninput = sliderTextChanged;

  paintCanvas();

  $("#birth-range").slider({
      range: true,
      min: 0,
      max: 9,
      step: 1,
      values: [ birthMin, birthMax ],
      slide: function( event, ui ) {
      	birthLimits(ui.values[0], ui.values[1]);
      }
	});
	birthLimits(birthMin,birthMax);
  $("#survive-range").slider({
      range: true,
      min: 0,
      max: 9,
      step: 1,
      values: [ surviveMin, surviveMax ],
      slide: function( event, ui ) {
      	surviveLimits(ui.values[0], ui.values[1]);
      }
	});
	surviveLimits(surviveMin,surviveMax);

  paintTotals();

  if (urlParams.n) {
    $('#size-text').val(neighborhoodFunction.length);
    sliderTextChanged();
    $('#canvas').attr('width', Math.min(900, 20 * neighborhoodFunction.length));
    $('#canvas').attr('height', Math.min(900, 20 * neighborhoodFunction.length));
    paintCanvas();
  }

  $('#done').click(done);

};