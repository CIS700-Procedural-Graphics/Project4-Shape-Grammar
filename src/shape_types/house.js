const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

import STDoor from './door.js'
import STRoof from './roof.js'

export default {
  symbol: 'House',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  color: COLOR.HOUSE,
  removable: false,
  position: function () {
    var position = this.parent.position();
    var delta = 1

    position.y += delta;

    return position.clone();
  },
  scale: function () {
    var buildingHeight = this.parent.scale().z;
    var houseHeight = buildingHeight * 0.8;
    var scale = new THREE.Vector3(5, 3, houseHeight);

    return scale.clone();
  },
  successors: function () {
    var door = new Shape(STDoor, this);
    var roof = new Shape(STRoof, this);

    door.terminal = true;

    return [ door, roof ];
  }
};