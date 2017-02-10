const THREE = require('three');
const _ = require('lodash');

export class Shape {
  constructor(shape) {
    this.symbol = shape.symbol;
    this.geometry = shape.geometry;
    this.position = shape.position;
    this.scale = shape.scale;
    this.terminal = shape.terminal || false;
    this.deleted = shape.deleted || false;
  }
};

export default class ShapeGrammar {
  constructor(scene, axiom, grammar, iterations) {
    this.axiom = axiom || this.createAxiom();
    this.grammar = grammar || {};
    this.shapes = null;
    this.iterations = iterations || 0;
    this.scene = scene;
  }

  createAxiom() {
    var axiom = [];
    var shapeA = new Shape({
      symbol: 'B',
      geometry: new THREE.BoxGeometry(1, 1, 1),
      position: new THREE.Vector3(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 4)
    });

    axiom.push(shapeA);

    return axiom;
  }

  setState(state) {
    this.state = {
      worldPosition: state.pos
    };
  }

  getSuccessors(shape) {
    var successors = [];

    return successors;
  }

  doIterations() {
    var shapes = this.axiom;

    for (var i = 0; i < this.iterations; i++) {
      for (var j = 0; j < shapes.length; j++) {
        var shape = shapes[j];

        if (!shape.terminal && !shape.deleted) {
          var successors = this.getSuccessors(shape);

          Array.prototype.push.apply(shapes, successors);
          shapes.deleted = true;
        }
      }
    }

    this.shapes = shapes;
  }

  render() {
    this.doIterations();

    for (var i = 0; i < this.shapes.length; i++) {
      var shape = this.shapes[i];
      var geometry = shape.geometry;
      var scale = shape.scale;
      var position = shape.position;
      var worldPosition = this.state.worldPosition;

      var material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
      var mesh = new THREE.Mesh(geometry, material);

      this.scene.add(mesh);

      mesh.scale.set(scale.x, scale.y, scale.z);
      mesh.translateX(worldPosition.x);
      mesh.translateY(worldPosition.y);
      mesh.translateZ(scale.z / 2);
    }
  }
};