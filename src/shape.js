export default class Shape {
  constructor(shape, parent) {
    this.id = (0|Math.random()*9e6).toString(36);
    this.parent = parent;
    this.symbol = shape.symbol;
    this.geometry = shape.geometry;
    this.position = shape.position;
    this.scale = shape.scale;
    this.color = shape.color;
    this.terminal = shape.terminal || false;
    this.removable = typeof shape.removable == 'undefined' ? true : shape.removable;
    this.computed = {};
    this.successors = shape.successors;
    this.wireframe == shape.wireframe || false;
  }

  set(prop, value) {
    this[prop] = value;
  }

  recompute() {
    this.computed = {};
  }
};