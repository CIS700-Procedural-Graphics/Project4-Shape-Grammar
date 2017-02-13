const THREE = require('three')

// A class used to encapsulate the state of a turtle at a given moment.
// The Turtle class contains one TurtleState member variable.
// You are free to add features to this state class,
// such as color or whimiscality
var TurtleState = function(pos, forward, up, left) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        forward : new THREE.Vector3(forward.x, forward.y, forward.z),
        up : new THREE.Vector3(up.x, up.y, up.z),
        left : new THREE.Vector3(left.x, left.y, left.z)
    }
}
  
export default class Turtle {
    
    constructor(scene, anglefactor, grammar) {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1), new THREE.Vector3(-1,0,0));
        this.scene = scene;
        this.anglefactor = anglefactor;

        // TODO: Start by adding rules for '[' and ']' then more!
        // Make sure to implement the functions for the new rules inside Turtle
        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                '%' : this.rotateTurtle.bind(this, 0, -30, 0),
                'F' : this.makeCylinder.bind(this, 2, 0.1),
                'X' : this.makeCylinder.bind(this, 2, 0.1),
                'A' : this.makeCylinder.bind(this, 2, 0.1),
                'S' : this.makeBrightSphere.bind(this, 2),
                'D' : this.makeDarkSphere.bind(this, 2)
            };
        } 
        else {
            this.renderGrammar = grammar;
        }
    }

    // Resets the turtle's position to the origin
    // and its orientation to the Y axis
    clear() {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1), new THREE.Vector3(-1,0,0));        
    }

    // Rotate the turtle's _dir_ vector by each of the 
    // Euler angles indicated by the input.
    rotateTurtle(forwardA, upA, leftA) {

        var q = new THREE.Quaternion();
        if (forwardA != 0) {
            //forward rotation is not affected by angle factor, rotation about the trunk
            q.setFromAxisAngle(this.state.forward, forwardA * Math.PI/180.0);
            var mat4 = new THREE.Matrix4();
            mat4.makeRotationFromQuaternion(q);
            this.state.up.applyMatrix4(mat4);
            this.state.left.applyMatrix4(mat4);
        }

        if (upA != 0) {
            //up rotation is not affected by angle factor, main trunk curve
            q.setFromAxisAngle(this.state.up, upA * Math.PI/180.0);
            var mat4 = new THREE.Matrix4();
            mat4.makeRotationFromQuaternion(q);
            this.state.forward.applyMatrix4(mat4);
            this.state.left.applyMatrix4(mat4);
        }

        if (leftA != 0) {
            q.setFromAxisAngle(this.state.left, this.anglefactor*leftA * Math.PI/180.0);
            var mat4 = new THREE.Matrix4();
            mat4.makeRotationFromQuaternion(q);
            this.state.forward.applyMatrix4(mat4);
            this.state.up.applyMatrix4(mat4);
        }
    };

    // Translate the turtle along its _dir_ vector by the distance indicated
    moveForward(dist) {
        var newVec = this.state.forward.multiplyScalar(dist);
        this.state.pos.add(newVec);
    };
    
    // Make a cylinder of given length and width starting at turtle pos
    // Moves turtle pos ahead to end of the new cylinder
    makeCylinder(len, width) {
        var geometry = new THREE.CylinderGeometry(0.25, 0.25, len, 6);
        var material = new THREE.MeshLambertMaterial( {color: 0xCD853F, shading: THREE.FlatShading} );
        var cylinder = new THREE.Mesh( geometry, material );
        this.scene.add( cylinder );

        //Orient the cylinder to the turtle's current direction
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.forward);
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        cylinder.applyMatrix(mat4);


        //Move the cylinder so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var trans = this.state.pos.add(this.state.forward.multiplyScalar(0.5 * len));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        cylinder.applyMatrix(mat5);

        //Scoot the turtle forward by len units
        this.moveForward(len/2);
    };

    // Make a cylinder of given length and width starting at turtle pos
    // Moves turtle pos ahead to end of the new cylinder
    makeBrightSphere(radius) {
        var len = 1.0;
        var geometry = new THREE.IcosahedronGeometry(len, 0);
        var material = new THREE.MeshLambertMaterial( {color: 0xADFF2F, shading: THREE.FlatShading} );
        var cylinder = new THREE.Mesh( geometry, material );
        this.scene.add( cylinder );

        //Orient the cylinder to the turtle's current direction
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.forward);
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        cylinder.applyMatrix(mat4);


        //Move the cylinder so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var trans = this.state.pos.add(this.state.forward.multiplyScalar(0.5 * len));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        cylinder.applyMatrix(mat5);

        //Scoot the turtle forward by len units
        this.moveForward(len/2);
    };

    // Make a cylinder of given length and width starting at turtle pos
    // Moves turtle pos ahead to end of the new cylinder
    makeDarkSphere(radius) {
        var len = 1.0;
        var geometry = new THREE.IcosahedronGeometry(len, 0);
        var material = new THREE.MeshLambertMaterial( {color: 0x008000, shading: THREE.FlatShading} );
        var cylinder = new THREE.Mesh( geometry, material );
        this.scene.add( cylinder );

        //Orient the cylinder to the turtle's current direction
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.forward);
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        cylinder.applyMatrix(mat4);


        //Move the cylinder so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var trans = this.state.pos.add(this.state.forward.multiplyScalar(0.5 * len));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        cylinder.applyMatrix(mat5);

        //Scoot the turtle forward by len units
        this.moveForward(len/2);
    };
    
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
            this.renderSymbol(currentNode);
        }
    };
}