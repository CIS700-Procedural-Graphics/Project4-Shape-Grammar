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
    
    constructor(scene, grammar) {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
        this.scene = scene;
        this.stateStack = new Array();
        this.scaleFalloff = 1; // For each subsequent iteration, scale the geometry drawn by this number ^(currentInteration)
        this.currentIteration = 0; // During which iteration the symbol that is currently being rendered was added to the linkedlist
        this.previousIteration = 0;
        this.leafGeometry = undefined;
        
        // Grammar rules!
        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                '+' : this.rotateTurtle.bind(this, 30, 0, 0),
                '-' : this.rotateTurtle.bind(this, -30, 0, 0),
                'F' : this.makeBranch.bind(this, 2, 0.1, 1, 1),
                'T' : this.makeTrunk.bind(this),
                'L' : this.makeLeaf.bind(this, 0.5, 0.01),
                'A' : this.makeApple.bind(this, 0.1),
                '[' : this.saveState.bind(this),
                ']' : this.returnToState.bind(this),
                '>' : this.rotateTurtle.bind(this, 0, 30, 0),
                '<' : this.rotateTurtle.bind(this, 0, -30, 0),
                '`' : this.rotateTurtle.bind(this, 0, 0, 30),
                ',' : this.rotateTurtle.bind(this, 0, 0, -30),
                '!' : this.setScaleFalloff.bind(this, 0.7)
            };
        } else {
            this.renderGrammar = grammar;
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
        //Add some randomness to the angles
        var randX = Math.random();
        randX *= 10; //set the range to 0 to 10
        randX -= 5; //set the range to -5 to 5
        x += randX;
        
        var randY = Math.random();
        randY *= 10; //set the range to 0 to 10
        randY -= 5; //set the range to -5 to 5
        y += randY;
        
        var randZ = Math.random();
        randZ *= 10; //set the range to 0 to 10
        randZ -= 5; //set the range to -5 to 5
        z += randZ;
        
        
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
    };

    // Translate the turtle along its _dir_ vector by the distance indicated
    moveForward(dist) {
        var newVec = this.state.dir.multiplyScalar(dist);
        this.state.pos.add(newVec);
    };
    
    // Make a cylinder of given length and width starting at turtle pos
    // Moves turtle pos ahead to end of the new cylinder
    makeBranch(len, width, topScale, bottomScale) {
        //Scale the radii of the cylinder to get skinnier over time
        var currScale = Math.pow(this.scaleFalloff, this.currentIteration);
        var prevScale = Math.pow(this.scaleFalloff, this.previousIteration);
        
        var geometry = new THREE.CylinderGeometry(width * currScale * topScale, width * prevScale * bottomScale, len);
        var material = new THREE.MeshLambertMaterial( {color: 0x2A1506} );
        var cylinder = new THREE.Mesh( geometry, material );
        cylinder.castShadow = true;
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
        this.moveForward(0.5 * len);
    };
    
    makeTrunk() {
        this.makeBranch(2, 1, 0.7, 1);
        this.makeBranch(2, 1, 0.4, 0.6);
        this.makeBranch(2, 1, 0.1, 0.3);
    }
    
    makeLeaf(len, width) {
        // console.log(this.leafGeometry);
        //var geometry = new THREE.CylinderGeometry(width, width, len);
        var material = new THREE.MeshLambertMaterial( {color: 0x228B22} );
        var leaf = new THREE.Mesh( this.leafGeometry /*geometry*/, material );
        leaf.scale.set(1, 1, 1);
        leaf.castShadow = true;
        this.scene.add( leaf );

        //Orient the leaf to the turtle's current direction
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.dir);
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        leaf.applyMatrix(mat4);


        //Move the leaf so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var trans = this.state.pos.add(this.state.dir.multiplyScalar(0.1));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        leaf.applyMatrix(mat5);

        //Scoot the turtle forward by len units
        this.moveForward(0.1);
    };
    
    makeApple(radius) {
        //Make the size of the apple random
        var appleRadius = Math.random(); //between 0 to 1
        appleRadius /= 2;
        appleRadius += 0.5;
        radius *= appleRadius;
        
        var geometry = new THREE.SphereGeometry(radius);
        var material = new THREE.MeshLambertMaterial( {color: 0xFF0800} );
        var sphere = new THREE.Mesh( geometry, material );
        sphere.castShadow = true;
        this.scene.add( sphere );

        //Orient the cylinder to the turtle's current direction
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.dir);
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        sphere.applyMatrix(mat4);


        //Move the cylinder so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var trans = this.state.pos.add(this.state.dir.multiplyScalar(0.5 * radius));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        sphere.applyMatrix(mat5);

        //Scoot the turtle forward by len units
        this.moveForward(0.5 * radius);
    };
    
    // Save the current state of the turtle on the top of the state stack
    saveState() {
        this.stateStack.push(new TurtleState(this.state.pos, this.state.dir));
        //this.stateStack.push(this.state);
        //this.state = new TurtleState(this.state.pos, this.state.dir);
    }
    
    // Return the turtle to the state on top of the state stack
    returnToState() {
        if(this.stateStack.length > 0) {
            this.state = this.stateStack.pop();
        }
    }
    
    
    //Set the scale falloff for the rendered geometry (how the scale changes per iteration)
    setScaleFalloff(scaleVal) {
        this.scaleFalloff = scaleVal;
    }
    
    // Call the function to which the input symbol is bound.
    // Look in the Turtle's constructor for examples of how to bind 
    // functions to grammar symbols.
    renderSymbol(symbolNode) {
        var func = this.renderGrammar[symbolNode.grammarSymbol];
        this.currentIteration = symbolNode.iterationAdded;
        if (func) {
            func();
        }
        this.previousIteration = this.currentIteration;
    };

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(linkedList) {
        var currentNode;
        for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) {
            this.renderSymbol(currentNode);
        }
    }
}