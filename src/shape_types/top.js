const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

import STRoof from './roof.js'
import STSilo from './silo.js'


export default {
  symbol: 'Top',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  color: COLOR.CEMENT,
  removable: true,
  position: function () {
    var position = this.parent.position();
    var buildingHeight = this.parent.scale().z;
    var baseMidHeight = buildingHeight * 0.85;

    position.add(new THREE.Vector3(0, 0, baseMidHeight));

    return position.clone();
  },
  scale: function () {
    var buildingHeight = this.parent.scale().z;
    var topHeight = buildingHeight * 0.15;
    var scale = new THREE.Vector3(5, 5, topHeight);

    return scale.clone();
  },
  successors: function () {
    var silo = new Shape(STSilo, this);

    return [ silo ];
  }
};