const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

import STBase from './base.js'
import STDoubleDoor from './doubledoor.js'

export default {
  symbol: 'Base',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  color: COLOR.CEMENT,
  removable: false,
  position: function () {
    var position = this.parent.position();

    return position.clone();
  },
  scale: function () {
    var buildingHeight = this.parent.scale().z;
    var baseHeight = buildingHeight * 0.15;
    var scale = new THREE.Vector3(5, 5, baseHeight);

    return scale.clone();
  },
  successors: function () {
    var doubleDoor = new Shape(STDoubleDoor, this);

    doubleDoor.terminal = true;

    return [ doubleDoor ];
  }
};