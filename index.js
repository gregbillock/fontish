"use strict";

var life = new LtLife(0, 0, 100, 100);
var colorOn = 'rgb(0,0,0)';
var colorOff = 'rgb(255,255,255)';
var gridColor = 'rgb(200,200,255)';

var running = false;
var stopping = false;

var canvasClick = function(e) {
  var canvas = $('#canvas')[0];
  var x = e.pageX - canvas.offsetLeft;
  var y = e.pageY - canvas.offsetTop;

  var scalex = canvas.width / life.getWidth();
  var scaley = canvas.height / life.getHeight();

  var lifex = Math.floor(x / scalex) + life.getX();
  var lifey = Math.floor(y / scaley) + life.getY();

  if (!life.get(lifex, lifey))
    life.set(lifex, lifey);
  else
    life.unset(lifex, lifey);
  paintCanvas(life, colorOn, colorOff);
};

var paintCanvas = function(life, colorOn, colorOff) {
  var canvas = $('#canvas')[0];
  var context = canvas.getContext('2d');
  var scalex = canvas.width / life.getWidth();
  var scaley = canvas.height / life.getHeight();

  var x = life.getX();
  var y = life.getY();
  var w = life.getWidth();
  var h = life.getHeight();

  context.fillStyle = colorOff;
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = colorOn;
  for (var i = x; i < x + w; ++i) {
    for (var j = y; j < y + h; ++j) {
      if (life.get(i, j))
        context.fillRect(scalex * (i - x), scaley * (j - y),
                         scalex, scaley);
    }
  }

  context.lineWidth = 1;
  context.strokeStyle = gridColor;

  if (scalex < 4 || scaley < 4)
    return;

  // horizontal lines
  for (var i = y; i < y + h; ++i) {
    context.beginPath();
    context.moveTo(0, 0.5 + (scaley * i));
    context.lineTo(canvas.width, 0.5 + (scaley * i));
    context.stroke();
  }

  // vertical lines
  for (var j = x; j < x + w; ++j) {
    context.beginPath();
    context.moveTo(0.5 + (scalex * j), 0);
    context.lineTo(0.5 + (scalex * j), canvas.height);
    context.stroke();
  }
};

var runClick = function() {
  if (!running) {
    $('#run').html('Stop');
    setTimeout(startRunning, 10);
	} else {
		stopping = true;
	}
};

var start;
var iterations;

var startRunning = function() {
	running = true;
  $('#rate').html('');
	start = new Date().getTime();
	iterations = 0;
	setTimeout(runIteration, 1);
};

var runIteration = function() {
  life.stepRow();
  paintCanvas(life, colorOn, colorOff);
  iterations++;
  var now = new Date().getTime();
  if (iterations > 3 && now > start) {
    var rate = (1000 * iterations) / (now - start);
    $('#rate').html(iterations + ' at ' + rate + ' per second');
  }
  if (stopping) {
    stopRunning();
  } else {
    setTimeout(runIteration, 1);
  }
};

var stopRunning = function() {
  $('#run').html('Run');
  stopping = false;
  running = false;
};



var stepClick = function() {
	life.stepRow();
	paintCanvas(life, colorOn, colorOff);
};

var randomize = function() {
  var density = $('#random-range').val() / 100;
  var x = life.getX();
  var y = life.getY();
  var w = life.getWidth();
  var h = life.getHeight();
  for (var i = x; i < x + w; ++i) {
    for (var j = y; j < y + h; ++j) {
      if (Math.random() < density)
        life.set(i,j);
      else
        life.unset(i,j);
    }
  }

  paintCanvas(life, colorOn, colorOff);
};

var sizeChanged = function() {
  life.resize(0, 0, parseInt($('#sizex').val()), parseInt($('#sizey').val()));
  paintCanvas(life, colorOn, colorOff);
};

var densityChanged = function() {
  var val = $('#random-range').val() / 100;
	console.log(val.toFixed(2));
   $('#range-text').html(val.toFixed(2));
};

var loaded = function() {
  var pieces = window.location.search.split(/\?|\&|\=/);
  var urlParams = {};
  for (var i = 1; i < pieces.length - 1; i += 2) {
    urlParams[decodeURIComponent(pieces[i])] = decodeURIComponent(pieces[i+1]);
  }
  if (urlParams.n) {
    $('#change').attr('href', 'rule.html' + window.location.search);
  }
  console.log('loaded');
    
  $('#canvas').click(canvasClick);
  $('#step').click(stepClick);
  $('#run').click(runClick);
  $('#random').click(randomize);
  $('#random-range').change(densityChanged);
  $('#change-size').click(sizeChanged);
  paintCanvas(life, colorOn, colorOff);
  

  if (urlParams.n) {
    var neighborhood = '[' + urlParams.n + ']';
    try {
      var neighborhoodArray = JSON.parse(neighborhood);
      life.setNeighborhood(neighborhoodArray);
    } catch (e) {
      return;
    }

    var survive = '[' + urlParams.s + ']';
    try {
      var surviveArray = JSON.parse(survive);
      life.setSurvive(surviveArray);
    } catch (e) {
      return;
    }

    var birth = '[' + urlParams.b + ']';
    try {
      var birthArray = JSON.parse(birth);
      life.setBirth(birthArray);
    } catch (e) {
      return;
    }

    $('#rule').html('N:' + neighborhood + ' S: ' + survive + ' B: ' + birth);
  }
};