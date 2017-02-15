const THREE = require('three')

const PI = Math.PI;

export default class Drawer {
    constructor(scene) {
      this.scene = scene;
      this.renderGrammar = {
        'H' : this.makeObject.bind(this)
      };
    }

    makeGeometry(type) {
      let geometry;
      switch (type) {
        case 'plane':
          return new THREE.PlaneGeometry(1, 1);
        case 'cylinder':
          return new THREE.CylinderGeometry(1, 1, 1);
        case 'box':
          geometry = new THREE.BoxGeometry(1, 1, 1);
          geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
          return geometry;
        case 'pyramid':
          geometry = new THREE.Geometry();
          geometry.vertices = [
            new THREE.Vector3( -0.5, 0.5, -0.5 ),
            new THREE.Vector3( 0, 1, 0 ),
            new THREE.Vector3( 0.5, 0.5, -0.5 ),
            new THREE.Vector3( -0.5, 0.5, 0.5 ),
            new THREE.Vector3( 0.5, 0.5, 0.5 )
          ];
          geometry.faces = [
            new THREE.Face3( 0, 1, 2 ),
            new THREE.Face3( 0, 2, 3 ),
            new THREE.Face3( 1, 3, 4 ),
            new THREE.Face3( 2, 1, 4 ),
            new THREE.Face3( 3, 2, 4 ),
            new THREE.Face3( 0, 1, 3 )
          ];
          return geometry;
        case 'trapezoid':
          geometry = new THREE.Geometry();
          geometry.vertices = [
            new THREE.Vector3( -0.5, 0.5, -0.5 ),
            new THREE.Vector3( -0.25, 0.9, -0.25 ),
            new THREE.Vector3( -0.5, 0.5, 0.5 ),
            new THREE.Vector3( -0.25, 0.9, 0.25 ),
            new THREE.Vector3( 0.5, 0.5, -0.5 ),
            new THREE.Vector3( 0.25, 0.9, -0.25 ),
            new THREE.Vector3( 0.5, 0.5, 0.5 ),
            new THREE.Vector3( 0.25, 0.9, 0.25 ),
          ];
          geometry.faces = [
            new THREE.Face3( 0, 1, 5 ),
            new THREE.Face3( 0, 5, 4 ),
            new THREE.Face3( 4, 5, 7 ),
            new THREE.Face3( 4, 7, 6 ),
            new THREE.Face3( 6, 7, 3 ),
            new THREE.Face3( 6, 3, 2 ),
            new THREE.Face3( 2, 3, 1 ),
            new THREE.Face3( 2, 1, 0 ),
            new THREE.Face3( 1, 7, 5 ),
            new THREE.Face3( 1, 3, 7 )
          ];
          return geometry;
      }
    }

    makeObject(symbol) {
      let { char, shape: {type, pos, size, rot, color} } = symbol;
      let convertedColor = Drawer._getColor(color);

      let geometry = this.makeGeometry(type);
      let material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide, color: convertedColor});
      let obj = new THREE.Mesh(geometry, material);
      this.scene.add(obj);

      // apply size
      let scaleMat = new THREE.Matrix4();
      scaleMat.makeScale(size.x, size.y, size.z);
      obj.applyMatrix(scaleMat);

      // apply rotation
      let euler = new THREE.Euler(rot.x * PI/180, rot.y * PI/180, rot.z * PI/180);
      let rotateMatrix = new THREE.Matrix4();
      rotateMatrix.makeRotationFromEuler(euler);
      obj.applyMatrix(rotateMatrix);

      // apply translation
      let transMat = new THREE.Matrix4();
      transMat.makeTranslation(pos.x, pos.y, pos.z);
      obj.applyMatrix(transMat);
    }

    static _getColor(color) {
      return (color.r << 16) + (color.g << 8) + color.b;
    }

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(symbols) {
      symbols.forEach(this.makeObject.bind(this));
    }
}
