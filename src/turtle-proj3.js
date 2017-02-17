const THREE = require('three')

// A class used to encapsulate the state of a turtle at a given moment.
// The Turtle class contains one TurtleState member variable.
// You are free to add features to this state class,
// such as color or whimiscality
var TurtleState = function(pos, dir, color/* val [0,1]*/, rotArr ) {
	var rotCopy = [];
	rotCopy[0] = rotArr[0];
	rotCopy[1] = rotArr[1];
	rotCopy[2] = rotArr[2];
	
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        dir: new THREE.Vector3(dir.x, dir.y, dir.z),
        color: color,
        rot: rotCopy
    }
}
  
export default class Turtle {
    
    constructor(scene, startingRotations, grammar) {
        //this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), 0, [30,0,0]);
        this.scene = scene;
		this.rotStep = 4;
		
        // TODO: Start by adding rules for '[' and ']' then more!
        // Make sure to implement the functions for the new rules inside Turtle
        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                '+' : this.rotateTurtle.bind(this, 1),
                '-' : this.rotateTurtle.bind(this, -1),
                'X' : this.rotateChange.bind(this, [this.rotStep,0,0]),
                'x' : this.rotateChange.bind(this, [-this.rotStep,0,0]),
                'Y' : this.rotateChange.bind(this, [0,this.rotStep,0]),
                'y' : this.rotateChange.bind(this, [0,-this.rotStep,0]),
                'Z' : this.rotateChange.bind(this, [0,0,this.rotStep]),
                'z' : this.rotateChange.bind(this, [0,0,-this.rotStep]),
                'F' : this.makeCylinder.bind(this, 2, 0.1),
                '[' : this.pushState.bind(this),
                ']' : this.popState.bind(this),
                'C' : this.changeColor.bind(this, 0.8),
                'c' : this.changeColor.bind(this, -0.8),
            };
        } else {
            this.renderGrammar = grammar;
        }
        
        this.stateStack = [];
		this.startingRotations = startingRotations;
		//console.log('turtle ctor about to call clear');
        this.clear(); //sets new state
    }


    // Resets the turtle's position to the origin
    // and its orientation to the Y axis
    clear() {
    	//console.log('clear: startingRots: ', this.startingRotations );
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), 0, this.startingRotations );        
        this.stateStack = [];
    }

    // A function to help you debug your turtle functions
    // by printing out the turtle's current state.
    printState() {
        console.log(this.state.pos)
        console.log(this.state.dir)
    }

	// Copy a state to stack
	pushState() {
		//Note that TurtleState makes new Vector3 obj's from the input, as best I can tell
		this.stateStack.push( new TurtleState( this.state.pos, this.state.dir, this.state.color, this.state.rot ) ); 
			
	}
	// Pop the state stack, return ref
	popState() {
		this.state = this.stateStack.pop();
	}
	
	//Change the state color value (single float) by amount
	changeColor( amount ) {
		this.state.color += amount;
		this.state.color %= 1;
		//console.log('changeColor: new: ', this.state.color);
	}
	
    // Rotate the turtle's _dir_ vector by each of the 
    // Euler angles indicated by the input.
    rotateTurtle(sign) {
    	//console.log('rotateTurtle: state.rot ', this.state.rot, '  sign ', sign, ' x ', x);
        var e = new THREE.Euler(
                this.state.rot[0] * sign * 3.14/180,
				this.state.rot[1] * sign * 3.14/180,
				this.state.rot[2] * sign * 3.14/180);
        this.state.dir.applyEuler(e);
    }

	rotateChange( change ) {
		for( var i = 0; i < change.length; i++ )
			this.state.rot[i] += change[i];
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
    
    // Get a color based on [0,1] range.
    // Return a THREE.Color obj
    getColor( colorValIn ) {
    	//Simply color ramp.
    	//Domain [0,0.5] goes from min to max, and [0.5,1]] goes max to min
    	// to allow it to cycle if you just keep incrementing colorVal
    	var colorVal = Math.abs(colorValIn) % 1; 
    	if( colorVal <= 0.5 )
    		colorVal *=2;
    	else
    		colorVal = 1 - colorVal;
    		
    	//simple color ramp
    	var r = Math.pow( colorVal, 1 );
    	var g = Math.pow( colorVal, 3 );
    	var b = 1 - Math.pow( colorVal, 1);
    	
    	return new THREE.Color( r, g, b );
    }
    
    // Make a cylinder of given length and width starting at turtle pos
    // Moves turtle pos ahead to end of the new cylinder
    makeCylinder(len, width) {
        var geometry = new THREE.CylinderGeometry(width, width, len);
        
        var material = new THREE.MeshBasicMaterial( {color: 0x11cc11} );
        material.color = this.getColor( this.state.color);
        
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
        var trans = this.state.pos.add(this.state.dir.multiplyScalar(0.5 * len));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        cylinder.applyMatrix(mat5);

        //Scoot the turtle forward by len units
        this.moveForward(len/2);
    };
    
    // Call the function to which the input symbol is bound.
    // Look in the Turtle's constructor for examples of how to bind 
    // functions to grammar symbols.
    renderSymbol(symbolNode) {
        var func = this.renderGrammar[symbolNode.character];
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