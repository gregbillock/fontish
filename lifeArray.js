"use strict";

// Create a new Life CA grid in principle embedded within a larger
// grid. Coordinates of the top-left corner are (x,y),
// and the grid has the given width and height.
var Life = function(x, y, width, height) {
  // Change the dimensions of the board. Destructive -- erases current contents.
  this.resize = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.buf = new ArrayBuffer(this.width * this.height);
    this.bufa = new Uint8Array(this.buf, 0);
  };
  this.resize(x, y, width, height);


  // This function should return the neighborhood of the point (0, 0) in
  // an array representing the leading edge (the trailing edge is assumed to
  // just be the negative of the leading edge). For instance, the classic
  // life neighborhood is a 3x3 square grid, so that would be:
  // [ [-1,-1,-1], [1,1,1] ].
  // A circular neighborhood of range=4 might be
  // [ [-1, -3, -3, -4, -4, -4, -3, -3, -1], [1, 3, 3, 4, 4, 4, 3, 3, 1] ]
  // So the neighborhoodFunction for these would be the second array in
  // each case. The "range" of the rule is then taken to be Math.floor(array.length/2),
  // so the length really wants to be odd. The values are the offsets, in
  // number of cells, at each row, from the least y-coordinate to the largest,
  // in the neighborhood, centered at 0,0. (For more complicated patterns,
  // you need to change neighborhoodLeading/TrailingEdge.)
  this.neighborhoodFunction = function() {
    return [1, 1, 1];
  };

  // This function implements the rule checked to see if a particular cell
  // should be on in the next generation. It should return true if the cell
  // ought to be on.
  // "alive" is set to true if the current cell is turned on in the last
  // generation.
  // "num" is the number of cells in the neighborhood that are on in the last
  // generation *not including the current cell*.
  //
  // Classical rule: birth if n=3, survive if n=2|3. Also known as 23/3
  this.birthOrSurvive = function(alive, num) {
    if (!alive && num == 3)
      return true;

    if (alive && (num == 2 || num == 3))
      return true;

    return false;
  };

  // The row step function keeps track of a neighborhood by going through
  // trailing and leading edge calculations. So the trailing edge will be
  // subtracted, and the leading edge added, for each new cell.
  this.stepRow = function() {
    this.changed = false;
    var nbuf = new ArrayBuffer(this.width * this.height);
    var nbufa = new Uint8Array(nbuf, 0);
    for (var j = this.y; j < this.y + this.height; ++j) {
      var trailingEdge = this.neighborhoodTrailingEdge(this.x, j);
      var leadingEdge = this.neighborhoodLeadingEdge(this.x, j);
      var range = Math.floor(leadingEdge.length/2);
      var nset = this.countNeighborhood(j-range, trailingEdge, leadingEdge);
      for (var i = this.x; i < this.x + this.width; ++i) {
      	var cc = j * this.width + i;
        var alive = this.bufa[cc];
        if (this.birthOrSurvive(alive, alive ? nset-1 : nset)) {
          nbufa[cc] = 1;
          if (!alive)
            this.changed = true;
        }
        // else die, which is to not set at all
        
        this.incEdge(leadingEdge);
        nset = this.incNeighborhood(nset, j-range, trailingEdge, leadingEdge);
        this.incEdge(trailingEdge);
      }
    }

    if (this.changed) {
      console.log('changed!');
      // Copy the new generation over the old one.
      this.buf = nbuf;
      this.bufa = new Uint8Array(this.buf, 0);
    }
  };
  
  this.incEdge = function(arr) {
    for (var i = 0; i < arr.length; ++i)
      arr[i]++;
  };

  // Count all set sells in the neighborhood (between the trailing edge
  // and leading edge, inclusive).
  this.countNeighborhood = function(offsetY, trailingEdge, leadingEdge) {
    var c = 0;
    for (var j = 0; j < trailingEdge.length; ++j) {
      for (var i = trailingEdge[j]; i <= leadingEdge[j]; ++i) {
        c += this.get(i, offsetY + j);
      }
    }
    return c;
  };

  // Takes in the neighborhood count and a y offset. Subtracts all the
  // elements in the trailingEdge set. Adds the elements in the leadingEdge set.
  // used to maintain a running count of cells set in a neighborhood.
  this.incNeighborhood = function(nset, offsetY, trailingEdge, leadingEdge) {
    for (var j = 0; j < trailingEdge.length; ++j) {
      if (trailingEdge[j] > leadingEdge[j]) continue;
      if (trailingEdge[j] >= 0 && trailingEdge[j] < this.width &&
          offsetY + j >= 0 && offsetY + j < this.height) {
        var cc = (offsetY + j) * this.width + trailingEdge[j];
        nset -= this.bufa[cc];
      }
      if (leadingEdge[j] >= 0 && leadingEdge[j] < this.width &&
          offsetY + j >= 0 && offsetY + j < this.height) {
        var cc = (offsetY + j) * this.width + leadingEdge[j];
        nset += this.bufa[cc];
      }
    }
    return nset;
  };

  // These two functions should be all you need to change to get new neighborhoods.
  // They should return the trailing edge and the leading edge of the neighborhood
  // surrounding a point at x,y.
  this.neighborhoodTrailingEdge = function(x, y) {
    var seed = this.neighborhoodFunction();
    var arr = new Array(seed.length);
    for (var i = 0; i < arr.length; ++i)
      arr[i] = -seed[i] + x;
    return arr;
  };

  this.neighborhoodLeadingEdge = function(x, y) {
    var seed = this.neighborhoodFunction();
    var arr = new Array(seed.length);
    for (var i = 0; i < arr.length; ++i)
      arr[i] = seed[i] + x;
    return arr;
  };


  // Step the CA forward. Uses simple 3x3 neighborhood() function.
  this.step = function() {
    this.changed = false;
    var nbuf = new ArrayBuffer(this.width * this.height);
    var nbufa = new Uint8Array(nbuf, 0);
    for (var j = this.y; j < this.y + this.height; ++j) {
      for (var i = this.x; i < this.x + this.width; ++i) {
        var cc = j * this.width + i;
        var nset = this.neighborhood(i, j);
        var alive = this.bufa[cc];
        if (this.birthOrSurvive(alive, nset)) {
          nbufa[cc] = 1;
          if (!alive)
            this.changed = true;
        }
        // else die, which is to not set at all.
      }
    }

    if (this.changed) {
      console.log('changed!');
      // Copy the new generation over the old one.
      this.buf = nbuf;
      this.bufa = new Uint8Array(this.buf, 0);
    }
  };

  // Count set cells in the neighborhood of (x,y).
  // If the cell is set, it will be included in the count.
  // (Simple 3x3 neighborhood.)
  this.neighborhood = function(x,y) {
    var c = 0;
    for (var j = y-1; j <= y+1; ++j) {
      for (var i = x-1; i <= x+1; ++i) {
        c += this.get(i, j);
      }
    }
    return c;
  };

  // Get the value at (x, y). Any off-grid values will return 0.
  this.get = function(x, y) {
    var cc = this.translate(x, y);
    if (cc === -1)
      return 0;

    return this.bufa[cc];
  };

  // Set the cell at (x, y) to on.
  this.set = function(x,y) {
    this.setOnOff(x, y, true);
  };

  // Set the cell at (x, y) off.
  this.unset = function(x, y) {
    this.setOnOff(x, y, false);
  };

  // Set the cell at (x,y). If onOff is true,
  // sets the value. If it is false, unset it.
  this.setOnOff = function(x, y, onOff) {
    var cc = this.translate(x, y);
    if (cc === -1)
      return;

    if (onOff)
      this.bufa[cc] = 1;
    else
      this.bufa[cc] = 0;
  };

  // Translate x,y coordinates to offset/bit offset
  // coordinates in the ArrayBuffer. The third return
  // value is a 0 if the coordinates are off-grid, 1 if
  // they are on-grid.
  this.translate = function(x, y) {
    var fx = x - this.x;
    var fy = y - this.y;
    if (fx < 0 || fy < 0 || fx >= this.width || fy >= this.height)
      return -1;

    return fy * this.width + fx;
  };

  this.getX = function() { return this.x; }
  this.getY = function() { return this.y; }
  this.getWidth = function() { return this.width; }
  this.getHeight = function() { return this.height; }

};

