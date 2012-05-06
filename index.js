var life = new Life(0, 0, 20, 20);
var colorOn = 'rgb(0,0,0)';
var colorOff = 'rgb(255,255,255)';

var canvasClick = function(e) {
  var canvas = $('#canvas')[0];
  var x = e.pageX - canvas.offsetLeft;
  var y = e.pageY - canvas.offsetTop;

  var scalex = canvas.width / life.width;
  var scaley = canvas.height / life.height;

  var lifex = Math.floor(x / scalex) + life.x;
  var lifey = Math.floor(y / scaley) + life.y;

  if (!life.get(lifex, lifey))
    life.set(lifex, lifey);
  else
    life.unset(lifex, lifey);
  paintCanvas(life, colorOn, colorOff);
};

var paintCanvas = function(life, colorOn, colorOff) {
	var canvas = $('#canvas')[0];
	var context = canvas.getContext('2d');
	var scalex = canvas.width / life.width;
	var scaley = canvas.height / life.height;

  for (var i = life.x; i < life.x + life.width; ++i) {
    for (var j = life.y; j < life.y + life.width; ++j) {
      var state = life.get(i, j);
      var c = state ? colorOn : colorOff;
      context.fillStyle = c;
      context.fillRect(scalex * (i - life.x), scaley * (j - life.y),
                       scalex * (i+1 - life.x), scaley * (j+1 - life.y));
    }
  }
};

var stepClick = function() {
	life.step();
	paintCanvas(life, colorOn, colorOff);
};

var loaded = function() {
    console.log('loaded');
    
    $('#canvas').click(canvasClick);
    $('#step').click(stepClick);
    
    paintCanvas(life, colorOn, colorOff);
};