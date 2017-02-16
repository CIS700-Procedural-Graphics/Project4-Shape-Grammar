// class used to render pieces of geometry according to rules
const THREE = require('three');

export default class RenderEngine {
  constructor(scene) {
    this.scene = scene;
  }

  init_scene() {
    // initialize ground
    var ground = new THREE.PlaneGeometry(10, 20);
    var ground_material = new THREE.MeshLambertMaterial({color: '#4A7023', side: THREE.DoubleSide});
    var ground_mesh = new THREE.Mesh(ground, ground_material);
    ground_mesh.rotateX(90 * Math.PI / 180);
    this.scene.add(ground_mesh);

    // initialize sky
    var background_loader = new THREE.TextureLoader();
    var background = new THREE.TextureLoader().load('sky.png');
    this.scene.background = background;
  }

  build_scene(shape_list) {
    for (var i = 0; i < shape_list.length; i++) {
      var shape_node = shape_list[i];
      var mesh = shape_node.geometry;
      var posY = 0.1 * shape_node.scale.y / 2.0;
      mesh.position.set(shape_node.position.x, posY, shape_node.position.z);
      this.scene.add(mesh);
    }
  }

  reset_scene() {
    var obj;
    for( var i = this.scene.children.length - 1; i >=0; i--) {
      obj = this.scene.children[i];
      this.scene.remove(obj);
    }
  }
}