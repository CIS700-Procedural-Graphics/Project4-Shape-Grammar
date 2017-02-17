const THREE = require('three')

var DIR = {
    N: 0,
    NE: 1,
    E: 2,
    SE: 3,
    S: 4,
    SW: 5,
    W: 6,
    NW: 7
}


var ZONES = {
  UNZONED    : {value: 1, name: "Unzoned",     color: 0xd1cfca},
  ROAD       : {value: 2, name: "Road",        color: 0x2c2a2d},
  RESIDENTIAL: {value: 3, name: "Residential", color: 0x1fbc14},
  COMMERCIAL : {value: 4, name: "Commerical",  color: 0x7c14bc},
  INDUSTRIAL : {value: 5, name: "Industrial",  color: 0xddac30}
};

// A class used to encapsulate the state of a turtle at a given moment.
// The Turtle class contains one TurtleState member variable.
// You are free to add features to this state class,
// such as color or whimiscality
var TurtleState = function(pos, dir) {
    return {
        pos: new THREE.Vector2(pos.x, pos.y),
        dir: dir
    }
}

export default class Turtle {

    constructor(grid, grammar) {
        this.grid = grid;
        console.log(this.grid);
        // var startX = Math.floor(Math.random() * grid.length);
        // var startY = Math.floor(Math.random() * grid[0].length);
        var startX = 30 % this.grid.length;
        var startY = 30 % this.grid[0].length;
        this.state = new TurtleState(new THREE.Vector2(startX, startY), DIR.N);
        this.stateStack = [];

        // TODO: Start by adding rules for '[' and ']' then more!
        // Make sure to implement the functions for the new rules inside Turtle
        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                '+' : this.rotateTurtle.bind(this, 45),
                '-' : this.rotateTurtle.bind(this, -45),
                '*' : this.rotateTurtle.bind(this, 90),
                '/' : this.rotateTurtle.bind(this, -90),
                'M' : this.moveTurtle.bind(this, 5),
                '[' : this.saveState.bind(this),
                ']' : this.restoreState.bind(this),
            };
        } else {
            this.renderGrammar = grammar;
        }
    }

    saveState() {
        console.log("state stored!");
        console.log(this.state);
        this.stateStack.push(new TurtleState(this.state.pos, this.state.dir, this.state.ortho));
    }

    restoreState() {
        console.log("state restored!");
        this.state = this.stateStack.pop();
        console.log(this.state);
    }

    // Resets the turtle's position to the origin
    // and its orientation to the Y axis
    clear() {
        this.state = new TurtleState(new THREE.Vector2(0,0), DIR.N);
    }

    // A function to help you debug your turtle functions
    // by printing out the turtle's current state.
    printState() {
        console.log(this.state.pos)
        console.log(this.state.dir)
    }

    // Rotate the turtle's _dir_ vector by each of the
    // Euler angles indicated by the input.
    rotateTurtle(degrees) {
        if (degrees = 45) {
            this.state.dir = (this.state.dir + 1) % 8;
        } else if (degrees == -45) {
            this.state.dir = (this.state.dir + 7) % 8;
        } else if (degrees == 90) {
            this.state.dir = (this.state.dir + 2) % 8;
        } else if (degrees == -90) {
            this.state.dir = (this.state.dir + 6) % 8;
        } else {
            console.log("unsupported rotation amount");
        }
    }

    inBounds(pos) {
        return pos.x < this.grid.length &&
               pos.x >= 0 &&
               pos.y < this.grid[0].length &&
               pos.y >= 0;
    }

    moveTurtleDir(dir) {
        var direction = new THREE.Vector2(0,0);
        switch (dir) {
            case DIR.N:
                direction = new THREE.Vector2(0,1);
                break;
            case DIR.S:
                direction = new THREE.Vector2(0,-1);
                break;
            case DIR.E:
                direction = new THREE.Vector2(1,0);
                break;
            case DIR.W:
                direction = new THREE.Vector2(-1,0);
                break;
        }

        this.grid[this.state.pos.x][this.state.pos.y] = {
            zone: ZONES.ROAD.value
        };
        var newpos = new THREE.Vector2(this.state.pos.x + direction.x, this.state.pos.y + direction.y)
        if (this.inBounds(newpos)) {
            this.state.pos = newpos;
        } else {
            var startX = Math.floor(Math.random() * this.grid.length);
            var startY = Math.floor(Math.random() * this.grid[0].length);
            this.state = new TurtleState(new THREE.Vector2(startX, startY), this.state.dir);
        }
    }

    moveTurtle(len) {
        for (var i = 0; i < len; i++) {
            switch (this.state.dir) {
                case DIR.N:
                    this.moveTurtleDir(DIR.N);
                    break;
                case DIR.S:
                    this.moveTurtleDir(DIR.S);
                    break;
                case DIR.E:
                    this.moveTurtleDir(DIR.E);
                    break;
                case DIR.W:
                    this.moveTurtleDir(DIR.W);
                    break;
                case DIR.NE:
                    this.moveTurtleDir(DIR.N);
                    this.moveTurtleDir(DIR.E);
                    break;
                case DIR.SE:
                    this.moveTurtleDir(DIR.S);
                    this.moveTurtleDir(DIR.E);
                    break;
                case DIR.NW:
                    this.moveTurtleDir(DIR.N);
                    this.moveTurtleDir(DIR.W);
                    break;
                case DIR.SW:
                    this.moveTurtleDir(DIR.S);
                    this.moveTurtleDir(DIR.W);
                    break;
            }
        }
    }

    // Call the function to which the input symbol is bound.
    // Look in the Turtle's constructor for examples of how to bind
    // functions to grammar symbols.
    renderSymbol(symbolNode) {
        var func = this.renderGrammar[symbolNode.character];
        if (func) {
            console.log(symbolNode.character);
            func();
        }
    };

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(linkedList) {
        var currentNode;
        for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) {
            this.renderSymbol(currentNode);
        }
        console.log(this.grid);
    }
}
