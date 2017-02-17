const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

export default {
  symbol: 'Antenna',
  geometry: function () {
    var geometry = new THREE.CylinderGeometry(1, 1, 1, 32);

    geometry.rotateX(Math.PI / 2);

    return geometry;
  },
  position: function () {
    var position = this.parent.position();

    position.x += THREE.Math.randInt(-0.5, 0.5);
    position.y += THREE.Math.randInt(-1, 1);

    return position.clone();
  },
  scale: function () {
    var rand = THREE.Math.randInt(2, 4);
    var scale = new THREE.Vector3(0.1, 0.1, rand);

    return scale.clone();
  },
  color: COLOR.ANTENNA,
  terminal: true,
  removable: false,
  successors: function() {
    return [];
  }
};