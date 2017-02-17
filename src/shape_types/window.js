const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

export default {
  symbol: 'Window',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  color: function () {
    return THREE.Math.randInt(0, 3) ? COLOR.WINDOW_OFF : COLOR.WINDOW_ON;
  },
  position: function () {
    var id = this.id;
    var side = this.parent.side;
    var position = this.parent.position();
    var floors = this.parent.floors;
    var midHeight = this.parent.scale().z;
    var floorHeight = midHeight / floors;

    var x = [ -2, -1, 0, 1, 2 ];
    var z = (floorHeight - 0.8) / -2;
    var windowPosition = new THREE.Vector3(x[id], -0.1, z);

    windowPosition.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI * (side / 2));

    position.add(windowPosition);

    return position.clone();
  },
  scale: function () {
    var scale = this.parent.scale();
    var side = this.parent.side;

    if (side % 2 == 0) {
      scale.x = 0.8;
    } else {
      scale.y = 0.8;
    }

    scale.z = 0.8;

    return scale.clone();
  },
  terminal: true,
  successors: function () {
    return [];
  }
};