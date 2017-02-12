const THREE = require('three')

// A class used to encapsulate the state of a turtle at a given moment.
// The Turtle class contains one TurtleState member variable.
// You are free to add features to this state class,
// such as color or whimiscality
let TurtleState = function(pos, dir) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        dir: new THREE.Vector3(dir.x, dir.y, dir.z)
    }
}

export default class Turtle {

    constructor(scene) {
      this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
      this.scene = scene;
      this.renderGrammar = {
        '+' : this.rotateTurtle.bind(this, 30, 0, 0),
        '-' : this.rotateTurtle.bind(this, -30, 0, 0),
        'F' : this.makeCylinder.bind(this, 2, 0.1)
      };
    }

    reset() {
      this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
    }


    rotateTurtle(x, y, z) {
      let e = new THREE.Euler(x * 3.14/180, y * 3.14/180, z * 3.14/180);
      this.state.dir.applyEuler(e);
    }


    moveTurtle(x, y, z) {
	    let new_vec = THREE.Vector3(x, y, z);
	    this.state.pos.add(new_vec);
    };

    moveForward(dist) {
      let newVec = this.state.dir.multiplyScalar(dist);
      this.state.pos.add(newVec);
      this.state.dir.normalize();
    };


    makeCylinder(len, width) {
      let geometry = new THREE.CylinderGeometry(width, width, len);
      let material = new THREE.MeshBasicMaterial( {color: 0x00cccc} );
      let cylinder = new THREE.Mesh( geometry, material );
      this.scene.add( cylinder );

      //Orient the cylinder to the turtle's current direction
      let quat = new THREE.Quaternion();
      quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.dir);
      let mat4 = new THREE.Matrix4();
      mat4.makeRotationFromQuaternion(quat);
      cylinder.applyMatrix(mat4);


      //Move the cylinder so its base rests at the turtle's current position
      let mat5 = new THREE.Matrix4();
      let trans = this.state.pos.add(this.state.dir.multiplyScalar(0.5 * len));
      mat5.makeTranslation(trans.x, trans.y, trans.z);
      cylinder.applyMatrix(mat5);

      //Scoot the turtle forward by len units
      this.moveForward(len/2);
    };

    // Call the function to which the input symbol is bound.
    // Look in the Turtle's constructor for examples of how to bind
    // functions to grammar symbols.
    renderSymbol(symbol) {
      // let func = this.renderGrammar[symbol.character];
      // if (func) {
      //     func();
      // }
    };

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(linkedList) {
      let currentNode;
      for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) {
        this.renderSymbol(currentNode);
      }
    }
}
