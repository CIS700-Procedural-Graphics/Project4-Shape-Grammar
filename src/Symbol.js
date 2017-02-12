export class Shape {
  constructor(geometry, pos, scale) {
    this.geometry = geometry;
    this.pos = pos;
    this.scale = scale;
  }

  copy() {
    let newShape = new Shape(this.geometry, this.pos, this.scale);
    return newShape;
  }
}

export class Symbol {
  constructor(symbol, shape, next) {
    this.symbol = symbol;
    this.shape = shape;
    this.next = next;
  }

  copy() {
    let newSymbol = new Symbol(this.symbol, this.shape.copy(), this.scale);
    return newSymbol;
  }

  successors() {
  }
}
