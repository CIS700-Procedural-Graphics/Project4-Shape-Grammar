const THREE = require('three')
const _ = require('lodash');

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

    constructor(scene, grammar) {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
        this.scene = scene;
        this.stack = [];
        this.rotZ = 45;
        this.rotY = 45;
        this.cylY = 2;
        this.cylX = 0.1;
        this.cylColor = 0x89c73c;
        this.leafColor = 0xe1e241;
        this.flowerColor = 0xff5b27;

        this.updateGrammar();
    }

    updateGrammar() {
        this.renderGrammar = {
            '+': this.rotateTurtle.bind(this, 0, 0, this.rotZ),
            '-': this.rotateTurtle.bind(this, 0, 0, -1 * this.rotZ),
            '<': this.rotateTurtle.bind(this, this.rotY, this.rotY, 0),
            '>': this.rotateTurtle.bind(this, -1 * this.rotY, -1 * this.rotY, 0),
            'F': this.makeCylinder.bind(this, this.cylY, this.cylX),
            '[': this.saveState.bind(this),
            ']': this.returnToState.bind(this),
            'L': this.makeLeaf.bind(this),
            'O': this.makeFlower.bind(this)
        };
    }

    clearScene() {
        var obj;
        for (var i = this.scene.children.length - 1; i > 0; i--) {
            obj = this.scene.children[i];
            this.scene.remove(obj);
        }
    }

    // Resets the turtle's position to the origin
    // and its orientation to the Y axis
    clear() {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
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
                x * 3.14/180,
				y * 3.14/180,
				z * 3.14/180);
        this.state.dir.applyEuler(e);
    }

    // Translate the turtle along the input vector.
    // Does NOT change the turtle's _dir_ vector
    moveTurtle(x, y, z) {
	    var new_vec = THREE.Vector3(x, y, z);
	    this.state.pos.add(new_vec);
    }

    // Translate the turtle along its _dir_ vector by the distance indicated
    moveForward(dist) {
        var newVec = this.state.dir.multiplyScalar(dist);
        this.state.pos.add(newVec);
    }

    // Make a cylinder of given length and width starting at turtle pos
    // Moves turtle pos ahead to end of the new cylinder
    makeCylinder(len, width) {
        var geometry = new THREE.CylinderGeometry(width, width, len);
        var material = new THREE.MeshBasicMaterial({ color: this.cylColor });
        var cylinder = new THREE.Mesh( geometry, material );
        this.scene.add(cylinder);

        // Orient the cylinder to the turtle's current direction
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.dir);
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        cylinder.applyMatrix(mat4);


        // Move the cylinder so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var trans = this.state.pos.add(this.state.dir.multiplyScalar(0.5 * len));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        cylinder.applyMatrix(mat5);

        // Scoot the turtle forward by len units
        this.moveForward(len / 2);
    }

    makeLeaf() {
        var shape = new THREE.Shape();
        var points = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0.5, 0),
            new THREE.Vector2(0.5, 0.5)
        ];

        shape.fromPoints(points);

        var extrudeSettings = {
            steps: 1,
            amount: 0.1,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0,
            bevelSegments: 1
        };

        var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        var material = new THREE.MeshBasicMaterial({ color: this.leafColor });

        var leaf = new THREE.Mesh(geometry, material);
        this.scene.add(leaf);

        var mat5 = new THREE.Matrix4();
        var trans = this.state.pos;
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        leaf.applyMatrix(mat5);
    }

    makeFlower() {
        var centers = [
            new THREE.Vector2(0.1, 0),
            new THREE.Vector2(-0.2, -0.2),
            new THREE.Vector2(-0.2, 0.2)
        ];

        for (var i = 0; i < centers.length; i++) {
            var center = centers[i];
            var geometry = new THREE.CylinderGeometry(0.2, 0.2, this.cylX + 0.2, 32);
            var material = new THREE.MeshBasicMaterial({ color: this.flowerColor });
            var petal = new THREE.Mesh( geometry, material );
            this.scene.add(petal);

            var quat = new THREE.Quaternion();
            var forward = new THREE.Vector3(0, 0, 1);
            quat.setFromUnitVectors(new THREE.Vector3(0,1,0), forward);
            var mat4 = new THREE.Matrix4();
            mat4.makeRotationFromQuaternion(quat);
            petal.applyMatrix(mat4);

            var mat5 = new THREE.Matrix4();
            var trans = this.state.pos;
            mat5.makeTranslation(trans.x + center.x + this.cylX, trans.y + center.y, trans.z);
            petal.applyMatrix(mat5);
        }
    }

    saveState() {
        this.stack.push(new TurtleState(this.state.pos, this.state.dir));
    }

    returnToState() {
        this.state = this.stack.pop();
    }

    // Call the function to which the input symbol is bound.
    // Look in the Turtle's constructor for examples of how to bind
    // functions to grammar symbols.
    renderSymbol(symbolNode) {
        var func = this.renderGrammar[symbolNode.data];
        if (func) {
            func();
        }
    }

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(linkedList) {
        var currentNode;
        for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) {
            this.renderSymbol(currentNode);
        }
    }
}