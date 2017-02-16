const THREE = require('three')

// A class used to encapsulate the state of a turtle at a given moment.
// The Turtle class contains one TurtleState member variable.
// You are free to add features to this state class,
// such as color or whimiscality
var TurtleState = function(pos, dir, num_splits) {
  return {
    pos: new THREE.Vector3(pos.x, pos.y, pos.z),
    dir: new THREE.Vector3(dir.x, dir.y, dir.z),
    splits: num_splits
  }
}

function print_list(linkedList) {
  var curr = linkedList.head;
  var res = '';
  while (curr !== undefined) {
    res += curr.sym;
    curr = curr.next;
  }
  console.log(res);
}

export default class Turtle {
  constructor(scene, grammar, init_pos, width, len, leaf) {
    // this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
    this.state = new TurtleState(init_pos.clone(), new THREE.Vector3(0,1,0), 1);
    this.scene = scene;
    this.state_stack = [];
    // probabilistically chooes a bark color
    this.branch_color = this.random_color();
    this.leaf_color = this.random_color();
    this.b_len = len;
    this.b_width = width;
    this.leaf = leaf;


    // TODO: Start by adding rules for '[' and ']' then more!
    // Make sure to implement the functions for the new rules inside Turtle
    if (typeof grammar === "undefined") {
        this.renderGrammar = {
          '+' : this.rotateTurtle.bind(this, 30, 0, 0),
          '-' : this.rotateTurtle.bind(this, -30, 0, 0),
          '<' : this.rotateTurtle.bind(this, 0, 30, 0),
          '>' : this.rotateTurtle.bind(this, 0, -30, 0),
          '(' : this.rotateTurtle.bind(this, 0, 0, 30),
          ')' : this.rotateTurtle.bind(this, 0, 0, -30),
          '[' : this.store_state.bind(this),
          ']' : this.set_state.bind(this),
          'B' : this.makeCylinder.bind(this),
          'L' : this.addFlower.bind(this),
        };
    } else {
        this.renderGrammar = grammar;
    }
  }

  addFlower() {
    for (var i = -0.3; i < 0.3; i+= 0.3) {
      for (var j = -0.7; j < 0.1; j+= 0.1) {
        for (var k = -0.3; k < 0.3; k+= 0.3) {
          var leaf = this.leaf.clone();
          var quat = new THREE.Quaternion();
          quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.dir);
          var mat4 = new THREE.Matrix4();
          mat4.makeRotationFromQuaternion(quat);
          leaf.applyMatrix(mat4);
          leaf.scale.set(1/600.0, 1/600.0, 1/600.0);
          leaf.position.set(this.state.pos.x + i, this.state.pos.y + j, this.state.pos.z+k);
          this.scene.add(leaf);
        }
      }
    }
  }

  random_color() {
    var idx = Math.round((Math.random() * 2));
    var colors = [0x533118, 0x624E2C, 0x8D6815];
    return colors[idx];
  }

  store_state() {
    this.state_stack.push(new TurtleState(this.state.pos.clone(), this.state.dir.clone(), this.state.splits));
  }

  set_state() {
    var stored_state = this.state_stack.pop();
    this.state = stored_state;
  }

  // Resets the turtle's position to the origin
  // and its orientation to the Y axis
  clear() {
    this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), 1);
  }

  // A function to help you debug your turtle functions
  // by printing out the turtle's current state.
  printState() {
    console.log(this.state.pos)
    console.log(this.state.dir)
  }

  // Rotate the turtle's _dir_ vector by each of the 
  // Euler angles indicated by the input.
  rotateTurtle(x, y, z) {
    var e = new THREE.Euler(x * 3.14/180, y * 3.14/180, z * 3.14/180);
    this.state.splits += 1;
    this.state.dir.applyEuler(e);
  }

  // Translate the turtle along the input vector.
  // Does NOT change the turtle's _dir_ vector
  moveTurtle(x, y, z) {
    var new_vec = THREE.Vector3(x, y, z);
    this.state.pos.add(new_vec);
  };

  // Translate the turtle along its _dir_ vector by the distance indicated
  moveForward(dist) {
    var newVec = this.state.dir.multiplyScalar(dist);
    this.state.pos.add(newVec);
    this.state.dir.normalize();
  };
  
  // Make a cylinder of given length and width starting at turtle pos
  // Moves turtle pos ahead to end of the new cylinder
  makeCylinder() {
    var len = this.b_len * (Math.random() + 1);
    var width = this.b_width / (0.8 * this.state.splits);
    if (this.state.splits === 1) {
      width = this.b_width;
    }
    var geometry = new THREE.CylinderGeometry(width, width, len);
    var material = new THREE.MeshBasicMaterial( {color: this.branch_color} );
    var cylinder = new THREE.Mesh( geometry, material );
    this.scene.add( cylinder );

    //Orient the cylinder to the turtle's current direction
    var quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.dir);
    var mat4 = new THREE.Matrix4();
    mat4.makeRotationFromQuaternion(quat);
    cylinder.applyMatrix(mat4);

    //Move the cylinder so its base rests at the turtle's current position
    var mat5 = new THREE.Matrix4();
    var trans = this.state.pos.add(
      this.state.dir.multiplyScalar(0.45 * len)
    );
    mat5.makeTranslation(trans.x, trans.y, trans.z);
    cylinder.applyMatrix(mat5);
    this.state.dir.normalize();
    //Scoot the turtle forward by len units
    this.moveForward(len / 2);
    // this.moveForward(len/2);
  };

  // Call the function to which the input symbol is bound.
  // Look in the Turtle's constructor for examples of how to bind 
  // functions to grammar symbols.
  renderSymbol(symbolNode) {
    var func = this.renderGrammar[symbolNode.sym];
    if (func) {
        func();
    }
  };

  // Invoke renderSymbol for every node in a linked list of grammar symbols.
  renderSymbols(linkedList) {
    var currentNode;
    for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) {
        this.renderSymbol(currentNode);
    }
  }
}
