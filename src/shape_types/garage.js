const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

import STGarageDoor from './garagedoor.js'

export default {
  symbol: 'Garage',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  color: COLOR.GARAGE,
  removable: false,
  position: function () {

    if (this.computed.position) {
      return this.computed.position.clone();
    }

    var position = this.parent.position();
    var rand = THREE.Math.randInt(0, 1);
    var delta = rand ? 1 : -1;

    position.x += delta;
    this.computed.position = position;

    return position.clone();
  },
  scale: function () {
    var buildingHeight = this.parent.scale().z;
    var garageHeight = THREE.Math.clamp(buildingHeight * 0.5, 2, 4);
    var scale = new THREE.Vector3(3, 5, garageHeight);

    return scale.clone();
  },
  successors: function () {
    var garageDoor = new Shape(STGarageDoor, this);

    garageDoor.terminal = true;

    return [ garageDoor ];
  }
};