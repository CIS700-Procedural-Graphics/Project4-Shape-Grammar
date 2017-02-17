const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

export default {
  symbol: 'Door',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  color: COLOR.DOOR,
  position: function () {
    var position = this.parent.position();
    var rand = THREE.Math.randInt(0, 1);
    var x = rand ? -1.6 : 1.6;

    position.add(new THREE.Vector3(x, 1.6, 0));

    return position.clone();
  },
  scale: function () {
    var scale = new THREE.Vector3(0.5, 0.1, 1);

    return scale.clone();
  },
  successors: function () {
    return [];
  }
};