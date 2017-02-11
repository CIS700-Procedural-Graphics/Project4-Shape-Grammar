const THREE = require('three');
const _ = require('lodash');

export default class Shape {
  constructor(shape, parent) {
    this.parent = parent;
    this.symbol = shape.symbol;
    this.geometry = shape.geometry;
    this.position = shape.position;
    this.scale = shape.scale;
    this.color = shape.color;
    this.terminal = shape.terminal || false;
  }

  set(prop, value) {
    this[prop] = value;
  }
};

var STBuilding = new Shape({
  symbol: 'B',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  position: function () {
    var position = this.worldPosition.clone();
    position.add(new THREE.Vector3(0, 0, 0));

    return position;
  },
  scale: function () {
    var rand = THREE.Math.randInt(-2, 2);
    var scale = new THREE.Vector3(5, 5, 4 + (30 * this.worldDensity) + rand);

    return scale;
  },
  color: 0x0000ff
});

var STSlice = new Shape({
  symbol: 'S',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  position: function () {
    var position = this.worldPosition.clone();

    position.add(new THREE.Vector3(0, 0, 0));

    return position;
  },
  scale: new THREE.Vector3(5, 5, 4),
  color: 0x0000ff
});

var STBase = new Shape(STSlice);
STBase.scale = function () {
  var parentScaleZ = this.parent.scale().z;
  var scale = new THREE.Vector3(5, 5, parentScaleZ * 0.25);

  return scale;
};
STBase.color = 0xff0000;

var STMid = new Shape(STSlice);
STMid.position = function () {
  var parentScaleZ = this.parent.scale().z;
  var position = this.worldPosition.clone();

  position.add(new THREE.Vector3(0, 0, parentScaleZ * 0.25));

  return position;
};
STMid.scale = function () {
  var parentScaleZ = this.parent.scale().z;
  var scale = new THREE.Vector3(5, 5, parentScaleZ * 0.5);

  return scale;
};
STMid.color = 0x00ff00;

var STTop = new Shape(STSlice);
STTop.position = function () {
  var parentScaleZ = this.parent.scale().z;
  var position = this.worldPosition.clone();

  position.add(new THREE.Vector3(0, 0, parentScaleZ * 0.75));

  return position;
};
STTop.scale = function () {
  var parentScaleZ = this.parent.scale().z;
  var scale = new THREE.Vector3(5, 5, parentScaleZ * 0.25);

  return scale;
};

export function ShapeType() {
  return {
    Building: STBuilding,
    Base: STBase,
    Mid: STMid,
    Top: STTop
  }
};