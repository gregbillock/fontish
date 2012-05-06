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

  // Step the CA forward.
  this.step = function() {
    var nbuf = new ArrayBuffer(this.height * this.width/8);
    var nbufa = new Uint8Array(nbuf, 0);
    for (var i = 0; i < this.bufx; ++i) {
      for (var j = 0; j < this.bufy; ++j) {
        for (var k = 0; k < 8; ++k) {
          var c = Math.floor(j * this.width/8 + i/8);
          var o = 7 - (i % 8);
          var nset = this.neighborhood(i, j, k);
          var alive = this.bufa[c] & (1 << o);
          if (this.birthOrSurvive(alive, nset)) {
            nbufa[c] = nbufa[c] | (1 << o);
          }
          // else die, which is to not set at all.
        }
      }
    }

    // Copy the new generation over the old one.
    this.buf = nbuf;
    this.bufa = new Uint8Array(this.buf, 0);
  };

  // Classical rule: birth if n=3, survive if n=2|3.
  this.birthOrSurvive = function(alive, num) {
    if (!alive && num == 3)
      return true;

    if (alive && (num == 2 || num == 3))
      return true;

    return false;
  };

  // Get the value at (x, y).
  this.get = function(x, y) {
    var cc = this.translate(x, y);
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
  };

  // Set the cell at (x, y) off.
  this.unset = function(x, y) {
    this.setOnOff(x, y, false);
  };

  // Set the cell at (x,y). If onOff is true,
  // sets the value. If it is false, unset it.
  this.setOnOff = function(x, y, onOff) {
    var cc = this.translate(x, y);
    var c = cc[0];
    var o = cc[1];

    if (onOff)
      this.bufa[c] = this.bufa[c] | (1 << o);
    else
      this.bufa[c] = this.bufa[c] & ~(1 << o);
  };

  // Translate x,y coordinates to offset/bit offset
  // coordinates in the ArrayBuffer.
  this.translate = function(x, y) {
    var fx = x - this.x;
    var fy = y - this.y;
    if (fx < 0 || fy < 0 || fx >= width || fy >= height) {
      throw "Out of bounds: (" + x + ", " + y + ")";
    }

    var c = Math.floor(fy * this.bufx + fx/8);
    var o = 7 - (fx % 8);
    return [c, o];
  };
};

