const THREE = require('three');
const _ = require('lodash');

import Shape, { ShapeType } from './shapeTypes.js'
const ST = ShapeType();

export default class ShapeGrammar {
  constructor(scene, axiom, grammar, iterations) {
    this.axiom = axiom || this.createAxiom();
    this.grammar = grammar || {};
    this.shapes = null;
    this.iterations = iterations || 1;
    this.scene = scene;
  }

  createAxiom() {
    var axiom = [];

    axiom.push(ST.Building);

    return axiom;
  }

  setState(state) {
    this.state = {
      worldPosition: state.pos,
      worldDensity: state.density
    };
  }

  applyState(shapes) {
    for (var i = 0; i < shapes.length; i++) {
      var shape = shapes[i];
      var worldPosition = this.state.worldPosition;
      var worldDensity = this.state.worldDensity;

      shape.set('worldPosition', worldPosition);
      shape.set('worldDensity', worldDensity);
    }
  }

  getSuccessors(shape) {
    var successors = [];
    var symbol = shape.symbol;

    switch (symbol) {
      case 'B':

        var base = new Shape(ST.Base, shape);
        var mid = new Shape(ST.Mid, shape);
        var top = new Shape(ST.Top, shape);

        successors.push(base, mid, top);
    }

    return successors;
  }

  doIterations() {
    var shapes = this.axiom;

    this.applyState(shapes);

    for (var i = 0; i < this.iterations; i++) {
      var successors = [];

      for (var j = 0; j < shapes.length; j++) {
        var shape = shapes[j];

        if (!shape.terminal) {
          Array.prototype.push.apply(successors, this.getSuccessors(shape));
        }
      }

      this.applyState(successors);

      shapes = successors;
    }

    this.shapes = shapes;
  }

  render() {
    this.doIterations();

    for (var i = 0; i < this.shapes.length; i++) {
      var shape = this.shapes[i];
      var geometry = shape.geometry;
      var scale = (typeof shape.scale === 'function') ? shape.scale() : shape.scale;
      var position = (typeof shape.position === 'function') ? shape.position() : shape.position;
      var color = shape.color;

      var material = new THREE.MeshBasicMaterial({ color: color });
      var mesh = new THREE.Mesh(geometry, material);

      this.scene.add(mesh);

      mesh.name = 'building';
      mesh.scale.set(scale.x, scale.y, scale.z);

      mesh.translateX(position.x);
      mesh.translateY(position.y);
      mesh.translateZ(position.z);
      mesh.translateZ(mesh.scale.z / 2);
    }
  }
};