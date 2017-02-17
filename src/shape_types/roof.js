const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

import STChimney from './chimney.js'

export default {
  symbol: 'Roof',
  geometry: function () {
    var shape = new THREE.Shape();

    var vertices = [
      new THREE.Vector2(-0.5, 0), new THREE.Vector2(0, 0.5), new THREE.Vector2(0.5, 0)
    ];

    shape.fromPoints(vertices);

    var geometry = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      amount: 1,
      bevelEnabled: false
    });

    geometry.rotateX(Math.PI / 2);

    return geometry;
  },
  color: COLOR.ROOF,
  removable: false,
  position: function () {
    var position = this.parent.position();
    var scale = this.parent.scale();

    position.y += 1.8;
    position.z += scale.z;
    position.z -= 3;

    return position.clone();
  },
  scale: function () {
    var scale = new THREE.Vector3(1, 1, 1);

    scale.x = 7;
    scale.y = 4;
    scale.z = 5;

    return scale.clone();
  },
  successors: function () {
    var chimney = new Shape(STChimney, this);

    return [ chimney ];
  }
};