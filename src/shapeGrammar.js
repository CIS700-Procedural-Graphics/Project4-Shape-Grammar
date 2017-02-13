const THREE = require('three');
const _ = require('lodash');

import Shape, { ShapeType } from './shapeTypes.js'
const ST = ShapeType();

export default class ShapeGrammar {
  constructor(scene, axiom, grammar, iterations) {
    this.axiom = axiom || this.createAxiom();
    this.grammar = grammar || {};
    this.shapes = null;
    this.iterations = iterations || 3;
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

      shape.recompute();
      shape.set('worldPosition', worldPosition);
      shape.set('worldDensity', worldDensity);
    }
  }

  doIterations() {
    var shapes = this.axiom;

    this.applyState(shapes);

    for (var i = 0; i < this.iterations; i++) {
      var successors = [];

      for (var j = 0; j < shapes.length; j++) {
        var shape = shapes[j];

        if (!shape.terminal) {
          Array.prototype.push.apply(successors, shape.successors());
        } else {
          successors.push(shape);
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
      var geometry = (typeof shape.geometry == 'function') ? shape.geometry() : shape.geometry;
      var scale = shape.scale();
      var position = shape.position();
      var color = (typeof shape.color == 'function') ? shape.color() : shape.color;
      var wireframe = shape.wireframe;

      var material = new THREE.MeshLambertMaterial({ color: color });
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