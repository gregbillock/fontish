// Create a new Life CA grid in principle embedded within a larger
// grid. Coordinates of the top-left corner are (x,y),
// and the grid has the given width and height.
var Life = function(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;

  this.bufx = Math.ceil(width/8);
  this.bufy = height;
  this.buf = new ArrayBuffer(this.bufx * this.bufy);

  this.bufa = new Uint8Array(this.buf, 0);

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
    var nbuf = new ArrayBuffer(this.bufx * this.bufy);
    var nbufa = new Uint8Array(nbuf, 0);
    for (var j = this.y; j < this.y + this.height; ++j) {
      var trailingEdge = this.neighborhoodTrailingEdge(this.x, j);
      var leadingEdge = this.neighborhoodLeadingEdge(this.x, j);
      var range = Math.floor(leadingEdge.length/2);
      var nset = this.countNeighborhood(j-range, trailingEdge, leadingEdge);
      for (var i = this.x; i < this.x + this.width; ++i) {
        var c = Math.floor(j * this.bufx + i/8);
        var o = 7 - (i % 8);
        var alive = this.bufa[c] & (1 << o);
        if (this.birthOrSurvive(alive, alive ? nset-1 : nset)) {
          nbufa[c] = nbufa[c] | (1 << o);
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
      nset -= this.get(trailingEdge[j], offsetY + j);
      nset += this.get(leadingEdge[j], offsetY + j);
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
    var nbuf = new ArrayBuffer(this.bufx * this.bufy);
    var nbufa = new Uint8Array(nbuf, 0);
    for (var j = this.y; j < this.y + this.height; ++j) {
      for (var i = this.x; i < this.x + this.width; ++i) {
        var c = Math.floor(j * this.bufx + i/8);
        var o = 7 - (i % 8);
        var nset = this.neighborhood(i, j);
        var alive = this.bufa[c] & (1 << o);
        if (this.birthOrSurvive(alive, nset)) {
          nbufa[c] = nbufa[c] | (1 << o);
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
    if (cc[2] === 0)
      return 0;

    var c = cc[0];
    var o = cc[1];
    if (this.bufa[c] & (1 << o))
      return 1;
    else
      return 0;
  };

  // Set the cell at (x, y) to on.
  this.set = function(x,y) {
    this.setOnOff(x, y, true);
    console.log('Set ' + x + ',' + y);
  };

  // Set the cell at (x, y) off.
  this.unset = function(x, y) {
    this.setOnOff(x, y, false);
    console.log('Unset ' + x + "," + y);
  };

  // Set the cell at (x,y). If onOff is true,
  // sets the value. If it is false, unset it.
  this.setOnOff = function(x, y, onOff) {
    var cc = this.translate(x, y);
    var c = cc[0];
    var o = cc[1];
    if (cc[2] === 0)
      return;

    if (onOff)
      this.bufa[c] = this.bufa[c] | (1 << o);
    else
      this.bufa[c] = this.bufa[c] & ~(1 << o);
  };

  // Translate x,y coordinates to offset/bit offset
  // coordinates in the ArrayBuffer. The third return
  // value is a 0 if the coordinates are off-grid, 1 if
  // they are on-grid.
  this.translate = function(x, y) {
    var fx = x - this.x;
    var fy = y - this.y;
    if (fx < 0 || fy < 0 || fx >= width || fy >= height)
      return [0,0,0];

    var c = Math.floor(fy * this.bufx + fx/8);
    var o = 7 - (fx % 8);
    return [c, o, 1];
  };

  this.getX = function() { return this.x; }
  this.getY = function() { return this.y; }
  this.getWidth = function() { return this.width; }
  this.getHeight = function() { return this.height; }


  // Experimental -- see about calculating byte-at-a-time.
  this.step8 = function() {
    this.changed = false;
    var nbuf = new ArrayBuffer(this.bufx * this.bufy);
    var nbufa = new Uint8Array(nbuf, 0);
    for (var j = 0; j < this.bufy; ++j) {
      for (var i = 0; i < this.bufx; ++i) {
        var n = this.neighborhood8(i, j);
        var nn = this.birthOrSurvive8(this.bufa[j*this.bufx + i], n);
        if (n != nn) {
          nbufa[j*this.bufx + i] = nn;
          this.changed = true;
        } else {
          nbufa[j*this.bufx + i] = n;
        }
      }
    }

    if (this.changed) {
      console.log('changed!');
      // Copy the new generation over the old one.
      this.buf = nbuf;
      this.bufa = new Uint8Array(this.buf, 0);
    }
  };

  // Experimental -- see about calculating byte-at-a-time.
  this.neighborhood8 = function(x,y) {
    var nn = new ArrayBuffer(3);
    var nna = new Uint8Array(nn, 0);
    if (x>0) {
      if (y>0)
        nna[0] = this.bufa[x-1 + (y-1)*this.bufx];
      nna[1] = this.bufa[x-1 + y*this.bufx];
      if (y<this.bufy)
        nna[2] = this.bufa[x-1 + (y+1)*this.bufx];
    }
  };

  // Counts the last n bits set in the byte.
  this.countLast = function(byte, n) {
    // This should really be a table lookup...
    var c = 0;
    for (var i = 0; i <=n; ++i) {
      c += (byte & 1);
      byte = byte >> 1;
    }
    return c;
  };
 
  // Counts the first n bits set in the byte.
  this.countFirst = function(byte, n) {
    // This should really be a table lookup...
    // This is a zero-fill right shift...
    byte = byte >>> (8-n);
    var c = 0;
    for (var i = 0; i <=n; ++i) {
      c += (byte & 1);
      byte = byte >> 1;
    }
    return c;
  };

};

