const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

export default {
  symbol: 'GarageDoor',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  color: COLOR.GARAGEDOOR,
  position: function () {
    var position = this.parent.position();

    position.add(new THREE.Vector3(0, -2.5, 0));

    return position.clone();
  },
  scale: function () {
    var scale = new THREE.Vector3(2, 0.1, 1.5);

    return scale.clone();
  },
  successors: function () {
    return [];
  }
};