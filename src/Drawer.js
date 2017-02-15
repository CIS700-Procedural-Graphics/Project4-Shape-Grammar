const THREE = require('three')

const PI = Math.PI;

export default class Drawer {
    constructor(scene, meshes) {
      this.scene = scene;
      this.meshes = meshes;
      this.renderGrammar = {
        'H' : this.renderObject.bind(this)
      };
    }

    makeGeometry(symbol) {
      let { char, shape: {type, pos, size, rot, color, points} } = symbol;
      let geometry;
      switch (type) {
        case 'plane':
          geometry = new THREE.PlaneGeometry(1, 1);
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(1, 1, 1);
          break;
        case 'box':
          geometry = new THREE.BoxGeometry(1, 1, 1);
          geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
          break;
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
          break;
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
          break;
        case 'cone':
          geometry = THREE.ConeGeometry(1, 1, 32);
          break;
        case 'road':
          geometry = THREE.CatmullRomCurve3(points);
          break;
      }
      return geometry;

    }

    makeObject(symbol) {
      let { char, shape: {type, pos, size, rot, color} } = symbol;
      let convertedColor = Drawer._getColor(color);
      let material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide, color: convertedColor});
      if (type in this.meshes) {
        console.log(type);
        let obj = this.meshes[type].clone();
        obj.material = material;
        return obj;
      } else if (type === 'road') {
        let geometry = this.makeGeometry(symbol);
        let lineMaterial = new THREE.LineBasicMaterial({color: convertedColor});
        return new THREE.Mesh(geometry, lineMaterial);
      } else {
        let geometry = this.makeGeometry(symbol);
        return new THREE.Mesh(geometry, material);
      }
    }

    renderObject(symbol) {
      let { char, shape: {type, pos, size, rot, color} } = symbol;
      let obj = this.makeObject(symbol);
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
      symbols.forEach(this.renderObject.bind(this));
    }
}
