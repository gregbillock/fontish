"use strict";

var LtLife = function(x, y, width, height) {
	this.base = Life;
	this.base(x, y, width, height);

  this.neighborhoodArray = [1,1,1];
  this.surviveArray = [2,3];
  this.birthArray = [3,3];

  this.setNeighborhood = function(arr) {
    if (typeof(arr) != 'object' && !arr.length)
      throw 'Bad argument -- must be array';

    this.neighborhoodArray = arr;
  };

  this.setBirth = function(arr) {
    if (typeof(arr) != 'object' && arr.length != 2)
      throw 'Bad argument -- must be length=2 array';

    this.birthArray = arr;
  };

  this.setSurvive = function(arr) {
    if (typeof(arr) != 'object' && arr.length != 2)
      throw 'Bad argument -- must be length=2 array';

    this.surviveArray = arr;
  };

  this.neighborhoodFunction = function() {
    return this.neighborhoodArray;
  };

  this.birthOrSurvive = function(alive, num) {
    if (!alive && num >= this.birthArray[0] && num <= this.birthArray[1])
      return true;

    if (alive && num >= this.surviveArray[0] && num <= this.surviveArray[1])
      return true;

    return false;
  };
};

LtLife.prototype = new Life;

