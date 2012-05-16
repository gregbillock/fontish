var life = new LtLife(0, 0, 100, 100);
var colorOn = 'rgb(0,0,0)';
var colorOff = 'rgb(255,255,255)';
var gridColor = 'rgb(200,200,255)';

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

  for (var i = life.x; i < life.x + life.getWidth(); ++i) {
    for (var j = life.y; j < life.y + life.getHeight(); ++j) {
      var state = life.get(i, j);
      var c = state ? colorOn : colorOff;
      context.fillStyle = c;
      context.fillRect(scalex * (i - life.getX()), scaley * (j - life.getY()),
                       scalex * (i+1 - life.getX()), scaley * (j+1 - life.getY()));
    }
  }


  context.lineWidth = 1;
  context.strokeStyle = gridColor;

  // horizontal lines
  for (var i = life.getY(); i < life.getY() + life.getHeight(); ++i) {
    context.beginPath();
    context.moveTo(0, 0.5 + (scaley * i));
    context.lineTo(canvas.width, 0.5 + (scaley * i));
    context.stroke();
  }

  // vertical lines
  for (var j = life.getX(); j < life.getX() + life.getWidth(); ++j) {
    context.beginPath();
    context.moveTo(0.5 + (scalex * j), 0);
    context.lineTo(0.5 + (scalex * j), canvas.height);
    context.stroke();
  }
};

var stepClick = function() {
	life.stepRow();
	paintCanvas(life, colorOn, colorOff);
};

var randomize = function() {
  var density = $('#random-range').val() / 100;

  for (var i = life.getX(); i < life.getX() + life.getWidth(); ++i) {
    for (var j = life.getY(); j < life.getY() + life.getHeight(); ++j) {
      if (Math.random() < density)
        life.set(i,j);
      else
        life.unset(i,j);
    }
  }

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
  $('#random').click(randomize);
  $('#random-range').change(densityChanged);  
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