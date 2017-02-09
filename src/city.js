const THREE = require('three');
const _ = require('lodash');

export default class City {
  constructor(scene) {
    this.scene = scene;

    this.baseX = 100;
    this.baseY = 100;
    this.base = null;

    this.numNodes = 8;
    this.numInnerNodes = 2;
    this.numBorderNodes = this.numNodes - this.numInnerNodes;
    this.innerNodes = [];
    this.borderNodes = [];

    this.numPaths = 8;
  }

  renderBase() {
    var geometry = new THREE.PlaneGeometry(this.baseX, this.baseY, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ffe0, side: THREE.DoubleSide });
    var mesh = new THREE.Mesh(geometry, material);

    this.scene.add(mesh);
    this.base = geometry;
  }

  renderNodes() {
    var geometry = new THREE.Geometry();

    for (var i = 0; i < this.numBorderNodes; i++) {
      var node = new THREE.Vector3();
      var rand = THREE.Math.randInt(0, 3);

      var minX = this.baseX / -2;
      var maxX = this.baseX / 2;
      var minY = this.baseY / -2;
      var maxY = this.baseY / 2;

      switch (rand) {
        case 0:
          node.x = minX;
          node.y = THREE.Math.randFloatSpread(this.baseY);
          break;
        case 1:
          node.x = maxX;
          node.y = THREE.Math.randFloatSpread(this.baseY);
          break;
        case 2:
          node.x = THREE.Math.randFloatSpread(this.baseX);
          node.y = minY;
          break;
        case 3:
          node.x = THREE.Math.randFloatSpread(this.baseX);
          node.y = maxY;
          break;
        default:
          break;
      }

      geometry.vertices.push(node);
      this.borderNodes.push(node);
    }

    for (var i = 0; i < this.numInnerNodes; i++) {
      var node = new THREE.Vector3();
      node.x = THREE.Math.randFloatSpread(this.baseX);
      node.y = THREE.Math.randFloatSpread(this.baseY);

      geometry.vertices.push(node);
      this.innerNodes.push(node);
    }

    var material = new THREE.PointsMaterial({ color: 0x000000 });
    var mesh = new THREE.Points(geometry, material);

    this.scene.add(mesh);
  }

  renderEdges() {
    for (var i = 0; i < this.numPaths; i++) {
      var randA = THREE.Math.randInt(0, this.numBorderNodes - 1);
      var randB = (randA + 1) % this.numBorderNodes;

      var borderNodeA = this.borderNodes[randA];
      var borderNodeB = this.borderNodes[randB];

      this.renderPath(borderNodeA, borderNodeB);
    }
  }

  renderPath(nodeA, nodeB) {
    var normAB = nodeA.distanceTo(nodeB);
    var norm = Infinity;
    var next = null;

    for (var i = 0; i < this.numInnerNodes; i++) {
      var innerNode = this.innerNodes[i];
      var normA = nodeA.distanceTo(innerNode);
      var normB = nodeB.distanceTo(innerNode);

      if (normA === 0 || normB === 0) { continue; }

      var newNorm = normA + normB;

      if (newNorm < norm) {
        norm = newNorm;
        next = innerNode;
      }
    }

    var normB = nodeB.distanceTo(next);

    if (normAB < normB) {
      this.renderEdge(nodeA, nodeB);
    } else {
      this.renderEdge(nodeA, next);
      this.renderPath(next, nodeB);
    }
  }

  renderEdge(nodeA, nodeB) {
    var geometry = new THREE.Geometry();

    geometry.vertices.push(nodeA, nodeB);

    var material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    var mesh = new THREE.Line(geometry, material);

    this.scene.add(mesh);
  }
};