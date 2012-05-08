var LtLife = function(x, y, width, height) {
	this.base = Life;
	this.base(x, y, width, height);

  this.neighborhoodFunction = function() {
	  return [4, 4, 4, 4, 4, 4, 4, 4, 4];
  };

  this.birthOrSurvive = function(alive, num) {
    return num >= 41;
  };
};

LtLife.prototype = new Life;

