const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

import STAntenna from './antenna.js'

export default {
  symbol: 'Silo',
  geometry: function () {
    var rand = THREE.Math.randInt(4, 8);
    var geometry = new THREE.CylinderGeometry(1, 1, 1, rand);

    geometry.rotateX(Math.PI / 2);

    return geometry;
  },
  color: COLOR.SILO,
  removable: false,
  position: function () {
    var position = this.parent.position();

    return position.clone();
  },
  scale: function () {
    var scale = this.parent.scale();
    var rand = THREE.Math.randFloat(1, 3);

    scale.z = rand;

    return scale.multiply(new THREE.Vector3(0.5, 0.5, 1)).clone();
  },
  successors: function () {
    var successors = [];

    if (THREE.Math.randFloat(0, 1) > 0.5) {
      var antenna = new Shape(STAntenna, this);
      successors.push(antenna);
    }

    return successors;
  }
};