const THREE = require('three')

// A class used to encapsulate the state of a turtle at a given moment.
// The Turtle class contains one TurtleState member variable.
// You are free to add features to this state class,
// such as color or whimiscality
var TurtleState = function(pos, dir) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        dir: new THREE.Vector3(dir.x, dir.y, dir.z)
    }
}
  
export default class Turtle {
    
    constructor(scene, pos, angle, width, grammar) {
        this.state = new TurtleState(pos, new THREE.Vector3(0,1,0));
        this.scene = scene;
        this.stack = [];

        if (angle)
        {
            this.angle = angle;
        }
        else
        {
            this.angle = 60;
        }

        if (width)
        {
            this.width = width;
        }
        else
        {
            this.width = 1.0;
        }

        this.treeMaterial = new THREE.MeshLambertMaterial( {color: 0x663300} );
        this.leafMaterial = new THREE.MeshLambertMaterial( {color: 0x004c00} );


        // TODO: Start by adding rules for '[' and ']' then more!
        // Make sure to implement the functions for the new rules inside Turtle
        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                '+' : this.rotateTurtle.bind(this, 1, 0, 0),
                '-' : this.rotateTurtle.bind(this, -1, 0, 0),
                'F' : this.makeCylinder.bind(this, 2, 0.1),
                '[' : this.saveState.bind(this),
                ']' : this.applyState.bind(this),
                'L' : this.makeLeaf.bind(this)
            };
        } else {
            this.renderGrammar = grammar;
        }
    }

    // Resets the turtle's position to the origin
    // and its orientation to the Y axis
    clear() {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));        
        this.stack = [];
    }

    saveState() {
        var newState = new TurtleState(this.state.pos, this.state.dir);
        this.stack.push(newState);
    }

    applyState() {
        this.state = this.stack.pop();
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
        var e = new THREE.Euler(
                Math.random() * this.angle * x * 3.14/180,
                Math.random() * this.angle * y * 3.14/180,
                Math.random() * this.angle * z * 3.14/180);
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
    };
    
    // Make a cylinder of given length and width starting at turtle pos
    // Moves turtle pos ahead to end of the new cylinder
    makeCylinder(len) {
        var width = this.width / (((this.iter + 1) * 0.3) + 0.2);
        var geometry = new THREE.CylinderGeometry(width * 0.7, width, len);
        if (this.iter == 0 && this.nextIter == 0)
        {
            geometry = new THREE.CylinderGeometry(width, width, len);
        }
        var cylinder = new THREE.Mesh( geometry, this.treeMaterial );
        this.scene.add( cylinder );

        //Orient the cylinder to the turtle's current direction
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.dir);
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        cylinder.applyMatrix(mat4);


        //Move the cylinder so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var trans = this.state.pos.add(this.state.dir.multiplyScalar(0.5 * len));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        cylinder.applyMatrix(mat5);

        //Scoot the turtle forward by len units
        this.moveForward(len/2);
    };

    makeLeaf() {
        var leafGeometry = new THREE.SphereGeometry( 1, 16, 16 );
        this.leafMaterial.color = new THREE.Color(0, Math.random() * 0.3 + 0.5, 0);
        var leaf = new THREE.Mesh(leafGeometry, this.leafMaterial);
        this.scene.add(leaf);

        //Orient the leaf to the turtle's current direction
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.dir);
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        leaf.applyMatrix(mat4);


        //Move the leaf so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var trans = this.state.pos.add(this.state.dir.multiplyScalar(0.5));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        leaf.applyMatrix(mat5);
        leaf.scale.set(0.4, 0.4, 0.4);
    }
    
    // Call the function to which the input symbol is bound.
    // Look in the Turtle's constructor for examples of how to bind 
    // functions to grammar symbols.
    renderSymbol(symbolNode) {
        var func = this.renderGrammar[symbolNode.symbol];
        if (func) {
            func();
        }
    };

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(linkedList) {
        var currentNode;
        for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) {
            this.iter = currentNode.iter;
            if (currentNode.next != null)
            {
                this.nextIter = currentNode.next.iter;
            }
            this.renderSymbol(currentNode);
        }
    }
}